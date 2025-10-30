// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//   Card,
//   Row,
//   Col,
//   Typography,
//   Tag,
//   Button,
//   Space,
//   Divider,
//   Timeline,
//   Statistic,
//   Tabs,
//   Badge,
//   Progress,
//   Spin,
//   message
// } from 'antd';
// import {
//   EnvironmentOutlined,
//   DollarOutlined,
//   CalendarOutlined,
//   AimOutlined,
//   LeftOutlined,
//   BulbOutlined,
//   HeartOutlined,
//   BarChartOutlined,
//   UserOutlined
// } from '@ant-design/icons';
// import MiniItineraryMap from '../components/MiniItineraryMap';
// import './TripDetail.css';

// const { Title, Text, Paragraph } = Typography;
// const { TabPane } = Tabs;

// function TripDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [trip, setTrip] = useState(null);
//   const [planData, setPlanData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeDay, setActiveDay] = useState(1);

//   useEffect(() => {
//     const fetchTrip = async () => {
//       setLoading(true);
//       const token = localStorage.getItem('jwt_token');
//       if (!token) {
//         message.error('请先登录');
//         navigate('/login');
//         return;
//       }
      
//       try {
//         const res = await fetch(`http://localhost:8000/trips/${id}`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
        
//         if (!res.ok) throw new Error('获取行程数据失败');
        
//         const data = await res.json();
//         setTrip(data);
        
//         // 解析 plan 字段
//         if (data.plan) {
//           try {
//             const parsedPlan = typeof data.plan === 'string' ? JSON.parse(data.plan) : data.plan;
//             setPlanData(parsedPlan);
//           } catch (parseError) {
//             console.error('解析行程计划失败:', parseError);
//             message.warning('行程计划数据格式有误');
//           }
//         }
//       } catch (err) {
//         console.error('获取行程详情失败:', err);
//         message.error('加载行程详情失败');
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     if (id) fetchTrip();
//   }, [id, navigate]);

//   // 类型配色 & 文案
//   const typeMap = (t) =>
//     ({ 
//       attraction: 'gold', 
//       dining: 'volcano', 
//       transport: 'blue', 
//       accommodation: 'green', 
//       shopping: 'purple', 
//       culture: 'cyan' 
//     }[t] || 'default');
    
//   const typeText = (t) =>
//     ({ 
//       attraction: '景点', 
//       dining: '餐饮', 
//       transport: '交通', 
//       accommodation: '住宿', 
//       shopping: '购物', 
//       culture: '文化' 
//     }[t] || '其他');

//   // 单天时间轴组件
//   const DayTimeline = ({ day }) => (
//     <Card 
//       className="day-timeline-card"
//       title={
//         <div className="day-header">
//           <span className="day-title">第 {day.day} 天行程</span>
//           <Statistic
//             prefix="当日预算：¥"
//             value={day.daily_budget}
//             valueStyle={{ fontSize: 16, color: '#52c41a' }}
//             className="day-budget"
//           />
//         </div>
//       }
//     >
//       <Timeline
//         mode="left"
//         className="custom-timeline"
//         items={day.schedule?.map((s, idx) => ({
//           label: (
//             <div className="timeline-time" >
//               <Badge color={typeMap(s.type)} />
//               <Text className="time-text">{s.time}</Text>
              
//             </div>
//           ),
//           children: (
//             <Card 
//               size="small" 
//               className="activity-card"
//               styles={{
//                 body: { padding: '12px 16px' }
//               }}
//             >
//               <Space direction="vertical" size={8} style={{ width: '100%' }}>
//                 <div className="activity-header">
//                   <Text strong className="activity-title">{s.activity}</Text>
//                   <Tag 
//                     color={typeMap(s.type)} 
//                     className="type-tag"
//                   >
//                     {typeText(s.type)}
//                   </Tag>
//                 </div>
                
//                 <Space>
//                   <EnvironmentOutlined className="location-icon" />
//                   <Text className="location-text">{s.location}</Text>
//                 </Space>
                
//                 {s.address && (
//                   <Text type="secondary" className="address-text">
//                     ({s.address})
//                   </Text>
//                 )}
//                 <Text type="secondary">{s.description}</Text>
//                 <div className="activity-footer">
//                   {
//                     <Space size="small">
//                       <DollarOutlined style={{ color: '#52c41a' }} />
//                       <Text className="cost-text">¥{s.cost}</Text>
//                     </Space>
//                   }
//                   {s.duration && (
//                     <Space size="small">
//                       <CalendarOutlined style={{ color: '#1890ff' }} />
//                       <Text className="duration-text">{s.duration}</Text>
//                     </Space>
//                   )}
//                 </div>
//               </Space>
//             </Card>
//           ),
//           color: typeMap(s.type),
//         })) || []}
//       />
//     </Card>
//   );

//   // 跳转到开销管理
//   const handleManageExpenses = () => {
//     navigate(`/trips/${id}/expenses`);
//   };

//   // 返回行程列表
//   const handleBack = () => {
//     navigate('/trips');
//   };

//   if (loading) {
//     return (
//       <div className="trip-detail-loading">
//         <Spin size="large" tip="加载行程详情中...">
//           <div className="loading-content" />
//         </Spin>
//       </div>
//     );
//   }

//   if (!trip) {
//     return (
//       <div className="trip-detail-empty">
//         <Card>
//           <div style={{ textAlign: 'center', padding: '48px' }}>
//             <Title level={3}>未找到行程数据</Title>
//             <Paragraph type="secondary">
//               抱歉，无法找到您要查看的行程信息
//             </Paragraph>
//             <Button type="primary" onClick={handleBack}>
//               返回行程列表
//             </Button>
//           </div>
//         </Card>
//       </div>
//     );
//   }

//   // 生成 Tabs 配置项
//   const tabItems = planData?.daily_itinerary?.map((d) => ({
//     label: (
//       <span className="tab-label">
//         <Badge count={d.schedule?.length || 0} size="small" />
//         第 {d.day} 天
//       </span>
//     ),
//     key: String(d.day),
//     children: <DayTimeline day={d} />,
//   })) || [];

//   return (
//     <div className="trip-detail-container">
//       {/* 头部横幅 */}
//       <div className="plan-header-banner">
//         <div className="banner-content">
//           <Title level={1} className="plan-main-title">
//             {trip.destination || '行程详情'}
//           </Title>
//           <Paragraph className="plan-subtitle">
//             {planData?.summary || trip.summary || '暂无行程摘要'}
//           </Paragraph>
//           <Space size={[16, 8]} wrap className="plan-stats">
//             <Tag icon={<CalendarOutlined />} color="blue" className="stat-tag">
//               {planData?.daily_itinerary?.length || 0} 天行程
//             </Tag>
//             <Tag icon={<DollarOutlined />} color="green" className="stat-tag">
//               总预算 ¥{planData?.total_budget || trip.budget}
//             </Tag>
//             <Tag icon={<UserOutlined />} color="orange" className="stat-tag">
//               {trip.travelers} 人同行
//             </Tag>
//             {trip.preferences && (
//               <Tag icon={<HeartOutlined />} color="red" className="stat-tag">
//                 {trip.preferences}
//               </Tag>
//             )}
//           </Space>
//         </div>
//       </div>

//       <Card className="main-content-card">
//         {/* 操作按钮 */}
//         <div className="action-buttons" style={{ marginBottom: 24 }}>
//           <Space>
//             <Button 
//               icon={<LeftOutlined />}
//               onClick={handleBack}
//             >
//               返回列表
//             </Button>
        
//             <Button 
//               type="primary" 
//               icon={<BarChartOutlined />}
//               onClick={handleManageExpenses}
//             >
//               管理开销
//             </Button>
//           </Space>
//         </div>

//         {/* 行程日期和预算信息 */}
//         <div className="trip-meta-info">
//           <Row gutter={[24, 16]}>
//             <Col xs={24} sm={16} md={8}>
//               <Card size="small" title="出行日期">
//                 <Text strong>{trip.dates}</Text>
//               </Card>
//             </Col>
//             <Col xs={24} sm={12} md={8}>
//               <Card size="small" title="总预算">
//                 <Text strong type="success">¥{trip.budget}</Text>
//               </Card>
//             </Col>
//             <Col xs={24} sm={12} md={8}>
//               <Card size="small" title="创建时间">
//                 <Text type="secondary">
//                   {new Date(trip.created_at).toLocaleDateString()}
//                 </Text>
//               </Card>
//             </Col>
//           </Row>
//         </div>

//         {planData ? (
//           <>
//             <Row gutter={[24, 16]}>
//               {/* 左侧：按天 Tab */}
//               <Col xs={24} lg={12}>
//                 <Card className="timeline-section">
//                   <Tabs
//                     activeKey={String(activeDay)}
//                     onChange={(k) => setActiveDay(Number(k))}
//                     type="card"
//                     className="day-tabs"
//                     items={tabItems}
//                   />
//                 </Card>
//               </Col>

//               {/* 右侧：地图和摘要 */}
//               <Col xs={24} lg={12}>
//                 <Space direction="vertical" size={16} style={{ width: '100%' }}>
//                   {/* 地图卡片 */}
//                   <Card 
//                     className="map-card"
//                     title={
//                       <Space>
//                         <AimOutlined style={{ color: '#1890ff' }} />
//                         <span>第 {activeDay} 天路线图</span>
//                       </Space>
//                     }
//                   >
//                     <MiniItineraryMap plan={planData} dayFilter={activeDay} />
//                   </Card>

//                   {/* 行程摘要 */}
//                   <Card 
//                     title="行程摘要" 
//                     size="small"
//                     className="summary-card"
//                   >
//                     <Space direction="vertical" style={{ width: '100%' }}>
//                       {planData.daily_itinerary?.map((day) => (
//                         <div 
//                           key={day.day}
//                           className={`day-summary ${activeDay === day.day ? 'active' : ''}`}
//                           onClick={() => setActiveDay(day.day)}
//                         >
//                           <Text strong>第 {day.day} 天</Text>
//                           <div className="day-stats">
//                             <Text type="secondary">{day.schedule?.length || 0} 个活动</Text>
//                             <Text type="secondary">¥{day.daily_budget}</Text>
//                           </div>
//                         </div>
//                       ))}
//                     </Space>
//                   </Card>
//                 </Space>
//               </Col>
//             </Row>

//             {/* 小贴士 */}
//             {planData.tips?.length > 0 && (
//               <Card className="tips-card">
//                 <Divider orientation="left">
//                   <BulbOutlined style={{ color: '#faad14' }} />
//                   <span style={{ marginLeft: 8 }}>旅行小贴士</span>
//                 </Divider>
//                 <div className="tips-list">
//                   {planData.tips.map((t, i) => (
//                     <div key={i} className="tip-item">
//                       <Text>{t}</Text>
//                     </div>
//                   ))}
//                 </div>
//               </Card>
//             )}
//           </>
//         ) : (
//           // 如果没有解析出 planData，显示原始计划文本
//           <Card title="行程计划" className="raw-plan-card">
//             <Paragraph>
//               {trip.plan ? (
//                 <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
//                   {typeof trip.plan === 'string' ? trip.plan : JSON.stringify(trip.plan, null, 2)}
//                 </pre>
//               ) : (
//                 <Text type="secondary">暂无详细的行程计划</Text>
//               )}
//             </Paragraph>
//           </Card>
//         )}
//       </Card>
//     </div>
//   );
// }

// export default TripDetail;

// TripDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Space,
  Divider,
  Spin,
  message
} from 'antd';
import {
  EnvironmentOutlined,
  DollarOutlined,
  CalendarOutlined,
  AimOutlined,
  LeftOutlined,
  BulbOutlined,
  HeartOutlined,
  BarChartOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import MiniItineraryMap from '../components/MiniItineraryMap';
import './TripDetail.css';

const { Title, Text, Paragraph } = Typography;

function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);

  useEffect(() => {
    const fetchTrip = async () => {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        message.error('请先登录');
        navigate('/login');
        return;
      }
      
      try {
        const res = await fetch(`http://localhost:8000/trips/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('获取行程数据失败');
        
        const data = await res.json();
        setTrip(data);
        
        // 解析 plan 字段
        if (data.plan) {
          try {
            const parsedPlan = typeof data.plan === 'string' ? JSON.parse(data.plan) : data.plan;
            setPlanData(parsedPlan);
          } catch (parseError) {
            console.error('解析行程计划失败:', parseError);
            message.warning('行程计划数据格式有误');
          }
        }
      } catch (err) {
        console.error('获取行程详情失败:', err);
        message.error('加载行程详情失败');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchTrip();
  }, [id, navigate]);

  // 类型配色 & 文案
  const typeMap = (t) => {
    const colors = {
      attraction: '#fa8c16',
      dining: '#f5222d', 
      transport: '#1890ff',
      accommodation: '#52c41a',
      shopping: '#722ed1',
      culture: '#13c2c2'
    };
    return colors[t] || '#8c8c8c';
  };
  
  const typeText = (t) => {
    const typeMap = {
      attraction: '景点',
      dining: '餐饮',
      transport: '交通', 
      accommodation: '住宿',
      shopping: '购物',
      culture: '文化'
    };
    return typeMap[t] || '其他';
  };

  // 紧凑行程列表组件
  const CompactSchedule = ({ day }) => (
    <div className="compact-activities">
      {day.schedule?.map((activity, index) => (
        <div key={index} className="activity-item">
          <div className="activity-time">
            <ClockCircleOutlined style={{ fontSize: '10px', marginRight: '2px' }} />
            {activity.time}
          </div>
          <div className="activity-content">
            <div className="activity-main">
              <Text className="activity-name">{activity.activity}</Text>
              <div 
                className="activity-type"
                style={{ background: typeMap(activity.type) }}
              >
                {typeText(activity.type)}
              </div>
            </div>
            <div className="activity-details">
              <div className="activity-location">
                <EnvironmentOutlined style={{ fontSize: '10px' }} />
                <Text>{activity.location}</Text>
              </div>
              <div className="activity-meta">
                <span className="activity-cost">
                  <DollarOutlined style={{ fontSize: '9px', marginRight: '2px' }} />
                  ¥{activity.cost}
                </span>
                {activity.duration && (
                  <span className="activity-duration">
                    <CalendarOutlined style={{ fontSize: '9px', marginRight: '2px' }} />
                    {activity.duration}
                  </span>
                )}
              </div>
              {activity.address && (
                <div className="activity-address">{activity.address}</div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // 跳转到开销管理
  const handleManageExpenses = () => {
    navigate(`/trips/${id}/expenses`);
  };

  // 返回行程列表
  const handleBack = () => {
    navigate('/trips');
  };

  if (loading) {
    return (
      <div className="trip-detail-loading">
        <Spin size="large" tip="加载行程详情中...">
          <div className="loading-content" />
        </Spin>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="trip-detail-empty">
        <Card>
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Title level={3}>未找到行程数据</Title>
            <Paragraph type="secondary">
              抱歉，无法找到您要查看的行程信息
            </Paragraph>
            <Button type="primary" onClick={handleBack}>
              返回行程列表
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentDayData = planData?.daily_itinerary?.find(day => day.day === activeDay);

  return (
    <div className="trip-detail-container">
      {/* 头部横幅 */}
      <div className="plan-header-banner">
        <div className="banner-content">
          <Title level={1} className="plan-main-title">
            {trip.destination || '行程详情'}
          </Title>
          <Paragraph className="plan-subtitle">
            {planData?.summary || trip.summary || '暂无行程摘要'}
          </Paragraph>
          <Space size={[6, 3]} wrap className="plan-stats">
            <Tag icon={<CalendarOutlined />} color="blue" className="stat-tag">
              {planData?.daily_itinerary?.length || 0} 天
            </Tag>
            <Tag icon={<DollarOutlined />} color="green" className="stat-tag">
              总预算 ¥{planData?.total_budget || trip.budget}
            </Tag>
            <Tag icon={<UserOutlined />} color="orange" className="stat-tag">
              {trip.travelers} 人
            </Tag>
            {trip.preferences && (
              <Tag icon={<HeartOutlined />} color="red" className="stat-tag">
                {trip.preferences}
              </Tag>
            )}
          </Space>
        </div>
      </div>

      <Card className="main-content-card">
        {/* 操作按钮 */}
        <div className="action-buttons">
          <Space>
            <Button 
              icon={<LeftOutlined />}
              onClick={handleBack}
              size="small"
            >
              返回列表
            </Button>
        
            <Button 
              type="primary" 
              icon={<BarChartOutlined />}
              onClick={handleManageExpenses}
              size="small"
            >
              管理开销
            </Button>
          </Space>
        </div>

        {/* 行程日期和预算信息 */}
        <div className="trip-meta-info">
          <Row gutter={[8, 6]}>
            <Col xs={24} sm={12} md={8}>
              <Card size="small" title="出行日期">
                <Text strong style={{ fontSize: '18px' }}>{trip.dates}</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card size="small" title="总预算">
                <Text strong type="success" style={{ fontSize: '18px' }}>¥{trip.budget}</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card size="small" title="创建时间">
                <Text type="secondary" style={{ fontSize: '18px' }}>
                  {new Date(trip.created_at).toLocaleDateString()}
                </Text>
              </Card>
            </Col>
          </Row>
        </div>

        {planData ? (
          <div className="compact-layout">
            {/* 紧凑行程列表 */}
            <Card 
              className="compact-schedule-section"
              title={`第 ${activeDay} 天行程安排`}
              size="small"
              extra={
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  预算: ¥{currentDayData?.daily_budget || 0}
                </Text>
              }
            >
              <div className="day-selector">
                {planData.daily_itinerary?.map((day) => (
                  <div
                    key={day.day}
                    className={`day-tab ${activeDay === day.day ? 'active' : ''}`}
                    onClick={() => setActiveDay(day.day)}
                  >
                    第 {day.day} 天 ({day.schedule?.length || 0})
                  </div>
                ))}
              </div>
              
              {currentDayData ? (
                <CompactSchedule day={currentDayData} />
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#8c8c8c' }}>
                  <Text>暂无行程数据</Text>
                </div>
              )}
            </Card>

            {/* 地图卡片 - 全宽 */}
            <Card 
              className="map-card"
              title={
                <Space>
                  <AimOutlined style={{ color: '#1890ff', fontSize: '14px' }} />
                  <span style={{ fontSize: '14px' }}>第 {activeDay} 天路线图</span>
                </Space>
              }
            >
              <MiniItineraryMap plan={planData} dayFilter={activeDay} />
            </Card>

            {/* 行程摘要 */}
            {/* <Card 
              title="行程概览" 
              size="small"
              className="summary-card"
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {planData.daily_itinerary?.map((day) => (
                  <div 
                    key={day.day}
                    className={`day-summary ${activeDay === day.day ? 'active' : ''}`}
                    onClick={() => setActiveDay(day.day)}
                  >
                    <Text strong style={{ fontSize: '12px' }}>第 {day.day} 天</Text>
                    <div className="day-stats">
                      <Text type="secondary" style={{ fontSize: '10px' }}>{day.schedule?.length || 0} 活动</Text>
                      <Text type="secondary" style={{ fontSize: '10px' }}>¥{day.daily_budget}</Text>
                    </div>
                  </div>
                ))}
              </Space>
            </Card> */}

            {/* 小贴士 */}
            {planData.tips?.length > 0 && (
              <Card className="tips-card" size="small">
                <Divider orientation="left">
                  <BulbOutlined style={{ color: '#faad14', fontSize: '12px' }} />
                  <span style={{ marginLeft: 6, fontSize: '20px' }}>旅行小贴士</span>
                </Divider>
                <div className="tips-list">
                  {planData.tips.map((t, i) => (
                    <div key={i} className="tip-item">
                      <Text style={{ fontSize: '14px' }}>• {t}</Text>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        ) : (
          // 如果没有解析出 planData，显示原始计划文本
          <Card title="行程计划" className="raw-plan-card" size="small">
            <Paragraph>
              {trip.plan ? (
                <pre style={{ 
                  whiteSpace: 'pre-wrap', 
                  fontFamily: 'inherit', 
                  fontSize: '11px',
                  margin: 0,
                  lineHeight: '1.3'
                }}>
                  {typeof trip.plan === 'string' ? trip.plan : JSON.stringify(trip.plan, null, 2)}
                </pre>
              ) : (
                <Text type="secondary">暂无详细的行程计划</Text>
              )}
            </Paragraph>
          </Card>
        )}
      </Card>
    </div>
  );
}

export default TripDetail;