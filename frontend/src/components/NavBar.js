import React from 'react';
import { NavLink } from 'react-router-dom';

function NavBar() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <div className="logo"><NavLink to="/">AI Travel</NavLink></div>
        <nav className="links">
          <NavLink to="/" end className={({isActive})=> isActive? 'active':''}>首页</NavLink>
          <NavLink to="/trips" className={({isActive})=> isActive? 'active':''}>我的行程</NavLink>
          <NavLink to="/auth" className={({isActive})=> isActive? 'active':''}>登录</NavLink>
        </nav>
      </div>
    </header>
  );
}

export default NavBar;
