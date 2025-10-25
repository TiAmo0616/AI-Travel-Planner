import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Auth() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const url = mode === 'login' ? 'http://localhost:8000/auth/login' : 'http://localhost:8000/auth/register';
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (res.ok) {
        console.log(data)
        localStorage.setItem('jwt_token', data.access_token);
        // localStorage.setItem('USER', JSON.stringify(data.user || {}));
        navigate('/trips');
      } else {
        alert(data.message || '认证失败');
      }
    } catch (err) {
      alert('请求失败：' + err.message);
    }
  };

  return (
    <div className="page auth-page">
      <div className="card">
        <h2>{mode === 'login' ? '登录' : '注册'}</h2>
        <form onSubmit={submit}>
          <div className="form-row"><label>邮箱</label><input value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div className="form-row"><label>密码</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          <div className="form-actions">
            <button type="submit" className="primary">{mode === 'login' ? '登录' : '注册'}</button>
            <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? '去注册' : '去登录'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Auth;
