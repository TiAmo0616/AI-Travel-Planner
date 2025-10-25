import React, { useEffect, useState } from 'react';
import { Card, Button, Collapse, Spin, Empty, Space, Tag, Popconfirm, message } from 'antd';
import { CalendarOutlined, DollarOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from 'react-router-dom';

dayjs.extend(relativeTime);

const { Panel } = Collapse;

function Trips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      const token = localStorage.getItem('jwt_token');
      console.log(token)
      if (!token) return;
      try {
        const res = await fetch('http://localhost:8000/trips/listtrips', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(res)
        const data = await res.json();
        setTrips(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const handleDelete = async (tripId) => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:8000/trips/${tripId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      message.success(data.message); // 使用 message.success 显示成功通知
      setTrips(trips.filter(t => t.id !== tripId));
    } catch (err) {
      message.error('删除失败：' + err.message); // 使用 message.error 显示错误通知
    }
  };

  if (loading) return <Spin tip="加载中..." fullscreen spinning={true} style={{ display: 'block', textAlign: 'center', marginTop: 48 }} />;

  if (!trips.length) return <Empty description="暂无行程" style={{ marginTop: 48 }} />;

  return (
    <div style={{ maxWidth: 880, margin: '24px auto', padding: 24 }}>
      <h2>我的行程</h2>
      <Collapse items={trips.map((t) => ({
        key: t.id,
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t.destination}</span>
            <Button type="link" onClick={() => navigate(`/trips/${t.id}`)}>查看详情</Button>
            <Popconfirm title="确定要删除此行程吗?" onConfirm={() => handleDelete(t.id)}>
              <Button type="link" icon={<DeleteOutlined />} danger>删除</Button>
            </Popconfirm>
          </div>
        ),
        children: (
          <Card variant="borderless" style={{ marginTop: 8 }}>
            <b>偏好：</b>{t.preferences}<br />
            <div style={{ marginTop: 12, color: '#999' }}>
              保存于 {dayjs(t.created_at).fromNow()}
            </div>
          </Card>
        ),
        extra: (
          <Space>
            <Tag icon={<CalendarOutlined />}>{t.dates}</Tag>
            <Tag icon={<DollarOutlined />}>¥{t.budget}</Tag>
            <Tag icon={<UserOutlined />}>{t.travelers}人</Tag>
          </Space>
        )
      }))} />
    </div>
  );
}

export default Trips;