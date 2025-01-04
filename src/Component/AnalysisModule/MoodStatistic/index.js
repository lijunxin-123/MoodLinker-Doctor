import StatisticBarChart from "./StatisticBarChart";
import StatisticLineChart from "./StatisticLineChart";
import React, { useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Space, Typography } from 'antd';
import StatisticRidgeLineChart from "./StatisticRidgeLine";

function MoodStatistic({ isClick, moodData, onPointClick }) {
    const [chartNumber, setNumber] = useState('1');

    // 定义 Dropdown 菜单项
    const items = [
        {
            key: '1',
            label: 'Line Chart',
        },
        {
            key: '2',
            label: 'Bar Chart',
        },
        {
            key: '3',
            label: 'RidgeLine Chart',
        },
    ];

    // 处理 Dropdown 选项切换
    const handleDropdownChange = ({ key }) => {
        setNumber(key); // 更新图表编号
    };

    const menu = {
        items,
        onClick: handleDropdownChange, // 菜单点击事件
    };

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Dropdown menu={menu} trigger={['click']} >
                <Typography.Link>
                    <Space>
                        Select Chart
                        <DownOutlined />
                    </Space>
                </Typography.Link>
            </Dropdown>
            {/* 根据 chartNumber 渲染对应的图表 */}
            {chartNumber === '1' && (
                <StatisticLineChart isClick={true} moodData={moodData} onPointClick={onPointClick} />
            )}
            {chartNumber === '2' && <StatisticBarChart isClick={true} moodData={moodData} />}
            {chartNumber === '3' && <StatisticRidgeLineChart isClick={true} moodData={moodData} />} {/* 添加 RidgeLine 图占位 */}
        </div>
    );
}

export default MoodStatistic;
