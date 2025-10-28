import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OpenDentalService from '../services/OpenDentalService';
import PatientLink from '../components/PatientLink';
import './CallCenter.css';

function CallCenter() {
  const navigate = useNavigate();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterDisposition, setFilterDisposition] = useState('all');
  const [selectedCall, setSelectedCall] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showMakeCallModal, setShowMakeCallModal] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [callNotes, setCallNotes] = useState('');

  const getPatientDisplayName = (patient) => {
    if (!patient) return '';
    if (patient.patientName) return patient.patientName;
    const first = patient.fName ?? '';
    const last = patient.lName ?? '';
    return `${first} ${last}`.trim();
  };

  const dispositions = {
    answered: { label: 'Answered', color: '#4caf50', icon: '📞' },
    voicemail: { label: 'Voicemail', color: '#ff9800', icon: '📬' },
    no_answer: { label: 'No Answer', color: '#f44336', icon: '📵' },
    busy: { label: 'Busy', color: '#9c27b0', icon: '🔴' },
    payment_received: { label: 'Payment Received', color: '#2196f3', icon: '💳' },
    scheduled: { label: 'Scheduled', color: '#00bcd4', icon: '📅' },
  };

  useEffect(() => {
    loadCalls();
  }, [filterPeriod, filterDisposition]);

  const loadCalls = async () => {
    try {
      setLoading(true);
      const data = await OpenDentalService.getCallHistory(filterPeriod, filterDisposition);
      setCalls(data);
    } catch (error) {
      console.error('Error loading calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeCall = async () => {
    if (!selectedPatient) {
      alert('Please select a patient first');
      return;
    }

    try {
      const result = await OpenDentalService.initiateCall(selectedPatient, callNotes);
      alert(`✅ Call initiated to ${getPatientDisplayName(selectedPatient)}\n\nCall ID: ${result.callSid}`);
      setShowMakeCallModal(false);
      setSelectedPatient(null);
      setCallNotes('');
      await loadCalls();
    } catch (error) {
      alert('Failed to initiate call');
    }
  };

  const handleViewCall = async (call) => {
    setSelectedCall(call);
    setShowCallModal(true);
    
    if (!call.transcription) {
      try {
        const transcription = await OpenDentalService.getCallTranscription(call.callSid);
        setSelectedCall({ ...call, transcription });
      } catch (error) {
        console.error('Error loading transcription:', error);
      }
    }
  };

  const handlePlayRecording = (call) => {
    if (playingAudio === call.callSid) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(call.callSid);
      OpenDentalService.playCallRecording(call.recordingUrl);
    }
  };

  const selectPatientForCall = () => {
    sessionStorage.setItem('returnToCallCenter', 'true');
    navigate('/patients?selectMode=call');
  };

  useEffect(() => {
    const patientData = sessionStorage.getItem('selectedPatientForCall');
    if (patientData) {
      setSelectedPatient(JSON.parse(patientData));
      setShowMakeCallModal(true);
      sessionStorage.removeItem('selectedPatientForCall');
    }
  }, []);

  const getDurationDisplay = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="call-center-page">
      <div className="call-header">
        <div>
          <h2 className="page-title">📞 Call Center</h2>
          <p className="page-subtitle">{calls.length} total calls</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowMakeCallModal(true)}>
          📞 Make Call
        </button>
      </div>

      <div className="call-filters">
        <div className="filter-section">
          <label>Time Period</label>
          <select className="filter-select" value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)}>
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div className="filter-section">
          <label>Disposition</label>
          <select className="filter-select" value={filterDisposition} onChange={(e) => setFilterDisposition(e.target.value)}>
            <option value="all">All Dispositions</option>
            {Object.entries(dispositions).map(([key, disp]) => (
              <option key={key} value={key}>{disp.icon} {disp.label}</option>
            ))}
          </select>
        </div>

        <button className="btn btn-secondary" onClick={loadCalls}>🔄 Refresh</button>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner"></div><p>Loading calls...</p></div>
      ) : calls.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📞</div><p className="empty-text">No calls found</p></div>
      ) : (
        <div className="calls-list">
          {calls.map((call) => (
            <div key={call.callSid} className="call-card">
              <div className="call-main">
                <div className="call-icon-section">
                  <div className="call-icon">{dispositions[call.disposition]?.icon || '📞'}</div>
                  <div className="call-direction">{call.direction === 'outbound' ? '→' : '←'}</div>
                </div>

                <div className="call-info">
                <div className="call-patient-name">
                  {call.patientName ? (
                    <PatientLink patNum={call.patNum}>{call.patientName}</PatientLink>
                  ) : (
                    call.phoneNumber
                  )}
                </div>
                  <div className="call-details">
                    <span>{call.phoneNumber}</span><span className="separator">•</span>
                    <span>{new Date(call.timestamp).toLocaleString()}</span><span className="separator">•</span>
                    <span>{getDurationDisplay(call.duration)}</span>
                  </div>
                  {call.note && <div className="call-note">{call.note}</div>}
                </div>

                <div className="call-disposition-badge" style={{ backgroundColor: dispositions[call.disposition]?.color }}>
                  {dispositions[call.disposition]?.label}
                </div>
              </div>

              {call.aiAnalysis && (
                <div className="ai-analysis">
                  <div className="ai-badge">🤖 AI Analysis</div>
                  <div className="ai-content">
                    <div className="ai-item"><strong>Sentiment:</strong> {call.aiAnalysis.sentiment}</div>
                    <div className="ai-item"><strong>Payment Intent:</strong> {call.aiAnalysis.paymentIntent}</div>
                    {call.aiAnalysis.recommendation && (
                      <div className="ai-recommendation"><strong>Action:</strong> {call.aiAnalysis.recommendation}</div>
                    )}
                  </div>
                </div>
              )}

              <div className="call-actions">
                {call.recordingUrl && (
                  <button className="btn btn-secondary btn-small" onClick={() => handlePlayRecording(call)}>
                    {playingAudio === call.callSid ? '⏸️ Pause' : '▶️ Play'}
                  </button>
                )}
                <button className="btn btn-primary btn-small" onClick={() => handleViewCall(call)}>📄 View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCallModal && selectedCall && (
        <div className="modal-overlay" onClick={() => setShowCallModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h3>
              Call Details -{' '}
              {selectedCall.patientName ? (
                <PatientLink patNum={selectedCall.patNum} stopPropagation>
                  {selectedCall.patientName}
                </PatientLink>
              ) : (
                selectedCall.phoneNumber
              )}
            </h3>
            
            {selectedCall.recordingUrl && (
              <div className="recording-section">
                <h4>📻 Recording</h4>
                <audio controls src={selectedCall.recordingUrl} className="audio-player" />
              </div>
            )}

            {selectedCall.transcription && (
              <div className="transcription-section">
                <h4>📝 Transcription</h4>
                <div className="transcription-content">
                  {selectedCall.transcription.segments.map((segment, idx) => (
                    <div key={idx} className="transcript-segment">
                      <div className="transcript-speaker">{segment.speaker}:</div>
                      <div className="transcript-text">{segment.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedCall.aiAnalysis && (
              <div className="ai-analysis-full">
                <h4>🤖 AI Analysis</h4>
                <div className="analysis-grid">
                  <div className="analysis-item"><strong>Sentiment:</strong> <span className={`sentiment ${selectedCall.aiAnalysis.sentiment.toLowerCase()}`}>{selectedCall.aiAnalysis.sentiment}</span></div>
                  <div className="analysis-item"><strong>Payment Intent:</strong> {selectedCall.aiAnalysis.paymentIntent}</div>
                </div>
                {selectedCall.aiAnalysis.recommendation && (
                  <div className="recommendation-box">
                    <strong>🎯 Next Action:</strong> <p>{selectedCall.aiAnalysis.recommendation}</p>
                  </div>
                )}
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setShowCallModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showMakeCallModal && (
        <div className="modal-overlay" onClick={() => setShowMakeCallModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Make Call</h3>
            {selectedPatient ? (
              <div className="selected-patient-box">
                <div>
                  <PatientLink patNum={selectedPatient.patNum} stopPropagation>
                    {getPatientDisplayName(selectedPatient)}
                  </PatientLink>
                  {(selectedPatient.patientPhone || selectedPatient.phone) && (
                    <> - {selectedPatient.patientPhone ?? selectedPatient.phone}</>
                  )}
                </div>
                <button className="btn btn-secondary btn-small" onClick={selectPatientForCall}>Change</button>
              </div>
            ) : (
              <div className="select-patient-prompt" onClick={selectPatientForCall}>
                <div className="select-icon">👤</div><div className="select-text">Select Patient</div>
              </div>
            )}
            <div className="form-group">
              <label>Call Notes</label>
              <textarea className="form-input" rows="3" value={callNotes} onChange={(e) => setCallNotes(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowMakeCallModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleMakeCall} disabled={!selectedPatient}>📞 Call Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CallCenter;
