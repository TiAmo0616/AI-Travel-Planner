import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, Spin, Empty } from 'antd';
import { AimOutlined, LoadingOutlined } from '@ant-design/icons';
import amapService from '../services/amapService';
import './ResultMap.css';

// 坐标验证函数
const isValidCoordinate = (lng, lat) => {
  if (lng === null || lat === null || lng === undefined || lat === undefined) {
    return false;
  }
  
  // 确保是数字且不是 NaN
  const numLng = Number(lng);
  const numLat = Number(lat);
  
  return !isNaN(numLng) && !isNaN(numLat) && 
         numLng >= -180 && numLng <= 180 && 
         numLat >= -90 && numLat <= 90;
};

// 标记颜色函数
const getMarkerColor = (type) => {
  const colors = {
    attraction: '#fa8c16',
    dining: '#f5222d',
    transport: '#1890ff',
    accommodation: '#52c41a',
    shopping: '#722ed1',
    culture: '#13c2c2'
  };
  return colors[type] || '#8c8c8c';
};

// 活动类型文本
const getActivityTypeText = (type) => {
  const typeMap = {
    attraction: '景点',
    dining: '餐饮',
    transport: '交通',
    accommodation: '住宿',
    shopping: '购物',
    culture: '文化'
  };
  return typeMap[type] || '其他';
};

export default function ResultMap({ plan, dayFilter }) {
  const containerId = `mini-map-${dayFilter}`;
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const [coordinates, setCoordinates] = useState([]);

  // 安全地获取坐标数据
  const getValidCoordinates = useCallback(() => {
    try {
      if (!plan || !plan.daily_itinerary || !Array.isArray(plan.daily_itinerary)) {
        console.log('计划数据无效或为空');
        return [];
      }

      const coords = [];
      const targetDay = plan.daily_itinerary.find(day => day.day === dayFilter);
      
      if (!targetDay || !targetDay.schedule || !Array.isArray(targetDay.schedule)) {
        console.log(`第 ${dayFilter} 天无行程数据`);
        return [];
      }

      console.log(`处理第 ${dayFilter} 天的行程数据:`, targetDay.schedule);

      targetDay.schedule.forEach((scheduleItem, index) => {
        try {
          // 检查坐标数据是否存在
          if (!scheduleItem || !scheduleItem.coordinates) {
            console.warn(`第 ${index + 1} 个活动缺少坐标数据:`, scheduleItem);
            return;
          }

          const { lng, lat } = scheduleItem.coordinates;
          
          // 更严格的坐标验证
          if (!isValidCoordinate(lng, lat)) {
            console.warn(`第 ${index + 1} 个活动坐标无效:`, { lng, lat });
            return;
          }

          // 确保坐标是数字类型
          const validLng = Number(lng);
          const validLat = Number(lat);

          coords.push({
            name: scheduleItem.location || scheduleItem.activity || '未知地点',
            lnglat: [validLng, validLat],
            type: scheduleItem.type || 'attraction',
            activity: scheduleItem.activity || '未知活动',
            time: scheduleItem.time,
            address: scheduleItem.address,
            cost: scheduleItem.cost
          });
          
          console.log(`添加有效坐标: ${validLng}, ${validLat} - ${scheduleItem.location}`);
        } catch (itemError) {
          console.error(`处理第 ${index + 1} 个活动时出错:`, itemError);
        }
      });

      console.log(`最终有效坐标数量: ${coords.length}`);
      return coords;
    } catch (error) {
      console.error('获取坐标数据时出错:', error);
      return [];
    }
  }, [plan, dayFilter]);

  // 在 useEffect 中设置坐标
  useEffect(() => {
    const coords = getValidCoordinates();
    setCoordinates(coords);
  }, [getValidCoordinates]);

  // 调试信息
  useEffect(() => {
    console.log('MiniItineraryMap 组件渲染:', {
      dayFilter,
      hasPlan: !!plan,
      dailyItinerary: plan?.daily_itinerary,
      coordinatesCount: coordinates.length
    });
  }, [plan, dayFilter, coordinates.length]);

  useEffect(() => {
    if (!coordinates || coordinates.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setMapError(false);

    const initMap = async () => {
      try {
        // 确保容器存在且可见
        await new Promise(resolve => setTimeout(resolve, 100));
        const container = document.getElementById(containerId);
        if (!container) {
          console.warn(`地图容器 ${containerId} 未找到`);
          setMapError(true);
          setLoading(false);
          return;
        }

        // 检查容器尺寸
        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
          console.warn('地图容器尺寸为0，等待布局完成');
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // 清除之前的地图实例
        if (amapService.map) {
          try {
            amapService.destroy();
          } catch (destroyError) {
            console.warn('清理旧地图时出错:', destroyError);
          }
        }

        // 计算合适的缩放级别和中心点
        const zoomLevel = coordinates.length > 5 ? 13 : 12;
        const centerLng = coordinates.reduce((sum, coord) => sum + coord.lnglat[0], 0) / coordinates.length;
        const centerLat = coordinates.reduce((sum, coord) => sum + coord.lnglat[1], 0) / coordinates.length;
        
        console.log('初始化地图，中心点:', [centerLng, centerLat], '缩放:', zoomLevel);

        // 初始化地图
        mapRef.current = await amapService.initMap(containerId, { 
          zoom: zoomLevel,
          center: [centerLng, centerLat],
          resizeEnable: true,
          viewMode: '2D'
        });

        // 检查地图是否成功加载
        if (!amapService.mapLoaded || !amapService.map) {
          throw new Error('地图加载失败');
        }

        // 添加标记点
        coordinates.forEach((coord, idx) => {
          try {
            if (!coord.lnglat || !Array.isArray(coord.lnglat) || coord.lnglat.length !== 2) {
              console.warn(`坐标数据格式错误:`, coord);
              return;
            }
            
            amapService.addMarker(coord.lnglat, {
              title: `${idx + 1}. ${coord.name} - ${coord.activity}`,
              content: `
                <div class="custom-marker" style="background: ${getMarkerColor(coord.type)}">
                  <div class="marker-number">${idx + 1}</div>
                  <div class="marker-pin"></div>
                </div>
              `,
            });
          } catch (markerError) {
            console.warn(`添加标记点 ${idx} 时出错:`, markerError);
          }
        });

        // 绘制路线
        if (coordinates.length > 1) {
          try {
            const path = coordinates.map(coord => {
              if (!coord.lnglat || !Array.isArray(coord.lnglat)) {
                throw new Error(`无效的坐标数据: ${JSON.stringify(coord)}`);
              }
              return coord.lnglat;
            });
            
            amapService.drawPolyline(path, { 
              strokeColor: '#722ed1',
              strokeWeight: 6,
              strokeOpacity: 0.9,
              strokeStyle: 'solid'
            });
          } catch (polylineError) {
            console.warn('绘制路线时出错:', polylineError);
          }
        }

        // 调整视野包含所有标记
        try {
          if (coordinates.length > 0) {
            amapService.map.setFitView(null, false, [60, 60, 60, 60], 100);
          }
        } catch (fitViewError) {
          console.warn('调整视野时出错:', fitViewError);
          // 如果 fitView 失败，使用中心点
          if (coordinates.length > 0) {
            const centerLng = coordinates.reduce((sum, coord) => sum + coord.lnglat[0], 0) / coordinates.length;
            const centerLat = coordinates.reduce((sum, coord) => sum + coord.lnglat[1], 0) / coordinates.length;
            amapService.map.setCenter([centerLng, centerLat]);
          }
        }
        
        setLoading(false);
        console.log('地图初始化完成');
      } catch (error) {
        console.error('地图初始化失败:', error);
        setMapError(true);
        setLoading(false);
      }
    };

    initMap();

    return () => {
      // 清理函数 - 只在组件卸载时清理
      if (amapService.mapLoaded && amapService.map) {
        try {
          // 延迟清理以避免地图闪烁
          setTimeout(() => {
            amapService.destroy();
          }, 100);
        } catch (destroyError) {
          console.warn('清理地图时出错:', destroyError);
        }
      }
    };
  }, [coordinates, containerId]);

  // 如果没有坐标数据
  if (!coordinates || coordinates.length === 0) {
    return (
      <Card className="mini-map-card empty">
        <Empty
          image={<div className="empty-map-icon">🗺️</div>}
          description={
            <div>
              <div style={{ marginBottom: 8, fontSize: 14 }}>当天暂无坐标信息</div>
              <div style={{ fontSize: 12, color: '#999' }}>
                无法展示地图路线
              </div>
            </div>
          }
        />
      </Card>
    );
  }

  // 如果地图加载出错
  if (mapError) {
    return (
      <Card className="mini-map-card error">
        <div className="map-error-state">
          <div className="error-icon">⚠️</div>
          <div className="error-text">
            <div style={{ marginBottom: 8 }}>地图加载失败</div>
            <div className="error-subtext">请检查网络连接</div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mini-map-card" bodyStyle={{ padding: 0 }}>
      <div className="map-header">
        <span className="map-title">第 {dayFilter} 天行程路线</span>
        <div className="map-stats">
          <span className="point-count">{coordinates.length} 个地点</span>
        </div>
      </div>
      
      <div className="map-container">
        {loading && (
          <div className="map-loading">
            <Spin 
              indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
              size="large"
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              地图加载中...
            </div>
          </div>
        )}
        <div 
          id={containerId} 
          className={`map-content ${loading ? 'loading' : ''}`}
          style={{ 
            width: '100%', 
            height: '100%',
            minHeight: '300px'
          }}
        />
      </div>
      
      <div className="map-footer">
        <div className="route-info">
          <div className="route-line"></div>
          <span className="route-text">紫色路线为建议游览顺序</span>
        </div>
        <div className="locations-count">
          {coordinates.length} 个定位点
        </div>
      </div>

      {/* 地点列表 */}
      <div className="locations-list-container">
        <div className="locations-header">
          <span className="locations-title">行程地点列表</span>
          <span className="locations-total">共 {coordinates.length} 个地点</span>
        </div>
        
        <div className="locations-list">
          {coordinates.map((location, index) => (
            <div key={index} className="location-item">
              <div 
                className="location-marker"
                style={{ background: getMarkerColor(location.type) }}
              >
                {index + 1}
              </div>
              <div className="location-info">
                <div className="location-main">
                  <div className="location-name">{location.name}</div>
                  <div 
                    className="location-type"
                    style={{ background: getMarkerColor(location.type) }}
                  >
                    {getActivityTypeText(location.type)}
                  </div>
                </div>
                <div className="location-details">
                  <div className="location-activity">{location.activity}</div>
                  <div className="location-meta">
                    {location.time && (
                      <span className="location-time">{location.time}</span>
                    )}
                    {location.cost && location.cost !== '0' && (
                      <span className="location-cost">¥{location.cost}</span>
                    )}
                  </div>
                  {location.address && (
                    <div className="location-address">{location.address}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}