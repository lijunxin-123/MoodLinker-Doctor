import React, { useState, useEffect } from 'react';
import { Button, Col, Form, Row, Select, Space, Table, theme, message } from 'antd';
import PersonalDetail from '../PersonalDetail';

const { Option } = Select;

const columns = (onAction) => [
  {
    title: '姓名',
    dataIndex: 'name',
  },
  {
    title: '年龄',
    dataIndex: 'age',
    defaultSortOrder: 'descend',
    sorter: (a, b) => a.age - b.age,
  },
  {
    title: '性别',
    dataIndex: 'gender',
  },
  {
    title: '邮箱',
    dataIndex: 'email',
  },
  {
    title: '追踪起始日',
    dataIndex: 'accountinitaltime',
    defaultSortOrder: 'descend', // 默认降序排序
    sorter: (a, b) => new Date(a.accountinitaltime) - new Date(b.accountinitaltime),
  },
  {
    title: '地址',
    dataIndex: 'address',
  },
  {
    title: '操作',
    render: (_, record) => (
      <Space>
        <Button type="link" onClick={() => onAction('view', record)}>
          查看
        </Button>
        <Button type="link" onClick={() => onAction('edit', record)}>
          编辑
        </Button>
        <Button type="link" danger onClick={() => onAction('delete', record)}>
          删除
        </Button>
      </Space>
    ),
  },
];

const AdvancedSearchForm = ({ onSearch, patients }) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [selectedPatient, setSelectedPatient] = useState(null);

  const formStyle = {
    maxWidth: 'none',
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    padding: 24,
  };

  // 当patientName变化时更新id字段
  useEffect(() => {
    if (selectedPatient) {
      form.setFieldsValue({ patientId: selectedPatient.id });
    }
  }, [selectedPatient, form]);

  // 当patientId变化时更新name字段
  useEffect(() => {
    const selected = patients.find((patient) => patient.id === form.getFieldValue('patientId'));
    if (selected) {
      form.setFieldsValue({ patientName: selected.name });
    }
  }, [form, patients]);

  const onFinish = (values) => {
    console.log('Search conditions:', values);
    onSearch(values); // 将搜索条件传递给父组件
  };

  return (
    <Form form={form} name="advanced_search" style={formStyle} onFinish={onFinish}>
      <Row gutter={24}>
        {/* 查询患者姓名 */}
        <Col span={8}>
          <Form.Item name="patientName" label="Patient Name">
            <Select
              showSearch
              placeholder="Select a patient name"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
              onChange={(value) => setSelectedPatient(patients.find((patient) => patient.name === value))}
            >
              {patients.map((patient) => (
                <Option key={patient.id} value={patient.name}>
                  {patient.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

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
              onChange={(value) => form.setFieldsValue({ patientName: patients.find((patient) => patient.id === value)?.name })}
            >
              {patients.map((patient) => (
                <Option key={patient.id} value={patient.id}>
                  {patient.id}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <div style={{ textAlign: 'right' }}>
        <Space size="small">
          <Button type="primary" htmlType="submit">
            Search
          </Button>
          <Button onClick={() => form.resetFields()}>Clear</Button>
        </Space>
      </div>
    </Form>
  );
};

const PatientList = ({ data, onAction }) => {
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
  const [pagination, setPagination] = useState({
    current: 1, // 默认当前页
    pageSize: 10, // 默认每页条数
  });

  const handleTableChange = (page, pageSize) => {
    setPagination({ current: page, pageSize }); // 更新分页状态
    // 这里可以添加数据请求逻辑，如从后端获取对应页的数据
  };
  
  return (
    <Table
      rowSelection={rowSelection}
      columns={columns(onAction)}
      dataSource={data}
      rowKey="id"
      style={{ marginTop: 16 }}
      
      pagination={{
        pageSize: 6, // 每页显示的条目数
        current: pagination.current, // 当前页
        onChange: handleTableChange, // 分页改变的回调函数
      }}
    
    />
  );
};

const PatientManagement = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null); // 管理选中的患者
  const doctorId = localStorage.getItem('doctor_id'); // 从本地存储获取医生 ID
  const [loading, setLoading] = useState(true); // 加载状态
  const [error, setError] = useState(null); // 错误信息

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/doctor/${doctorId}/patients`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        const patientData = data.patients.map((patient) => {
          const birthdate = new Date(patient.birthdate);
          const age = new Date().getFullYear() - birthdate.getFullYear();

          return {
            id: patient.id || "Unknown",
            name: patient.username || "N/A",
            age: isNaN(age) ? "Unknown" : age,
            address: patient.address || "杭州师范大学",
            accountinitaltime: patient.created_at || "N/A",
            email: patient.email || "N/A",
            gender: patient.gender || "Unknown",
          };
        });
        setPatients(patientData);
        setFilteredData(patientData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [doctorId]);

  const handleSearch = (values) => {
    const { patientName, patientId } = values;

    const filtered = patients.filter((patient) => {
      const matchesName = !patientName || patient.name === patientName;
      const matchesId = !patientId || patient.id === patientId;
      return matchesName && matchesId;
    });

    setFilteredData(filtered);
  };

  const handleAction = (action, record) => {
    if (action === 'view') {
      message.info(`Viewing details for ${record.name}`);
      setSelectedPatient(record);  // 选中的患者详情
    } else if (action === 'edit') {
      message.info(`Editing record for ${record.name}`);
    } else if (action === 'delete') {
      message.success(`Deleted record for ${record.name}`);
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
    <>
      {selectedPatient==null&&<AdvancedSearchForm onSearch={handleSearch} patients={patients || []} />}
      {selectedPatient==null&&<PatientList data={filteredData || []} onAction={handleAction} />}
      {selectedPatient && <PersonalDetail user={selectedPatient}/>}
    </>
  );
};

export default PatientManagement;
