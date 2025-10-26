// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// function Auth() {
//   const [mode, setMode] = useState('login');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const navigate = useNavigate();

//   const submit = async (e) => {
//     e.preventDefault();
//     const url = mode === 'login' ? 'http://localhost:8000/auth/login' : 'http://localhost:8000/auth/register';
//     try {
//       const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
//       const data = await res.json();
//       console.log(data)
//       if (res.ok) {
//         console.log(data)
//         localStorage.setItem('jwt_token', data.access_token);
//         // 登录成功后跳转到首页
//         navigate('/home');
//         // 刷新页面以更新导航栏状态
//         window.location.reload();
//       } else {
//         alert(data.message || '认证失败');
//       }
//     } catch (err) {
//       alert('请求失败：' + err.message);
//     }
//   };

//   return (
//     <div className="page auth-page">
//       <div className="card">
//         <h2>{mode === 'login' ? '登录' : '注册'}</h2>
//         <form onSubmit={submit}>
//           <div className="form-row"><label>邮箱</label><input value={email} onChange={e => setEmail(e.target.value)} required /></div>
//           <div className="form-row"><label>密码</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
//           <div className="form-actions">
//             <button type="submit" className="primary">{mode === 'login' ? '登录' : '注册'}</button>
//             <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? '去注册' : '去登录'}</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default Auth;

// [file name]: Auth.js
// [file content begin]
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Tabs, 
  message, 
  Divider,
  Space,
  Typography,
  Alert
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined,
  RocketOutlined,
  TeamOutlined
} from '@ant-design/icons';
import './Auth.css'; // 我们将创建这个CSS文件

const { Title, Text, Link } = Typography;
const { TabPane } = Tabs;

function Auth() {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const submit = async (values) => {
    setLoading(true);
    const url = mode === 'login' ? 'http://localhost:8000/auth/login' : 'http://localhost:8000/auth/register';
    
    try {
      const res = await fetch(url, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(values) 
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('jwt_token', data.access_token);
        message.success(mode === 'login' ? '登录成功！' : '注册成功！');
        navigate('/home');
        // 不需要刷新页面，导航栏会自动更新
      } else {
        message.error(data.detail || '认证失败');
      }
    } catch (err) {
      message.error('请求失败：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const onTabChange = (key) => {
    setMode(key);
    form.resetFields();
  };

  return (
    <div className="auth-page" style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%',
          maxWidth: 420,
          borderRadius: 16,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: 'none',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: 40 }}
      >
        {/* 头部 */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
            width: 60,
            height: 60,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <RocketOutlined style={{ fontSize: 28, color: 'white' }} />
          </div>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            AI Travel
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            开启智能旅行体验
          </Text>
        </div>

        {/* 选项卡 */}
        <Tabs 
          activeKey={mode} 
          onChange={onTabChange}
          centered
          size="large"
        >
          <TabPane 
            tab={
              <span>
                <UserOutlined />
                登录
              </span>
            } 
            key="login"
          >
            <Form
              form={form}
              name="login"
              onFinish={submit}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱地址!' },
                  { type: 'email', message: '请输入有效的邮箱地址!' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined style={{ color: '#1890ff' }} />} 
                  placeholder="请输入邮箱地址" 
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入密码!' },
                  { min: 6, message: '密码至少6个字符!' }
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined style={{ color: '#1890ff' }} />} 
                  placeholder="请输入密码" 
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  block
                  size="large"
                  style={{
                    height: 48,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                    border: 'none',
                    fontSize: 16,
                    fontWeight: 600
                  }}
                >
                  {loading ? '处理中...' : '登录'}
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <TeamOutlined />
                注册
              </span>
            } 
            key="register"
          >
            <Form
              form={form}
              name="register"
              onFinish={submit}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱地址!' },
                  { type: 'email', message: '请输入有效的邮箱地址!' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined style={{ color: '#1890ff' }} />} 
                  placeholder="请输入邮箱地址" 
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入密码!' },
                  { min: 6, message: '密码至少6个字符!' }
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined style={{ color: '#1890ff' }} />} 
                  placeholder="请设置密码（至少6位）" 
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致!'));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined style={{ color: '#1890ff' }} />} 
                  placeholder="请再次输入密码" 
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  block
                  size="large"
                  style={{
                    height: 48,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                    border: 'none',
                    fontSize: 16,
                    fontWeight: 600
                  }}
                >
                  {loading ? '注册中...' : '立即注册'}
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>

        {/* 提示信息 */}
        <Alert
          message={
            mode === 'login' 
              ? '还没有账号？点击上方"注册"标签创建账户' 
              : '已有账号？点击上方"登录"标签立即登录'
          }
          type="info"
          showIcon
          style={{ marginTop: 24, borderRadius: 8 }}
        />

        {/* 底部信息 */}
        <Divider style={{ margin: '24px 0' }} />
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            © 2024 AI Travel · 让旅行更智能
          </Text>
        </div>
      </Card>

      {/* 背景装饰 */}
      <div className="auth-background">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>
    </div>
  );
}

export default Auth;
// [file content end]

