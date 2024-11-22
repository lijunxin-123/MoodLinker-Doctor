import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Alert, ConfigProvider } from 'antd';
import 'antd/dist/reset.css'; // 导入 Ant Design 样式
import './Login.css'; // 导入自定义 CSS 文件

function Login() {
    const [form] = Form.useForm();
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/doctor_login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                const result = await response.json();
                console.log(result.message); // 可以在控制台查看结果
                console.log(result.doctor_id); // 可以在控制台查看结果
                localStorage.setItem('doctor_id', result.doctor_id); // 使用 result.user_id
                navigate('/choose'); // 
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Login failed');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('An error occurred while logging in');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2 style={{marginTop:'10px'}}>心理健康可视化<br/>管理系统</h2>
                <ConfigProvider
                            theme={{
                                components: {
                                Input: {
                                    activeBorderColor:"#7EA42D",
                                    hoverBorderColor:"#7EA42D"
                                },
                                },
                            }}
                            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                    
                >
                    <Form.Item
                        name="username"
                        label="Username"
                        style={{ textAlign: 'left' }} // 使内容靠左对齐
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Input style={{ width: '100%' }}/>
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        style={{ textAlign: 'left' }} // 使内容靠左对齐
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password style={{ width: '100%' }}/>
                    </Form.Item>
                    <div className="form-footer">
                    <Form.Item
                    style={{ textAlign: 'left' }} // 使内容靠左对齐
                    >
                        <Button type="primary" htmlType="submit" style={{backgroundColor: "#7EA42D"}}>
                            登录
                        </Button>
                    </Form.Item>

                    {error && (
                        <Form.Item
                        style={{ textAlign: 'left' }} 
                        >
                            <Alert message={error} type="error" showIcon />
                        </Form.Item>
                    )}
                    
                    <div className="register-link">
                    <h6>如果你还没有账户?</h6>
                    <Button style={{marginRight:"-10px",backgroundColor: "#7EA42D", color:"white"}} type="link" onClick={() => navigate('/register')}>
                        Register
                    </Button>
                    </div>
                    </div>
                </Form>
                </ConfigProvider>
            </div>
        </div>
    );
}

export default Login;
