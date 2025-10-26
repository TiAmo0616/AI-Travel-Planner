// // [file name]: NavBar.js (更新)
// // [file content begin]
// // import React from 'react';
// // import { NavLink } from 'react-router-dom';

// // function NavBar() {
// //   return (
// //     <header className="nav">
// //       <div className="nav-inner">
// //         <div className="logo"><NavLink to="/">AI Travel</NavLink></div>
// //         <nav className="links">
// //           <NavLink to="/" end className={({isActive})=> isActive? 'active':''}>首页</NavLink>
// //           <NavLink to="/trips" className={({isActive})=> isActive? 'active':''}>我的行程</NavLink>
// //           <NavLink to="/map" className={({isActive})=> isActive? 'active':''}>地图导航</NavLink> {/* 新增 */}
// //           <NavLink to="/auth" className={({isActive})=> isActive? 'active':''}>登录</NavLink>
// //         </nav>
// //       </div>
// //     </header>
// //   );
// // }

// // export default NavBar;
// // [file content end]

// // [file name]: NavBar.js (更新)
// // [file content begin]
// // [file name]: NavBar.js
// // [file content begin]
// import React, { useState, useEffect } from 'react';
// import { NavLink, useNavigate, useLocation } from 'react-router-dom';
// import { Button, Dropdown, Space, message } from 'antd';
// import { UserOutlined, LogoutOutlined, HomeOutlined, CompassOutlined, UnorderedListOutlined } from '@ant-design/icons';

// function NavBar() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();

//   // 监听路由变化和检查登录状态
//   useEffect(() => {
//     checkLoginStatus();
//   }, [location]); // 当路由变化时重新检查

//   const checkLoginStatus = () => {
//     const token = localStorage.getItem('jwt_token');
//     setIsLoggedIn(!!token);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('jwt_token');
//     setIsLoggedIn(false);
//     message.success('已退出登录');
//     navigate('/auth');
//   };

//   const userMenuItems = [
//     {
//       key: 'logout',
//       icon: <LogoutOutlined />,
//       label: '退出登录',
//       onClick: handleLogout,
//     },
//   ];

//   // 如果当前在认证页面且未登录，不显示导航栏
//   if (location.pathname === '/auth' && !isLoggedIn) {
//     return null;
//   }

//   return (
//     <header className="nav" style={{ 
//       background: '#fff',
//       boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//       borderBottom: '1px solid #f0f0f0'
//     }}>
//       <div className="nav-inner" style={{
//         maxWidth: 1200,
//         margin: '0 auto',
//         padding: '0 20px',
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         height: 64
//       }}>
//         <div className="logo" style={{ fontSize: 24, fontWeight: 'bold' }}>
//           <NavLink 
//             to={isLoggedIn ? "/home" : "/auth"} 
//             style={{ 
//               color: '#1890ff', 
//               textDecoration: 'none',
//               display: 'flex',
//               alignItems: 'center',
//               gap: 8
//             }}
//           >
//             <CompassOutlined />
//             AI Travel
//           </NavLink>
//         </div>
        
//         <nav className="links" style={{ 
//           display: 'flex', 
//           alignItems: 'center',
//           gap: 8
//         }}>
//           {isLoggedIn ? (
//             <>
//               <NavLink 
//                 to="/home" 
//                 className={({isActive}) => isActive ? 'nav-active' : 'nav-link'}
//                 style={({ isActive }) => ({
//                   padding: '8px 16px',
//                   borderRadius: 6,
//                   textDecoration: 'none',
//                   color: isActive ? '#1890ff' : '#666',
//                   background: isActive ? '#f0f8ff' : 'transparent',
//                   border: isActive ? '1px solid #e6f7ff' : '1px solid transparent',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 6,
//                   transition: 'all 0.3s ease'
//                 })}
//               >
//                 <HomeOutlined />
//                 首页
//               </NavLink>
              
//               <NavLink 
//                 to="/trips" 
//                 className={({isActive}) => isActive ? 'nav-active' : 'nav-link'}
//                 style={({ isActive }) => ({
//                   padding: '8px 16px',
//                   borderRadius: 6,
//                   textDecoration: 'none',
//                   color: isActive ? '#1890ff' : '#666',
//                   background: isActive ? '#f0f8ff' : 'transparent',
//                   border: isActive ? '1px solid #e6f7ff' : '1px solid transparent',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 6,
//                   transition: 'all 0.3s ease'
//                 })}
//               >
//                 <UnorderedListOutlined />
//                 我的行程
//               </NavLink>
              
//               <NavLink 
//                 to="/map" 
//                 className={({isActive}) => isActive ? 'nav-active' : 'nav-link'}
//                 style={({ isActive }) => ({
//                   padding: '8px 16px',
//                   borderRadius: 6,
//                   textDecoration: 'none',
//                   color: isActive ? '#1890ff' : '#666',
//                   background: isActive ? '#f0f8ff' : 'transparent',
//                   border: isActive ? '1px solid #e6f7ff' : '1px solid transparent',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 6,
//                   transition: 'all 0.3s ease'
//                 })}
//               >
//                 <CompassOutlined />
//                 地图导航
//               </NavLink>
              
//               <Dropdown 
//                 menu={{ items: userMenuItems }} 
//                 placement="bottomRight"
//                 trigger={['click']}
//               >
//                 <Button 
//                   type="text" 
//                   style={{ 
//                     color: '#666',
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: 6,
//                     height: 'auto',
//                     padding: '8px 12px'
//                   }}
//                 >
//                   <Space>
//                     <UserOutlined />
//                     用户
//                   </Space>
//                 </Button>
//               </Dropdown>
//             </>
//           ) : (
//             <NavLink 
//               to="/auth" 
//               className={({isActive}) => isActive ? 'nav-active' : 'nav-link'}
//               style={({ isActive }) => ({
//                 padding: '8px 20px',
//                 borderRadius: 6,
//                 textDecoration: 'none',
//                 color: isActive ? '#1890ff' : '#666',
//                 background: isActive ? '#f0f8ff' : 'transparent',
//                 border: isActive ? '1px solid #e6f7ff' : '1px solid #1890ff',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: 6,
//                 transition: 'all 0.3s ease'
//               })}
//             >
//               <UserOutlined />
//               登录/注册
//             </NavLink>
//           )}
//         </nav>
//       </div>

//       <style jsx>{`
//         .nav-link:hover {
//           color: #1890ff !important;
//           background: #f0f8ff !important;
//           border-color: #e6f7ff !important;
//         }
//       `}</style>
//     </header>
//   );
// }

// export default NavBar;
// // [file content end]


// [file name]: NavBar.js (更新)
// [file content begin]
// [file name]: NavBar.js (修复)
// [file content begin]
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Button, Dropdown, Space, message } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  HomeOutlined, 
  CompassOutlined, 
  UnorderedListOutlined,
  HeartOutlined
} from '@ant-design/icons';

function NavBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkLoginStatus();
  }, [location]);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('jwt_token');
    setIsLoggedIn(!!token);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setIsLoggedIn(false);
    message.success('已退出登录');
    navigate('/auth');
  };

  const userMenuItems = [
    {
      key: 'preferences',
      icon: <HeartOutlined />,
      label: '偏好设置',
      onClick: () => navigate('/preferences'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  if (location.pathname === '/auth' && !isLoggedIn) {
    return null;
  }

  return (
    <header className="nav" style={{ 
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderBottom: '1px solid #f0f0f0'
    }}>
      <div className="nav-inner" style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 64
      }}>
        <div className="logo" style={{ fontSize: 24, fontWeight: 'bold' }}>
          <NavLink 
            to={isLoggedIn ? "/home" : "/auth"} 
            style={{ 
              color: '#1890ff', 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <CompassOutlined />
            AI Travel
          </NavLink>
        </div>
        
        <nav className="links" style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 8
        }}>
          {isLoggedIn ? (
            <>
              <NavLink 
                to="/home" 
                className={({isActive}) => isActive ? 'nav-active' : 'nav-link'}
                style={({ isActive }) => ({
                  padding: '8px 16px',
                  borderRadius: 6,
                  textDecoration: 'none',
                  color: isActive ? '#1890ff' : '#666',
                  background: isActive ? '#f0f8ff' : 'transparent',
                  border: isActive ? '1px solid #e6f7ff' : '1px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.3s ease'
                })}
              >
                <HomeOutlined />
                首页
              </NavLink>
              
              <NavLink 
                to="/trips" 
                className={({isActive}) => isActive ? 'nav-active' : 'nav-link'}
                style={({ isActive }) => ({
                  padding: '8px 16px',
                  borderRadius: 6,
                  textDecoration: 'none',
                  color: isActive ? '#1890ff' : '#666',
                  background: isActive ? '#f0f8ff' : 'transparent',
                  border: isActive ? '1px solid #e6f7ff' : '1px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.3s ease'
                })}
              >
                <UnorderedListOutlined />
                我的行程
              </NavLink>
              
              <NavLink 
                to="/map" 
                className={({isActive}) => isActive ? 'nav-active' : 'nav-link'}
                style={({ isActive }) => ({
                  padding: '8px 16px',
                  borderRadius: 6,
                  textDecoration: 'none',
                  color: isActive ? '#1890ff' : '#666',
                  background: isActive ? '#f0f8ff' : 'transparent',
                  border: isActive ? '1px solid #e6f7ff' : '1px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.3s ease'
                })}
              >
                <CompassOutlined />
                地图导航
              </NavLink>
              
              <Dropdown 
                menu={{ items: userMenuItems }} 
                placement="bottomRight"
                trigger={['click']}
              >
                <Button 
                  type="text" 
                  style={{ 
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    height: 'auto',
                    padding: '8px 12px'
                  }}
                >
                  <Space>
                    <UserOutlined />
                    用户
                  </Space>
                </Button>
              </Dropdown>
            </>
          ) : (
            <NavLink 
              to="/auth" 
              className={({isActive}) => isActive ? 'nav-active' : 'nav-link'}
              style={({ isActive }) => ({
                padding: '8px 20px',
                borderRadius: 6,
                textDecoration: 'none',
                color: isActive ? '#1890ff' : '#666',
                background: isActive ? '#f0f8ff' : 'transparent',
                border: isActive ? '1px solid #e6f7ff' : '1px solid #1890ff',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.3s ease'
              })}
            >
              <UserOutlined />
              登录/注册
            </NavLink>
          )}
        </nav>
      </div>

      {/* 修复：使用 style 标签而不是 jsx 属性 */}
      <style>{`
        .nav-link:hover {
          color: #1890ff !important;
          background: #f0f8ff !important;
          border-color: #e6f7ff !important;
        }
      `}</style>
    </header>
  );
}

export default NavBar;
// [file content end]