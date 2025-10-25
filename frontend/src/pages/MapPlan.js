// [file name]: src/pages/MapPlan.js (完整检查)
// [file content begin]
import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Steps,
  List,
  Tag,
  Divider,
  Spin,
  Alert,
  message,
  Modal
} from 'antd';
import {
  EnvironmentOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
  HeartOutlined,
  CompassOutlined,
  StarOutlined,
  CarOutlined,
  UserOutlined as WalkIcon,
  DashboardOutlined as BusIcon
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import locationService from '../services/locationService';
import amapService from '../services/amapService';
import geocodingService from '../services/geocodingService';
import './MapPlan.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

function MapPlan() {
  const navigate = useNavigate();
  const location = useLocation();
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [coordinates, setCoordinates] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeModalVisible, setRouteModalVisible] = useState(false);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    loadPlanData();
    
    return () => {
      // 组件卸载时清理地图
      amapService.destroy();
    };
  }, [location]);

  // 从后端加载行程数据
  const loadPlanData = async () => {
    try {
      setLoading(true);
      
      let structuredData;
      
      if (location.state?.markdown && location.state?.formData) {
        structuredData = await locationService.parseItineraryFromAI(
          location.state.markdown,
          location.state.formData
        );
      } else if (location.state?.tripId) {
        console.log("加载行程ID:", location.state.tripId);
        structuredData = await locationService.getTripData(location.state.tripId);
      } else {
        message.warning('请先规划行程');
        navigate('/plan');
        return;
      }
      console.log(structuredData)
      if (structuredData) {
        setPlanData(structuredData);
        
        // 获取所有地点的坐标
        const coords = await geocodingService.getItineraryCoordinates(
          structuredData, 
          structuredData.destination
        );
        setCoordinates(coords);
        
        // 初始化地图
        await initializeMap(coords);
      }
    } catch (error) {
      console.error('加载行程数据失败:', error);
      message.error('加载行程数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化真实的高德地图
  // 在 MapPlan.js 中修改 initializeMap 函数
  // 修复MapPlan.js中的地图初始化和其他问题

// 修改initializeMap函数
const initializeMap = async (locations) => {
  try {
    setMapLoading(true);
    
    // 初始化地图
    const map = await amapService.initMap('map-container', {
      zoom: locations.length > 0 ? 12 : 10,
      mapStyle: 'amap://styles/fresh'
    });

    // 如果有地点数据，添加标记
    if (locations && locations.length > 0) {
      // 清除之前的标记
      amapService.clearMap();
      
      locations.forEach((location) => {
        // 确保位置数据有效
        if (location.lnglat && Array.isArray(location.lnglat) && location.lnglat.length === 2) {
          amapService.addMarker(location.lnglat, {
            title: location.name,
            content: `
              <div style="background:white;padding:8px 12px;border-radius:20px;box-shadow:0 2px 8px rgba(0,0,0,0.15);border:2px solid #1890ff;font-size:12px;font-weight:bold">
                ${location.name}
              </div>
            `,
          });
        }
      });

      // 绘制连接线（只有当有2个或以上有效地点时）
      const validLocations = locations.filter(loc => 
        loc.lnglat && Array.isArray(loc.lnglat) && loc.lnglat.length === 2
      );
      
      if (validLocations.length > 1) {
        const path = validLocations.map(loc => loc.lnglat);
        amapService.drawPolyline(path);
      }

      // 调整视野
      if (validLocations.length > 0) {
        amapService.map.setFitView();
      }
    }

    setMapLoading(false);
  } catch (error) {
    console.error('地图初始化失败:', error);
    setMapLoading(false);
    // 这里不需要显示错误，因为amapService已经处理了降级
  }
};

// 修复handleDaySelect函数
const handleDaySelect = async (dayIndex) => {
  setCurrentStep(dayIndex);
  
  if (planData?.itinerary[dayIndex]?.locations?.length > 0) {
    // 获取当天地点的坐标
    const dayLocations = coordinates.filter(coord => 
      planData.itinerary[dayIndex].locations.some(loc => loc.name === coord.name)
    );
    
    if (dayLocations.length > 0) {
      // 清除之前的标记和路线
      amapService.clearMap();
      
      // 筛选出有效位置
      const validLocations = dayLocations.filter(loc => 
        loc.lnglat && Array.isArray(loc.lnglat) && loc.lnglat.length === 2
      );

      // 添加当天地点标记
      validLocations.forEach(location => {
        amapService.addMarker(location.lnglat, {
          title: location.name,
          content: `
            <div class="custom-marker">
              <div class="marker-content ${location.type} active">
                <div class="marker-text">${location.name}</div>
              </div>
            </div>
          `,
        });
      });

      // 绘制当天的路线（只有当有2个或以上有效地点时）
      if (validLocations.length > 1) {
        const path = validLocations.map(loc => loc.lnglat);
        amapService.drawPolyline(path, {
          strokeColor: '#ff6b6b'
        });
      }

      // 调整视野
      if (validLocations.length > 0) {
        amapService.map.setFitView();
      }
    }
  }
};

// 修复handlePlanRoute函数
const handlePlanRoute = async (mode = 'driving') => {
  if (coordinates.length < 2) {
    message.warning('需要至少两个地点才能规划路线');
    return;
  }

  try {
    // 筛选出有效坐标
    const validCoordinates = coordinates.filter(coord => 
      coord.lnglat && Array.isArray(coord.lnglat) && coord.lnglat.length === 2
    );
    
    if (validCoordinates.length < 2) {
      message.warning('有效坐标点不足，无法规划路线');
      return;
    }
    
    const origin = validCoordinates[0].lnglat;
    const destination = validCoordinates[validCoordinates.length - 1].lnglat;
    
    const route = await amapService.planRoute(origin, destination, mode);
    setRouteInfo(route);
    setRouteModalVisible(true);

    // 在地图上显示路线
    if (route.routes && route.routes.length > 0) {
      // 提取路径点
      const steps = route.routes[0].steps || [];
      if (steps.length > 0) {
        // 尝试从steps中提取路径
        let path = [];
        steps.forEach(step => {
          if (step.path && Array.isArray(step.path)) {
            path = path.concat(step.path);
          } else if (step.start_location && step.end_location) {
            path.push([step.start_location.lng, step.start_location.lat]);
            path.push([step.end_location.lng, step.end_location.lat]);
          }
        });
        
        if (path.length > 0) {
          amapService.drawPolyline(path, {
            strokeColor: mode === 'driving' ? '#1890ff' : 
                         mode === 'walking' ? '#52c41a' : '#fa8c16'
          });
        }
      }
    }
  } catch (error) {
    console.error('路线规划失败:', error);
    message.error('路线规划失败: ' + error.message);
  }
};
  // 保存行程
  const handleSavePlan = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await axios.post('http://localhost:8000/trips/save', {
        destination: planData.destination,
        dates: planData.duration,
        budget: planData.budget,
        travelers: planData.travelers,
        preferences: planData.preferences,
        plan: JSON.stringify(planData)
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      message.success('行程保存成功！');
    } catch (error) {
      console.error('保存行程失败:', error);
      message.error('保存行程失败');
    }
  };

  // 开始新的规划
  const handleNewPlan = () => {
    navigate('/plan');
  };

  if (loading) {
    return (
      <div className="map-plan-container">
        <div className="loading-center">
          <Spin size="large" tip="正在加载行程数据..." />
        </div>
      </div>
    );
  }

  if (!planData) {
    return (
      <div className="map-plan-container">
        <Alert
          message="无法加载行程数据"
          description="请检查网络连接或重新规划行程"
          type="error"
          showIcon
          action={
            <Button size="small" onClick={handleNewPlan}>
              重新规划
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="map-plan-container">
      {/* 顶部标题和操作 */}
      <Card className="header-card">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              🌍 {planData.destination} 行程规划
            </Title>
            <Space style={{ marginTop: 8 }}>
              <Tag icon={<CalendarOutlined />}>{planData.duration}</Tag>
              <Tag icon={<DollarOutlined />}>¥{planData.budget}</Tag>
              <Tag icon={<UserOutlined />}>{planData.travelers}</Tag>
              <Tag icon={<HeartOutlined />}>{planData.preferences}</Tag>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<CompassOutlined />} onClick={handleNewPlan}>
                重新规划
              </Button>
              <Button type="primary" icon={<StarOutlined />} onClick={handleSavePlan}>
                保存行程
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* 左侧：真实的高德地图 */}
        <Col span={16}>
          <Card 
            className="map-card"
            title={
              <Space>
                <EnvironmentOutlined />
                <span>行程路线地图</span>
                {mapLoading && <Spin size="small" />}
              </Space>
            }
            extra={
              <Space>
                <Button size="small" icon={<CarOutlined />} onClick={() => handlePlanRoute('driving')}>
                  驾车
                </Button>
                <Button size="small" icon={<WalkIcon />} onClick={() => handlePlanRoute('walking')}>
                  步行
                </Button>
                <Button size="small" icon={<BusIcon />} onClick={() => handlePlanRoute('transit')}>
                  公交
                </Button>
              </Space>
            }
          >
            <div className="map-display">
              <div 
                id="map-container" 
                ref={mapContainerRef}
                style={{ 
                  width: '100%', 
                  height: '500px',
                  borderRadius: '8px'
                }}
              />
              {mapLoading && (
                <div className="map-overlay">
                  <Spin size="large" tip="地图加载中..." />
                </div>
              )}
            </div>
          </Card>

          {/* 每日行程详情 */}
          <Card 
            style={{ marginTop: 24 }}
            title={`第 ${currentStep + 1} 天行程详情`}
          >
            {planData.itinerary[currentStep] && (
              <div className="day-detail">
                <Row gutter={[24, 24]}>
                  <Col span={24}>
                    <Title level={4}>{planData.itinerary[currentStep].title}</Title>
                    <Paragraph>
                      {planData.itinerary[currentStep].description || '暂无详细描述'}
                    </Paragraph>
                    
                    <Divider />
                    
                    <Text strong>时间安排: </Text>
                    <Text type="secondary" style={{ marginRight: 16 }}>
                      {planData.itinerary[currentStep].time}
                    </Text>
                    
                    <Text strong>预计开销: </Text>
                    <Text type="secondary">
                      ¥{planData.itinerary[currentStep].estimated_cost || 0}
                    </Text>
                    
                    <Divider />
                    
                    <Text strong>地点列表:</Text>
                    <List
                      size="small"
                      dataSource={planData.itinerary[currentStep].locations || []}
                      renderItem={(location) => {
                        const coord = coordinates.find(c => c.name === location.name);
                        return (
                          <List.Item
                            actions={[
                              coord && (
                                <Button 
                                  type="link" 
                                  size="small"
                                  onClick={() => amapService.setCenter(coord.lnglat)}
                                >
                                  定位
                                </Button>
                              )
                            ]}
                          >
                            <Space>
                              <Tag color={
                                location.type === 'culture' ? 'blue' :
                                location.type === 'shopping' ? 'purple' :
                                location.type === 'attraction' ? 'orange' : 
                                location.type === 'transport' ? 'red' :
                                location.type === 'accommodation' ? 'green' : 'default'
                              }>
                                {location.type === 'culture' ? '文化' :
                                 location.type === 'shopping' ? '购物' :
                                 location.type === 'attraction' ? '景点' :
                                 location.type === 'transport' ? '交通' :
                                 location.type === 'accommodation' ? '住宿' : '其他'}
                              </Tag>
                              <Text strong>{location.name}</Text>
                              {coord?.formattedAddress && (
                                <Text type="secondary">({coord.formattedAddress})</Text>
                              )}
                            </Space>
                          </List.Item>
                        );
                      }}
                      style={{ marginTop: 8 }}
                    />
                  </Col>
                </Row>
              </div>
            )}
          </Card>
        </Col>

        {/* 右侧：行程概览 */}
        <Col span={8}>
          <Card title="行程概览" className="itinerary-card">
            <Steps
              direction="vertical"
              current={currentStep}
              onChange={handleDaySelect}
              items={planData.itinerary.map((day, index) => ({
                title: `第 ${index + 1} 天`,
                description: day.title,
                icon: <CalendarOutlined />
              }))}
            />
          </Card>

          {/* 行程统计 */}
          <Card title="行程统计" style={{ marginTop: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div className="budget-item">
                <Text>总天数</Text>
                <Text strong>{planData.itinerary.length} 天</Text>
              </div>
              <div className="budget-item">
                <Text>总地点数</Text>
                <Text strong>{coordinates.length} 个</Text>
              </div>
              <div className="budget-item">
                <Text>总预算</Text>
                <Text strong>¥{planData.budget}</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 路线详情模态框 */}
      <Modal
        title="路线规划详情"
        open={routeModalVisible}
        onCancel={() => setRouteModalVisible(false)}
        footer={null}
        width={600}
      >
        {routeInfo && (
          <div>
            {routeInfo.routes.map((route, index) => (
              <div key={index}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>总距离: </Text>
                    <Text>{(route.distance / 1000).toFixed(1)} 公里</Text>
                  </div>
                  <div>
                    <Text strong>预计时间: </Text>
                    <Text>{Math.ceil(route.time / 60)} 分钟</Text>
                  </div>
                  {route.taxi_cost && (
                    <div>
                      <Text strong>出租车费用: </Text>
                      <Text>¥{route.taxi_cost}</Text>
                    </div>
                  )}
                </Space>
                
                <Divider />
                
                <Text strong>导航步骤:</Text>
                <List
                  size="small"
                  dataSource={route.steps}
                  renderItem={(step, stepIndex) => (
                    <List.Item>
                      <Text type="secondary" style={{ minWidth: 20 }}>
                        {stepIndex + 1}.
                      </Text>
                      <Text style={{ marginLeft: 8, fontSize: 12 }}>
                        {step.instruction}
                      </Text>
                    </List.Item>
                  )}
                  style={{ maxHeight: 300, overflow: 'auto', marginTop: 8 }}
                />
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default MapPlan; // 确保有这个默认导出
// [file content end]