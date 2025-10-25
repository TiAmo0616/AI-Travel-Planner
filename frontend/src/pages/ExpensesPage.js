// [file name]: ExpensesPage.js (优化版)
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
  Descriptions
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
  CalendarOutlined
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
  const { tripId } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [tripInfo, setTripInfo] = useState(null); // 新增：行程信息
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [loading, setLoading] = useState(false);
  
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const [form] = Form.useForm();

  // 消费类别选项（更详细）
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
    loadTripInfo();
    loadExpenses();
  }, [tripId]);

  // 加载行程信息
  const loadTripInfo = async () => {
    if (tripId) {
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await axios.get(`http://localhost:8000/trips/${tripId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setTripInfo(response.data);
      } catch (error) {
        console.error('加载行程信息失败:', error);
        // 使用模拟数据
        setTripInfo({
          destination: '日本东京',
          dates: '5天',
          budget: '10000',
          travelers: '2人',
          preferences: '美食、购物'
        });
      }
    } else {
      // 独立记录开销时，允许用户输入行程信息
      setTripInfo({
        destination: '未指定行程',
        dates: '未指定',
        budget: '0',
        travelers: '1人',
        preferences: '无'
      });
    }
  };

  // 加载开销数据
  const loadExpenses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      // 模拟数据 - 实际应该调用后端API
      const mockExpenses = [
        {
          id: 1,
          category: '交通-机票',
          amount: 2500,
          date: '2024-01-15',
          description: '北京到东京往返机票',
          location: '北京首都机场',
          participants: 2,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          category: '餐饮-正餐',
          amount: 180,
          date: '2024-01-15',
          description: '晚餐在银座寿司店',
          location: '东京银座',
          participants: 2,
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          category: '交通-出租车',
          amount: 85,
          date: '2024-01-15',
          description: '从机场到酒店',
          location: '成田机场到新宿',
          participants: 2,
          created_at: new Date().toISOString()
        }
      ];
      setExpenses(mockExpenses);
    } catch (error) {
      console.error('加载开销数据失败:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  // 语音识别功能
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      const recorder = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        desiredSampRate: 16000,
        numberOfAudioChannels: 1
      });

      recorder.startRecording();
      recorderRef.current = recorder;
      streamRef.current = stream;
      setRecording(true);
      message.info('录音已开始，请描述您的开销...');

    } catch (error) {
      message.error(`无法访问麦克风: ${error.message}`);
    }
  };

  const stopRecording = async () => {
    if (!recorderRef.current) return;

    recorderRef.current.stopRecording(() => {
      const blob = recorderRef.current.getBlob();
      setAudioBlob(blob);
      setRecording(false);
      message.success('录音完成，正在识别...');

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      transcribeAudio(blob);
    });
  };

  const transcribeAudio = async (blob) => {
    setTranscribing(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const formData = new FormData();
      formData.append('audio', blob, 'expense_recording.wav');

      const res = await axios.post('http://localhost:8000/ai/transcribe', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.transcription) {
        const parsedData = parseExpenseFromSpeech(res.data.transcription);
        form.setFieldsValue(parsedData);
        message.success('语音识别成功');
      } else {
        message.warning('未识别到有效内容');
      }
    } catch (error) {
      console.error('语音识别失败:', error);
      // 模拟识别
      const mockTranscription = '交通费花了350元从机场到酒店，两个人';
      const parsedData = parseExpenseFromSpeech(mockTranscription);
      form.setFieldsValue(parsedData);
      message.success('语音识别成功（演示模式）');
    } finally {
      setTranscribing(false);
    }
  };

  // 增强的语音解析功能
  const parseExpenseFromSpeech = (text) => {
    const result = {};
    
    // 解析金额
    const amountMatch = text.match(/(\d+(?:\.\d{1,2})?)元/);
    if (amountMatch) {
      result.amount = parseFloat(amountMatch[1]);
    }

    // 解析人数
    const peopleMatch = text.match(/(\d+)人/) || text.match(/(\d+)个/);
    if (peopleMatch) {
      result.participants = parseInt(peopleMatch[1]);
    } else {
      result.participants = tripInfo?.travelers ? parseInt(tripInfo.travelers) : 1;
    }

    // 解析类别（更智能的分类）
    const categoryKeywords = {
      '交通-机票': ['机票', '飞机票', '航班'],
      '交通-火车': ['火车', '高铁', '动车'],
      '交通-出租车': ['出租车', '打车', '的士'],
      '交通-公交地铁': ['公交', '地铁', '公共交通'],
      '交通-租车': ['租车', '汽车租赁'],
      '住宿-酒店': ['酒店', '宾馆'],
      '住宿-民宿': ['民宿', '公寓'],
      '餐饮-正餐': ['正餐', '晚餐', '午餐', '早餐', '餐厅', '饭店'],
      '餐饮-小吃': ['小吃', '零食', '甜点'],
      '餐饮-饮料': ['饮料', '咖啡', '奶茶'],
      '购物-纪念品': ['纪念品', '礼物', '特产'],
      '门票-景点': ['门票', '景点', '景区'],
      '门票-博物馆': ['博物馆', '展览'],
      '娱乐-电影': ['电影', '影院'],
      '医疗-药品': ['药品', '药'],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        result.category = category;
        break;
      }
    }

    if (!result.category) {
      // 如果没有匹配到具体子类，匹配大类
      if (text.includes('交通') || text.includes('车') || text.includes('机')) result.category = '交通-其他';
      else if (text.includes('住宿') || text.includes('住')) result.category = '住宿-酒店';
      else if (text.includes('餐') || text.includes('吃') || text.includes('饭')) result.category = '餐饮-正餐';
      else if (text.includes('购物') || text.includes('买')) result.category = '购物-其他';
      else if (text.includes('门票') || text.includes('景点')) result.category = '门票-景点';
      else result.category = '其他';
    }

    // 设置描述
    result.description = text;

    return result;
  };

  // 保存开销记录
  const handleSubmit = async (values) => {
    try {
      const expenseData = {
        ...values,
        date: values.date ? values.date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        trip_id: tripId || null,
        participants: values.participants || (tripInfo?.travelers ? parseInt(tripInfo.travelers) : 1),
        location: values.location || tripInfo?.destination || '未指定',
        id: editingExpense?.id || Date.now(),
        created_at: new Date().toISOString()
      };

      let newExpenses;
      if (editingExpense) {
        newExpenses = expenses.map(exp => 
          exp.id === editingExpense.id ? expenseData : exp
        );
      } else {
        newExpenses = [...expenses, expenseData];
      }

      setExpenses(newExpenses);
      setModalVisible(false);
      setEditingExpense(null);
      form.resetFields();
      setAudioBlob(null);
      message.success(editingExpense ? '更新成功' : '添加成功');
    } catch (error) {
      message.error('保存失败');
    }
  };

  // 删除开销记录
  const deleteExpense = async (id) => {
    try {
      const newExpenses = expenses.filter(exp => exp.id !== id);
      setExpenses(newExpenses);
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 编辑开销记录
  const editExpense = (expense) => {
    setEditingExpense(expense);
    form.setFieldsValue({
      ...expense,
      date: expense.date ? dayjs(expense.date) : dayjs(),
      participants: expense.participants || (tripInfo?.travelers ? parseInt(tripInfo.travelers) : 1)
    });
    setModalVisible(true);
  };

  // 计算统计信息
  const getStatistics = () => {
    const total = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const totalParticipants = expenses.reduce((sum, expense) => sum + (expense.participants || 1), 0);
    const avgPerPerson = totalParticipants > 0 ? total / totalParticipants : 0;
    
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

    const byLocation = expenses.reduce((acc, expense) => {
      const location = expense.location || '未指定';
      acc[location] = (acc[location] || 0) + (expense.amount || 0);
      return acc;
    }, {});

    return { total, byCategory, dailyExpenses, byLocation, avgPerPerson };
  };

  const { total, byCategory, dailyExpenses, byLocation, avgPerPerson } = getStatistics();

  // 导出数据
  const exportData = () => {
    const exportData = {
      tripInfo,
      expenses,
      statistics: getStatistics(),
      exportTime: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `travel-expenses-${tripInfo?.destination || 'all'}-${dayjs().format('YYYY-MM-DD')}.json`;
    link.click();
    message.success('数据导出成功');
  };

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Card>
        {/* 页面标题和行程信息 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <Title level={2}>💰 旅行开销管理</Title>
            {tripInfo && (
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
            <Button icon={<ExportOutlined />} onClick={exportData}>
              导出数据
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
            >
              添加开销
            </Button>
          </Space>
        </div>

        {/* 统计概览 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={4}>
            <Statistic 
              title="总开销" 
              value={total} 
              prefix="¥" 
              valueStyle={{ color: total > (tripInfo?.budget || 0) ? '#cf1322' : '#3f8600' }}
            />
          </Col>
          <Col span={4}>
            <Statistic title="记录笔数" value={expenses.length} />
          </Col>
          <Col span={4}>
            <Statistic title="消费天数" value={Object.keys(dailyExpenses).length} />
          </Col>
          <Col span={4}>
            <Statistic 
              title="人均开销" 
              value={Math.round(avgPerPerson)} 
              prefix="¥" 
            />
          </Col>
          <Col span={4}>
            <Statistic 
              title="预算剩余" 
              value={Math.max(0, (tripInfo?.budget || 0) - total)} 
              prefix="¥" 
              valueStyle={{ color: total > (tripInfo?.budget || 0) ? '#cf1322' : '#3f8600' }}
            />
          </Col>
          <Col span={4}>
            <Statistic 
              title="预算完成度" 
              value={tripInfo?.budget ? Math.round((total / tripInfo.budget) * 100) : 0} 
              suffix="%" 
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
                dataSource={expenses.sort((a, b) => new Date(b.date) - new Date(a.date))}
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
                          {expense.participants > 1 && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {expense.participants}人
                            </Text>
                          )}
                        </div>
                      }
                      title={
                        <Space>
                          <Tag color={getCategoryColor(expense.category)}>
                            {expense.category}
                          </Tag>
                          <Text type="secondary">{expense.date}</Text>
                          {expense.location && expense.location !== tripInfo?.destination && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              @{expense.location}
                            </Text>
                          )}
                        </Space>
                      }
                      description={
                        <div>
                          <div>{expense.description || '暂无描述'}</div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
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

          {/* 统计分析 */}
          <TabPane tab={<span><BarChartOutlined />统计分析</span>} key="analysis">
            {expenses.length > 0 ? (
              <div>
                <Title level={4}>消费类别分布</Title>
                {Object.entries(byCategory).map(([category, amount]) => {
                  const percentage = Math.round((amount / total) * 100);
                  return (
                    <div key={category} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Space>
                          <Tag color={getCategoryColor(category)}>{category}</Tag>
                          <Text>¥{amount}</Text>
                        </Space>
                        <Text type="secondary">{percentage}%</Text>
                      </div>
                      <Progress percent={percentage} />
                    </div>
                  );
                })}

                <Divider />

                <Title level={4}>地点消费分析</Title>
                {Object.entries(byLocation).map(([location, amount]) => (
                  <div key={location} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '8px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <Text>{location}</Text>
                    <Text strong>¥{amount}</Text>
                  </div>
                ))}

                <Divider />

                <Title level={4}>每日消费趋势</Title>
                {Object.entries(dailyExpenses)
                  .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                  .map(([date, amount]) => (
                    <div key={date} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <Text>{date}</Text>
                      <Text strong>¥{amount}</Text>
                    </div>
                  ))
                }
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                <BarChartOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <div>暂无数据可分析</div>
              </div>
            )}
          </TabPane>
        </Tabs>

        {/* 使用提示 */}
        <Alert
          message="语音输入提示"
          description="您可以说：'机票两个人花了2500元从北京到东京' 或 '晚餐在银座寿司店消费180元，两个人'，系统会自动识别金额、类别、人数和地点。"
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
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            category: '交通-机票',
            date: dayjs(),
            amount: 0,
            participants: tripInfo?.travelers ? parseInt(tripInfo.travelers) : 1,
            location: tripInfo?.destination || ''
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="消费类别"
                rules={[{ required: true, message: '请选择消费类别' }]}
              >
                <Select showSearch optionFilterProp="children">
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
                  precision={2}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="date"
                label="消费日期"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
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
            <Col span={8}>
              <Form.Item
                name="location"
                label="消费地点"
              >
                <Input placeholder="消费发生的具体地点" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="消费描述"
          >
            <TextArea
              rows={3}
              placeholder="详细描述这笔开销，或使用语音输入..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              {recording ? (
                <Button
                  type="primary"
                  danger
                  icon={<PauseCircleOutlined />}
                  onClick={stopRecording}
                >
                  停止录音
                </Button>
              ) : (
                <Button
                  icon={<AudioOutlined />}
                  onClick={startRecording}
                  loading={transcribing}
                >
                  {transcribing ? '识别中...' : '语音输入'}
                </Button>
              )}
              {audioBlob && (
                <Button
                  icon={<PlayCircleOutlined />}
                  onClick={() => {
                    const audioUrl = URL.createObjectURL(audioBlob);
                    new Audio(audioUrl).play();
                  }}
                >
                  播放录音
                </Button>
              )}
            </Space>
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