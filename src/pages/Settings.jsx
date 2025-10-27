import React, { useState, useEffect } from 'react';
import OpenDentalService from '../services/OpenDentalService';
import './Settings.css';

function Settings() {
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const settings = OpenDentalService.getSettings();
    if (settings.url) setUrl(settings.url);
    if (settings.apiKey) setApiKey(settings.apiKey);
  }, []);

  const handleSave = () => {
    if (!url || !apiKey) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setSaving(true);
      OpenDentalService.setSettings(url, apiKey);
      alert('✅ Settings saved successfully!');
    } catch (error) {
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!url || !apiKey) {
      alert('Please fill in all fields first');
      return;
    }

    try {
      setTesting(true);
      OpenDentalService.setSettings(url, apiKey);
      await OpenDentalService.searchPatients('');
      alert('🔌 Connection Successful!\n\nSuccessfully connected to OpenDental API.');
    } catch (error) {
      alert('❌ Connection Failed\n\nCould not connect to OpenDental. Please check your URL and API key.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="header-icon">⚙️</div>
        <div>
          <h2 className="settings-title">OpenDental Configuration</h2>
          <p className="settings-subtitle">Connect your POS to OpenDental</p>
        </div>
      </div>

      <div className="settings-form">
        <div className="form-group">
          <label className="form-label">OpenDental Server URL</label>
          <input
            type="text"
            className="form-input"
            placeholder="https://your-server.com/api"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <div className="form-hint">
            Enter the full URL to your OpenDental API server
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">API Key</label>
          <input
            type="password"
            className="form-input"
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <div className="form-hint">
            Your OpenDental API authentication key
          </div>
        </div>

        <div className="action-buttons">
          <button
            className="btn btn-secondary"
            onClick={handleTest}
            disabled={testing}
          >
            {testing ? 'Testing...' : '🔌 Test Connection'}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save Settings'}
          </button>
        </div>
      </div>

      <div className="info-card">
        <div className="info-title">📋 Setup Instructions</div>
        <ol className="info-steps">
          <li>Log in to your OpenDental server</li>
          <li>Navigate to Setup → API Settings</li>
          <li>Enable API access</li>
          <li>Generate a new API key</li>
          <li>Copy the API URL and key here</li>
          <li>Test the connection</li>
          <li>Save settings</li>
        </ol>
      </div>

      <div className="warning-card">
        <div className="warning-icon">⚠️</div>
        <div className="warning-text">
          <strong>Security Notice:</strong> Keep your API key secure. Never share
          it with unauthorized users. Store credentials safely and use HTTPS for
          all API communications.
        </div>
      </div>

      <div className="demo-card">
        <div className="demo-title">ℹ️ Demo Mode</div>
        <div className="demo-text">
          This application is currently running with sample data for demonstration
          purposes. Configure your OpenDental connection above to use live data
          from your practice management system.
        </div>
      </div>
    </div>
  );
}

export default Settings;
