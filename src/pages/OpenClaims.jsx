import React, { useState, useEffect } from "react";
import OpenDentalService from "../services/OpenDentalService";
import PatientLink from "../components/PatientLink";
import "./OpenClaims.css";

function OpenClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [agingFilter, setAgingFilter] = useState("all");
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [sendingPaymentLink, setSendingPaymentLink] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  useEffect(() => {
    loadClaims();
  }, [filterStatus]);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const claimsData = await OpenDentalService.getOpenClaims(filterStatus);
      setClaims(claimsData);
    } catch (error) {
      console.error("Error loading claims:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendPaymentLink = async (claim) => {
    try {
      setSendingPaymentLink(true);
      const result = await OpenDentalService.sendPaymentLink(claim);

      alert(
        `✅ Payment Link Sent!\n\nSent to: ${
          claim.patientEmail
        }\nAmount: $${claim.patientResponsibility.toFixed(
          2
        )}\n\nThe patient will receive a secure payment link via email.`
      );

      // Update claim status
      await loadClaims();
    } catch (error) {
      alert("❌ Failed to send payment link. Please try again.");
      console.error("Error sending payment link:", error);
    } finally {
      setSendingPaymentLink(false);
    }
  };

  const sendReminder = async (claim) => {
    try {
      setSendingReminder(true);
      await OpenDentalService.sendClaimReminder(claim);

      alert(
        `✅ Reminder Sent!\n\nSent to: ${claim.patientEmail}\n\nThe patient has been notified about their outstanding balance.`
      );

      // Update last reminder date
      await loadClaims();
    } catch (error) {
      alert("❌ Failed to send reminder. Please try again.");
      console.error("Error sending reminder:", error);
    } finally {
      setSendingReminder(false);
    }
  };

  const markAsPaid = async (claim) => {
    if (
      window.confirm(
        `Mark claim #${
          claim.claimNum
        } as paid?\n\nAmount: $${claim.patientResponsibility.toFixed(2)}`
      )
    ) {
      try {
        await OpenDentalService.markClaimPaid(claim.claimNum);
        alert("✅ Claim marked as paid!");
        await loadClaims();
      } catch (error) {
        alert("❌ Failed to update claim. Please try again.");
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#ff9800",
      sent: "#2196f3",
      overdue: "#f44336",
      paid: "#4caf50",
    };
    return colors[status.toLowerCase()] || "#999";
  };

  const getDaysOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getAgingBucket = (claim) => {
    const daysOld = getDaysOverdue(claim.dueDate);
    if (daysOld <= 30) return "0-30";
    if (daysOld <= 60) return "31-60";
    if (daysOld <= 120) return "61-120";
    if (daysOld <= 150) return "121-150";
    return "150+";
  };

  const getAgingStats = () => {
    const stats = {
      "0-30": { count: 0, amount: 0 },
      "31-60": { count: 0, amount: 0 },
      "61-120": { count: 0, amount: 0 },
      "121-150": { count: 0, amount: 0 },
      "150+": { count: 0, amount: 0 },
    };

    claims.forEach((claim) => {
      const bucket = getAgingBucket(claim);
      stats[bucket].count++;
      stats[bucket].amount += claim.patientResponsibility;
    });

    return stats;
  };

  const getFilteredClaims = () => {
    let filtered = claims;
    if (filterStatus !== "all") {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }
    if (agingFilter !== "all") {
      filtered = filtered.filter((c) => getAgingBucket(c) === agingFilter);
    }
    return filtered;
  };

  const agingStats = getAgingStats();
  const filteredClaims = getFilteredClaims();

  return (
    <div className="open-claims-page">
      <div className="claims-header">
        <div>
          <h2 className="page-title">
            💰 Open Claims & Patient Responsibility
          </h2>
          <p className="page-subtitle">
            {claims.length} claim{claims.length !== 1 ? "s" : ""} • Total
            Outstanding:{" "}
            {formatCurrency(
              claims.reduce((sum, c) => sum + c.patientResponsibility, 0)
            )}
          </p>
        </div>
        <button className="btn btn-primary" onClick={loadClaims}>
          🔄 Refresh
        </button>
      </div>

      <div className="filter-section">
        {/* Aging Buckets Dashboard */}
        <div className="aging-dashboard">
          <h3 className="aging-title">📊 Aging Analysis</h3>
          <div className="aging-buckets">
            <div
              className={`aging-bucket ${
                agingFilter === "0-30" ? "active" : ""
              }`}
              onClick={() =>
                setAgingFilter(agingFilter === "0-30" ? "all" : "0-30")
              }
            >
              <div className="bucket-label">0-30 Days</div>
              <div className="bucket-count">{agingStats["0-30"].count}</div>
              <div className="bucket-amount">
                {formatCurrency(agingStats["0-30"].amount)}
              </div>
            </div>
            <div
              className={`aging-bucket ${
                agingFilter === "31-60" ? "active" : ""
              }`}
              onClick={() =>
                setAgingFilter(agingFilter === "31-60" ? "all" : "31-60")
              }
            >
              <div className="bucket-label">31-60 Days</div>
              <div className="bucket-count">{agingStats["31-60"].count}</div>
              <div className="bucket-amount">
                {formatCurrency(agingStats["31-60"].amount)}
              </div>
            </div>
            <div
              className={`aging-bucket ${
                agingFilter === "61-120" ? "active" : ""
              }`}
              onClick={() =>
                setAgingFilter(agingFilter === "61-120" ? "all" : "61-120")
              }
            >
              <div className="bucket-label">61-120 Days</div>
              <div className="bucket-count">{agingStats["61-120"].count}</div>
              <div className="bucket-amount">
                {formatCurrency(agingStats["61-120"].amount)}
              </div>
            </div>
            <div
              className={`aging-bucket ${
                agingFilter === "121-150" ? "active" : ""
              }`}
              onClick={() =>
                setAgingFilter(agingFilter === "121-150" ? "all" : "121-150")
              }
            >
              <div className="bucket-label">121-150 Days</div>
              <div className="bucket-count">{agingStats["121-150"].count}</div>
              <div className="bucket-amount">
                {formatCurrency(agingStats["121-150"].amount)}
              </div>
            </div>
            <div
              className={`aging-bucket severe ${
                agingFilter === "150+" ? "active" : ""
              }`}
              onClick={() =>
                setAgingFilter(agingFilter === "150+" ? "all" : "150+")
              }
            >
              <div className="bucket-label">150+ Days</div>
              <div className="bucket-count">{agingStats["150+"].count}</div>
              <div className="bucket-amount">
                {formatCurrency(agingStats["150+"].amount)}
              </div>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            All Claims
          </button>
          <button
            className={`filter-tab ${
              filterStatus === "pending" ? "active" : ""
            }`}
            onClick={() => setFilterStatus("pending")}
          >
            Pending
          </button>
          <button
            className={`filter-tab ${
              filterStatus === "overdue" ? "active" : ""
            }`}
            onClick={() => setFilterStatus("overdue")}
          >
            Overdue
          </button>
          <button
            className={`filter-tab ${filterStatus === "sent" ? "active" : ""}`}
            onClick={() => setFilterStatus("sent")}
          >
            Payment Link Sent
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading claims...</p>
        </div>
      ) : filteredClaims.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💰</div>
          <p className="empty-text">No claims match the filters</p>
          <p className="empty-subtext">
            Try adjusting the filters or refresh the page
          </p>
        </div>
      ) : (
        <div className="claims-list">
          {filteredClaims.map((claim) => (
            <div key={claim.claimNum} className="claim-card">
              <div className="claim-header">
                <div className="claim-info">
                  <div className="claim-number">Claim #{claim.claimNum}</div>
                  <div className="patient-name">
                    👤{" "}
                    <PatientLink patNum={claim.patNum}>
                      {claim.patientName}
                    </PatientLink>
                  </div>
                </div>
                <div
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(claim.status) }}
                >
                  {claim.status}
                  {claim.status === "overdue" &&
                    ` (${getDaysOverdue(claim.dueDate)} days)`}
                </div>
              </div>

              <div className="claim-details">
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Service Date:</span>
                    <span className="detail-value">
                      {new Date(claim.serviceDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Due Date:</span>
                    <span
                      className={`detail-value ${
                        getDaysOverdue(claim.dueDate) > 0 ? "overdue-text" : ""
                      }`}
                    >
                      {new Date(claim.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Insurance:</span>
                    <span className="detail-value">{claim.insurance}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Billed:</span>
                    <span className="detail-value">
                      {formatCurrency(claim.totalBilled)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Insurance Paid:</span>
                    <span className="detail-value">
                      {formatCurrency(claim.insurancePaid)}
                    </span>
                  </div>
                  <div className="detail-item highlight">
                    <span className="detail-label">
                      Patient Responsibility:
                    </span>
                    <span className="detail-value patient-amount">
                      {formatCurrency(claim.patientResponsibility)}
                    </span>
                  </div>
                </div>

                <div className="procedures-section">
                  <div className="procedures-title">Procedures:</div>
                  <div className="procedures-list">
                    {claim.procedures.map((proc, index) => (
                      <div key={index} className="procedure-item">
                        <span className="proc-code">{proc.code}</span>
                        <span className="proc-desc">{proc.description}</span>
                        <span className="proc-fee">
                          {formatCurrency(proc.fee)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="contact-info">
                  <div className="contact-item">
                    <span className="contact-icon">📧</span>
                    <span className="contact-text">{claim.patientEmail}</span>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">📞</span>
                    <span className="contact-text">{claim.patientPhone}</span>
                  </div>
                  {claim.lastReminderSent && (
                    <div className="contact-item">
                      <span className="contact-icon">📅</span>
                      <span className="contact-text">
                        Last reminder:{" "}
                        {new Date(claim.lastReminderSent).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="claim-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => sendPaymentLink(claim)}
                  disabled={sendingPaymentLink}
                >
                  {sendingPaymentLink ? "Sending..." : "💳 Send Payment Link"}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => sendReminder(claim)}
                  disabled={sendingReminder}
                >
                  {sendingReminder ? "Sending..." : "📧 Send Reminder"}
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => markAsPaid(claim)}
                >
                  ✓ Mark as Paid
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="auto-recovery-section">
        <div className="section-header">
          <h3>🔄 Automatic Recovery Settings</h3>
        </div>
        <div className="recovery-info">
          <div className="info-card">
            <div className="info-icon">✉️</div>
            <div className="info-content">
              <div className="info-title">Automatic Reminders</div>
              <div className="info-text">
                System automatically sends reminders for overdue claims every 7
                days
              </div>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">💳</div>
            <div className="info-content">
              <div className="info-title">Payment Links</div>
              <div className="info-text">
                Secure payment links expire after 30 days and track payment
                status
              </div>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">📊</div>
            <div className="info-content">
              <div className="info-title">Recovery Tracking</div>
              <div className="info-text">
                All payment activity syncs back to OpenDental automatically
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OpenClaims;
