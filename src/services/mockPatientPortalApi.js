import {
  mockAppointments,
  mockClaims,
  mockOfficeState,
  mockPatientProfile,
  mockProviders,
  mockPatients,
} from './mockDataStore';

const clone = (value) => JSON.parse(JSON.stringify(value));

const parsePatNum = (value) => {
  if (value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const findPatientByPatNum = (patNum) => {
  const parsed = parsePatNum(patNum);
  if (parsed === null) return null;
  return mockPatients.find((p) => p.patNum === parsed) ?? null;
};

const determineDayLabel = (dateString) => {
  if (!dateString) return 'upcoming';
  const selectedDate = new Date(dateString);
  if (Number.isNaN(selectedDate.getTime())) return 'upcoming';

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfSelected = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  const diffInDays = Math.round((startOfSelected - startOfToday) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'today';
  if (diffInDays === 1) return 'tomorrow';
  if (diffInDays < 0) return 'past';
  return 'upcoming';
};

const formatTimeFromIso = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const parseTimeTo24Hour = (timeString) => {
  if (!timeString) {
    return { hour: 9, minute: 0 };
  }

  const hasMeridiem = /am|pm/i.test(timeString);
  if (hasMeridiem) {
    const [timePart, meridiemRaw] = timeString.trim().split(/\s+/);
    const [hourStr, minuteStr] = timePart.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr ?? '0', 10);
    const meridiem = meridiemRaw?.toUpperCase();

    if (meridiem === 'PM' && hour < 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;

    return { hour, minute };
  }

  const [hourStr, minuteStr] = timeString.split(':');
  return {
    hour: parseInt(hourStr, 10),
    minute: parseInt(minuteStr ?? '0', 10),
  };
};

const toIsoDateTime = (dateString, timeString) => {
  if (!dateString) return null;
  const { hour, minute } = parseTimeTo24Hour(timeString);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return `${dateString}T09:00:00`;
  const hourStr = hour.toString().padStart(2, '0');
  const minuteStr = minute.toString().padStart(2, '0');
  return `${dateString}T${hourStr}:${minuteStr}:00`;
};

const resolveProvider = (appointment) => {
  if (!appointment) return {};
  const provider = mockProviders.find((p) => p.id === appointment.providerId)
    || mockProviders.find((p) => p.name === appointment.provider)
    || mockProviders.find((p) => p.name === appointment.providerName);

  if (!provider) {
    return {
      providerId: appointment.providerId ?? null,
      providerName: appointment.provider ?? appointment.providerName ?? '',
      providerColor: appointment.providerColor ?? 'blue',
    };
  }

  return {
    providerId: provider.id,
    providerName: provider.name,
    providerColor: provider.color,
  };
};

const resolvePatient = (appointment) => {
  if (!appointment) return {};
  const patNum = parsePatNum(appointment.patNum);
  const patientFromId = patNum ? mockPatients.find((p) => p.patNum === patNum) : null;

  const patientNameFromInput = appointment.patient
    || appointment.patientName
    || (patientFromId ? `${patientFromId.fName} ${patientFromId.lName}` : '');

  const patientRecord = patientFromId
    || mockPatients.find((p) => `${p.fName} ${p.lName}` === patientNameFromInput);

  if (!patientRecord) {
    return {
      patNum: appointment.patNum ?? null,
      patientName: patientNameFromInput,
    };
  }

  return {
    patNum: patientRecord.patNum,
    patientName: `${patientRecord.fName} ${patientRecord.lName}`,
  };
};

const normalizeAppointmentPayload = (appointment) => {
  const providerInfo = resolveProvider(appointment);
  const patientInfo = resolvePatient(appointment);

  let { aptDateTime, date, time } = appointment;

  if (aptDateTime) {
    if (!date) {
      date = aptDateTime.split('T')[0];
    }
    if (!time) {
      time = formatTimeFromIso(aptDateTime);
    }
  } else if (date && time) {
    aptDateTime = toIsoDateTime(date, time);
  } else if (date) {
    aptDateTime = toIsoDateTime(date, '09:30 AM');
    time = formatTimeFromIso(aptDateTime);
  }

  const lengthMinutes = appointment.lengthMinutes
    ?? appointment.duration
    ?? mockProviders.find((p) => p.id === providerInfo.providerId)?.slotDuration
    ?? 30;

  const appointmentType = appointment.type
    ?? appointment.procedureDescription
    ?? appointment.reason
    ?? 'General Appointment';

  const procedureCode = appointment.procedureCode ?? null;
  const procedureDescription = appointment.procedureDescription ?? appointmentType;

  const resolvedDate = date ?? (aptDateTime ? aptDateTime.split('T')[0] : null);
  const resolvedTime = time ?? (aptDateTime ? formatTimeFromIso(aptDateTime) : '09:30 AM');

  return {
    id: appointment.id,
    aptNum: appointment.aptNum,
    patNum: patientInfo.patNum,
    patient: patientInfo.patientName,
    patientName: patientInfo.patientName,
    providerId: providerInfo.providerId,
    provider: providerInfo.providerName,
    providerName: providerInfo.providerName,
    providerColor: providerInfo.providerColor,
    type: appointmentType,
    procedureCode,
    procedureDescription,
    reason: appointment.reason ?? appointmentType,
    status: appointment.status ?? 'scheduled',
    room: appointment.room ?? appointment.operatory ?? null,
    operatory: appointment.operatory ?? appointment.room ?? null,
    estimatedCost: appointment.estimatedCost ?? 0,
    paymentStatus: appointment.paymentStatus ?? 'pending',
    lengthMinutes,
    day: appointment.day ?? determineDayLabel(resolvedDate),
    date: resolvedDate,
    time: resolvedTime,
    aptDateTime,
    note: appointment.note ?? '',
  };
};

const computeStats = (apptList = mockAppointments, requests = mockOfficeState.openRequests) => {
  const todays = apptList.filter((appt) => appt.day === 'today');
  const completed = apptList.filter((appt) => appt.status === 'completed');
  const revenue = apptList.reduce((total, appt) => {
    return total + (appt.paymentStatus === 'paid' ? appt.estimatedCost : 0);
  }, 0);

  return {
    todayAppointments: todays.length,
    checkedIn: todays.filter((appt) => ['waiting', 'in-progress', 'completed'].includes(appt.status)).length,
    completed: completed.length,
    openRequests: requests.length,
    revenue,
  };
};

const computeNextAppointment = (apptList = mockAppointments) => {
  const upcoming = apptList
    .filter((appt) => ['scheduled', 'confirmed', 'waiting'].includes(appt.status))
    .sort((a, b) => {
      const dateA = new Date(a.aptDateTime ?? `${a.date} ${a.time}`);
      const dateB = new Date(b.aptDateTime ?? `${b.date} ${b.time}`);
      return dateA.getTime() - dateB.getTime();
    })[0];

  if (!upcoming) {
    return {
      date: 'No upcoming appointments',
      time: '',
      provider: '',
      type: '',
      estimatedCost: 0,
    };
  }

  return {
    date: new Date(upcoming.aptDateTime ?? `${upcoming.date} ${upcoming.time}`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    time: upcoming.time,
    provider: upcoming.provider,
    type: upcoming.type,
    estimatedCost: upcoming.estimatedCost,
  };
};

const computeBalance = (claimList = mockClaims, appointmentList = mockAppointments) => {
  const claimTotal = claimList.reduce((total, claim) => {
    const amount = Number(claim.patientOwes ?? claim.patientResponsibility ?? claim.amount ?? 0);
    return total + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  const appointmentTotal = appointmentList.reduce((total, appointment) => {
    const status = String(appointment.paymentStatus ?? '').toLowerCase();
    if (status === 'paid') {
      return total;
    }

    const cost = Number(appointment.estimatedCost ?? 0);
    return total + (Number.isFinite(cost) ? cost : 0);
  }, 0);

  return claimTotal + appointmentTotal;
};

const buildPatientProfile = (patientRecord, patientAppointments, patientClaims) => {
  const baseProfile = clone(mockPatientProfile);
  const resolvedName = patientRecord ? `${patientRecord.fName} ${patientRecord.lName}` : baseProfile.name;

  return {
    ...baseProfile,
    patNum: patientRecord?.patNum ?? baseProfile.patNum ?? null,
    name: resolvedName,
    email: patientRecord?.email ?? baseProfile.email ?? '',
    phone: patientRecord?.phone ?? baseProfile.phone ?? '',
    insurance: patientRecord?.insurance ?? baseProfile.insurance ?? '',
    lastVisit: patientRecord?.lastVisit ?? baseProfile.lastVisit ?? null,
    messages: clone(baseProfile.messages ?? []),
    upcomingRecommendations: clone(baseProfile.upcomingRecommendations ?? []),
    balance: computeBalance(patientClaims, patientAppointments),
    nextAppointment: computeNextAppointment(patientAppointments),
    claims: clone(patientClaims),
  };
};

export const patientPortalMockApi = {
  async getPatientPortalSnapshot(patNumInput = null) {
    const defaultPatNum = parsePatNum(mockPatientProfile.patNum) ?? mockPatients[0]?.patNum ?? null;
    const requestedPatNum = parsePatNum(patNumInput ?? defaultPatNum);

    if (patNumInput !== null && requestedPatNum === null) {
      throw new Error(`Invalid patient ID ${patNumInput}`);
    }

    const patientRecord = requestedPatNum ? findPatientByPatNum(requestedPatNum) : null;

    if (patNumInput !== null && requestedPatNum !== null && !patientRecord) {
      throw new Error(`Patient with ID ${patNumInput} not found`);
    }

    const activePatNum = patientRecord?.patNum ?? defaultPatNum;
    const patientAppointments = activePatNum
      ? mockAppointments.filter((appt) => parsePatNum(appt.patNum) === activePatNum)
      : mockAppointments;
    const patientClaims = activePatNum
      ? mockClaims.filter((claim) => parsePatNum(claim.patNum) === activePatNum)
      : mockClaims;

    const patient = buildPatientProfile(patientRecord, patientAppointments, patientClaims);
    const officeSnapshot = clone(mockOfficeState);
    officeSnapshot.stats = computeStats(undefined, officeSnapshot.openRequests);

    return {
      patient,
      appointments: clone(patientAppointments),
      claims: clone(patientClaims),
      office: officeSnapshot,
      providers: clone(mockProviders),
    };
  },

  async getPatients() {
    return clone(mockPatients);
  },

  async getPatient(patNum) {
    const parsed = parsePatNum(patNum);
    if (parsed === null) return null;
    const patient = mockPatients.find((p) => p.patNum === parsed);
    return patient ? clone(patient) : null;
  },

  async getAppointments(filterDay = null) {
    const list = filterDay ? mockAppointments.filter((appt) => appt.day === filterDay) : mockAppointments;
    return clone(list);
  },

  async addAppointment(appointment) {
    const normalizedInput = normalizeAppointmentPayload(appointment);
    const id = normalizedInput?.id ?? Date.now();
    const withIdentifiers = {
      ...normalizedInput,
      id,
      aptNum: normalizedInput?.aptNum ?? id,
    };

    mockAppointments.push(withIdentifiers);
    return clone(withIdentifiers);
  },

  async updateAppointment(identifier, updates) {
    const index = mockAppointments.findIndex(
      (appt) => appt.id === identifier || appt.aptNum === identifier,
    );
    if (index === -1) return null;

    const normalizedUpdates = normalizeAppointmentPayload({ ...mockAppointments[index], ...updates, id: mockAppointments[index].id, aptNum: mockAppointments[index].aptNum });
    mockAppointments[index] = {
      ...mockAppointments[index],
      ...normalizedUpdates,
    };

    return clone(mockAppointments[index]);
  },

  async getClaims(status = null) {
    const list = status ? mockClaims.filter((claim) => claim.status === status) : mockClaims;
    return clone(list);
  },

  async updateClaim(identifier, updates) {
    const index = mockClaims.findIndex(
      (claim) => claim.id === identifier || claim.claimNum === identifier,
    );
    if (index === -1) return null;

    mockClaims[index] = {
      ...mockClaims[index],
      ...updates,
      patientOwes: updates.patientOwes ?? updates.patientResponsibility ?? mockClaims[index].patientOwes,
      patientResponsibility: updates.patientResponsibility ?? updates.patientOwes ?? mockClaims[index].patientResponsibility,
    };

    return clone(mockClaims[index]);
  },

  async addClaim(claim) {
    const patientInfo = resolvePatient(claim);
    const id = Date.now();
    const newClaim = {
      id,
      claimNum: id,
      patNum: patientInfo.patNum,
      patientName: patientInfo.patientName,
      patientEmail: claim.patientEmail ?? '',
      patientPhone: claim.patientPhone ?? '',
      insurance: claim.insurance ?? '',
      serviceDate: claim.serviceDate ?? new Date().toISOString().split('T')[0],
      dueDate: claim.dueDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalBilled: claim.totalBilled ?? claim.amount ?? 0,
      insurancePaid: claim.insurancePaid ?? 0,
      patientResponsibility: claim.patientResponsibility ?? claim.patientOwes ?? 0,
      patientOwes: claim.patientOwes ?? claim.patientResponsibility ?? 0,
      status: claim.status ?? 'pending',
      procedures: clone(claim.procedures ?? []),
      lastReminderSent: claim.lastReminderSent ?? null,
      date: claim.date ?? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      procedure: claim.procedure ?? (claim.procedures?.[0]?.description ?? ''),
      amount: claim.amount ?? claim.totalBilled ?? 0,
      reason: claim.reason ?? '',
    };

    mockClaims.push(newClaim);
    return clone(newClaim);
  },

  getDefaultPatientId() {
    return parsePatNum(mockPatientProfile.patNum) ?? mockPatients[0]?.patNum ?? null;
  },

  computeStats,
  computeBalance,
  computeNextAppointment,
};
