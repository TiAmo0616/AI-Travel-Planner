// [file name]: src/services/locationService.js (修复版本)
// [file content begin]
import axios from 'axios';

class LocationService {
  constructor() {
    this.baseURL = 'http://localhost:8000';
  }


    // 获取单个行程数据（用于 MapPlan 页面）
  async getTripData(tripId) {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('未登录');

      const response = await axios.get(`http://localhost:8000/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const trip = response.data;

      // 如果后端返回的是字符串 plan，需要解析成结构化数据
      if (trip.plan && typeof trip.plan === 'string') {
        try {
          const parsed = JSON.parse(trip.plan);
          return {
            ...trip,
            itinerary: parsed.itinerary || [],
            summary: parsed.summary || {}
          };
        } catch (e) {
          // 如果不是 JSON，就用基础解析
          return this.basicParseItinerary(trip.plan, {
            destination: trip.destination,
            dates: trip.dates,
            budget: trip.budget,
            travelers: trip.travelers,
            preferences: trip.preferences
          });
        }
      }

      return trip;
    } catch (error) {
      console.error('获取行程数据失败:', error);
      throw new Error('获取行程数据失败: ' + (error.response?.data?.detail || error.message));
    }
  }
  // 从AI生成的结果中提取结构化数据
  async parseItineraryFromAI(markdownText, formData) {
    try {
      const token = localStorage.getItem('jwt_token');
      
      // 如果后端没有专门的解析接口，直接在前端解析
      // 避免调用不存在的API路径
      return this.basicParseItinerary(markdownText, formData);
      
    } catch (error) {
      console.error('解析行程失败:', error);
      // 如果后端调用失败，使用前端解析
      return this.basicParseItinerary(markdownText, formData);
    }
  }

  // 基础解析逻辑（前端解析）
  basicParseItinerary(markdownText, formData) {
    console.log('开始解析行程文本...');
    
    const lines = markdownText.split('\n').filter(line => line.trim());
    const itinerary = [];
    let currentDay = null;

    lines.forEach((line, index) => {
      // 解析天数标题 - 更灵活的正则表达式
      const dayMatch = line.match(/(第\s*(\d+)\s*天|Day\s*(\d+)|##*\s*Day\s*(\d+)|##*\s*第\s*(\d+)\s*天)/i);
      if (dayMatch) {
        const dayNumber = parseInt(dayMatch[2] || dayMatch[3] || dayMatch[4] || dayMatch[5] || (itinerary.length + 1));
        
        if (currentDay) {
          itinerary.push(currentDay);
        }
        
        currentDay = {
          day: dayNumber,
          title: line.replace(/^#*\s*/, '').trim(),
          time: '全天',
          locations: [],
          description: '',
          estimated_cost: Math.floor(Math.random() * 200) + 100 // 随机成本 100-300
        };
      } else if (currentDay && line.trim() && !line.startsWith('---') && !line.startsWith('```')) {
        // 改进的地点识别
        const locationPatterns = [
          /(机场|火车站|汽车站)/,
          /(酒店|旅馆|民宿|住宿)/, 
          /(餐厅|饭店|餐馆|美食|小吃)/,
          /(景点|景区|公园|广场|博物馆|展览馆|寺庙)/,
          /(商场|购物中心|市场|商店)/,
          /(大学|学校|学院)/,
          /(医院|诊所)/,
          /(电影院|剧院|KTV)/
        ];
        
        let locationFound = false;
        locationPatterns.forEach((pattern, patternIndex) => {
          const match = line.match(pattern);
          if (match && !locationFound) {
            const locationType = this.getLocationType(match[1]);
            const locationName = `${formData.destination}${match[1]}`;
            
            // 检查是否已存在相同地点
            const exists = currentDay.locations.some(loc => loc.name === locationName);
            if (!exists) {
              currentDay.locations.push({
                name: locationName,
                type: locationType,
                address: `${formData.destination}${match[1]}`
              });
              locationFound = true;
            }
          }
        });
        
        // 累积描述（排除太短的行和特殊字符）
        if (line.length > 8 && !line.match(/^[-*•]\s/)) {
          currentDay.description += line + ' ';
        }
      }
    });

    // 添加最后一个天数
    if (currentDay) {
      itinerary.push(currentDay);
    }

    // 如果没有解析到天数，创建一个默认行程
    if (itinerary.length === 0) {
      itinerary.push({
        day: 1,
        title: `${formData.destination}行程`,
        time: '全天',
        locations: [
          {
            name: `${formData.destination}机场`,
            type: 'transport',
            address: `${formData.destination}机场`
          },
          {
            name: `${formData.destination}酒店`,
            type: 'accommodation',
            address: `${formData.destination}市中心`
          }
        ],
        description: markdownText.substring(0, 200) + '...',
        estimated_cost: 200
      });
    }

    const result = {
      destination: formData.destination,
      duration: formData.dates,
      budget: formData.budget,
      travelers: formData.travelers,
      preferences: formData.preferences,
      itinerary: itinerary,
      summary: {
        total_cost: itinerary.reduce((sum, day) => sum + day.estimated_cost, 0),
        transportation: '地铁、公交、出租车',
        highlights: this.extractHighlights(markdownText)
      }
    };

    console.log('解析结果:', result);
    return result;
  }

  // 提取亮点
  extractHighlights(markdownText) {
    const highlights = [];
    const lines = markdownText.split('\n');
    
    lines.forEach(line => {
      if (line.includes('推荐') || line.includes('特色') || line.includes('必去') || line.includes('经典')) {
        const cleanLine = line.replace(/[#*-]/g, '').trim();
        if (cleanLine.length > 5 && cleanLine.length < 50) {
          highlights.push(cleanLine);
        }
      }
    });

    // 如果没有找到亮点，使用默认值
    if (highlights.length === 0) {
      return ['文化体验', '美食探索', '城市观光'];
    }

    return highlights.slice(0, 3); // 最多返回3个亮点
  }

  getLocationType(keyword) {
    const typeMap = {
      '机场': 'transport',
      '火车站': 'transport',
      '汽车站': 'transport',
      '酒店': 'accommodation',
      '旅馆': 'accommodation',
      '民宿': 'accommodation',
      '餐厅': 'dining',
      '饭店': 'dining',
      '餐馆': 'dining',
      '美食': 'dining',
      '小吃': 'dining',
      '景点': 'attraction',
      '景区': 'attraction',
      '公园': 'attraction',
      '广场': 'attraction',
      '博物馆': 'culture',
      '展览馆': 'culture',
      '寺庙': 'culture',
      '商场': 'shopping',
      '购物中心': 'shopping',
      '市场': 'shopping',
      '大学': 'education',
      '学校': 'education',
      '医院': 'medical',
      '电影院': 'entertainment',
      '剧院': 'entertainment'
    };
    
    for (const [key, value] of Object.entries(typeMap)) {
      if (keyword.includes(key)) {
        return value;
      }
    }
    return 'other';
  }

  // 获取地点坐标（简化版）
  async getLocationCoordinates(placeName, city = '') {
    // 优先调用高德地理编码 REST API 获取坐标
    const apiKey = process.env.REACT_APP_AMAP_API_KEY || '';
    const axios = require('axios');

    const presetCoordinates = {
      '北京': [116.4074, 39.9042],
      '上海': [121.4737, 31.2304],
      '广州': [113.2644, 23.1291],
      '深圳': [114.0579, 22.5431],
      '成都': [104.0665, 30.5728],
      '杭州': [120.1551, 30.2741],
      '西安': [108.9402, 34.3416]
    };

    try {
      if (apiKey) {
        const resp = await axios.get('https://restapi.amap.com/v3/geocode/geo', {
          params: {
            key: apiKey,
            address: placeName,
            city: city
          },
          timeout: 5000
        });

        if (resp && resp.data && resp.data.status === '1' && resp.data.geocodes && resp.data.geocodes.length > 0) {
          const first = resp.data.geocodes[0];
          const [lng, lat] = first.location.split(',').map(v => parseFloat(v));
          const formatted = first.formatted_address || `${placeName} (${city})`;
          return { lnglat: [lng, lat], formattedAddress: formatted };
        }
      }
    } catch (error) {
      console.warn('高德地理编码查询失败，使用降级方案:', error && error.message);
      // 继续降级
    }

    // 降级一：查找预设坐标（优先按城市，再按地点名）
    if (city && presetCoordinates[city]) {
      return { lnglat: presetCoordinates[city], formattedAddress: `${placeName}（${city} - 预设坐标）` };
    }

    if (presetCoordinates[placeName]) {
      return { lnglat: presetCoordinates[placeName], formattedAddress: `${placeName}（预设坐标）` };
    }

    // 最终降级：返回基准坐标加随机偏移
    const baseLng = presetCoordinates['北京'][0];
    const baseLat = presetCoordinates['北京'][1];
    const rndLng = baseLng + (Math.random() - 0.5) * 0.1;
    const rndLat = baseLat + (Math.random() - 0.5) * 0.1;
    return { lnglat: [rndLng, rndLat], formattedAddress: '坐标获取失败（使用随机坐标）' };
  }
}

export default new LocationService();
// [file content end]