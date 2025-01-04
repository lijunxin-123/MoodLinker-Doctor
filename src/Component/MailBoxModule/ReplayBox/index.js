import { Menu, Input, Button, List, message, ConfigProvider } from 'antd';
import { useEffect, useState } from 'react';
import './ReplayBox.css'
import MailBoxModule from '..';
function ReplayBox({user,ifReply}){
    console.log(user)
    const [sentEmails, setSentEmails] = useState([]); // 存储发送的邮件
    const [newEmail, setNewEmail] = useState({date:'', content: '' }); // 写信内容
    const doctorId = localStorage.getItem('doctor_id'); // 从本地存储获取医生 ID
    const [replyContent,setReplyContent]=useState('');

    useEffect(()=>{
        if(ifReply){
            const fetchReply = async () => {
                try {
                    const messageId = parseInt('1' + user.id);  // 确保拼接后的 ID 为数字类型
                    const response = await fetch(`http://127.0.0.1:5000/api/doctor_send_messages/${messageId}`);
            
                    if (!response.ok) {
                        throw new Error(`Error: ${response.status} - ${response.statusText}`);
                    }
            
                    const data = await response.json();
                    console.log(data);
                    setReplyContent(data.content);
                } catch (err) {
                    console.error('Failed to fetch reply:', err);
                } finally {
                    // 这里可以处理加载状态等
                }
            };
            
        fetchReply();}
    },[ifReply])

    const handleSendEmail = async () => {
        if (!newEmail.content) {
          message.warning('Please fill in both subject and content before sending.');
          return;
        }
      
        try {
            // 使用 fetch 发送 POST 请求到后端接口
            const response = await fetch('http://127.0.0.1:5000/api/doctor/send_message', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message_id:parseInt('1'+user.id),
                content: newEmail.content,
                doctor_id:doctorId,
                patient_id: user.identity,  // 假设你有当前病人的 ID
              }),
            });
        
            // 如果响应状态为 200，表示发送成功
            if (response.ok) {
              const result = await response.json();
              setSentEmails([...sentEmails, newEmail]);
              setNewEmail({date:'', content: '' });
              message.success(result.message || 'Email sent successfully!');
              setIsBack(true)
            } else {
              const errorResult = await response.json();
              message.error(errorResult.error || 'Failed to send email.');
            }
          } catch (error) {
            console.error('Error sending email:', error);
            message.error('An error occurred while sending the email.');
          }
      };
    const [isBack,setIsBack]=useState(false)
    const handleBackButton=()=>{
        setIsBack(true)
    }
    return (
        <div style={{width:'100%',height:'100%'}}>
            {isBack&&<MailBoxModule/>}
            {!isBack&&<>
            {ifReply&&
            <ConfigProvider
            theme={{
                components: {
                Button: {
                    defaultShadow: '5px 8px 10px rgba(0, 0, 0, 0.2)',
                    fontWeight: 600,
                    defaultBg: '#99AC71',
                    defaultHoverBg: '#99AC71',
                    defaultHoverColor: 'white',
                    defaultHoverBorderColor: 'white',
                    defaultActiveBorderColor: 'black',
                    defaultActiveColor: 'black',
                },
                },
            }}
            >
            <Button onClick={handleBackButton}>返回</Button>
            </ConfigProvider>
            }
            <div className='inBox1'>
                <div>
                    <div style={{
                        backgroundColor:'#99AC71',borderRadius:'100%',height:'40px',width:"40px",
                        display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',fontWeight:'bold',}}>
                        {user.identity}
                    </div>
                    {user.time}
                </div>
                <p style={{backgroundColor:'white',width:'60%',height:'60%',fontSize:'18px',fontWeight:'bold',display:'flex',alignItems:'center',justifyContent:'center'}}>
                {user.message}
                </p>
                
            </div>
            {!ifReply&&<div className='sendBox'>
            <Input.TextArea
              rows={10}
              placeholder="Content"
              value={newEmail.content}
              onChange={(e) => {
                const today = new Date();
                const date = today.toISOString().split('T')[0]; 
                
                setNewEmail({
                  date: today, // 设置为当天日期
                  content: e.target.value
                });
              }}
              style={{ marginBottom: '8px' }}
            />
            <ConfigProvider
                theme={{
                    components: {
                    Button: {
                        defaultShadow: '5px 8px 10px rgba(0, 0, 0, 0.2)',
                        fontWeight: 600,
                        defaultBg: '#D9D9D9',
                        defaultHoverBg: '#99AC71',
                        defaultHoverColor: 'white',
                        defaultHoverBorderColor: 'white',
                        defaultActiveBorderColor: 'black',
                        defaultActiveColor: 'black',
                    },
                    },
                }}
                >
            <Button  onClick={handleSendEmail} style={{position:'absolute',right:'1%',bottom:'2%'}}>
              Send
            </Button>
            </ConfigProvider>
            </div>}
            {ifReply&&
            
             <div className='inBox2' style={{position:"absolute",right:"2%",marginTop:"5%"}}>
             
             <p style={{width:'60%',height:'60%',fontSize:'18px',fontWeight:'bold',display:'flex',alignItems:'center',justifyContent:'center'}}>
             {replyContent}
             </p>
             
            </div>
            }
            </>}
        </div>
    )
}
export default ReplayBox