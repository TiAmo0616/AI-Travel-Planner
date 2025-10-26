// [file name]: src/App.js
// [file content begin]
// import React from 'react';
// import { Routes, Route } from 'react-router-dom';
// import NavBar from './components/NavBar';
// import Home from './pages/Home';
// import Trips from './pages/Trips';
// import TripDetail from './pages/TripDetail';
// import Auth from './pages/Auth';
// import NotFound from './pages/NotFound';
// import './index.css';
// import PlanResult from './pages/PlanResult';
// import ExpensesPage from './pages/ExpensesPage';
// import MapNavigation from './components/MapNavigation';
// import MapPlan from './pages/MapPlan';

// function App() {
//   return (
//     <div className="app-root">
//       <NavBar />
//       <main className="app-container">
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/trips" element={<Trips />} />
//           <Route path="/trips/:id" element={<TripDetail />} />
//           <Route path="/trips/:id/expenses" element={<ExpensesPage />} />
//           <Route path="/expenses" element={<ExpensesPage />} />
//           <Route path="/auth" element={<Auth />} />
//           <Route path="*" element={<NotFound />} />
//           <Route path="/plan-result" element={<PlanResult />} />
//           <Route path="/map" element={<MapNavigation />} />
//           <Route path="/map-plan" element={<MapPlan />} />
//         </Routes>
//       </main>
//     </div>
//   );
// }

// export default App;
// // [file content end]

// [file name]: App.js (更新)
// [file content begin]
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Trips from './pages/Trips';
import TripDetail from './pages/TripDetail';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import './index.css';
import PlanResult from './pages/PlanResult';
import ExpensesPage from './pages/ExpensesPage';
import MapNavigation from './components/MapNavigation';
import MapPlan from './pages/MapPlan';
import ProtectedRoute from './components/ProtectedRoute'; // 新增

function App() {
  return (
    <div className="app-root">
      <NavBar />
      <main className="app-container">
        <Routes>
          {/* 默认路径重定向到首页，但首页受保护 */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          
          {/* 认证页面不需要保护 */}
          <Route path="/auth" element={<Auth />} />
          
          {/* 受保护的路由 */}
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/trips" element={
            <ProtectedRoute>
              <Trips />
            </ProtectedRoute>
          } />
          <Route path="/trips/:id" element={
            <ProtectedRoute>
              <TripDetail />
            </ProtectedRoute>
          } />
          <Route path="/trips/:id/expenses" element={
            <ProtectedRoute>
              <ExpensesPage />
            </ProtectedRoute>
          } />
          <Route path="/expenses" element={
            <ProtectedRoute>
              <ExpensesPage />
            </ProtectedRoute>
          } />
          <Route path="/plan-result" element={
            <ProtectedRoute>
              <PlanResult />
            </ProtectedRoute>
          } />
          <Route path="/map" element={
            <ProtectedRoute>
              <MapNavigation />
            </ProtectedRoute>
          } />
          <Route path="/map-plan" element={
            <ProtectedRoute>
              <MapPlan />
            </ProtectedRoute>
          } />
          
          {/* 404页面 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
// [file content end]