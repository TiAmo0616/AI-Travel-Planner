// [file name]: ExpensesPage.js (修复版本)
// [file content begin]
import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Button,
  List,
  Typography,
  Space,
  Tag,
  Statistic,
  Modal,
  Form,
  InputNumber,
  Select,
  DatePicker,
  Input,
  message,
  Popconfirm,
  Row,
  Col,
  Progress,
  Tabs,
  Divider,
  Alert,
  Descriptions,
  Spin
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DollarOutlined,
  AudioOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  BarChartOutlined,
  HistoryOutlined,
  ExportOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import RecordRTC from 'recordrtc';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

function ExpensesPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // 注意：参数名是 id，不是 tripId
  const [expenses, setExpenses] = useState([]);
  const [tripInfo, setTripInfo] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [loading, setLoading] = useState(false);
  const [tripLoading, setTripLoading] = useState(false);
  
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const [form] = Form.useForm();

  // 调试信息
  console.log('URL参数 id:', id);
  console.log('当前tripInfo:', tripInfo);

  // 消费类别选项
  const expenseCategories = [
    '交通-机票', '交通-火车', '交通-出租车', '交通-公交地铁', '交通-租车',
    '住宿-酒店', '住宿-民宿', '住宿-青旅',
    '餐饮-正餐', '餐饮-小吃', '餐饮-饮料', '餐饮-零食',
    '购物-纪念品', '购物-服装', '购物-电子产品', '购物-其他',
    '门票-景点', '门票-博物馆', '门票-演出',
    '娱乐-电影', '娱乐-KTV', '娱乐-游乐场', '娱乐-其他',
    '医疗-药品', '医疗-就诊',
    '其他-保险', '其他-通讯', '其他-小费', '其他'
  ];

  // 颜色映射
  const getCategoryColor = (category) => {
    if (category.includes('交通')) return 'blue';
    if (category.includes('住宿')) return 'purple';
    if (category.includes('餐饮')) return 'red';
    if (category.includes('购物')) return 'orange';
    if (category.includes('门票')) return 'green';
    if (category.includes('娱乐')) return 'cyan';
    if (category.includes('医疗')) return 'volcano';
    return 'default';
  };

  // 加载行程信息和开销数据
  useEffect(() => {
    console.log('useEffect triggered, id:', id);
    loadTripInfo();
    loadExpenses();
  }, [id]); // 依赖 id 而不是 tripId

  // 加载行程信息
  const loadTripInfo = async () => {
    // 如果没有行程ID，说明是独立记录开销
    if (!id) {
      console.log('没有行程ID，使用独立开销模式');
      setTripInfo({
        destination: '独立开销记录',
        dates: '未指定',
        budget: '0',
        travelers: '未知',
        preferences: '无'
      });
      return;
    }

    setTripLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      console.log('加载行程信息，ID:', id);
      
      const response = await axios.get(`http://localhost:8000/trips/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('行程信息加载成功:', response.data);
      setTripInfo(response.data);
    } catch (error) {
      console.error('加载行程信息失败:', error);
      // 如果获取行程信息失败，仍然允许记录开销
      setTripInfo({
        destination: `行程 ${id}`,
        dates: '未知',
        budget: '0',
        travelers: '未知',
        preferences: '无'
      });
      message.warning('行程信息加载失败，但仍可记录开销');
    } finally {
      setTripLoading(false);
    }
  };

  // 加载开销数据
  const loadExpenses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        message.error('请先登录');
        return;
      }

      // 构建请求参数
      const params = id ? { trip_id: id } : {};
      console.log('加载开销数据，参数:', params);

      const response = await axios.get('http://localhost:8000/expenses/', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params
      });
      
      console.log('开销数据加载成功:', response.data);
      setExpenses(response.data);
    } catch (error) {
      console.error('加载开销数据失败:', error);
      if (error.response?.status === 401) {
        message.error('认证失败，请重新登录');
      } else {
        message.error('加载开销数据失败: ' + (error.response?.data?.detail || error.message));
      }
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  // 保存开销记录
  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        message.error('请先登录');
        return;
      }

      const expenseData = {
        ...values,
        date: values.date ? values.date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        trip_id: id || null  // 使用 id 而不是 tripId
      };

      console.log('提交开销数据:', expenseData);

      let response;
      if (editingExpense) {
        response = await axios.put(
          `http://localhost:8000/expenses/${editingExpense.id}`,
          expenseData,
          { 
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
      } else {
        response = await axios.post(
          'http://localhost:8000/expenses/',
          expenseData,
          { 
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
      }

      console.log('保存成功:', response.data);
      await loadExpenses();
      setModalVisible(false);
      setEditingExpense(null);
      form.resetFields();
      setAudioBlob(null);
      message.success(editingExpense ? '更新成功' : '添加成功');
    } catch (error) {
      console.error('保存失败:', error);
      if (error.response?.status === 401) {
        message.error('认证失败，请重新登录');
      } else {
        message.error((editingExpense ? '更新失败: ' : '添加失败: ') + (error.response?.data?.detail || error.message));
      }
    }
  };

  // 删除开销记录
  const deleteExpense = async (expenseId) => {
    try {
      const token = localStorage.getItem('jwt_token');
      await axios.delete(`http://localhost:8000/expenses/${expenseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await loadExpenses();
      message.success('删除成功');
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败: ' + (error.response?.data?.detail || error.message));
    }
  };

  // 编辑开销记录
  const editExpense = (expense) => {
    setEditingExpense(expense);
    form.setFieldsValue({
      ...expense,
      date: expense.date ? dayjs(expense.date) : dayjs()
    });
    setModalVisible(true);
  };

  // 返回上一页
  const handleBack = () => {
    if (id) {
      navigate(`/trips/${id}`);
    } else {
      navigate('/trips');
    }
  };

  // 计算统计信息
  const getStatistics = () => {
    const total = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const byCategory = expenses.reduce((acc, expense) => {
      const category = expense.category || '其他';
      acc[category] = (acc[category] || 0) + (expense.amount || 0);
      return acc;
    }, {});

    const dailyExpenses = expenses.reduce((acc, expense) => {
      const date = expense.date;
      acc[date] = (acc[date] || 0) + (expense.amount || 0);
      return acc;
    }, {});

    return { total, byCategory, dailyExpenses };
  };

  const { total, byCategory, dailyExpenses } = getStatistics();

  // 渲染页面标题和操作
  const renderHeader = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
      <div style={{ flex: 1 }}>
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
            type="text"
          >
            返回
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            💰 {id ? '行程开销管理' : '独立开销记录'}
          </Title>
        </Space>
        
        {tripLoading ? (
          <Spin size="small" style={{ marginLeft: 16 }} />
        ) : tripInfo && (
          <Descriptions size="small" column={4} style={{ marginTop: 8 }}>
            <Descriptions.Item label="目的地" icon={<EnvironmentOutlined />}>
              {tripInfo.destination}
            </Descriptions.Item>
            <Descriptions.Item label="行程天数" icon={<CalendarOutlined />}>
              {tripInfo.dates}
            </Descriptions.Item>
            <Descriptions.Item label="同行人数" icon={<UserOutlined />}>
              {tripInfo.travelers}
            </Descriptions.Item>
            <Descriptions.Item label="总预算" icon={<DollarOutlined />}>
              ¥{tripInfo.budget}
            </Descriptions.Item>
          </Descriptions>
        )}
      </div>
      
      <Space>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          添加开销
        </Button>
      </Space>
    </div>
  );

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Card>
        {renderHeader()}

        {/* 统计概览 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Statistic title="总开销" value={total} prefix="¥" />
          </Col>
          <Col span={6}>
            <Statistic title="记录笔数" value={expenses.length} />
          </Col>
          <Col span={6}>
            <Statistic title="消费天数" value={Object.keys(dailyExpenses).length} />
          </Col>
          <Col span={6}>
            <Statistic 
              title="平均每日" 
              value={Object.keys(dailyExpenses).length > 0 ? Math.round(total / Object.keys(dailyExpenses).length) : 0} 
              prefix="¥" 
            />
          </Col>
        </Row>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* 列表视图 */}
          <TabPane tab={<span><HistoryOutlined />详细记录</span>} key="list">
            {expenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                <DollarOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <div>暂无开销记录</div>
                <Button 
                  type="primary" 
                  style={{ marginTop: 16 }}
                  onClick={() => setModalVisible(true)}
                >
                  开始记录
                </Button>
              </div>
            ) : (
              <List
                loading={loading}
                dataSource={expenses}
                renderItem={(expense) => (
                  <List.Item
                    actions={[
                      <Button 
                        type="link" 
                        icon={<EditOutlined />} 
                        onClick={() => editExpense(expense)}
                      >
                        编辑
                      </Button>,
                      <Popconfirm
                        title="确定要删除这条记录吗?"
                        onConfirm={() => deleteExpense(expense.id)}
                      >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                          删除
                        </Button>
                      </Popconfirm>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <div style={{ textAlign: 'center', minWidth: 60 }}>
                          <DollarOutlined style={{ color: '#52c41a', fontSize: 24, display: 'block' }} />
                          <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                            ¥{expense.amount}
                          </Text>
                        </div>
                      }
                      title={
                        <Space>
                          <Tag color={getCategoryColor(expense.category)}>
                            {expense.category}
                          </Tag>
                          <Text type="secondary">{expense.date}</Text>
                          {expense.location && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              @{expense.location}
                            </Text>
                          )}
                        </Space>
                      }
                      description={
                        <div>
                          <div>{expense.description || '暂无描述'}</div>
                          {expense.participants > 1 && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {expense.participants}人消费
                            </Text>
                          )}
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                            记录于 {dayjs(expense.created_at).fromNow()}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </TabPane>

         
        </Tabs>

        {/* 使用提示 */}
        <Alert
          message="使用提示"
          description={
            <div>
              <div>• {id ? '此页面记录与当前行程相关的开销' : '此页面用于记录独立的开销'}</div>
              <div>• 仅支持手动输入方式</div>
            </div>
          }
          type="info"
          showIcon
          style={{ marginTop: 24 }}
        />
      </Card>

      {/* 添加/编辑开销的模态框 */}
      <Modal
        title={editingExpense ? '编辑开销' : '添加开销'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingExpense(null);
          form.resetFields();
          setAudioBlob(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            category: '交通-机票',
            date: dayjs(),
            amount: 0,
            participants: 1
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="消费类别"
                rules={[{ required: true, message: '请选择消费类别' }]}
              >
                <Select showSearch>
                  {expenseCategories.map(category => (
                    <Option key={category} value={category}>{category}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="金额 (元)"
                rules={[{ required: true, message: '请输入金额' }]}
              >
                <InputNumber
                  min={0}
                  max={1000000}
                  style={{ width: '100%' }}
                  placeholder="请输入金额"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="消费日期"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="participants"
                label="消费人数"
              >
                <InputNumber
                  min={1}
                  max={100}
                  style={{ width: '100%' }}
                  placeholder="参与消费的人数"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="location"
            label="消费地点"
          >
            <Input placeholder="消费发生的具体地点" />
          </Form.Item>

          <Form.Item
            name="description"
            label="消费描述"
          >
            <TextArea
              rows={3}
              placeholder="详细描述这笔开销..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingExpense(null);
                form.resetFields();
                setAudioBlob(null);
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingExpense ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ExpensesPage;
// [file content end]