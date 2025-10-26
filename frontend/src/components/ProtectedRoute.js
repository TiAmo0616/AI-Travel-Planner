// [file name]: src/components/ProtectedRoute.js
// [file content begin]
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('jwt_token');
  
  // 如果没有token，重定向到登录页面
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
// [file content end]