import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

// Mood list and colors
const moodList = ["angry", "anxiety", "depress", "disgust", "embarrassment", "fear", "unknown", "happy", "satisfication", "greatful", "curious", "confident"];
const moodColors = ["#00FF00", "#FF0000"]; // Gradient from green to red

// Generate gradient colors
function generateGradientColors(startColor, endColor, steps) {
  const start = parseInt(startColor.slice(1), 16);
  const end = parseInt(endColor.slice(1), 16);

  const r1 = (start >> 16) & 0xff;
  const g1 = (start >> 8) & 0xff;
  const b1 = start & 0xff;

  const r2 = (end >> 16) & 0xff;
  const g2 = (end >> 8) & 0xff;
  const b2 = end & 0xff;

  const colors = [];
  for (let i = 0; i < steps; i++) {
    const r = Math.round(r1 + (r2 - r1) * (i / (steps - 1)));
    const g = Math.round(g1 + (g2 - g1) * (i / (steps - 1)));
    const b = Math.round(b1 + (b2 - b1) * (i / (steps - 1)));
    colors.push(`#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`);
  }
  return colors;
}

// Assign numerical values to moods
const moodValues = moodList.reduce((acc, mood, index) => {
  acc[mood] = index - moodList.indexOf("unknown");
  return acc;
}, {});

const gradientColors = generateGradientColors(moodColors[0], moodColors[1], moodList.length);

function StatisticLineChart({ isClick, moodData, onPointClick }) {
  const chartRef = useRef(null);

  useEffect(() => {
    const chartInstance = echarts.init(chartRef.current);

    // Extract dates and mood values from moodData
    const dateList = moodData.map(item => item.created_at); // Assuming 'YYYY-MM-DD' format
    const valueList = moodData.map(item => moodValues[item.mood]); // Map mood to numerical value
    console.log(valueList)
    const option = {
      title: {
        left: 'center',
        text: isClick ? 'Mood over Time with Gradient' : "",
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          const date = params[0].axisValue;
          const moodValue = params[0].data;
          const mood = Object.keys(moodValues).find(key => moodValues[key] === moodValue);
          return `${date}<br />Mood: ${mood}`;
        },
      },
      grid: {
        left: '20%',
        top: 50,
        bottom: 30,
      },
      xAxis: {
        type: 'category',
        data: dateList,
        axisLabel: {
          show: true,
          align: 'center',
          margin: 10,
        },
        axisTick: {
          alignWithLabel: true,
          show: isClick ? true : false,
        },
      },
      yAxis: {
        type: 'value',
        min: Math.min(...Object.values(moodValues)),
        max: Math.max(...Object.values(moodValues)),
        interval: 1,
        axisLabel: {
          show: isClick ? true : false,
          formatter: value => {
            const mood = Object.keys(moodValues).find(key => moodValues[key] === value);
            return mood || value;
          },
        },
        axisTick: {
          alignWithLabel: true,
          show: isClick ? true : false,
        },
      },
      backgroundColor: isClick ? 'white' : null,
      visualMap: {
        show: false,
        min: Math.min(...Object.values(moodValues)),
        max: Math.max(...Object.values(moodValues)),
        dimension: 1,
        inRange: {
          color: gradientColors,
        },
      },
      series: [
        {
          type: 'line',
          showSymbol: true,
          data: valueList,
          lineStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, gradientColors.map((color, idx) => ({
              offset: idx / (gradientColors.length - 1),
              color,
            }))),
            width: 4,
          },
        },
      ],
    };

    chartInstance.setOption(option);

    // Add click event listener
    chartInstance.on('click', function (params) {
        
      if (params.componentType === 'series') {
        console.log(params)
        const { dataIndex } = params;
        const clickedDate = dateList[dataIndex];
        const clickedMood = Object.keys(moodValues).find(key => moodValues[key] === valueList[dataIndex]);
        onPointClick && onPointClick({ date: clickedDate, mood: clickedMood });
      }
    });

    // Clean up the chart on component unmount
    return () => {
      chartInstance.dispose();
    };
  }, [moodData, onPointClick]); // Update on moodData or onPointClick change

  return (
    <div style={{ width: '100%', height: '95%' }}>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

export default StatisticLineChart;
