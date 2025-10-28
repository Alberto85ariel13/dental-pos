import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OpenDentalService from '../services/OpenDentalService';
import PatientLink from '../components/PatientLink';
import './Schedule.css';

function Schedule() {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [duration, setDuration] = useState(60);
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  const [note, setNote] = useState('');
  const [procedures, setProcedures] = useState([]);
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    loadProcedures();
    
    // Check if patient was selected from patient search
    const patientData = sessionStorage.getItem('selectedPatientForSchedule');
    if (patientData) {
      setSelectedPatient(JSON.parse(patientData));
      sessionStorage.removeItem('selectedPatientForSchedule');
    }
  }, []);

  const loadProcedures = async () => {
    try {
      const codes = await OpenDentalService.getProcedureCodes();
      setProcedures(codes);
    } catch (error) {
      console.error('Error loading procedures:', error);
    }
  };

  const selectPatient = () => {
    sessionStorage.setItem('returnToSchedule', 'true');
    navigate('/patients?selectMode=schedule');
  };

  const handleSchedule = async () => {
    if (!selectedPatient) {
      alert('Please select a patient');
      return;
    }
    if (!selectedProcedure) {
      alert('Please select a procedure');
      return;
    }

    try {
      setScheduling(true);

      const appointmentData = {
        patNum: selectedPatient.patNum,
        patientName: `${selectedPatient.fName} ${selectedPatient.lName}`,
        aptDateTime: `${selectedDate.toISOString().split('T')[0]}T${selectedTime}:00`,
        lengthMinutes: duration,
        procedureCode: selectedProcedure.code,
        procedureDescription: selectedProcedure.description,
        estimatedCost: selectedProcedure.fee,
        providerName: 'Dr. Martinez',
        operatory: 'Op 1',
        note: note,
      };

      // Schedule appointment (this will sync to OpenDental and send confirmation)
      const result = await OpenDentalService.scheduleAppointment(appointmentData);

      alert(`✅ Appointment Scheduled Successfully!\n\nAppointment #${result.aptNum}\nPatient: ${appointmentData.patientName}\nDate: ${new Date(appointmentData.aptDateTime).toLocaleString()}\n\n📧 Confirmation email sent to patient\n📊 Synced to OpenDental`);

      // Reset form
      setSelectedPatient(null);
      setSelectedProcedure(null);
      setNote('');
      setSelectedDate(new Date());
      setSelectedTime('09:00');
      setDuration(60);

      // Navigate to appointments to see the new appointment
      navigate('/appointments');
    } catch (error) {
      alert('❌ Failed to schedule appointment. Please try again.');
      console.error('Error scheduling appointment:', error);
    } finally {
      setScheduling(false);
    }
  };

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30',
  ];

  const durations = [15, 30, 45, 60, 90, 120];

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  return (
    <div className="schedule-page">
      <h2 className="page-title">📅 Schedule New Appointment</h2>

      {/* Patient Selection */}
      <div className="schedule-section">
        <div className="section-label">Patient *</div>
        {selectedPatient ? (
          <div className="selected-box">
            <div className="selected-info">
              <div className="selected-name">
                {selectedPatient.fName} {selectedPatient.lName}
              </div>
              <div className="selected-details">
                #{selectedPatient.patNum} • {selectedPatient.phone}
              </div>
            </div>
            <button className="btn btn-secondary btn-small" onClick={selectPatient}>
              Change
            </button>
          </div>
        ) : (
          <div className="select-box" onClick={selectPatient}>
            <div className="select-icon">👤</div>
            <div className="select-text">Select Patient</div>
          </div>
        )}
      </div>

      {/* Procedure Selection */}
      <div className="schedule-section">
        <div className="section-label">Procedure *</div>
        <div className="procedure-grid">
          {procedures.slice(0, 8).map((proc) => (
            <div
              key={proc.code}
              className={`procedure-option ${selectedProcedure?.code === proc.code ? 'selected' : ''}`}
              onClick={() => setSelectedProcedure(proc)}
            >
              <div className="proc-code">{proc.code}</div>
              <div className="proc-name">{proc.description.substring(0, 25)}</div>
              <div className="proc-fee">${proc.fee}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Date Selection */}
      <div className="schedule-section">
        <div className="section-label">Date</div>
        <div className="date-selector">
          <button className="date-btn" onClick={() => changeDate(-1)}>
            ◀
          </button>
          <div className="date-display">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <button className="date-btn" onClick={() => changeDate(1)}>
            ▶
          </button>
        </div>
      </div>

      {/* Time Selection */}
      <div className="schedule-section">
        <div className="section-label">Time</div>
        <div className="time-grid">
          {timeSlots.map((time) => (
            <button
              key={time}
              className={`time-option ${selectedTime === time ? 'selected' : ''}`}
              onClick={() => setSelectedTime(time)}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Duration Selection */}
      <div className="schedule-section">
        <div className="section-label">Duration (minutes)</div>
        <div className="duration-grid">
          {durations.map((dur) => (
            <button
              key={dur}
              className={`duration-option ${duration === dur ? 'selected' : ''}`}
              onClick={() => setDuration(dur)}
            >
              {dur} min
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="schedule-section">
        <div className="section-label">Notes (Optional)</div>
        <textarea
          className="notes-textarea"
          placeholder="Add appointment notes..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
        />
      </div>

      {/* Summary */}
      {selectedPatient && selectedProcedure && (
        <div className="appointment-summary">
          <h3>📋 Appointment Summary</h3>
          <div className="summary-details">
            <div className="summary-row">
              <span>Patient:</span>
              <strong>
                <PatientLink patNum={selectedPatient.patNum}>
                  {selectedPatient.fName} {selectedPatient.lName}
                </PatientLink>
              </strong>
            </div>
            <div className="summary-row">
              <span>Procedure:</span>
              <strong>{selectedProcedure.description}</strong>
            </div>
            <div className="summary-row">
              <span>Date & Time:</span>
              <strong>
                {selectedDate.toLocaleDateString()} at {selectedTime}
              </strong>
            </div>
            <div className="summary-row">
              <span>Duration:</span>
              <strong>{duration} minutes</strong>
            </div>
            <div className="summary-row">
              <span>Fee:</span>
              <strong>${selectedProcedure.fee}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/appointments')}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSchedule}
          disabled={scheduling || !selectedPatient || !selectedProcedure}
        >
          {scheduling ? 'Scheduling...' : '✓ Schedule Appointment'}
        </button>
      </div>

      <div className="sync-info">
        <div className="info-icon">ℹ️</div>
        <div className="info-text">
          Appointments are automatically synced to OpenDental and confirmation emails are sent to patients
        </div>
      </div>
    </div>
  );
}

export default Schedule;
