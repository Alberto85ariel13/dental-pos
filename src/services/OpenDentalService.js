import axios from 'axios';

class OpenDentalService {
  constructor() {
    this.baseURL = localStorage.getItem('openDentalURL') || '';
    this.apiKey = localStorage.getItem('openDentalAPIKey') || '';
  }

  setSettings(url, apiKey) {
    this.baseURL = url;
    this.apiKey = apiKey;
    localStorage.setItem('openDentalURL', url);
    localStorage.setItem('openDentalAPIKey', apiKey);
  }

  getSettings() {
    return {
      url: this.baseURL,
      apiKey: this.apiKey
    };
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
  }

  // Mock data for demonstration
  getMockPatients() {
    return [
      {
        patNum: 1001,
        fName: 'Sarah',
        lName: 'Johnson',
        phone: '(555) 123-4567',
        email: 'sarah.j@email.com',
        insurance: 'Delta Dental PPO',
        balance: 0.00,
        lastVisit: '2025-08-15'
      },
      {
        patNum: 1002,
        fName: 'Michael',
        lName: 'Chen',
        phone: '(555) 234-5678',
        email: 'mchen@email.com',
        insurance: 'MetLife Dental',
        balance: 125.00,
        lastVisit: '2025-09-30'
      },
      {
        patNum: 1003,
        fName: 'David',
        lName: 'Rodriguez',
        phone: '(555) 345-6789',
        email: 'drodriguez@email.com',
        insurance: 'Guardian Dental',
        balance: 0.00,
        lastVisit: '2025-10-05'
      },
      {
        patNum: 1004,
        fName: 'Emily',
        lName: 'Watson',
        phone: '(555) 456-7890',
        email: 'ewatson@email.com',
        insurance: 'Cigna Dental',
        balance: 250.00,
        lastVisit: '2025-09-15'
      }
    ];
  }

  async searchPatients(searchTerm) {
    try {
      // Uncomment when ready to use real API
      // const response = await axios.get(`${this.baseURL}/api/patients/search`, {
      //   headers: this.getHeaders(),
      //   params: { query: searchTerm }
      // });
      // return response.data;

      // Mock implementation
      const patients = this.getMockPatients();
      if (!searchTerm) return patients;
      
      const term = searchTerm.toLowerCase();
      return patients.filter(p => 
        p.fName.toLowerCase().includes(term) ||
        p.lName.toLowerCase().includes(term) ||
        p.phone.includes(term) ||
        p.patNum.toString().includes(term)
      );
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  }

  async getPatient(patNum) {
    try {
      const patients = this.getMockPatients();
      return patients.find(p => p.patNum === patNum);
    } catch (error) {
      console.error('Error getting patient:', error);
      throw error;
    }
  }

  async getProcedureCodes() {
    return [
      { code: 'D0120', description: 'Periodic Oral Evaluation', fee: 85 },
      { code: 'D0150', description: 'Comprehensive Oral Evaluation', fee: 100 },
      { code: 'D0210', description: 'Complete Intraoral Radiographs', fee: 200 },
      { code: 'D1110', description: 'Prophylaxis - Adult', fee: 120 },
      { code: 'D1120', description: 'Prophylaxis - Child', fee: 85 },
      { code: 'D2140', description: 'Amalgam - One Surface', fee: 180 },
      { code: 'D2150', description: 'Amalgam - Two Surfaces', fee: 220 },
      { code: 'D2330', description: 'Resin - One Surface', fee: 195 },
      { code: 'D2740', description: 'Crown - Porcelain/Ceramic', fee: 1500 },
      { code: 'D3310', description: 'Root Canal - Anterior', fee: 900 },
      { code: 'D3320', description: 'Root Canal - Bicuspid', fee: 1100 },
      { code: 'D7140', description: 'Extraction - Erupted Tooth', fee: 250 },
      { code: 'D9972', description: 'External Bleaching', fee: 450 },
    ];
  }

  async getAppointments(date) {
    return [
      {
        aptNum: 2001,
        patNum: 1002,
        patientName: 'Michael Chen',
        aptDateTime: '2025-10-22T09:00:00',
        lengthMinutes: 60,
        procedureCode: 'D1110',
        procedureDescription: 'Routine Checkup & Cleaning',
        providerName: 'Dr. Martinez',
        operatory: 'Op 1',
        status: 'Scheduled'
      },
      {
        aptNum: 2002,
        patNum: 1001,
        patientName: 'Sarah Johnson',
        aptDateTime: '2025-10-22T10:30:00',
        lengthMinutes: 90,
        procedureCode: 'D2740',
        procedureDescription: 'Crown Fitting',
        providerName: 'Dr. Martinez',
        operatory: 'Op 2',
        status: 'Scheduled'
      },
      {
        aptNum: 2003,
        patNum: 1003,
        patientName: 'David Rodriguez',
        aptDateTime: '2025-10-22T14:00:00',
        lengthMinutes: 120,
        procedureCode: 'D3310',
        procedureDescription: 'Root Canal Treatment',
        providerName: 'Dr. Lee',
        operatory: 'Op 1',
        status: 'Scheduled'
      },
      {
        aptNum: 2004,
        patNum: 1004,
        patientName: 'Emily Watson',
        aptDateTime: '2025-10-22T15:30:00',
        lengthMinutes: 45,
        procedureCode: 'D9972',
        procedureDescription: 'Teeth Whitening',
        providerName: 'Dr. Martinez',
        operatory: 'Op 3',
        status: 'Scheduled'
      }
    ];
  }

  async scheduleAppointment(appointmentData) {
    try {
      // Real API call would be:
      // const response = await axios.post(`${this.baseURL}/api/appointments`, appointmentData, {
      //   headers: this.getHeaders()
      // });
      
      // Mock implementation
      const newAppointment = {
        aptNum: Math.floor(Math.random() * 10000) + 3000,
        ...appointmentData,
        status: 'Scheduled'
      };

      // Sync back to OpenDental
      await this.syncAppointmentToOpenDental(newAppointment);

      // Send confirmation message
      await this.sendAppointmentConfirmation(newAppointment);

      return newAppointment;
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      throw error;
    }
  }

  // Sync appointment back to OpenDental
  async syncAppointmentToOpenDental(appointment) {
    try {
      // Real API call:
      // await axios.post(`${this.baseURL}/api/appointments/sync`, appointment, {
      //   headers: this.getHeaders()
      // });
      
      console.log('Syncing appointment to OpenDental:', appointment);
      return { success: true };
    } catch (error) {
      console.error('Error syncing appointment:', error);
      throw error;
    }
  }

  // Send appointment confirmation
  async sendAppointmentConfirmation(appointment) {
    try {
      console.log('Sending appointment confirmation:', appointment);
      return { success: true };
    } catch (error) {
      console.error('Error sending confirmation:', error);
      throw error;
    }
  }

  // Get open claims
  async getOpenClaims(filterStatus = 'all') {
    try {
      const mockClaims = [
        {
          claimNum: 5001,
          patNum: 1001,
          patientName: 'Sarah Johnson',
          patientEmail: 'sarah.j@email.com',
          patientPhone: '(555) 123-4567',
          insurance: 'Delta Dental PPO',
          serviceDate: '2025-09-15',
          dueDate: '2025-10-15',
          totalBilled: 850.00,
          insurancePaid: 595.00,
          patientResponsibility: 255.00,
          status: 'pending',
          procedures: [
            { code: 'D2740', description: 'Crown - Porcelain/Ceramic', fee: 850.00 }
          ],
          lastReminderSent: null
        },
        {
          claimNum: 5002,
          patNum: 1002,
          patientName: 'Michael Chen',
          patientEmail: 'mchen@email.com',
          patientPhone: '(555) 234-5678',
          insurance: 'MetLife Dental',
          serviceDate: '2025-08-20',
          dueDate: '2025-09-20',
          totalBilled: 1200.00,
          insurancePaid: 960.00,
          patientResponsibility: 240.00,
          status: 'overdue',
          procedures: [
            { code: 'D3310', description: 'Root Canal - Anterior', fee: 900.00 },
            { code: 'D2740', description: 'Crown Build-up', fee: 300.00 }
          ],
          lastReminderSent: '2025-10-01'
        },
        {
          claimNum: 5003,
          patNum: 1004,
          patientName: 'Emily Watson',
          patientEmail: 'ewatson@email.com',
          patientPhone: '(555) 456-7890',
          insurance: 'Cigna Dental',
          serviceDate: '2025-10-01',
          dueDate: '2025-11-01',
          totalBilled: 450.00,
          insurancePaid: 360.00,
          patientResponsibility: 90.00,
          status: 'sent',
          procedures: [
            { code: 'D9972', description: 'External Bleaching', fee: 450.00 }
          ],
          lastReminderSent: '2025-10-15'
        },
        {
          claimNum: 5004,
          patNum: 1003,
          patientName: 'David Rodriguez',
          patientEmail: 'drodriguez@email.com',
          patientPhone: '(555) 345-6789',
          insurance: 'Guardian Dental',
          serviceDate: '2025-07-10',
          dueDate: '2025-08-10',
          totalBilled: 650.00,
          insurancePaid: 520.00,
          patientResponsibility: 130.00,
          status: 'overdue',
          procedures: [
            { code: 'D2150', description: 'Amalgam - Two Surfaces', fee: 220.00 },
            { code: 'D1110', description: 'Prophylaxis - Adult', fee: 120.00 },
            { code: 'D0210', description: 'Complete Intraoral Radiographs', fee: 200.00 }
          ],
          lastReminderSent: '2025-09-10'
        }
      ];

      if (filterStatus !== 'all') {
        return mockClaims.filter(c => c.status === filterStatus);
      }
      return mockClaims;
    } catch (error) {
      console.error('Error getting open claims:', error);
      throw error;
    }
  }

  // Send payment link
  async sendPaymentLink(claim) {
    try {
      console.log('Sending payment link:', claim);
      await this.updateClaimStatus(claim.claimNum, 'sent');
      return {
        success: true,
        paymentLink: `https://payments.dentalpro.com/pay/${claim.claimNum}`,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
    } catch (error) {
      console.error('Error sending payment link:', error);
      throw error;
    }
  }

  // Send claim reminder
  async sendClaimReminder(claim) {
    try {
      console.log('Sending claim reminder:', claim);
      await this.updateClaimReminderDate(claim.claimNum);
      return { success: true };
    } catch (error) {
      console.error('Error sending reminder:', error);
      throw error;
    }
  }

  // Mark claim as paid
  async markClaimPaid(claimNum) {
    try {
      console.log('Marking claim as paid:', claimNum);
      await this.syncPaymentToOpenDental(claimNum);
      return { success: true };
    } catch (error) {
      console.error('Error marking claim paid:', error);
      throw error;
    }
  }

  // Update claim status
  async updateClaimStatus(claimNum, status) {
    try {
      console.log('Updating claim status:', claimNum, status);
      return { success: true };
    } catch (error) {
      console.error('Error updating claim status:', error);
      throw error;
    }
  }

  // Update claim reminder date
  async updateClaimReminderDate(claimNum) {
    try {
      console.log('Updating reminder date:', claimNum);
      return { success: true };
    } catch (error) {
      console.error('Error updating reminder date:', error);
      throw error;
    }
  }

  // Sync payment back to OpenDental
  async syncPaymentToOpenDental(claimNum) {
    try {
      console.log('Syncing payment to OpenDental:', claimNum);
      return { success: true };
    } catch (error) {
      console.error('Error syncing payment:', error);
      throw error;
    }
  }

  // Auto-send reminders for overdue claims
  async autoSendReminders() {
    try {
      console.log('Auto-sending reminders for overdue claims');
      const overdueClaims = await this.getOpenClaims('overdue');
      for (const claim of overdueClaims) {
        if (!claim.lastReminderSent || this.daysSince(claim.lastReminderSent) >= 7) {
          await this.sendClaimReminder(claim);
        }
      }
      return { success: true, remindersSent: overdueClaims.length };
    } catch (error) {
      console.error('Error auto-sending reminders:', error);
      throw error;
    }
  }

  // Helper: Calculate days since date
  daysSince(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - date);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Get today's patients with status
  async getTodayPatients() {
    try {
      // Real API call:
      // const response = await axios.get(`${this.baseURL}/api/appointments/today`, {
      //   headers: this.getHeaders()
      // });

      const today = new Date().toISOString().split('T')[0];
      const appointments = await this.getAppointments(today);
      
      // Add status and room info to each appointment
      return appointments.map(apt => ({
        ...apt,
        status: apt.status || 'scheduled',
        currentRoom: apt.currentRoom || null,
        patientPhone: apt.patientPhone || '(555) 000-0000',
        note: apt.note || ''
      }));
    } catch (error) {
      console.error('Error getting today patients:', error);
      throw error;
    }
  }

  // Update patient status and room
  async updatePatientStatus(aptNum, status, room) {
    try {
      // Real API call:
      // await axios.put(`${this.baseURL}/api/appointments/${aptNum}/status`, {
      //   status: status,
      //   room: room,
      //   timestamp: new Date().toISOString()
      // }, {
      //   headers: this.getHeaders()
      // });

      console.log('Updating patient status:', aptNum, status, room);
      
      // Sync to OpenDental
      await this.syncStatusToOpenDental(aptNum, status, room);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating patient status:', error);
      throw error;
    }
  }

  // Sync status change to OpenDental
  async syncStatusToOpenDental(aptNum, status, room) {
    try {
      // Real API call:
      // await axios.post(`${this.baseURL}/api/appointments/${aptNum}/sync-status`, {
      //   status: status,
      //   room: room,
      //   timestamp: new Date().toISOString()
      // }, {
      //   headers: this.getHeaders()
      // });

      console.log('Syncing status to OpenDental:', aptNum, status, room);
      return { success: true };
    } catch (error) {
      console.error('Error syncing status:', error);
      throw error;
    }
  }

  // Update appointment details
  async updateAppointment(appointmentData) {
    try {
      // Real API call:
      // await axios.put(`${this.baseURL}/api/appointments/${appointmentData.aptNum}`, 
      //   appointmentData, {
      //   headers: this.getHeaders()
      // });

      console.log('Updating appointment:', appointmentData);
      
      // Sync changes to OpenDental
      await this.syncAppointmentToOpenDental(appointmentData);
      
      // Send update notification if time changed
      if (appointmentData.timeChanged) {
        await this.sendAppointmentUpdateNotification(appointmentData);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }

  // Send appointment update notification
  async sendAppointmentUpdateNotification(appointment) {
    try {
      console.log('Sending appointment update notification:', appointment);
      return { success: true };
    } catch (error) {
      console.error('Error sending update notification:', error);
      throw error;
    }
  }

  // Check insurance eligibility (multiple integration options)
  async checkInsuranceEligibility(patient) {
    try {
      // Option 1: Direct PMS integration
      // const response = await axios.post(`${this.baseURL}/api/eligibility/check`, {
      //   patientId: patient.patNum,
      //   insurance: patient.insurance
      // }, {
      //   headers: this.getHeaders()
      // });
      
      // Option 2: Third-party eligibility service (DentalXChange, Availity, etc.)
      // const response = await this.checkEligibilityViaThirdParty(patient);
      
      // Option 3: OpenDental built-in eligibility
      // const response = await this.checkEligibilityOpenDental(patient);

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      
      return {
        active: true,
        patientName: patient.patientName,
        planName: patient.insurance,
        coverageLevel: 'Individual',
        deductible: 50,
        deductibleMet: 25,
        annualMax: 1500,
        annualUsed: 450,
        preventiveCoverage: 100,
        basicCoverage: 80,
        majorCoverage: 50,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error checking eligibility:', error);
      throw error;
    }
  }

  // Third-party eligibility check (DentalXChange example)
  async checkEligibilityViaThirdParty(patient) {
    try {
      // Example: DentalXChange API
      // const response = await axios.post('https://api.dentalxchange.com/eligibility/v1/check', {
      //   subscriberId: patient.patNum,
      //   firstName: patient.patientName.split(' ')[0],
      //   lastName: patient.patientName.split(' ')[1],
      //   dateOfBirth: patient.dob,
      //   insuranceId: patient.insuranceId
      // }, {
      //   headers: {
      //     'Authorization': 'Bearer YOUR_DX_API_KEY',
      //     'Content-Type': 'application/json'
      //   }
      // });

      // Example: Availity API
      // const response = await axios.post('https://api.availity.com/eligibility', {
      //   payerId: patient.payerId,
      //   providerId: 'YOUR_PROVIDER_ID',
      //   subscriber: {
      //     memberId: patient.memberId,
      //     firstName: patient.firstName,
      //     lastName: patient.lastName,
      //     dateOfBirth: patient.dob
      //   }
      // }, {
      //   headers: {
      //     'Authorization': 'Bearer YOUR_AVAILITY_TOKEN'
      //   }
      // });

      console.log('Checking eligibility via third-party:', patient);
      return { success: true };
    } catch (error) {
      console.error('Third-party eligibility check failed:', error);
      throw error;
    }
  }

  // OpenDental built-in eligibility
  async checkEligibilityOpenDental(patient) {
    try {
      // OpenDental has built-in eligibility checking
      // const response = await axios.post(`${this.baseURL}/api/eligibility/270`, {
      //   patNum: patient.patNum,
      //   insSubNum: patient.insSubNum
      // }, {
      //   headers: this.getHeaders()
      // });

      console.log('Checking eligibility via OpenDental:', patient);
      return { success: true };
    } catch (error) {
      console.error('OpenDental eligibility check failed:', error);
      throw error;
    }
  }
  // ============================================
  // TWILIO AI-POWERED CALLING SYSTEM
  // ============================================

  getTwilioSettings() {
    const settings = localStorage.getItem('twilioSettings');
    return settings ? JSON.parse(settings) : null;
  }

  // Make AI-powered payment reminder call
  async makeAIPaymentCall(claim) {
    try {
      const twilioSettings = this.getTwilioSettings();
      if (!twilioSettings || !twilioSettings.accountSid) {
        throw new Error('Twilio not configured');
      }

      // Real Twilio API call:
      // const response = await axios.post(
      //   `https://api.twilio.com/2010-04-01/Accounts/${twilioSettings.accountSid}/Calls.json`,
      //   new URLSearchParams({
      //     To: claim.patientPhone,
      //     From: twilioSettings.phoneNumber,
      //     Url: `${window.location.origin}/api/twilio/ai-payment-call?claimNum=${claim.claimNum}`,
      //     StatusCallback: `${window.location.origin}/api/twilio/call-status`
      //   }),
      //   {
      //     auth: {
      //       username: twilioSettings.accountSid,
      //       password: twilioSettings.authToken
      //     }
      //   }
      // );

      console.log('Making AI payment call to:', claim.patientPhone);
      
      // Log call in OpenDental
      await this.logCallAttempt(claim.claimNum, 'payment_reminder', 'initiated');
      
      return {
        success: true,
        callSid: 'CA' + Math.random().toString(36).substr(2, 32),
        status: 'initiated'
      };
    } catch (error) {
      console.error('Error making AI call:', error);
      throw error;
    }
  }

  // AI Call Handler - TwiML response for interactive call
  async getAICallScript(claimNum) {
    const claim = await this.getClaimDetails(claimNum);
    
    // This would return TwiML for Twilio
    return {
      greeting: `Hello, this is DentalPro calling for ${claim.patientName}. We're calling about your outstanding balance of $${claim.patientResponsibility}.`,
      options: {
        1: 'pay_now',
        2: 'send_sms_link',
        3: 'update_contact',
        4: 'speak_to_person',
        9: 'payment_plan'
      },
      aiEnabled: true
    };
  }

  // Process AI call response
  async processAICallResponse(callData) {
    try {
      const { claimNum, action, data } = callData;
      
      switch(action) {
        case 'pay_now':
          // Capture credit card over phone (PCI compliant)
          return await this.processPhonePayment(claimNum, data.creditCard);
          
        case 'send_sms_link':
          // Send SMS payment link
          return await this.sendSMSPaymentLink(claimNum, data.phone);
          
        case 'update_contact':
          // Update patient contact information
          return await this.updatePatientContact(claimNum, data);
          
        case 'voicemail':
          // Log voicemail and recommend next action
          return await this.handleVoicemail(claimNum);
          
        case 'no_answer':
          // No answer - AI recommends next disposition
          return await this.handleNoAnswer(claimNum);
          
        default:
          return { success: false, error: 'Unknown action' };
      }
    } catch (error) {
      console.error('Error processing AI call response:', error);
      throw error;
    }
  }

  // Process phone payment (PCI compliant)
  async processPhonePayment(claimNum, creditCardData) {
    try {
      // Real payment processing would use Stripe, Square, etc.
      // const response = await axios.post(`${this.paymentGateway}/charge`, {
      //   amount: creditCardData.amount,
      //   card: creditCardData.token, // Tokenized card data
      //   description: `Payment for claim ${claimNum}`
      // });

      console.log('Processing phone payment:', claimNum);
      
      // Mark claim as paid
      await this.markClaimPaid(claimNum);
      
      // Send confirmation SMS
      await this.sendSMSConfirmation(claimNum, creditCardData.amount);
      
      return { success: true, paymentId: 'pm_' + Math.random().toString(36).substr(2, 16) };
    } catch (error) {
      console.error('Error processing phone payment:', error);
      throw error;
    }
  }

  // Send SMS payment link
  async sendSMSPaymentLink(claimNum, phoneNumber) {
    try {
      const twilioSettings = this.getTwilioSettings();
      const paymentLink = await this.sendPaymentLink({ claimNum });
      
      // Real Twilio SMS:
      // await axios.post(
      //   `https://api.twilio.com/2010-04-01/Accounts/${twilioSettings.accountSid}/Messages.json`,
      //   new URLSearchParams({
      //     To: phoneNumber,
      //     From: twilioSettings.phoneNumber,
      //     Body: `Pay your dental bill securely: ${paymentLink.paymentLink}`
      //   }),
      //   {
      //     auth: {
      //       username: twilioSettings.accountSid,
      //       password: twilioSettings.authToken
      //     }
      //   }
      // );

      console.log('Sending SMS payment link to:', phoneNumber);
      
      await this.updateClaimStatus(claimNum, 'sent');
      
      return { success: true, messageSid: 'SM' + Math.random().toString(36).substr(2, 32) };
    } catch (error) {
      console.error('Error sending SMS payment link:', error);
      throw error;
    }
  }

  // Update patient contact information
  async updatePatientContact(claimNum, contactData) {
    try {
      // Update in OpenDental
      // await axios.put(`${this.baseURL}/api/patients/${contactData.patNum}/contact`, {
      //   phone: contactData.phone,
      //   email: contactData.email
      // });

      console.log('Updating patient contact:', contactData);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }

  // Handle voicemail - AI recommends next action
  async handleVoicemail(claimNum) {
    try {
      await this.logCallAttempt(claimNum, 'payment_reminder', 'voicemail');
      
      // AI recommendation based on call history
      const recommendation = await this.getAIRecommendation(claimNum, 'voicemail');
      
      return {
        success: true,
        disposition: 'voicemail',
        nextAction: recommendation.nextAction,
        scheduledTime: recommendation.scheduledTime,
        reason: recommendation.reason
      };
    } catch (error) {
      console.error('Error handling voicemail:', error);
      throw error;
    }
  }

  // Handle no answer
  async handleNoAnswer(claimNum) {
    try {
      await this.logCallAttempt(claimNum, 'payment_reminder', 'no_answer');
      
      const recommendation = await this.getAIRecommendation(claimNum, 'no_answer');
      
      return {
        success: true,
        disposition: 'no_answer',
        nextAction: recommendation.nextAction,
        scheduledTime: recommendation.scheduledTime,
        reason: recommendation.reason
      };
    } catch (error) {
      console.error('Error handling no answer:', error);
      throw error;
    }
  }

  // AI recommendation engine
  async getAIRecommendation(claimNum, disposition) {
    try {
      const callHistory = await this.getCallHistory(claimNum);
      const claim = await this.getClaimDetails(claimNum);
      const daysOverdue = this.daysSince(claim.dueDate);
      
      // AI logic for next action
      if (callHistory.length >= 3 && disposition === 'no_answer') {
        return {
          nextAction: 'send_sms',
          scheduledTime: 'immediate',
          reason: 'Multiple call attempts failed, switching to SMS'
        };
      }
      
      if (disposition === 'voicemail' && daysOverdue > 30) {
        return {
          nextAction: 'send_letter',
          scheduledTime: 'immediate',
          reason: 'Account severely overdue, escalating to written notice'
        };
      }
      
      if (callHistory.length < 2) {
        return {
          nextAction: 'retry_call',
          scheduledTime: this.getOptimalCallTime(claim.patNum),
          reason: 'Try again at better time based on patient patterns'
        };
      }
      
      return {
        nextAction: 'send_email',
        scheduledTime: 'immediate',
        reason: 'Follow up with email after unsuccessful calls'
      };
    } catch (error) {
      console.error('Error getting AI recommendation:', error);
      return {
        nextAction: 'manual_review',
        scheduledTime: 'immediate',
        reason: 'Account needs manual review'
      };
    }
  }

  // Log call attempt
  async logCallAttempt(claimNum, type, disposition) {
    try {
      // Log in OpenDental
      console.log('Logging call attempt:', claimNum, type, disposition);
      return { success: true };
    } catch (error) {
      console.error('Error logging call:', error);
      throw error;
    }
  }

  // Get call history
  async getCallHistory(claimNum) {
    // Mock data
    return [
      { date: '2025-10-20', disposition: 'no_answer' },
      { date: '2025-10-18', disposition: 'voicemail' }
    ];
  }

  // Get claim details
  async getClaimDetails(claimNum) {
    const claims = await this.getOpenClaims();
    return claims.find(c => c.claimNum === claimNum);
  }

  // Get optimal call time based on patient patterns
  getOptimalCallTime(patNum) {
    // AI would analyze when patient usually answers
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0); // 10 AM next day
    return tomorrow.toISOString();
  }

  // Send SMS confirmation
  async sendSMSConfirmation(claimNum, amount) {
    console.log(`Sending SMS confirmation for claim ${claimNum}, amount: ${amount}`);
    return { success: true };
  }

  // ============================================
  // ADVANCE BNPL INTEGRATION
  // ============================================

  getAdvanceSettings() {
    const settings = localStorage.getItem('advanceSettings');
    return settings ? JSON.parse(settings) : null;
  }

  // Check if BNPL should be offered
  shouldOfferBNPL(amount) {
    const settings = this.getAdvanceSettings();
    if (!settings || !settings.enabled) return false;
    return amount >= settings.minAmount;
  }

  // Create Advance payment plan application
  async createAdvanceApplication(patientData, procedureAmount) {
    try {
      const settings = this.getAdvanceSettings();
      if (!settings || !settings.enabled) {
        throw new Error('Advance BNPL not enabled');
      }

      // Real Advance API call:
      // const response = await axios.post('https://api.advance.com/v1/applications', {
      //   merchant_id: settings.merchantId,
      //   patient: {
      //     first_name: patientData.firstName,
      //     last_name: patientData.lastName,
      //     email: patientData.email,
      //     phone: patientData.phone,
      //     date_of_birth: patientData.dob
      //   },
      //   amount: procedureAmount,
      //   procedures: patientData.procedures
      // }, {
      //   headers: {
      //     'Authorization': `Bearer ${settings.apiKey}`,
      //     'Content-Type': 'application/json'
      //   }
      // });

      console.log('Creating Advance application:', patientData, procedureAmount);
      
      return {
        success: true,
        applicationId: 'adv_' + Math.random().toString(36).substr(2, 16),
        applicationUrl: `https://apply.advance.com/app/${Math.random().toString(36).substr(2, 8)}`,
        estimatedApproval: '90%',
        plans: [
          { months: 6, monthlyPayment: (procedureAmount / 6).toFixed(2), apr: 0 },
          { months: 12, monthlyPayment: (procedureAmount / 12).toFixed(2), apr: 0 },
          { months: 24, monthlyPayment: (procedureAmount / 24).toFixed(2), apr: 5.9 }
        ]
      };
    } catch (error) {
      console.error('Error creating Advance application:', error);
      throw error;
    }
  }

  // Check Advance application status
  async checkAdvanceStatus(applicationId) {
    try {
      const settings = this.getAdvanceSettings();
      
      // Real API call:
      // const response = await axios.get(
      //   `https://api.advance.com/v1/applications/${applicationId}`,
      //   {
      //     headers: { 'Authorization': `Bearer ${settings.apiKey}` }
      //   }
      // );

      console.log('Checking Advance status:', applicationId);
      
      return {
        status: 'approved',
        approvedAmount: 2500,
        selectedPlan: { months: 12, monthlyPayment: 208.33 },
        firstPaymentDate: '2025-11-15'
      };
    } catch (error) {
      console.error('Error checking Advance status:', error);
      throw error;
    }
  }

  // Get Advance payment schedule
  async getAdvancePaymentSchedule(applicationId) {
    try {
      console.log('Getting payment schedule:', applicationId);
      
      const schedule = [];
      const startDate = new Date('2025-11-15');
      
      for (let i = 0; i < 12; i++) {
        const paymentDate = new Date(startDate);
        paymentDate.setMonth(paymentDate.getMonth() + i);
        schedule.push({
          paymentNumber: i + 1,
          dueDate: paymentDate.toISOString().split('T')[0],
          amount: 208.33,
          status: 'pending'
        });
      }
      
      return { success: true, schedule };
    } catch (error) {
      console.error('Error getting payment schedule:', error);
      throw error;
    }
  }


  // ============================================
  // CALL MANAGEMENT
  // ============================================

  async getAllCalls(filterType = 'all') {
    try {
      // Real API call would filter on backend
      const mockCalls = [
        {
          callSid: 'CA1234567890',
          patientName: 'John Smith',
          toNumber: '+15551234567',
          purpose: 'payment_reminder',
          status: 'completed',
          disposition: 'payment_collected',
          duration: 180,
          timestamp: '2025-10-24T10:30:00Z',
          hasRecording: true,
          hasTranscript: true,
          aiRecommendation: 'Payment collected successfully'
        },
        {
          callSid: 'CA9876543210',
          patientName: 'Sarah Johnson',
          toNumber: '+15559876543',
          purpose: 'payment_reminder',
          status: 'no-answer',
          disposition: 'no-answer',
          duration: 0,
          timestamp: '2025-10-24T09:15:00Z',
          hasRecording: false,
          hasTranscript: false,
          aiRecommendation: 'Send SMS payment link'
        },
        {
          callSid: 'CA5555555555',
          patientName: 'Mike Williams',
          toNumber: '+15555555555',
          purpose: 'appointment_reminder',
          status: 'completed',
          disposition: 'voicemail',
          duration: 45,
          timestamp: '2025-10-23T14:20:00Z',
          hasRecording: true,
          hasTranscript: false,
          aiRecommendation: 'Follow up with SMS'
        }
      ];

      if (filterType === 'all') return mockCalls;
      if (filterType === 'payment') return mockCalls.filter(c => c.purpose.includes('payment'));
      if (filterType === 'appointment') return mockCalls.filter(c => c.purpose.includes('appointment'));
      if (filterType === 'voicemail') return mockCalls.filter(c => c.disposition === 'voicemail');
      if (filterType === 'no-answer') return mockCalls.filter(c => c.disposition === 'no-answer');
      
      return mockCalls;
    } catch (error) {
      console.error('Error getting calls:', error);
      throw error;
    }
  }

  async initiateOutboundCall(callData) {
    try {
      const twilioSettings = this.getTwilioSettings();
      if (!twilioSettings) throw new Error('Twilio not configured');

      // Real Twilio API call
      console.log('Initiating call:', callData);

      return {
        success: true,
        callSid: 'CA' + Math.random().toString(36).substr(2, 32),
        status: 'initiated'
      };
    } catch (error) {
      console.error('Error initiating call:', error);
      throw error;
    }
  }

  async getCallRecording(callSid) {
    try {
      // Return mock recording URL
      return 'https://api.twilio.com/2010-04-01/Accounts/ACXXX/Recordings/REXXX.mp3';
    } catch (error) {
      console.error('Error getting recording:', error);
      throw error;
    }
  }

  async getCallTranscript(callSid) {
    try {
      // Mock transcript with AI analysis
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        messages: [
          {
            speaker: 'ai',
            text: 'Hello, this is DentalPro calling for John Smith regarding your outstanding balance of $350. Is this a good time to talk?',
            timestamp: '10:30:05'
          },
          {
            speaker: 'patient',
            text: 'Yes, I can talk now.',
            timestamp: '10:30:12'
          },
          {
            speaker: 'ai',
            text: 'Great! I see you have an outstanding balance from your recent visit. Would you like to take care of this payment now over the phone?',
            timestamp: '10:30:15'
          },
          {
            speaker: 'patient',
            text: 'Yes, I can pay now with my credit card.',
            timestamp: '10:30:22'
          },
          {
            speaker: 'ai',
            text: 'Perfect! I\'ll need your card number, expiration date, and CVV to process the payment securely.',
            timestamp: '10:30:25'
          },
          {
            speaker: 'patient',
            text: '[Card information provided - redacted for security]',
            timestamp: '10:30:45'
          },
          {
            speaker: 'ai',
            text: 'Thank you! Your payment of $350 has been processed successfully. You\'ll receive a confirmation email shortly. Is there anything else I can help you with?',
            timestamp: '10:31:05'
          },
          {
            speaker: 'patient',
            text: 'No, that\'s all. Thank you!',
            timestamp: '10:31:12'
          }
        ],
        summary: 'Patient successfully paid $350 outstanding balance via credit card over the phone. Payment processed and confirmation email sent.',
        aiAnalysis: {
          sentiment: 'Positive - Patient was cooperative and willing to pay',
          paymentIntent: 'High - Payment collected successfully',
          recommendedAction: 'No further action needed - Claim closed'
        }
      };
    } catch (error) {
      console.error('Error getting transcript:', error);
      throw error;
    }
  }

  // ============================================
  // MESSAGING (SMS & WHATSAPP)
  // ============================================

  async getConversations(filterType = 'all') {
    try {
      const mockConversations = [
        {
          conversationId: 'conv_001',
          patientName: 'Emma Davis',
          phoneNumber: '+15551111111',
          type: 'sms',
          lastMessage: 'Thanks! I\'ll make the payment today.',
          lastMessageTime: '2025-10-24T11:30:00Z',
          unread: true,
          unreadCount: 2
        },
        {
          conversationId: 'conv_002',
          patientName: 'Michael Brown',
          phoneNumber: '+15552222222',
          type: 'whatsapp',
          lastMessage: 'Can I schedule for next week?',
          lastMessageTime: '2025-10-24T10:15:00Z',
          unread: false,
          unreadCount: 0
        },
        {
          conversationId: 'conv_003',
          patientName: 'Lisa Anderson',
          phoneNumber: '+15553333333',
          type: 'sms',
          lastMessage: 'Received the payment link, thanks!',
          lastMessageTime: '2025-10-23T16:45:00Z',
          unread: false,
          unreadCount: 0
        }
      ];

      if (filterType === 'all') return mockConversations;
      if (filterType === 'sms') return mockConversations.filter(c => c.type === 'sms');
      if (filterType === 'whatsapp') return mockConversations.filter(c => c.type === 'whatsapp');
      if (filterType === 'unread') return mockConversations.filter(c => c.unread);

      return mockConversations;
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }

  async getMessages(conversationId) {
    try {
      // Mock messages for conversation
      return [
        {
          text: 'Hi Emma, this is DentalPro. You have an outstanding balance of $250 from your recent visit.',
          direction: 'outbound',
          timestamp: '2025-10-24T10:00:00Z',
          status: 'delivered'
        },
        {
          text: 'You can pay securely here: https://pay.dentalpro.com/abc123',
          direction: 'outbound',
          timestamp: '2025-10-24T10:00:15Z',
          status: 'delivered'
        },
        {
          text: 'Oh I forgot about that! Can I pay half now and half next week?',
          direction: 'inbound',
          timestamp: '2025-10-24T10:30:00Z'
        },
        {
          text: 'Of course! Would you like to set up a payment plan?',
          direction: 'outbound',
          timestamp: '2025-10-24T10:31:00Z',
          status: 'delivered'
        },
        {
          text: 'Thanks! I\'ll make the payment today.',
          direction: 'inbound',
          timestamp: '2025-10-24T11:30:00Z'
        }
      ];
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  async sendMessage(messageData) {
    try {
      const twilioSettings = this.getTwilioSettings();
      if (!twilioSettings) throw new Error('Twilio not configured');

      if (messageData.type === 'whatsapp') {
        // WhatsApp message via Twilio
        // From: whatsapp:+14155238886 (Twilio sandbox)
        // To: whatsapp:+15551234567
      } else {
        // Regular SMS via Twilio
      }

      console.log('Sending message:', messageData);

      return {
        success: true,
        messageSid: 'SM' + Math.random().toString(36).substr(2, 32)
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async startNewConversation(conversationData) {
    try {
      await this.sendMessage({
        toNumber: conversationData.toNumber,
        message: conversationData.message,
        type: conversationData.type
      });

      return {
        success: true,
        conversation: {
          conversationId: 'conv_' + Date.now(),
          patientName: conversationData.patientName,
          phoneNumber: conversationData.toNumber,
          type: conversationData.type,
          lastMessage: conversationData.message,
          lastMessageTime: new Date().toISOString(),
          unread: false,
          unreadCount: 0
        }
      };
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  }

  async markConversationRead(conversationId) {
    try {
      console.log('Marking conversation as read:', conversationId);
      return { success: true };
    } catch (error) {
      console.error('Error marking conversation read:', error);
      throw error;
    }
  }
}

export default new OpenDentalService();
