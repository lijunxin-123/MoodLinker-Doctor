import './NewEmail.css'
import React, { useState, useEffect } from 'react';
import { Button, Col, Form, Row, Select, Space, Table, theme, message,ConfigProvider,Input } from 'antd';
import { changeAnalysisNumber } from '../../../store/stageSlice';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
const { Option } = Select;
const AdvancedSearchForm = ({ onSearch, patients,selectedPerson }) => {
    const { token } = theme.useToken();
    const [form] = Form.useForm();
    const [selectedPatient, setSelectedPatient] = useState(selectedPerson);
    const [sentEmails, setSentEmails] = useState([]); // 存储发送的邮件
    const [newEmail, setNewEmail] = useState({date:'', content: '' }); // 写信内容
    const doctorId = localStorage.getItem('doctor_id'); // 从本地存储获取医生 ID
    const dispatch=useDispatch()
    const formStyle = {
      maxWidth: 'none',
      background: token.colorFillAlter,
      borderRadius: token.borderRadiusLG,
      padding: 24,
    };
    const navigate=useNavigate()
    // 当patientName变化时更新id字段
    useEffect(() => {
      if (selectedPatient) {
        form.setFieldsValue({ patientId: selectedPatient.id });
      }
    }, [selectedPatient, form]);
  
    // 当patientId变化时更新name字段
    useEffect(() => {
      const selected = patients.find((patient) => patient.id === form.getFieldValue('patientId'));
      if (selected) {
        form.setFieldsValue({ patientName: selected.name });
      }
    }, [form, patients]);
  
    const onFinish = (values) => {
      console.log('Search conditions:', values);
      onSearch(values); // 将搜索条件传递给父组件
    };
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
                message_id:parseInt('10'),
                content: newEmail.content,
                doctor_id:doctorId,
                patient_id: selectedPatient.id,  // 假设你有当前病人的 ID
              }),
            });
        
            // 如果响应状态为 200，表示发送成功
            if (response.ok) {
              dispatch(changeAnalysisNumber('1'))
              const result = await response.json();
              setSentEmails([...sentEmails, newEmail]);
              setNewEmail({date:'', content: '' });
              message.success(result.message || 'Email sent successfully!');
              
            } else {
              const errorResult = await response.json();
              message.error(errorResult.error || 'Failed to send email.');
            }
          } catch (error) {
            console.error('Error sending email:', error);
            message.error('An error occurred while sending the email.');
          }
    };
  
    return (
        <div style={{height:'98%',position:'relative'}}>
            
            <Form form={form} name="advanced_search" style={formStyle} onFinish={onFinish} >
            <h3 style={{marginBottom:"1%"}}>选择收信人：</h3>
                <Row gutter={24}>
                {/* 查询患者姓名 */}
                <Col span={8}>
                    <Form.Item name="patientName" label="个案名称">
                    <Select
                        showSearch
                        placeholder="请选择名称"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                        option?.children?.toLowerCase().includes(input.toLowerCase())
                        }
                        onChange={(value) => setSelectedPatient(patients.find((patient) => patient.name === value))}
                    >
                        {patients.map((patient) => (
                        <Option key={patient.id} value={patient.name}>
                            {patient.name}
                        </Option>
                        ))}
                    </Select>
                    </Form.Item>
                </Col>
        
                {/* 查询患者ID */}
                <Col span={8}>
                    <Form.Item name="patientId" label="个案ID">
                    <Select
                        showSearch
                        placeholder="请选择ID"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                        option?.children?.toLowerCase().includes(input.toLowerCase())
                        }
                        onChange={(value) => {
                            form.setFieldsValue({ patientName: patients.find((patient) => patient.id === value)?.name })
                            setSelectedPatient(patients.find((patient) => patient.id === value))
                        }}
                    >
                        {patients.map((patient) => (
                        <Option key={patient.id} value={patient.id}>
                            {patient.id}
                        </Option>
                        ))}
                    </Select>
                    </Form.Item>
                </Col>
                </Row>
            <h3>填写内容：</h3>
                <div className='sendBox'>
                    <Input.TextArea
                    rows={10}
                    placeholder="信息内容"
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
                    </div>
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
                    <Button  onClick={handleSendEmail} style={{position:'absolute',right:'2%',bottom:'2%'}}>
                    发送
                    </Button>
                    </ConfigProvider>
            </Form>
        </div>
    );
  };

function NewEmail({selectedPerson}){
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null); // 管理选中的患者
    const [loading, setLoading] = useState(true); // 加载状态
    const [error, setError] = useState(null); // 错误信息
    const doctorId = localStorage.getItem('doctor_id'); // 从本地存储获取医生 ID
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        const fetchPatients = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/doctor/${doctorId}/patients`);
            if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            const patientData = data.patients.map((patient) => {
            const birthdate = new Date(patient.birthdate);
            const age = new Date().getFullYear() - birthdate.getFullYear();

            return {
                id: patient.id || "Unknown",
                name: patient.username || "N/A",
                age: isNaN(age) ? "Unknown" : age,
                address: patient.address || "杭州师范大学",
                accountinitaltime: patient.created_at || "N/A",
                email: patient.email || "N/A",
                gender: patient.gender || "Unknown",
            };
            });
            setPatients(patientData);
            setFilteredData(patientData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
        };

        fetchPatients();
    }, [doctorId]);
    const handleSearch = (values) => {
        const { patientName, patientId } = values;
        const filtered = patients.filter((patient) => {
          const matchesName = !patientName || patient.name === patientName;
          const matchesId = !patientId || patient.id === patientId;
          return matchesName && matchesId;
        });
    
        setFilteredData(filtered);
    };
    return(
        <div>
            <AdvancedSearchForm onSearch={handleSearch} patients={patients || []} selectedPerson={selectedPerson}/>
            
        </div>
    )
}

export default NewEmail;