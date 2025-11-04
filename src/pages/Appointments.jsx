import React, { useState, useEffect } from "react";
import OpenDentalService from "../services/OpenDentalService";
import PatientLink from "../components/PatientLink";
import "./Appointments.css";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadAppointments();
  }, [selectedDate]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split("T")[0];
      const apts = await OpenDentalService.getAppointments(dateStr);
      setAppointments(apts);
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "#2196f3",
      confirmed: "#4caf50",
      arrived: "#ff9800",
      completed: "#607d8b",
      cancelled: "#F44336",
      waiting: "#ff9800",
      checkedin: "#4caf50",
      inroom: "#9c27b0",
      withdoctor: "#e91e63",
      checkout: "#F44336",
    };
    return colors[status.toLowerCase()] || "#999";
  };

  const normalizeStatusName = (status) => {
    if (!status) return "";

    const normalized = status.toLowerCase();

    const map = {
      scheduled: "Scheduled",
      confirmed: "Confirmed",
      arrived: "Arrived",
      completed: "Completed",
      cancelled: "Cancelled",
      waiting: "Waiting",
      checkedin: "Checked In",
      inroom: "In Room",
      withdoctor: "With Doctor",
      checkout: "Checkout",
    };

    return (
      map[normalized] ||
      normalized.charAt(0).toUpperCase() + normalized.slice(1)
    );
  };

  return (
    <div className="appointments-page">
      <div className="appointments-header">
        <div>
          <h2 className="page-title">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h2>
          <p className="page-subtitle">
            {appointments.length} appointment
            {appointments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn btn-secondary"
            style={{ width: "15rem" }}
            onClick={loadAppointments}
          >
            Refresh
          </button>
          <button
            className="btn btn-primary text-white flex items-center justify-center gap-2"
            style={{ width: "15rem" }}
            onClick={() => (window.location.href = "/schedule")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              width="25"
              height="25"
            >
              <path
                fillRule="evenodd"
                d="M12 5c.552 0 1 .448 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H6a1 1 0 1 1 0-2h5V6c0-.552.448-1 1-1z"
                clipRule="evenodd"
              />
            </svg>
            Schedule New
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading appointments...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <p className="empty-text">No appointments scheduled</p>
          <p className="empty-subtext">for this date</p>
        </div>
      ) : (
        <div className="appointments-list">
          {appointments.map((apt) => (
            <div key={apt.aptNum} className="appointment-card">
              <div
                className="appointment-time"
                style={{
                  background: getStatusColor(apt.status),
                }}
              >
                <div className="time-text">{formatTime(apt.aptDateTime)}</div>
                <div className="duration-text">{apt.lengthMinutes} min</div>
              </div>

              <div className="appointment-details">
                <div className="appointment-patient">
                  <span className="patient-icon">👤</span>
                  <div>
                    <PatientLink patNum={apt.patNum} className="patient-name">
                      {apt.patientName}
                    </PatientLink>
                    <div className="patient-num">Patient #{apt.patNum}</div>
                  </div>
                </div>

                <div className="procedure-info">
                  <div className="procedure-code">{apt.procedureCode}</div>
                  <div className="procedure-description">
                    {apt.procedureDescription}
                  </div>
                </div>

                <div className="provider-row">
                  <div>
                    <span className="label">Provider:</span>
                    <span className="value">{apt.providerName}</span>
                  </div>
                  <div>
                    <span className="label">Room:</span>
                    <span className="value">{apt.operatory}</span>
                  </div>
                </div>

                <div
                  className="status-badge"
                  style={{ background: getStatusColor(apt.status) }}
                >
                  {normalizeStatusName(apt.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Appointments;
