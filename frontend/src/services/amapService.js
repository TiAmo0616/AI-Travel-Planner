// 在amapService.js中添加缺失的方法，并修复现有问题

class AMapService {
  constructor() {
    this.AMap = null;
    this.map = null;
    this.markers = [];
    this.polylines = [];
    this.currentRoute = null;
    this.mapLoaded = false;
  }

  // 检查API密钥
  checkApiKey() {
    const apiKey = process.env.REACT_APP_AMAP_API_KEY;
    if (!apiKey || apiKey === '您的高德地图API密钥') {
      console.warn('高德地图API密钥未配置，地图功能将受限');
      return false;
    }
    return true;
  }

  // 动态加载高德地图API
  loadAMapScript() {
    return new Promise((resolve, reject) => {
      if (window.AMap) {
        resolve(window.AMap);
        return;
      }

      const apiKey = process.env.REACT_APP_AMAP_API_KEY;
      if (!apiKey) {
        reject(new Error('API密钥未配置'));
        return;
      }

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${apiKey}`;
      script.onerror = reject;
      script.onload = () => {
        // 加载必要的插件
        window.AMap.plugin([
          'AMap.Scale',
          'AMap.ToolBar',
          'AMap.HawkEye',
          'AMap.MapType',
          'AMap.Geolocation',
          'AMap.Marker',
          'AMap.Polyline',
          'AMap.Driving',
          'AMap.Walking',
          'AMap.Transfer'
        ], () => {
          resolve(window.AMap);
        });
      };
      document.head.appendChild(script);
    });
  }

  // 初始化地图
  async initMap(containerId, options = {}) {
    try {
      // 检查容器是否存在
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`地图容器 ${containerId} 未找到`);
      }

      // 加载高德地图API
      this.AMap = await this.loadAMapScript();
      
      const defaultOptions = {
        zoom: 12,
        center: [116.397428, 39.90923],
        viewMode: '3D',
        mapStyle: 'amap://styles/normal'
      };

      this.map = new this.AMap.Map(containerId, { ...defaultOptions, ...options });
      
      // 添加基本控件
      this.map.addControl(new this.AMap.Scale());
      this.map.addControl(new this.AMap.ToolBar());
      this.map.addControl(new this.AMap.MapType());
      
      this.mapLoaded = true;
      console.log('高德地图初始化成功');
      return this.map;

    } catch (error) {
      console.error('高德地图初始化失败:', error);
      // 返回模拟地图对象用于降级
      return this.createMockMap(containerId);
    }
  }

  // 创建模拟地图（降级方案）
  createMockMap(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div style="width:100%;height:100%;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);display:flex;align-items:center;justify-content:center;color:white;border-radius:8px">
          <div style="text-align:center">
            <div style="font-size:48px">🗺️</div>
            <div style="font-size:16px;margin-top:16px">地图展示区域</div>
            <div style="font-size:12px;opacity:0.8;margin-top:8px">
              请配置高德地图API密钥以启用完整功能
            </div>
            <div style="font-size:12px;opacity:0.8;margin-top:16px">
              <a href="https://lbs.amap.com/" target="_blank" style="color:white;text-decoration:underline">
                获取API密钥
              </a>
            </div>
          </div>
        </div>
      `;
    }
    this.mapLoaded = false;
    return { setFitView: () => {}, clearMap: () => {} };
  }

  // 在 addMarker 方法中添加坐标验证
addMarker(position, options = {}) {
  if (!this.AMap || !this.map || !this.mapLoaded) {
    console.warn('地图未就绪，无法添加标记');
    return null;
  }

  // 验证坐标有效性
  if (!this.isValidPosition(position)) {
    console.warn('无效的坐标位置:', position);
    return null;
  }

  const marker = new this.AMap.Marker({
    position: position,
    map: this.map,
    ...options
  });

  this.markers.push(marker);
  return marker;
}

// 添加坐标验证方法
isValidPosition(position) {
  if (!Array.isArray(position) || position.length !== 2) {
    return false;
  }
  
  const [lng, lat] = position;
  return !isNaN(lng) && !isNaN(lat) && 
         lng >= -180 && lng <= 180 && 
         lat >= -90 && lat <= 90;
}

// 在 drawPolyline 方法中也添加验证
drawPolyline(path, options = {}) {
  if (!this.AMap || !this.map || !this.mapLoaded) {
    console.warn('地图未就绪，无法绘制路线');
    return null;
  }

  // 过滤无效坐标
  const validPath = path.filter(point => this.isValidPosition(point));
  
  if (validPath.length < 2) {
    console.warn('有效坐标点不足，无法绘制路线');
    return null;
  }

  const polyline = new this.AMap.Polyline({
    path: validPath,
    strokeColor: options.strokeColor || '#0091ff',
    strokeWeight: options.strokeWeight || 6,
    strokeOpacity: options.strokeOpacity || 1,
    map: this.map
  });

  this.polylines.push(polyline);
  
  // 自动调整视野
  this.map.setFitView([polyline]);
  
  return polyline;
}

  // 绘制路线
drawPolyline(path, options = {}) {
  if (!this.AMap || !this.map || !this.mapLoaded) {
    console.warn('地图未就绪，无法绘制路线');
    return null;
  }

  const polyline = new this.AMap.Polyline({
      path: path,
    strokeColor: options.strokeColor || '#0091ff',
    strokeWeight: options.strokeWeight || 6,
    strokeOpacity: options.strokeOpacity || 1,
    map: this.map
  });

  this.polylines.push(polyline);
  
  // 自动调整视野
  this.map.setFitView([polyline]);
  
  return polyline;
}

  // 设置地图中心
  setCenter(lnglat) {
    if (this.map && this.mapLoaded) {
      this.map.setCenter(lnglat);
    }
  }

  // 清除地图
  clearMap() {
    if (this.map && this.mapLoaded) {
      this.map.clearMap();
    }
    this.markers = [];
    this.polylines = [];
  }

  // 销毁地图
  destroy() {
    if (this.map) {
      this.map.destroy();
      this.map = null;
      this.mapLoaded = false;
    }
  }

  // 新增：路线规划方法
  async planRoute(origin, destination, mode = 'driving') {
    if (!this.AMap || !this.map || !this.mapLoaded) {
      throw new Error('地图未就绪，无法进行路线规划');
    }

    return new Promise((resolve, reject) => {
      try {
        let routeService;
        
        switch (mode) {
          case 'driving':
            routeService = new this.AMap.Driving({
              map: this.map,
              policy: this.AMap.DrivingPolicy.LEAST_TIME
            });
            break;
          case 'walking':
            routeService = new this.AMap.Walking({
              map: this.map
            });
            break;
          case 'transit':
            routeService = new this.AMap.Transfer({
              map: this.map,
              policy: this.AMap.TransferPolicy.LEAST_TIME
            });
            break;
          default:
            reject(new Error('不支持的出行方式'));
            return;
        }

        routeService.search(origin, destination, (status, result) => {
          if (status === 'complete' && result.routes && result.routes.length > 0) {
            resolve(result);
          } else {
            reject(new Error('路线规划失败'));
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default new AMapService();