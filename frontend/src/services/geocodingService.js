// [file name]: src/services/geocodingService.js (简化版本)
// [file content begin]
import locationService from './locationService';

class GeocodingService {
  // 根据行程数据获取所有地点的坐标
  async getItineraryCoordinates(itineraryData, city = '') {
    const coordinates = [];
    
    for (const day of itineraryData.itinerary) {
      for (const location of day.locations) {
        try {
          // 使用locationService获取坐标
          const coords = await locationService.getLocationCoordinates(location.name, city);
          if (coords && coords.lnglat) {
            coordinates.push({
              ...location,
              lnglat: coords.lnglat,
              formattedAddress: coords.formattedAddress || `${location.name}（${city}）`
            });
          } else if (Array.isArray(coords) && coords.length === 2) {
            // 兼容旧版返回
            coordinates.push({
              ...location,
              lnglat: coords,
              formattedAddress: `${location.name}（${city}）`
            });
          } else {
            throw new Error('无效坐标返回');
          }
        } catch (error) {
          console.warn(`无法获取地点 "${location.name}" 的坐标:`, error);
          // 使用默认坐标作为备选
          coordinates.push({
            ...location,
            lnglat: [116.397428, 39.90923], // 默认北京坐标
            formattedAddress: '坐标获取失败'
          });
        }
      }
    }
    
    return coordinates;
  }
}

export default new GeocodingService();
// [file content end]