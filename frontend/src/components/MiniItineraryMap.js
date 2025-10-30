// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import { Card, Spin, Empty } from 'antd';
// import { AimOutlined, LoadingOutlined } from '@ant-design/icons';
// import amapService from '../services/amapService';
// import './MiniItineraryMap.css';

// // 坐标验证函数
// const isValidCoordinate = (lng, lat) => {
//   if (lng === null || lat === null || lng === undefined || lat === undefined) {
//     return false;
//   }
//     return !isNaN(lng) && !isNaN(lat) && 
//            lng >= -180 && lng <= 180 && 
//            lat >= -90 && lat <= 90;
// };

// // 标记颜色函数
// const getMarkerColor = (type) => {
//   const colors = {
//     attraction: '#fa8c16',
//     dining: '#f5222d',
//     transport: '#1890ff',
//     accommodation: '#52c41a',
//     shopping: '#722ed1',
//     culture: '#13c2c2'
//   };
//   return colors[type] || '#8c8c8c';
// };

// // 活动类型文本
// const getActivityTypeText = (type) => {
//   const typeMap = {
//     attraction: '景点',
//     dining: '餐饮',
//     transport: '交通',
//     accommodation: '住宿',
//     shopping: '购物',
//     culture: '文化'
//   };
//   return typeMap[type] || '其他';
// };

// export default function MiniItineraryMap({ plan, dayFilter }) {
//   const containerId = `mini-map-${dayFilter}`;
//   const mapRef = useRef(null);
//   const [loading, setLoading] = useState(true);
//   const [mapError, setMapError] = useState(false);
//   const [coordinates, setCoordinates] = useState([]);

//   // 安全地获取坐标数据
//   const getValidCoordinates = useCallback(() => {
//     try {
//       if (!plan || !plan.daily_itinerary || !Array.isArray(plan.daily_itinerary)) {
//         console.log('计划数据无效或为空');
//         return [];
//       }

//       const coords = [];
//       const targetDay = plan.daily_itinerary.find(day => day.day === dayFilter);
      
//       if (!targetDay || !targetDay.schedule || !Array.isArray(targetDay.schedule)) {
//         console.log(`第 ${dayFilter} 天无行程数据`);
//         return [];
//       }

//       targetDay.schedule.forEach((scheduleItem) => {
//         if (scheduleItem && scheduleItem.coordinates) {
//           const { lng, lat } = scheduleItem.coordinates;
//           if (isValidCoordinate(lng, lat)) {
//           coords.push({
//               name: scheduleItem.location || '未知地点',
//               lnglat: [lng, lat],
//               type: scheduleItem.type || 'other',
//             activity: scheduleItem.activity || '未知活动',
//             time: scheduleItem.time,
//             address: scheduleItem.address,
//             cost: scheduleItem.cost
//           });
//           }
//         }
//       });

//       return coords;
//     } catch (error) {
//       console.error('获取坐标数据时出错:', error);
//       return [];
//     }
//   }, [plan, dayFilter]);

//   // 在 useEffect 中设置坐标
//   useEffect(() => {
//     const coords = getValidCoordinates();
//     setCoordinates(coords);
//   }, [getValidCoordinates]);

// useEffect(() => {
//   if (!coordinates || coordinates.length === 0) {
//     setLoading(false);
//     return;
//   }

//   setLoading(true);
//   setMapError(false);

//   const initMap = async () => {
//     try {
//         // 确保容器存在
//         await new Promise(resolve => setTimeout(resolve, 500));
//       const container = document.getElementById(containerId);
//       if (!container) {
//         console.warn(`地图容器 ${containerId} 未找到`);
//         setMapError(true);
//         setLoading(false);
//         return;
//       }

//       // 清除之前的地图实例
//       if (amapService.map) {
//           amapService.destroy();
//       }

//       const zoomLevel = coordinates.length > 5 ? 13 : 12;
//       mapRef.current = await amapService.initMap(containerId, { 
//         zoom: zoomLevel,
//           resizeEnable: true
//       });

//       if (!amapService.mapLoaded || !amapService.map) {
//           setMapError(true);
//           setLoading(false);
//           return;
//       }

//       // 添加标记点
//       coordinates.forEach((coord, idx) => {
//         try {
//           amapService.addMarker(coord.lnglat, {
//             title: `${idx + 1}. ${coord.name} - ${coord.activity}`,
//             content: `
//               <div class="custom-marker" style="background: ${getMarkerColor(coord.type)}">
//                 <div class="marker-number">${idx + 1}</div>
//                 <div class="marker-pin"></div>
//               </div>
//             `,
//           });
//         } catch (markerError) {
//           console.warn(`添加标记点 ${idx} 时出错:`, markerError);
//         }
//       });

//       // 绘制路线
//       if (coordinates.length > 1) {
//         try {
//             amapService.drawPolyline(
//               coordinates.map(coord => coord.lnglat),
//               { 
//             strokeColor: '#722ed1',
//             strokeWeight: 6,
//             strokeOpacity: 0.9,
//             strokeStyle: 'solid'
//               }
//           );
//         } catch (polylineError) {
//           console.warn('绘制路线时出错:', polylineError);
//         }
//       }

//         // 调整视野
//         if (coordinates.length > 0) {
//           try {
//             amapService.map.setFitView(null, false, [60, 60, 60, 60]);
//       } catch (fitViewError) {
//         console.warn('调整视野时出错:', fitViewError);
//         }
//       }
      
//       setLoading(false);
//     } catch (error) {
//       console.error('地图初始化失败:', error);
//       setMapError(true);
//       setLoading(false);
//     }
//   };

//   initMap();

//   return () => {
//       // 清理函数
//     if (amapService.mapLoaded && amapService.map) {
//       try {
//           amapService.destroy();
//       } catch (destroyError) {
//         console.warn('清理地图时出错:', destroyError);
//       }
//     }
//   };
// }, [coordinates, containerId]);

//   // 如果没有坐标数据
//   if (!coordinates || coordinates.length === 0) {
//     return (
//       <Card className="mini-map-card empty">
//         <Empty
//           image={<div className="empty-map-icon">🗺️</div>}
//           description={
//             <div>
//               <div style={{ marginBottom: 8, fontSize: 14 }}>当天暂无坐标信息</div>
//               <div style={{ fontSize: 12, color: '#999' }}>
//                 无法展示地图路线
//               </div>
//             </div>
//           }
//         />
//       </Card>
//     );
//   }

//   // 如果地图加载出错
//   if (mapError) {
//     return (
//       <Card className="mini-map-card error">
//         <div className="map-error-state">
//           <div className="error-icon">⚠️</div>
//           <div className="error-text">
//             <div style={{ marginBottom: 8 }}>地图加载失败</div>
//             <div className="error-subtext">请检查网络连接</div>
//           </div>
//         </div>
//       </Card>
//     );
//   }

//   return (
//     <Card className="mini-map-card" bodyStyle={{ padding: 0 }}>
//       <div className="map-header">
//         <span className="map-title">第 {dayFilter} 天行程路线</span>
//         <div className="map-stats">
//           <span className="point-count">{coordinates.length} 个地点</span>
//         </div>
//       </div>
      
//       <div className="map-container">
//         {loading && (
//           <div className="map-loading">
//             <Spin 
//               indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
//               size="large"
//             />
//             <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
//               地图加载中...
//             </div>
//           </div>
//         )}
//         <div 
//           id={containerId} 
//           className={`map-content ${loading ? 'loading' : ''}`}
//           style={{ 
//             width: '100%', 
//             height: '100%',
//             minHeight: '300px'
//           }}
//         />
//       </div>
      
//       <div className="map-footer">
//         <div className="route-info">
//           <div className="route-line"></div>
//           <span className="route-text">紫色路线为建议游览顺序</span>
//         </div>
//         <div className="locations-count">
//           {coordinates.length} 个定位点
//         </div>
//       </div>

//       {/* 地点列表 */}
//       <div className="locations-list-container">
//         <div className="locations-header">
//           <span className="locations-title">行程地点列表</span>
//           <span className="locations-total">共 {coordinates.length} 个地点</span>
//         </div>
        
//         <div className="locations-list">
//           {coordinates.map((location, index) => (
//             <div key={index} className="location-item">
//               <div 
//                 className="location-marker"
//                 style={{ background: getMarkerColor(location.type) }}
//               >
//                 {index + 1}
//               </div>
//               <div className="location-info">
//                 <div className="location-main">
//                   <div className="location-name">{location.name}</div>
//                   <div 
//                     className="location-type"
//                     style={{ background: getMarkerColor(location.type) }}
//                   >
//                     {getActivityTypeText(location.type)}
//                   </div>
//                 </div>
//                 <div className="location-details">
//                   <div className="location-activity">{location.activity}</div>
//                   <div className="location-meta">
//                     {location.time && (
//                       <span className="location-time">{location.time}</span>
//                     )}
//                     {(
//                       <span className="location-cost">¥{location.cost}</span>
//                     )}
//                   </div>
//                   {location.address && (
//                     <div className="location-address">{location.address}</div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </Card>
//   );
// }

// MiniItineraryMap.js 更新版本
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, Spin, Empty } from 'antd';
import { AimOutlined, LoadingOutlined } from '@ant-design/icons';
import amapService from '../services/amapService';
import './MiniItineraryMap.css';

// 坐标验证函数
const isValidCoordinate = (lng, lat) => {
  if (lng === null || lat === null || lng === undefined || lat === undefined) {
    return false;
  }
  
  const numLng = Number(lng);
  const numLat = Number(lat);
  
  return !isNaN(numLng) && !isNaN(numLat) && 
         numLng >= -180 && numLng <= 180 && 
         numLat >= -90 && numLat <= 90;
};

// 活动类型图标映射
const getActivityIcon = (type) => {
  const iconMap = {
    attraction: '🏞️',
    dining: '🍽️',
    transport: '🚗',
    accommodation: '🏨',
    shopping: '🛍️',
    culture: '🎭'
  };
  return iconMap[type] || '📍';
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

// 截短地点名称的函数
const truncateLocationName = (name, maxLength = 6) => {
  if (!name) return '地点';
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + '...';
};

export default function MiniItineraryMap({ plan, dayFilter }) {
  const containerId = `mini-map-${dayFilter}`;
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const [coordinates, setCoordinates] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

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

      targetDay.schedule.forEach((scheduleItem, index) => {
        try {
          if (!scheduleItem || !scheduleItem.coordinates) {
            console.warn(`第 ${index + 1} 个活动缺少坐标数据:`, scheduleItem);
            return;
          }

          const { lng, lat } = scheduleItem.coordinates;
          
          if (!isValidCoordinate(lng, lat)) {
            console.warn(`第 ${index + 1} 个活动坐标无效:`, { lng, lat });
            return;
          }

          const validLng = Number(lng);
          const validLat = Number(lat);

          coords.push({
            id: index,
            name: scheduleItem.location || scheduleItem.activity || '未知地点',
            lnglat: [validLng, validLat],
            type: scheduleItem.type || 'attraction',
            activity: scheduleItem.activity || '未知活动',
            time: scheduleItem.time,
            address: scheduleItem.address,
            cost: scheduleItem.cost
          });
        } catch (itemError) {
          console.error(`处理第 ${index + 1} 个活动时出错:`, itemError);
        }
      });

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

  // 创建信息窗口内容
  // MiniItineraryMap.js 中修改信息窗口内容函数

// 创建信息窗口内容 - 修改为显示位置信息
const createInfoWindowContent = (location) => {
  return `
    <div class="custom-info-window">
      <div class="info-header">
        <span class="info-icon">${getActivityIcon(location.type)}</span>
        <div class="info-title">
          <div class="info-name">${location.name}</div>
          <div class="info-type" style="background: ${getMarkerColor(location.type)}">
            ${getActivityTypeText(location.type)}
          </div>
        </div>
      </div>
      <div class="info-content">
        <!-- 主要修改这里：显示位置信息而不是活动信息 -->
        ${location.address ? `
          <div class="info-address">
            <span class="info-label">位置：</span>
            <span>${location.address}</span>
          </div>
        ` : ''}
        <div class="info-coordinates">
          <span class="info-label">坐标：</span>
          <span>经度 ${location.lnglat[0].toFixed(6)}, 纬度 ${location.lnglat[1].toFixed(6)}</span>
        </div>
        <!-- 可选：保留活动信息但放在次要位置 -->
        ${location.activity && location.activity !== '未知活动' ? `
          <div class="info-activity">
            <span class="info-label">活动：</span>
            <span>${location.activity}</span>
          </div>
        ` : ''}
        ${location.time ? `
          <div class="info-time">
            <span class="info-label">时间：</span>
            <span>${location.time}</span>
          </div>
        ` : ''}
        ${location.cost && location.cost !== '0' ? `
          <div class="info-cost">
            <span class="info-label">费用：</span>
            <span>¥${location.cost}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
};

  useEffect(() => {
    if (!coordinates || coordinates.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setMapError(false);

    const initMap = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        const container = document.getElementById(containerId);
        if (!container) {
          console.warn(`地图容器 ${containerId} 未找到`);
          setMapError(true);
          setLoading(false);
          return;
        }

        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // 清除之前的地图实例
        if (amapService.map) {
          try {
            amapService.destroy();
            markersRef.current = [];
          } catch (destroyError) {
            console.warn('清理旧地图时出错:', destroyError);
          }
        }

        // 计算合适的缩放级别和中心点
        const zoomLevel = coordinates.length > 5 ? 13 : 12;
        const centerLng = coordinates.reduce((sum, coord) => sum + coord.lnglat[0], 0) / coordinates.length;
        const centerLat = coordinates.reduce((sum, coord) => sum + coord.lnglat[1], 0) / coordinates.length;
        
        // 初始化地图
        mapRef.current = await amapService.initMap(containerId, { 
          zoom: zoomLevel,
          center: [centerLng, centerLat],
          resizeEnable: true,
          viewMode: '2D',
          mapStyle: 'amap://styles/normal'
        });

        if (!amapService.mapLoaded || !amapService.map) {
          throw new Error('地图加载失败');
        }

        // 创建信息窗口
        infoWindowRef.current = new window.AMap.InfoWindow({
          offset: new window.AMap.Pixel(0, -30),
          closeWhenClickMap: true
        });

        // 添加标记点 - 显示图标和名称
        coordinates.forEach((coord, idx) => {
          try {
            if (!coord.lnglat || !Array.isArray(coord.lnglat) || coord.lnglat.length !== 2) {
              return;
            }
            
            const markerColor = getMarkerColor(coord.type);
            const icon = getActivityIcon(coord.type);
            const truncatedName = truncateLocationName(coord.name);
            
            const marker = amapService.addMarker(coord.lnglat, {
              title: ` ${coord.name} - ${coord.address}`,
              content: `
                <div class="custom-icon-marker" style="border-color: ${markerColor}">
                  <div class="marker-icon">${icon}</div>
                  <div class="marker-name" style="background: ${markerColor}">${truncatedName}</div>
                </div>
              `,
            });

            // 添加点击事件
            marker.on('click', () => {
              setSelectedLocation(coord);
              infoWindowRef.current.setContent(createInfoWindowContent(coord));
              infoWindowRef.current.open(amapService.map, coord.lnglat);
            });

            markersRef.current.push(marker);
          } catch (markerError) {
            console.warn(`添加标记点 ${idx} 时出错:`, markerError);
          }
        });

        // // 绘制蓝色路线
        // if (coordinates.length > 1) {
        //   try {
        //     const path = coordinates.map(coord => coord.lnglat);
        //     amapService.drawPolyline(path, { 
        //       strokeColor: '#1890ff',
        //       strokeWeight: 6,
        //       strokeOpacity: 0.8,
        //       strokeStyle: 'solid',
        //       lineJoin: 'round',
        //       lineCap: 'round'
        //     });
        //   } catch (polylineError) {
        //     console.warn('绘制路线时出错:', polylineError);
        //   }
        // }
        // 绘制路线 - 修改为类似高德地图的样式
        if (coordinates.length > 1) {
          try {
            const path = coordinates.map(coord => coord.lnglat);
            amapService.drawPolyline(path, { 
              strokeColor: '#1890ff',        // 蓝色路线
              strokeWeight: 5,               // 增加线宽
              strokeOpacity: 0.9,            // 增加不透明度
              strokeStyle: 'solid',          // 实线
              lineJoin: 'round',             // 圆角连接
              lineCap: 'round',              // 圆角端点
              borderWeight: 2,               // 边框宽度
              showDir: true,              
              dirColor: '#ffffffff',         // 箭头颜色
              
              
            });
          } catch (polylineError) {
            console.warn('绘制路线时出错:', polylineError);
          }
        }

        // 调整视野
        try {
          if (coordinates.length > 0) {
            amapService.map.setFitView(null, false, [80, 80, 80, 80], 100);
          }
        } catch (fitViewError) {
          console.warn('调整视野时出错:', fitViewError);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('地图初始化失败:', error);
        setMapError(true);
        setLoading(false);
      }
    };

    initMap();

    return () => {
      if (amapService.mapLoaded && amapService.map) {
        try {
          setTimeout(() => {
            amapService.destroy();
            markersRef.current = [];
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
            minHeight: '600px'
          }}
        />
      </div>
      
      <div className="map-footer">
        <div className="route-info">
          <div className="route-line" style={{ background: '#1890ff' }}></div>
          <span className="route-text">蓝色路线为建议游览顺序</span>
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
            <div 
              key={index} 
              className={`location-item ${selectedLocation?.id === location.id ? 'selected' : ''}`}
              onClick={() => setSelectedLocation(location)}
            >
              <div 
                className="location-marker"
                style={{ background: getMarkerColor(location.type) }}
              >
                {getActivityIcon(location.type)}
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