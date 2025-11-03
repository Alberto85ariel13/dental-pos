import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Calendar,
  Clock,
  DollarSign,
  FileText,
  MessageSquare,
  User,
  Bell,
  LogOut,
  CreditCard,
  Plus,
  Video,
  Search,
  CheckCircle,
  Users,
  Home,
  Send,
  Edit,
  X,
  Star,
  TrendingUp,
  CheckSquare,
  Mail,
  Smartphone,
  AlertTriangle,
  RefreshCw,
  Filter,
  ChevronRight,
} from "lucide-react";
import { patientPortalMockApi } from "../services/mockPatientPortalApi";

const APPOINTMENT_TYPE_COSTS = {
  "Routine Checkup": 150,
  Cleaning: 180,
  Filling: 220,
  Crown: 950,
};

const getTimeSlots = (durationMinutes = 30) => {
  const slots = [];
  const startMinutes = 9 * 60;
  const endMinutes = 17 * 60;

  for (
    let minutes = startMinutes;
    minutes <= endMinutes - durationMinutes;
    minutes += durationMinutes
  ) {
    const hour24 = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const hour12 = ((hour24 + 11) % 12) + 1;
    const meridiem = hour24 >= 12 ? "PM" : "AM";
    const minuteStr = mins.toString().padStart(2, "0");
    slots.push(`${hour12}:${minuteStr} ${meridiem}`);
  }

  return slots;
};

const determineDayLabel = (dateString) => {
  const selectedDate = new Date(dateString);
  if (Number.isNaN(selectedDate.getTime())) return "upcoming";

  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const startOfSelected = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate()
  );
  const diffInDays = Math.round(
    (startOfSelected - startOfToday) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays === 0) return "today";
  if (diffInDays === 1) return "tomorrow";
  if (diffInDays < 0) return "past";
  return "upcoming";
};

const DentalManagementSystem = () => {
  const { patNum: patNumParam } = useParams();
  const [currentView, setCurrentView] = useState("patient-portal");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showClaimDetailsModal, setShowClaimDetailsModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [scheduleView, setScheduleView] = useState("today");
  const [slotDuration, setSlotDuration] = useState(30);
  const [appointmentForm, setAppointmentForm] = useState({
    providerId: "",
    type: "Routine Checkup",
    reason: "",
    date: "",
    time: "",
    payNow: false,
  });
  const [appointmentError, setAppointmentError] = useState(null);
  const [isBookingAppointment, setIsBookingAppointment] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [officeData, setOfficeData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [claims, setClaims] = useState([]);
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [savedCards] = useState([
    {
      id: 1,
      last4: "4242",
      brand: "Visa",
      expiry: "12/26",
      isDefault: true,
      status: "active",
    },
    {
      id: 2,
      last4: "5555",
      brand: "Mastercard",
      expiry: "03/27",
      isDefault: false,
      status: "failed",
    },
  ]);

  const formatCurrency = useCallback((value) => {
    const amount = Number(value ?? 0);
    if (!Number.isFinite(amount)) {
      return "$0.00";
    }
    return `$${amount.toFixed(2)}`;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadMockData = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const snapshot = await patientPortalMockApi.getPatientPortalSnapshot(
          patNumParam ?? null
        );

        if (!isMounted) return;

        setPatientData(snapshot.patient);
        setOfficeData(snapshot.office);
        setAppointments(snapshot.appointments);
        setClaims(snapshot.claims);
        setProviders(snapshot.providers);
        setSelectedPatient(null);
      } catch (error) {
        if (!isMounted) return;

        console.error("Failed to load patient portal data", error);
        setLoadError(error.message || "Unable to load patient portal data.");
        setPatientData(null);
        setOfficeData(null);
        setAppointments([]);
        setClaims([]);
        setProviders([]);
        setSelectedPatient(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMockData();

    return () => {
      isMounted = false;
    };
  }, [patNumParam]);

  useEffect(() => {
    setOfficeData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        stats: patientPortalMockApi.computeStats(undefined, prev.openRequests),
      };
    });
  }, [appointments]);

  useEffect(() => {
    setPatientData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        balance: patientPortalMockApi.computeBalance(claims, appointments),
        nextAppointment:
          patientPortalMockApi.computeNextAppointment(appointments),
      };
    });
  }, [appointments, claims]);

  const initializeAppointmentForm = useCallback(() => {
    const defaultProviderId = providers[0]?.id ? String(providers[0].id) : "";
    const provider = providers.find((p) => p.id === Number(defaultProviderId));
    const providerSlotDuration = provider?.slotDuration ?? 30;
    setSlotDuration(providerSlotDuration);
    const slots = getTimeSlots(providerSlotDuration);

    setAppointmentForm({
      providerId: defaultProviderId,
      type: "Routine Checkup",
      reason: "",
      date: "",
      time: slots[0] ?? "",
      payNow: false,
    });
    setAppointmentError(null);
  }, [providers]);

  useEffect(() => {
    if (providers.length > 0 && !appointmentForm.providerId) {
      initializeAppointmentForm();
    }
  }, [providers, appointmentForm.providerId, initializeAppointmentForm]);

  const openAppointmentModal = useCallback(() => {
    initializeAppointmentForm();
    setShowAppointmentModal(true);
  }, [initializeAppointmentForm]);

  const closeAppointmentModal = useCallback(() => {
    setShowAppointmentModal(false);
    setAppointmentError(null);
    setIsBookingAppointment(false);
    initializeAppointmentForm();
  }, [initializeAppointmentForm]);

  const handleAppointmentFieldChange = (field, value) => {
    setAppointmentError(null);

    if (field === "providerId") {
      const provider = providers.find((p) => p.id === Number(value));
      const providerSlotDuration = provider?.slotDuration ?? 30;
      setSlotDuration(providerSlotDuration);
      const slots = getTimeSlots(providerSlotDuration);
      setAppointmentForm((prev) => ({
        ...prev,
        providerId: value,
        time: slots[0] ?? "",
      }));
      return;
    }

    if (field === "payNow") {
      setAppointmentForm((prev) => ({
        ...prev,
        payNow: value,
      }));
      return;
    }

    setAppointmentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const timeOptions = useMemo(() => getTimeSlots(slotDuration), [slotDuration]);
  const selectedAppointmentCost = useMemo(
    () => APPOINTMENT_TYPE_COSTS[appointmentForm.type] ?? 150,
    [appointmentForm.type]
  );

  const handleBookAppointment = async () => {
    if (
      !appointmentForm.providerId ||
      !appointmentForm.date ||
      !appointmentForm.time
    ) {
      setAppointmentError("Please select a provider, date, and time.");
      return;
    }

    const providerId = Number(appointmentForm.providerId);
    const provider = providers.find((p) => p.id === providerId);

    setIsBookingAppointment(true);
    setAppointmentError(null);

    try {
      const newAppointment = await patientPortalMockApi.addAppointment({
        patNum: patientData.patNum,
        patient: patientData.name,
        providerId,
        provider: provider?.name,
        type: appointmentForm.type,
        reason: appointmentForm.reason || appointmentForm.type,
        date: appointmentForm.date,
        time: appointmentForm.time,
        day: determineDayLabel(appointmentForm.date),
        status: "scheduled",
        room: null,
        estimatedCost: selectedAppointmentCost,
        paymentStatus: appointmentForm.payNow ? "paid" : "pending",
      });

      setAppointments((prev) => {
        const updated = [...prev, newAppointment];
        return updated.sort(
          (a, b) =>
            new Date(`${a.date} ${a.time}`).getTime() -
            new Date(`${b.date} ${b.time}`).getTime()
        );
      });

      closeAppointmentModal();
    } catch (error) {
      console.error("Failed to book appointment", error);
      setAppointmentError("Unable to book appointment. Please try again.");
    } finally {
      setIsBookingAppointment(false);
    }
  };

  const todayAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.day === "today"),
    [appointments]
  );

  const tomorrowAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.day === "tomorrow"),
    [appointments]
  );

  const outstandingAppointments = useMemo(
    () =>
      appointments.filter((appointment) => {
        const paymentStatus = String(
          appointment.paymentStatus ?? ""
        ).toLowerCase();
        const cost = Number(appointment.estimatedCost ?? 0);
        return paymentStatus !== "paid" && Number.isFinite(cost) && cost > 0;
      }),
    [appointments]
  );

  const outstandingClaims = useMemo(
    () =>
      claims.filter((claim) => {
        const amount = Number(
          claim.patientOwes ?? claim.patientResponsibility ?? claim.amount ?? 0
        );
        return Number.isFinite(amount) && amount > 0;
      }),
    [claims]
  );

  const outstandingAppointmentTotal = useMemo(
    () =>
      outstandingAppointments.reduce((total, appointment) => {
        const cost = Number(appointment.estimatedCost ?? 0);
        return total + (Number.isFinite(cost) ? cost : 0);
      }, 0),
    [outstandingAppointments]
  );

  const outstandingClaimTotal = useMemo(
    () =>
      outstandingClaims.reduce((total, claim) => {
        const amount = Number(
          claim.patientOwes ?? claim.patientResponsibility ?? claim.amount ?? 0
        );
        return total + (Number.isFinite(amount) ? amount : 0);
      }, 0),
    [outstandingClaims]
  );

  if (isLoading) {
    return <div className="p-6 text-slate-500">Loading patient portal...</div>;
  }

  if (loadError) {
    return <div className="p-6 text-red-600">{loadError}</div>;
  }

  if (!patientData || !officeData) {
    return (
      <div className="p-6 text-slate-500">
        Unable to load patient portal data.
      </div>
    );
  }

  const renderPatientOverview = () => (
    <div className="space-y-6">
      <div className="bg-[#0A54C2] rounded-xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">
          Welcome, {patientData.name}!
        </h2>
        <p className="text-white">Your dental health dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Next Appointment</p>
              <p className="text-2xl font-bold text-slate-800">
                {patientData.nextAppointment.date}
              </p>
              <p className="text-slate-600 text-sm">
                {patientData.nextAppointment.time}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-teal-500" />
          </div>
        </div>

        <div
          className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500 cursor-pointer"
          onClick={() => setShowClaimDetailsModal(true)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Outstanding Balance</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(patientData.balance ?? 0)}
              </p>
              {patientData.autopayFailing && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-xs text-red-600 font-medium">
                    Autopay Failed
                  </span>
                </div>
              )}
              <button className="text-red-600 text-sm hover:underline mt-1 flex items-center gap-1">
                View Details <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <DollarSign className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <div
          className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 cursor-pointer"
          onClick={() => setActiveTab("messages")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">New Messages</p>
              <p className="text-2xl font-bold text-slate-800">
                {patientData.messages.filter((m) => m.unread).length}
              </p>
              <button className="text-purple-600 text-sm hover:underline mt-1">
                View All
              </button>
            </div>
            <MessageSquare className="w-12 h-12 text-purple-500" />
          </div>
        </div>
      </div>

      {patientData.autopayFailing && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-800 mb-2">
                Action Required: Autopay Failed
              </h3>
              <p className="text-red-700 mb-3">
                {patientData.failedPaymentReason}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCardModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Update Payment Method
                </button>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-4 py-2 bg-white border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {patientData.upcomingRecommendations.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-500" />
            Recommended Care
          </h3>
          <div className="space-y-3">
            {patientData.upcomingRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-800">{rec.type}</h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rec.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">Due: {rec.dueDate}</p>
                </div>
                <button
                  onClick={openAppointmentModal}
                  className="px-4 py-2 bg-[#0A54C2] text-white rounded-lg hover:bg-[#1571C2]"
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4">
          Payment Methods
        </h3>
        <div className="space-y-3">
          {savedCards.map((card) => (
            <div
              key={card.id}
              className={`flex items-center justify-between p-4 border-2 rounded-lg ${
                card.status === "failed"
                  ? "border-red-300 bg-red-50"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard
                  className={`w-8 h-8 ${
                    card.status === "failed" ? "text-red-600" : "text-slate-600"
                  }`}
                />
                <div>
                  <p className="font-medium text-slate-800">
                    {card.brand} •••• {card.last4}
                  </p>
                  <p className="text-sm text-slate-600">
                    Expires {card.expiry}
                  </p>
                  {card.status === "failed" && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                      Payment failed - Update required
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {card.isDefault && (
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                    Default
                  </span>
                )}
                {card.status === "failed" && (
                  <button
                    onClick={() => setShowCardModal(true)}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700"
                  >
                    Update
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={() => setShowCardModal(true)}
            className="text-teal-600 hover:text-teal-700 flex items-center gap-1 mt-2"
          >
            <Plus className="w-4 h-4" />
            Add Card
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={openAppointmentModal}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center"
        >
          <Plus className="w-8 h-8 text-teal-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">Book Appointment</p>
        </button>
        <button
          onClick={() => setShowPaymentModal(true)}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center"
        >
          <CreditCard className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">Make Payment</p>
        </button>
        <button
          onClick={() => setShowChatModal(true)}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center"
        >
          <MessageSquare className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">Message Office</p>
        </button>
        <button className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center">
          <FileText className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">View Records</p>
        </button>
      </div>
    </div>
  );

  const renderPatientMessages = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Messages</h2>

        <div className="space-y-3">
          {patientData.messages.map((msg) => (
            <div
              key={msg.id}
              className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                msg.unread
                  ? "bg-blue-50 border-blue-200"
                  : "bg-white border-slate-200"
              }`}
              onClick={() => setShowChatModal(true)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-slate-800">{msg.from}</h3>
                    {msg.unread && (
                      <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs font-medium">
                        New
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-slate-700 mb-1">
                    {msg.subject}
                  </p>
                  <p className="text-sm text-slate-600 mb-2">{msg.message}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{msg.date}</span>
                    <span>•</span>
                    <span>{msg.time}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOfficeDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
          <p className="text-slate-600 text-sm mb-1">Today</p>
          <p className="text-3xl font-bold text-slate-800">
            {officeData.stats.todayAppointments}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-slate-600 text-sm mb-1">Checked In</p>
          <p className="text-3xl font-bold text-slate-800">
            {officeData.stats.checkedIn}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <p className="text-slate-600 text-sm mb-1">Completed</p>
          <p className="text-3xl font-bold text-slate-800">
            {officeData.stats.completed}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <p className="text-slate-600 text-sm mb-1">Open Requests</p>
          <p className="text-3xl font-bold text-slate-800">
            {officeData.stats.openRequests}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <p className="text-slate-600 text-sm mb-1">Revenue</p>
          <p className="text-3xl font-bold text-slate-800">
            ${officeData.stats.revenue}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800">Daily Schedule</h3>
            <div className="flex gap-2">
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">All Providers</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                onClick={openAppointmentModal}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setScheduleView("today")}
              className={`px-4 py-2 rounded-lg font-medium ${
                scheduleView === "today"
                  ? "bg-teal-500 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              Today ({todayAppointments.length})
            </button>
            <button
              onClick={() => setScheduleView("tomorrow")}
              className={`px-4 py-2 rounded-lg font-medium ${
                scheduleView === "tomorrow"
                  ? "bg-teal-500 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              Tomorrow ({tomorrowAppointments.length})
            </button>
            <button
              onClick={() => setScheduleView("requests")}
              className={`px-4 py-2 rounded-lg font-medium ${
                scheduleView === "requests"
                  ? "bg-orange-500 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              Open Requests ({officeData.openRequests.length})
            </button>
          </div>

          <div className="max-h-[600px] overflow-y-auto space-y-2">
            {scheduleView === "requests"
              ? officeData.openRequests.map((req) => (
                  <div
                    key={req.id}
                    className={`border-2 rounded-lg p-4 ${
                      req.urgent
                        ? "border-red-300 bg-red-50"
                        : "border-orange-300 bg-orange-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-slate-800">
                            {req.patient}
                          </p>
                          {req.urgent && (
                            <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium">
                              URGENT
                            </span>
                          )}
                          <span className="px-2 py-1 bg-orange-500 text-white rounded-full text-xs font-medium">
                            Open Request
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mb-2">
                          <p>
                            <strong>Requested:</strong> {req.requestedDate}
                          </p>
                          <p>
                            <strong>Time Pref:</strong> {req.preferredTime}
                          </p>
                          <p>
                            <strong>Type:</strong> {req.type}
                          </p>
                          <p>
                            <strong>Phone:</strong> {req.phone}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500">
                          Requested on {req.requestDate}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={openAppointmentModal}
                          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm"
                        >
                          Schedule
                        </button>
                        <button
                          onClick={() => setShowChatModal(true)}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                        >
                          Contact
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              : (scheduleView === "today"
                  ? todayAppointments
                  : tomorrowAppointments
                )
                  .filter(
                    (apt) =>
                      selectedProvider === "all" ||
                      apt.provider ===
                        providers.find(
                          (p) => p.id.toString() === selectedProvider
                        )?.name
                  )
                  .map((apt) => (
                    <div
                      key={apt.id}
                      className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className={`w-1 h-12 rounded ${
                              apt.providerColor === "blue"
                                ? "bg-blue-500"
                                : "bg-purple-500"
                            }`}
                          ></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-sm text-slate-800">
                                {apt.time}
                              </p>
                              <p className="font-bold text-slate-800">
                                {apt.patient}
                              </p>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  apt.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : apt.status === "in-progress"
                                    ? "bg-blue-100 text-blue-700"
                                    : apt.status === "waiting"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : apt.status === "confirmed"
                                    ? "bg-teal-100 text-teal-700"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {apt.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">
                              {apt.provider} • {apt.type} • {apt.reason}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {scheduleView === "today" &&
                            apt.status === "scheduled" && (
                              <button className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">
                                Check In
                              </button>
                            )}
                          {apt.status === "waiting" && (
                            <button
                              onClick={() => setSelectedPatient(apt)}
                              className="px-3 py-1 bg-teal-500 text-white rounded text-xs hover:bg-teal-600"
                            >
                              Room
                            </button>
                          )}
                          <button className="p-1 text-slate-600 hover:text-slate-800">
                            <Edit className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Rooms</h3>
          <div className="space-y-3">
            {officeData.rooms.map((room) => (
              <div key={room.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-sm text-slate-800">
                    {room.name}
                  </p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      room.status === "occupied"
                        ? "bg-red-100 text-red-700"
                        : room.status === "cleaning"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {room.status}
                  </span>
                </div>
                {room.patient && (
                  <p className="text-xs text-slate-600">{room.patient}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderClaimDetailsModal = () => {
    if (!showClaimDetailsModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                Balance Details
              </h3>
              <p className="text-sm text-slate-600">
                Outstanding balance breakdown
              </p>
            </div>
            <button
              onClick={() => setShowClaimDetailsModal(false)}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Total Outstanding</p>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(patientData.balance ?? 0)}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                  Unpaid Appointments
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {formatCurrency(outstandingAppointmentTotal)}
                </p>
                <p className="text-xs text-slate-500">
                  {outstandingAppointments.length} upcoming charge
                  {outstandingAppointments.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                  Outstanding Claims
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {formatCurrency(outstandingClaimTotal)}
                </p>
                <p className="text-xs text-slate-500">
                  {outstandingClaims.length} claim
                  {outstandingClaims.length === 1 ? "" : "s"} awaiting payment
                </p>
              </div>
            </div>

            {patientData.autopayEnrolled && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-blue-800">Autopay Status</h4>
                </div>
                {patientData.autopayFailing ? (
                  <div>
                    <p className="text-sm text-red-700 mb-2">
                      <strong>Status:</strong> Failed
                    </p>
                    <p className="text-sm text-red-700 mb-3">
                      {patientData.failedPaymentReason}
                    </p>
                    <button
                      onClick={() => {
                        setShowClaimDetailsModal(false);
                        setShowCardModal(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Update Payment Method
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-blue-700">
                    Autopay is active and will process on the 1st of each month
                  </p>
                )}
              </div>
            )}
            <div>
              <h4 className="text-lg font-bold text-slate-800 mb-4">
                Unpaid Appointments
              </h4>
              {outstandingAppointments.length === 0 ? (
                <p className="text-sm text-slate-500">
                  All upcoming appointments have been paid.
                </p>
              ) : (
                <div className="space-y-4">
                  {outstandingAppointments.map((appointment) => (
                    <div
                      key={appointment.aptNum ?? appointment.id}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-bold text-slate-800">
                              {appointment.type}
                            </h5>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                appointment.status === "confirmed"
                                  ? "bg-blue-100 text-blue-700"
                                  : appointment.status === "scheduled"
                                  ? "bg-slate-100 text-slate-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {appointment.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            {appointment.date} • {appointment.time} •{" "}
                            {appointment.provider}
                          </p>
                          {appointment.reason && (
                            <p className="text-xs text-slate-500">
                              Reason: {appointment.reason}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-600">Estimated</p>
                          <p className="text-2xl font-bold text-slate-800">
                            {formatCurrency(appointment.estimatedCost)}
                          </p>
                          <p className="text-xs text-slate-500 capitalize">
                            {appointment.paymentStatus ?? "pending"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-800 mb-4">
                Outstanding Claims
              </h4>
              {outstandingClaims.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No open claims with patient responsibility.
                </p>
              ) : (
                <div className="space-y-4">
                  {outstandingClaims.map((claim) => (
                    <div
                      key={claim.id ?? claim.claimNum}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-bold text-slate-800">
                              {claim.procedure}
                            </h5>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                claim.status === "partially_covered"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : claim.status === "pending"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {claim.status === "partially_covered"
                                ? "Partially Covered"
                                : claim.status === "pending"
                                ? "Pending"
                                : "Approved"}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            {claim.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-600">You Owe</p>
                          <p className="text-2xl font-bold text-red-600">
                            {formatCurrency(
                              claim.patientOwes ??
                                claim.patientResponsibility ??
                                0
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 p-3 bg-slate-50 rounded-lg mb-3">
                        <div>
                          <p className="text-xs text-slate-600">Total Charge</p>
                          <p className="font-bold text-slate-800">
                            {formatCurrency(
                              claim.amount ?? claim.totalBilled ?? 0
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">
                            Insurance Paid
                          </p>
                          <p className="font-bold text-green-600">
                            {formatCurrency(claim.insurancePaid ?? 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">
                            Your Responsibility
                          </p>
                          <p className="font-bold text-red-600">
                            {formatCurrency(
                              claim.patientOwes ??
                                claim.patientResponsibility ??
                                0
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                        <p className="text-sm text-blue-800">
                          <strong>Explanation:</strong> {claim.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border-t flex gap-3 sticky bottom-0 bg-white">
            <button
              onClick={() => setShowClaimDetailsModal(false)}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={() => {
                setShowClaimDetailsModal(false);
                setShowPaymentModal(true);
              }}
              className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
            >
              Pay {formatCurrency(patientData.balance ?? 0)}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAppointmentModal = () => {
    if (!showAppointmentModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-[#0A54C2]">
            <h3 className="text-2xl font-bold text-white">Book Appointment</h3>
            <button onClick={closeAppointmentModal} className="p-2 rounded-lg">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Provider
              </label>
              <select
                value={appointmentForm.providerId}
                onChange={(e) =>
                  handleAppointmentFieldChange("providerId", e.target.value)
                }
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="" disabled>
                  Select provider
                </option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.specialty}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Appointment Type
              </label>
              <select
                value={appointmentForm.type}
                onChange={(e) =>
                  handleAppointmentFieldChange("type", e.target.value)
                }
                className="w-full px-4 py-2 border rounded-lg"
              >
                {Object.keys(APPOINTMENT_TYPE_COSTS).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reason for Visit
              </label>
              <textarea
                rows="3"
                value={appointmentForm.reason}
                onChange={(e) =>
                  handleAppointmentFieldChange("reason", e.target.value)
                }
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Describe reason..."
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={appointmentForm.date}
                  onChange={(e) =>
                    handleAppointmentFieldChange("date", e.target.value)
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Time
                </label>
                <select
                  value={appointmentForm.time}
                  onChange={(e) =>
                    handleAppointmentFieldChange("time", e.target.value)
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="" disabled>
                    Select time
                  </option>
                  {timeOptions.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Estimated Cost</p>
                <p className="text-xl font-bold">${selectedAppointmentCost}</p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={appointmentForm.payNow}
                  onChange={(e) =>
                    handleAppointmentFieldChange("payNow", e.target.checked)
                  }
                />
                Pay now and save 5%
              </label>
            </div>

            {appointmentError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {appointmentError}
              </div>
            )}
          </div>

          <div className="p-6 border-t flex gap-3">
            <button
              onClick={closeAppointmentModal}
              className="flex-1 px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleBookAppointment}
              disabled={isBookingAppointment}
              className={`flex-1 px-4 py-2 rounded-lg text-white ${
                isBookingAppointment
                  ? "bg-[#0A54C2] cursor-not-allowed"
                  : "bg-[#0A54C2] hover:bg-[#1571C2]"
              }`}
            >
              {isBookingAppointment ? "Booking..." : "Book"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentModal = () => {
    if (!showPaymentModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
          <div className="p-6 border-b bg-[#0A54C2]">
            <h3 className="text-2xl font-bold text-white">Make Payment</h3>
          </div>

          <div className="p-6 space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Amount Due</p>
              <p className="text-3xl font-bold text-slate-800">
                {formatCurrency(patientData.balance ?? 0)}
              </p>
            </div>

            {savedCards.map((card) => (
              <div
                key={card.id}
                className={`flex items-center justify-between p-4 border-2 rounded-lg ${
                  card.status === "failed"
                    ? "border-red-300 opacity-50"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="card"
                    disabled={card.status === "failed"}
                    defaultChecked={card.isDefault && card.status !== "failed"}
                  />
                  <CreditCard className="w-6 h-6" />
                  <div>
                    <p className="font-medium">
                      {card.brand} •••• {card.last4}
                    </p>
                    {card.status === "failed" && (
                      <p className="text-xs text-red-600">Card expired</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t flex gap-3">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="flex-1 px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button className="flex-1 px-4 py-2 bg-[#0A54C2] text-white rounded-lg hover:bg-[#1571C2]">
              Pay Now
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCardModal = () => {
    if (!showCardModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-800">Add Card</h3>
            <button
              onClick={() => setShowCardModal(false)}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Card Number
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Expiry
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Set as default</span>
            </label>
          </div>

          <div className="p-6 border-t flex gap-3">
            <button
              onClick={() => setShowCardModal(false)}
              className="flex-1 px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg">
              Save Card
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderChatModal = () => {
    if (!showChatModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full h-[600px] flex flex-col">
          <div className="bg-[#0A54C2] p-6 border-b flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Secure Chat</h3>
            <button
              onClick={() => setShowChatModal(false)}
              className="p-2 rounded-lg"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm">
                  DC
                </div>
                <div className="bg-slate-100 rounded-lg p-3">
                  <p className="text-sm">How can we help?</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type message..."
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <button className="px-6 py-2 bg-[#0A54C2] hover:bg-[#1571C2] text-white rounded-lg">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <nav className="bg-[#0A54C2] shadow-md rounded-lg max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-28 h-10 rounded-lg flex items-center justify-center">
                <img
                  src="/images/logo-primary.png"
                  alt="App Logo"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <span className="header-title ml-3 text-white">
                {currentView === "patient-portal" ? "Patient Portal" : "Office"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* <select
                value={currentView}
                onChange={(e) => setCurrentView(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="patient-portal">Patient Portal</option>
                <option value="office-dashboard">Office Dashboard</option>
              </select> */}
              <button className="p-2  rounded-lg relative text-white">
                <Bell className="w-5 h-5 text-white" />
                {currentView === "patient-portal" &&
                  patientData.messages.filter((m) => m.unread).length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
              </button>
              <button className="p-2 rounded-lg text-white">
                <LogOut className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "patient-portal" ? (
          <>
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === "overview"
                    ? "bg-[#0A54C2] hover:bg-[#1571C2] text-white "
                    : "bg-white text-slate-700"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("messages")}
                className={`px-4 py-2 rounded-lg font-medium relative ${
                  activeTab === "messages"
                    ? "bg-[#0A54C2] text-white"
                    : "bg-white text-slate-700"
                }`}
              >
                Messages
                {patientData.messages.filter((m) => m.unread).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                    {patientData.messages.filter((m) => m.unread).length}
                  </span>
                )}
              </button>
            </div>
            {activeTab === "overview" && renderPatientOverview()}
            {activeTab === "messages" && renderPatientMessages()}
          </>
        ) : (
          renderOfficeDashboard()
        )}
      </div>

      {renderAppointmentModal()}
      {renderPaymentModal()}
      {renderCardModal()}
      {renderChatModal()}
      {renderClaimDetailsModal()}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Assign Room</h3>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {officeData.rooms
                .filter((r) => r.status === "available")
                .map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedPatient(null)}
                    className="w-full p-4 border-2 rounded-lg hover:border-teal-500"
                  >
                    {room.name}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DentalManagementSystem;
