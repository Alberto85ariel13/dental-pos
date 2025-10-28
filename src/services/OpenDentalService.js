import axios from 'axios';
import {
  mockAppointments,
  mockClaims,
  mockPatients,
  mockProviders,
} from './mockDataStore';
import { patientPortalMockApi } from './mockPatientPortalApi';

const clone = (value) => JSON.parse(JSON.stringify(value));

const parsePatNum = (value) => {
  if (value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeName = (name) => (name ? name.trim().toLowerCase() : '');

const resolvePatientRecordByName = (patientName) => {
  const normalized = normalizeName(patientName);
  if (!normalized) return null;
  return mockPatients.find(
    (patient) => normalizeName(`${patient.fName} ${patient.lName}`) === normalized,
  ) ?? null;
};

const resolvePatientMeta = (patientName, patNum) => {
  const parsedPatNum = parsePatNum(patNum);
  const byId = parsedPatNum ? mockPatients.find((patient) => patient.patNum === parsedPatNum) : null;
  const record = byId ?? resolvePatientRecordByName(patientName);

  if (!record) {
    return {
      patNum: parsedPatNum ?? null,
      patientName: patientName ?? '',
      patientPhone: null,
      patientEmail: null,
      insurance: null,
    };
  }

  return {
    patNum: record.patNum,
    patientName: `${record.fName} ${record.lName}`,
    patientPhone: record.phone,
    patientEmail: record.email,
    insurance: record.insurance,
  };
};

const combineDateAndTime = (dateString, timeString) => {
  if (!dateString) return null;
  if (!timeString) return `${dateString}T09:00:00`;

  const trimmedTime = timeString.trim();
  const hasMeridiem = /am|pm/i.test(trimmedTime);
  let hour = 9;
  let minute = 0;

  if (hasMeridiem) {
    const [timePart, meridiemRaw] = trimmedTime.split(/\s+/);
    const [hourStr, minuteStr] = timePart.split(':');
    hour = parseInt(hourStr, 10);
    minute = parseInt(minuteStr ?? '0', 10);
    const meridiem = meridiemRaw?.toUpperCase();

    if (meridiem === 'PM' && hour < 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;
  } else {
    const [hourStr, minuteStr] = trimmedTime.split(':');
    hour = parseInt(hourStr, 10);
    minute = parseInt(minuteStr ?? '0', 10);
  }

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return `${dateString}T09:00:00`;
  }

  return `${dateString}T${hour.toString().padStart(2, '0')}:${minute
    .toString()
    .padStart(2, '0')}:00`;
};

const formatTimeForPortal = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const formatAppointmentForService = (appointment) => {
  const provider = mockProviders.find((p) => p.id === appointment.providerId);
  const patientMeta = resolvePatientMeta(appointment.patientName ?? appointment.patient, appointment.patNum);
  const isoDateTime = appointment.aptDateTime
    ?? combineDateAndTime(appointment.date, appointment.time);
  const status = appointment.status ?? 'scheduled';
  const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);

  return {
    aptNum: appointment.aptNum ?? appointment.id,
    patNum: patientMeta.patNum,
    patientName: patientMeta.patientName || appointment.patientName || appointment.patient || '',
    patientPhone: appointment.patientPhone ?? patientMeta.patientPhone ?? '(555) 000-0000',
    aptDateTime: isoDateTime,
    lengthMinutes: appointment.lengthMinutes ?? provider?.slotDuration ?? 30,
    procedureCode: appointment.procedureCode ?? null,
    procedureDescription: appointment.procedureDescription ?? appointment.type ?? '',
    providerName: appointment.providerName ?? appointment.provider ?? '',
    operatory: appointment.operatory ?? appointment.room ?? null,
    status: capitalizedStatus,
    providerId: appointment.providerId ?? provider?.id ?? null,
    providerColor: appointment.providerColor ?? provider?.color ?? 'blue',
    type: appointment.type ?? appointment.procedureDescription ?? '',
    room: appointment.room ?? appointment.operatory ?? null,
    estimatedCost: appointment.estimatedCost ?? 0,
    paymentStatus: appointment.paymentStatus ?? 'pending',
    day: appointment.day ?? null,
    date: appointment.date ?? (isoDateTime ? isoDateTime.split('T')[0] : null),
    time: appointment.time ?? null,
    note: appointment.note ?? '',
  };
};

const formatClaimForService = (claim) => {
  const patientMeta = resolvePatientMeta(claim.patientName, claim.patNum);

  return {
    claimNum: claim.claimNum ?? claim.id,
    patNum: patientMeta.patNum,
    patientName: patientMeta.patientName || claim.patientName || '',
    patientEmail: claim.patientEmail ?? patientMeta.patientEmail ?? '',
    patientPhone: claim.patientPhone ?? patientMeta.patientPhone ?? '',
    insurance: claim.insurance ?? patientMeta.insurance ?? '',
    serviceDate: claim.serviceDate ?? '',
    dueDate: claim.dueDate ?? '',
    totalBilled: claim.totalBilled ?? claim.amount ?? 0,
    insurancePaid: claim.insurancePaid ?? 0,
    patientResponsibility: claim.patientResponsibility ?? claim.patientOwes ?? 0,
    status: claim.status ?? 'pending',
    procedures: clone(claim.procedures ?? []),
    lastReminderSent: claim.lastReminderSent ?? null,
    patientOwes: claim.patientOwes ?? claim.patientResponsibility ?? 0,
    reason: claim.reason ?? '',
    date: claim.date ?? '',
    amount: claim.amount ?? claim.totalBilled ?? 0,
  };
};

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

  // Mock data shared with patient portal
  getMockPatients() {
    return mockPatients.map((patient) => ({
      ...patient,
      patientName: `${patient.fName} ${patient.lName}`,
    }));
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
    try {
      let normalizedDate = null;

      if (date instanceof Date) {
        normalizedDate = Number.isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
      } else if (typeof date === 'string' && date) {
        const parsed = new Date(date);
        normalizedDate = Number.isNaN(parsed.getTime()) ? date : parsed.toISOString().split('T')[0];
      }

      const list = normalizedDate
        ? mockAppointments.filter((appt) => {
            const apptDate = appt.date ?? appt.aptDateTime?.split('T')[0];
            return apptDate === normalizedDate;
          })
        : mockAppointments;

      return list.map((appointment) => formatAppointmentForService(appointment));
    } catch (error) {
      console.error('Error getting appointments:', error);
      throw error;
    }
  }

  async scheduleAppointment(appointmentData) {
    try {
      // Real API call would be:
      // const response = await axios.post(`${this.baseURL}/api/appointments`, appointmentData, {
      //   headers: this.getHeaders()
      // });

      const isoDateTime = appointmentData.aptDateTime
        ?? combineDateAndTime(appointmentData.date, appointmentData.time);
      const provider = mockProviders.find((p) =>
        p.name === appointmentData.providerName || p.id === appointmentData.providerId,
      );

      const created = await patientPortalMockApi.addAppointment({
        patNum: appointmentData.patNum,
        patient: appointmentData.patientName,
        providerId: provider?.id ?? appointmentData.providerId ?? null,
        provider: appointmentData.providerName ?? provider?.name ?? '',
        providerColor: provider?.color,
        procedureCode: appointmentData.procedureCode,
        procedureDescription: appointmentData.procedureDescription,
        type: appointmentData.procedureDescription ?? appointmentData.type ?? 'General Appointment',
        reason: appointmentData.note ?? appointmentData.procedureDescription ?? appointmentData.type,
        aptDateTime: isoDateTime,
        date: isoDateTime ? isoDateTime.split('T')[0] : appointmentData.date,
        time: formatTimeForPortal(isoDateTime),
        status: 'scheduled',
        operatory: appointmentData.operatory,
        room: appointmentData.operatory,
        lengthMinutes: appointmentData.lengthMinutes,
        estimatedCost: appointmentData.estimatedCost ?? 0,
        paymentStatus: 'pending',
        note: appointmentData.note ?? '',
      });

      const newAppointment = formatAppointmentForService(created);

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
      const list = filterStatus !== 'all'
        ? mockClaims.filter((claim) => claim.status === filterStatus)
        : mockClaims;

      return list.map((claim) => formatClaimForService(claim));
    } catch (error) {
      console.error('Error getting open claims:', error);
      throw error;
    }
  }

  // Send payment link
  async sendPaymentLink(claim) {
    try {
      console.log('Sending payment link:', claim);
      const today = new Date().toISOString().split('T')[0];
      await patientPortalMockApi.updateClaim(claim.claimNum, {
        status: 'sent',
        lastReminderSent: today,
      });
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
      await patientPortalMockApi.updateClaim(claimNum, {
        status: 'paid',
        patientResponsibility: 0,
        patientOwes: 0,
      });
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
      await patientPortalMockApi.updateClaim(claimNum, { status });
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
      const today = new Date().toISOString().split('T')[0];
      await patientPortalMockApi.updateClaim(claimNum, { lastReminderSent: today });
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

      await patientPortalMockApi.updateAppointment(aptNum, {
        status,
        room,
        operatory: room ?? undefined,
      });

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

      await patientPortalMockApi.updateAppointment(
        appointmentData.aptNum ?? appointmentData.id,
        appointmentData,
      );

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
  async getCallHistory(filterPeriod = 'all', filterDisposition = 'all') {
    try {
      const baseHistory = [
        {
          callSid: 'HIST1001',
          patNum: 1001,
          patientName: 'Sarah Johnson',
          phoneNumber: '(555) 123-4567',
          direction: 'outbound',
          disposition: 'no_answer',
          timestamp: '2025-10-24T09:15:00Z',
          duration: 0,
          note: 'Left voicemail with payment reminder',
          aiAnalysis: {
            sentiment: 'Neutral',
            paymentIntent: 'Medium',
            recommendation: 'Send SMS follow-up',
          },
        },
        {
          callSid: 'HIST1002',
          patNum: 1002,
          patientName: 'Michael Chen',
          phoneNumber: '(555) 234-5678',
          direction: 'outbound',
          disposition: 'answered',
          timestamp: '2025-10-23T15:45:00Z',
          duration: 240,
          recordingUrl: '/audio/call-michael.mp3',
          aiAnalysis: {
            sentiment: 'Positive',
            paymentIntent: 'High',
            recommendation: 'No further action needed',
          },
        },
        {
          callSid: 'HIST1003',
          patNum: 1004,
          patientName: 'Emily Watson',
          phoneNumber: '(555) 456-7890',
          direction: 'outbound',
          disposition: 'voicemail',
          timestamp: '2025-10-22T13:05:00Z',
          duration: 35,
          note: 'Voicemail left with follow-up instructions',
          aiAnalysis: {
            sentiment: 'Neutral',
            paymentIntent: 'Medium',
            recommendation: 'Schedule follow-up call tomorrow',
          },
        },
      ];

      const historyWithMeta = baseHistory.map((call) => {
        const meta = resolvePatientMeta(call.patientName, call.patNum);
        return {
          ...call,
          patNum: meta.patNum,
          patientName: meta.patientName || call.patientName,
          phoneNumber: call.phoneNumber ?? meta.patientPhone ?? '',
          patientPhone: meta.patientPhone ?? call.phoneNumber ?? '',
        };
      });

      const periodOptions = new Set(['all', 'today', 'week', 'month']);
      const normalizedPeriod = typeof filterPeriod === 'string'
        ? filterPeriod.toLowerCase()
        : filterPeriod;
      const parsedClaimNum = parsePatNum(filterPeriod);

      if (!periodOptions.has(normalizedPeriod) && parsedClaimNum !== null) {
        const claim = await this.getClaimDetails(parsedClaimNum);
        if (claim?.patNum) {
          let claimHistory = historyWithMeta.filter((call) => call.patNum === claim.patNum);
          if (filterDisposition !== 'all') {
            claimHistory = claimHistory.filter((call) => call.disposition === filterDisposition);
          }
          return claimHistory;
        }
        if (filterDisposition !== 'all') {
          return historyWithMeta.filter((call) => call.disposition === filterDisposition);
        }
        return historyWithMeta;
      }

      const now = new Date();
      const filterByPeriod = (call) => {
        const period = periodOptions.has(normalizedPeriod) ? normalizedPeriod : 'all';
        if (period === 'all') return true;
        const callDate = new Date(call.timestamp);
        if (Number.isNaN(callDate.getTime())) return true;

        if (period === 'today') {
          return callDate.toDateString() === now.toDateString();
        }

        const diffDays = (now - callDate) / (1000 * 60 * 60 * 24);
        if (period === 'week') return diffDays <= 7;
        if (period === 'month') return diffDays <= 30;
        return true;
      };

      let filtered = historyWithMeta.filter(filterByPeriod);
      if (filterDisposition !== 'all') {
        filtered = filtered.filter((call) => call.disposition === filterDisposition);
      }

      return filtered;
    } catch (error) {
      console.error('Error getting call history:', error);
      throw error;
    }
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
      const baseCalls = [
        {
          callSid: 'CA1234567890',
          patNum: 1001,
          patientName: 'Sarah Johnson',
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
          patNum: 1002,
          patientName: 'Michael Chen',
          toNumber: '+15552345678',
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
          patNum: 1004,
          patientName: 'Emily Watson',
          toNumber: '+15554567890',
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

      const mockCalls = baseCalls.map((call) => {
        const meta = resolvePatientMeta(call.patientName, call.patNum);
        return {
          ...call,
          patNum: meta.patNum,
          patientName: meta.patientName || call.patientName,
          patientPhone: call.patientPhone ?? meta.patientPhone ?? null,
          toNumber: call.toNumber ?? (meta.patientPhone ? meta.patientPhone.replace(/[^\d+]/g, '') : null),
        };
      });

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
      const baseConversations = [
        {
          conversationId: 'conv_001',
          patNum: 1001,
          patientName: 'Sarah Johnson',
          phoneNumber: '(555) 123-4567',
          type: 'sms',
          lastMessage: 'Thanks! I\'ll make the payment today.',
          lastMessageTime: '2025-10-24T11:30:00Z',
          unread: true,
          unreadCount: 2
        },
        {
          conversationId: 'conv_002',
          patNum: 1002,
          patientName: 'Michael Chen',
          phoneNumber: '(555) 234-5678',
          type: 'whatsapp',
          lastMessage: 'Can I schedule for next week?',
          lastMessageTime: '2025-10-24T10:15:00Z',
          unread: false,
          unreadCount: 0
        },
        {
          conversationId: 'conv_003',
          patNum: 1004,
          patientName: 'Emily Watson',
          phoneNumber: '(555) 456-7890',
          type: 'sms',
          lastMessage: 'Received the payment link, thanks!',
          lastMessageTime: '2025-10-23T16:45:00Z',
          unread: false,
          unreadCount: 0
        }
      ];

      const mockConversations = baseConversations.map((conversation) => {
        const meta = resolvePatientMeta(conversation.patientName, conversation.patNum);
        return {
          ...conversation,
          patNum: meta.patNum,
          patientName: meta.patientName || conversation.patientName,
          phoneNumber: conversation.phoneNumber ?? meta.patientPhone ?? '',
        };
      });

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
          ...resolvePatientMeta(conversationData.patientName, conversationData.patNum),
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
