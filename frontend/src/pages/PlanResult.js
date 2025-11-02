import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Space,
  Divider,
  Timeline,
  Statistic,
  message,
  Tabs,
  Badge,
  Progress,
} from 'antd';
import {
  EnvironmentOutlined,
  DollarOutlined,
  CalendarOutlined,
  AimOutlined,
  LeftOutlined,
  SaveOutlined,
  BulbOutlined,
  HeartOutlined,
  ShareAltOutlined,
  StarOutlined,
} from '@ant-design/icons';
import MiniItineraryMap from '../components/MiniItineraryMap';
import './PlanResult.css';
import api from '../api';

const { Title, Text, Paragraph } = Typography;

export default function PlanResult() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const plan = state?.planData;
  const formData = state?.formData;
  const [activeDay, setActiveDay] = useState(1);
  const [saved, setSaved] = useState(false);
  console.log(formData)
  if (!plan) {
    return (
      <div className="plan-result-empty">
        <div className="empty-illustration">
          <div className="empty-icon">🗺️</div>
          <Title level={3} className="empty-title">暂无行程数据</Title>
          <Paragraph className="empty-description">
            看起来您还没有生成任何行程计划，让我们开始规划您的完美旅程吧！
          </Paragraph>
          <Button type="primary" size="large" onClick={() => navigate('/')}>
            开始规划
          </Button>
        </div>
      </div>
    );
  }

  /* 保存入库 */
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await api.post('http://localhost:8000/trips/save', {
        destination: plan.destination,
        dates: String(plan.dates),
        budget: String(plan.total_budget),
        travelers: String(plan.travelers),
        preferences: plan.preferences,
        summary: plan.summary,
        title: plan.title,
        plan: JSON.stringify(plan),
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      //  if (!res.ok) {
      //   // 4xx/5xx 都进这里
      //   const detail = await res.text();
      //   throw new Error(detail || `请求失败 ${res.status}`);
      // }
      message.success('行程已保存到云端 ✨');
      setSaved(true);
      
      // 安全跳转 - 先清理再跳转
      const safeNavigate = () => {
        // 强制清理所有可能的地图实例
        if (window.AMap && typeof window.AMap.Map === 'function') {
          // 找到所有地图容器并清空
          const mapContainers = document.querySelectorAll('[id^="mini-map-"]');
          mapContainers.forEach(container => {
            container.innerHTML = '';
          });
          
          // 给DOM一些时间更新
          setTimeout(() => {
            navigate('/trips');
          }, 50);
        } else {
          navigate('/trips');
        }
      };
      
      safeNavigate();


    } catch (e) {
      message.error('保存失败：' + e.message);
    }
  };

 

  const FooterActions = () => (
    <div className="footer-actions">
      <Space size="large">
        {/* <Button 
          icon={<LeftOutlined />} 
          onClick={() => navigate(-1)}
          className="action-btn"
        >
          返回修改
        </Button> */}
        <Button
        icon={<LeftOutlined />}
        onClick={() =>
          navigate('/home', {
            state: {
              prefill: {
                destination: formData.destination,
                dates: formData.dates,
                budget: formData.budget,
                travelers: formData.travelers,
                preferences: formData.preferences
              }
            }
          })
        }
      >
        返回修改
      </Button>
        <Button 
          type="primary" 
          icon={<SaveOutlined />} 
          onClick={handleSave}
          disabled={saved}
          className="action-btn save-btn"
        >
          保存行程
          {/* {saved ? '已保存' : '保存行程'} */}
        </Button>
      
      </Space>
    </div>
  );

  /* 类型配色 & 文案 */
  const typeMap = (t) =>
    ({ 
      attraction: 'gold', 
      dining: 'volcano', 
      transport: 'blue', 
      accommodation: 'green', 
      shopping: 'purple', 
      culture: 'cyan' 
    }[t] || 'default');
    
  const typeText = (t) =>
    ({ 
      attraction: '景点', 
      dining: '餐饮', 
      transport: '交通', 
      accommodation: '住宿', 
      shopping: '购物', 
      culture: '文化' 
    }[t] || '其他');

  /* 单天时间轴 */
  const DayTimeline = ({ day }) => {
    const timelineItems = day.schedule.map((s, idx) => ({
      label: (
        <div className="timeline-time">
          <Badge color={typeMap(s.type)} />
          <Text className="time-text">{s.time}</Text>
        </div>
      ),
      children: (
        <Card 
          size="small" 
          className="activity-card"
          styles={{
            body: { padding: '12px 16px' }
          }}
        >
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <div className="activity-header">
              <Text strong className="activity-title">{s.activity}</Text>
              <Tag 
                color={typeMap(s.type)} 
                className="type-tag"
              >
                {typeText(s.type)}
              </Tag>
            </div>
            
            <Space>
              <EnvironmentOutlined className="location-icon" />
              <Text className="location-text">{s.location}</Text>
            </Space>
            
            {s.address && (
              <Text type="secondary" className="address-text">
                {s.address}
              </Text>
            )}
            
            <div className="activity-footer">
              {(
                <Space size="small">
                  <DollarOutlined style={{ color: '#52c41a' }} />
                  <Text className="cost-text">¥{s.cost}</Text>
                </Space>
              )}
              {s.duration && (
                <Space size="small">
                  <CalendarOutlined style={{ color: '#1890ff' }} />
                  <Text className="duration-text">{s.duration}</Text>
                </Space>
              )}
            </div>
          </Space>
        </Card>
      ),
      color: typeMap(s.type),
    }));

    return (
      <Card 
        className="day-timeline-card"
        title={
          <div className="day-header">
            <span className="day-title">第 {day.day} 天行程</span>
            <Statistic
              prefix="当日预算：¥"
              value={day.daily_budget}
              valueStyle={{ fontSize: 16, color: '#52c41a' }}
              className="day-budget"
            />
          </div>
        }
      >
        <Timeline
          mode="left"
          className="custom-timeline"
          items={timelineItems}
        />
      </Card>
    );
  };

  // 计算预算使用情况
  const budgetUsage = formData?.budget 
    ? (plan.total_budget / formData.budget) * 100 
    : 100;

  // 生成 Tabs 配置项（修复弃用警告）
  const tabItems = plan.daily_itinerary.map((d) => ({
    label: (
      <span className="tab-label">
        <Badge count={d.schedule.length} size="small" />
        第 {d.day} 天
      </span>
    ),
    key: String(d.day),
    children: <DayTimeline day={d} />,
  }));

  return (
    <div className="plan-result-container">
      {/* 头部横幅 */}
      <div className="plan-header-banner">
        <div className="banner-content">
          <Title level={1} className="plan-main-title">{plan.title}</Title>
          <Paragraph className="plan-subtitle">{plan.summary}</Paragraph>
          <Space size={[16, 8]} wrap className="plan-stats">
            <Tag icon={<CalendarOutlined />} color="blue" className="stat-tag">
              {plan.daily_itinerary.length} 天行程
            </Tag>
            <Tag icon={<DollarOutlined />} color="green" className="stat-tag">
              总预算 ¥{plan.total_budget}
            </Tag>
            {formData?.travelers && (
              <Tag icon={<HeartOutlined />} color="red" className="stat-tag">
              人数：  {plan.travelers} 
              </Tag>
            )}
          </Space>
        </div>
      </div>

      <Card className="main-content-card">
        {/* 预算进度条
        {formData?.budget && (
          <div className="budget-progress">
            <div className="budget-info">
              <Text>预算使用情况</Text>
              <Text strong>¥{plan.total_budget} / ¥{formData.budget}</Text>
            </div>
            <Progress 
              percent={Math.min(budgetUsage, 100)} 
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              showInfo={false}
            />
          </div>
        )} */}

        <Row gutter={[32, 24]}>
          {/* 左侧：按天 Tab */}
          <Col xs={24} lg={12}>
            <Card className="timeline-section">
              <Tabs
                activeKey={String(activeDay)}
                onChange={(k) => setActiveDay(Number(k))}
                type="card"
                className="day-tabs"
                items={tabItems}
              />
            </Card>
          </Col>

          {/* 右侧：地图和摘要 */}
          <Col xs={24} lg={12}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              {/* 地图卡片 */}
              <Card 
                className="map-card"
                title={
                  <Space>
                    <AimOutlined style={{ color: '#1890ff' }} />
                    <span>第 {activeDay} 天路线图</span>
                  </Space>
                }
              >
                <MiniItineraryMap plan={plan} dayFilter={activeDay} />
              </Card>

              {/* 行程摘要 */}
              <Card 
                title="行程摘要" 
                size="small"
                className="summary-card"
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {plan.daily_itinerary.map((day) => (
                    <div 
                      key={day.day}
                      className={`day-summary ${activeDay === day.day ? 'active' : ''}`}
                      onClick={() => setActiveDay(day.day)}
                    >
                      <Text strong>第 {day.day} 天</Text>
                      <div className="day-stats">
                        <Text type="secondary">{day.schedule.length} 个活动</Text>
                        <Text type="secondary">¥{day.daily_budget}</Text>
                      </div>
                    </div>
                  ))}
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>

        {/* 小贴士 */}
        {plan.tips?.length > 0 && (
          <Card className="tips-card">
            <Divider orientation="left">
              <BulbOutlined style={{ color: '#faad14' }} />
              <span style={{ marginLeft: 8 }}>旅行小贴士</span>
            </Divider>
            <div className="tips-list">
              {plan.tips.map((t, i) => (
                <div key={i} className="tip-item">
                  <StarOutlined className="tip-icon" />
                  <Text>{t}</Text>
                </div>
              ))}
            </div>
          </Card>
        )}

        <FooterActions />
      </Card>
    </div>
  );
}

