import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";
import Checkout from "./pages/Checkout";
import PatientSearch from "./pages/PatientSearch";
import PatientFlow from "./pages/PatientFlow";
import Appointments from "./pages/Appointments";
import Schedule from "./pages/Schedule";
import OpenClaims from "./pages/OpenClaims";
import Calls from "./pages/Calls";
import Messages from "./pages/Messages";
import Settings from "./pages/SettingsEnhanced";
import DentalManagementSystem from "./pages/PatientPortal";
import { patientPortalMockApi } from "./services/mockPatientPortalApi";
import "./App.css";
import { Bell, LogOut } from "lucide-react";

function Layout({ children }) {
  const location = useLocation();
  const isPortal = location.pathname.startsWith("/portal-patient");
  const [currentTime, setCurrentTime] = useState(new Date());
  const defaultPortalId = patientPortalMockApi.getDefaultPatientId();
  const portalLink = defaultPortalId
    ? `/portal-patient/${defaultPortalId}`
    : "/portal-patient";

  useEffect(() => {
    if (!isPortal) {
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(timer);
    }
  }, [isPortal]);

  const formatTime = (date) =>
    date.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (isPortal) return <main className="main-content portal">{children}</main>;

  return (
    <div className="app-container">
      <nav className="bg-[#0A54C2] shadow-md rounded-xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-28 h-10 rounded-lg flex items-center justify-center">
                <img
                  src="/images/logo-primary.png"
                  alt="App Logo"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <span className="header-title ml-3 text-white">
                Strictly Healthcare
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* <select
                value={currentView}
                onChange={(e) => setCurrentView(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="patient-portal">Patient Portal</option>
                <option value="office-dashboard">Office Dashboard</option>
              </select> */}
              <button className="p-2  rounded-lg relative text-white">
                <Bell className="w-5 h-5 text-white" />
              </button>
              <button className="p-2 rounded-lg text-white">
                <LogOut className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* <header className="header">
        <div className="header-title">🦷 Strictly Healthcare</div>
        <div className="header-time">{formatTime(currentTime)}</div>
      </header> */}

      <nav className="nav-tabs">
        <Link to="/" className="nav-tab">
          💳 Checkout
        </Link>
        <Link to="/flow" className="nav-tab">
          🏥 Patient Flow
        </Link>
        <Link to="/patients" className="nav-tab">
          🔍 Patient Search
        </Link>
        <Link to="/appointments" className="nav-tab">
          📅 Appointments
        </Link>
        <Link to="/claims" className="nav-tab">
          💰 Open Claims
        </Link>
        <Link to="/calls" className="nav-tab">
          📞 Calls
        </Link>
        <Link to="/messages" className="nav-tab">
          💬 Messages
        </Link>
        <Link to="/settings" className="nav-tab">
          ⚙️ Settings
        </Link>
      </nav>

      <main className="main-content">{children}</main>
    </div>
  );
}

function App() {
  const defaultPortalId = patientPortalMockApi.getDefaultPatientId();

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
          <Route
            path="/portal-patient"
            element={
              defaultPortalId ? (
                <Navigate to={`/portal-patient/${defaultPortalId}`} replace />
              ) : (
                <DentalManagementSystem />
              )
            }
          />
          <Route
            path="/portal-patient/:patNum/*"
            element={<DentalManagementSystem />}
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
