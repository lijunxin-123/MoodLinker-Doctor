import React, { useEffect, useState } from 'react';
import { Avatar, Button, List, Skeleton } from 'antd';
import { WarningOutlined, WarningFilled } from '@ant-design/icons';
import PersonalDetail from '../PersonalDetail';
import NewEmail from '../../MailBoxModule/NewEmail';

const QuickReview = () => {
  const [loading, setLoading] = useState(true); // 加载状态
  const [patients, setPatients] = useState([]); // 存储患者信息
  const [error, setError] = useState(null); // 错误信息
  const doctorId = localStorage.getItem('doctor_id'); // 从本地存储获取医生 ID
  const [selectedPatient, setSelectedPatient] = useState(null); // 当前选中的患者
  const [selectedContactPatient, setContectedPatient] = useState(null); // 当前选中的患者
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // 获取医生的患者列表
        const response = await fetch(`http://127.0.0.1:5000/doctor/${doctorId}/patients`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        const patientData = await Promise.all(
          data.patients.map(async (patient) => {
            try {
              // 查询每位患者的情绪得分和HAM-D6-SR得分
              const moodResponse = await fetch(`http://127.0.0.1:5000/doctor/${patient.id}/mood-score`);
              const hamResponse = await fetch(`http://127.0.0.1:5000/doctor/${patient.id}/HAM-D6-SR`);
              
              const moodScore = moodResponse.ok ? await moodResponse.json() : { average_score: 0 };
              const hamScore = hamResponse.ok ? await hamResponse.json() : { average_score: 0 };

              return {
                ...patient,
                moodScore: moodScore.average_score || 0,
                hamScore: hamScore.average_score || 0,
              };
            } catch {
              return { ...patient, moodScore: 0, hamScore: 0 }; // 错误时设为默认值
            }
          })
        );
        setPatients(patientData); // 保存处理后的患者数据
        console.log(patientData)
      } catch (err) {
        setError(err.message); // 保存错误信息
      } finally {
        setLoading(false); // 加载完成
      }
    };

    fetchPatients();
  }, [doctorId]);


  
  const handleViewDetail = (patient) => {
    setSelectedPatient({id:patient.id,name:patient.username,accountinitaltime:patient.created_at}); // 更新选中的患者
  };
  const handleContact = (patient) => {
    setContectedPatient({id:patient.id,name:patient.username}); // 更新选中的患者
  };
  const handleBackButton=()=>{
    setSelectedPatient(null)
    setContectedPatient(null)
  }
  
  return (
    <>
    {(selectedPatient!=null)||(selectedContactPatient!=null)? (
      <>
      <Button onClick={handleBackButton}>返回</Button>
      {selectedPatient!=null&&<PersonalDetail user={selectedPatient} />}
      {selectedContactPatient!=null&&
      <div style={{marginTop:"2%"}}>
        <NewEmail selectedPerson={selectedContactPatient}/>
      </div>

      }
      </>

    ) : (
      <List
      className="demo-loadmore-list"
      loading={loading}
      itemLayout="horizontal"
      dataSource={patients}
      renderItem={(item) => (
        <List.Item actions={[<a key="list-loadmore-edit" onClick={() => handleViewDetail(item)}>查看</a>, <a key="list-loadmore-more" onClick={() => handleContact(item)}>联系</a>]}>
          <Skeleton avatar title={false} loading={false} active>
            <List.Item.Meta
              avatar={<Avatar src={`https://ui-avatars.com/api/?name=${item.username}&background=random`} />}
              title={<a href="#">{item.username}</a>}
              description={`性别：${item.gender || '未知'} 出生日期：${item.birthdate || '未提供'} 追踪开始时间：${item.created_at || '未提供'}`}
            />
            <div  style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
              {(item.moodScore <=0 || item.hamScore < 16) && (
                <WarningFilled style={{ fontSize: '32px', color: 'red' }} />
              )}
              {(item.moodScore > 0 && item.hamScore >= 16) && (
              <svg t="1732175981957" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5131" width="32" height="32"><path d="M1019.2896 670.1056q-28.8768-128.6144-58.5728-257.6384a20.48 20.48 0 0 0-34.4064-10.8544q-95.8464 90.9312-191.2832 182.272a20.48 20.48 0 0 0 8.3968 35.0208c18.6368 5.9392 37.4784 11.6736 56.1152 16.7936 6.7584 1.8432 9.0112 3.8912 5.5296 11.0592a322.3552 322.3552 0 0 1-196.4032 176.5376 356.1472 356.1472 0 0 1-48.9472 11.264l12.4928 15.1552c23.3472 30.1056 50.7904 57.1392 71.2704 89.7024 2.4576 3.8912 4.5056 1.6384 6.9632 1.024a401.8176 401.8176 0 0 0 42.8032-16.5888 447.488 447.488 0 0 0 232.0384-239.4112c3.2768-7.5776 5.9392-9.8304 14.336-6.9632 17.408 6.3488 35.2256 11.4688 52.8384 16.7936s31.1296-4.9152 26.8288-24.1664z m-471.04-382.3616a20.48 20.48 0 0 0 37.4784-8.8064c6.144-19.2512 12.288-38.7072 17.6128-58.1632 2.2528-8.192 5.3248-9.216 12.6976-6.5536a317.2352 317.2352 0 0 1 180.8384 155.8528 320.512 320.512 0 0 1 26.2144 70.4512c3.4816-3.072 6.144-5.12 8.3968-7.3728l63.0784-61.44a61.44 61.44 0 0 1 20.48-14.336c9.216-3.072 9.8304-6.9632 5.9392-15.7696A441.7536 441.7536 0 0 0 651.8784 94.0032c-7.9872-2.6624-8.6016-5.12-6.144-12.288 6.3488-17.8176 11.8784-36.0448 17.408-54.0672a18.432 18.432 0 0 0-20.48-24.1664L634.88 4.9152 385.4336 59.392a20.48 20.48 0 0 0-11.4688 35.84q87.2448 96.4608 174.8992 192.512zM292.2496 450.56a20.48 20.48 0 0 0-10.8544-34.6112c-17.6128-4.3008-35.0208-8.8064-52.8384-12.4928-6.9632-1.4336-8.192-2.8672-5.3248-9.8304a323.1744 323.1744 0 0 1 201.3184-182.6816c-28.8768-31.5392-56.7296-61.44-83.968-92.3648a10.8544 10.8544 0 0 0-15.36-3.072A440.5248 440.5248 0 0 0 102.4 362.0864c-2.6624 6.9632-5.5296 8.6016-12.6976 6.7584-20.48-5.5296-40.96-10.24-61.44-14.9504a18.432 18.432 0 0 0-23.1424 23.7568C28.672 463.0528 52.0192 548.6592 75.776 634.88a20.48 20.48 0 0 0 35.2256 9.216q90.9312-96.6656 181.248-193.536z m148.6848 292.0448a18.6368 18.6368 0 0 0-34.2016 5.9392c-6.5536 16.5888-13.1072 33.1776-19.0464 49.9712-2.6624 7.5776-5.12 9.6256-13.1072 5.5296A321.3312 321.3312 0 0 1 206.2336 593.92c-4.096 1.2288-5.7344 4.5056-8.192 6.9632l-63.6928 67.1744a40.96 40.96 0 0 1-20.48 14.336c-7.9872 1.8432-8.6016 4.3008-5.3248 11.6736a447.0784 447.0784 0 0 0 222.6176 229.376c6.3488 2.8672 7.168 5.3248 4.7104 11.4688-8.3968 20.48-16.384 40.96-23.7568 61.44a19.0464 19.0464 0 0 0 20.48 27.2384h7.3728l254.1568-40.96c21.7088-3.4816 27.648-18.2272 14.1312-34.816q-82.944-102.4-166.5024-202.5472z m0 0" fill="#ADFF00" p-id="5132"></path></svg>
              )}
              <span style={{marginLeft:'10px'}}>情绪得分: {item.moodScore}</span>
              <span style={{ marginLeft: '10px' }}>HAM-D6-SR得分: {item.hamScore}</span>
              
            </div>
          </Skeleton>
        </List.Item>
      )}
    />)}
  </>
  );
};

export default QuickReview;
