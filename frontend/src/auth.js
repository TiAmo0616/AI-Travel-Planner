import api from './api';

export const register = (email, password) =>
  api.post('/auth/register', { email, password });

export const login = async (email, password) => {
  const { access_token } = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', access_token);
  return access_token;
};

export const logout = () => localStorage.removeItem('token');