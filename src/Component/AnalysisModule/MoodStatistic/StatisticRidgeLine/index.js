import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const moodList = [
  { mood: "happy", color: "skyblue" },
  { mood: "fear", color: "grey" },
  { mood: "angry", color: "red" },
  { mood: "anxiety", color: "orange" },
  { mood: "envy", color: "#6DD1C5" },
  { mood: "depress", color: "purple" },
  { mood: "disgust", color: "green" },
  { mood: "embarrassment", color: "pink" },
  { mood: "ennui", color: "blue" },
];

const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// 转换 created_at 为星期几的函数
const transformMoodData = (data) => {
  return data.map(item => {
    const date = new Date(item.created_at);
    const dayOfWeek = date.getDay(); // 获取星期几 (0-6)
    return {
      ...item,
      day: dayOfWeek // 新增 day 属性，表示星期几
    };
  });
};

function StatisticRidgeLineChart({isClick, moodData }) {
  const chartRef = useRef(null);

  useEffect(() => {
    const chartInstance = echarts.init(chartRef.current);

    const updateChart = () => {
      const transformedData = transformMoodData(moodData);

      // 统计每种心情在每一天的数量
      const moodCounts = weekDays.map((_, dayIndex) => {
        return moodList.map(moodItem => {
          const count = transformedData.filter(item => item.day === dayIndex && item.mood === moodItem.mood).length;
          return count;
        });
      });

      const moodMaxCounts = moodList.map((moodItem, moodIndex) => {
        const maxCount = Math.max(...moodCounts.map(counts => counts[moodIndex]));
        const maxIndex = moodCounts.findIndex(counts => counts[moodIndex] === maxCount);
        return { moodItem, maxCount, maxIndex };
      });

      // 根据最大数量排序
      moodMaxCounts.sort((a, b) => b.maxIndex- a.maxIndex);

      // 重新构建排序后的 moodList
      const sortedMoodList = moodMaxCounts.map(item => item.moodItem);

      // 创建每个心情的单独折线图，堆叠起来
      const gridHeight = 100 / (sortedMoodList.length ); // 每个心情占用的高度百分比
      const series = sortedMoodList.map((moodItem, moodIndex) => {
        return {
          name: moodItem.mood,
          type: 'line',
          smooth: true,
          areaStyle: {},
          data: moodCounts.map(counts => counts[moodList.indexOf(moodItem)]), // 正确获取数据
          xAxisIndex: moodIndex,
          yAxisIndex: moodIndex,
          itemStyle: {
            color: moodItem.color,
          },
          lineStyle: {
            color: moodItem.color,
          },
          symbol: 'none',
        };
      });

      const xAxes = sortedMoodList.map((_, index) => ({
        type: 'category',
        data: weekDays,
        gridIndex: index,
        boundaryGap: false,
        axisTick: {
          alignWithLabel: true,
          show: false,
        },
        axisLabel: {
          show: index === sortedMoodList.length - 1, // 只显示最下面的 x 轴标签
          textStyle:{
            fontSize:isClick?10:4
          }
        },
      }));

      const yAxes = sortedMoodList.map((moodItem, index) => ({
        type: 'value',
        name: moodItem.mood,
        nameLocation: 'middle',
        nameGap: 20,
        nameTextStyle: {
          fontSize: isClick?14:8, 
        },
        gridIndex: index,
        position: 'left',
        min: 0,
        max: Math.max(...moodCounts.map(counts => Math.max(...counts))), // 使用 moodCounts 计算最大值
        axisLine: {
          show: false,
        },
        axisLabel: {
          show: false,
          
        },
        splitLine: {
          show: false,
        },
       nameRotate:0
      }));

      const grids = sortedMoodList.map((_, index) => ({
        top: `${index * gridHeight-index*3}%`,
        height: '20%',
        left:'20%',
        right: '5%',
      }));

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            const day = weekDays[params[0].dataIndex];
            return params.map(p => `Mood: ${p.seriesName}<br />Count: ${p.value}<br />Day: ${day}`).join('<br/>');
          },
        },
        grid: grids,
        xAxis: xAxes,
        yAxis: yAxes,
        series: series,
      };

      chartInstance.setOption(option);
    };

    updateChart();

    return () => {
      chartInstance.dispose();
    };
  }, [moodData]);

  return (
    <div className="statistic-panel" style={{width:isClick?'90%':'300px',height:isClick? '100%':'150px'}}>
    <div ref={chartRef} style={{ width: '100%', height:'100%' }} />
    </div>
  );
} 

export default StatisticRidgeLineChart;
