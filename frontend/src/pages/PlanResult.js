import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Space } from 'antd';
import ItineraryCard from './ItineraryCard';

export default function PlanResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const markdown = location.state?.markdown || '';   // 来自跳转时携带
  const formData = location.state?.formData || {};   // 原表单数据

  /* ---------- 保存 ---------- */
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      await fetch('http://localhost:8000/trips/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, plan: markdown }) 
      });
      alert('已保存到云端！');
    } catch (e) {
      alert('保存失败：' + e.message);
    }
  };

  /* ---------- 返回修改 ---------- */
  const handleBack = () => {
    navigate('/', { state: { prefill: formData } });   // 带回填数据
  };

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={handleBack}>返回修改</Button>
        <Button type="primary" onClick={handleSave}>保存本次计划</Button>
      </Space>

      {markdown ? <ItineraryCard markdown={markdown} /> : <p>暂无行程</p>}
    </div>
  );
}