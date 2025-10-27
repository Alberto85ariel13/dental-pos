import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OpenDentalService from '../services/OpenDentalService';
import './Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [procedures, setProcedures] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    loadProcedures();
    
    // Check if patient was selected from patient search
    const patientData = sessionStorage.getItem('selectedPatient');
    if (patientData) {
      setSelectedPatient(JSON.parse(patientData));
      sessionStorage.removeItem('selectedPatient');
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
    navigate('/patients?selectMode=true');
  };

  const addToCart = (procedure) => {
    if (!selectedPatient) {
      alert('Please select a patient first');
      return;
    }
    setCart([...cart, { ...procedure, id: Date.now() }]);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.fee, 0);
  };

  const processPayment = () => {
    if (!selectedPatient) {
      alert('Please select a patient first');
      return;
    }
    if (cart.length === 0) {
      alert('Please add services to process payment');
      return;
    }

    const total = calculateTotal();
    if (window.confirm(`Process payment of $${total.toFixed(2)} for ${selectedPatient.fName} ${selectedPatient.lName}?`)) {
      alert(`✅ Payment processed successfully!\n\nTotal: $${total.toFixed(2)}\nReceipt sent to ${selectedPatient.email}`);
      setCart([]);
      setSelectedPatient(null);
    }
  };

  return (
    <div className="checkout-page">
      <div className="section">
        <h2 className="section-title">📋 Patient</h2>
        {selectedPatient ? (
          <div className="patient-card selected">
            <div className="patient-info">
              <div className="patient-name">
                {selectedPatient.fName} {selectedPatient.lName}
              </div>
              <div className="patient-details">
                #{selectedPatient.patNum} • {selectedPatient.insurance}
              </div>
            </div>
            <button className="btn btn-secondary" onClick={selectPatient}>
              Change
            </button>
          </div>
        ) : (
          <div className="select-patient-box" onClick={selectPatient}>
            <div className="select-icon">👤</div>
            <div className="select-text">Select Patient</div>
            <div className="select-subtext">Click to search and select a patient</div>
          </div>
        )}
      </div>

      <div className="section">
        <h2 className="section-title">🦷 Services</h2>
        <div className="services-grid">
          {procedures.map((proc) => (
            <div
              key={proc.code}
              className="service-card"
              onClick={() => addToCart(proc)}
            >
              <div className="service-icon">🦷</div>
              <div className="service-code">{proc.code}</div>
              <div className="service-description">{proc.description}</div>
              <div className="service-fee">${proc.fee}</div>
            </div>
          ))}
        </div>
      </div>

      {cart.length > 0 && (
        <>
          <div className="section">
            <h2 className="section-title">🛒 Current Transaction</h2>
            <div className="cart-container">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.description}</div>
                    <div className="cart-item-code">{item.code}</div>
                  </div>
                  <div className="cart-item-right">
                    <div className="cart-item-fee">${item.fee}</div>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="total-bar">
            <div className="total-label">Total Amount</div>
            <div className="total-amount">${calculateTotal().toFixed(2)}</div>
          </div>

          <div className="action-buttons">
            <button className="btn btn-secondary" onClick={() => setCart([])}>
              Clear All
            </button>
            <button className="btn btn-primary" onClick={processPayment}>
              💳 Process Payment
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Checkout;
