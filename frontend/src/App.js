// [file name]: src/App.js
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
import ExpensesPage from './pages/ExpensesPage';
import MapNavigation from './components/MapNavigation';
import MapPlan from './pages/MapPlan';

function App() {
  return (
    <div className="app-root">
      <NavBar />
      <main className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/trips/:id" element={<TripDetail />} />
          <Route path="/trips/:id/expenses" element={<ExpensesPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/plan-result" element={<PlanResult />} />
          <Route path="/map" element={<MapNavigation />} />
          <Route path="/map-plan" element={<MapPlan />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
// [file content end]