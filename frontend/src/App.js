
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
import ExpensesPage from './pages/ExpensesPage';

function App() {
  return (
    <div className="app-root">
      <NavBar />
      <main className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/trips/:id" element={<TripDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/plan-result" element={<PlanResult />} />
          <Route path="/expenses" element={<ExpensesPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
