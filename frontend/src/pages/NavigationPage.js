// NavigationPage.js
import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Space } from 'antd';
import { LeftOutlined, AimOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

function NavigationPage() {
  const navigate = useNavigate();
  const [navData, setNavData] = useState(null);

  useEffect(() => {
    // 从 localStorage 获取导航数据
    const storedData = localStorage.getItem('navigationData');
    if (storedData) {
      setNavData(JSON.parse(storedData));
    }
  }, []);

  const handleBack = () => {
    navigate(-1); // 返回上一页
  };

  const openExternalMap = () => {
    if (!navData) return;
    
    const { lng, lat, name } = navData.destination;
    
    // 根据不同平台打开地图应用
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      // 移动设备 - 打开高德地图
      const url = `amapuri://route/plan/?dlat=${lat}&dlon=${lng}&dname=${encodeURIComponent(name)}&dev=0&t=0`;
      window.location.href = url;
    } else {
      // PC 设备 - 打开网页版高德地图
      const url = `https://uri.amap.com/navigation?to=${lng},${lat},${encodeURIComponent(name)}&mode=car&src=web`;
      window.open(url, '_blank');
    }
  };

  if (!navData) {
    return (
      <div style={{ padding: 20 }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Title level={3}>导航数据不存在</Title>
            <Text type="secondary">请从行程详情页选择地点进行导航</Text>
            <br />
            <Button type="primary" onClick={handleBack} style={{ marginTop: 16 }}>
              返回
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button icon={<LeftOutlined />} onClick={handleBack}>
            返回
          </Button>
        </div>
        
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <AimOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={2}>导航到 {navData.destination.name}</Title>
          
          <Space direction="vertical" size={16} style={{ marginTop: 24 }}>
            <Text strong>目的地：{navData.destination.name}</Text>
            {navData.destination.address && (
              <Text type="secondary">地址：{navData.destination.address}</Text>
            )}
            <Text>坐标：{navData.destination.lng.toFixed(6)}, {navData.destination.lat.toFixed(6)}</Text>
            
            <Button type="primary" size="large" onClick={openExternalMap}>
              🚗 开始导航
            </Button>
            
            <Text type="secondary" style={{ fontSize: 12 }}>
              点击上方按钮将跳转到高德地图进行导航
            </Text>
          </Space>
        </div>
      </Card>
    </div>
  );
}

export default NavigationPage;