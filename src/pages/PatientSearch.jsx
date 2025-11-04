import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import OpenDentalService from "../services/OpenDentalService";
import PatientLink from "../components/PatientLink";
import "./PatientSearch.css";

function PatientSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectMode = searchParams.get("selectMode"); // 'true', 'schedule', or null

  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    searchPatients("");
  }, []);

  const searchPatients = async (query) => {
    try {
      setLoading(true);
      const results = await OpenDentalService.searchPatients(query);
      setPatients(results);
    } catch (error) {
      console.error("Error searching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchPatients(query);
  };

  const handleSelectPatient = (patient) => {
    if (selectMode === "schedule") {
      // Store patient for scheduling and navigate back
      sessionStorage.setItem(
        "selectedPatientForSchedule",
        JSON.stringify(patient)
      );
      navigate("/schedule");
    } else if (selectMode === "true" || selectMode === "checkout") {
      // Store patient for checkout and navigate back
      sessionStorage.setItem("selectedPatient", JSON.stringify(patient));
      navigate("/");
    } else {
      // Just show patient selected (default behavior)
      alert(`Patient selected: ${patient.fName} ${patient.lName}`);
    }
  };

  return (
    <div className="patient-search-page">
      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, phone, or patient ID..."
            value={searchQuery}
            onChange={handleSearch}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Searching patients...</p>
        </div>
      ) : patients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <p className="empty-text">No patients found</p>
          <p className="empty-subtext">Try a different search term</p>
        </div>
      ) : (
        <div className="patients-list">
          {patients.map((patient) => (
            <div
              key={patient.patNum}
              className="patient-card"
              onClick={() => handleSelectPatient(patient)}
            >
              <div className="patient-header">
                <div className="patient-name mr-2">
                  {patient.fName} {patient.lName}
                </div>
                <div className="patient-id">#{patient.patNum}</div>
              </div>
              <div className="patient-details-grid">
                <div className="detail-item">
                  <span className="detail-icon">📞</span>
                  <span className="detail-text">{patient.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📧</span>
                  <span className="detail-text">{patient.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🏥</span>
                  <span className="detail-text">{patient.insurance}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">💰</span>
                  <span
                    className={`detail-text ${
                      patient.balance > 0 ? "balance-owed" : "balance-clear"
                    }`}
                  >
                    ${patient.balance.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="patient-footer">
                <span className="last-visit">
                  Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PatientSearch;
