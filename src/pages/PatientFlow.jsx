import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OpenDentalService from "../services/OpenDentalService";
import PatientLink from "../components/PatientLink";
import "./PatientFlow.css";

function PatientFlow() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [draggedPatient, setDraggedPatient] = useState(null);

  const rooms = [
    { id: "waiting", name: "🪑 Waiting Room", color: "#2196f3" },
    { id: "op1", name: "🦷 Operatory 1", color: "#4caf50" },
    { id: "op2", name: "🦷 Operatory 2", color: "#4caf50" },
    { id: "op3", name: "🦷 Operatory 3", color: "#4caf50" },
    { id: "op4", name: "🦷 Operatory 4", color: "#4caf50" },
    { id: "xray", name: "📸 X-Ray Room", color: "#ff9800" },
    { id: "hygiene1", name: "✨ Hygiene 1", color: "#9c27b0" },
    { id: "hygiene2", name: "✨ Hygiene 2", color: "#9c27b0" },
    { id: "checkout", name: "💳 Checkout", color: "#F44336" },
  ];

  const statuses = {
    Scheduled: { label: "Scheduled", color: "#2196f3", icon: "📅" },
    Waiting: { label: "Waiting Room", color: "#ff9800", icon: "🪑" },
    Checkedin: { label: "Checked In", color: "#4caf50", icon: "✓" },
    Inroom: { label: "In Room", color: "#9c27b0", icon: "🦷" },
    Withdoctor: { label: "With Doctor", color: "#e91e63", icon: "👨‍⚕️" },
    Checkout: { label: "Ready for Checkout", color: "#F44336", icon: "💳" },
    Completed: { label: "Completed", color: "#607d8b", icon: "✅" },
  };

  useEffect(() => {
    loadPatients();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadPatients, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await OpenDentalService.getTodayPatients();
      console.log("Loaded patients:", data);
      setPatients(data);
    } catch (error) {
      console.error("Error loading patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (patient) => {
    try {
      await OpenDentalService.updatePatientStatus(
        patient.aptNum,
        "Checkedin",
        "Waiting"
      );
      alert(`✅ ${patient.patientName} checked in successfully!`);
      await loadPatients();
    } catch (error) {
      alert("Failed to check in patient");
    }
  };

  const handleMoveToRoom = async () => {
    if (!selectedRoom) {
      alert("Please select a room");
      return;
    }

    try {
      const newStatus =
        selectedRoom === "waiting"
          ? "Waiting"
          : selectedRoom === "checkout"
          ? "Checkout"
          : "Inroom";

      await OpenDentalService.updatePatientStatus(
        selectedPatient.aptNum,
        newStatus,
        selectedRoom
      );

      alert(
        `✅ ${selectedPatient.patientName} moved to ${
          rooms.find((r) => r.id === selectedRoom)?.name
        }`
      );
      setShowRoomModal(false);
      setSelectedPatient(null);
      setSelectedRoom("");
      await loadPatients();
    } catch (error) {
      alert("Failed to move patient");
    }
  };

  const handleStatusChange = async (patient, newStatus) => {
    try {
      await OpenDentalService.updatePatientStatus(
        patient.aptNum,
        newStatus,
        patient.currentRoom
      );
      await loadPatients();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, patient) => {
    setDraggedPatient(patient);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget);
    e.currentTarget.style.opacity = "0.4";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    setDraggedPatient(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDropOnStatus = async (e, targetStatus) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("drag-over"); // 🔹 limpiar al soltar

    if (!draggedPatient) return;

    try {
      setPatients((prev) =>
        prev.map((p) =>
          p.aptNum === draggedPatient.aptNum
            ? { ...p, status: targetStatus }
            : p
        )
      );

      await OpenDentalService.updatePatientStatus(
        draggedPatient.aptNum,
        targetStatus,
        draggedPatient.currentRoom
      );

      await loadPatients();
      setDraggedPatient(null);
    } catch (error) {
      alert("Failed to update status");
      await loadPatients();
    }
  };

  const handleStatusCardClick = (status) => {
    // Toggle filter
    if (filterStatus === status) {
      setFilterStatus("all");
    } else {
      setFilterStatus(status);
    }
  };

  const handleCheckEligibility = async (patient) => {
    setSelectedPatient(patient);
    setCheckingEligibility(true);
    setShowEligibilityModal(true);

    try {
      const result = await OpenDentalService.checkInsuranceEligibility(patient);
      setEligibilityData(result);
    } catch (error) {
      setEligibilityData({ error: "Failed to check eligibility" });
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleEditAppointment = (patient) => {
    setSelectedPatient(patient);
    setShowEditModal(true);
  };

  const handleSaveAppointment = async () => {
    try {
      await OpenDentalService.updateAppointment(selectedPatient);
      alert("✅ Appointment updated successfully!");
      setShowEditModal(false);
      setSelectedPatient(null);
      await loadPatients();
    } catch (error) {
      alert("Failed to update appointment");
    }
  };

  const openRoomModal = (patient) => {
    setSelectedPatient(patient);
    setSelectedRoom(patient.currentRoom || "Waiting");
    setShowRoomModal(true);
  };

  const getFilteredPatients = () => {
    if (filterStatus === "all") return patients;
    return patients.filter((p) => p.status === filterStatus);
  };

  const getStatusCounts = () => {
    const counts = {};
    Object.keys(statuses).forEach((status) => {
      counts[status] = patients.filter((p) => p.status === status).length;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();
  const filteredPatients = getFilteredPatients();

  return (
    <div className="patient-flow-page">
      <div className="flow-header">
        <div>
          <h2 className="page-title">
            🏥 Patient Flow - {new Date().toLocaleDateString()}
          </h2>
          <p className="page-subtitle">
            {patients.length} patients scheduled today
          </p>
        </div>

        <button
          className="btn btn-secondary"
          style={{ maxWidth: "15rem" }}
          onClick={loadPatients}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Status Dashboard */}
      <div className="status-dashboard">
        <div
          className={`status-card ${filterStatus === "all" ? "active" : ""}`}
          onClick={() => handleStatusCardClick("all")}
        >
          <div className="status-icon">📊</div>
          <div className="status-count">{patients.length}</div>
          <div className="status-label">All Patients</div>
        </div>
        {Object.entries(statuses).map(([key, status]) => (
          <div
            key={key}
            className={`status-card ${
              filterStatus === key ? "active" : ""
            } droppable`}
            style={{ borderLeftColor: status.color }}
            onClick={() => handleStatusCardClick(key)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDropOnStatus(e, key)}
          >
            <div className="status-icon">{status.icon}</div>
            <div className="status-count">{statusCounts[key] || 0}</div>
            <div className="status-label">{status.label}</div>
            {draggedPatient && (
              <div className="drop-hint">Drop here to change status</div>
            )}
          </div>
        ))}
      </div>

      {/* Patients List */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading patients...</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <p className="empty-text">No patients found</p>
          <p className="empty-subtext">
            {filterStatus === "all"
              ? "No patients scheduled for today"
              : `No patients with status: ${statuses[filterStatus]?.label}`}
          </p>
        </div>
      ) : (
        <div className="patients-flow-list">
          {filteredPatients.map((patient) => (
            <div
              key={patient.aptNum}
              className="flow-patient-card"
              draggable="true"
              onDragStart={(e) => handleDragStart(e, patient)}
              onDragEnd={handleDragEnd}
            >
              <div className="patient-time">
                <div className="time-display">
                  {new Date(patient.aptDateTime).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="duration">{patient.lengthMinutes}min</div>
              </div>

              <div className="patient-main-info">
                <div className="patient-header-row">
                  <div className="patient-name-section">
                    <h3>
                      <PatientLink patNum={patient.patNum}>
                        {patient.patientName}
                      </PatientLink>
                    </h3>
                    <span className="patient-id">#{patient.patNum}</span>
                  </div>
                  <div
                    className="status-badge-large"
                    style={{ backgroundColor: statuses[patient.status]?.color }}
                  >
                    {statuses[patient.status]?.icon}{" "}
                    {statuses[patient.status]?.label}
                  </div>
                </div>

                <div className="patient-details-row">
                  <div className="detail-item">
                    <span className="detail-icon">🦷</span>
                    <span>{patient.procedureDescription}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">👨‍⚕️</span>
                    <span>{patient.providerName}</span>
                  </div>
                  {patient.currentRoom && (
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <span>
                        {rooms.find((r) => r.id === patient.currentRoom)
                          ?.name || patient.currentRoom}
                      </span>
                    </div>
                  )}
                </div>

                <div className="insurance-row">
                  <span className="insurance-label">
                    🏥 {patient.insurance}
                  </span>
                  <button
                    className="btn-link"
                    onClick={() => handleCheckEligibility(patient)}
                  >
                    Check Eligibility
                  </button>
                </div>
              </div>

              <div className="patient-actions">
                {patient.status === "Scheduled" && (
                  <button
                    className="btn btn-success"
                    onClick={() => handleCheckIn(patient)}
                  >
                    ✓ Check In
                  </button>
                )}

                {patient.status === "Waiting" && (
                  <button
                    className="btn btn-primary"
                    onClick={() => openRoomModal(patient)}
                  >
                    🚪 Move to Room
                  </button>
                )}

                {(patient.status === "Checkedin" ||
                  patient.status === "Inroom") && (
                  <>
                    <button
                      className="btn btn-secondary"
                      onClick={() => openRoomModal(patient)}
                    >
                      🔄 Change Room
                    </button>
                    <button
                      className="btn btn-success"
                      onClick={() => handleStatusChange(patient, "Withdoctor")}
                    >
                      👨‍⚕️ With Doctor
                    </button>
                  </>
                )}

                {patient.status === "Withdoctor" && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleStatusChange(patient, "Checkout")}
                  >
                    💳 Ready for Checkout
                  </button>
                )}

                {patient.status === "Checkout" && (
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      sessionStorage.setItem(
                        "selectedPatient",
                        JSON.stringify({
                          patNum: patient.patNum,
                          fName: patient.patientName.split(" ")[0],
                          lName: patient.patientName.split(" ")[1] || "",
                          phone: patient.patientPhone || "",
                          insurance: patient.insurance,
                        })
                      );
                      navigate("/");
                    }}
                  >
                    💳 Process Checkout
                  </button>
                )}

                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => handleEditAppointment(patient)}
                >
                  ✏️ Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Room Selection Modal */}
      {showRoomModal && (
        <div className="modal-overlay" onClick={() => setShowRoomModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Move Patient to Room</h3>
            <p className="modal-subtitle">
              {selectedPatient?.patientName ? (
                <PatientLink patNum={selectedPatient.patNum} stopPropagation>
                  {selectedPatient.patientName}
                </PatientLink>
              ) : null}
            </p>

            <div className="rooms-grid">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className={`room-option ${
                    selectedRoom === room.id ? "selected" : ""
                  }`}
                  style={{ borderColor: room.color }}
                  onClick={() => setSelectedRoom(room.id)}
                >
                  <div className="room-name">{room.name}</div>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowRoomModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleMoveToRoom}>
                Move Patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && selectedPatient && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div
            className="modal-content large"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Edit Appointment</h3>

            <div className="edit-form">
              <div className="form-group">
                <label>Patient Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={selectedPatient.patientName}
                  onChange={(e) =>
                    setSelectedPatient({
                      ...selectedPatient,
                      patientName: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={new Date(selectedPatient.aptDateTime)
                    .toTimeString()
                    .slice(0, 5)}
                  onChange={(e) => {
                    const date = new Date(selectedPatient.aptDateTime);
                    const [hours, minutes] = e.target.value.split(":");
                    date.setHours(parseInt(hours), parseInt(minutes));
                    setSelectedPatient({
                      ...selectedPatient,
                      aptDateTime: date.toISOString(),
                    });
                  }}
                />
              </div>

              <div className="form-group">
                <label>Duration (minutes)</label>
                <select
                  className="form-input"
                  value={selectedPatient.lengthMinutes}
                  onChange={(e) =>
                    setSelectedPatient({
                      ...selectedPatient,
                      lengthMinutes: parseInt(e.target.value),
                    })
                  }
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes</option>
                </select>
              </div>

              <div className="form-group">
                <label>Provider</label>
                <select
                  className="form-input"
                  value={selectedPatient.providerName}
                  onChange={(e) =>
                    setSelectedPatient({
                      ...selectedPatient,
                      providerName: e.target.value,
                    })
                  }
                >
                  <option value="Dr. Martinez">Dr. Martinez</option>
                  <option value="Dr. Lee">Dr. Lee</option>
                  <option value="Dr. Johnson">Dr. Johnson</option>
                  <option value="Dr. Smith">Dr. Smith</option>
                </select>
              </div>

              <div className="form-group">
                <label>Procedure</label>
                <input
                  type="text"
                  className="form-input"
                  value={selectedPatient.procedureDescription}
                  onChange={(e) =>
                    setSelectedPatient({
                      ...selectedPatient,
                      procedureDescription: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={selectedPatient.note || ""}
                  onChange={(e) =>
                    setSelectedPatient({
                      ...selectedPatient,
                      note: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveAppointment}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insurance Eligibility Modal */}
      {showEligibilityModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowEligibilityModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Insurance Eligibility</h3>
            <p className="modal-subtitle">
              {selectedPatient?.patientName ? (
                <PatientLink patNum={selectedPatient.patNum} stopPropagation>
                  {selectedPatient.patientName}
                </PatientLink>
              ) : null}
            </p>

            {checkingEligibility ? (
              <div className="checking-state">
                <div className="spinner"></div>
                <p>Checking eligibility...</p>
              </div>
            ) : eligibilityData?.error ? (
              <div className="error-state">
                <div className="error-icon">❌</div>
                <p>{eligibilityData.error}</p>
              </div>
            ) : (
              <div className="eligibility-results">
                <div className="eligibility-item">
                  <span className="label">Status:</span>
                  <span
                    className={`value ${
                      eligibilityData?.active ? "active" : "inactive"
                    }`}
                  >
                    {eligibilityData?.active ? "✓ Active" : "✗ Inactive"}
                  </span>
                </div>
                <div className="eligibility-item">
                  <span className="label">Plan Name:</span>
                  <span className="value">{eligibilityData?.planName}</span>
                </div>
                <div className="eligibility-item">
                  <span className="label">Coverage Level:</span>
                  <span className="value">
                    {eligibilityData?.coverageLevel}
                  </span>
                </div>
                <div className="eligibility-item">
                  <span className="label">Deductible:</span>
                  <span className="value">
                    ${eligibilityData?.deductible} ($
                    {eligibilityData?.deductibleMet} met)
                  </span>
                </div>
                <div className="eligibility-item">
                  <span className="label">Annual Maximum:</span>
                  <span className="value">
                    ${eligibilityData?.annualMax} ($
                    {eligibilityData?.annualUsed} used)
                  </span>
                </div>
                <div className="eligibility-item">
                  <span className="label">Preventive:</span>
                  <span className="value">
                    {eligibilityData?.preventiveCoverage}%
                  </span>
                </div>
                <div className="eligibility-item">
                  <span className="label">Basic:</span>
                  <span className="value">
                    {eligibilityData?.basicCoverage}%
                  </span>
                </div>
                <div className="eligibility-item">
                  <span className="label">Major:</span>
                  <span className="value">
                    {eligibilityData?.majorCoverage}%
                  </span>
                </div>
                <div className="eligibility-timestamp">
                  Checked:{" "}
                  {new Date(eligibilityData?.timestamp).toLocaleString()}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={() => setShowEligibilityModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientFlow;
