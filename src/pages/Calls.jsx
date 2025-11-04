import React, { useState, useEffect } from "react";
import OpenDentalService from "../services/OpenDentalService";
import PatientLink from "../components/PatientLink";
import "./Calls.css";

function Calls() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [selectedCall, setSelectedCall] = useState(null);
  const [showMakeCallModal, setShowMakeCallModal] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [playingRecording, setPlayingRecording] = useState(null);
  const [transcript, setTranscript] = useState(null);

  // Make call form
  const [callToNumber, setCallToNumber] = useState("");
  const [callToPatient, setCallToPatient] = useState(null);
  const [callPurpose, setCallPurpose] = useState("payment_reminder");
  const [calling, setCalling] = useState(false);

  useEffect(() => {
    loadCalls();
    const interval = setInterval(loadCalls, 30000);
    return () => clearInterval(interval);
  }, [filterType]);

  const loadCalls = async () => {
    try {
      setLoading(true);
      const data = await OpenDentalService.getAllCalls(filterType);
      setCalls(data);
    } catch (error) {
      console.error("Error loading calls:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeCall = async () => {
    if (!callToNumber) {
      alert("Please enter a phone number");
      return;
    }

    try {
      setCalling(true);
      const result = await OpenDentalService.initiateOutboundCall({
        toNumber: callToNumber,
        patient: callToPatient,
        purpose: callPurpose,
      });

      alert(`✅ Call initiated!\nCall SID: ${result.callSid}`);
      setShowMakeCallModal(false);
      setCallToNumber("");
      setCallToPatient(null);
      await loadCalls();
    } catch (error) {
      alert("❌ Failed to initiate call. Check Twilio settings.");
    } finally {
      setCalling(false);
    }
  };

  const handlePlayRecording = async (call) => {
    try {
      setPlayingRecording(call.callSid);
      const recordingUrl = await OpenDentalService.getCallRecording(
        call.callSid
      );
      const audio = new Audio(recordingUrl);
      audio.play();
      audio.onended = () => setPlayingRecording(null);
    } catch (error) {
      alert("Failed to load recording");
      setPlayingRecording(null);
    }
  };

  const handleViewTranscript = async (call) => {
    try {
      setSelectedCall(call);
      setShowTranscriptModal(true);
      const transcriptData = await OpenDentalService.getCallTranscript(
        call.callSid
      );
      setTranscript(transcriptData);
    } catch (error) {
      alert("Failed to load transcript");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: "#4caf50",
      "no-answer": "#ff9800",
      busy: "#F44336",
      failed: "#F44336",
      voicemail: "#2196f3",
      "in-progress": "#9c27b0",
    };
    return colors[status] || "#999";
  };

  const getDispositionIcon = (disposition) => {
    const icons = {
      answered: "✅",
      "no-answer": "📵",
      voicemail: "📧",
      busy: "📞",
      failed: "❌",
      payment_collected: "💰",
      sms_sent: "💬",
      callback_requested: "🔔",
    };
    return icons[disposition] || "📞";
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="calls-page">
      <div className="calls-header">
        <div>
          <h2 className="page-title">📞 Call Management</h2>
          <p className="page-subtitle">
            {calls.length} total calls •{" "}
            {calls.filter((c) => c.status === "completed").length} completed
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            style={{ width: "15rem" }}
            onClick={loadCalls}
          >
            Refresh
          </button>
          <button
            className="btn btn-primary"
            style={{ width: "15rem" }}
            onClick={() => setShowMakeCallModal(true)}
          >
            📞 Make Call
          </button>
        </div>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filterType === "all" ? "active" : ""}`}
          onClick={() => setFilterType("all")}
        >
          All Calls
        </button>
        <button
          className={`filter-tab ${filterType === "payment" ? "active" : ""}`}
          onClick={() => setFilterType("payment")}
        >
          Payment Reminders
        </button>
        <button
          className={`filter-tab ${
            filterType === "appointment" ? "active" : ""
          }`}
          onClick={() => setFilterType("appointment")}
        >
          Appointments
        </button>
        <button
          className={`filter-tab ${filterType === "voicemail" ? "active" : ""}`}
          onClick={() => setFilterType("voicemail")}
        >
          Voicemails
        </button>
        <button
          className={`filter-tab ${filterType === "no-answer" ? "active" : ""}`}
          onClick={() => setFilterType("no-answer")}
        >
          No Answer
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading calls...</p>
        </div>
      ) : calls.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📞</div>
          <p className="empty-text">No calls found</p>
        </div>
      ) : (
        <div className="calls-list">
          {calls.map((call) => (
            <div key={call.callSid} className="call-card">
              <div className="call-left">
                <div
                  className="call-icon"
                  style={{ backgroundColor: getStatusColor(call.status) }}
                >
                  {getDispositionIcon(call.disposition)}
                </div>
                <div className="call-info">
                  <div className="call-patient">
                    {call.patientName ? (
                      <PatientLink patNum={call.patNum}>
                        {call.patientName}
                      </PatientLink>
                    ) : (
                      call.toNumber
                    )}
                  </div>
                  <div className="call-details">
                    <span className="call-type">{call.purpose}</span>
                    <span className="call-time">
                      {new Date(call.timestamp).toLocaleString()}
                    </span>
                    {call.duration > 0 && (
                      <span className="call-duration">
                        Duration: {formatDuration(call.duration)}
                      </span>
                    )}
                  </div>
                  <div className="call-disposition">
                    <span
                      className="disposition-badge"
                      style={{ backgroundColor: getStatusColor(call.status) }}
                    >
                      {call.disposition}
                    </span>
                    {call.aiRecommendation && (
                      <span className="ai-recommendation">
                        🤖 AI: {call.aiRecommendation}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="call-actions">
                {call.hasRecording && (
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => handlePlayRecording(call)}
                    disabled={playingRecording === call.callSid}
                  >
                    {playingRecording === call.callSid
                      ? "⏸️ Playing..."
                      : "▶️ Play"}
                  </button>
                )}
                {call.hasTranscript && (
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => handleViewTranscript(call)}
                  >
                    📄 Transcript
                  </button>
                )}
                {(call.disposition === "no-answer" ||
                  call.disposition === "voicemail") && (
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => {
                      setCallToNumber(call.toNumber);
                      setCallToPatient(call.patientName);
                      setShowMakeCallModal(true);
                    }}
                  >
                    🔄 Retry
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showMakeCallModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowMakeCallModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>📞 Make Call</h3>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+1 (555) 123-4567"
                value={callToNumber}
                onChange={(e) => setCallToNumber(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Patient Name (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Patient name"
                value={callToPatient || ""}
                onChange={(e) => setCallToPatient(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Call Purpose</label>
              <select
                className="form-input"
                value={callPurpose}
                onChange={(e) => setCallPurpose(e.target.value)}
              >
                <option value="payment_reminder">Payment Reminder</option>
                <option value="appointment_reminder">
                  Appointment Reminder
                </option>
                <option value="appointment_confirmation">
                  Appointment Confirmation
                </option>
                <option value="follow_up">Follow Up</option>
                <option value="general">General Call</option>
              </select>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowMakeCallModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleMakeCall}
                disabled={calling}
              >
                {calling ? "Calling..." : "📞 Make Call"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showTranscriptModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowTranscriptModal(false)}
        >
          <div
            className="modal-content large"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>📄 Call Transcript</h3>

            {selectedCall && (
              <div className="transcript-header">
                <div>
                  <strong>Patient:</strong>{" "}
                  {selectedCall.patientName ? (
                    <PatientLink patNum={selectedCall.patNum} stopPropagation>
                      {selectedCall.patientName}
                    </PatientLink>
                  ) : (
                    selectedCall.toNumber
                  )}
                </div>
                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(selectedCall.timestamp).toLocaleString()}
                </div>
                <div>
                  <strong>Duration:</strong>{" "}
                  {formatDuration(selectedCall.duration)}
                </div>
              </div>
            )}

            {!transcript ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading transcript...</p>
              </div>
            ) : (
              <div className="transcript-content">
                {transcript.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`transcript-message ${msg.speaker}`}
                  >
                    <div className="speaker-label">
                      {msg.speaker === "ai" ? "🤖 AI" : "👤 Patient"}
                    </div>
                    <div className="message-text">{msg.text}</div>
                    <div className="message-time">{msg.timestamp}</div>
                  </div>
                ))}

                {transcript.summary && (
                  <div className="transcript-summary">
                    <h4>📊 Call Summary</h4>
                    <p>{transcript.summary}</p>
                  </div>
                )}

                {transcript.aiAnalysis && (
                  <div className="ai-analysis">
                    <h4>🤖 AI Analysis</h4>
                    <ul>
                      <li>
                        <strong>Sentiment:</strong>{" "}
                        {transcript.aiAnalysis.sentiment}
                      </li>
                      <li>
                        <strong>Payment Intent:</strong>{" "}
                        {transcript.aiAnalysis.paymentIntent}
                      </li>
                      <li>
                        <strong>Recommended Action:</strong>{" "}
                        {transcript.aiAnalysis.recommendedAction}
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={() => setShowTranscriptModal(false)}
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

export default Calls;
