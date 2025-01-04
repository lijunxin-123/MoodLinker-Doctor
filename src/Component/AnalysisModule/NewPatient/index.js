import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, message,Cascader} from 'antd';
import './NewPatient.css'
import { changeAnalysisNumber } from '../../../store/stageSlice';
import { useDispatch } from 'react-redux';

function NewPatient() {
    const [form] = Form.useForm();
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const dispatch=useDispatch();
    const doctorId = localStorage.getItem('doctor_id'); // 从本地存储获取医生 ID
    const onFinish = async (values) => {
        const { username, email,gender,birthdate } = values;
        const password = `${username}${birthdate.replace(/-/g, '')}`;
        

        try {
            const response = await fetch('http://127.0.0.1:5000/api/register_by_doctor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ doctorId,username, password, email,birthdate,gender }),
            });

            if (response.ok) {
                const result = await response.json();
                message.success(result.message); // 使用antd的message显示成功提示
                dispatch(changeAnalysisNumber('2'))
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Registration failed');
                
            }
        } catch (err) {
            console.error('Error:', err);
            setError('An error occurred while registering');
        }
    };
    const residences = [
      {
        value: 'zhejiang',
        label: '浙江',
        children: [
          {
            value: 'hangzhou',
            label: '杭州',
            children: [
              {
                value: 'xihu',
                label: '杭州师范大学',
              },
            ],
          },
        ],
      },]

    return (
        <div style={{width:"100%",height:"100%",display:'flex',justifyContent:"center",alignItems:'center'}}>
            <div className="register-box">
              <h3>个案信息表</h3>
                <Form
                    form={form}
                    onFinish={onFinish}
                    layout="vertical"
                    style={{width:'50%'}}
                >
                    <Form.Item
                        label="个案姓名"
                        name="username"
                        rules={[{ required: true, message: '请输入姓名' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="邮箱"
                        name="email"
                        rules={[
                            { required: true, message: '请输入邮箱' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="性别"
                        name="gender"
                        rules={[
                            { required: true, message: '请输入 男 or 女' },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="出生日期"
                        name="birthdate"
                        rules={[
                            { required: true, message: '请输入出生日期' },
                         
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="年级"
                        name="grade"
                        rules={[
                            { required: true, message: '请输入年级' },
                         
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                    name="address"
                    label="地址"
                    rules={[
                      {
                        type: 'array',
                        required: true,
                        message: 'Please select your habitual residence!',
                      },
                    ]}
                  >
                    <Cascader options={residences} />
                  </Form.Item>

                    {error && <p className="error">{error}</p>}

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            确认添加
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}

export default NewPatient;
