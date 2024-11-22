import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ConfigProvider, Form, Input, message } from 'antd';
import './Register.css'; // 导入CSS文件

function Register() {
    const [form] = Form.useForm();
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onFinish = async (values) => {
        const { username, email, phonenumber,password, confirmPassword } = values;

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/api/doctor_register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, email,phonenumber }),
            });

            if (response.ok) {
                const result = await response.json();
                message.success(result.message); // 使用antd的message显示成功提示
                navigate('/login'); // 注册成功后跳转到登录页面
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('An error occurred while registering');
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h2>医生注册</h2>
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
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        label="用户名"
                        name="username"
                        rules={[{ required: true, message: 'Please enter your username' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="邮箱"
                        name="email"
                        rules={[
                            { required: true, message: 'Please enter your email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="手机号"
                        name="phonenumber"
                        rules={[
                            { required: true, message: 'Please enter your phonenumber' },
                            { type: 'phonenumber', message: 'Please enter a valid phonenumber' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="密码"
                        name="password"
                        rules={[{ required: true, message: 'Please enter your password' }]}
                    >
                            <Input.Password />
                        
                        
                    </Form.Item>
                    

                    <Form.Item
                        label="确认密码"
                        name="confirmPassword"
                        rules={[
                            { required: true, message: 'Please confirm your password' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject('Passwords do not match');
                                }
                            })
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    {error && <p className="error">{error}</p>}

                    <Form.Item>
                        <Button style={{width:"50%",backgroundColor:"#7EA42D"}} type="primary" htmlType="submit">
                            注册
                        </Button>
                    </Form.Item>
                </Form>
                </ConfigProvider>
            </div>
        </div>
    );
}

export default Register;
