import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, message } from 'antd';

function PasswordChange() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const doctorId = localStorage.getItem('doctor_id'); // 从本地存储获取医生 ID

    const onFinish = async (values) => {
        const { oldPassword, newPassword } = values;

        setLoading(true); // 开启加载状态
        try {
            const response = await fetch('http://127.0.0.1:5000/api/update_doctor_password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ doctorId, oldPassword, newPassword }),
            });

            if (response.ok) {
                const result = await response.json();
                message.success(result.message); // 显示成功提示
                form.resetFields(); // 重置表单
            } else {
                const errorData = await response.json();
                message.error(errorData.error || 'Password change failed');
            }
        } catch (err) {
            console.error('Error:', err);
            message.error('An error occurred while changing password');
        } finally {
            setLoading(false); // 关闭加载状态
        }
    };

    return (
        <div style={{ width: "100%", height: "100%", display: 'flex', justifyContent: "center", alignItems: 'center', flexDirection: "column" }}>
            <Form
                form={form}
                onFinish={onFinish}
                layout="vertical"
                style={{ width: '80%' }}
            >
                <Form.Item
                    label="原密码"
                    name="oldPassword"
                    rules={[{ required: true, message: 'Please enter your current password' }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    label="新密码"
                    name="newPassword"
                    rules={[{ required: true, message: 'Please enter your new password' }]}
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
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Passwords do not match'));
                            },
                        }),
                    ]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        确认修改
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default PasswordChange;
