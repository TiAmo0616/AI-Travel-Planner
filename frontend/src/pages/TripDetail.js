import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Space, Tag, Button } from 'antd';
import { CalendarOutlined, DollarOutlined, UserOutlined, EnvironmentOutlined, HeartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

dayjs.extend(relativeTime);

function TripDetail() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      if (!token) return;
      try {
        const res = await fetch(`http://localhost:8000/trips/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setTrip(data || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTrip();
  }, [id]);

  if (loading) return <div className="page">加载中...</div>;
  if (!trip) return <div className="page">未找到行程或无法加载。</div>;

  return (
    <div className="page">
      <Card variant="borderless"  style={{ maxWidth: 880, margin: '24px auto' }}>
        {/* <Typography.Title level={2}>{trip.destination}</Typography.Title> */}
        {/* <Space style={{ marginBottom: 16 }}>
          <Tag icon={<CalendarOutlined />}>{trip.dates}</Tag>
          <Tag icon={<DollarOutlined />}>¥{trip.budget}</Tag>
          <Tag icon={<UserOutlined />}>{trip.travelers}人</Tag>
          <Tag icon={<HeartOutlined />}>{trip.preferences}</Tag>
        </Space> */}
        
        <Typography.Paragraph>
          
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{trip.plan}</ReactMarkdown>
        </Typography.Paragraph>
        <Typography.Paragraph style={{ color: '#999', marginTop: 12 }}>
          保存于 {dayjs(trip.created_at).fromNow()}
        </Typography.Paragraph>
        <Button type="primary" onClick={() => window.history.back()}>返回</Button>
      </Card>
    </div>
  );
}

export default TripDetail;