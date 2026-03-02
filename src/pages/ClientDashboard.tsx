import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import {
  Scissors, Calendar, MessageSquare, User, Store, Clock,
  Plus, Send, Star, TrendingUp, LogOut,
  CheckCircle, CheckCircle2, XCircle, History,
  Shield, BarChart3, LayoutDashboard,
  Check, CheckCheck, Menu, X, Star as StarOutline, Trash2, AlertTriangle, ArrowLeft, Info,
  Camera, Lock, Activity
} from 'lucide-react';
import { MiniCalendar } from '@/components/MiniCalendar';
import { Logo } from '@/components/Logo';


type Tab = 'overview' | 'appointments' | 'agenda' | 'book' | 'messages' | 'profile';

export default function ClientDashboard() {
  const {
    currentUser, logout, barbershops, barbers,
    getClientAppointments, getBarberAppointments, addAppointment, updateAppointmentStatus,
    getUserMessages, sendMessage, markAsRead, loading, isInitialSyncing, updateProfile,
    addReview, deleteAccount, reviews
  } = useData();

  const [tab, setTab] = useState<Tab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [selectedShopId, setSelectedShopId] = useState('');
  const [selectedBarberId, setSelectedBarberId] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [msgTo, setMsgTo] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [msgSubTab, setMsgSubTab] = useState<'barbers' | 'shops'>('barbers');
  const [bookSuccess, setBookSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shopSearch, setShopSearch] = useState('');
  const [viewingBarberProfile, setViewingBarberProfile] = useState<any>(null);

  // Review State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAptForReview, setSelectedAptForReview] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });

  const dayNames: Record<number, string> = {
    0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
    4: 'thursday', 5: 'friday', 6: 'saturday'
  };

  const formatTime12h = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    email: '',
    birthday: '',
    bio: ''
  });

  // Load profile data
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        email: currentUser.email || '',
        birthday: currentUser.birthday || '',
        bio: currentUser.bio || ''
      });
    }
  }, [currentUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        birthday: profileForm.birthday,
        bio: profileForm.bio
      });
      alert('Perfil actualizado correctamente.');
    } catch (error: any) {
      alert(error.message || 'Error al actualizar perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAptForReview) return;

    setIsSubmitting(true);
    try {
      await addReview({
        appointmentId: selectedAptForReview.id,
        userId: currentUser!.id,
        userName: currentUser!.name,
        userAvatar: currentUser?.avatar || '',
        barberId: selectedAptForReview.barberId,
        barbershopId: selectedAptForReview.barbershopId,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      alert('¡Gracias por tu reseña!');
      setShowReviewModal(false);
      setReviewForm({ rating: 5, comment: '' });
    } catch (error: any) {
      alert(error.message || 'Error al enviar reseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isInitialSyncing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
        <div className="flex flex-col items-center gap-8">
          <div className="relative">
            <div className="h-20 w-20 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]" />
            <div className={`absolute inset-0 flex items-center justify-center`}>
              <Logo className="scale-30 opacity-60 grayscale invert brightness-200" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-amber-500">Bienvenido a BarberOs LM</h2>
            <p className="text-zinc-500 text-xs animate-pulse max-w-[200px] mx-auto leading-relaxed">
              {loading ? 'Identificando tu perfil...' : 'Cargando tus citas y mensajes...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  const myAppointments = getClientAppointments(currentUser.id);
  const myMessages = getUserMessages(currentUser.id);
  const completedCuts = myAppointments.filter(a => a.status === 'completed').length;
  const pendingApts = myAppointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length;
  const totalSpent = myAppointments.filter(a => a.status === 'completed').reduce((s, a) => s + a.price, 0);

  // Mostrar barberos aprobados de la barbería seleccionada
  const shopBarbers = selectedShopId ? barbers.filter(b => b.barbershopId === selectedShopId && b.isApproved) : [];
  const selectedShop = barbershops.find(s => s.id === selectedShopId);
  const services = selectedShop?.services || [
    { name: 'Corte clásico', price: 250 },
    { name: 'Corte + Barba', price: 350 },
    { name: 'Degradado (Fade)', price: 300 },
    { name: 'Diseño artístico', price: 400 },
    { name: 'Afeitado clásico', price: 200 },
    { name: 'Tratamiento capilar', price: 500 },
  ];

  // Lista base de horarios cada 30 min de 06:00 a 23:30
  const allTimes = Array.from({ length: 36 }, (_, i) => {
    const totalMinutes = 6 * 60 + i * 30;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  });

  const handleBook = async () => {
    const barber = barbers.find(b => b.id === selectedBarberId);
    const shop = barbershops.find(s => s.id === selectedShopId);
    const svc = services.find(s => s.name === selectedService);

    if (!barber || !shop || !svc || !selectedDate || !selectedTime) {
      alert("Por favor completa todos los campos.");
      return;
    }

    // ═══════════════════════════════════════════════════════════
    // VALIDACIÓN DE HORARIO Y DÍAS DE CIERRE
    // ═══════════════════════════════════════════════════════════
    const dateObj = new Date(selectedDate + 'T12:00:00');
    const dayName = dayNames[dateObj.getDay()];
    const businessDay = shop.businessHours?.[dayName];

    // 1. Verificar si es fecha de cierre manual
    const isManuallyClosed = shop.closedDates?.some(cd => cd.date === selectedDate);
    if (isManuallyClosed) {
      const reason = shop.closedDates?.find(cd => cd.date === selectedDate)?.reason || 'Cerrado por mantenimiento o feriado';
      alert(`La barbería está cerrada en esta fecha: ${reason}`);
      return;
    }

    // 2. Verificar si está cerrado ese día de la semana
    if (businessDay?.closed) {
      alert(`La barbería está cerrada los ${dayName === 'sunday' ? 'domingos' : dayName === 'monday' ? 'lunes' : dayName === 'tuesday' ? 'martes' : dayName === 'wednesday' ? 'miércoles' : dayName === 'thursday' ? 'jueves' : dayName === 'friday' ? 'viernes' : 'sábados'}.`);
      return;
    }

    // 3. Verificar si la hora elegida está en el rango
    if (businessDay) {
      if (selectedTime < businessDay.open || selectedTime >= businessDay.close) {
        alert(`La barbería abre de ${businessDay.open} a ${businessDay.close}. Por favor elige otro horario.`);
        return;
      }
    }

    // Validación: Mínimo 2 horas de anticipación
    const now = new Date();
    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const minTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // Now + 2 hours

    if (selectedDateTime < minTime) {
      alert("Debes agendar con al menos 2 horas de anticipación.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addAppointment({
        clientId: currentUser.id,
        clientName: currentUser.name || '',
        clientPhone: currentUser.phone || '',
        barberId: barber.id,
        barberName: barber.name,
        barbershopId: shop.id,
        barbershopName: shop.name,
        service: svc.name,
        date: selectedDate,
        time: selectedTime,
        price: svc.price,
        status: 'pending'
      });

      setBookSuccess(true);
      // Limpiar selecciones inmediatamente para el próximo uso
      setSelectedShopId('');
      setSelectedBarberId('');
      setSelectedService('');
      setSelectedDate('');
      setSelectedTime('');
    } catch (error) {
      console.error(error);
      alert("Hubo un error al agendar la cita.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper para deshabilitar horas pasadas o muy próximas si es hoy
  const isTimeDisabled = (t: string) => {
    if (!selectedDate || !selectedShop) return true;

    // 1. Conflictos con el barbero
    if (selectedBarberId) {
      const conflict = getBarberAppointments(selectedBarberId).some(apt =>
        apt.date === selectedDate && apt.time === t && apt.status !== 'cancelled' && apt.status !== 'lost'
      );
      if (conflict) return true;
    }

    // 2. Horario comercial de la barbería
    const dateObj = new Date(selectedDate + 'T12:00:00');
    const dayName = dayNames[dateObj.getDay()];
    const businessDay = selectedShop.businessHours?.[dayName];

    // Verificar si es fecha de cierre manual
    const isManuallyClosed = selectedShop.closedDates?.some(cd => cd.date === selectedDate);
    if (isManuallyClosed) return true;

    // Verificar si está cerrado ese día
    if (businessDay?.closed) return true;

    // Verificar el rango horario
    if (businessDay) {
      if (t < businessDay.open || t >= businessDay.close) return true;
    }

    // 3. Anticipación y días pasados
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (selectedDate < todayStr) return true; // Días pasados

    if (selectedDate === todayStr) {
      // Si es hoy, verificar hora + 2hs
      const slotTime = new Date(`${todayStr}T${t}`);
      const minTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      return slotTime < minTime;
    }

    return false;
  };

  const times = allTimes;

  // Messaging Logic
  const messageContacts = [...new Set(myMessages.map(m => {
    const isSender = m.senderId === currentUser.id;
    return JSON.stringify({
      id: isSender ? m.receiverId : m.senderId,
      name: isSender ? m.receiverName : m.senderName,
      role: isSender ? m.receiverRole : m.senderRole
    });
  }))].map(c => JSON.parse(c));

  const barberContacts = [
    ...barbers.filter(b => b.isApproved).map(b => ({ id: b.userId, name: b.name, role: 'barber', shopName: b.barbershopName })),
    ...messageContacts.filter(c => c.role === 'barber')
  ].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

  const shopContacts = [
    ...barbershops.map(s => ({ id: s.ownerId, name: s.name, role: 'owner', shopName: s.name })),
    ...messageContacts.filter(c => c.role === 'owner')
  ].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

  const handleSendMsg = async () => {
    if (!msgTo || !msgContent.trim()) return;

    // Find contact in either list
    const contact = [...barberContacts, ...shopContacts].find(c => c.id === msgTo);
    if (!contact) return;

    setIsSubmitting(true);
    await sendMessage({
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: 'client',
      receiverId: contact.id,
      receiverName: contact.name,
      receiverRole: contact.role as any,
      content: msgContent.trim(),
      barbershopId: contact.role === 'barber' ? (barbers.find(b => b.userId === contact.id)?.barbershopId || '') : '',
    });
    setIsSubmitting(false);
    setMsgContent('');
  };

  // Mark messages as read when opening a conversation
  useEffect(() => {
    const currentChatMessages = myMessages.filter(
      m => (m.senderId === msgTo && m.receiverId === currentUser.id) ||
        (m.senderId === currentUser.id && m.receiverId === msgTo)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    if (tab === 'messages' && msgTo && currentChatMessages.length > 0) {
      currentChatMessages.forEach(msg => {
        if (msg.receiverId === currentUser.id && !msg.read) {
          markAsRead(msg.id);
        }
      });
    }
  }, [tab, msgTo, myMessages, currentUser.id, markAsRead]);

  const statusBadge = (s: string) => {
    const map: Record<string, { bg: string; text: string; icon: typeof CheckCircle }> = {
      pending: { bg: 'bg-yellow-500/10 text-yellow-400', text: 'Pendiente', icon: Clock },
      confirmed: { bg: 'bg-blue-500/10 text-blue-400', text: 'Confirmada', icon: CheckCircle },
      completed: { bg: 'bg-green-500/10 text-green-400', text: 'Completada', icon: CheckCircle },
      cancelled: { bg: 'bg-red-500/10 text-red-400', text: 'Cancelada', icon: XCircle },
    };
    const info = map[s] || map.pending;
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${info.bg}`}>
        <info.icon className="h-3 w-3" /> {info.text}
      </span>
    );
  };

  const navItems: { id: Tab; label: string; icon: typeof Calendar }[] = [
    { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
    { id: 'appointments', label: 'Citas', icon: Calendar },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'book', label: 'Agendar', icon: Plus },
    { id: 'messages', label: 'Mensajes', icon: MessageSquare },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-zinc-900 border-b border-white/10 p-4">
        <Logo className="scale-75 origin-left" />
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-zinc-400 hover:text-white">
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-white/5 bg-[#050505] transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-2.5 p-6 pb-4">
          <Logo />
        </div>
        <div className="px-6 py-3">
          <div className="rounded-xl bg-zinc-900/50 border border-white/10 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-zinc-900">
                {(currentUser.name || '?')[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{currentUser.name}</p>
                <p className="text-xs text-zinc-500">Cliente</p>
              </div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setIsSidebarOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${tab === item.id
                ? 'bg-amber-500/10 text-amber-400'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
              {item.id === 'messages' && myMessages.filter(m => !m.read && m.receiverId === currentUser.id).length > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-zinc-900">
                  {myMessages.filter(m => !m.read && m.receiverId === currentUser.id).length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/5 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-5 w-5" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <main className="flex-1 p-4 lg:p-8 mt-16 lg:mt-0 overflow-y-auto w-full">
          {/* Overview */}
          {tab === 'overview' && (
            <div>
              <h1 className="text-2xl font-bold mb-1">Bienvenido, {currentUser.name.split(' ')[0]}</h1>
              <p className="text-zinc-400 text-sm mb-8">Aquí tienes un resumen de tu actividad</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {[
                  { label: 'Cortes realizados', value: completedCuts, icon: Scissors, color: 'from-amber-400 to-orange-500' },
                  { label: 'Citas pendientes', value: pendingApts, icon: Clock, color: 'from-blue-400 to-blue-600' },
                  { label: 'Mensajes sin leer', value: myMessages.filter(m => !m.read && m.senderId !== currentUser.id).length, icon: MessageSquare, color: 'from-purple-400 to-purple-600' },
                  { label: 'Total gastado', value: `$${totalSpent}`, icon: TrendingUp, color: 'from-green-400 to-green-600' },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
                    <div className={`inline-flex rounded-xl bg-gradient-to-br ${s.color} p-2.5 mb-3`}>
                      <s.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-2xl font-bold">{s.value}</div>
                    <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Recent appointments */}
              <h2 className="text-lg font-bold mb-4">Citas recientes</h2>
              <div className="space-y-3">
                {myAppointments.slice(-3).reverse().map(apt => (
                  <div key={apt.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-900/50 p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-white uppercase italic tracking-tighter leading-tight">{apt.barbershopName}</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 line-clamp-2 italic">
                          {apt.barberName} <span className="mx-1 opacity-30">|</span> {apt.service} <span className="mx-1 opacity-30">|</span> {apt.date} {apt.time}
                        </p>
                      </div>
                    </div>
                    {statusBadge(apt.status)}
                  </div>
                ))}
                {myAppointments.length === 0 && (
                  <div className="text-center py-12 text-zinc-500">
                    <Calendar className="mx-auto h-10 w-10 mb-3 text-zinc-700" />
                    <p>No tienes citas aún</p>
                    <button onClick={() => setTab('book')} className="mt-3 text-sm text-amber-400 hover:underline">Agendar primera cita</button>
                  </div>
                )}
              </div>
              <button onClick={() => setTab('book')} className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 text-sm font-bold text-zinc-900">
                <Plus className="h-4 w-4" /> Agendar Nueva Cita
              </button>
            </div>
          )}

          {/* Appointments */}
          {tab === 'appointments' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Mis Citas</h1>
                  <p className="text-zinc-400 text-sm">Historial completo de tus citas</p>
                </div>
                <button onClick={() => setTab('book')} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-sm font-bold text-zinc-900">
                  <Plus className="h-4 w-4" /> Nueva Cita
                </button>
              </div>
              <div className="space-y-3">
                {myAppointments
                  .filter(apt => apt.status !== 'completed' && apt.status !== 'cancelled')
                  .sort((a, b) => {
                    if (a.status === 'pending' && b.status !== 'pending') return -1;
                    if (a.status !== 'pending' && b.status === 'pending') return 1;
                    return new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime();
                  })
                  .map(apt => {
                    const aptDateTime = new Date(apt.date + ' ' + apt.time);
                    const now = new Date();
                    const hoursUntilApt = (aptDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                    const canCancel = hoursUntilApt > 2;

                    return (
                      <div key={apt.id} className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 sm:p-5 hover:border-amber-500/30 transition group overflow-hidden mb-3 text-left">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold shrink-0">
                                {(apt.barbershopName || '?')[0]}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-white text-base leading-tight">{apt.barbershopName}</p>
                                <p className="text-xs text-zinc-400 mb-1.5 line-clamp-2 italic">
                                  con {apt.barberName} <span className="mx-1 text-zinc-600">|</span> {apt.service}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 w-full">
                                  <span className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase font-black tracking-widest leading-none">
                                    <Calendar className="h-3.5 w-3.5" /> {apt.date}
                                  </span>
                                  <span className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase font-black tracking-widest leading-none">
                                    <Clock className="h-3.5 w-3.5" /> {formatTime12h(apt.time)}
                                  </span>
                                  <span className="text-xs font-bold text-white bg-white/5 px-2 py-0.5 rounded-lg ml-auto">${apt.price}</span>
                                </div>
                              </div>
                            </div>
                            <div className="shrink-0">
                              {statusBadge(apt.status)}
                            </div>
                          </div>

                          {(apt.status === 'confirmed' || apt.status === 'pending') && canCancel && (
                            <div className="flex justify-end pt-2 border-t border-amber-500/10">
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                                className="w-full sm:w-auto rounded-lg bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-bold text-white transition flex items-center justify-center gap-2"
                              >
                                <XCircle className="h-4 w-4" /> Cancelar Cita
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* History */}
              <div className="mt-12">
                <div className="flex items-center gap-2 mb-6">
                  <History className="h-5 w-5 text-zinc-500" />
                  <h2 className="text-lg font-bold">Historial de Citas</h2>
                </div>
                <div className="space-y-3 opacity-70">
                  {myAppointments
                    .filter(apt => apt.status === 'completed' || apt.status === 'cancelled')
                    .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())
                    .map(apt => (
                      <div key={apt.id} className="rounded-xl border border-white/5 bg-zinc-900/30 p-4 flex items-center justify-between group hover:border-white/10 transition">
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${apt.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {apt.status === 'completed' ? <Check className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{apt.barbershopName}</p>
                            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{apt.date} • {apt.barberName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {apt.status === 'completed' && (
                            <button
                              onClick={() => {
                                setSelectedAptForReview(apt);
                                setShowReviewModal(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-zinc-900 transition flex items-center gap-2"
                            >
                              <Star className="h-3 w-3 fill-current" /> Calificar
                            </button>
                          )}
                          <div className="text-xs font-bold text-zinc-600">${apt.price}</div>
                        </div>
                      </div>
                    ))}
                  {myAppointments.filter(apt => apt.status === 'completed' || apt.status === 'cancelled').length === 0 && (
                    <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl text-zinc-600 text-sm">
                      No hay citas en tu historial
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Agenda */}
          {tab === 'agenda' && (
            <div>
              <h1 className="text-2xl font-bold mb-1">Mi Agenda</h1>
              <p className="text-zinc-400 text-sm mb-8">Vista de calendario de tus citas</p>

              <div className="flex flex-col lg:flex-row gap-10">
                <div className="w-full lg:w-[320px] flex-shrink-0">
                  <div className="sticky top-8">
                    <MiniCalendar
                      appointments={myAppointments}
                      selectedDate={filterDate}
                      onDateSelect={(d) => setFilterDate(d === filterDate ? null : d)}
                      color="amber"
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                    <h3 className="text-lg font-bold text-amber-500 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {filterDate ? `Agenda del ${filterDate}` : 'Mi Agenda Completa'}
                    </h3>
                    {filterDate && (
                      <button
                        onClick={() => setFilterDate(null)}
                        className="text-sm font-medium text-amber-500 hover:text-amber-400 transition-colors"
                      >
                        Ver todas
                      </button>
                    )}
                  </div>

                  {(filterDate ? myAppointments.filter(a => a.date === filterDate) : myAppointments)
                    .sort((a, b) => {
                      // 1. Priority: Pending First
                      if (a.status === 'pending' && b.status !== 'pending') return -1;
                      if (a.status !== 'pending' && b.status === 'pending') return 1;

                      // 2. All others: Chronological (Date/Time Ascending)
                      if (a.date !== b.date) return a.date.localeCompare(b.date);
                      return a.time.localeCompare(b.time);
                    })
                    .map(apt => (
                      <div key={apt.id} className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 sm:p-5 hover:border-amber-500/30 transition group overflow-hidden mb-3 text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold shrink-0">
                              {(apt.barbershopName || '?')[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white text-base truncate">{apt.barbershopName}</p>
                              <p className="text-xs text-zinc-400 mb-1.5 truncate italic">
                                con {apt.barberName} <span className="mx-1 text-zinc-600">|</span> {apt.service}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 w-full">
                                <span className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase font-black tracking-widest leading-none">
                                  <Calendar className="h-3.5 w-3.5" /> {apt.date}
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase font-black tracking-widest leading-none">
                                  <Clock className="h-3.5 w-3.5" /> {formatTime12h(apt.time)}
                                </span>
                                <span className="text-xs font-bold text-white bg-white/5 px-2 py-0.5 rounded-lg ml-auto">${apt.price}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
                            {statusBadge(apt.status)}
                          </div>
                        </div>
                      </div>
                    ))}

                  {(filterDate ? myAppointments.filter(a => a.date === filterDate) : myAppointments).length === 0 && (
                    <div className="text-center py-16 text-zinc-500">
                      <Calendar className="mx-auto h-12 w-12 mb-3 text-zinc-700" />
                      <p className="text-lg">Sin citas {filterDate ? `para el ${filterDate}` : 'registradas'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Book */}
          {tab === 'book' && (
            <div className="flex flex-col h-full max-h-[calc(100vh-140px)]">
              <div className="flex items-center justify-between mb-1">
                <h1 className="text-2xl font-bold">Agendar Cita</h1>
                {selectedShopId && !bookSuccess && (
                  <button
                    onClick={() => {
                      setSelectedShopId('');
                      setSelectedBarberId('');
                      setSelectedService('');
                      setSelectedDate('');
                      setSelectedTime('');
                    }}
                    className="flex items-center gap-2 text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition-all"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Cambiar Barbería
                  </button>
                )}
              </div>
              <p className="text-zinc-400 text-sm mb-6">Elige barbería, barbero, servicio y horario</p>

              {bookSuccess ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="max-w-md w-full text-center py-16 bg-zinc-900/50 border border-white/10 rounded-[32px] p-8 animate-in zoom-in-95 duration-300">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 mb-4">
                      <CheckCircle2 className="h-10 w-10 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">¡Cita agendada!</h2>
                    <p className="text-zinc-400 mt-2">Tu cita ha sido registrada exitosamente. El barbero confirmará pronto.</p>
                    <button
                      onClick={() => { setTab('appointments'); setBookSuccess(false); }}
                      className="mt-8 w-full bg-amber-500 text-zinc-900 py-3 rounded-xl font-bold hover:bg-amber-400 transition-all font-black uppercase tracking-widest text-xs"
                    >
                      Ver mis citas
                    </button>
                  </div>
                </div>
              ) : !selectedShopId ? (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="relative mb-6">
                    <input
                      type="text"
                      placeholder="Buscar barbería por nombre..."
                      value={shopSearch}
                      onChange={e => setShopSearch(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-amber-500/50 transition-all"
                    />
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {barbershops
                        .filter(s => s.isPublic && (s.name.toLowerCase().includes(shopSearch.toLowerCase()) || s.address?.toLowerCase().includes(shopSearch.toLowerCase())))
                        .map(shop => (
                          <button
                            key={shop.id}
                            onClick={() => { setSelectedShopId(shop.id); setSelectedBarberId(''); }}
                            className="group relative flex flex-col gap-3 rounded-[24px] border border-white/10 bg-zinc-900/50 p-5 text-left transition-all hover:border-amber-500/50 hover:bg-amber-500/[0.02]"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-lg font-black text-zinc-900 shrink-0 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                                {shop.name[0]}
                              </div>
                              <div className="min-w-0">
                                <p className="text-base font-bold text-white truncate group-hover:text-amber-400 transition-colors">{shop.name}</p>
                                <p className="text-xs text-zinc-500 flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {shop.rating} · {shop.address || 'Sin dirección'}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Agendar Cita</span>
                              <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-amber-500 group-hover:text-zinc-900 transition-all">
                                <ArrowLeft className="h-4 w-4 rotate-180" />
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                  {/* Step 1: Service */}
                  <div className="rounded-[32px] border border-white/10 bg-zinc-900/50 p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-black uppercase tracking-tight text-sm flex items-center gap-2">
                        <Scissors className="h-5 w-5 text-amber-500" /> 1. Elegir Servicio
                      </h3>
                      {selectedService && (
                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                          <Check className="h-3 w-3" /> Seleccionado
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2 custom-scrollbar">
                      {services.map(svc => (
                        <button
                          key={svc.name}
                          onClick={() => setSelectedService(svc.name)}
                          className={`flex-shrink-0 min-w-[160px] flex flex-col justify-between rounded-2xl border-2 p-4 text-left transition-all ${selectedService === svc.name
                            ? 'border-amber-500 bg-amber-500/10'
                            : 'border-white/5 bg-zinc-800/30 hover:border-zinc-700'
                            }`}
                        >
                          <span className="text-sm font-bold text-white mb-2">{svc.name}</span>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-500 font-medium">Desde</span>
                            <span className="text-base font-black text-amber-400">${svc.price}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Barber */}
                  {selectedService && (
                    <div className="rounded-[32px] border border-white/10 bg-zinc-900/50 p-6 md:p-8 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black uppercase tracking-tight text-sm flex items-center gap-2">
                          <User className="h-5 w-5 text-amber-500" /> 2. Elegir Barbero
                        </h3>
                        {selectedBarberId && (
                          <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                            <Check className="h-3 w-3" /> Seleccionado
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 custom-scrollbar">
                        {shopBarbers.map(b => (
                          <button
                            key={b.id}
                            onClick={() => setSelectedBarberId(b.id)}
                            className={`flex-shrink-0 min-w-[180px] flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${selectedBarberId === b.id
                              ? 'border-amber-500 bg-amber-500/10'
                              : 'border-white/5 bg-zinc-800/30 hover:border-zinc-700'
                              }`}
                          >
                            <div className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-black shrink-0 shadow-lg ${selectedBarberId === b.id ? 'bg-amber-500 text-zinc-900 shadow-amber-500/20' : 'bg-zinc-800 text-zinc-500'}`}>
                              {b.name[0]}
                            </div>
                            <div className="min-w-0 flex-1 relative">
                              <p className="text-sm font-bold text-white leading-tight">{b.name}</p>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 line-clamp-1">{b.specialty}</p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewingBarberProfile(b);
                                  }}
                                  className="p-1 rounded-full bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-zinc-900 transition-all ml-1"
                                  title="Ver Perfil"
                                >
                                  <Info className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </button>
                        ))}
                        {shopBarbers.length === 0 && <p className="text-sm text-zinc-500 py-4">No hay barberos disponibles</p>}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Date & Time */}
                  {selectedBarberId && (
                    <div className="rounded-[32px] border border-white/10 bg-zinc-900/50 p-6 md:p-8 animate-in fade-in slide-in-from-top-4 duration-300">
                      <h3 className="font-black uppercase tracking-tight text-sm mb-6 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-amber-500" /> 3. Fecha y Hora
                      </h3>
                      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Seleccionar Día</label>
                          <input
                            type="date"
                            value={selectedDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={e => setSelectedDate(e.target.value)}
                            className="w-full rounded-2xl border-2 border-white/10 bg-zinc-900 py-4 px-6 text-sm font-bold text-white outline-none focus:border-amber-500/50 transition-all cursor-pointer"
                          />
                          <p className="text-[10px] text-zinc-500 italic">Mínimo 2 horas de anticipación</p>
                        </div>

                        {selectedDate && (
                          <div className="space-y-4 animate-in fade-in duration-500">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Horarios Disponibles</label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                              {times.map(t => {
                                const disabled = isTimeDisabled(t);
                                return (
                                  <button
                                    key={t}
                                    onClick={() => !disabled && setSelectedTime(t)}
                                    disabled={disabled}
                                    className={`rounded-xl border-2 py-3 text-xs font-black transition-all ${selectedTime === t
                                      ? 'border-amber-500 bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/30 scale-105'
                                      : disabled
                                        ? 'border-white/5 text-zinc-800 bg-zinc-900/50 cursor-not-allowed opacity-30 grayscale'
                                        : 'border-white/10 text-zinc-400 bg-zinc-800/20 hover:border-amber-500/50 hover:text-amber-400'
                                      }`}
                                  >
                                    {t}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Final Confirm */}
                      {selectedDate && selectedTime && (
                        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                              <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <div>
                              <p className="text-lg font-black text-white">Resumen de Cita</p>
                              <p className="text-sm text-zinc-500">
                                {selectedService} con {shopBarbers.find(b => b.id === selectedBarberId)?.name} · {selectedDate} a las {selectedTime}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleBook}
                            disabled={isSubmitting}
                            className="w-full md:w-auto flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-12 py-4 text-sm font-black text-zinc-900 shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? 'AGENDANDO...' : 'CONFIRMAR AGENDAMIENTO'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {tab === 'messages' && (
            <div className="h-[calc(100vh-140px)] flex flex-col">
              <h1 className="text-2xl font-bold mb-4">Mensajería</h1>
              <div className="flex-1 overflow-hidden relative">
                {/* List View */}
                <div className={`absolute inset-0 flex flex-col transition-transform duration-300 ${msgTo ? '-translate-x-full' : 'translate-x-0'}`}>
                  <div className="rounded-2xl border border-white/10 bg-zinc-900/50 flex flex-col overflow-hidden h-full">
                    <div className="p-2 border-b border-white/10 bg-zinc-900/80 flex gap-1">
                      <button
                        onClick={() => setMsgSubTab('barbers')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition ${msgSubTab === 'barbers' ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                      >
                        <Scissors className="h-3.5 w-3.5" /> Barberos
                      </button>
                      <button
                        onClick={() => setMsgSubTab('shops')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition ${msgSubTab === 'shops' ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                      >
                        <Store className="h-3.5 w-3.5" /> Negocios
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {msgSubTab === 'barbers' ? (
                        <>
                          {barberContacts.length === 0 && <div className="p-8 text-center text-xs text-zinc-500">No hay barberos disponibles.</div>}
                          {barberContacts.map((b: any) => (
                            <button
                              key={b.id}
                              onClick={() => setMsgTo(b.id)}
                              className={`w-full text-left p-4 hover:bg-zinc-800/50 transition flex items-center gap-3 border-b border-white/10/30 ${msgTo === b.id ? 'bg-amber-500/10 border-l-4 border-l-amber-500 pl-3' : 'pl-4'}`}
                            >
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${msgTo === b.id ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-800 text-zinc-400'}`}>{(b.name || '?')[0]}</div>
                              <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="font-medium text-sm text-zinc-200 leading-tight">{b.name}</div>
                                  <div className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">{b.shopName}</div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Finding the full barber object from the barbers list since messaging contacts are partials
                                    const fullBarber = barbers.find(barber => barber.userId === b.id || barber.id === b.id);
                                    if (fullBarber) setViewingBarberProfile(fullBarber);
                                  }}
                                  className="p-1.5 rounded-full bg-zinc-800 text-amber-500 hover:bg-amber-500 hover:text-zinc-900 transition-all shrink-0"
                                  title="Ver Perfil"
                                >
                                  <Info className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </button>
                          ))}
                        </>
                      ) : (
                        <>
                          {shopContacts.length === 0 && <div className="p-8 text-center text-xs text-zinc-500">No hay negocios previos.</div>}
                          {shopContacts.map((s: any) => (
                            <button
                              key={s.id}
                              onClick={() => setMsgTo(s.id)}
                              className={`w-full text-left p-4 hover:bg-zinc-800/50 transition flex items-center gap-3 border-b border-white/10/30 ${msgTo === s.id ? 'bg-amber-500/10 border-l-4 border-l-amber-500 pl-3' : 'pl-4'}`}
                            >
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${msgTo === s.id ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-800 text-zinc-400'}`}>{(s.name || '?')[0]}</div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm text-zinc-200 leading-tight">{s.name}</div>
                                <div className="text-[10px] text-zinc-500 mt-0.5">Soporte/Dueño</div>
                              </div>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                </div>

                {/* Chat View */}
                <div className={`absolute inset-0 flex flex-col transition-transform duration-300 ${msgTo ? 'translate-x-0' : 'translate-x-full'} z-10 bg-zinc-900/50`}>
                  {msgTo ? (
                    <>
                      <div className="p-4 border-b border-white/10 font-bold bg-zinc-900/80 flex items-center justify-between gap-3 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-zinc-900 shadow-lg shadow-amber-500/20">
                            {([...barberContacts, ...shopContacts].find(c => c.id === msgTo)?.name || '?')[0]}
                          </div>
                          <div>
                            <span className="text-lg">{[...barberContacts, ...shopContacts].find(c => c.id === msgTo)?.name}</span>
                            <p className="text-xs text-zinc-500">{[...barberContacts, ...shopContacts].find(c => c.id === msgTo)?.shopName}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setMsgTo('')}
                          className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#050505]/30">
                        {(() => {
                          const currentChatMessages = myMessages.filter(
                            m => (m.senderId === msgTo && m.receiverId === currentUser.id) ||
                              (m.senderId === currentUser.id && m.receiverId === msgTo)
                          ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

                          return currentChatMessages.length === 0 ? (
                            <div className="text-center py-20 opacity-50">
                              <MessageSquare className="h-12 w-12 mx-auto mb-2 text-zinc-600" />
                              <p>Inicia la conversación</p>
                            </div>
                          ) : (
                            currentChatMessages.map(msg => (
                              <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-md relative ${msg.senderId === currentUser.id
                                  ? 'bg-amber-500 text-zinc-900 rounded-br-none bg-gradient-to-br from-amber-400 to-orange-500 ml-4'
                                  : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700/50 mr-4'
                                  }`}>
                                  <div className="pb-4">{msg.content}</div>
                                  <div className={`absolute bottom-1 right-3 flex items-center gap-1 text-[10px] ${msg.senderId === currentUser.id ? 'text-zinc-800/70' : 'text-zinc-500'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {msg.senderId === currentUser.id && (
                                      <span>
                                        {msg.read ? (
                                          <CheckCheck className="h-3 w-3 text-zinc-900" />
                                        ) : (
                                          <Check className="h-3 w-3" />
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          );
                        })()}
                      </div>
                      <div className="p-4 border-t border-white/10 bg-zinc-900/50 backdrop-blur-md">
                        <div className="flex gap-2 relative">
                          <input
                            type="text"
                            value={msgContent}
                            onChange={e => setMsgContent(e.target.value)}
                            placeholder="Escribe un mensaje..."
                            className="flex-1 bg-zinc-800/80 border border-zinc-700/50 rounded-xl pl-4 pr-12 py-3 text-sm focus:border-amber-500 focus:bg-zinc-800 outline-none transition"
                            onKeyDown={e => e.key === 'Enter' && handleSendMsg()}
                          />
                          <button onClick={handleSendMsg} disabled={!msgContent.trim()} className="absolute right-2 top-2 p-1.5 bg-amber-500 rounded-lg text-zinc-900 hover:bg-amber-400 disabled:opacity-0 transition-all shadow-lg shadow-amber-500/20">
                            <Send className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* Profile */}
          {tab === 'profile' && (
            <div className="space-y-8 max-w-7xl mx-auto pb-10 animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-zinc-900 shadow-lg shadow-amber-500/20 shrink-0">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-tight">Tu Perfil</h1>
                  <p className="text-zinc-500 text-sm">Gestiona tu información personal y revisa tu actividad</p>
                </div>
              </div>

              <div className="md:col-span-2 rounded-3xl border border-white/5 bg-zinc-900/40 p-6 sm:p-8">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-amber-500" />
                  Información Personal Básica
                </h2>
                <div className="flex flex-col sm:flex-row gap-8">
                  <div className="flex flex-col items-center gap-3 shrink-0">
                    <div className="relative group">
                      <div className="h-32 w-32 rounded-[2rem] bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/30 flex items-center justify-center text-4xl font-black text-amber-500 overflow-hidden shadow-2xl">
                        {(currentUser.name || '?')[0]}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <Camera className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Foto de perfil</span>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="flex-1 space-y-6">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-zinc-500 tracking-widest">Nombre Completo</label>
                        <input
                          value={profileForm.name}
                          onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full bg-zinc-800 border border-white/5 rounded-2xl px-5 py-4 text-base focus:border-amber-500 outline-none transition"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-zinc-500 tracking-widest">Email (No editable)</label>
                        <input
                          value={profileForm.email}
                          disabled
                          className="w-full bg-zinc-800/50 border border-white/5 rounded-2xl px-5 py-4 text-base text-zinc-500 cursor-not-allowed transition"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-zinc-500 tracking-widest">Teléfono</label>
                        <input
                          value={profileForm.phone}
                          onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full bg-zinc-800 border border-white/5 rounded-2xl px-5 py-4 text-base focus:border-amber-500 outline-none transition"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-zinc-500 tracking-widest">Fecha de Nacimiento</label>
                        <input
                          type="date"
                          value={profileForm.birthday}
                          onChange={e => setProfileForm({ ...profileForm, birthday: e.target.value })}
                          className="w-full bg-zinc-800 border border-white/5 rounded-2xl px-5 py-4 text-base focus:border-amber-500 outline-none transition text-zinc-300"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-xs font-black uppercase text-zinc-500 tracking-widest">Biografía / Sobre Mí</label>
                        <textarea
                          value={profileForm.bio}
                          onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                          placeholder="Háblanos sobre ti..."
                          className="w-full bg-zinc-800 border border-white/5 rounded-2xl px-5 py-4 text-base focus:border-amber-500 outline-none h-32 resize-none transition"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col flex-col-reverse sm:flex-row gap-4 mt-8 pt-4 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => alert('Se enviará un correo para restablecer tu contraseña.')}
                        className="flex-1 w-full px-6 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-bold text-sm sm:text-base tracking-wide transition-all border border-white/5 flex items-center justify-center gap-2"
                      >
                        <Lock className="h-5 w-5 text-amber-500" />
                        Cambiar Contraseña
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 w-full px-6 py-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:opacity-90 text-zinc-900 rounded-2xl font-bold text-sm sm:text-base tracking-wide transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                {/* 2. Estado de Cuenta */}
                <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 sm:p-8 space-y-8">
                  <div>
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-amber-500" />
                      Estado de Cuenta
                    </h2>

                    <div className="bg-zinc-800 p-5 rounded-2xl border border-white/5 flex flex-col items-center sm:flex-row sm:items-center justify-between gap-6 mb-6">
                      <div className="text-center sm:text-left">
                        <p className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-1">Nivel Actual</p>
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <p className="font-black uppercase text-2xl text-amber-500">
                            Estándar
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-center sm:items-end">
                        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Status</span>
                        <span className="flex items-center gap-1 text-sm font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                          <CheckCircle className="h-4 w-4" /> ACTIVO
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-zinc-800/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <Calendar className="h-4 w-4 text-zinc-400 mb-2" />
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Miembro</p>
                        <p className="font-bold text-white text-xs">{currentUser.createdAt.split('T')[0]}</p>
                      </div>
                      <div className="bg-zinc-800/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <Star className="h-4 w-4 text-yellow-400 mb-2" />
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Reputación</p>
                        <p className="font-black text-yellow-400 text-lg">5.0</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Lock className="h-5 w-5 text-purple-500" />
                      Preferencias
                    </h2>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-zinc-800 p-3 rounded-xl border border-white/5">
                        <span className="text-sm font-bold">Modo Oscuro</span>
                        <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                          <div className="absolute right-1 top-[2px] h-4 w-4 bg-black rounded-full shadow-sm" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-zinc-800 p-3 rounded-xl border border-white/5">
                        <span className="text-sm font-bold">Idioma</span>
                        <select className="bg-transparent text-sm text-amber-500 font-bold outline-none cursor-pointer">
                          <option>Español (MX)</option>
                          <option>English (US)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Notificaciones y Estadísticas */}
                <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 sm:p-8 space-y-8">
                  <div>
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-teal-400" />
                      Notificaciones
                    </h2>
                    <div className="flex flex-col gap-4">
                      {[
                        { label: 'Recordatorios de citas', desc: 'Avisos antes de cada servicio' },
                        { label: 'Avisos de cancelaciones', desc: 'Cuando una cita se cancela' },
                        { label: 'Alertas de pagos', desc: 'Confirmaciones de ingresos' },
                        { label: 'Alertas de stock bajo', desc: 'Avisos de inventario (Dueños)' }
                      ].map(notif => (
                        <div key={notif.label} className="flex items-start gap-4 p-4 bg-zinc-800 rounded-2xl border border-white/5">
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-10 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                          </label>
                          <div>
                            <p className="font-bold text-sm text-white">{notif.label}</p>
                            <p className="text-[10px] text-zinc-500">{notif.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-400" />
                      Tus Estadísticas
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-zinc-800/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <Scissors className="h-4 w-4 text-emerald-400 mb-2" />
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Cortes</p>
                        <p className="font-black text-white text-lg">{completedCuts}</p>
                      </div>
                      <div className="bg-zinc-800/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <Clock className="h-4 w-4 text-blue-400 mb-2" />
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Próximos</p>
                        <p className="font-black text-blue-400 text-lg">{pendingApts}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>  {/* Danger Zone */}
              <div className="md:col-span-2 rounded-3xl border border-red-500/10 bg-red-500/5 p-6 sm:p-8">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-red-500">
                  <AlertTriangle className="h-5 w-5" />
                  Zona de Peligro & Acciones Extra
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={logout} className="w-full sm:flex-1 flex items-center justify-center gap-2 p-4 bg-zinc-900 rounded-2xl border border-white/5 hover:bg-zinc-800 transition font-bold text-sm text-zinc-300 hover:text-white group">
                    <LogOut className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300 transition shrink-0" />
                    Cerrar Sesión
                  </button>
                  <button
                    onClick={async () => {
                      const confirmed = window.confirm(
                        ' ¡Estás SEGURO de que deseas eliminar tu cuenta?\n\nEsta acción es PERMANENTE e irreversible.\nSe eliminarán todos tus datos.\n\nEscribe OK para confirmar.'
                      );
                      if (!confirmed) return;
                      const double = window.prompt('Para confirmar, escribe exactamente: ELIMINAR MI CUENTA');
                      if (double !== 'ELIMINAR MI CUENTA') {
                        alert('Texto incorrecto. Cuenta no eliminada.');
                        return;
                      }
                      try {
                        await deleteAccount();
                      } catch (err: any) {
                        alert('Error al eliminar cuenta: ' + (err.message || 'Error desconocido'));
                      }
                    }}
                    className="w-full sm:flex-1 flex items-center justify-center gap-2 p-4 bg-red-500/10 rounded-2xl border border-red-500/20 hover:bg-red-500/20 text-red-500 transition font-bold text-sm"
                  >
                    <Trash2 className="h-4 w-4 shrink-0" /> ELIMINAR CUENTA
                  </button>
                  <a href="mailto:soporte@plataformabarbera.com" className="w-full sm:flex-1 flex items-center justify-center gap-2 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 hover:bg-blue-500/20 text-blue-400 transition font-bold text-sm text-center">
                    <Info className="h-4 w-4 shrink-0" />
                    Contactar Soporte
                  </a>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Review Modal */}
      {
        showReviewModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <StarOutline className="h-5 w-5 text-amber-500" />
                  Calificar Servicio
                </h3>
                <button onClick={() => setShowReviewModal(false)} className="text-zinc-500 hover:text-white"><X className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleReviewSubmit} className="p-8 space-y-6">
                <div className="text-center">
                  <p className="text-sm text-zinc-400 mb-4">¿Cómo fue tu experiencia en {selectedAptForReview?.barbershopName}?</p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="transition-transform active:scale-90"
                      >
                        <Star
                          className={`h-10 w-10 ${star <= reviewForm.rating ? 'text-amber-500 fill-amber-500' : 'text-zinc-800'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block text-center">Cuéntanos más (Opcional)</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Excelente corte, muy profesional..."
                    className="w-full bg-zinc-800 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-amber-500 outline-none h-32 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-900 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-amber-500/20"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Calificación'}
                </button>
              </form>
            </div>
          </div>
        )
      }
      {/* Barber Profile Modal */}
      {
        viewingBarberProfile && (
          <div className="fixed inset-0 z-[350] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-xl bg-zinc-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative">
              <button
                onClick={() => setViewingBarberProfile(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="p-8 pb-0">
                <div className="flex items-center gap-6 mb-8">
                  <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl font-black text-zinc-900 shadow-2xl shadow-amber-500/20">
                    {viewingBarberProfile.name[0]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{viewingBarberProfile.name}</h3>
                    <p className="text-amber-500 font-bold uppercase tracking-widest text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-md inline-block mt-1">
                      {viewingBarberProfile.specialty}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-lg">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span className="text-xs font-black">{viewingBarberProfile.rating?.toFixed(1) || '5.0'}</span>
                      </div>
                      <span className="text-xs text-zinc-500 font-medium">{viewingBarberProfile.reviewCount || 0} Reseñas</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar pb-8">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <User className="h-3 w-3" /> Biografía
                    </h4>
                    <p className="text-sm text-zinc-300 leading-relaxed italic">
                      {viewingBarberProfile.bio || "Este barbero aún no ha agregado una biografía, pero su trabajo habla por sí solo."}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare className="h-3 w-3" /> Opiniones de Clientes
                    </h4>
                    <div className="space-y-3">
                      {reviews
                        .filter((r: any) => r.barberId === viewingBarberProfile.userId || r.barberId === viewingBarberProfile.id)
                        .slice(0, 5)
                        .map((rev: any) => (
                          <div key={rev.id} className="bg-zinc-800/50 border border-white/5 p-4 rounded-2xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-white">{rev.userName}</span>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-2.5 w-2.5 ${i < rev.rating ? 'text-yellow-400 fill-current' : 'text-zinc-700'}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-zinc-400 italic">"{rev.comment}"</p>
                          </div>
                        ))}
                      {reviews.filter((r: any) => r.barberId === viewingBarberProfile.userId || r.barberId === viewingBarberProfile.id).length === 0 && (
                        <div className="text-center py-6 border-2 border-dashed border-white/5 rounded-2xl">
                          <Star className="h-6 w-6 text-zinc-800 mx-auto mb-2" />
                          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Sin reseñas aún</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-zinc-800/50 border-t border-white/5 flex gap-3">
                <button
                  onClick={() => setViewingBarberProfile(null)}
                  className="flex-1 py-3 rounded-2xl bg-zinc-800 text-zinc-400 font-bold text-xs uppercase tracking-widest hover:text-white transition-all"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setSelectedBarberId(viewingBarberProfile.id);
                    setViewingBarberProfile(null);
                  }}
                  className="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-900 font-black text-sm uppercase tracking-tighter italic shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
                >
                  Seleccionar Barbero
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
