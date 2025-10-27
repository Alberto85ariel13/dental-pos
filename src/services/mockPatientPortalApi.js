const providerList = [
  { id: 1, name: 'Dr. Michael Chen', specialty: 'General Dentistry', slotDuration: 30, color: 'blue' },
  { id: 2, name: 'Dr. Lisa Park', specialty: 'Orthodontics', slotDuration: 60, color: 'purple' },
];

const appointments = [
  {
    id: 1,
    day: 'today',
    date: '2025-10-25',
    time: '09:00 AM',
    patient: 'Sarah Johnson',
    providerId: 1,
    provider: 'Dr. Michael Chen',
    providerColor: 'blue',
    type: 'Routine Checkup',
    status: 'confirmed',
    room: 'Room 1',
    reason: '6-month checkup',
    estimatedCost: 150,
    paymentStatus: 'paid',
  },
  {
    id: 2,
    day: 'today',
    date: '2025-10-25',
    time: '10:30 AM',
    patient: 'Michael Chen',
    providerId: 1,
    provider: 'Dr. Michael Chen',
    providerColor: 'blue',
    type: 'Crown Fitting',
    status: 'scheduled',
    room: null,
    reason: 'Crown follow up',
    estimatedCost: 950,
    paymentStatus: 'pending',
  },
  {
    id: 3,
    day: 'today',
    date: '2025-10-25',
    time: '12:00 PM',
    patient: 'David Rodriguez',
    providerId: 2,
    provider: 'Dr. Lisa Park',
    providerColor: 'purple',
    type: 'Consultation',
    status: 'waiting',
    room: 'Room 3',
    reason: 'Orthodontics consult',
    estimatedCost: 120,
    paymentStatus: 'pending',
  },
  {
    id: 4,
    day: 'today',
    date: '2025-10-25',
    time: '02:00 PM',
    patient: 'Emily Watson',
    providerId: 2,
    provider: 'Dr. Lisa Park',
    providerColor: 'purple',
    type: 'Whitening',
    status: 'completed',
    room: 'Room 2',
    reason: 'In-office whitening',
    estimatedCost: 450,
    paymentStatus: 'paid',
  },
  {
    id: 101,
    day: 'tomorrow',
    date: '2025-10-26',
    time: '09:30 AM',
    patient: 'Laura Hall',
    providerId: 1,
    provider: 'Dr. Michael Chen',
    providerColor: 'blue',
    type: 'Cleaning',
    status: 'scheduled',
    room: null,
    reason: 'Routine cleaning',
    estimatedCost: 180,
    paymentStatus: 'pending',
  },
  {
    id: 102,
    day: 'tomorrow',
    date: '2025-10-26',
    time: '11:00 AM',
    patient: 'Robert Taylor',
    providerId: 2,
    provider: 'Dr. Lisa Park',
    providerColor: 'purple',
    type: 'Follow-up',
    status: 'scheduled',
    room: null,
    reason: 'Brace follow up',
    estimatedCost: 200,
    paymentStatus: 'pending',
  },
];

const claims = [
  {
    id: 1,
    date: 'Sep 15, 2025',
    procedure: 'Root Canal',
    amount: 1200,
    insurancePaid: 900,
    patientOwes: 300,
    status: 'partially_covered',
    reason: 'Insurance covered 75% - maximum benefit reached',
  },
  {
    id: 2,
    date: 'Aug 20, 2025',
    procedure: 'Crown',
    amount: 150,
    insurancePaid: 65,
    patientOwes: 85,
    status: 'pending',
    reason: 'Claim pending insurance review - expected response in 7 days',
  },
];

const officeState = {
  openRequests: [
    {
      id: 1,
      patient: 'Angela Martinez',
      requestedDate: 'Oct 25, 2025',
      preferredTime: 'Morning',
      type: 'Cleaning',
      requestDate: 'Oct 18, 2025',
      phone: '(555) 123-4567',
    },
    {
      id: 2,
      patient: 'Thomas Wright',
      requestedDate: 'Oct 26, 2025',
      preferredTime: 'Afternoon',
      type: 'Consultation',
      requestDate: 'Oct 19, 2025',
      phone: '(555) 234-5678',
    },
    {
      id: 3,
      patient: 'Rebecca Hill',
      requestedDate: 'Oct 27, 2025',
      preferredTime: 'Any',
      type: 'Emergency',
      requestDate: 'Oct 19, 2025',
      phone: '(555) 345-6789',
      urgent: true,
    },
  ],
  rooms: [
    { id: 1, name: 'Room 1', status: 'occupied', patient: 'John Smith' },
    { id: 2, name: 'Room 2', status: 'available', patient: null },
    { id: 3, name: 'Room 3', status: 'cleaning', patient: null },
    { id: 4, name: 'Room 4', status: 'available', patient: null },
  ],
  recommendations: [
    {
      id: 1,
      patient: 'Sarah Johnson',
      type: '6-Month Cleaning',
      dueDate: '2025-11-15',
      lastVisit: '2025-05-15',
      priority: 'high',
      status: 'pending',
    },
    {
      id: 2,
      patient: 'John Smith',
      type: 'Follow-up',
      dueDate: '2025-11-01',
      lastVisit: '2025-10-19',
      priority: 'medium',
      status: 'pending',
    },
  ],
};

const patientProfile = {
  name: 'Sarah Johnson',
  autopayEnrolled: true,
  autopayFailing: true,
  failedPaymentReason: 'Card expired - please update payment method',
  messages: [
    {
      id: 1,
      from: "Dr. Chen's Office",
      subject: 'Appointment Confirmation',
      message: 'Your appointment is confirmed for Oct 25 at 10:30 AM',
      date: 'Oct 18, 2025',
      time: '2:30 PM',
      unread: true,
    },
    {
      id: 2,
      from: 'Billing Department',
      subject: 'Payment Received',
      message: 'Thank you for your payment of $150',
      date: 'Oct 15, 2025',
      time: '11:00 AM',
      unread: true,
    },
    {
      id: 3,
      from: "Dr. Chen's Office",
      subject: 'Insurance Update',
      message: 'Your insurance claim has been processed',
      date: 'Oct 10, 2025',
      time: '3:45 PM',
      unread: false,
    },
  ],
  upcomingRecommendations: [
    { id: 1, type: '6-Month Cleaning', dueDate: 'Nov 15, 2025', provider: 'Dr. Chen', priority: 'high' },
    { id: 2, type: 'Annual Checkup', dueDate: 'Dec 1, 2025', provider: 'Dr. Park', priority: 'medium' },
  ],
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const computeStats = (apptList = appointments, requests = officeState.openRequests) => {
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

const computeNextAppointment = (apptList = appointments) => {
  const upcoming = apptList
    .filter((appt) => ['scheduled', 'confirmed', 'waiting'].includes(appt.status))
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
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
    date: new Date(upcoming.date).toLocaleDateString('en-US', {
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

const computeBalance = (claimList = claims) =>
  claimList.reduce((total, claim) => total + Number(claim.patientOwes || 0), 0);

export const patientPortalMockApi = {
  async getPatientPortalSnapshot() {
    const clonedAppointments = clone(appointments);
    const clonedClaims = clone(claims);

    return {
      patient: {
        ...clone(patientProfile),
        balance: computeBalance(claims),
        nextAppointment: computeNextAppointment(appointments),
        claims: clonedClaims,
      },
      appointments: clonedAppointments,
      claims: clonedClaims,
      office: {
        ...clone(officeState),
        stats: computeStats(appointments, officeState.openRequests),
      },
      providers: clone(providerList),
    };
  },

  async getAppointments(filterDay = null) {
    const list = filterDay ? appointments.filter((appt) => appt.day === filterDay) : appointments;
    return clone(list);
  },

  async addAppointment(appointment) {
    const newAppointment = {
      id: Date.now(),
      providerId: appointment.providerId,
      provider: providerList.find((p) => p.id === appointment.providerId)?.name || appointment.provider,
      providerColor: providerList.find((p) => p.id === appointment.providerId)?.color || 'blue',
      paymentStatus: 'pending',
      ...appointment,
    };

    appointments.push(newAppointment);
    return clone(newAppointment);
  },

  async updateAppointment(id, updates) {
    const index = appointments.findIndex((appt) => appt.id === id);
    if (index === -1) return null;

    appointments[index] = {
      ...appointments[index],
      ...updates,
    };

    return clone(appointments[index]);
  },

  async getClaims(status = null) {
    const list = status ? claims.filter((claim) => claim.status === status) : claims;
    return clone(list);
  },

  async updateClaim(id, updates) {
    const index = claims.findIndex((claim) => claim.id === id);
    if (index === -1) return null;

    claims[index] = {
      ...claims[index],
      ...updates,
    };

    return clone(claims[index]);
  },

  async addClaim(claim) {
    const newClaim = {
      id: Date.now(),
      status: 'pending',
      ...claim,
    };

    claims.push(newClaim);
    return clone(newClaim);
  },

  computeStats,
  computeBalance,
  computeNextAppointment,
};

