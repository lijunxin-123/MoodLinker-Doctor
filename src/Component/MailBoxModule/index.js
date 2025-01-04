
import React, { useState, useEffect } from 'react';
import { Button, Col, Form, Row, Select, Space, Table, theme, message } from 'antd';
import PersonalDetail from '../AnalysisModule/PersonalDetail';
import ReplayBox from './ReplayBox';

const { Option } = Select;

const columns = (onAction) => [
  {
    title: '患者ID',
    dataIndex: 'identity',
  },
  {
    title: '时间',
    dataIndex: 'time',
  },
  {
    title: '消息内容',
    dataIndex: 'message',
  },
  
  {
    title: '操作',
    render: (_, record) => (
      <Space>
        <Button type="link" onClick={() => onAction('回复', record)}>
          回复
        </Button>
        <Button type="link" onClick={() => onAction('删除', record)}>
          删除
        </Button>
      </Space>
    ),
  },
];
const columns2 = (onAction) => [
    {
      title: '患者ID',
      dataIndex: 'identity',
    },
    {
      title: '时间',
      dataIndex: 'time',
    },
    {
      title: '消息内容',
      dataIndex: 'message',
    },
    
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => onAction('查看', record)}>
            查看
          </Button>
          <Button type="link" onClick={() => onAction('删除', record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];
const AdvancedSearchForm = ({ onSearch, patients }) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();

  const formStyle = {
    maxWidth: 'none',
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    padding: 24,
  };


  const onFinish = (values) => {
    console.log('Search conditions:', values);
    onSearch(values); // 将搜索条件传递给父组件
  };

  const uniquePatients = Array.from(new Map(patients.map(patient => [patient.identity, patient])).values());
  return (
    <Form form={form} name="advanced_search" style={formStyle} onFinish={onFinish}>
      <Row gutter={24}>
        {/* 查询患者ID */}
        <Col span={8}>
          <Form.Item name="patientId" label="Patient ID">
            <Select
              showSearch
              placeholder="Select a patient ID"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {uniquePatients.map((patient) => (
                <Option key={patient.identity} value={patient.identity}>
                  {patient.identity}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <div style={{ textAlign: 'right' }}>
        <Space size="small">
          <Button type="primary" htmlType="submit">
            查询
          </Button>
          <Button onClick={() => form.resetFields()}>重置</Button>
        </Space>
      </div>
    </Form>
  );
};

const PatientList = ({ data, onAction,columns }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  

  const onSelectChange = (newSelectedRowKeys) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: 'odd',
        text: 'Select Odd Row',
        onSelect: (changeableRowKeys) => {
          const newSelectedRowKeys = changeableRowKeys.filter((_, index) => index % 2 === 0);
          setSelectedRowKeys(newSelectedRowKeys);
        },
      },
      {
        key: 'even',
        text: 'Select Even Row',
        onSelect: (changeableRowKeys) => {
          const newSelectedRowKeys = changeableRowKeys.filter((_, index) => index % 2 !== 0);
          setSelectedRowKeys(newSelectedRowKeys);
        },
      },
    ],
  };

  return (
    <Table
      rowSelection={rowSelection}
      columns={columns(onAction)}
      dataSource={data}
      rowKey="id"
      style={{overflow:'auto' }}
    />
  );
};

const MailBoxModule = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [filteredData2, setFilteredData2] = useState([]);
  const [patients, setPatients] = useState([]);
  const [replyed_patients, setReplyedPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null); // 管理选中的患者
  const [selectedPatient2, setSelectedPatient2] = useState(null); // 管理选中的患者
  const doctorId = localStorage.getItem('doctor_id'); // 从本地存储获取医生 ID
  const [loading, setLoading] = useState(true); // 加载状态
  const [error, setError] = useState(null); // 错误信息

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response2=await fetch(`http://127.0.0.1:5000/messages/doctor/${doctorId}`);
        if (!response2.ok) {
          throw new Error(`Error: ${response2.status} - ${response2.statusText}`);
        }

        const data2=await response2.json();
        console.log(data2)
        const patientData = data2.new_messages.map((patient) => {
            // 如果有消息，取最新的消息内容
            const latestMessage = patient.content.length > 0 ? patient.content : "N/A";
            return {
                id:patient.id|| "Unknown",
                identity: patient.sender_id || "Unknown",
                message: latestMessage || "N/A",
                time: patient.created_at || "Unknown",
            };
        });
        const replyedPatientData = data2.replyed_messages.map((patient) => {
            // 如果有消息，取最新的消息内容
            const latestMessage = patient.content.length > 0 ? patient.content : "N/A";
            return {
                id:patient.id|| "Unknown",
                identity: patient.sender_id || "Unknown",
                message: latestMessage || "N/A",
                time: patient.created_at || "Unknown",
            };
        });
        setPatients(patientData);
        setReplyedPatients(replyedPatientData)
        setFilteredData(patientData);
        setFilteredData2(replyedPatientData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [doctorId]);

  const handleSearch = (values) => {
    const { patientId } = values;
    const filtered = patients.filter((patient) => {
      return !patientId || patient.identity === patientId;
    });
    const filtered2 = replyed_patients.filter((patient) => {
        return !patientId || patient.identity === patientId;
      });

    setFilteredData(filtered);
    setFilteredData2(filtered2);
  };

  const handleAction = (action, record) => {
    if (action === '回复') {
      message.info(`Viewing details for ${record.name}`);
      setSelectedPatient(record);  // 选中的患者详情
    } else if (action === '删除') {
      message.info(`Editing record for ${record.name}`);
    } 
  };
  const handleAction2 = (action, record) => {
    if (action === '查看') {
      message.info(`Viewing details for ${record.name}`);
      setSelectedPatient2(record);  // 选中的患者详情
    } else if (action === '删除') {
      message.info(`Editing record for ${record.name}`);
    } 
  };

  // 错误或加载中状态处理
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{overflow:'auto',height:"99%"}}>
      {selectedPatient==null&&selectedPatient2==null&&
      <>
      <AdvancedSearchForm onSearch={handleSearch} patients={patients || []} />
      <h3>新消息</h3>
      <PatientList data={filteredData || []} onAction={handleAction} columns={columns}/>
      <h3>我的回复</h3>
      </>
      }
      {selectedPatient==null&&selectedPatient2==null&&<PatientList data={filteredData2 || []} onAction={handleAction2} columns={columns2}/>}
      {selectedPatient && <ReplayBox user={selectedPatient} ifReply={false}/>}
      {selectedPatient2 && <ReplayBox user={selectedPatient2} ifReply={true}/>}
    </div>
  );
};

export default MailBoxModule;
