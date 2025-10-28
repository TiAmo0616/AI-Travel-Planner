// [file name]: PreferencesPage.js (修复版本)
// [file content begin]
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Space, 
  message, 
  List, 
  Tag, 
  Typography, 
  Modal,
  Empty,
  Popconfirm,
  Select,
  Spin
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  HeartOutlined,
  CheckOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import axios from 'axios';
import api from '../api';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

function PreferencesPage() {
  const [preferences, setPreferences] = useState([]);
  const [form] = Form.useForm();
  const [editingPreference, setEditingPreference] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 偏好分类选项
  const preferenceCategories = [
    { value: 'general', label: '通用偏好', color: 'blue' },
    { value: 'food', label: '美食偏好', color: 'red' },
    { value: 'activity', label: '活动偏好', color: 'green' },
    { value: 'accommodation', label: '住宿偏好', color: 'purple' },
    { value: 'transport', label: '交通偏好', color: 'orange' },
    { value: 'shopping', label: '购物偏好', color: 'cyan' },
    { value: 'culture', label: '文化偏好', color: 'volcano' }
  ];

  // 从数据库加载偏好设置
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        message.error('请先登录');
        return;
      }

      const response = await api.get('http://localhost:8000/preferences/', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('偏好设置加载成功:', response.data);
      setPreferences(response.data);
    } catch (error) {
      console.error('加载偏好设置失败:', error);
      if (error.response?.status === 401) {
        message.error('认证失败，请重新登录');
      } else {
        message.error('加载偏好设置失败: ' + (error.response?.data?.detail || error.message));
      }
      setPreferences([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPreference = async (values) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        message.error('请先登录');
        return;
      }

      const response = await api.post('http://localhost:8000/preferences/save', values, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      message.success('偏好设置已保存');
      form.resetFields();
      setModalVisible(false);
      await loadPreferences(); // 重新加载列表
    } catch (error) {
      console.error('保存偏好设置失败:', error);
      message.error('保存偏好设置失败: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleEditPreference = async (values) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        message.error('请先登录');
        return;
      }

      const response = await api.post(
        `http://localhost:8000/preferences/${editingPreference.id}`, 
        values, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      message.success('偏好设置已更新');
      form.resetFields();
      setModalVisible(false);
      setEditingPreference(null);
      await loadPreferences(); // 重新加载列表
    } catch (error) {
      console.error('更新偏好设置失败:', error);
      message.error('更新偏好设置失败: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePreference = async (id) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        message.error('请先登录');
        return;
      }

      await api.delete(`http://localhost:8000/preferences/${id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      message.success('偏好设置已删除');
      await loadPreferences(); // 重新加载列表
    } catch (error) {
      console.error('删除偏好设置失败:', error);
      message.error('删除偏好设置失败: ' + (error.response?.data?.detail || error.message));
    }
  };

  const openAddModal = () => {
    setEditingPreference(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEditModal = (preference) => {
    setEditingPreference(preference);
    form.setFieldsValue({
      name: preference.name,
      description: preference.description || '暂无描述',
      category: preference.category || 'general'
    });
    setModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingPreference) {
        handleEditPreference(values);
      } else {
        handleAddPreference(values);
      }
    });
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingPreference(null);
    form.resetFields();
  };

  const getCategoryInfo = (category) => {
    return preferenceCategories.find(cat => cat.value === category) || 
           { label: '通用偏好', color: 'blue' };
  };

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Card 
        style={{ 
          maxWidth: 800, 
          margin: '0 auto',
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            <HeartOutlined /> 我的旅行偏好
          </Title>
          <Text type="secondary">
            管理您常用的旅行偏好，云端同步，快速填写行程规划
          </Text>
        </div>

        {/* 添加按钮 */}
        <div style={{ textAlign: 'right', marginBottom: 24 }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={openAddModal}
            size="large"
          >
            添加偏好
          </Button>
        </div>

        {/* 偏好列表 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            <div style={{ marginTop: 16 }}>加载中...</div>
          </div>
        ) : preferences.length > 0 ? (
          <List
            dataSource={preferences}
            renderItem={(preference) => {
              const categoryInfo = getCategoryInfo(preference.category);
              return (
                <List.Item
                  actions={[
                    <Button 
                      type="link" 
                      icon={<EditOutlined />}
                      onClick={() => openEditModal(preference)}
                    >
                      编辑
                    </Button>,
                    <Popconfirm
                      title="确定删除这个偏好设置吗？"
                      onConfirm={() => handleDeletePreference(preference.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button 
                        type="link" 
                        danger 
                        icon={<DeleteOutlined />}
                      >
                        删除
                      </Button>
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{preference.name}</Text>
                        <Tag color={categoryInfo.color} icon={<HeartOutlined />}>
                          {categoryInfo.label}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <div>{preference.description}</div>
                        <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                          更新于 {new Date(preference.updated_at).toLocaleString()}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无偏好设置"
          >
            <Button type="primary" onClick={openAddModal}>
              添加第一个偏好
            </Button>
          </Empty>
        )}

        {/* 添加/编辑模态框 */}
        <Modal
          title={editingPreference ? '编辑偏好' : '添加偏好'}
          open={modalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText={editingPreference ? '更新' : '添加'}
          cancelText="取消"
          confirmLoading={saving}
        >
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            initialValues={{
              category: 'general'
            }}
          >
            <Form.Item
              name="name"
              label="偏好名称"
              rules={[{ required: true, message: '请输入偏好名称' }]}
            >
              <Input 
                placeholder="例如：美食探索、自然风光、文化历史等" 
                maxLength={20}
                showCount
              />
            </Form.Item>

            <Form.Item
              name="category"
              label="偏好分类"
              rules={[{ required: true, message: '请选择偏好分类' }]}
            >
              <Select placeholder="请选择偏好分类">
                {preferenceCategories.map(cat => (
                  <Option key={cat.value} value={cat.value}>
                    <Tag color={cat.color}>{cat.label}</Tag>
                  </Option>
                ))}
              </Select>
            </Form.Item>

             <Form.Item
                name="description"
                label="详细描述"
                >
                <TextArea
                    rows={5}
                    placeholder="详细描述您的旅行偏好，例如：喜欢尝试当地特色美食，偏好安静的餐厅环境，对辣度接受度中等.."
                />
            </Form.Item>
           
          </Form>
        </Modal>
      </Card>
    </div>
  );
}

export default PreferencesPage;
// [file content end]