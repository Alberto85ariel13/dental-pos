import React, { useState, useEffect } from 'react';
import OpenDentalService from '../services/OpenDentalService';
import './SettingsEnhanced.css';

function Settings() {
  const [activeTab, setActiveTab] = useState('opendental');
  
  // OpenDental settings
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  
  // Eligibility settings
  const [eligibilityProvider, setEligibilityProvider] = useState('dentalxchange');
  const [dxApiKey, setDxApiKey] = useState('');
  const [availityClientId, setAvailityClientId] = useState('');
  const [availitySecret, setAvailitySecret] = useState('');
  const [changeApiKey, setChangeApiKey] = useState('');
  const [officeAllyKey, setOfficeAllyKey] = useState('');
  
  // Twilio settings
  const [twilioAccountSid, setTwilioAccountSid] = useState('');
  const [twilioAuthToken, setTwilioAuthToken] = useState('');
  const [twilioPhoneNumber, setTwilioPhoneNumber] = useState('');
  const [twilioAiEnabled, setTwilioAiEnabled] = useState(true);
  
  // Avvance (POS Lending) settings
  const [advanceEnabled, setAdvanceEnabled] = useState(false);
  const [advanceApiKey, setAdvanceApiKey] = useState('');
  const [advanceMinAmount, setAdvanceMinAmount] = useState(500);
  
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    // Load OpenDental settings
    const odSettings = OpenDentalService.getSettings();
    if (odSettings.url) setUrl(odSettings.url);
    if (odSettings.apiKey) setApiKey(odSettings.apiKey);
    
    // Load eligibility settings
    const eligSettings = localStorage.getItem('eligibilitySettings');
    if (eligSettings) {
      const parsed = JSON.parse(eligSettings);
      setEligibilityProvider(parsed.provider || 'dentalxchange');
      setDxApiKey(parsed.dxApiKey || '');
      setAvailityClientId(parsed.availityClientId || '');
      setAvailitySecret(parsed.availitySecret || '');
      setChangeApiKey(parsed.changeApiKey || '');
      setOfficeAllyKey(parsed.officeAllyKey || '');
    }
    
    // Load Twilio settings
    const twilioSettings = localStorage.getItem('twilioSettings');
    if (twilioSettings) {
      const parsed = JSON.parse(twilioSettings);
      setTwilioAccountSid(parsed.accountSid || '');
      setTwilioAuthToken(parsed.authToken || '');
      setTwilioPhoneNumber(parsed.phoneNumber || '');
      setTwilioAiEnabled(parsed.aiEnabled !== false);
    }
    
    // Load Avvance settings
    const advanceSettings = localStorage.getItem('advanceSettings');
    if (advanceSettings) {
      const parsed = JSON.parse(advanceSettings);
      setAdvanceEnabled(parsed.enabled || false);
      setAdvanceApiKey(parsed.apiKey || '');
      setAdvanceMinAmount(parsed.minAmount || 500);
    }
  };

  const handleSave = () => {
    if (!url || !apiKey) {
      alert('Please fill in OpenDental URL and API Key');
      return;
    }

    try {
      setSaving(true);
      
      // Save OpenDental settings
      OpenDentalService.setSettings(url, apiKey);
      
      // Save eligibility settings
      localStorage.setItem('eligibilitySettings', JSON.stringify({
        provider: eligibilityProvider,
        dxApiKey,
        availityClientId,
        availitySecret,
        changeApiKey,
        officeAllyKey
      }));
      
      // Save Twilio settings
      localStorage.setItem('twilioSettings', JSON.stringify({
        accountSid: twilioAccountSid,
        authToken: twilioAuthToken,
        phoneNumber: twilioPhoneNumber,
        aiEnabled: twilioAiEnabled
      }));
      
      // Save Avvance settings
      localStorage.setItem('advanceSettings', JSON.stringify({
        enabled: advanceEnabled,
        apiKey: advanceApiKey,
        minAmount: advanceMinAmount
      }));
      
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
    <div className="settings-page-enhanced">
      <h2 className="page-title">⚙️ System Settings</h2>

      {/* Tab Navigation */}
      <div className="settings-tabs">
        <button
          className={`settings-tab ${activeTab === 'opendental' ? 'active' : ''}`}
          onClick={() => setActiveTab('opendental')}
        >
          🦷 OpenDental
        </button>
        <button
          className={`settings-tab ${activeTab === 'eligibility' ? 'active' : ''}`}
          onClick={() => setActiveTab('eligibility')}
        >
          🔍 Eligibility
        </button>
        <button
          className={`settings-tab ${activeTab === 'twilio' ? 'active' : ''}`}
          onClick={() => setActiveTab('twilio')}
        >
          📞 Twilio AI Calls
        </button>
        <button
          className={`settings-tab ${activeTab === 'advance' ? 'active' : ''}`}
          onClick={() => setActiveTab('advance')}
        >
          💳 Avvance POS Lending
        </button>
      </div>

      {/* OpenDental Settings */}
      {activeTab === 'opendental' && (
        <div className="settings-content">
          <div className="settings-section">
            <h3>OpenDental API Configuration</h3>
            <div className="form-group">
              <label>Server URL</label>
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
              <label>API Key</label>
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
              <button className="btn btn-secondary" onClick={handleTest} disabled={testing}>
                {testing ? 'Testing...' : '🔌 Test Connection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Eligibility Settings */}
      {activeTab === 'eligibility' && (
        <div className="settings-content">
          <div className="settings-section">
            <h3>Insurance Eligibility Verification</h3>
            
            <div className="form-group">
              <label>Eligibility Provider</label>
              <select
                className="form-input"
                value={eligibilityProvider}
                onChange={(e) => setEligibilityProvider(e.target.value)}
              >
                <option value="opendental">OpenDental Built-in</option>
                <option value="dentalxchange">DentalXChange</option>
                <option value="availity">Availity</option>
                <option value="changehealthcare">Change Healthcare</option>
                <option value="officeally">Office Ally</option>
              </select>
            </div>

            {eligibilityProvider === 'dentalxchange' && (
              <div className="provider-config">
                <h4>DentalXChange Configuration</h4>
                <div className="form-group">
                  <label>API Key</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter DentalXChange API key"
                    value={dxApiKey}
                    onChange={(e) => setDxApiKey(e.target.value)}
                  />
                </div>
                <div className="info-box">
                  <strong>Cost:</strong> $0.10-0.20 per check<br/>
                  <strong>Coverage:</strong> 2,500+ payers<br/>
                  <strong>Response Time:</strong> 5-10 seconds
                </div>
              </div>
            )}

            {eligibilityProvider === 'availity' && (
              <div className="provider-config">
                <h4>Availity Configuration</h4>
                <div className="form-group">
                  <label>Client ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter Availity Client ID"
                    value={availityClientId}
                    onChange={(e) => setAvailityClientId(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Client Secret</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter Availity Client Secret"
                    value={availitySecret}
                    onChange={(e) => setAvailitySecret(e.target.value)}
                  />
                </div>
                <div className="info-box">
                  <strong>Cost:</strong> Subscription-based<br/>
                  <strong>Coverage:</strong> 2,000+ payers<br/>
                  <strong>Response Time:</strong> 2-5 seconds
                </div>
              </div>
            )}

            {eligibilityProvider === 'changehealthcare' && (
              <div className="provider-config">
                <h4>Change Healthcare Configuration</h4>
                <div className="form-group">
                  <label>API Key</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter Change Healthcare API key"
                    value={changeApiKey}
                    onChange={(e) => setChangeApiKey(e.target.value)}
                  />
                </div>
                <div className="info-box">
                  <strong>Cost:</strong> Volume-based pricing<br/>
                  <strong>Coverage:</strong> 2,800+ payers<br/>
                  <strong>Response Time:</strong> 3-8 seconds
                </div>
              </div>
            )}

            {eligibilityProvider === 'officeally' && (
              <div className="provider-config">
                <h4>Office Ally Configuration</h4>
                <div className="form-group">
                  <label>API Key</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter Office Ally API key"
                    value={officeAllyKey}
                    onChange={(e) => setOfficeAllyKey(e.target.value)}
                  />
                </div>
                <div className="info-box">
                  <strong>Cost:</strong> Free tier available, then $29/month<br/>
                  <strong>Coverage:</strong> 1,500+ payers<br/>
                  <strong>Response Time:</strong> 10-15 seconds
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Twilio AI Calls Settings */}
      {activeTab === 'twilio' && (
        <div className="settings-content">
          <div className="settings-section">
            <h3>Twilio AI-Powered Calling System</h3>
            
            <div className="form-group">
              <label>Account SID</label>
              <input
                type="text"
                className="form-input"
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={twilioAccountSid}
                onChange={(e) => setTwilioAccountSid(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Auth Token</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter Twilio Auth Token"
                value={twilioAuthToken}
                onChange={(e) => setTwilioAuthToken(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Twilio Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+1 (555) 123-4567"
                value={twilioPhoneNumber}
                onChange={(e) => setTwilioPhoneNumber(e.target.value)}
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={twilioAiEnabled}
                  onChange={(e) => setTwilioAiEnabled(e.target.checked)}
                />
                <span>Enable AI-Powered Call Handling</span>
              </label>
              <div className="form-hint">
                AI will handle patient responses, capture information, and process payments over the phone
              </div>
            </div>

            <div className="feature-list">
              <h4>AI Call Features:</h4>
              <ul>
                <li>✅ Automatic payment reminders</li>
                <li>✅ Smart voicemail detection</li>
                <li>✅ AI conversation for payment collection</li>
                <li>✅ SMS payment link fallback</li>
                <li>✅ Credit card capture over phone (PCI compliant)</li>
                <li>✅ Update phone/email information</li>
                <li>✅ AI-recommended next disposition</li>
                <li>✅ Call tracking and analytics</li>
              </ul>
            </div>

            <div className="info-box">
              <strong>How It Works:</strong><br/>
              1. System automatically calls patients with overdue balances<br/>
              2. AI engages in natural conversation<br/>
              3. Captures payment via credit card or sends SMS link<br/>
              4. Updates contact information if needed<br/>
              5. Logs call outcome and recommends next action<br/>
              6. Voicemails are tracked for follow-up
            </div>
          </div>
        </div>
      )}

      {/* Avvance POS Lending Settings */}
      {activeTab === 'advance' && (
        <div className="settings-content">
          <div className="settings-section">
            <h3>Avvance - Consumer Finance</h3>
            
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={advanceEnabled}
                  onChange={(e) => setAdvanceEnabled(e.target.checked)}
                />
                <span>Enable Avvance POS Lending</span>
              </label>
              <div className="form-hint">
                Offer flexible payment plans for high-value procedures not covered by insurance
              </div>
            </div>

            {advanceEnabled && (
              <>
                <div className="form-group">
                  <label>Avvance API Key</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter Avvance API key"
                    value={advanceApiKey}
                    onChange={(e) => setAdvanceApiKey(e.target.value)}
                  />
                  <div className="form-hint">
                    Get your API key from advance.com/partners
                  </div>
                </div>

                <div className="form-group">
                  <label>Minimum Amount ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="500"
                    value={advanceMinAmount}
                    onChange={(e) => setAdvanceMinAmount(parseInt(e.target.value))}
                  />
                  <div className="form-hint">
                    Only offer POS Lending for procedures above this amount
                  </div>
                </div>

                <div className="feature-list">
                  <h4>Avvance Features:</h4>
                  <ul>
                    <li>💳 Flexible payment plans (3-24 months)</li>
                    <li>✅ Instant approval (90% approval rate)</li>
                    <li>🏦 No credit check required</li>
                    <li>💰 You get paid upfront</li>
                    <li>📊 Patient portal for account management</li>
                    <li>🔔 Automatic payment reminders</li>
                    <li>📱 Mobile-friendly application</li>
                  </ul>
                </div>

                <div className="info-box">
                  <strong>When to Offer:</strong><br/>
                  • Crowns and bridges ($1,500+)<br/>
                  • Implants ($3,000+)<br/>
                  • Orthodontics ($5,000+)<br/>
                  • Full mouth reconstructions ($10,000+)<br/>
                  • Any procedure with high patient responsibility
                </div>

                <div className="success-box">
                  <strong>Benefits:</strong><br/>
                  • Increase case acceptance by 40%<br/>
                  • Eliminate payment collections<br/>
                  • Improve patient satisfaction<br/>
                  • Get paid immediately (24-48 hours)
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="settings-footer">
        <button
          className="btn btn-primary btn-large"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : '💾 Save All Settings'}
        </button>
      </div>
    </div>
  );
}

export default Settings;
