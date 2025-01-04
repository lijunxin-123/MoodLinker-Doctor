
import React from 'react';
import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import { useState,useEffect } from 'react';
import PasswordChange from './PasswordChange';

const { Header, Content, Footer, Sider } = Layout;


const items2 = [UserOutlined, NotificationOutlined,LaptopOutlined].map((icon, index) => {
  const key = String(index + 1);
  const label=['个人设置','消息通知','其他'];
  const subLabel=[['密码更改'],['通知时间'],['更新频率调整']]
  return {
    key: `${key}`,
    icon: React.createElement(icon),
    label: label[key-1],
    children: new Array(1).fill(null).map((_, j) => {
      const subKey = index * 1 + j + 1;
      return {
        key: `${key}0`,
        label: subLabel[key-1][0],
      };
    }),
  };
});
const GeneralSetting = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [selectedKey, setSelectedKey] = useState('1'); // 跟踪当前选中的菜单项

    // 定义不同菜单项对应的内容
    const renderContent = () => {
        switch (selectedKey) {
            case '10':
                return <PasswordChange/>
            case '20':
                return <div></div>;
            case '30':
                return <div></div>;
            default:
                return <div>请选择一个选项</div>;
        }
    };
    

  return (
    <Layout>
      <Content
        style={{
          padding: '0 48px',
          backgroundColor:'white'
        }}
      >
          <h2 style={{
            margin: '16px 0',
          }}>通用设置</h2>
          
        <Layout
          style={{
            padding: '24px 0',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Sider
            style={{
              background: colorBgContainer,
            }}
            width={200}
          >
            <Menu
              mode="inline"
              defaultSelectedKeys={['1']}
              style={{
                height: '100%',
              }}
              items={items2}
              onClick={(e) => setSelectedKey(e.key)} // 更新选中项
            />
          </Sider>
          <Content
            style={{
              padding: '0 24px',
              minHeight: 280,
            }}
          >
            {renderContent()}
          </Content>
        </Layout>
      </Content>
      
    </Layout>
  );
};
export default GeneralSetting;