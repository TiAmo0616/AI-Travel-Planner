// [file name]: src/pages/MapNavigation.js (修复版本)
// [file content begin]
import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Input,
  Button,
  Select,
  Space,
  message,
  Spin,
  List,
  Typography,
  Divider,
  Row,
  Col,
  Tag,
  Alert
} from 'antd';
import {
  EnvironmentOutlined,
  SearchOutlined,
  AimOutlined,
  CarOutlined,
  UserOutlined,  // 替换 WalkOutlined
  DashboardOutlined,  // 替换 BusOutlined
  InfoCircleOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;
const { Option } = Select;
const { Search } = Input;

function MapNavigation() {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [routeMode, setRouteMode] = useState('driving');
  const [routeInfo, setRouteInfo] = useState(null);

  // 模拟地图初始化（实际项目中需要集成高德地图API）
  useEffect(() => {
    const initMap = async () => {
      try {
        setLoading(true);
        // 模拟地图加载延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMapLoaded(true);
        message.success('地图服务准备就绪');
      } catch (error) {
        console.error('地图初始化失败:', error);
        message.error('地图加载失败');
      } finally {
        setLoading(false);
      }
    };

    initMap();
  }, []);

  // 模拟获取当前位置
  const handleGetLocation = async () => {
    try {
      setLoading(true);
      // 模拟定位延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockPosition = {
        position: {
          lng: 116.397428,
          lat: 39.90923
        },
        formattedAddress: '北京市东城区',
        accuracy: 50
      };
      
      setCurrentLocation(mockPosition);
      message.success('定位成功（模拟数据）');
    } catch (error) {
      console.error('获取位置失败:', error);
      message.error('获取位置失败');
    } finally {
      setLoading(false);
    }
  };

  // 模拟地点搜索
  const handleSearch = async (keyword) => {
    if (!keyword.trim()) return;

    try {
      setLoading(true);
      // 模拟搜索延迟
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const mockResults = [
        {
          id: 1,
          name: `${keyword}景点`,
          address: '北京市示例地址1',
          location: { lng: 116.407428, lat: 39.90423 },
          type: '旅游景点',
          tel: '010-12345678'
        },
        {
          id: 2,
          name: `${keyword}酒店`,
          address: '北京市示例地址2',
          location: { lng: 116.397528, lat: 39.90823 },
          type: '住宿',
          tel: '010-87654321'
        },
        {
          id: 3,
          name: `${keyword}餐厅`,
          address: '北京市示例地址3',
          location: { lng: 116.387428, lat: 39.91423 },
          type: '餐饮',
          tel: '010-55556666'
        }
      ];
      
      setSearchResults(mockResults);
      message.success(`找到 ${mockResults.length} 个相关地点`);
    } catch (error) {
      console.error('搜索失败:', error);
      message.error('搜索失败');
    } finally {
      setLoading(false);
    }
  };

  // 选择地点
  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
    setSearchResults([]);
    message.success(`已选择: ${place.name}`);
  };

  // 模拟路线规划
  const handlePlanRoute = async () => {
    if (!currentLocation || !selectedPlace) {
      message.warning('请先获取当前位置并选择目的地');
      return;
    }

    try {
      setLoading(true);
      // 模拟路线规划延迟
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const mockRoute = {
        routes: [{
          distance: 8500,
          time: 1800,
          taxi_cost: 25,
          steps: [
            { instruction: '从当前位置出发' },
            { instruction: '沿长安街向东行驶2公里' },
            { instruction: '右转进入王府井大街' },
            { instruction: '直行500米到达目的地' }
          ]
        }]
      };
      
      setRouteInfo(mockRoute);
      message.success('路线规划成功（模拟数据）');
    } catch (error) {
      console.error('路线规划失败:', error);
      message.error('路线规划失败');
    } finally {
      setLoading(false);
    }
  };

  // 清除路线
  const handleClearRoute = () => {
    setRouteInfo(null);
    setSelectedPlace(null);
    message.info('已清除路线');
  };

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Card>
        <Title level={2}>🗺️ 地图导航</Title>
        
        <Alert
          message="地图功能说明"
          description="此功能需要集成高德地图API。当前为演示模式，使用模拟数据展示功能流程。"
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 24 }}
        />
        
        {/* 搜索和操作栏 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Search
              placeholder="搜索地点（如：故宫、天安门）"
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              loading={loading}
            />
          </Col>
          <Col span={8}>
            <Space>
              <Button 
                icon={<AimOutlined />} 
                onClick={handleGetLocation}
                loading={loading}
              >
                我的位置
              </Button>
              <Select 
                value={routeMode} 
                onChange={setRouteMode}
                style={{ width: 120 }}
              >
                <Option value="driving"><CarOutlined /> 驾车</Option>
                <Option value="walking"><UserOutlined /> 步行</Option>
                <Option value="transit"><DashboardOutlined /> 公交</Option>
              </Select>
            </Space>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={handleClearRoute}>
                清除路线
              </Button>
              <Button 
                type="primary" 
                onClick={handlePlanRoute}
                disabled={!currentLocation || !selectedPlace}
                loading={loading}
              >
                开始导航
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 地图和搜索结果 */}
        <Row gutter={16}>
          {/* 地图容器 */}
          <Col span={16}>
            <Card 
              title="地图视图" 
              style={{ height: 500 }}
              bodyStyle={{ padding: 0, position: 'relative' }}
            >
              {loading && (
                <div style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1000 
                }}>
                  <Spin size="large" tip="加载中..." />
                </div>
              )}
              <div 
                id="map-container" 
                ref={mapRef}
                style={{ 
                  width: '100%', 
                  height: 500,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 18,
                  borderRadius: 8
                }}
              >
                {mapLoaded ? (
                  <div style={{ textAlign: 'center' }}>
                    <EnvironmentOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                    <div>地图展示区域</div>
                    <div style={{ fontSize: 14, opacity: 0.8, marginTop: 8 }}>
                      {currentLocation && '📍 已定位 | '}
                      {selectedPlace && `🎯 ${selectedPlace.name}`}
                    </div>
                  </div>
                ) : (
                  <Spin size="large" tip="地图加载中..." />
                )}
              </div>
            </Card>
          </Col>

          {/* 搜索结果和路线信息 */}
          <Col span={8}>
            <Card title="搜索结果" style={{ marginBottom: 16, height: 240, overflow: 'auto' }}>
              {searchResults.length > 0 ? (
                <List
                  dataSource={searchResults}
                  renderItem={(place) => (
                    <List.Item 
                      style={{ 
                        cursor: 'pointer',
                        padding: '8px 12px',
                        border: '1px solid #f0f0f0',
                        borderRadius: 4,
                        marginBottom: 4,
                        background: selectedPlace?.id === place.id ? '#f0f7ff' : 'white'
                      }}
                      onClick={() => handleSelectPlace(place)}
                    >
                      <List.Item.Meta
                        avatar={<EnvironmentOutlined style={{ color: '#1890ff' }} />}
                        title={place.name}
                        description={
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>{place.address}</Text>
                            <br />
                            <Tag color="blue" size="small">
                              {place.type}
                            </Tag>
                            {place.tel && (
                              <Tag color="green" size="small">
                                📞 {place.tel}
                              </Tag>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                  <SearchOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                  <div>输入关键词搜索地点</div>
                </div>
              )}
            </Card>

            {/* 路线信息 */}
            {routeInfo && (
              <Card title="路线信息" style={{ marginBottom: 16 }}>
                {routeInfo.routes.map((route, index) => (
                  <div key={index}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>距离: </Text>
                        <Text>{(route.distance / 1000).toFixed(1)} km</Text>
                      </div>
                      <div>
                        <Text strong>时间: </Text>
                        <Text>{Math.ceil(route.time / 60)} 分钟</Text>
                      </div>
                      <div>
                        <Text strong>费用: </Text>
                        <Text>{route.taxi_cost || 0} 元</Text>
                      </div>
                    </Space>
                    
                    <Divider style={{ margin: '12px 0' }} />
                    
                    <Text strong>导航步骤:</Text>
                    <List
                      size="small"
                      dataSource={route.steps}
                      renderItem={(step, stepIndex) => (
                        <List.Item style={{ padding: '4px 0' }}>
                          <Text type="secondary" style={{ minWidth: 20 }}>{stepIndex + 1}.</Text>
                          <Text style={{ marginLeft: 8, fontSize: 12 }}>{step.instruction}</Text>
                        </List.Item>
                      )}
                      style={{ maxHeight: 120, overflow: 'auto', marginTop: 8 }}
                    />
                  </div>
                ))}
              </Card>
            )}

            {/* 当前位置信息 */}
            {currentLocation && (
              <Card title="当前位置">
                <Space direction="vertical">
                  <div>
                    <Text strong>地址: </Text>
                    <Text>{currentLocation.formattedAddress}</Text>
                  </div>
                  <div>
                    <Text strong>坐标: </Text>
                    <Text type="secondary">
                      {currentLocation.position.lng.toFixed(6)}, {currentLocation.position.lat.toFixed(6)}
                    </Text>
                  </div>
                  <div>
                    <Text strong>精度: </Text>
                    <Text type="secondary">{currentLocation.accuracy}米</Text>
                  </div>
                </Space>
              </Card>
            )}
          </Col>
        </Row>

        {/* 集成说明 */}
        <Card title="高德地图集成说明" style={{ marginTop: 24 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>要启用完整的地图功能，需要：</Text>
            <ol>
              <li>访问 <a href="https://lbs.amap.com/" target="_blank" rel="noopener noreferrer">高德地图开放平台</a></li>
              <li>注册账号并创建应用</li>
              <li>获取 JavaScript API Key</li>
              <li>在 .env 文件中配置 REACT_APP_AMAP_API_KEY</li>
              <li>安装高德地图 SDK: <Text code>npm install @amap/amap-jsapi-loader</Text></li>
            </ol>
          </Space>
        </Card>
      </Card>
    </div>
  );
}

export default MapNavigation;
// [file content end]