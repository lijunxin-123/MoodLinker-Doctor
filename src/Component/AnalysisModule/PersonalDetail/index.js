import React, { useEffect, useRef, useState } from 'react';
import { Button, ConfigProvider, DatePicker, Space } from 'antd';
import * as echarts from 'echarts';
import axios from 'axios';
import StatisticLineChart from '../MoodStatistic/StatisticLineChart';
import MoodDetailPage from '../MoodDetailPage';
import StatisticBarChart from '../MoodStatistic/StatisticBarChart';
import MoodStatistic from '../MoodStatistic';

const { RangePicker } = DatePicker;
const userDataInitial={
  eating_value:4,
  sleep_value:4,
  guilt_value:4,
  body_value:4,
  hesitation_value:4,
  mental_value:4
}
const PersonalDetail = ({ user }) => {
  const chartRef = useRef(null);
  const [moodData, setMoodData] = useState([]);
  const [dates, setDates] = useState([2024-9-16,2024-12-31]); // 新增 dates 状态
  const [choose,setChoose]=useState(null);
  const [clickDate,setClickDate]=useState(null)
  const [clickAll,setAll]=useState(true)
  const [userData,setUserData]=useState(userDataInitial)
  const [userTotalScore,setUserTotalScore]=useState(0)
  const [clickMood,setClickMood]=useState(null)
  const userId = user.id;
  const fetchAllData=()=>{
    setAll(true)
    fetchOtherData()
    fetchTotalScore()
  }
  const fetchTotalScore=async()=>{
    const [startDate, endDate] = dates;
    try {
      const response = await axios.get(`http://127.0.0.1:5000/doctor/${userId}/HAM-D6-SR-All`, {
        params: {  start_date: startDate, end_date: endDate },
      });
      console.log(response.data)
      setUserTotalScore(response.data.average_score);
    } catch (error) {
      console.error("Error fetching other data:", error);
    }
  };
  
  const fetchOtherData = async () => {
    const [startDate, endDate] = dates;
    try {
      const response = await axios.get(`http://127.0.0.1:5000/doctor/${userId}/HAM-D6-SR-Range`, {
        params: {  start_date: startDate, end_date: endDate },
      });
      console.log(response.data)
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching other data:", error);
    }
  };
  const fetchMoodData = async () => {
    setAll(false)
    setChoose('mood')
    
    
    if (!userId || dates.length === 0) {
      alert("Please select a date range and ensure user ID is available.");
      return;
    }

    const [startDate, endDate] = dates;
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/moods/${userId}`, {
        params: { start_date: startDate, end_date: endDate },
      });
      const formattedMoods = response.data.moods.map(mood => ({
        mood: mood.mood,
        created_at: new Date(mood.created_at).toISOString().split('T')[0],
      }));
      setMoodData(formattedMoods);
      console.log(formattedMoods)
    } catch (error) {
      console.error("Error fetching mood data:", error);
    }
  };

  useEffect(() => {
    if (clickAll) {
      const chartDom = chartRef.current;
      const myChart = echarts.init(chartDom);
      const option = {
        color: ['#67F9D8', '#FFE434', '#56A3F1', '#FF917C'],
        title: { text: `HAM量表速览--时间段内总得分${userTotalScore}` },
        legend: {},
        radar: [
          {
            indicator: [
              { text: '罪恶感', max: 4 },
              { text: '睡眠情况', max: 4 },
              { text: '饮食情况', max: 4 },
              { text: '精神焦虑', max: 4 },
              { text: '躯体情况', max: 4 },
              { text: '精神运动性迟缓', max: 4 },
            ],
            center: ['50%', '50%'],
            radius: 220,
            startAngle: 90,
            splitNumber: 4,
            shape: 'circle',
            selectorLabel: { fontSize: 18 },
            axisName: { formatter: '{value}', color: '#428BD4', fontSize: 16 },
            splitArea: {
              areaStyle: {
                color: ['#FF917C', '#FFE434', '#99AC71', '#4C5832'],
                shadowColor: 'rgba(0, 0, 0, 0.2)',
                shadowBlur: 10,
              },
            },
            axisLine: { lineStyle: { color: 'rgba(211, 253, 250, 0.8)' } },
            splitLine: { lineStyle: { color: 'rgba(211, 253, 250, 0.8)' } },
          },
        ],
        series: [
          {
            type: 'radar',
            emphasis: { lineStyle: { width: 4 } },
            lineStyle: { color: 'white', width: 4, type: 'solid' },
            
            data: [
              {
                value: Object.values(userData), // 这里提取 userData 的值
                symbol: 'circle',
                symbolSize: 10,
                itemStyle: { color: 'white' },
              },
            ],
          },
        ],

      };
  
      myChart.setOption(option);    
      
      return () => {
        myChart.dispose();
      };
    }
  }, [clickAll, userData, dates]); // 监听 clickAll 的变化
  
  const handlePointClick = ({ date, mood }) => {
    setChoose('detail')
    setAll(false)
    setClickDate(date);
    setClickMood(mood);
  };

  return (
    <div style={{ padding: '2%', paddingLeft: '3%' }}>
      <h2>个案姓名: {user.name}</h2>
      <h2>个案追踪起始日: {user.accountinitaltime}</h2>
      <Space style={{ marginTop: '20px', marginBottom: '-10px' }} direction="vertical" size={12}>
        <RangePicker onChange={(_, dateStrings) => setDates(dateStrings)} />
      </Space>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '15%',
          marginTop: '5%',
          gap: '10px',
        }}
      >
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
          <Button style={{ height: '40px', borderRadius: '0' }} onClick={fetchAllData}>
            总览
          </Button>
          <Button style={{ height: '40px', borderRadius: '0' }} onClick={fetchMoodData}>
            情绪分析详情页
          </Button>
          {/* <Button style={{ height: '40px', borderRadius: '0' }}>饮食详情页</Button>
          <Button style={{ height: '40px', borderRadius: '0' }}>睡眠详情页</Button>
          <Button style={{ height: '40px', borderRadius: '0' }}>罪恶感分析详情页</Button>
          <Button style={{ height: '40px', borderRadius: '0' }}>精神焦虑详情页</Button>
          <Button style={{ height: '40px', borderRadius: '0' }}>躯体状况详情页</Button>
          <Button style={{ height: '40px', borderRadius: '0' }}>精神运动性迟缓详情页</Button> */}
        </ConfigProvider>
      </div>
      {clickAll&&<div ref={chartRef} style={{ position: 'absolute', top: '15%', right: '10%', width: '700px', height: '600px' }} />}
      {!clickAll&&<div style={{ border:"2px solid #99AC71",position: 'absolute', top: '12%', right: '2%', width: '1000px', height: '78%' }}>
        {((clickDate==null)||(choose=='mood'))&&<MoodStatistic isClick={true} moodData={moodData} onPointClick={handlePointClick}/>}
        {clickDate!==null&&choose=='detail'&&<MoodDetailPage clickDate={clickDate} clickMood={clickMood} userId={userId}/>}
        
      </div>}
      
    </div>
  );
};

export default PersonalDetail;
