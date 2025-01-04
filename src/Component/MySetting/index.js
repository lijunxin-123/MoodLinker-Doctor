import './MySetting.css'
import React, { useEffect, useRef,useState } from 'react';
import * as echarts from 'echarts';


function MySetting() {
  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);
  const [patients, setPatients] = useState([]);
  const doctorId = localStorage.getItem('doctor_id'); // 从本地存储获取医生 ID
  const [loading, setLoading] = useState(true); // 加载状态
  const [error, setError] = useState(null); // 错误信息
  const [femaleNumber,setFemale]=useState(0)
  const [patientsNumber,setPatientsNumber]=useState(0)
  const [grade,setGrade]=useState([])
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/doctor/${doctorId}/patients`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        
        setPatientsNumber(data.patients.length)
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

        const number=data.patients.filter((item)=>item.gender=='女').length
        const grade1=data.patients.filter((item)=>{
            const birthdate=new Date(item.birthdate)
            return birthdate.getFullYear()<=2003
        }).length
        const grade2=data.patients.filter((item)=>{
            const birthdate=new Date(item.birthdate)
            return birthdate.getFullYear()<=2005&&birthdate.getFullYear()>2003
        }).length
        const grade3=data.patients.filter((item)=>{
            const birthdate=new Date(item.birthdate)
            return birthdate.getFullYear()<=2006&&birthdate.getFullYear()>2005
        }).length
        const grade4=data.patients.filter((item)=>{
            const birthdate=new Date(item.birthdate)
            return birthdate.getFullYear()>2006
        }).length
        setFemale(number)
        setGrade([grade4,grade3,grade2,grade1])
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
    
  }, [doctorId,patientsNumber]);
  useEffect(() => {
    const chartInstance1 = echarts.init(chartRef1.current);
    const chartInstance2 = echarts.init(chartRef2.current);
    
    const option1 = {
        title: {
            text: '性别分布',
          },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          top: '5%',
          left: 'center'
        },
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            color:['#5470c6','pink'],
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 40,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: femaleNumber, name: '女生' },
              { value: patientsNumber-femaleNumber, name: '男生' },
              
            ]
          }
        ]
    };
    const option2 = {
        title: {
          text: '年级分布',
        },
        xAxis: {
          type: 'category',
          data: ['大一', '大二', '大三', '大四']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [grade[0],grade[1],grade[2],grade[3]],
            type: 'bar',
            barWidth:'50%'
          }
        ],
        grid: {
            left: '5%',
            right: '5%',
            bottom: '0',
            containLabel: true
          },
      };

    chartInstance1.setOption(option1);
    chartInstance2.setOption(option2);

    // Add click event listener
    // Clean up the chart on component unmount
    return () => {
      chartInstance1.dispose();
      chartInstance2.dispose();
    };
  }, [femaleNumber]); // Update on moodData or onPointClick change

  return (
    <div style={{ width: '100%', height: '95%' }}>
        <div style={{ width: '50%', height: '100%' }}>
        <h2 style={{fontSize:'25px',marginLeft:"5px",fontWeight:"bold"}}>个案统计：{patientsNumber}</h2>
        <div ref={chartRef1} style={{ width: '90%', height: '50%' }} />
        <div ref={chartRef2} style={{ width: '90%', height: '50%' }} />

        </div>

    </div>
  );
}

export default MySetting;
