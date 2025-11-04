const STORAGE_KEY = 'dental-pos/mock-data-store';
const MUTATING_ARRAY_METHODS = new Set([
  'copyWithin',
  'fill',
  'pop',
  'push',
  'reverse',
  'shift',
  'sort',
  'splice',
  'unshift',
]);

const deepClone = (value) => JSON.parse(JSON.stringify(value));
const isObject = (value) => value !== null && typeof value === 'object';

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
};

const storage = getStorage();
let storageWarningLogged = false;

const warnStorage = (error) => {
  if (storageWarningLogged) return;
  storageWarningLogged = true;
  console.warn('[mockDataStore] Unable to access localStorage. Falling back to in-memory store.', error);
};

const safeStorageGet = (key) => {
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch (error) {
    warnStorage(error);
    return null;
  }
};

const safeStorageSet = (key, value) => {
  if (!storage) return;
  try {
    storage.setItem(key, value);
  } catch (error) {
    warnStorage(error);
  }
};

const baseStore = {
  patients: [
    {
      patNum: 1001,
      fName: 'Sarah',
      lName: 'Johnson',
      phone: '(555) 123-4567',
      email: 'sarah.j@email.com',
      insurance: 'Delta Dental PPO',
      balance: 0.0,
      lastVisit: '2025-08-15',
    },
    {
      patNum: 1002,
      fName: 'Michael',
      lName: 'Chen',
      phone: '(555) 234-5678',
      email: 'mchen@email.com',
      insurance: 'MetLife Dental',
      balance: 125.0,
      lastVisit: '2025-09-30',
    },
    {
      patNum: 1003,
      fName: 'David',
      lName: 'Rodriguez',
      phone: '(555) 345-6789',
      email: 'drodriguez@email.com',
      insurance: 'Guardian Dental',
      balance: 0.0,
      lastVisit: '2025-10-05',
    },
    {
      patNum: 1004,
      fName: 'Emily',
      lName: 'Watson',
      phone: '(555) 456-7890',
      email: 'ewatson@email.com',
      insurance: 'Cigna Dental',
      balance: 250.0,
      lastVisit: '2025-09-15',
    },
    {
      patNum: 1005,
      fName: 'Laura',
      lName: 'Hall',
      phone: '(555) 567-8901',
      email: 'laura.hall@email.com',
      insurance: 'Aetna Dental',
      balance: 0.0,
      lastVisit: '2025-07-22',
    },
    {
      patNum: 1006,
      fName: 'Robert',
      lName: 'Taylor',
      phone: '(555) 678-9012',
      email: 'robert.taylor@email.com',
      insurance: 'United Concordia',
      balance: 50.0,
      lastVisit: '2025-06-18',
    },
  ],
  providers: [
    { id: 1, name: 'Dr. Michael Chen', specialty: 'General Dentistry', slotDuration: 30, color: 'blue' },
    { id: 2, name: 'Dr. Lisa Park', specialty: 'Orthodontics', slotDuration: 60, color: 'purple' },
  ],
  appointments: [
    {
      id: 2001,
      aptNum: 2001,
      patNum: 1001,
      patient: 'Sarah Johnson',
      patientName: 'Sarah Johnson',
      providerId: 1,
      provider: 'Dr. Michael Chen',
      providerName: 'Dr. Michael Chen',
      providerColor: 'blue',
      type: 'Routine Checkup',
      procedureCode: 'D0120',
      procedureDescription: 'Routine Checkup',
      reason: '6-month checkup',
      status: 'confirmed',
      room: 'Room 1',
      operatory: 'Room 1',
      estimatedCost: 150,
      paymentStatus: 'paid',
      lengthMinutes: 30,
      day: 'today',
      date: '2025-11-06',
      time: '09:30 AM',
      aptDateTime: '2025-11-06T11:00:00',
    },
    {
      id: 2002,
      aptNum: 2002,
      patNum: 1002,
      patient: 'Michael Chen',
      patientName: 'Michael Chen',
      providerId: 1,
      provider: 'Dr. Michael Chen',
      providerName: 'Dr. Michael Chen',
      providerColor: 'blue',
      type: 'Crown Fitting',
      procedureCode: 'D2740',
      procedureDescription: 'Crown Fitting',
      reason: 'Crown follow up',
      status: 'scheduled',
      room: null,
      operatory: 'Room 2',
      estimatedCost: 950,
      paymentStatus: 'pending',
      lengthMinutes: 30,
      day: 'today',
      date: '2025-11-06',
      time: '10:30 AM',
      aptDateTime: '2025-11-06T10:30:00',
    },
    {
      id: 2003,
      aptNum: 2003,
      patNum: 1003,
      patient: 'David Rodriguez',
      patientName: 'David Rodriguez',
      providerId: 2,
      provider: 'Dr. Lisa Park',
      providerName: 'Dr. Lisa Park',
      providerColor: 'purple',
      type: 'Consultation',
      procedureCode: 'D0150',
      procedureDescription: 'Consultation',
      reason: 'Orthodontics consult',
      status: 'waiting',
      room: 'Room 3',
      operatory: 'Room 3',
      estimatedCost: 120,
      paymentStatus: 'pending',
      lengthMinutes: 30,
      day: 'today',
      date: '2025-11-06',
      time: '12:00 PM',
      aptDateTime: '2025-11-06T12:00:00',
    },
    {
      id: 2004,
      aptNum: 2004,
      patNum: 1004,
      patient: 'Emily Watson',
      patientName: 'Emily Watson',
      providerId: 2,
      provider: 'Dr. Lisa Park',
      providerName: 'Dr. Lisa Park',
      providerColor: 'purple',
      type: 'Whitening',
      procedureCode: 'D9972',
      procedureDescription: 'Whitening',
      reason: 'In-office whitening',
      status: 'completed',
      room: 'Room 2',
      operatory: 'Room 2',
      estimatedCost: 450,
      paymentStatus: 'paid',
      lengthMinutes: 30,
      day: 'today',
      date: '2025-11-06',
      time: '02:00 PM',
      aptDateTime: '2025-11-06T14:00:00',
    },
    {
      id: 2101,
      aptNum: 2101,
      patNum: 1005,
      patient: 'Laura Hall',
      patientName: 'Laura Hall',
      providerId: 1,
      provider: 'Dr. Michael Chen',
      providerName: 'Dr. Michael Chen',
      providerColor: 'blue',
      type: 'Cleaning',
      procedureCode: 'D1110',
      procedureDescription: 'Cleaning',
      reason: 'Routine cleaning',
      status: 'scheduled',
      room: null,
      operatory: 'Room 1',
      estimatedCost: 180,
      paymentStatus: 'pending',
      lengthMinutes: 30,
      day: 'tomorrow',
      date: '2025-10-26',
      time: '09:30 AM',
      aptDateTime: '2025-10-26T09:30:00',
    },
    {
      id: 2102,
      aptNum: 2102,
      patNum: 1006,
      patient: 'Robert Taylor',
      patientName: 'Robert Taylor',
      providerId: 2,
      provider: 'Dr. Lisa Park',
      providerName: 'Dr. Lisa Park',
      providerColor: 'purple',
      type: 'Follow-up',
      procedureCode: 'D0150',
      procedureDescription: 'Follow-up',
      reason: 'Brace follow up',
      status: 'scheduled',
      room: null,
      operatory: 'Room 2',
      estimatedCost: 200,
      paymentStatus: 'pending',
      lengthMinutes: 60,
      day: 'tomorrow',
      date: '2025-10-26',
      time: '11:00 AM',
      aptDateTime: '2025-10-26T11:00:00',
    },
  ],
  claims: [
    {
      id: 5001,
      claimNum: 5001,
      patNum: 1001,
      patientName: 'Sarah Johnson',
      patientEmail: 'sarah.j@email.com',
      patientPhone: '(555) 123-4567',
      insurance: 'Delta Dental PPO',
      serviceDate: '2025-09-15',
      dueDate: '2025-10-15',
      totalBilled: 3850.0,
      insurancePaid: 595.0,
      patientResponsibility: 3255.0,
      patientOwes: 3255.0,
      status: 'pending',
      procedures: [
        { code: 'D2740', description: 'Crown - Porcelain/Ceramic', fee: 3850.0 },
      ],
      lastReminderSent: null,
      date: 'Sep 15, 2025',
      procedure: 'Crown - Porcelain/Ceramic',
      amount: 3850.0,
      reason: 'Insurance covering 15% - awaiting response',
    },
    {
      id: 5002,
      claimNum: 5002,
      patNum: 1002,
      patientName: 'Michael Chen',
      patientEmail: 'mchen@email.com',
      patientPhone: '(555) 234-5678',
      insurance: 'MetLife Dental',
      serviceDate: '2025-08-20',
      dueDate: '2025-09-20',
      totalBilled: 1200.0,
      insurancePaid: 960.0,
      patientResponsibility: 240.0,
      patientOwes: 240.0,
      status: 'overdue',
      procedures: [
        { code: 'D3310', description: 'Root Canal - Anterior', fee: 900.0 },
        { code: 'D2740', description: 'Crown Build-up', fee: 300.0 },
      ],
      lastReminderSent: '2025-10-01',
      date: 'Aug 20, 2025',
      procedure: 'Root Canal - Anterior',
      amount: 1200.0,
      reason: 'Insurance paid 80% - patient owes remaining balance',
    },
    {
      id: 5003,
      claimNum: 5003,
      patNum: 1004,
      patientName: 'Emily Watson',
      patientEmail: 'ewatson@email.com',
      patientPhone: '(555) 456-7890',
      insurance: 'Cigna Dental',
      serviceDate: '2025-10-01',
      dueDate: '2025-11-01',
      totalBilled: 450.0,
      insurancePaid: 360.0,
      patientResponsibility: 90.0,
      patientOwes: 90.0,
      status: 'sent',
      procedures: [
        { code: 'D9972', description: 'External Bleaching', fee: 450.0 },
      ],
      lastReminderSent: '2025-10-15',
      date: 'Oct 1, 2025',
      procedure: 'External Bleaching',
      amount: 450.0,
      reason: 'Payment reminder sent - awaiting patient payment',
    },
    {
      id: 5004,
      claimNum: 5004,
      patNum: 1003,
      patientName: 'David Rodriguez',
      patientEmail: 'drodriguez@email.com',
      patientPhone: '(555) 345-6789',
      insurance: 'Guardian Dental',
      serviceDate: '2025-07-10',
      dueDate: '2025-08-10',
      totalBilled: 650.0,
      insurancePaid: 520.0,
      patientResponsibility: 130.0,
      patientOwes: 130.0,
      status: 'overdue',
      procedures: [
        { code: 'D2150', description: 'Amalgam - Two Surfaces', fee: 220.0 },
        { code: 'D1110', description: 'Prophylaxis - Adult', fee: 120.0 },
        { code: 'D0210', description: 'Complete Intraoral Radiographs', fee: 200.0 },
      ],
      lastReminderSent: '2025-09-10',
      date: 'Jul 10, 2025',
      procedure: 'Amalgam - Two Surfaces',
      amount: 650.0,
      reason: 'Multiple reminders sent - contact patient directly',
    },
  ],
  officeState: {
    openRequests: [
      {
        id: 1,
        patient: 'Angela Martinez',
        requestedDate: 'Nov 06, 2025',
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
  },
  patientProfile: {
    patNum: 1001,
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 123-4567',
    insurance: 'Delta Dental PPO',
    lastVisit: '2025-08-15',
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
  },
};

const createDefaultStore = () => deepClone(baseStore);

const mergeArray = (value, fallback) => (Array.isArray(value) ? value : fallback);

const mergeOfficeState = (value, fallback) => {
  if (!isObject(value)) return fallback;
  return {
    ...fallback,
    ...value,
    openRequests: mergeArray(value.openRequests, fallback.openRequests),
    rooms: mergeArray(value.rooms, fallback.rooms),
    recommendations: mergeArray(value.recommendations, fallback.recommendations),
  };
};

const mergePatientProfile = (value, fallback) => {
  if (!isObject(value)) return fallback;
  return {
    ...fallback,
    ...value,
    messages: mergeArray(value.messages, fallback.messages),
    upcomingRecommendations: mergeArray(value.upcomingRecommendations, fallback.upcomingRecommendations),
  };
};

const initializeStore = () => {
  const defaults = createDefaultStore();
  const raw = safeStorageGet(STORAGE_KEY);
  if (!raw) {
    return defaults;
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      patients: mergeArray(parsed?.patients, defaults.patients),
      providers: mergeArray(parsed?.providers, defaults.providers),
      appointments: mergeArray(parsed?.appointments, defaults.appointments),
      claims: mergeArray(parsed?.claims, defaults.claims),
      officeState: mergeOfficeState(parsed?.officeState, defaults.officeState),
      patientProfile: mergePatientProfile(parsed?.patientProfile, defaults.patientProfile),
    };
  } catch (error) {
    warnStorage(error);
    return defaults;
  }
};

const store = initializeStore();

const persistStore = () => {
  safeStorageSet(STORAGE_KEY, JSON.stringify(store));
};

const proxyCache = new WeakMap();

const proxify = (value) => {
  if (!isObject(value)) return value;
  if (proxyCache.has(value)) {
    return proxyCache.get(value);
  }

  const handler = Array.isArray(value) ? arrayHandler : objectHandler;
  const proxy = new Proxy(value, handler);
  proxyCache.set(value, proxy);
  return proxy;
};

const setWithPersist = (target, prop, value, receiver) => {
  const result = Reflect.set(target, prop, value, receiver);
  persistStore();
  return result;
};

const deleteWithPersist = (target, prop) => {
  const result = Reflect.deleteProperty(target, prop);
  persistStore();
  return result;
};

const arrayHandler = {
  get(target, prop, receiver) {
    if (typeof prop === 'symbol') {
      return Reflect.get(target, prop, receiver);
    }

    const value = Reflect.get(target, prop, receiver);
    if (typeof value === 'function') {
      if (MUTATING_ARRAY_METHODS.has(prop)) {
        return (...args) => {
          const result = value.apply(target, args);
          persistStore();
          return result;
        };
      }
      return value.bind(target);
    }

    return proxify(value);
  },
  set(target, prop, value, receiver) {
    return setWithPersist(target, prop, value, receiver);
  },
  deleteProperty(target, prop) {
    return deleteWithPersist(target, prop);
  },
};

const objectHandler = {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);
    return proxify(value);
  },
  set(target, prop, value, receiver) {
    return setWithPersist(target, prop, value, receiver);
  },
  deleteProperty(target, prop) {
    return deleteWithPersist(target, prop);
  },
};

export const mockPatients = proxify(store.patients);
export const mockProviders = proxify(store.providers);
export const mockAppointments = proxify(store.appointments);
export const mockClaims = proxify(store.claims);
export const mockOfficeState = proxify(store.officeState);
export const mockPatientProfile = proxify(store.patientProfile);

const replaceArrayContents = (target, source) => {
  target.splice(0, target.length, ...source);
};

const replaceObjectContents = (target, source) => {
  Object.keys(target).forEach((key) => {
    if (!(key in source)) {
      delete target[key];
    }
  });

  Object.keys(source).forEach((key) => {
    target[key] = source[key];
  });
};

export const resetMockDataStore = () => {
  const defaults = createDefaultStore();
  replaceArrayContents(store.patients, defaults.patients);
  replaceArrayContents(store.providers, defaults.providers);
  replaceArrayContents(store.appointments, defaults.appointments);
  replaceArrayContents(store.claims, defaults.claims);
  replaceObjectContents(store.officeState, defaults.officeState);
  replaceObjectContents(store.patientProfile, defaults.patientProfile);
  persistStore();
};

export const persistMockDataStore = () => {
  persistStore();
};
