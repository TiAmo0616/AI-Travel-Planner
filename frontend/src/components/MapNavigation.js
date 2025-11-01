// // [file name]: src/pages/MapNavigation.js (优化版)
// import React, { useState, useEffect, useRef } from 'react';
// import {
//   Card,
//   Input,
//   Button,
//   Select,
//   Space,
//   message,
//   Spin,
//   List,
//   Typography,
//   Divider,
//   Row,
//   Col,
//   Tag,
//   Alert,
//   Modal
// } from 'antd';
// import {
//   EnvironmentOutlined,
//   SearchOutlined,
//   AimOutlined,
//   CarOutlined,
//   UserOutlined,
//   DashboardOutlined,
//   InfoCircleOutlined,
//   EditOutlined
// } from '@ant-design/icons';

// const { Text, Title } = Typography;
// const { Option } = Select;
// const { Search } = Input;

// // 地图配置常量
// const MAP_CONFIG = {
//   // 从环境变量获取，如果没有则使用空字符串（生产环境应该配置环境变量）
//   AMAP_KEY: process.env.REACT_APP_AMAP_KEY || '',
//   AMAP_SECURITY_CODE: process.env.REACT_APP_AMAP_SECURITY_CODE || '',
//   AMAP_VERSION: '2.0',
  
//   // 默认配置
//   DEFAULT_CENTER: [116.397428, 39.90923], // 北京中心
//   DEFAULT_ZOOM: 12,
  
//   // 插件列表
//   PLUGINS: [
//     'AMap.Geolocation',
//     'AMap.PlaceSearch', 
//     'AMap.Driving',
//     'AMap.Walking',
//     'AMap.Transfer',
//     'AMap.Marker',
//     'AMap.Polyline',
//     'AMap.Geocoder',
//     'AMap.CitySearch'
//   ].join(',')
// };

// function MapNavigation() {
//   const mapRef = useRef(null);
//   const [mapLoaded, setMapLoaded] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [searchResults, setSearchResults] = useState([]);
//   const [selectedPlace, setSelectedPlace] = useState(null);
//   const [routeMode, setRouteMode] = useState('driving');
//   const [routeInfo, setRouteInfo] = useState(null);
//   const [mapInstance, setMapInstance] = useState(null);
//   const [markers, setMarkers] = useState([]);
//   const [routeLayer, setRouteLayer] = useState(null);
//   const [amapLoaded, setAmapLoaded] = useState(false);
//   const [customStartPointModal, setCustomStartPointModal] = useState(false);
//   const [customStartPoint, setCustomStartPoint] = useState(null);
//   const [startPointSearchResults, setStartPointSearchResults] = useState([]);
//   const [configValid, setConfigValid] = useState(false);

//   // 验证配置
//   useEffect(() => {
//     const isValid = !!MAP_CONFIG.AMAP_KEY && !!MAP_CONFIG.AMAP_SECURITY_CODE;
//     setConfigValid(isValid);
    
//     if (!isValid) {
//       console.warn('高德地图配置不完整，请检查环境变量');
//       message.warning('地图配置不完整，部分功能可能无法使用');
//     }
//   }, []);

//   // 动态加载高德地图JS API
//   useEffect(() => {
//     if (!MAP_CONFIG.AMAP_KEY) {
//       message.error('高德地图Key未配置，请检查环境变量 REACT_APP_AMAP_KEY');
//       return;
//     }

//     const loadAmapScript = () => {
//       // 检查是否已经加载
//       if (window.AMap) {
//         setAmapLoaded(true);
//         return;
//       }

//       // 设置安全配置
//       window._AMapSecurityConfig = {
//         securityJsCode: MAP_CONFIG.AMAP_SECURITY_CODE,
//       };

//       // 创建script标签
//       const script = document.createElement('script');
//       script.type = 'text/javascript';
//       script.src = `https://webapi.amap.com/maps?v=${MAP_CONFIG.AMAP_VERSION}&key=${MAP_CONFIG.AMAP_KEY}&plugin=${MAP_CONFIG.PLUGINS}`;
//       script.async = true;
      
//       script.onload = () => {
//         console.log('高德地图API加载成功');
//         setAmapLoaded(true);
//       };
      
//       script.onerror = () => {
//         console.error('高德地图API加载失败');
//         message.error('地图API加载失败，请检查网络连接和配置');
//       };
      
//       document.head.appendChild(script);
//     };

//     loadAmapScript();
//   }, []);

//   // 初始化地图
//   useEffect(() => {
//     const initMap = async () => {
//       if (!amapLoaded || !window.AMap) {
//         console.log('等待高德地图API加载...');
//         return;
//       }

//       try {
//         setLoading(true);
        
//         // 创建地图实例
//         const map = new window.AMap.Map('map-container', {
//           zoom: MAP_CONFIG.DEFAULT_ZOOM,
//           center: MAP_CONFIG.DEFAULT_CENTER,
//           viewMode: '2D'
//         });

//         setMapInstance(map);
//         setMapLoaded(true);
//         message.success('地图服务准备就绪');

//       } catch (error) {
//         console.error('地图初始化失败:', error);
//         message.error('地图加载失败');
//       } finally {
//         setLoading(false);
//       }
//     };

//     initMap();

//     // 清理函数
//     return () => {
//       if (mapInstance) {
//         mapInstance.destroy();
//       }
//     };
//   }, [amapLoaded]);

//   // 清除地图上的标记和路线
//   const clearMapOverlays = () => {
//     if (mapInstance && window.AMap) {
//       // 清除标记
//       markers.forEach(marker => {
//         mapInstance.remove(marker);
//       });
//       setMarkers([]);
      
//       // 清除路线
//       if (routeLayer) {
//         if (Array.isArray(routeLayer)) {
//           routeLayer.forEach(layer => {
//             mapInstance.remove(layer);
//           });
//         } else {
//           mapInstance.remove(routeLayer);
//         }
//         setRouteLayer(null);
//       }
//     }
//   };

//   // 获取真实当前位置
//   const handleGetLocation = async () => {
//     if (!mapInstance || !window.AMap) {
//       message.error('地图未初始化完成，请稍后重试');
//       return;
//     }

//     try {
//       setLoading(true);
      
//       return new Promise((resolve) => {
//         // 使用高德地图定位插件
//         const geolocation = new window.AMap.Geolocation({
//           enableHighAccuracy: false, 
//           timeout: 10000,
//           maximumAge: 0,
//           noIpLocate: false,           // 启用IP定位
//           noGeoLocation: true,         // 禁用浏览器HTML5定位！！！
//           convert: true,
//           useNative: false             // 禁用原生定位
//         });

//         mapInstance.addControl(geolocation);

//         geolocation.getCurrentPosition(async (status, result) => {
//           if (status === 'complete') {
//             const position = {
//               position: {
//                 lng: result.position.lng,
//                 lat: result.position.lat
//               },
//               formattedAddress: result.formattedAddress,
//               accuracy: result.accuracy,
//               isCustom: false
//             };

//             setCurrentLocation(position);
//             setCustomStartPoint(null); // 清除自定义起点
            
//             // 清除旧标记
//             clearMapOverlays();
            
//             // 在地图上添加定位标记
//             const marker = new window.AMap.Marker({
//               position: [result.position.lng, result.position.lat],
//               title: '我的位置',
//               content: `
//                 <div style="
//                   background-color: #1890ff; 
//                   width: 20px; 
//                   height: 20px; 
//                   border-radius: 50%; 
//                   border: 3px solid white; 
//                   box-shadow: 0 2px 6px rgba(0,0,0,0.3);
//                 "></div>
//               `
//             });
            
//             mapInstance.add(marker);
//             mapInstance.setCenter([result.position.lng, result.position.lat]);
//             mapInstance.setZoom(15);
//             setMarkers([marker]);
            
//             message.success('定位成功');
//             resolve(result);
//           } else {
//             console.error('定位失败:', result);
            
//             // 显示详细的定位失败提示
//             let errorMessage = '定位失败，';
//             if (result && result.message) {
//               if (result.message.includes('权限')) {
//                 errorMessage += '请检查定位权限设置或允许浏览器访问位置信息';
//               } else if (result.message.includes('超时')) {
//                 errorMessage += '定位请求超时，请检查网络连接或重试';
//               } else if (result.message.includes('不可用')) {
//                 errorMessage += '定位服务不可用，请检查设备定位功能是否开启';
//               } else {
//                 errorMessage += result.message;
//               }
//             } else {
//               errorMessage += '请检查定位权限和网络连接';
//             }
            
//             message.error(errorMessage);
            
//             // 如果定位失败，使用IP定位作为备选
//             try {
//               const ipResult = await getLocationByIP();
//               if (ipResult) {
//                 const position = {
//                   position: {
//                     lng: ipResult.lng,
//                     lat: ipResult.lat
//                   },
//                   formattedAddress: ipResult.formattedAddress,
//                   accuracy: 1000, // IP定位精度较低
//                   isCustom: false
//                 };
                
//                 setCurrentLocation(position);
//                 message.warning('精确定位失败，使用IP定位（精度较低）');
                
//                 // 在地图上显示IP定位位置
//                 const marker = new window.AMap.Marker({
//                   position: [ipResult.lng, ipResult.lat],
//                   title: 'IP定位位置',
//                   content: `
//                     <div style="
//                       background-color: #faad14; 
//                       width: 18px; 
//                       height: 18px; 
//                       border-radius: 50%; 
//                       border: 2px solid white; 
//                       box-shadow: 0 2px 6px rgba(0,0,0,0.3);
//                     "></div>
//                   `
//                 });
                
//                 mapInstance.add(marker);
//                 mapInstance.setCenter([ipResult.lng, ipResult.lat]);
//                 mapInstance.setZoom(12);
//                 setMarkers([marker]);
//               } else {
//                 // 如果IP定位也失败，提示用户手动设置起点
//                 Modal.warning({
//                   title: '定位失败',
//                   content: (
//                     <div>
//                       <p>无法获取您的位置信息，可能的原因：</p>
//                       <ul>
//                         <li>• 浏览器定位权限未开启</li>
//                         <li>• 设备定位功能未开启</li>
//                         <li>• 网络连接问题</li>
//                         <li>• 定位服务暂时不可用</li>
//                       </ul>
//                       <p>您可以通过以下方式继续使用：</p>
//                       <ol>
//                         <li>1. 检查并开启浏览器定位权限</li>
//                         <li>2. 点击"手动设置起点"按钮输入起始位置</li>
//                         <li>3. 刷新页面后重试</li>
//                       </ol>
//                     </div>
//                   ),
//                   okText: '手动设置起点',
//                   onOk: () => setCustomStartPointModal(true)
//                 });
//               }
//             } catch (ipError) {
//               console.error('IP定位失败:', ipError);
//               message.error('定位失败，请手动设置起点');
//               setCustomStartPointModal(true);
//             }
//           }
//           setLoading(false);
//         });
//       });

//     } catch (error) {
//       console.error('获取位置失败:', error);
//       message.error('获取位置失败，请手动设置起点');
//       setCustomStartPointModal(true);
//       setLoading(false);
//     }
//   };

//   // IP定位备选方案
//   const getLocationByIP = () => {
//     return new Promise((resolve) => {
//       // 使用高德IP定位
//       window.AMap.plugin('AMap.CitySearch', () => {
//         const citySearch = new window.AMap.CitySearch();
//         citySearch.getLocalCity((status, result) => {
//           if (status === 'complete' && result.city) {
//             // 根据城市名称获取坐标
//             const geocoder = new window.AMap.Geocoder({
//               city: result.city
//             });
            
//             geocoder.getLocation(result.city, (geoStatus, geoResult) => {
//               if (geoStatus === 'complete' && geoResult.geocodes.length > 0) {
//                 const location = geoResult.geocodes[0].location;
//                 resolve({
//                   lng: location.lng,
//                   lat: location.lat,
//                   formattedAddress: result.city
//                 });
//               } else {
//                 resolve(null);
//               }
//             });
//           } else {
//             resolve(null);
//           }
//         });
//       });
//     });
//   };

//   // 搜索起始点
//   const handleSearchStartPoint = async (keyword) => {
//     if (!keyword.trim()) return;
//     if (!mapInstance || !window.AMap) {
//       message.error('地图未初始化完成');
//       return;
//     }

//     try {
//       setLoading(true);
      
//       return new Promise((resolve) => {
//         window.AMap.plugin('AMap.PlaceSearch', () => {
//           const placeSearch = new window.AMap.PlaceSearch({
//             pageSize: 5,
//             city: '全国',
//             map: mapInstance
//           });

//           placeSearch.search(keyword, (status, result) => {
//             if (status === 'complete' && result.poiList && result.poiList.pois) {
//               const places = result.poiList.pois.map(poi => ({
//                 id: poi.id,
//                 name: poi.name,
//                 address: poi.address,
//                 location: { lng: poi.location.lng, lat: poi.location.lat },
//                 type: poi.type,
//                 tel: poi.tel
//               }));
              
//               setStartPointSearchResults(places);
//               message.success(`找到 ${places.length} 个相关地点`);
//             } else {
//               message.error('搜索失败或未找到结果');
//               setStartPointSearchResults([]);
//             }
//             setLoading(false);
//             resolve();
//           });
//         });
//       });

//     } catch (error) {
//       console.error('搜索失败:', error);
//       message.error('搜索失败');
//       setLoading(false);
//     }
//   };

//   // 选择起始点
//   const handleSelectStartPoint = (place) => {
//     const position = {
//       position: {
//         lng: place.location.lng,
//         lat: place.location.lat
//       },
//       formattedAddress: `${place.name} (${place.address})`,
//       accuracy: 50, // 手动选择的精度较高
//       isCustom: true
//     };

//     setCustomStartPoint(position);
//     setCurrentLocation(position);
//     setCustomStartPointModal(false);
//     setStartPointSearchResults([]);

//     // 清除旧标记
//     clearMapOverlays();
    
//     // 在地图上添加起始点标记
//     const marker = new window.AMap.Marker({
//       position: [place.location.lng, place.location.lat],
//       title: `起点: ${place.name}`,
//       content: `
//         <div style="
//           background-color: #52c41a; 
//           width: 18px; 
//           height: 18px; 
//           border-radius: 50%; 
//           border: 2px solid white; 
//           box-shadow: 0 2px 6px rgba(0,0,0,0.3);
//         "></div>
//       `
//     });
    
//     mapInstance.add(marker);
//     mapInstance.setCenter([place.location.lng, place.location.lat]);
//     mapInstance.setZoom(15);
//     setMarkers([marker]);
    
//     message.success(`已设置起点: ${place.name}`);
//   };

//   // 真实地点搜索
//   const handleSearch = async (keyword) => {
//     if (!keyword.trim()) {
//       message.warning('请输入搜索关键词');
//       return;
//     }

//     if (!MAP_CONFIG.AMAP_KEY) {
//       message.error('地图配置不完整，无法进行搜索');
//       return;
//     }
  
//     try {
//       setLoading(true);
      
//       // 直接进行搜索测试
//       const places = await new Promise((resolve) => {
//         const placeSearch = new window.AMap.PlaceSearch({
//           pageSize: 10,
//           city: '全国',
//           pageIndex: 1,
//           map: mapInstance,
//           extensions: 'all'
//         });

//         placeSearch.search(keyword, (status, result) => {
//           if (status === 'complete' && result.poiList && result.poiList.pois) {
//             const places = result.poiList.pois.map((poi, index) => ({
//               id: poi.id || `poi_${index}_${Date.now()}`,
//               name: poi.name,
//               address: poi.address,
//               location: { 
//                 lng: poi.location?.lng || 0, 
//                 lat: poi.location?.lat || 0 
//               },
//               type: poi.type,
//               tel: poi.tel || '',
//               distance: poi.distance || 0
//             }));
//             resolve(places);
//           } else {
//             resolve([]);
//           }
//         });
//       });

//       if (places.length > 0) {
//         setSearchResults(places);
//         message.success(`找到 ${places.length} 个相关地点`);
        
//         // 清除旧标记
//         clearMapOverlays();
        
//         // 添加新标记
//         const newMarkers = places.map(place => {
//           const marker = new window.AMap.Marker({
//             position: [place.location.lng, place.location.lat],
//             title: place.name,
//             content: `
//               <div style="
//                 background-color: #ff4d4f; 
//                 width: 16px; 
//                 height: 16px; 
//                 border-radius: 50%; 
//                 border: 2px solid white; 
//                 box-shadow: 0 2px 6px rgba(0,0,0,0.3);
//                 cursor: pointer;
//               "></div>
//             `
//           });
          
//           marker.on('click', () => {
//             handleSelectPlace(place);
//           });
          
//           return marker;
//         });
        
//         newMarkers.forEach(marker => mapInstance.add(marker));
//         setMarkers(newMarkers);
        
//         // 调整地图视野显示所有结果
//         if (places.length > 0) {
//           mapInstance.setFitView();
//         }
        
//       } else {
//         // 如果 PlaceSearch 没有结果，尝试 Geocoder
//         const geocoderPlaces = await searchWithGeocoder(keyword);
        
//         if (geocoderPlaces.length > 0) {
//           setSearchResults(geocoderPlaces);
//           message.success(`找到 ${geocoderPlaces.length} 个相关地点（地理编码）`);
//           // ... 同样的标记显示逻辑
//         } else {
//           message.warning('未找到相关地点');
//           setSearchResults([]);
//         }
//       }
      
//       setLoading(false);

//     } catch (error) {
//       console.error('搜索过程出错:', error);
//       message.error('搜索失败');
//       setLoading(false);
//     }
//   };

//   // Geocoder 备选方案
//   const searchWithGeocoder = (keyword) => {
//     return new Promise((resolve) => {
//       const geocoder = new window.AMap.Geocoder({
//         city: '全国'
//       });

//       geocoder.getLocation(keyword, (status, result) => {
//         if (status === 'complete' && result.geocodes && result.geocodes.length > 0) {
//           const places = result.geocodes.map((geo, index) => ({
//             id: `geo_${index}_${Date.now()}`,
//             name: geo.formattedAddress,
//             address: geo.formattedAddress,
//             location: { lng: geo.location.lng, lat: geo.location.lat },
//             type: '地点',
//             tel: '',
//             distance: 0
//           }));
//           resolve(places);
//         } else {
//           resolve([]);
//         }
//       });
//     });
//   };

//   // 选择地点
//   const handleSelectPlace = (place) => {
//     setSelectedPlace(place);
    
//     // 移动地图中心到选中地点
//     if (mapInstance) {
//       mapInstance.setCenter([place.location.lng, place.location.lat]);
//       mapInstance.setZoom(15);
//     }
    
//     message.success(`已选择: ${place.name}`);
//   };

//   // 真实路线规划
//   const handlePlanRoute = async () => {
//     if (!currentLocation || !selectedPlace) {
//       message.warning('请先获取当前位置并选择目的地');
//       return;
//     }

//     if (!mapInstance || !window.AMap) {
//       message.error('地图未初始化完成');
//       return;
//     }

//     try {
//       setLoading(true);
      
//       // 清除旧路线
//       clearMapOverlays();

//       return new Promise((resolve) => {
//         const start = [currentLocation.position.lng, currentLocation.position.lat];
//         const end = [selectedPlace.location.lng, selectedPlace.location.lat];

//         switch (routeMode) {
//           case 'driving':
//             window.AMap.plugin('AMap.Driving', () => {
//               const driving = new window.AMap.Driving({
//                 map: mapInstance,
//                 policy: window.AMap.DrivingPolicy.LEAST_TIME,
//                 hideMarkers: false,
//                 showTraffic: true
//               });
              
//               driving.search(start, end, (status, result) => {
//                 handleRouteResult(status, result, '驾车');
//                 resolve();
//               });
//             });
//             break;
            
//           case 'walking':
//             window.AMap.plugin('AMap.Walking', () => {
//               const walking = new window.AMap.Walking({
//                 map: mapInstance,
//                 hideMarkers: false
//               });
              
//               walking.search(start, end, (status, result) => {
//                 handleRouteResult(status, result, '步行');
//                 resolve();
//               });
//             });
//             break;
            
//           case 'transit':
//             window.AMap.plugin('AMap.Transfer', () => {
//               const transfer = new window.AMap.Transfer({
//                 map: mapInstance,
//                 city: '北京',
//                 policy: window.AMap.TransferPolicy.LEAST_TIME,
//                 hideMarkers: false
//               });
              
//               transfer.search(start, end, (status, result) => {
//                 handleRouteResult(status, result, '公交');
//                 resolve();
//               });
//             });
//             break;
            
//           default:
//             message.error('不支持的路线模式');
//             setLoading(false);
//             resolve();
//         }
//       });

//     } catch (error) {
//       console.error('路线规划失败:', error);
//       message.error('路线规划失败');
//       setLoading(false);
//     }
//   };

//   // 处理路线规划结果
//   const handleRouteResult = (status, result, mode) => {
//     if (status === 'complete') {
//       setRouteInfo(result);
//       message.success(`${mode}路线规划成功`);
//     } else {
//       console.error('路线规划失败:', result);
//       message.error('路线规划失败，请重试');
//     }
//     setLoading(false);
//   };

//   // 清除路线
//   const handleClearRoute = () => {
//     setRouteInfo(null);
//     setSelectedPlace(null);
//     setSearchResults([]);
//     setCustomStartPoint(null);
//     if (!currentLocation?.isCustom) {
//       setCurrentLocation(null);
//     }
    
//     // 清除地图上的路线和标记
//     clearMapOverlays();
    
//     // 重置地图中心
//     if (mapInstance) {
//       mapInstance.setZoom(MAP_CONFIG.DEFAULT_ZOOM);
//       mapInstance.setCenter(MAP_CONFIG.DEFAULT_CENTER);
//     }
    
//     message.info('已清除路线');
//   };

//   // 渲染配置状态提示
//   const renderConfigAlert = () => {
//     if (!MAP_CONFIG.AMAP_KEY) {
//       return (
//         <Alert
//           message="配置提示"
//           description="请配置环境变量 REACT_APP_AMAP_KEY 和 REACT_APP_AMAP_SECURITY_CODE 以使用完整功能"
//           type="warning"
//           showIcon
//           style={{ marginBottom: 24 }}
//         />
//       );
//     }

//     return (
//       <Alert
//         message="高德地图实时导航"
//         description={
//           amapLoaded 
//             ? "地图API加载成功，支持真实定位、搜索和路线规划功能。"
//             : "正在加载地图API，请稍候..."
//         }
//         type={amapLoaded ? "success" : "info"}
//         showIcon
//         icon={<InfoCircleOutlined />}
//         style={{ marginBottom: 24 }}
//       />
//     );
//   };

//   return (
//     <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
//       <Card>
//         <Title level={2}>🗺️ 地图导航</Title>
        
//         {renderConfigAlert()}
        
//         {/* 搜索和操作栏 */}
//         <Row gutter={16} style={{ marginBottom: 24 }}>
//           <Col span={8}>
//             <Search
//               placeholder="搜索地点（如：故宫、天安门）"
//               enterButton={<SearchOutlined />}
//               onSearch={handleSearch}
//               loading={loading}
//               disabled={!amapLoaded || !MAP_CONFIG.AMAP_KEY}
//             />
//           </Col>
//           <Col span={8}>
//             <Space>
//               <Button 
//                 icon={<AimOutlined />} 
//                 onClick={handleGetLocation}
//                 loading={loading}
//                 disabled={!amapLoaded || !MAP_CONFIG.AMAP_KEY}
//               >
//                 我的位置
//               </Button>
//               <Button 
//                 icon={<EditOutlined />}
//                 onClick={() => setCustomStartPointModal(true)}
//                 disabled={!amapLoaded || !MAP_CONFIG.AMAP_KEY}
//               >
//                 手动设置起点
//               </Button>
//               <Select 
//                 value={routeMode} 
//                 onChange={setRouteMode}
//                 style={{ width: 120 }}
//                 disabled={!amapLoaded || !MAP_CONFIG.AMAP_KEY}
//               >
//                 <Option value="driving"><CarOutlined /> 驾车</Option>
//                 <Option value="walking"><UserOutlined /> 步行</Option>
//                 <Option value="transit"><DashboardOutlined /> 公交</Option>
//               </Select>
//             </Space>
//           </Col>
//           <Col span={8} style={{ textAlign: 'right' }}>
//             <Space>
//               <Button onClick={handleClearRoute} disabled={!amapLoaded || !MAP_CONFIG.AMAP_KEY}>
//                 清除路线
//               </Button>
//               <Button 
//                 type="primary" 
//                 onClick={handlePlanRoute}
//                 disabled={!currentLocation || !selectedPlace || !amapLoaded || !MAP_CONFIG.AMAP_KEY}
//                 loading={loading}
//               >
//                 开始导航
//               </Button>
//             </Space>
//           </Col>
//         </Row>

//         {/* 地图和搜索结果 */}
//         <Row gutter={16}>
//           {/* 地图容器 */}
//           <Col span={16}>
//             <Card 
//               title="地图视图" 
//               style={{ height: 500 }}
//               bodyStyle={{ padding: 0, position: 'relative' }}
//             >
//               {(!amapLoaded || !MAP_CONFIG.AMAP_KEY) && (
//                 <div style={{ 
//                   position: 'absolute', 
//                   top: '50%', 
//                   left: '50%', 
//                   transform: 'translate(-50%, -50%)',
//                   zIndex: 1000 
//                 }}>
//                   <Spin size="large" tip={!MAP_CONFIG.AMAP_KEY ? "等待配置..." : "地图API加载中..."} />
//                 </div>
//               )}
//               <div 
//                 id="map-container" 
//                 ref={mapRef}
//                 style={{ 
//                   width: '100%', 
//                   height: 500,
//                   borderRadius: 8,
//                   background: !amapLoaded ? '#f5f5f5' : 'none'
//                 }}
//               >
//                 {!amapLoaded && (
//                   <div style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     height: '100%',
//                     color: '#999'
//                   }}>
//                     <Spin size="large" tip="加载高德地图..." />
//                   </div>
//                 )}
//               </div>
//             </Card>
//           </Col>

//           {/* 搜索结果和路线信息 */}
//           <Col span={8}>
//             <Card title="搜索结果" style={{ marginBottom: 16, height: 240, overflow: 'auto' }}>
//               {searchResults.length > 0 ? (
//                 <List
//                   dataSource={searchResults}
//                   renderItem={(place) => (
//                     <List.Item 
//                       style={{ 
//                         cursor: 'pointer',
//                         padding: '8px 12px',
//                         border: '1px solid #f0f0f0',
//                         borderRadius: 4,
//                         marginBottom: 4,
//                         background: selectedPlace?.id === place.id ? '#f0f7ff' : 'white'
//                       }}
//                       onClick={() => handleSelectPlace(place)}
//                     >
//                       <List.Item.Meta
//                         avatar={<EnvironmentOutlined style={{ color: '#1890ff' }} />}
//                         title={place.name}
//                         description={
//                           <div>
//                             <Text type="secondary" style={{ fontSize: 12 }}>{place.address}</Text>
//                             <br />
//                             <Tag color="blue" size="small">
//                               {place.type || '地点'}
//                             </Tag>
//                             {place.tel && (
//                               <Tag color="green" size="small">
//                                 📞 {place.tel}
//                               </Tag>
//                             )}
//                             {place.distance && (
//                               <Tag color="orange" size="small">
//                                 {place.distance}米
//                               </Tag>
//                             )}
//                           </div>
//                         }
//                       />
//                     </List.Item>
//                   )}
//                 />
//               ) : (
//                 <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
//                   <SearchOutlined style={{ fontSize: 24, marginBottom: 8 }} />
//                   <div>输入关键词搜索地点</div>
//                 </div>
//               )}
//             </Card>

//             {/* 路线信息 */}
//             {routeInfo && (
//               <Card title="路线信息" style={{ marginBottom: 16 }}>
//                 {routeInfo.routes && routeInfo.routes.map((route, index) => (
//                   <div key={index}>
//                     <Space direction="vertical" style={{ width: '100%' }}>
//                       <div>
//                         <Text strong>距离: </Text>
//                         <Text>{(route.distance / 1000).toFixed(1)} km</Text>
//                       </div>
//                       <div>
//                         <Text strong>时间: </Text>
//                         <Text>{Math.ceil(route.time / 60)} 分钟</Text>
//                       </div>
//                       {route.taxi_cost && (
//                         <div>
//                           <Text strong>费用: </Text>
//                           <Text>{route.taxi_cost} 元</Text>
//                         </div>
//                       )}
//                     </Space>
                    
//                     <Divider style={{ margin: '12px 0' }} />
                    
//                     <Text strong>导航步骤:</Text>
//                     <List
//                       size="small"
//                       dataSource={route.steps || []}
//                       renderItem={(step, stepIndex) => (
//                         <List.Item style={{ padding: '4px 0' }}>
//                           <Text type="secondary" style={{ minWidth: 20 }}>{stepIndex + 1}.</Text>
//                           <Text style={{ marginLeft: 8, fontSize: 12 }}>{step.instruction}</Text>
//                         </List.Item>
//                       )}
//                       style={{ maxHeight: 120, overflow: 'auto', marginTop: 8 }}
//                     />
//                   </div>
//                 ))}
//               </Card>
//             )}

//             {/* 当前位置信息 */}
//             {currentLocation && (
//               <Card title={currentLocation.isCustom ? "设置的起点" : "当前位置"}>
//                 <Space direction="vertical">
//                   <div>
//                     <Text strong>地址: </Text>
//                     <Text>{currentLocation.formattedAddress}</Text>
//                   </div>
//                   <div>
//                     <Text strong>坐标: </Text>
//                     <Text type="secondary">
//                       {currentLocation.position.lng.toFixed(6)}, {currentLocation.position.lat.toFixed(6)}
//                     </Text>
//                   </div>
//                   <div>
//                     <Text strong>精度: </Text>
//                     <Text type="secondary">{currentLocation.accuracy}米</Text>
//                   </div>
//                   {currentLocation.isCustom && (
//                     <Tag color="green">手动设置</Tag>
//                   )}
//                 </Space>
//               </Card>
//             )}
//           </Col>
//         </Row>

//         {/* 手动设置起点模态框 */}
//         <Modal
//           title="手动设置起点"
//           open={customStartPointModal}
//           onCancel={() => {
//             setCustomStartPointModal(false);
//             setStartPointSearchResults([]);
//           }}
//           footer={null}
//           width={600}
//         >
//           <div style={{ marginBottom: 16 }}>
//             <Search
//               placeholder="输入起点位置（如：北京西站、天安门）"
//               enterButton={<SearchOutlined />}
//               onSearch={handleSearchStartPoint}
//               loading={loading}
//               disabled={!MAP_CONFIG.AMAP_KEY}
//             />
//           </div>
          
//           {startPointSearchResults.length > 0 ? (
//             <List
//               dataSource={startPointSearchResults}
//               renderItem={(place) => (
//                 <List.Item 
//                   style={{ 
//                     cursor: 'pointer',
//                     padding: '8px 12px',
//                     border: '1px solid #f0f0f0',
//                     borderRadius: 4,
//                     marginBottom: 4
//                   }}
//                   onClick={() => handleSelectStartPoint(place)}
//                 >
//                   <List.Item.Meta
//                     avatar={<EnvironmentOutlined style={{ color: '#52c41a' }} />}
//                     title={place.name}
//                     description={
//                       <div>
//                         <Text type="secondary" style={{ fontSize: 12 }}>{place.address}</Text>
//                         <br />
//                         <Tag color="green" size="small">
//                           {place.type || '地点'}
//                         </Tag>
//                         {place.tel && (
//                           <Tag color="blue" size="small">
//                             📞 {place.tel}
//                           </Tag>
//                         )}
//                       </div>
//                     }
//                   />
//                 </List.Item>
//               )}
//               style={{ maxHeight: 300, overflow: 'auto' }}
//             />
//           ) : (
//             <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
//               <EnvironmentOutlined style={{ fontSize: 24, marginBottom: 8 }} />
//               <div>输入起点位置进行搜索</div>
//             </div>
//           )}
//         </Modal>

       
//       </Card>
//     </div>
//   );
// }

// export default MapNavigation;



// [file name]: src/pages/MapNavigation.js (修复路线重复显示问题)
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
  CarOutlined,
  UserOutlined,
  DashboardOutlined,
  InfoCircleOutlined,
  SwapOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;
const { Option } = Select;
const { Search } = Input;

// 地图配置常量
const MAP_CONFIG = {
  AMAP_KEY: process.env.REACT_APP_AMAP_KEY ,
  AMAP_SECURITY_CODE: process.env.REACT_APP_AMAP_SECURITY_CODE ,
  AMAP_VERSION: '2.0',
  DEFAULT_CENTER: [116.397428, 39.90923],
  DEFAULT_ZOOM: 12,
};



function MapNavigation() {
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [startSearchResults, setStartSearchResults] = useState([]);
  const [endSearchResults, setEndSearchResults] = useState([]);
  const [routeMode, setRouteMode] = useState('driving');
  const [routeInfo, setRouteInfo] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [amapLoaded, setAmapLoaded] = useState(false);
  const [activeSearchType, setActiveSearchType] = useState('start');

  // 存储路线规划实例的引用，用于后续清理
  const routeInstanceRef = useRef(null);
  // 在组件顶部添加ref
const startSearchRef = useRef(null);
const endSearchRef = useRef(null);

const [startKeyword, setStartKeyword] = useState('');
const [endKeyword, setEndKeyword] = useState('');

  // 动态加载高德地图JS API
  useEffect(() => {
    if (window.AMap) {
      setAmapLoaded(true);
      return;
    }

    // 设置安全配置
    if (MAP_CONFIG.AMAP_SECURITY_CODE) {
      window._AMapSecurityConfig = {
        securityJsCode: MAP_CONFIG.AMAP_SECURITY_CODE,
      };
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://webapi.amap.com/maps?v=${MAP_CONFIG.AMAP_VERSION}&key=${MAP_CONFIG.AMAP_KEY}`;
    script.async = true;
    
    script.onload = () => {
      console.log('高德地图API加载成功');
      setAmapLoaded(true);
    };
    
    script.onerror = () => {
      console.error('高德地图API加载失败');
      message.error('地图API加载失败');
    };
    
    document.head.appendChild(script);
  }, []);

  // 初始化地图
  useEffect(() => {
    if (!amapLoaded || !window.AMap) return;

    const initMap = () => {
      try {
        const map = new window.AMap.Map('map-container', {
          zoom: MAP_CONFIG.DEFAULT_ZOOM,
          center: MAP_CONFIG.DEFAULT_CENTER,
          viewMode: '2D'
        });

        setMapInstance(map);
        console.log('地图初始化成功');
      } catch (error) {
        console.error('地图初始化失败:', error);
        message.error('地图加载失败');
      }
    };

    initMap();

    return () => {
      if (mapInstance) {
        try {
          mapInstance.destroy();
        } catch (error) {
          console.error('地图销毁失败:', error);
        }
      }
    };
  }, [amapLoaded]);

    // 添加 useEffect 监听起点终点变化
    useEffect(() => {
      if (startPoint || endPoint) {
        updateMapDisplay();
      }
    }, [startPoint, endPoint]); // 当 startPoint 或 endPoint 变化时触发

  // 清除所有路线覆盖物 - 修复版本
 const clearRouteOverlays = () => {
  if (!mapInstance || !window.AMap) return;
  
  try {
    // 1. 清除路线规划实例
    if (routeInstanceRef.current) {
      try {
        if (typeof routeInstanceRef.current.clear === 'function') {
          routeInstanceRef.current.clear();
        }
        if (typeof routeInstanceRef.current.destroy === 'function') {
          routeInstanceRef.current.destroy();
        }
      } catch (error) {
        console.warn('清除路线实例失败:', error);
      }
      routeInstanceRef.current = null;
    }

    // 2. 清除地图上所有覆盖物（包括标记和路线）
    mapInstance.clearMap();
    
    // 3. 重置地图视图
    mapInstance.setZoom(MAP_CONFIG.DEFAULT_ZOOM);
    mapInstance.setCenter(MAP_CONFIG.DEFAULT_CENTER);
    
  } catch (error) {
    console.error('清除覆盖物失败:', error);
  }
};


  // 更新地图显示 - 只更新标记，不清除路线
  const updateMapDisplay = () => {
  if (!mapInstance || !window.AMap) return;
  
  console.log("🔄 updateMapDisplay 开始执行");
  console.log("📊 当前状态:", { startPoint, endPoint });
  
  try {
    // 清除地图上所有覆盖物
    mapInstance.clearMap();
    
    // 添加起点标记
    if (startPoint && startPoint.position) {
      console.log("📍 添加起点标记:", startPoint);
      const startMarker = new window.AMap.Marker({
        position: [startPoint.position.lng, startPoint.position.lat],
        title: `起点: ${startPoint.name}`,
        content: `
          <div style="
            background-color: #52c41a; 
            width: 20px; 
            height: 20px; 
            border-radius: 50%; 
            border: 2px solid white; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          "></div>
        `
      });
      mapInstance.add(startMarker);
    }
    
    // 添加终点标记
    if (endPoint && endPoint.position) {
      console.log("🎯 添加终点标记:", endPoint);
      const endMarker = new window.AMap.Marker({
        position: [endPoint.position.lng, endPoint.position.lat],
        title: `终点: ${endPoint.name}`,
        content: `
          <div style="
            background-color: #ff4d4f; 
            width: 20px; 
            height: 20px; 
            border-radius: 50%; 
            border: 2px solid white; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          "></div>
        `
      });
      mapInstance.add(endMarker);
    }
    
    // 🆕 安全调整地图视野
    safeAdjustMapView();
    
    console.log("✅ updateMapDisplay 执行完成");
    
  } catch (error) {
    console.error('❌ 更新地图显示失败:', error);
  }
};
// 🆕 安全调整地图视野函数
const safeAdjustMapView = () => {
  if (!mapInstance) return;
  
  try {
    if (startPoint && endPoint && startPoint.position && endPoint.position) {
      console.log("🗺️ 调整视野到起点终点范围");
      
      const startLng = startPoint.position.lng;
      const startLat = startPoint.position.lat;
      const endLng = endPoint.position.lng;
      const endLat = endPoint.position.lat;
      
      console.log("📍 坐标验证:", { startLng, startLat, endLng, endLat });
      
      // 🆕 方法1：使用 setFitView 自动适配（推荐）
      try {
        // 获取地图上所有的覆盖物（标记）
        const overlays = mapInstance.getAllOverlays();
        console.log("📋 当前覆盖物数量:", overlays.length);
        
        if (overlays.length > 0) {
          mapInstance.setFitView(overlays); // 自动适配所有覆盖物的视野
          console.log("✅ setFitView 执行成功");
        } else {
          console.log("⚠️ 没有覆盖物，使用中心点模式");
          fallbackToCenterView();
        }
      } catch (fitViewError) {
        console.warn('❌ setFitView失败，使用备选方案:', fitViewError);
        fallbackToCenterView();
      }
      
    } else if (startPoint && startPoint.position) {
      console.log("🗺️ 调整视野到起点");
      mapInstance.setCenter([startPoint.position.lng, startPoint.position.lat]);
      mapInstance.setZoom(15);
    } else if (endPoint && endPoint.position) {
      console.log("🗺️ 调整视野到终点");
      mapInstance.setCenter([endPoint.position.lng, endPoint.position.lat]);
      mapInstance.setZoom(15);
    }
  } catch (error) {
    console.error('❌ 调整地图视野失败:', error);
    fallbackToDefaultView();
  }
};

// 🆕 备选方案：中心点模式
const fallbackToCenterView = () => {
  if (!mapInstance) return;
  
  try {
    const startLng = startPoint.position.lng;
    const startLat = startPoint.position.lat;
    const endLng = endPoint.position.lng;
    const endLat = endPoint.position.lat;
    
    // 计算中心点
    const centerLng = (startLng + endLng) / 2;
    const centerLat = (startLat + endLat) / 2;
    
    // 计算合适的缩放级别（基于两点距离）
    const distance = Math.sqrt(
      Math.pow(endLng - startLng, 2) + Math.pow(endLat - startLat, 2)
    );
    
    let zoomLevel = 15;
    if (distance > 0.1) zoomLevel = 12;
    if (distance > 0.3) zoomLevel = 10;
    if (distance > 0.5) zoomLevel = 9;
    
    console.log("📍 使用中心点模式:", { centerLng, centerLat, zoomLevel, distance });
    
    mapInstance.setCenter([centerLng, centerLat]);
    mapInstance.setZoom(zoomLevel);
    
  } catch (error) {
    console.error('❌ 中心点模式也失败:', error);
    fallbackToDefaultView();
  }
};

// 🆕 最终备选：重置到默认视图
const fallbackToDefaultView = () => {
  if (!mapInstance) return;
  
  try {
    console.log("🔄 重置到默认视图");
    mapInstance.setZoom(MAP_CONFIG.DEFAULT_ZOOM);
    mapInstance.setCenter(MAP_CONFIG.DEFAULT_CENTER);
  } catch (error) {
    console.error('❌ 重置视图失败:', error);
  }
};
  // 搜索地点
  const handleSearch = async (keyword, type = 'start') => {
    if (!keyword.trim()) {
      message.warning('请输入搜索关键词');
      return;
    }

    if (!amapLoaded || !window.AMap) {
      message.error('地图未初始化完成');
      return;
    }

    try {
      setLoading(true);
      setActiveSearchType(type);

      // 动态加载搜索插件
      await new Promise((resolve) => {
        window.AMap.plugin(['AMap.PlaceSearch'], () => {
          resolve();
        });
      });

      const places = await new Promise((resolve) => {
        const placeSearch = new window.AMap.PlaceSearch({
          pageSize: 10,
          city: '全国',
          pageIndex: 1,
          extensions: 'base'
        });

        placeSearch.search(keyword, (status, result) => {
          if (status === 'complete' && result.poiList && result.poiList.pois) {
            const safePlaces = result.poiList.pois.map((poi, index) => {
              // 安全获取坐标
              let lng, lat;
              if (poi.location && typeof poi.location.lng === 'number' && typeof poi.location.lat === 'number') {
                lng = poi.location.lng;
                lat = poi.location.lat;
              } else {
                // 使用默认坐标
                lng = MAP_CONFIG.DEFAULT_CENTER[0];
                lat = MAP_CONFIG.DEFAULT_CENTER[1];
              }
              
              return {
                id: poi.id || `poi_${index}_${Date.now()}`,
                name: poi.name || '未知地点',
                address: poi.address || '地址不详',
                location: { lng, lat },
                type: poi.type || '地点',
                tel: poi.tel || '',
                distance: poi.distance || 0
              };
            });
            
            resolve(safePlaces);
          } else {
            resolve([]);
          }
        });
      });

      if (places.length > 0) {
        if (type === 'start') {
          setStartSearchResults(places);
        } else {
          setEndSearchResults(places);
        }
        message.success(`找到 ${places.length} 个相关地点`);
      } else {
        message.warning('未找到相关地点');
        if (type === 'start') {
          setStartSearchResults([]);
        } else {
          setEndSearchResults([]);
        }
      }

    } catch (error) {
      console.error('搜索失败:', error);
      message.error('搜索失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 选择起点或终点
  const handleSelectPoint = (place, type) => {
    const pointInfo = {
      id: place.id,
      position: {
        lng: place.location.lng,
        lat: place.location.lat
      },
      name: place.name,
      address: place.address,
      formattedAddress: `${place.name} (${place.address})`
    };
    console.log(pointInfo);
    console.log(type);
    if (type === 'start') {
      console.log("start,",pointInfo);
      setStartPoint(pointInfo);
      setStartSearchResults([]);
      message.success(`起点设置为: ${place.name}`);
    } else {
      setEndPoint(pointInfo);
      setEndSearchResults([]);
      message.success(`终点设置为: ${place.name}`);
    }

    // 立即更新地图显示（只更新标记）
   // updateMapDisplay();
  };

  // 交换起点和终点
  const handleSwapPoints = () => {
    if (!startPoint || !endPoint) {
      message.warning('请先设置起点和终点');
      return;
    }

    const temp = startPoint;
    setStartPoint(endPoint);
    setEndPoint(temp);
    message.success('起点终点已交换');
    updateMapDisplay();
  };

  // 路线规划 - 修复版本，清除旧路线
  const handlePlanRoute = async () => {
    if (!startPoint || !endPoint) {
      message.warning('请先设置起点和终点');
      return;
    }

    if (!amapLoaded || !window.AMap) {
      message.error('地图未初始化完成');
      return;
    }

    try {
      setLoading(true);

      // 清除之前的路线
      if (routeInfo) {
      clearRouteOverlays();
    }

      // 动态加载路线规划插件
      await new Promise((resolve) => {
        let pluginName;
        switch (routeMode) {
          case 'driving':
            pluginName = 'AMap.Driving';
            break;
          case 'walking':
            pluginName = 'AMap.Walking';
            break;
          case 'transit':
            pluginName = 'AMap.Transfer';
            break;
          default:
            pluginName = 'AMap.Driving';
        }
        
        window.AMap.plugin([pluginName], () => {
          resolve();
        });
      });

      const start = [startPoint.position.lng, startPoint.position.lat];
      const end = [endPoint.position.lng, endPoint.position.lat];
      console.log(start,end);
      // 执行路线规划
      await new Promise((resolve) => {
        let routeInstance;
        
        switch (routeMode) {
          case 'driving':
            routeInstance = new window.AMap.Driving({
              map: mapInstance,
              policy: window.AMap.DrivingPolicy.LEAST_TIME,
              hideMarkers: false, // 隐藏自动添加的标记，使用我们自己的标记
              showTraffic: false
            });
            break;
            
          case 'walking':
            routeInstance = new window.AMap.Walking({
              map: mapInstance,
              hideMarkers: false // 隐藏自动添加的标记
            });
            break;
            
          case 'transit':
            routeInstance = new window.AMap.Transfer({
              map: mapInstance,
              city: '全国',
              policy: window.AMap.TransferPolicy.LEAST_TIME,
              hideMarkers: false // 隐藏自动添加的标记
            });
            break;
        }

        if (routeInstance) {
          // 保存路线实例引用，用于后续清理
          routeInstanceRef.current = routeInstance;
          
          routeInstance.search(start, end, (status, result) => {
            if (status === 'complete') {
              setRouteInfo(result);
              message.success('路线规划成功');
            } else {
              console.error('路线规划失败:', result);
              message.error('路线规划失败，请重试');
            }
            resolve();
          });
        } else {
          message.error('路线规划实例创建失败');
          resolve();
        }
      });

    } catch (error) {
      console.error('路线规划过程出错:', error);
      message.error('路线规划失败');
    } finally {
      setLoading(false);
    }
  };

  // 清除所有
  // 清除所有 - 修复版本
const handleClearAll = () => {
  console.log("🧹 开始清除所有内容");
  
  // 1. 先清除路线实例
  if (routeInstanceRef.current) {
    try {
      if (typeof routeInstanceRef.current.clear === 'function') {
        routeInstanceRef.current.clear();
      }
      if (typeof routeInstanceRef.current.destroy === 'function') {
        routeInstanceRef.current.destroy();
      }
    } catch (error) {
      console.warn('清除路线实例失败:', error);
    }
    routeInstanceRef.current = null;
  }

  // 2. 清除地图覆盖物
  if (mapInstance) {
    try {
      mapInstance.clearMap();
      mapInstance.setZoom(MAP_CONFIG.DEFAULT_ZOOM);
      mapInstance.setCenter(MAP_CONFIG.DEFAULT_CENTER);
    } catch (error) {
      console.error('清除地图失败:', error);
    }
  }

  // 3. 重置所有状态（关键修复）
  setRouteInfo(null);
  setStartPoint(null);
  setEndPoint(null);
  setStartSearchResults([]);
  setEndSearchResults([]);

  setStartKeyword(''); // 新增：清空起点输入框
  setEndKeyword('');   // 新增：清空终点输入框
  
  console.log("✅ 清除完成");
  message.info('已清除所有内容');
};

  // 获取当前搜索结果
  const getCurrentSearchResults = () => {
    const searchType = activeSearchType || 'start';
    return searchType === 'start' ? startSearchResults : endSearchResults;
  };

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Card>
        <Title level={2}>🗺️ 地图导航</Title>
        
        <Alert
          message="高德地图路线规划"
          description={
            amapLoaded 
              ? "地图API加载成功，支持地点搜索和路线规划功能。"
              : "正在加载地图API，请稍候..."
          }
          type={amapLoaded ? "success" : "info"}
          showIcon
          style={{ marginBottom: 24 }}
        />
        
        {/* 搜索和操作栏 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>起点：</Text>
              {startPoint && (
                <Tag color="green" closable onClose={() => {
                  setStartPoint(null);
                  setStartKeyword('');
                  updateMapDisplay();
                }}>
                  {startPoint.name}
                </Tag>
              )}
            </div>
            {/* <Search
              placeholder="输入起点位置"
              enterButton={<SearchOutlined />}
              onSearch={(value) => handleSearch(value, 'start')}
              loading={loading && activeSearchType === 'start'}
              disabled={!amapLoaded}
            /> */}
            {/* <Search
              ref={startSearchRef}
              placeholder="输入起点位置"
              enterButton={<SearchOutlined />}
              onSearch={(value) => handleSearch(value, 'start')}
              loading={loading && activeSearchType === 'start'}
              disabled={!amapLoaded}
            /> */}
            <Search
  ref={startSearchRef}
  placeholder="输入起点位置"
  enterButton={<SearchOutlined />}
  value={startKeyword}
  onChange={(e) => setStartKeyword(e.target.value)}
  onSearch={(value) => handleSearch(value, 'start')}
  loading={loading && activeSearchType === 'start'}
  disabled={!amapLoaded}
/>
          </Col>
          
          <Col span={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Button 
              icon={<SwapOutlined />} 
              onClick={handleSwapPoints}
              disabled={!startPoint || !endPoint}
              type="text"
              size="large"
            />
          </Col>
          
          <Col span={8}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>终点：</Text>
              {endPoint && (
                <Tag color="red" closable onClose={() => {
                  setEndPoint(null);
                  setEndKeyword('');
                  updateMapDisplay();
                }}>
                  {endPoint.name}
                </Tag>
              )}
            </div>
            {/* <Search
              placeholder="输入终点位置"
              enterButton={<SearchOutlined />}
              onSearch={(value) => handleSearch(value, 'end')}
              loading={loading && activeSearchType === 'end'}
              disabled={!amapLoaded}
            /> */}
            {/* <Search
  ref={endSearchRef}
  placeholder="输入终点位置"
  enterButton={<SearchOutlined />}
  onSearch={(value) => handleSearch(value, 'end')}
  loading={loading && activeSearchType === 'end'}
  disabled={!amapLoaded}
/> */}
<Search
  ref={endSearchRef}
  placeholder="输入终点位置"
  enterButton={<SearchOutlined />}
  value={endKeyword}
  onChange={(e) => setEndKeyword(e.target.value)}
  onSearch={(value) => handleSearch(value, 'end')}
  loading={loading && activeSearchType === 'end'}
  disabled={!amapLoaded}
/>
          </Col>
          
          <Col span={6} style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <Select 
              value={routeMode} 
              onChange={setRouteMode}
              style={{ width: 120 }}
              disabled={!amapLoaded}
            >
              <Option value="driving"><CarOutlined /> 驾车</Option>
              <Option value="walking"><UserOutlined /> 步行</Option>
              <Option value="transit"><DashboardOutlined /> 公交</Option>
            </Select>
            
            <Button 
              type="primary" 
              onClick={handlePlanRoute}
              disabled={!startPoint || !endPoint || !amapLoaded}
              loading={loading}
              style={{ flex: 1 }}
            >
              开始导航
            </Button>
            
            <Button onClick={handleClearAll} disabled={!amapLoaded}>
              清除
            </Button>
          </Col>
        </Row>

        {/* 地图和搜索结果 */}
        <Row gutter={16} style={{ height: '800px' }}>
          {/* 地图容器 */}
          <Col span={16}>
            <Card 
              title="地图视图" 
              style={{ height: '600px' }}
              styles={{ body: { padding: 0, position: 'relative', height: '500px' } }}
            >
              <div 
                id="map-container" 
                style={{ 
                  width: '100%', 
                  height: '100%',
                  minHeight: 500,
                  background: '#f5f5f5'
                }}
              >
                {!amapLoaded && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#999',
                    flexDirection: 'column'
                  }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16 }}>加载高德地图中...</div>
                  </div>
                )}
              </div>
            </Card>
          </Col>

          {/* 搜索结果和路线信息 */}
          <Col span={8}>
            <Card 
              title="搜索结果" 
              styles={{ body: { height: 320, overflow: 'auto', padding: '16px' } }}
              style={{ marginBottom: 16 }}
            >
              {getCurrentSearchResults().length > 0 ? (
                <List
                  dataSource={getCurrentSearchResults()}
                  renderItem={(place) => (
                    <List.Item 
                      style={{ 
                        cursor: 'pointer',
                        padding: '8px 12px',
                        border: '1px solid #f0f0f0',
                        borderRadius: 4,
                        marginBottom: 4,
                        background: (activeSearchType === 'start' && startPoint?.id === place.id) || 
                                  (activeSearchType === 'end' && endPoint?.id === place.id) ? '#f0f7ff' : 'white'
                      }}
                      onClick={() => handleSelectPoint(place, activeSearchType || 'start')}
                    >
                      <List.Item.Meta
                        avatar={<EnvironmentOutlined style={{ 
                          color: (activeSearchType || 'start') === 'start' ? '#52c41a' : '#ff4d4f' 
                        }} />}
                        title={<Text ellipsis>{place.name}</Text>}
                        description={
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                              {place.address}
                            </Text>
                            <br />
                            <Tag color="blue" size="small">
                              {place.type || '地点'}
                            </Tag>
                            {place.distance > 0 && (
                              <Tag color="orange" size="small">
                                {place.distance}米
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
            {routeInfo && routeInfo.routes && routeInfo.routes.length > 0 && (
              <Card 
                title="路线信息" 
                styles={{ body: { maxHeight: 240, overflow: 'auto' } }}
                style={{ marginBottom: 16 }}
              >
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
                      {route.taxi_cost && (
                        <div>
                          <Text strong>预估费用: </Text>
                          <Text>{route.taxi_cost} 元</Text>
                        </div>
                      )}
                    </Space>
                    <Divider style={{ margin: '12px 0' }} />
                  </div>
                ))}
              </Card>
            )}

            {/* 位置信息 */}
            {(startPoint || endPoint) && (
              <Card 
                title="位置信息" 
                styles={{ body: { maxHeight: 200, overflow: 'auto' } }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {startPoint && (
                    <div>
                      <Text strong style={{ color: '#52c41a' }}>起点: </Text>
                      <Text ellipsis>{startPoint.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                        {startPoint.address}
                      </Text>
                    </div>
                  )}
                  {endPoint && (
                    <div>
                      <Text strong style={{ color: '#ff4d4f' }}>终点: </Text>
                      <Text ellipsis>{endPoint.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                        {endPoint.address}
                      </Text>
                    </div>
                  )}
                </Space>
              </Card>
            )}
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default MapNavigation;