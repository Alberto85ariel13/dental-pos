import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Checkout from './pages/Checkout';
import PatientSearch from './pages/PatientSearch';
import PatientFlow from './pages/PatientFlow';
import Appointments from './pages/Appointments';
import Schedule from './pages/Schedule';
import OpenClaims from './pages/OpenClaims';
import Calls from './pages/Calls';
import Messages from './pages/Messages';
import Settings from './pages/SettingsEnhanced';
import DentalManagementSystem from './pages/PatientPortal';
import './App.css';

function Layout({ children }) {
  const location = useLocation();
  const isPortal = location.pathname.startsWith('/portal-patient');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!isPortal) {
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(timer);
    }
  }, [isPortal]);

  const formatTime = (date) =>
    date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  // 👇 Si está en /portal-patient, renderiza sin header ni nav
  if (isPortal) return <main className="main-content">{children}</main>;

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-title">🦷 DentalPro POS</div>
        <div className="header-time">{formatTime(currentTime)}</div>
      </header>

      <nav className="nav-tabs">
        <Link to="/" className="nav-tab">💳 Checkout</Link>
        <Link to="/flow" className="nav-tab">🏥 Patient Flow</Link>
        <Link to="/patients" className="nav-tab">🔍 Patient Search</Link>
        <Link to="/appointments" className="nav-tab">📅 Appointments</Link>
        <Link to="/claims" className="nav-tab">💰 Open Claims</Link>
        <Link to="/calls" className="nav-tab">📞 Calls</Link>
        <Link to="/messages" className="nav-tab">💬 Messages</Link>
        <Link to="/settings" className="nav-tab">⚙️ Settings</Link>
        <Link to="/portal-patient" className="nav-tab">⚙️ Patient Portal</Link>
      </nav>

      <main className="main-content">{children}</main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Checkout />} />
          <Route path="/flow" element={<PatientFlow />} />
          <Route path="/patients" element={<PatientSearch />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/claims" element={<OpenClaims />} />
          <Route path="/calls" element={<Calls />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/portal-patient/*" element={<DentalManagementSystem />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
