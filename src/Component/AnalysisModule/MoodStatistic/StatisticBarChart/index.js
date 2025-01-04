import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const moodList = [
  { mood: "angry", color: "red", img: "/MoodPicture/angry.svg" },
  { mood: "anxiety", color: "orange", img: "/MoodPicture/anxiety.svg" },
  { mood: "envy", color: "#6DD1C5", img: "/MoodPicture/envy.svg" },
  { mood: "depress", color: "grey", img: "/MoodPicture/depress.svg" },
  { mood: "disgust", color: "green", img: "/MoodPicture/disgust.svg" },
  { mood: "embarrassment", color: "pink", img: "/MoodPicture/embarrassment.svg" },
  { mood: "ennui", color: "blue", img: "/MoodPicture/ennui.svg" },
  { mood: "fear", color: "purple", img: "/MoodPicture/fear.svg" },
  { mood: "happy", color: "skyblue", img: "/MoodPicture/happy.svg" }
];

function StatisticBarChart({ isClick,moodData }) {
  const chartRef = useRef(null);

  useEffect(() => {
    const chartInstance = echarts.init(chartRef.current);

    const updateChart = () => {
      // 统计每种心情的数量
      const moodCount = moodList.reduce((acc, { mood }) => {
        acc[mood] = 0; // 初始化计数为0
        return acc;
      }, {});

      moodData.forEach(item => {
        if (moodCount[item.mood] !== undefined) {
          moodCount[item.mood] += 1; // 增加对应心情的计数
        }
      });

      // 将计数转换为数据数组
      const data = moodList.map(({ mood }) => ({
        mood,
        count: moodCount[mood]
      }));

      // 默认排序（心情顺序）
      const defaultSortedData = [...data];

      const total = data.reduce((sum, item) => sum + item.count, 0); // 计算总数

      const option = {
        grid:{
          left:isClick?'20%':20,top:20,bottom:20
        },
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            const mood = defaultSortedData[params.dataIndex];
            const count = mood.count;
            const percentage = total > 0 ? ((count / total) * 100).toFixed(2) + '%' : '0%';
            return `
              <div>
                Mood: ${mood.mood}<br />
                Count: ${count} (${percentage})<br/>
                <img src="${moodList.find(m => m.mood === mood.mood).img}" alt="${mood.mood}" style="width: 30px; height: 30px; margin-right: 5px;"/>
              </div>
            `;
          }
        },
        xAxis: {
          max: 'dataMax',
          axisLabel:{
            show:isClick?true:false,
          }
        },
        backgroundColor: isClick?'white':null,
        yAxis: {
          type: 'category',
          data: defaultSortedData.map(({ mood }) => mood), // 默认排序显示
          inverse: true,
          axisLabel:{
            show:isClick?true:false,
          },
          axisTick: {
            alignWithLabel: true, 
            show:isClick?true:false,
          }
        },
        series: [
          {
            name: 'Mood Count',
            type: 'bar',
            data: defaultSortedData.map(({ count }) => count), // 默认排序数据
            label: {
              show:isClick?true:false,
              position: 'right',
              valueAnimation: true
            },
            itemStyle: {
              color: (params) => moodList.find(m => m.mood === defaultSortedData[params.dataIndex].mood).color,
            },
            animationDuration: 500, // 动画持续时间
            animationEasing: 'bounce', // 动画缓动效果
          }
        ],
        barWidth: '100%', // 设置条形图的宽度
        animationDuration: 0,
        animationDurationUpdate: 1000,
        animationEasing: 'linear',
        animationEasingUpdate: 'linear'
      };

      chartInstance.setOption(option);

      // 动态排序逻辑
      setTimeout(() => {
        // 按照计数从大到小排序
        const countSortedData = [...data].sort((a, b) => b.count - a.count);

        const updateSortedOption = {
          ...option,
          grid:{
            left:isClick?'20%':20,top:20,bottom:20
          },
          yAxis: {
            ...option.yAxis,
            data: countSortedData.map(({ mood }) => mood), // 更新为计数排序
          },
          series: [{
            ...option.series[0],
            data: countSortedData.map(({ count }) => count), // 更新为计数排序数据
            itemStyle: {
              color: (params) => moodList.find(m => m.mood === countSortedData[params.dataIndex].mood).color,
            },
          }],
          tooltip: {
            trigger: 'item',
            formatter: function (params) {
              const mood = countSortedData[params.dataIndex];
              const count = mood.count;
              const percentage = total > 0 ? ((count / total) * 100).toFixed(2) + '%' : '0%';
              return `
                <div>
                  Mood: ${mood.mood}<br />
                  Count: ${count} (${percentage})<br/>
                  <img src="${moodList.find(m => m.mood === mood.mood).img}" alt="${mood.mood}" style="width: 30px; height: 30px; margin-right: 5px;"/>
                </div>
              `;
            }
          }
        };
        chartInstance.setOption(updateSortedOption, true);
      }, 0); // 3秒后进行动态排序
    };

    updateChart(); // 初始化图表

    // 清理图表实例
    return () => {
      chartInstance.dispose();
    };
  }, [moodData]);

  return (
    <div className="statistic-panel" style={{width:isClick?'100%':'150px',height:isClick? '90%':'150px'}}>
    <div ref={chartRef} style={{ width: '100%', height:'100%' }} />
  </div>
  );
}

export default StatisticBarChart;
