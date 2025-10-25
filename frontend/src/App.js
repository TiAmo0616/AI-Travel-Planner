// [file name]: App.js (更新)
// [file content begin]
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Trips from './pages/Trips';
import TripDetail from './pages/TripDetail';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import './index.css';
import PlanResult from './pages/PlanResult';
import ExpensesPage from './pages/ExpensesPage';  // 新增

function App() {
  return (
    <div className="app-root">
      <NavBar />
      <main className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/trips/:id" element={<TripDetail />} />
          <Route path="/trips/:id/expenses" element={<ExpensesPage />} />  {/* 行程相关开销 */}
          <Route path="/expenses" element={<ExpensesPage />} />  {/* 独立开销记录 */}
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/plan-result" element={<PlanResult />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
// [file content end]