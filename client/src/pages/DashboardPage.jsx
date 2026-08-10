import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import RestaurantDashboardComponent from '../components/RestaurantDashboardComponent';
import StationeryDashboardComponent from '../components/stationery/StationeryDashboardComponent';
import { isStationeryWorkspace } from '../config/workspaceFeatures';
import {
  TrendingUp,
  Clock,
  FileText,
  Sparkles,
  Plus,
  ArrowUpRight,
  ChevronRight,
  MessageSquare,
  Send,
  Brain,
  Activity,
  CheckCircle2,
  AlertTriangle,
  X,
  Gauge,
  UserCheck,
  Users,
  Scissors,
  CreditCard,
  Star,
  BarChart3,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Badge, Card } from '../components/ui/Badge';

export default function DashboardPage() {
  const { metrics, invoices, customers, aiInsights, company } = useBusiness();
  const { user, activeWorkspace, business } = useAuth();
  const navigate = useNavigate();

  const biz = business || activeWorkspace;
  if (isStationeryWorkspace(biz)) {
    return <StationeryDashboardComponent />;
  }

  const businessType = activeWorkspace?.businessType || 'general';
  const recent = (invoices || []).slice(0, 5);

  // Salon Demo States
  const [salonSchedule, setSalonSchedule] = useState(() => {
    const saved = localStorage.getItem('salon_schedule');
    return saved ? JSON.parse(saved) : [
      { id: 1, time: '10:00 AM', client: 'Priya Patel', service: 'Haircut + Blow Dry', stylist: 'Riya', status: 'Confirmed', price: 1200 },
      { id: 2, time: '11:30 AM', client: 'Meera Shah', service: 'Hair Color', stylist: 'Anjali', status: 'In Progress', price: 3500 },
      { id: 3, time: '01:00 PM', client: 'Walk-in Slot', service: 'Available Slot', stylist: 'Unassigned', status: 'Available', price: 0 },
      { id: 4, time: '02:15 PM', client: 'Nisha Mehta', service: 'Keratin Treatment', stylist: 'Riya', status: 'Confirmed', price: 5500 },
      { id: 5, time: '04:00 PM', client: 'Bridal Trial', service: 'Bridal Styling', stylist: 'Senior Stylist', status: 'Completed', price: 7999 },
    ];
  });

  const [salonWalkins, setSalonWalkins] = useState(() => {
    const saved = localStorage.getItem('salon_walkins');
    return saved ? Number(saved) : 7;
  });

  const [salonRevenue, setSalonRevenue] = useState(() => {
    const saved = localStorage.getItem('salon_revenue');
    return saved ? Number(saved) : 18450;
  });

  const [salonRecentPayments, setSalonRecentPayments] = useState(() => {
    const saved = localStorage.getItem('salon_recent_payments');
    return saved ? JSON.parse(saved) : [
      { client: 'Priya Patel', service: 'Haircut', amount: '₹850' },
      { client: 'Meera Shah', service: 'Hair Color', amount: '₹3,200' },
      { client: 'Nisha Mehta', service: 'Keratin', amount: '₹5,500' },
    ];
  });

  const [checkInOpen, setCheckInOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleUpdateStatus = (id, newStatus) => {
    const updated = salonSchedule.map((s) => s.id === id ? { ...s, status: newStatus } : s);
    setSalonSchedule(updated);
    localStorage.setItem('salon_schedule', JSON.stringify(updated));
    setToastMessage(`Appointment marked as ${newStatus}`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCheckInSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const clientName = data.get('clientName');
    const phone = data.get('phone');
    const time = data.get('time');
    const stylist = data.get('stylist');
    const service = data.get('service');
    const isWalkIn = data.get('isWalkIn') === 'on';

    const prices = {
      'Haircut + Blow Dry': 1200,
      'Hair Color': 3500,
      'Keratin Treatment': 5500,
      'Hydrating Facial': 1500,
      'Beard Trim & Wash': 950
    };

    const newAppt = {
      id: Date.now(),
      time,
      client: clientName,
      phone,
      service,
      stylist,
      status: 'In Progress',
      price: prices[service] || 800
    };

    const updatedSchedule = [newAppt, ...salonSchedule];
    setSalonSchedule(updatedSchedule);
    localStorage.setItem('salon_schedule', JSON.stringify(updatedSchedule));

    if (isWalkIn) {
      const nextWalkins = salonWalkins + 1;
      setSalonWalkins(nextWalkins);
      localStorage.setItem('salon_walkins', String(nextWalkins));
    }

    setToastMessage('Client checked in successfully');
    setCheckInOpen(false);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Bizz AI States
  const [briefing, setBriefing] = useState(null);
  const [healthScore, setHealthScore] = useState(metrics?.healthScore || 95);
  const [healthBreakdown, setHealthBreakdown] = useState([]);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Chat States
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: `Hi! I'm Bizz, your AI assistant. Ask me anything about your ${businessType} metrics.` }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    async function loadBriefing() {
      try {
        const data = await api('/bizz/briefing');
        if (data && data.briefing) {
          setBriefing(data.briefing);
          setHealthScore(data.healthScore);
          setHealthBreakdown(data.breakdown);
        }
      } catch (err) {
        console.error("Failed to load Bizz briefing:", err);
      }
    }
    loadBriefing();
  }, []);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const msg = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    setChatLoading(true);
    try {
      const res = await api('/bizz/chat', {
        method: 'POST',
        body: JSON.stringify({ message: msg })
      });
      setChatHistory(prev => [...prev, { role: 'assistant', text: res.reply }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', text: "Sorry, I couldn't reach the AI server. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const industryHint = {
    salon: 'Appointments, walk-ins, and stylist utilization are enabled for this salon business.',
    restaurant: 'Kitchen, tables, and order widgets are available for this restaurant business.',
    cafe: 'Orders, takeaway, and peak-hour analytics are tailored for this cafe business.',
    retail: 'POS, stock alerts, and sales widgets are active for this retail business.',
    manufacturing: 'Production orders, machines, and QC widgets are enabled for this manufacturing business.',
    stationery: 'Retail billing, wholesale, and school orders are enabled for this stationery business.',
    general: null,
  }[businessType];

  const monthlyTrendData = [
    { month: 'Mar', revenue: 280000 },
    { month: 'Apr', revenue: 320000 },
    { month: 'May', revenue: 390000 },
    { month: 'Jun', revenue: 410000 },
    { month: 'Jul', revenue: metrics.totalRevenue || 485000 },
    { month: 'Aug', revenue: Math.round((metrics.totalRevenue || 485000) * 1.12) },
  ];

  const invoicePieData = [
    { name: 'Paid', value: invoices.filter((i) => i.status === 'paid').length || 1, color: '#2F5D50' },
    { name: 'Pending', value: invoices.filter((i) => i.status === 'pending').length || 1, color: '#F6D97A' },
    { name: 'Overdue', value: invoices.filter((i) => i.status === 'overdue').length || 1, color: '#A7C4A0' },
  ];

  const kpis = [
    {
      label: 'Paid revenue',
      value: `₹${metrics.totalRevenue.toLocaleString('en-IN')}`,
      hint: 'Collected this period',
      icon: TrendingUp,
      tint: 'bg-green-sage/25 text-green-bottle',
      onClick: null
    },
    {
      label: 'Receivables',
      value: `₹${metrics.pendingRevenue.toLocaleString('en-IN')}`,
      hint: `${metrics.pendingInvoicesCount} open invoices`,
      icon: Clock,
      tint: 'bg-yellow-champagne text-mustard',
      onClick: null
    },
    {
      label: 'Net profit',
      value: `₹${metrics.netProfit.toLocaleString('en-IN')}`,
      hint: 'Revenue − expenses',
      icon: FileText,
      tint: 'bg-cream text-green-forest',
      onClick: null
    },
    {
      label: 'Health score',
      value: `${healthScore}`,
      hint: 'Click to expand scorecard breakdown',
      icon: Sparkles,
      tint: 'bg-yellow-butter/40 text-green-bottle cursor-pointer hover:scale-105 transition-transform duration-[220ms]',
      onClick: () => setShowBreakdown(!showBreakdown)
    },
  ];

  if (businessType === 'restaurant') {
    return <RestaurantDashboardComponent />;
  }

  if (businessType === 'salon') {
    // Dynamic calculations from live context and storage
    const todayDateFormatted = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const salonName = company?.name || 'Glow Salon Studio';
    const dailyTarget = company?.dailyRevenueTarget || 25000;

    // Load active stylists list
    const savedStylists = localStorage.getItem('salon_stylists');
    const stylistsList = savedStylists ? JSON.parse(savedStylists) : [
      { name: 'Riya Sharma', rating: '4.9★' },
      { name: 'Anjali', rating: '4.8★' },
      { name: 'Kavya', rating: '4.7★' },
    ];

    // Load active customer list
    const combinedCustomers = [
      ...(customers || []),
      ...(JSON.parse(localStorage.getItem('salon_customers') || '[]'))
    ];

    // KPIs
    const activeSchedule = salonSchedule.filter(s => s.status !== 'Available');
    const todayApptsCount = activeSchedule.length;
    const upcomingApptsCount = salonSchedule.filter(s => s.status === 'Confirmed' || s.status === 'Pending').length;
    
    const walkinsCount = salonSchedule.filter(s => s.isWalkIn || s.bookingSource === 'Walk-in').length || salonWalkins;
    
    // Staff Utilization
    const totalStylistsCount = Math.max(1, stylistsList.length);
    const busyStylistsCount = salonSchedule.filter(s => s.status === 'In Progress').length;
    const utilizationPercent = Math.min(100, Math.round((busyStylistsCount / totalStylistsCount) * 100));

    // Stylist Performance Stats calculation
    const stylistStatsMap = {};
    stylistsList.forEach(st => {
      stylistStatsMap[st.name] = { name: st.name, bookings: 0, revenue: 0, rating: st.rating || '4.8★' };
    });

    salonSchedule.forEach(s => {
      if (s.stylist && s.status !== 'Cancelled' && s.status !== 'Available') {
        const sName = s.stylist;
        if (!stylistStatsMap[sName]) {
          stylistStatsMap[sName] = { name: sName, bookings: 0, revenue: 0, rating: '4.8★' };
        }
        stylistStatsMap[sName].bookings += 1;
        if (s.status === 'Completed') {
          stylistStatsMap[sName].revenue += (s.price || 0);
        }
      }
    });

    const stylistPerformance = Object.values(stylistStatsMap);
    const topStylist = stylistPerformance.reduce((max, cur) => (cur.bookings > (max?.bookings || 0) ? cur : max), null);

    // Insights: Popular Service & Combo
    const serviceCounts = {};
    salonSchedule.forEach(s => {
      if (s.service && s.status !== 'Available') {
        serviceCounts[s.service] = (serviceCounts[s.service] || 0) + 1;
      }
    });

    const topService = Object.keys(serviceCounts).reduce((a, b) => serviceCounts[a] > serviceCounts[b] ? a : b, 'Hair Spa + Haircut');
    
    // Popular Services breakdown
    const totalServiceBookings = Object.values(serviceCounts).reduce((a, b) => a + b, 0) || 1;
    const popularServicesList = Object.keys(serviceCounts).length > 0
      ? Object.entries(serviceCounts).map(([name, count]) => ({
          name,
          percent: Math.round((count / totalServiceBookings) * 100),
          color: name.includes('Color') ? 'bg-blue-500' : name.includes('Spa') ? 'bg-yellow-butter' : 'bg-green-bottle'
        }))
      : [
          { name: 'Haircut', percent: 42, color: 'bg-green-bottle' },
          { name: 'Hair Color', percent: 28, color: 'bg-blue-500' },
          { name: 'Hair Spa', percent: 18, color: 'bg-yellow-butter' },
          { name: 'Manicure', percent: 12, color: 'bg-purple-500' },
        ];

    // Upcoming Birthdays from Customer List
    const upcomingBirthdays = combinedCustomers
      .filter(c => c.dob)
      .slice(0, 3)
      .map(c => ({ name: c.name, phone: c.phone, date: c.dob }));

    const defaultBirthdays = [
      { name: 'Neha Joshi', phone: '9824249704', date: '12 Aug' },
      { name: 'Pooja Shah', phone: '9876543210', date: '15 Aug' },
    ];

    const birthdaysToShow = upcomingBirthdays.length > 0 ? upcomingBirthdays : defaultBirthdays;

    const handleSendBirthdayOffer = (client) => {
      const phone = (client.phone || '9824249704').replace(/\D/g, '');
      const msg = `Happy Birthday ${client.name} from ${salonName}! 🎉%0AEnjoy a special salon offer on your birthday. Book your appointment today!`;
      window.open(`https://wa.me/91${phone}?text=${msg}`, '_blank');
      setToastMessage(`Birthday offer opened for ${client.name}`);
      setTimeout(() => setToastMessage(''), 3000);
    };

    const handleSendReminder = (appt) => {
      const phone = (appt.phone || '9824249704').replace(/\D/g, '');
      const msg = `Hello ${appt.client}, this is a reminder from ${salonName} for your appointment today at ${appt.time} with ${appt.stylist || 'our team'}.`;
      window.open(`https://wa.me/91${phone}?text=${msg}`, '_blank');
      setToastMessage(`Appointment reminder opened for ${appt.client}`);
      setTimeout(() => setToastMessage(''), 3000);
    };

    const handlePromoteCombo = () => {
      const text = `✨ ${salonName} Special ✨\nEnjoy our ${topService} at an exclusive rate!\nBook your appointment today!`;
      navigator.clipboard.writeText(text);
      setToastMessage(`Promotional text for ${topService} copied to clipboard!`);
      setTimeout(() => setToastMessage(''), 3000);
    };

    return (
      <div className="space-y-8 relative pb-10">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-[100] bg-green-bottle text-white px-4 py-3 rounded-xl shadow-elev text-xs font-semibold flex items-center gap-2 border border-green-forest/20 animate-fade-in">
            <CheckCircle2 className="w-4.5 h-4.5" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-5"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-green-forest">{salonName}</p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-charcoal">
              Good day, {salonName}
            </h1>
            <p className="text-sm text-warm-gray">Today: {todayDateFormatted}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 text-xs w-full md:w-auto">
            <Button variant="outline" onClick={() => navigate('/app/appointments')} className="flex items-center justify-center gap-1.5 px-4 py-2.5">
              + New Appointment
            </Button>
            <Button variant="outline" onClick={() => navigate('/app/billing')} className="flex items-center justify-center gap-1.5 px-4 py-2.5">
              + New Bill
            </Button>
            <Button className="bg-[#EFCF63] text-black hover:bg-[#e5c44f] flex items-center justify-center gap-1.5 px-4 py-2.5 shadow-yellow font-bold border-none" onClick={() => setCheckInOpen(true)}>
              Check-in Client
            </Button>
          </div>
        </motion.div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Today's Appointments Card */}
          <div
            onClick={() => navigate('/app/appointments')}
            className="bz-kpi border-l-4 border-green-bottle cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium text-warm-gray">Today’s Appointments</p>
              <div className="w-8 h-8 rounded-[10px] bg-green-sage/25 text-green-bottle flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-charcoal">
              {todayApptsCount}
            </p>
            <p className="mt-1.5 text-[11px] text-green-forest font-semibold">
              {todayApptsCount > 0 ? `${upcomingApptsCount} upcoming today` : 'No appointments today'}
            </p>
          </div>

          {/* Walk-ins Card */}
          <div
            onClick={() => navigate('/app/appointments')}
            className="bz-kpi border-l-4 border-blue-500 cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium text-warm-gray">Walk-ins Today</p>
              <div className="w-8 h-8 rounded-[10px] bg-blue-50/50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-charcoal">{walkinsCount}</p>
            <p className="mt-1.5 text-[11px] text-blue-600 font-semibold">New today</p>
          </div>

          {/* Today's Revenue Card */}
          <div
            onClick={() => navigate('/app/billing')}
            className="bz-kpi border-l-4 border-yellow-butter cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium text-warm-gray">Today’s Revenue</p>
              <div className="w-8 h-8 rounded-[10px] bg-yellow-champagne text-mustard flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-charcoal">₹{salonRevenue.toLocaleString('en-IN')}</p>
            <p className="mt-1.5 text-[11px] text-warm-gray font-medium">Target: ₹{dailyTarget.toLocaleString('en-IN')}</p>
          </div>

          {/* Staff Utilization Card */}
          <div
            onClick={() => navigate('/app/stylists')}
            className="bz-kpi border-l-4 border-purple-500 cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium text-warm-gray">Staff Utilization</p>
              <div className="w-8 h-8 rounded-[10px] bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-charcoal">{utilizationPercent}%</p>
            <p className="mt-1.5 text-[11px] text-purple-600 font-semibold">{busyStylistsCount} of {totalStylistsCount} stylists busy</p>
          </div>
        </div>

        {/* Salon Operations Insights */}
        <div className="relative overflow-hidden rounded-[20px] border border-stone bg-gradient-to-r from-cream/40 via-white to-cream/20 p-5 sm:p-6 shadow-subtle flex flex-col md:flex-row gap-5 items-start">
          <div className="w-12 h-12 rounded-[16px] bg-green-bottle/10 border border-green-bottle/20 flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6 text-green-bottle animate-pulse" />
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-green-bottle">Salon Operations Insights</span>
              <ul className="mt-2.5 space-y-2 text-sm text-charcoal">
                <li className="flex items-center gap-2">⏱️ Peak hours today: <strong className="text-green-forest">11 AM – 2 PM</strong></li>
                <li className="flex items-center gap-2">
                  ⭐ Stylist booking alert: <strong>{topStylist?.name || 'Riya Sharma'}</strong> has the highest booking rate today ({topStylist?.bookings || 0} bookings).
                </li>
                <li className="flex items-center gap-2">
                  🔥 Marketing suggestion: <strong>{topService}</strong> is your top-performing service.
                </li>
                <li className="flex items-center gap-2">
                  ⚠️ Client retention: <strong>3 returning clients</strong> scheduled for follow-ups this week.
                </li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-2 text-xs pt-1">
              <button
                onClick={() => {
                  const firstUpcoming = salonSchedule.find(s => s.status === 'Confirmed' || s.status === 'Pending');
                  if (firstUpcoming) handleSendReminder(firstUpcoming);
                  else setToastMessage('No upcoming appointments to remind.');
                }}
                className="px-3.5 py-1.5 bg-green-bottle text-white rounded-[12px] font-semibold hover:bg-green-forest transition-colors"
              >
                Send reminder
              </button>
              <button onClick={() => navigate('/app/appointments')} className="px-3.5 py-1.5 bg-ivory border border-stone rounded-[12px] text-charcoal font-semibold hover:bg-cream transition-colors">
                View schedule
              </button>
              <button onClick={handlePromoteCombo} className="px-3.5 py-1.5 bg-yellow-butter text-charcoal rounded-[12px] font-semibold hover:bg-yellow-honey transition-colors">
                Promote combo
              </button>
            </div>
          </div>
        </div>

        {/* Schedule & Stylists Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-charcoal">Today’s Schedule</h2>
              <p className="text-xs text-warm-gray mt-0.5">Real-time salon floor timeline</p>
            </div>
            <div className="space-y-3">
              {salonSchedule.map((slot, i) => (
                <div key={slot.id || i} className="flex flex-col p-4 bg-white border border-stone rounded-2xl gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono font-bold text-green-forest bg-green-sage/10 px-2.5 py-1 rounded-lg shrink-0">
                        {slot.time}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-charcoal">{slot.client}</p>
                        <p className="text-[11px] text-warm-gray">{slot.service} · Stylist: {slot.stylist}</p>
                      </div>
                    </div>
                    <span className={`self-start sm:self-center px-3 py-1 rounded-full text-[10px] font-bold ${
                      slot.status === 'Confirmed' ? 'bg-blue-50 text-blue-600' :
                      slot.status === 'In Progress' ? 'bg-yellow-champagne text-mustard' :
                      slot.status === 'Completed' ? 'bg-green-sage/20 text-green-bottle' :
                      slot.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                      'bg-stone text-warm-gray'
                    }`}>
                      {slot.status}
                    </span>
                  </div>

                  {/* Actions buttons row */}
                  {slot.status !== 'Available' && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-stone/50 text-[10px] font-bold">
                      {slot.status !== 'In Progress' && slot.status !== 'Completed' && (
                        <button
                          onClick={() => handleUpdateStatus(slot.id, 'In Progress')}
                          className="px-3 py-1 bg-yellow-butter text-charcoal rounded-lg hover:bg-yellow-honey transition-colors"
                        >
                          Check In
                        </button>
                      )}
                      {slot.status !== 'Completed' && (
                        <button
                          onClick={() => {
                            handleUpdateStatus(slot.id, 'Completed');
                            const currentRev = Number(localStorage.getItem('salon_revenue') || '18450');
                            localStorage.setItem('salon_revenue', String(currentRev + (slot.price || 800)));
                            setSalonRevenue(currentRev + (slot.price || 800));
                          }}
                          className="px-3 py-1 bg-green-bottle text-white rounded-lg hover:bg-green-forest transition-colors"
                        >
                          Complete
                        </button>
                      )}
                      {slot.status !== 'Completed' && (
                        <button
                          onClick={() => navigate('/app/billing', { state: { apptId: slot.id, client: slot.client, service: slot.service, stylist: slot.stylist, price: slot.price } })}
                          className="px-3 py-1 bg-charcoal text-white rounded-lg hover:bg-black transition-colors"
                        >
                          Start Bill
                        </button>
                      )}
                      <button
                        onClick={() => navigate('/app/customers')}
                        className="px-3 py-1 bg-ivory border border-stone rounded-lg text-charcoal hover:bg-cream transition-colors"
                      >
                        View Client
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-charcoal">Stylist Performance</h2>
              <p className="text-xs text-warm-gray mt-0.5">Today's bookings and commission tracking</p>
            </div>
            <div className="space-y-3">
              {stylistPerformance.map((stylist) => (
                <div
                  key={stylist.name}
                  onClick={() => navigate('/app/stylists')}
                  className="p-3.5 bg-white border border-stone rounded-2xl flex items-center justify-between cursor-pointer hover:bg-cream/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-cream border border-stone flex items-center justify-center font-bold text-green-bottle">
                      {stylist.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-charcoal">{stylist.name}</p>
                      <p className="text-[11px] text-warm-gray">{stylist.bookings} bookings · ₹{stylist.revenue.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-mustard">{stylist.rating}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Additional Useful Salon Widgets */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-charcoal">Popular Services</h2>
              <p className="text-xs text-warm-gray mt-0.5">Category distribution</p>
            </div>
            <div className="space-y-3">
              {popularServicesList.map((service) => (
                <div
                  key={service.name}
                  onClick={() => navigate('/app/services')}
                  className="space-y-1 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-charcoal">{service.name}</span>
                    <span className="text-warm-gray">{service.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-stone rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${service.color}`} style={{ width: `${service.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-charcoal">Upcoming Birthdays</h2>
              <p className="text-xs text-warm-gray mt-0.5">Customer milestones</p>
            </div>
            <div className="space-y-3">
              {birthdaysToShow.map((bd, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white border border-stone rounded-2xl">
                  <div>
                    <p className="text-xs font-bold text-charcoal">{bd.name}</p>
                    <p className="text-[11px] text-warm-gray">Birthday on {bd.date}</p>
                  </div>
                  <button
                    onClick={() => handleSendBirthdayOffer(bd)}
                    className="px-3 py-1 bg-green-bottle text-white text-[10px] font-bold rounded-lg hover:bg-green-forest transition-colors"
                  >
                    Send Offer
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-charcoal">Recent Payments</h2>
              <p className="text-xs text-warm-gray mt-0.5">Latest floor receipts</p>
            </div>
            <div className="space-y-3">
              {salonRecentPayments.map((p, i) => (
                <div
                  key={i}
                  onClick={() => navigate('/app/billing')}
                  className="flex items-center justify-between text-xs border-b border-stone/50 pb-2 last:border-0 last:pb-0 font-sans cursor-pointer hover:bg-cream/20 p-1 rounded-lg transition-colors"
                >
                  <div>
                    <span className="font-bold text-charcoal block">{p.client}</span>
                    <span className="text-warm-gray text-[10px]">{p.service}</span>
                  </div>
                  <span className="font-mono font-bold text-green-forest">{p.amount}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Check-in Client Modal */}
        {checkInOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-4">
            <div className="bg-white md:rounded-[20px] rounded-none border border-stone shadow-elev w-full h-full md:h-auto md:max-w-md p-6 space-y-4 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone">
                  <h3 className="text-base font-bold text-charcoal">Check-in Client</h3>
                  <button type="button" onClick={() => setCheckInOpen(false)} className="p-1 hover:bg-cream rounded-full">
                    <X className="w-5 h-5 text-warm-gray" />
                  </button>
                </div>

                <form id="checkinForm" onSubmit={handleCheckInSubmit} className="space-y-3.5 text-xs text-charcoal font-semibold">
                  <div className="space-y-1">
                    <label className="block text-warm-gray font-medium">Client Name</label>
                    <input
                      type="text"
                      required
                      name="clientName"
                      className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                      placeholder="Enter client's full name"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-warm-gray font-medium">Phone Number</label>
                    <input
                      type="text"
                      required
                      name="phone"
                      className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-warm-gray font-medium">Appointment Time</label>
                    <input
                      type="text"
                      required
                      name="time"
                      className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                      placeholder="e.g. 03:00 PM"
                      defaultValue="03:00 PM"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-warm-gray font-medium">Assigned Stylist</label>
                    <select
                      name="stylist"
                      className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                    >
                      <option value="Riya">Riya</option>
                      <option value="Anjali">Anjali</option>
                      <option value="Kavya">Kavya</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-warm-gray font-medium">Service</label>
                    <select
                      name="service"
                      className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                    >
                      <option value="Haircut + Blow Dry">Haircut + Blow Dry (₹1,200)</option>
                      <option value="Hair Color">Hair Color (₹3,500)</option>
                      <option value="Keratin Treatment">Keratin Treatment (₹5,500)</option>
                      <option value="Hydrating Facial">Hydrating Facial (₹1,500)</option>
                      <option value="Beard Trim & Wash">Beard Trim & Wash (₹950)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      id="walkInToggle"
                      name="isWalkIn"
                      className="w-4 h-4 rounded border-stone text-green-bottle focus:ring-green-bottle"
                    />
                    <label htmlFor="walkInToggle" className="text-charcoal font-bold cursor-pointer">Walk-in toggle</label>
                  </div>
                </form>
              </div>

              <div className="flex gap-2 pt-3 border-t border-stone mt-auto">
                <button
                  type="button"
                  onClick={() => setCheckInOpen(false)}
                  className="flex-1 py-2.5 border border-stone rounded-xl text-charcoal font-bold hover:bg-cream transition-all text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="checkinForm"
                  className="flex-1 py-2.5 bg-[#EFCF63] hover:bg-[#e5c44f] text-black rounded-xl font-bold transition-all shadow-yellow text-xs"
                >
                  Check In
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Bizz AI Chat Assistant Widget */}
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
          <AnimatePresence>
            {chatOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-80 h-96 bg-white border border-stone rounded-[20px] shadow-elev flex flex-col mb-3 overflow-hidden"
              >
                <div className="bg-green-bottle text-white p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold leading-tight">Bizz Assistant</h4>
                      <p className="text-[10px] text-white/70">Online · Salon Specialist</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setChatOpen(false)} className="p-1 rounded-full hover:bg-white/15">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-ivory/20">
                  {chatHistory.map((chat, idx) => (
                    <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-[15px] px-3.5 py-2 text-xs leading-relaxed ${
                          chat.role === 'user'
                            ? 'bg-green-bottle text-white rounded-tr-none'
                            : 'bg-white border border-stone text-charcoal rounded-tl-none'
                        }`}
                      >
                        {chat.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-stone rounded-[15px] rounded-tl-none px-3.5 py-2 text-xs text-warm-gray flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-warm-gray animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-warm-gray animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-warm-gray animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendChat} className="border-t border-stone p-2 bg-white flex gap-1.5">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask Bizz about stylists, revenue..."
                    className="flex-1 px-3 py-2 border border-stone rounded-[12px] text-xs outline-none focus:border-green-bottle transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading}
                    className="p-2 bg-green-bottle hover:bg-green-forest text-white rounded-[12px] disabled:opacity-50 flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setChatOpen(!chatOpen)}
            className="w-12 h-12 rounded-full bg-green-bottle hover:bg-green-forest text-white shadow-elev flex items-center justify-center transition-all duration-[220ms] hover:scale-105 active:scale-95"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5"
      >
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-green-forest">Overview</p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-charcoal">
            Good to see you, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-sm text-warm-gray">
            {company?.name || 'Your business'}
            {company?.gstin ? ` · ${company.gstin}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => navigate('/app/ai-suite')}>
            <Sparkles className="w-4 h-4" strokeWidth={1.75} /> Insights
          </Button>
          <Button variant="accent" onClick={() => navigate('/app/invoices/new')}>
            <Plus className="w-4 h-4" /> New invoice
          </Button>
        </div>
      </motion.div>

      {/* Bizz AI Co-Pilot Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[24px] border border-stone bg-gradient-to-r from-stone-900 via-charcoal to-stone-900 text-white p-6 sm:p-7 shadow-elev"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-bottle/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Visual Bizz Co-Pilot Character Badge */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-green-bottle to-emerald-500 flex items-center justify-center text-white shadow-lg border border-emerald-400/30">
                <Brain className="w-7 h-7 animate-pulse text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-stone-900 rounded-full" />
            </div>

            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-green-bottle/80 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Bizz AI Co-Pilot
                </span>
                <span className="text-xs text-stone-400">EN | ગુજરાતી</span>
              </div>
              <h2 className="text-lg sm:text-xl font-display font-semibold text-white tracking-tight">
                "Hi! I'm Bizz, your business pilot. I'll help you understand your business, spot opportunities, and guide you toward smarter decisions."
              </h2>
              <p className="text-xs text-stone-300 leading-relaxed pt-1">
                {briefing?.message || (
                  businessType === 'manufacturing'
                    ? `Production dashboard is active for ${company?.name || 'Apex Manufacturing'}. Track production orders, machine uptime, and raw material safety stock.`
                    : businessType === 'salon'
                    ? `Staff utilization and appointment schedules are online. Monitor stylist commissions and client loyalty.`
                    : businessType === 'restaurant'
                    ? `Floor occupancy, kitchen queue, and peak hour analytics are tracking live orders.`
                    : businessType === 'retail'
                    ? `Sales today and barcode inventory alerts are synchronized with your POS terminals.`
                    : `Your financials, invoices, and debtor balances are being continuously analyzed.`
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={() => navigate('/app/ai-suite')}
              className="px-4 py-2.5 rounded-xl bg-green-bottle hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" /> Open Bizz AI Suite
            </button>
          </div>
        </div>
      </motion.div>

      {industryHint && (
        <div className="rounded-2xl border border-stone bg-white px-4 py-3.5 text-sm text-warm-gray shadow-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="font-semibold text-charcoal capitalize">{businessType} Dashboard</span>
            {' · '}
            {industryHint}
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {businessType === 'salon' && (
              <>
                <button type="button" onClick={() => navigate('/app/appointments')} className="px-3 py-1.5 rounded-lg bg-ivory border border-stone font-medium text-charcoal hover:bg-cream">Appointments</button>
                <button type="button" onClick={() => navigate('/app/stylist')} className="px-3 py-1.5 rounded-lg bg-ivory border border-stone font-medium text-charcoal hover:bg-cream">Stylist View</button>
                <button type="button" onClick={() => navigate('/app/memberships')} className="px-3 py-1.5 rounded-lg bg-ivory border border-stone font-medium text-charcoal hover:bg-cream">Memberships</button>
              </>
            )}
            {businessType === 'restaurant' && (
              <>
                <button type="button" onClick={() => navigate('/app/tables')} className="px-3 py-1.5 rounded-lg bg-ivory border border-stone font-medium text-charcoal hover:bg-cream">Tables</button>
                <button type="button" onClick={() => navigate('/app/kitchen')} className="px-3 py-1.5 rounded-lg bg-ivory border border-stone font-medium text-charcoal hover:bg-cream">Kitchen Display</button>
                <button type="button" onClick={() => navigate('/app/menu')} className="px-3 py-1.5 rounded-lg bg-ivory border border-stone font-medium text-charcoal hover:bg-cream">Menu</button>
              </>
            )}
            {businessType === 'retail' && (
              <>
                <button type="button" onClick={() => navigate('/app/pos')} className="px-3 py-1.5 rounded-lg bg-ivory border border-stone font-medium text-charcoal hover:bg-cream">POS Terminal</button>
                <button type="button" onClick={() => navigate('/app/barcode')} className="px-3 py-1.5 rounded-lg bg-ivory border border-stone font-medium text-charcoal hover:bg-cream">Barcode</button>
                <button type="button" onClick={() => navigate('/app/inventory')} className="px-3 py-1.5 rounded-lg bg-ivory border border-stone font-medium text-charcoal hover:bg-cream">Inventory</button>
              </>
            )}
            {businessType === 'manufacturing' && (
              <>
                <button type="button" onClick={() => navigate('/app/production-orders')} className="px-3 py-1.5 rounded-lg bg-ivory border border-stone font-medium text-charcoal hover:bg-cream">Production Orders</button>
                <button type="button" onClick={() => navigate('/app/machines')} className="px-3 py-1.5 rounded-lg bg-ivory border border-stone font-medium text-charcoal hover:bg-cream">Machines</button>
                <button type="button" onClick={() => navigate('/app/qc')} className="px-3 py-1.5 rounded-lg bg-ivory border border-stone font-medium text-charcoal hover:bg-cream">QC</button>
              </>
            )}
            {businessType === 'stationery' && (
              <>
                <button type="button" onClick={() => navigate('/app/school-orders')} className="px-3 py-1.5 rounded-lg bg-ivory border border-stone font-medium text-charcoal hover:bg-cream">School Orders</button>
                <button type="button" onClick={() => navigate('/app/wholesale')} className="px-3 py-1.5 rounded-lg bg-ivory border border-stone font-medium text-charcoal hover:bg-cream">Wholesale</button>
                <button type="button" onClick={() => navigate('/app/retail-billing')} className="px-3 py-1.5 rounded-lg bg-ivory border border-stone font-medium text-charcoal hover:bg-cream">Billing Counter</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bz-kpi ${kpi.onClick ? 'cursor-pointer hover:border-green-bottle/40 shadow-sm' : ''}`}
              onClick={kpi.onClick}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium text-warm-gray">{kpi.label}</p>
                <div className={`w-8 h-8 rounded-[10px] border border-stone flex items-center justify-center ${kpi.tint}`}>
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                </div>
              </div>
              <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-charcoal">{kpi.value}</p>
              <p className="mt-1.5 text-[11px] text-warm-gray flex items-center gap-1">
                {kpi.onClick && <Activity className="w-3 h-3 text-green-bottle" />}
                {kpi.hint}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Expanded Health Score Scorecard Breakdown */}
      <AnimatePresence>
        {showBreakdown && healthBreakdown.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-5 border border-stone bg-cream/20 space-y-4">
              <div className="flex items-center justify-between border-b border-stone pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-green-bottle" /> Business Health Score Breakdown
                </h3>
                <button type="button" onClick={() => setShowBreakdown(false)} className="p-1 rounded-full hover:bg-cream text-warm-gray hover:text-charcoal">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {healthBreakdown.map((item) => (
                  <div key={item.metric} className="p-3 bg-white rounded-xl border border-stone/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-charcoal">{item.metric}</span>
                      <span className={`text-xs font-bold ${item.status === 'healthy' ? 'text-green-forest' : item.status === 'warning' ? 'text-mustard' : 'text-terracotta'}`}>
                        {item.score}%
                      </span>
                    </div>
                    <div className="w-full bg-stone h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.status === 'healthy' ? 'bg-green-bottle' : item.status === 'warning' ? 'bg-yellow-honey' : 'bg-terracotta'}`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-warm-gray">{item.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-charcoal">Revenue trend</h2>
              <p className="text-xs text-warm-gray mt-0.5">Last six months</p>
            </div>
            <Badge tone="info">INR</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2F5D50" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#F6D97A" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6E6E6E', fontSize: 11 }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E6E2D9',
                    borderRadius: 12,
                    boxShadow: '0 10px 28px -14px rgba(47,93,80,0.16)',
                    fontSize: 12,
                  }}
                  formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2F5D50" strokeWidth={2.25} fill="url(#revFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-charcoal">Invoice mix</h2>
            <p className="text-xs text-warm-gray mt-0.5">Status distribution</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={invoicePieData} dataKey="value" innerRadius={48} outerRadius={72} paddingAngle={3}>
                  {invoicePieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E6E2D9',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {invoicePieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-warm-gray">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </span>
                <span className="font-medium text-charcoal">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Invoices */}
        <Card className="xl:col-span-2 overflow-hidden">
          <div className="px-5 py-4 border-b border-stone flex items-center justify-between bg-ivory/50">
            <h2 className="text-sm font-semibold text-charcoal">Recent invoices</h2>
            <button
              type="button"
              onClick={() => navigate('/app/invoices')}
              className="text-xs text-warm-gray hover:text-green-bottle inline-flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="bz-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-warm-gray py-10">No invoices yet</td>
                  </tr>
                ) : (
                  recent.map((inv) => (
                    <tr key={inv.id}>
                      <td className="font-medium text-charcoal">{inv.invoiceNumber}</td>
                      <td>{inv.customerName}</td>
                      <td>
                        <Badge tone={inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'danger' : 'warning'}>
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="text-right font-medium text-charcoal">
                        ₹{Number(inv.grandTotal).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Suggested Next Actions */}
        <Card className="p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-charcoal">Insights</h2>
            <p className="text-xs text-warm-gray mt-0.5">Suggested next actions</p>
          </div>
          <div className="space-y-3">
            {(aiInsights || []).slice(0, 3).map((insight) => (
              <div key={insight.id} className="p-3.5 rounded-[14px] bg-cream/80 border border-stone">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-charcoal leading-snug">{insight.title}</p>
                  <ArrowUpRight className="w-3.5 h-3.5 text-green-olive shrink-0" />
                </div>
                <p className="mt-1.5 text-[11px] text-warm-gray leading-relaxed line-clamp-2">{insight.message}</p>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-stone">
            <p className="text-xs text-warm-gray">{customers.length} customers · {metrics.totalProducts} products</p>
          </div>
        </Card>
      </div>

      {/* Floating Bizz AI Chat Assistant Widget */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-80 h-96 bg-white border border-stone rounded-[20px] shadow-elev flex flex-col mb-3 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-green-bottle text-white p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">Bizz Assistant</h4>
                    <p className="text-[10px] text-white/70">Online · Enterprise AI</p>
                  </div>
                </div>
                <button type="button" onClick={() => setChatOpen(false)} className="p-1 rounded-full hover:bg-white/15">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Message List */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-ivory/20">
                {chatHistory.map((chat, idx) => (
                  <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-[15px] px-3.5 py-2 text-xs leading-relaxed ${
                        chat.role === 'user'
                          ? 'bg-green-bottle text-white rounded-tr-none'
                          : 'bg-white border border-stone text-charcoal rounded-tl-none'
                      }`}
                    >
                      {chat.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-stone rounded-[15px] rounded-tl-none px-3.5 py-2 text-xs text-warm-gray flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-warm-gray animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-warm-gray animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-warm-gray animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Form */}
              <form onSubmit={handleSendChat} className="border-t border-stone p-2 bg-white flex gap-1.5">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask Bizz about stock, invoices..."
                  className="flex-1 px-3 py-2 border border-stone rounded-[12px] text-xs outline-none focus:border-green-bottle transition-colors"
                />
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="p-2 bg-green-bottle hover:bg-green-forest text-white rounded-[12px] disabled:opacity-50 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setChatOpen(!chatOpen)}
          className="w-12 h-12 rounded-full bg-green-bottle hover:bg-green-forest text-white shadow-elev flex items-center justify-center transition-all duration-[220ms] hover:scale-105 active:scale-95"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
