import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Button, 
  Collapse, 
  Spin, 
  Empty, 
  Space, 
  Tag, 
  Popconfirm, 
  message,
  Typography,
  Row,
  Col,
  Avatar,
  Divider,
  Tooltip
} from 'antd';
import { 
  CalendarOutlined, 
  DollarOutlined, 
  UserOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  EnvironmentOutlined,
  HeartOutlined,
  ClockCircleOutlined,
  RightOutlined,
  BulbOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from 'react-router-dom';
import './Trips.css';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

function Trips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:8000/trips/listtrips', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setTrips(data);
      } catch (err) {
        console.error(err);
        message.error('加载行程失败');
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const handleDelete = async (tripId) => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:8000/trips/${tripId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      message.success('行程删除成功');
      setTrips(trips.filter(t => t.id !== tripId));
    } catch (err) {
      message.error('删除失败：' + err.message);
    }
  };

  const handleViewDetails = (tripId, event) => {
    event.stopPropagation();
    navigate(`/trips/${tripId}`);
  };

  const handlePanelChange = (key) => {
    setActiveKey(key);
  };

  const getDestinationAvatar = (destination) => {
    if (!destination) return '🌍';
    const firstChar = destination.charAt(0).toUpperCase();
    const emojiMap = {
      '北': '🏙️', '上': '🏙️', '广': '🏙️', '深': '🏙️', 
      '杭': '🏞️', '苏': '🏞️', '南': '🏞️', '成': '🌶️',
      '重': '🌶️', '西': '🏯', '昆': '🌸', '厦': '🏝️',
      '青': '🌊', '大': '🏖️', '三': '🏝️', '海': '🌴'
    };
    return emojiMap[firstChar] || '✈️';
  };

  // 处理偏好文本
  const formatPreferences = (preferences) => {
    if (!preferences) return [];
    if (Array.isArray(preferences)) return preferences;
    if (typeof preferences === 'string') {
      return preferences.split(',').map(p => p.trim()).filter(p => p);
    }
    return [];
  };

  if (loading) {
    return (
      <div className="trips-loading">
        <Spin size="large" tip="加载行程中...">
          <div className="loading-content" />
        </Spin>
      </div>
    );
  }

  if (!trips.length) {
    return (
      <div className="trips-empty">
        <Empty 
          image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
          description={
            <div>
              <div style={{ marginBottom: 8, fontSize: 16, color: '#262626' }}>
                暂无行程记录
              </div>
              <div style={{ fontSize: 14, color: '#8c8c8c' }}>
                开始规划您的第一次旅行吧！
              </div>
            </div>
          }
        >
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate('/')}
            className="empty-action-btn"
          >
            开始规划行程
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="trips-container">
      {/* 头部 */}
      <div className="trips-header">
        <Title level={2} className="trips-title">
          <HeartOutlined style={{ color: '#ff4d4f', marginRight: 12 }} />
          我的行程
        </Title>
        <Text type="secondary" className="trips-subtitle">
          共 {trips.length} 个行程记录
        </Text>
      </div>

      {/* 行程列表 */}
      <div className="trips-list">
        <Collapse 
          accordion
          activeKey={activeKey}
          onChange={handlePanelChange}
          expandIcon={({ isActive }) => (
            <RightOutlined rotate={isActive ? 90 : 0} />
          )}
          expandIconPosition="end"
          className="custom-collapse"
        >
          {trips.map((trip) => {
            const preferenceList = formatPreferences(trip.preferences);
            
            return (
              <Panel 
                key={trip.id}
                header={
                  <div className="trip-header">
                    <Avatar 
                      size={48}
                      icon={getDestinationAvatar(trip.destination)}
                      className="trip-avatar"
                    />
                    <div className="trip-info">
                      <div className="trip-destination">
                        <EnvironmentOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                        {trip.destination}
                      </div>
                      <div className="trip-meta">
                        <Space size={[8, 4]} wrap>
                          <Tag icon={<CalendarOutlined />} color="blue" className="trip-tag">
                            {trip.dates}
                          </Tag>
                          <Tag icon={<DollarOutlined />} color="green" className="trip-tag">
                            ¥{trip.budget}
                          </Tag>
                          <Tag icon={<UserOutlined />} color="orange" className="trip-tag">
                            {trip.travelers}人
                          </Tag>
                        </Space>
                      </div>
                    </div>
                    <div className="trip-actions">
                      <Tooltip title="查看详情">
                        <Button 
                          type="primary" 
                          icon={<EyeOutlined />}
                          onClick={(e) => handleViewDetails(trip.id, e)}
                          className="view-btn"
                        >
                          查看详情
                        </Button>
                      </Tooltip>
                      <Popconfirm 
                        title="确定要删除此行程吗？"
                        description="删除后将无法恢复"
                        onConfirm={() => handleDelete(trip.id)}
                        okText="确定"
                        cancelText="取消"
                        okType="danger"
                      >
                        <Tooltip title="删除行程">
                          <Button 
                            icon={<DeleteOutlined />}
                            danger
                            className="delete-btn"
                          >
                            删除
                          </Button>
                        </Tooltip>
                      </Popconfirm>
                    </div>
                  </div>
                }
                className="trip-panel"
              >
                <div className="trip-details">
                  {/* 行程标题 */}
                  <Card 
                    title={
                      <span>
                        <FileTextOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                        行程标题
                      </span>
                    } 
                    size="small"
                    className="detail-card"
                  >
                    <div className="detail-content-full">
                      <Text strong style={{ fontSize: '16px', color: '#262626' }}>
                        {trip.title || '未命名行程'}
                      </Text>
                    </div>
                  </Card>

                  {/* 行程摘要 */}
                  <Card 
                    title={
                      <span>
                        <BulbOutlined style={{ color: '#faad14', marginRight: 8 }} />
                        行程摘要
                      </span>
                    } 
                    size="small"
                    className="detail-card"
                    style={{ marginTop: 16 }}
                  >
                    <div className="detail-content-full">
                      <Paragraph 
                        style={{ 
                          margin: 0, 
                          lineHeight: 1.6,
                          color: '#595959'
                        }}
                      >
                        {trip.summary || '暂无行程摘要'}
                      </Paragraph>
                    </div>
                  </Card>

                  {/* 旅行偏好 */}
                  <Card 
                    title={
                      <span>
                        <HeartOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                        旅行偏好
                      </span>
                    } 
                    size="small"
                    className="detail-card"
                    style={{ marginTop: 16 }}
                  >
                    <div className="detail-content-full">
                      {preferenceList.length > 0 ? (
                        <div className="preferences-container">
                          {trip.preferences}
                         
                        
                        </div>
                      ) : (
                        <Text type="secondary" className="no-preferences">
                          暂无偏好设置
                        </Text>
                      )}
                    </div>
                  </Card>

                  {/* 创建时间 */}
                  <Card 
                    title={
                      <span>
                        <ClockCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        创建信息
                      </span>
                    } 
                    size="small"
                    className="detail-card"
                    style={{ marginTop: 16 }}
                  >
                    <div className="detail-content-full">
                      <div className="time-info">
                        <div className="time-item">
                          <Text strong>创建时间：</Text>
                          <Text type="secondary">
                            {dayjs(trip.created_at).format('YYYY年MM月DD日 HH:mm')}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  <Divider />
                  
                  <div className="trip-actions-bottom">
                    <Button 
                      type="primary" 
                      size="large"
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      className="view-detail-btn"
                    >
                      查看完整行程详情
                    </Button>
                  </div>
                </div>
              </Panel>
            );
          })}
        </Collapse>
      </div>
    </div>
  );
}

export default Trips;