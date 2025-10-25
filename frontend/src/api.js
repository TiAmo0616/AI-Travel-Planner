import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截：自动挂 Bearer Token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// 响应拦截：统一异常提示
instance.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.detail || err.message;
    console.error(msg);
    // 这里可以集成 antd/message 或 toast
    return Promise.reject(msg);
  }
);

export default instance;