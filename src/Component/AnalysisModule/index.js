import { useNavigate } from 'react-router-dom';
import './AnalysisModule.css'; // 导入 CSS 文件
import { useDispatch, useSelector } from 'react-redux';
import { changeChooseNumber } from '../../store/stageSlice';
import React, { useEffect, useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  BarChartOutlined,
  MailOutlined,
  SettingOutlined,
  PlusOutlined,
  MessageOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { Button, ConfigProvider, FloatButton, Layout, Menu, theme} from 'antd';
import QuickReview from './QuickReview';
import PatientManagement from './PatientManagement';
import MailBoxModule from '../MailBoxModule';
import NewEmail from '../MailBoxModule/NewEmail';
import MySetting from '../MySetting';
import NewPatient from './NewPatient';
const { Header, Sider, Content,Footer  } = Layout;

function AnalysisModule(){
    const pageNumber=useSelector((store) => store.stage.analysisNumber);
    const [collapsed, setCollapsed] = useState(false);
    const {
      token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [selectedKey, setSelectedKey] = useState('1'); // 跟踪当前选中的菜单项

    // 定义不同菜单项对应的内容
    const renderContent = () => {
        switch (selectedKey) {
            case '1':
                return <QuickReview />;
            case '2':
                return <PatientManagement />;
            case '3':
                return <MailBoxModule/>;
            case '4':
                return <MySetting/>;
            case '5':
                return <NewEmail selectedPerson={null}/>;
            case '6':
                return <NewPatient/>;
            default:
                return <div>请选择一个选项</div>;
        }
    };
    useEffect(()=>{
        setSelectedKey(pageNumber)
    },[pageNumber])
    return (
        
        <ConfigProvider
            theme={{
                components: {
                Layout: {
                    siderBg:"#D9D9D9",
                    triggerBg:"#D9D9D9",
                    lightTriggerColor:"#D9D9D9",
                    footerBg:"#99AC71",
                    headerBg:"#99AC71",
                },
                Footer:{
                    footerPadding:undefined
                }
                },
            }}
            >
            <div className='analysisBox'>
            <Header className='headerBox'
            style={{
                padding: 0,
                display: 'flex', // 使用 Flex 布局
                alignItems: 'center', // 垂直居中
                justifyContent: 'space-between', // 左右布局（可以用 space-between 或自定义）
            }}
            >
            {/* 左侧按钮 */}
            <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                fontSize: '16px',
                width: 60,
                height: 60,
                }}
            />
            {/* 中间文字 */}
            <div style={{ flex: 1, textAlign: 'center', fontSize: '20px',fontWeight:"bold",color:"white" }}>
                心理健康可视化追踪系统
            </div>
            </Header>
            <Layout className='layoutBox'>
                <Sider trigger={null} collapsible collapsed={collapsed}>
                <ConfigProvider
                    theme={{
                        components: {
                        Menu: {
                            darkItemSelectedBg:"#99AC71",
                            darkSubMenuItemBg:"#D9D9D9",
                            darkPopupBg:"#D9D9D9",
                            darkItemBg:"#D9D9D9",
                            darkItemColor:"#000000"
                        },
                        
                        },
                    }}
                    >
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    onClick={(e) => setSelectedKey(e.key)} // 更新选中项
                    items={[
                    {
                        key: '1',
                        icon: <UserOutlined />,
                        label: '情况速览',
                    },
                    {
                        key: '2',
                        icon: <BarChartOutlined />,
                        label: '患者管理',
                    },
                    {
                        key: '3',
                        icon: <MailOutlined />,
                        label: '消息中心',
                    },
                    {
                        key: '4',
                        icon: <SettingOutlined />,
                        label: '个人设置',
                    },
                    ]}
                />
                <FloatButton.Group
                trigger="click"
                shape='circle'
                style={{position:"absolute",left:'-55%',bottom:"10px"}}
                icon={<PlusOutlined />}
                >
                <FloatButton icon={<UserAddOutlined />} 
                onClick={(event)=>{
                    setSelectedKey('6')
                }}
                tooltip={<div>添加个案</div>} />
                <FloatButton icon={<MessageOutlined  />} 
                onClick={(event)=>{
                    setSelectedKey('5')
                }}
                tooltip={<div>新建消息</div>} style={{marginTop:"-3%"}}
                />
                </FloatButton.Group>
               
                </ConfigProvider>
                </Sider>
                <Layout>
                <Content
                    style={{
                    margin: '10px 10px',
                    padding: 24,
                    minHeight: 280,
                    background: colorBgContainer,
                    borderRadius: borderRadiusLG,
                    }}
                >
                    {renderContent()} {/* 根据选中菜单项渲染内容 */}
                </Content>
                </Layout>
                
            </Layout>
            <Footer className='footerBox'
                        style={{
                        display:"flex",
                        justifyContent:"center",
                        alignItems:"center",
                        color:"white",
                        fontSize:"16px"
                        }}
                    >
                        Copyright ©{new Date().getFullYear()} Junxin Li
            </Footer>
            </div>
            </ConfigProvider>
      
    );
}

export default AnalysisModule;