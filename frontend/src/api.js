// import axios from 'axios';

// const instance = axios.create({
//   baseURL: process.env.REACT_APP_API_URL,
//   timeout: 30000,
//   headers: { 'Content-Type': 'application/json' },
// });

// // 请求拦截：自动挂 Bearer Token
// instance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
//   },
//   (err) => Promise.reject(err)
// );

// // 响应拦截：统一异常提示
// instance.interceptors.response.use(
//   (res) => res.data,
//   (err) => {
//     const msg = err.response?.data?.detail || err.message;
//     console.error(msg);
//     // 这里可以集成 antd/message 或 toast
//     return Promise.reject(msg);
//   }
// );

// export default instance;

import axios from 'axios';
import { message } from 'antd';

// 1. 创建单例
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 30000,
});

// 2. 请求拦截：统一携带 token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// 3. 响应拦截：遇到 401 立即处理
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');          // 清 token
      message.error('登录已过期，请重新登录');       // 提示
      // 防止重复跳转
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth';              // 直接跳转（刷新页面）
      }
    }
    return Promise.reject(error);
  }
);

export default api;