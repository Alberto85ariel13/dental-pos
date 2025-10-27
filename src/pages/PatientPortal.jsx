import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, FileText, MessageSquare, User, Bell, LogOut, CreditCard, Plus, Video, Search, CheckCircle, Users, Home, Send, Edit, X, Star, TrendingUp, CheckSquare, Mail, Smartphone, AlertTriangle, RefreshCw, Filter, ChevronRight } from 'lucide-react';

const DentalManagementSystem = () => {
  const [currentView, setCurrentView] = useState('patient-portal');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showClaimDetailsModal, setShowClaimDetailsModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [scheduleView, setScheduleView] = useState('today');
  const [slotDuration, setSlotDuration] = useState(30);
  const [savedCards] = useState([
    { id: 1, last4: '4242', brand: 'Visa', expiry: '12/26', isDefault: true, status: 'active' },
    { id: 2, last4: '5555', brand: 'Mastercard', expiry: '03/27', isDefault: false, status: 'failed' }
  ]);
  
  const patientData = {
    name: "Sarah Johnson",
    balance: 385.00,
    nextAppointment: {
      date: "Oct 25, 2025",
      time: "10:30 AM",
      provider: "Dr. Michael Chen",
      type: "Routine Checkup",
      estimatedCost: 150
    },
    claims: [
      { id: 1, date: "Sep 15, 2025", procedure: "Root Canal", amount: 1200, insurancePaid: 900, patientOwes: 300, status: "partially_covered", reason: "Insurance covered 75% - maximum benefit reached" },
      { id: 2, date: "Aug 20, 2025", procedure: "Crown", amount: 150, insurancePaid: 65, patientOwes: 85, status: "pending", reason: "Claim pending insurance review - expected response in 7 days" }
    ],
    autopayEnrolled: true,
    autopayFailing: true,
    failedPaymentReason: "Card expired - please update payment method",
    messages: [
      { id: 1, from: "Dr. Chen's Office", subject: "Appointment Confirmation", message: "Your appointment is confirmed for Oct 25 at 10:30 AM", date: "Oct 18, 2025", time: "2:30 PM", unread: true },
      { id: 2, from: "Billing Department", subject: "Payment Received", message: "Thank you for your payment of $150", date: "Oct 15, 2025", time: "11:00 AM", unread: true },
      { id: 3, from: "Dr. Chen's Office", subject: "Insurance Update", message: "Your insurance claim has been processed", date: "Oct 10, 2025", time: "3:45 PM", unread: false }
    ],
    upcomingRecommendations: [
      { id: 1, type: "6-Month Cleaning", dueDate: "Nov 15, 2025", provider: "Dr. Chen", priority: "high" },
      { id: 2, type: "Annual Checkup", dueDate: "Dec 1, 2025", provider: "Dr. Park", priority: "medium" }
    ]
  };

  const providers = [
    { id: 1, name: "Dr. Michael Chen", specialty: "General Dentistry", slotDuration: 30, color: "blue" },
    { id: 2, name: "Dr. Lisa Park", specialty: "Orthodontics", slotDuration: 60, color: "purple" }
  ];

  const generateTestAppointments = (day) => {
    const patients = ["Sarah Johnson", "John Smith", "Maria Garcia", "David Brown", "Emily Wilson", "Robert Taylor", "Lisa Anderson", "Michael Lee", "Jessica Martinez", "Christopher Davis", "Amanda Rodriguez", "Daniel Thompson", "Michelle White", "James Harris", "Karen Clark", "Steven Lewis", "Nancy Walker", "Kevin Young", "Laura Hall", "Brian Allen"];
    const types = ["Checkup", "Cleaning", "Filling", "Crown", "Root Canal", "Extraction", "Consultation", "Emergency", "Follow-up", "Whitening"];
    const statuses = ["scheduled", "confirmed", "waiting", "in-progress", "completed"];
    const reasons = ["6-month checkup", "Tooth pain", "Cavity filling", "Crown placement", "Routine cleaning", "Consultation", "Emergency visit", "Follow-up visit"];
    
    const appointments = [];
    const baseHour = 9;
    const slots = 20;
    
    for (let i = 0; i < slots; i++) {
      const hour = baseHour + Math.floor(i / 2);
      const minute = (i % 2) * 30;
      const time = `${hour > 12 ? hour - 12 : hour}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
      const provider = providers[Math.floor(Math.random() * providers.length)];
      
      appointments.push({
        id: day === 'tomorrow' ? i + 100 : i,
        time,
        patient: patients[i % patients.length],
        provider: provider.name,
        providerColor: provider.color,
        type: types[Math.floor(Math.random() * types.length)],
        status: day === 'tomorrow' ? 'scheduled' : statuses[Math.floor(Math.random() * statuses.length)],
        room: statuses[2] === 'waiting' || statuses[3] === 'in-progress' ? `Room ${Math.floor(Math.random() * 4) + 1}` : null,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        estimatedCost: Math.floor(Math.random() * 1000) + 100,
        paymentStatus: Math.random() > 0.5 ? 'paid' : 'pending'
      });
    }
    
    return appointments;
  };

  const officeData = {
    todayAppointments: generateTestAppointments('today'),
    tomorrowAppointments: generateTestAppointments('tomorrow'),
    openRequests: [
      { id: 1, patient: "Angela Martinez", requestedDate: "Oct 25, 2025", preferredTime: "Morning", type: "Cleaning", requestDate: "Oct 18, 2025", phone: "(555) 123-4567" },
      { id: 2, patient: "Thomas Wright", requestedDate: "Oct 26, 2025", preferredTime: "Afternoon", type: "Consultation", requestDate: "Oct 19, 2025", phone: "(555) 234-5678" },
      { id: 3, patient: "Rebecca Hill", requestedDate: "Oct 27, 2025", preferredTime: "Any", type: "Emergency", requestDate: "Oct 19, 2025", phone: "(555) 345-6789", urgent: true }
    ],
    rooms: [
      { id: 1, name: "Room 1", status: "occupied", patient: "John Smith" },
      { id: 2, name: "Room 2", status: "available", patient: null },
      { id: 3, name: "Room 3", status: "cleaning", patient: null },
      { id: 4, name: "Room 4", status: "available", patient: null }
    ],
    stats: { todayAppointments: 20, checkedIn: 12, completed: 8, revenue: 4850, openRequests: 3 },
    recommendations: [
      { id: 1, patient: "Sarah Johnson", type: "6-Month Cleaning", dueDate: "2025-11-15", lastVisit: "2025-05-15", priority: "high", status: "pending" },
      { id: 2, patient: "John Smith", type: "Follow-up", dueDate: "2025-11-01", lastVisit: "2025-10-19", priority: "medium", status: "pending" }
    ]
  };

  const renderPatientOverview = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Welcome, {patientData.name}!</h2>
        <p className="text-teal-100">Your dental health dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Next Appointment</p>
              <p className="text-2xl font-bold text-slate-800">{patientData.nextAppointment.date}</p>
              <p className="text-slate-600 text-sm">{patientData.nextAppointment.time}</p>
            </div>
            <Calendar className="w-12 h-12 text-teal-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500 cursor-pointer" onClick={() => setShowClaimDetailsModal(true)}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Outstanding Balance</p>
              <p className="text-2xl font-bold text-red-600">${patientData.balance.toFixed(2)}</p>
              {patientData.autopayFailing && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-xs text-red-600 font-medium">Autopay Failed</span>
                </div>
              )}
              <button className="text-red-600 text-sm hover:underline mt-1 flex items-center gap-1">
                View Details <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <DollarSign className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 cursor-pointer" onClick={() => setActiveTab('messages')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">New Messages</p>
              <p className="text-2xl font-bold text-slate-800">{patientData.messages.filter(m => m.unread).length}</p>
              <button className="text-purple-600 text-sm hover:underline mt-1">View All</button>
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
              <h3 className="text-lg font-bold text-red-800 mb-2">Action Required: Autopay Failed</h3>
              <p className="text-red-700 mb-3">{patientData.failedPaymentReason}</p>
              <div className="flex gap-3">
                <button onClick={() => setShowCardModal(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Update Payment Method
                </button>
                <button onClick={() => setShowPaymentModal(true)} className="px-4 py-2 bg-white border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50">
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
            {patientData.upcomingRecommendations.map(rec => (
              <div key={rec.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-800">{rec.type}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">Due: {rec.dueDate}</p>
                </div>
                <button 
                  onClick={() => setShowAppointmentModal(true)}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Payment Methods</h3>
        <div className="space-y-3">
          {savedCards.map(card => (
            <div key={card.id} className={`flex items-center justify-between p-4 border-2 rounded-lg ${
              card.status === 'failed' ? 'border-red-300 bg-red-50' : 'border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <CreditCard className={`w-8 h-8 ${card.status === 'failed' ? 'text-red-600' : 'text-slate-600'}`} />
                <div>
                  <p className="font-medium text-slate-800">{card.brand} •••• {card.last4}</p>
                  <p className="text-sm text-slate-600">Expires {card.expiry}</p>
                  {card.status === 'failed' && (
                    <p className="text-xs text-red-600 font-medium mt-1">Payment failed - Update required</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {card.isDefault && (
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">Default</span>
                )}
                {card.status === 'failed' && (
                  <button onClick={() => setShowCardModal(true)} className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700">
                    Update
                  </button>
                )}
              </div>
            </div>
          ))}
          <button onClick={() => setShowCardModal(true)} className="text-teal-600 hover:text-teal-700 flex items-center gap-1 mt-2">
            <Plus className="w-4 h-4" />
            Add Card
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={() => setShowAppointmentModal(true)} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center">
          <Plus className="w-8 h-8 text-teal-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">Book Appointment</p>
        </button>
        <button onClick={() => setShowPaymentModal(true)} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center">
          <CreditCard className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">Make Payment</p>
        </button>
        <button onClick={() => setShowChatModal(true)} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center">
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
          {patientData.messages.map(msg => (
            <div 
              key={msg.id}
              className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                msg.unread ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'
              }`}
              onClick={() => setShowChatModal(true)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-slate-800">{msg.from}</h3>
                    {msg.unread && (
                      <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs font-medium">New</span>
                    )}
                  </div>
                  <p className="font-medium text-slate-700 mb-1">{msg.subject}</p>
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
          <p className="text-3xl font-bold text-slate-800">{officeData.stats.todayAppointments}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-slate-600 text-sm mb-1">Checked In</p>
          <p className="text-3xl font-bold text-slate-800">{officeData.stats.checkedIn}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <p className="text-slate-600 text-sm mb-1">Completed</p>
          <p className="text-3xl font-bold text-slate-800">{officeData.stats.completed}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <p className="text-slate-600 text-sm mb-1">Open Requests</p>
          <p className="text-3xl font-bold text-slate-800">{officeData.stats.openRequests}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <p className="text-slate-600 text-sm mb-1">Revenue</p>
          <p className="text-3xl font-bold text-slate-800">${officeData.stats.revenue}</p>
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
                {providers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <button 
                onClick={() => setShowAppointmentModal(true)}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setScheduleView('today')}
              className={`px-4 py-2 rounded-lg font-medium ${scheduleView === 'today' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-700'}`}
            >
              Today ({officeData.todayAppointments.length})
            </button>
            <button
              onClick={() => setScheduleView('tomorrow')}
              className={`px-4 py-2 rounded-lg font-medium ${scheduleView === 'tomorrow' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-700'}`}
            >
              Tomorrow ({officeData.tomorrowAppointments.length})
            </button>
            <button
              onClick={() => setScheduleView('requests')}
              className={`px-4 py-2 rounded-lg font-medium ${scheduleView === 'requests' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-700'}`}
            >
              Open Requests ({officeData.openRequests.length})
            </button>
          </div>

          <div className="max-h-[600px] overflow-y-auto space-y-2">
            {scheduleView === 'requests' ? (
              officeData.openRequests.map(req => (
                <div key={req.id} className={`border-2 rounded-lg p-4 ${req.urgent ? 'border-red-300 bg-red-50' : 'border-orange-300 bg-orange-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-slate-800">{req.patient}</p>
                        {req.urgent && (
                          <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium">URGENT</span>
                        )}
                        <span className="px-2 py-1 bg-orange-500 text-white rounded-full text-xs font-medium">Open Request</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mb-2">
                        <p><strong>Requested:</strong> {req.requestedDate}</p>
                        <p><strong>Time Pref:</strong> {req.preferredTime}</p>
                        <p><strong>Type:</strong> {req.type}</p>
                        <p><strong>Phone:</strong> {req.phone}</p>
                      </div>
                      <p className="text-xs text-slate-500">Requested on {req.requestDate}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowAppointmentModal(true)}
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
            ) : (
              (scheduleView === 'today' ? officeData.todayAppointments : officeData.tomorrowAppointments)
                .filter(apt => selectedProvider === 'all' || apt.provider === providers.find(p => p.id.toString() === selectedProvider)?.name)
                .map(apt => (
                <div key={apt.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-1 h-12 rounded ${apt.providerColor === 'blue' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-sm text-slate-800">{apt.time}</p>
                          <p className="font-bold text-slate-800">{apt.patient}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                            apt.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                            apt.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                            apt.status === 'confirmed' ? 'bg-teal-100 text-teal-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{apt.provider} • {apt.type} • {apt.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {scheduleView === 'today' && apt.status === 'scheduled' && (
                        <button className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">
                          Check In
                        </button>
                      )}
                      {apt.status === 'waiting' && (
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
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Rooms</h3>
          <div className="space-y-3">
            {officeData.rooms.map(room => (
              <div key={room.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-sm text-slate-800">{room.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    room.status === 'occupied' ? 'bg-red-100 text-red-700' :
                    room.status === 'cleaning' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
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
              <h3 className="text-2xl font-bold text-slate-800">Balance Details</h3>
              <p className="text-sm text-slate-600">Outstanding balance breakdown</p>
            </div>
            <button onClick={() => setShowClaimDetailsModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Total Outstanding</p>
              <p className="text-3xl font-bold text-red-600">${patientData.balance.toFixed(2)}</p>
            </div>

            {patientData.autopayEnrolled && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-blue-800">Autopay Status</h4>
                </div>
                {patientData.autopayFailing ? (
                  <div>
                    <p className="text-sm text-red-700 mb-2"><strong>Status:</strong> Failed</p>
                    <p className="text-sm text-red-700 mb-3">{patientData.failedPaymentReason}</p>
                    <button onClick={() => {
                      setShowClaimDetailsModal(false);
                      setShowCardModal(true);
                    }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                      Update Payment Method
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-blue-700">Autopay is active and will process on the 1st of each month</p>
                )}
              </div>
            )}

            <div>
              <h4 className="text-lg font-bold text-slate-800 mb-4">Claims & Charges</h4>
              <div className="space-y-4">
                {patientData.claims.map(claim => (
                  <div key={claim.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-bold text-slate-800">{claim.procedure}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            claim.status === 'partially_covered' ? 'bg-yellow-100 text-yellow-700' :
                            claim.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {claim.status === 'partially_covered' ? 'Partially Covered' :
                             claim.status === 'pending' ? 'Pending' : 'Approved'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{claim.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">You Owe</p>
                        <p className="text-2xl font-bold text-red-600">${claim.patientOwes}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 p-3 bg-slate-50 rounded-lg mb-3">
                      <div>
                        <p className="text-xs text-slate-600">Total Charge</p>
                        <p className="font-bold text-slate-800">${claim.amount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Insurance Paid</p>
                        <p className="font-bold text-green-600">${claim.insurancePaid}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Your Responsibility</p>
                        <p className="font-bold text-red-600">${claim.patientOwes}</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                      <p className="text-sm text-blue-800"><strong>Explanation:</strong> {claim.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
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
              Pay ${patientData.balance.toFixed(2)}
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
          <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
            <h3 className="text-2xl font-bold text-slate-800">Book Appointment</h3>
            <button onClick={() => setShowAppointmentModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Provider</label>
              <select className="w-full px-4 py-2 border rounded-lg">
                {providers.map(p => (
                  <option key={p.id}>{p.name} - {p.specialty}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Appointment Type</label>
              <select className="w-full px-4 py-2 border rounded-lg">
                <option>Routine Checkup</option>
                <option>Cleaning</option>
                <option>Filling</option>
                <option>Crown</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Reason for Visit</label>
              <textarea rows="3" className="w-full px-4 py-2 border rounded-lg" placeholder="Describe reason..."></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                <input type="date" className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Time</label>
                <select className="w-full px-4 py-2 border rounded-lg">
                  <option>9:00 AM</option>
                  <option>10:00 AM</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Estimated Cost</p>
                <p className="text-xl font-bold">$150</p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" />
                Pay now and save 5%
              </label>
            </div>
          </div>

          <div className="p-6 border-t flex gap-3">
            <button onClick={() => setShowAppointmentModal(false)} className="flex-1 px-4 py-2 border rounded-lg">
              Cancel
            </button>
            <button className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg">
              Book
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
          <div className="p-6 border-b">
            <h3 className="text-2xl font-bold text-slate-800">Make Payment</h3>
          </div>

          <div className="p-6 space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Amount Due</p>
              <p className="text-3xl font-bold text-slate-800">${patientData.balance.toFixed(2)}</p>
            </div>

            {savedCards.map(card => (
              <div key={card.id} className={`flex items-center justify-between p-4 border-2 rounded-lg ${
                card.status === 'failed' ? 'border-red-300 opacity-50' : 'border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="card" disabled={card.status === 'failed'} defaultChecked={card.isDefault && card.status !== 'failed'} />
                  <CreditCard className="w-6 h-6" />
                  <div>
                    <p className="font-medium">{card.brand} •••• {card.last4}</p>
                    {card.status === 'failed' && (
                      <p className="text-xs text-red-600">Card expired</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t flex gap-3">
            <button onClick={() => setShowPaymentModal(false)} className="flex-1 px-4 py-2 border rounded-lg">
              Cancel
            </button>
            <button className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg">
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
            <button onClick={() => setShowCardModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Card Number</label>
              <input type="text" placeholder="1234 5678 9012 3456" className="w-full px-4 py-2 border rounded-lg" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Expiry</label>
                <input type="text" placeholder="MM/YY" className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">CVV</label>
                <input type="text" placeholder="123" className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Set as default</span>
            </label>
          </div>

          <div className="p-6 border-t flex gap-3">
            <button onClick={() => setShowCardModal(false)} className="flex-1 px-4 py-2 border rounded-lg">
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
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">Secure Chat</h3>
            <button onClick={() => setShowChatModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5" />
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
              <input type="text" placeholder="Type message..." className="flex-1 px-4 py-2 border rounded-lg" />
              <button className="px-6 py-2 bg-teal-500 text-white rounded-lg">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                D
              </div>
              <span className="ml-3 text-xl font-bold text-slate-800">
                {currentView === 'patient-portal' ? 'Patient Portal' : 'Office'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <select 
                value={currentView}
                onChange={(e) => setCurrentView(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="patient-portal">Patient Portal</option>
                <option value="office-dashboard">Office Dashboard</option>
              </select>
              <button className="p-2 hover:bg-slate-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-slate-600" />
                {currentView === 'patient-portal' && patientData.messages.filter(m => m.unread).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg">
                <LogOut className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'patient-portal' ? (
          <>
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'overview' ? 'bg-teal-500 text-white' : 'bg-white text-slate-700'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`px-4 py-2 rounded-lg font-medium relative ${activeTab === 'messages' ? 'bg-teal-500 text-white' : 'bg-white text-slate-700'}`}
              >
                Messages
                {patientData.messages.filter(m => m.unread).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                    {patientData.messages.filter(m => m.unread).length}
                  </span>
                )}
              </button>
            </div>
            {activeTab === 'overview' && renderPatientOverview()}
            {activeTab === 'messages' && renderPatientMessages()}
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
              <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {officeData.rooms.filter(r => r.status === 'available').map(room => (
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