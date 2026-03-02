import { useState, useEffect, useRef } from 'react';
import { useData } from '@/contexts/DataContext';
import type { Barber } from '@/types';
import {
  Scissors, Calendar, MessageSquare, User, Clock,
  CheckCircle, XCircle, TrendingUp, LogOut, Send, Star,
  Store, Search, Bell, AlertCircle,
  BarChart3, LayoutDashboard, Plus, Menu, X, Trash2, AlertTriangle, ArrowLeft,
  Eye, Camera, Lock, Activity, Info, Sparkles
} from 'lucide-react';

import { MiniCalendar } from '@/components/MiniCalendar';
import { Logo } from '@/components/Logo';
import { AdSlot } from '@/components/AdSlot';
import { InterstitialAd } from '@/components/InterstitialAd';
import { CampaignBanner } from '@/components/CampaignBanner';

type Tab = 'overview' | 'appointments' | 'agenda' | 'messages' | 'profile';

export default function BarberDashboard() {
  const {
    currentUser, logout, barbershops, barbers,
    getBarberAppointments, updateAppointmentStatus, addAppointment, joinBarbershop,
    getUserMessages, sendMessage, markAsRead, loading, isInitialSyncing, updateBarber, updateProfile, deleteAccount, campaigns
  } = useData();
  const [tab, setTab] = useState<Tab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [msgTo, setMsgTo] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [msgSubTab, setMsgSubTab] = useState<'clients' | 'owner'>('clients');
  const [isJoining, setIsJoining] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const lastAdTime = useRef(Date.now()); // Initialize with current time for initial grace period

  // Interstitial Ad Logic
  const handleTabChange = (newTab: Tab) => {
    if (newTab !== tab) {
      setTab(newTab);
      setIsSidebarOpen(false);

      const now = Date.now();

      // Calculate shop and profile here to ensure latest data is used
      const myBarberProfile = barbers.find(b => b.userId === currentUser?.id && b.isApproved && (b.barbershopId || b.isIndependent)) || barbers.find(b => b.userId === currentUser?.id);
      const myShop = barbershops.find(s => s.id === myBarberProfile?.barbershopId);
      const isFreePlan = myShop?.plan === 'free' || myShop?.plan === 'basic';

      // Check if 1 minute (60000ms) has passed since last ad/load AND plan is free
      if (isFreePlan && now - lastAdTime.current > 60000) {
        setShowInterstitial(true);
        lastAdTime.current = now;
      }
    } else {
      setIsSidebarOpen(false);
    }
  };


  const [showManualApt, setShowManualApt] = useState(false);


  const [manualClientName, setManualClientName] = useState('');
  const [manualService, setManualService] = useState('');
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState('');
  const [manualPrice, setManualPrice] = useState('150');

  const formatTime12h = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    let h = parseInt(hours);
    const m = minutes || '00';
    const ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${m} ${ampm}`;
  };

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    email: '',
    specialty: '',
    bio: '',
    birthday: ''
  });

  // Notification Settings
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [timer1, setTimer1] = useState(10); // Minutes
  const [timer2, setTimer2] = useState(30); // Minutes
  const notifiedRef = useRef<Set<string>>(new Set());

  // Load settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('barberSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setNotifEnabled(parsed.enabled ?? true);
      setTimer1(parsed.timer1 ?? 10);
      setTimer2(parsed.timer2 ?? 30);
    }
  }, []);

  const saveSettings = (enabled: boolean, t1: number, t2: number) => {
    setNotifEnabled(enabled);
    setTimer1(t1);
    setTimer2(t2);
    localStorage.setItem('barberSettings', JSON.stringify({ enabled, timer1: t1, timer2: t2 }));
    alert('Configuración guardada.');
  };

  if (loading || isInitialSyncing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
        <div className="flex flex-col items-center gap-8">
          <div className="relative">
            <div className="h-20 w-20 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Logo className="scale-30 opacity-60 grayscale invert" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-lg font-bold tracking-tight">Sincronizando Perfil...</h2>
            <p className="text-zinc-500 text-xs animate-pulse max-w-[200px] mx-auto leading-relaxed">
              {loading ? 'Identificando cuenta de barbero...' : 'Cargando agenda y mensajes...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  // Priorizar perfil que tenga barbería o sea independiente
  const myBarberProfile = barbers.find(b => b.userId === currentUser.id && b.isApproved && (b.barbershopId || b.isIndependent))
    || barbers.find(b => b.userId === currentUser.id);

  const myAppointments = myBarberProfile ? getBarberAppointments(myBarberProfile.id) : [];
  const myMessages = currentUser ? getUserMessages(currentUser.id) : [];

  // Sync Profile Form when loaded
  useEffect(() => {
    if (myBarberProfile) {
      setProfileForm({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        email: currentUser.email || '',
        specialty: myBarberProfile?.specialty || '',
        bio: myBarberProfile?.bio || '',
        birthday: currentUser.birthday || ''
      });
    }
  }, [myBarberProfile, currentUser]);

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const pendingRequests = myAppointments.filter(a => a.status === 'pending');
  const futureAppointments = myAppointments.filter(a => a.status === 'confirmed' && a.date >= todayStr);
  const pending = [...pendingRequests]; // Compatibility for notifications/logic that only wants requests

  const completed = myAppointments.filter(a => a.status === 'completed');
  const totalEarned = completed.reduce((s, a) => s + a.price, 0);

  // Notification Logic
  useEffect(() => {
    if (!notifEnabled) return;
    const checkNotifications = () => {
      pending.forEach(apt => {
        const created = new Date(apt.createdAt).getTime();
        const now = Date.now();
        const diffMinutes = (now - created) / 1000 / 60;
        if (diffMinutes < 1 && !notifiedRef.current.has(apt.id + '_new')) {
          try { if (Notification.permission === 'granted') new Notification('Nueva Cita', { body: `Solicitud de ${apt.clientName}` }); } catch (e) { }
          notifiedRef.current.add(apt.id + '_new');
        }
        if (diffMinutes >= timer1 && diffMinutes < timer1 + 2 && !notifiedRef.current.has(apt.id + '_t1')) {
          try { if (Notification.permission === 'granted') new Notification('Recordatorio', { body: `Han pasado ${timer1} min. Responde a ${apt.clientName}` }); } catch (e) { }
          notifiedRef.current.add(apt.id + '_t1');
        }
      });
    };
    if (Notification.permission === 'default') Notification.requestPermission();
    const interval = setInterval(checkNotifications, 10000);
    return () => clearInterval(interval);
  }, [pending, notifEnabled, timer1, timer2]);

  // Messaging Logic
  const messageContacts = [...new Set(myMessages.map(m => {
    const isSender = m.senderId === currentUser.id;
    return JSON.stringify({
      id: isSender ? m.receiverId : m.senderId,
      name: isSender ? m.receiverName : m.senderName,
      role: isSender ? m.receiverRole : m.senderRole
    });
  }))].map((c: any) => JSON.parse(c));

  // Auto-cancel logic for past pending appointments
  useEffect(() => {
    if (myAppointments.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const pastPending = myAppointments.filter(apt => {
        if (apt.status !== 'pending') return false;
        const aptDate = new Date(apt.date);
        return aptDate < today;
      });

      if (pastPending.length > 0) {
        // Auto-cancel silenciosamente sin mostrar errores al usuario
        pastPending.forEach(async (apt) => {
          try {
            await updateAppointmentStatus(apt.id, 'lost');
          } catch (error) {
            console.error('Error auto-canceling past appointment:', error);
            // No mostrar alert para no molestar al usuario
          }
        });
      }
    }
  }, [myAppointments, updateAppointmentStatus]);

  const shopClients = [...new Set(myAppointments.filter(a => a.clientId).map(a => JSON.stringify({ id: a.clientId, name: a.clientName, role: 'client' })))].map((c: any) => JSON.parse(c));

  const clientContacts = [
    ...shopClients,
    ...messageContacts.filter(c => c.role === 'client')
  ].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

  const myShop = barbershops.find(s => s.id === myBarberProfile?.barbershopId);
  const ownerContact = myShop ? { id: myShop.ownerId, name: 'Dueño (Barbería)', role: 'owner' } : null;
  const isFreePlan = myShop?.plan === 'free' || myShop?.plan === 'basic';

  const ownerContacts = [
    ...(ownerContact ? [ownerContact] : []),
    ...messageContacts.filter(c => c.role === 'owner')
  ].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

  const handleSendMsg = async () => {
    if (!msgTo || !msgContent.trim()) return;
    const contact = [...clientContacts, ...ownerContacts].find(c => c.id === msgTo);
    if (!contact) return;
    setIsSendingMessage(true);
    try {
      await sendMessage({
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: 'barber',
        receiverId: contact.id,
        receiverName: contact.name,
        receiverRole: contact.role as any,
        content: msgContent.trim(),
        barbershopId: myBarberProfile?.barbershopId || '',
      });
      setMsgContent('');
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      alert('Error al enviar el mensaje.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: any) => {
    setIsUpdatingStatus(true);
    try {
      await updateAppointmentStatus(id, status);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar el estado de la cita.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { bg: string; text: string; icon: typeof CheckCircle }> = {
      pending: { bg: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20', text: 'Pendiente', icon: Clock },
      confirmed: { bg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', text: 'Confirmada', icon: CheckCircle },
      completed: { bg: 'bg-green-500/10 text-green-400 border border-green-500/20', text: 'Completada', icon: CheckCircle },
      cancelled: { bg: 'bg-red-500/10 text-red-500 border border-red-500/20', text: 'Cancelada', icon: XCircle },
      lost: { bg: 'bg-zinc-800/50 text-zinc-500 border border-zinc-700', text: 'Perdida', icon: XCircle },
    };
    const info = map[s] || map.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase ${info.bg} shadow-sm`}>
        <info.icon className="h-2.5 w-2.5" /> {info.text}
      </span>
    );
  };

  const handleManualAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myBarberProfile) return;
    setIsAddingAppointment(true);
    try {
      await addAppointment({
        clientId: null as any,
        clientName: manualClientName || 'Cliente Manual',
        clientPhone: '',
        barberId: myBarberProfile.id,
        barberName: myBarberProfile.name,
        barbershopId: myBarberProfile.barbershopId || '',
        barbershopName: myBarberProfile.barbershopName || '',
        service: manualService || 'Corte General (Manual)',
        date: manualDate,
        time: manualTime,
        price: parseFloat(manualPrice) || 0,
        status: 'confirmed'
      });
      setShowManualApt(false);
      setManualClientName('');
      setManualService('');
      setManualDate('');
      setManualTime('');
    } catch (error) {
      console.error('Error al registrar cita:', error);
      alert('Error al registrar la cita. Por favor, intenta de nuevo.');
    } finally {
      setIsAddingAppointment(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myBarberProfile) return;
    setIsUpdatingProfile(true);
    try {
      // Update main user profile
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        birthday: profileForm.birthday
      });

      // Update barber-specific profile
      const barberUpdateData: Partial<Barber> = {};
      if (profileForm.specialty) barberUpdateData.specialty = profileForm.specialty;
      if (profileForm.bio) barberUpdateData.bio = profileForm.bio;

      if (Object.keys(barberUpdateData).length > 0) {
        await updateBarber(myBarberProfile.id, barberUpdateData);
      }
      alert('Perfil actualizado correctamente.');
    } catch (error) {
      console.error(error);
      alert('Error al actualizar perfil');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleJoinShop = async (shopId: string) => {
    if (confirm('¿Quieres enviar una solicitud para unirte a esta barbería?')) {
      setIsJoining(true);
      try {
        await joinBarbershop(currentUser.id, shopId);
        alert('Solicitud enviada al dueño.');
      } catch (error) {
        console.error('Error al enviar solicitud:', error);
        alert('Error al enviar la solicitud. Por favor, intenta de nuevo.');
      } finally {
        setIsJoining(false);
      }
    }
  };

  // Mark messages as read when opening a conversation
  useEffect(() => {
    if (tab === 'messages' && msgTo) {
      const currentChatMessages = myMessages.filter(
        m => (m.senderId === msgTo && m.receiverId === currentUser.id) ||
          (m.senderId === currentUser.id && m.receiverId === msgTo)
      );

      const unreadIds = currentChatMessages
        .filter(m => m.receiverId === currentUser.id && !m.read)
        .map(m => m.id);

      if (unreadIds.length > 0) {
        Promise.all(unreadIds.map(id => markAsRead(id)));
      }
    }
  }, [tab, msgTo, myMessages, currentUser.id, markAsRead]);

  // Current Chat Messages for rendering (memoized)
  const currentChatMessages = [...myMessages]
    .filter(m => (m.senderId === msgTo && m.receiverId === currentUser.id) || (m.senderId === currentUser.id && m.receiverId === msgTo))
    .sort((a, b) => new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime());

  const navItems: { id: Tab; label: string; icon: typeof Calendar }[] = [
    { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
    { id: 'appointments', label: 'Citas', icon: Calendar },
    { id: 'agenda', label: 'Agenda', icon: Clock },
    { id: 'messages', label: 'Mensajes', icon: MessageSquare },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-zinc-900 border-b border-white/10 p-4">
        <div className="flex items-center gap-2 group">
          <Logo className="scale-75 origin-left" noLink />
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-zinc-400 hover:text-white">
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-white/5 bg-[#050505] transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-2.5 p-6 pb-4">
          <Logo />
        </div>

        <div className="px-6 py-3">
          <div className="rounded-xl bg-zinc-900/50 border border-white/10 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-bold text-white">
                {(currentUser.name || '?')[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{currentUser.name || 'Usuario'}</p>
                <p className="text-xs text-zinc-500">Barbero</p>
              </div>
            </div>
            {myBarberProfile?.barbershopId && (
              <div className="mt-2 text-xs text-blue-400/80 flex items-center gap-1">
                <Store className="h-3 w-3" /> {myBarberProfile.barbershopName}
              </div>
            )}
          </div>
        </div>

        {!myBarberProfile?.barbershopId ? (
          <nav className="flex-1 px-3 py-2 space-y-1">
            <button onClick={() => handleTabChange('overview')} className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${tab === 'overview' ? 'bg-blue-500/10 text-blue-400' : 'text-zinc-400 hover:text-white'}`}>
              <Search className="h-5 w-5" /> Buscar Barbería
            </button>
            <button onClick={() => handleTabChange('profile')} className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${tab === 'profile' ? 'bg-blue-500/10 text-blue-400' : 'text-zinc-400 hover:text-white'}`}>
              <User className="h-5 w-5" /> Mi Perfil
            </button>
          </nav>
        ) : (
          <nav className="flex-1 px-3 py-2 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${tab === item.id ? 'bg-blue-500/10 text-blue-400' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                {item.id === 'appointments' && pending.length > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-[10px] font-bold text-zinc-900">{pending.length}</span>
                )}
              </button>
            ))}
          </nav>
        )}

        <div className="border-t border-white/5 p-3">
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400">
            <LogOut className="h-5 w-5" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <main className="flex-1 p-4 lg:p-8 mt-16 lg:mt-0 overflow-y-auto w-full">
          {/* Banners de Campaña */}
          {(campaigns || []).filter(c => c.isActive && (c.target === 'all' || c.target === 'barber')).length > 0 && (
            <div className="space-y-2 mb-6">
              {(campaigns || []).filter(c => c.isActive && (c.target === 'all' || c.target === 'barber')).map(c => (
                <CampaignBanner key={c.id} campaign={c} />
              ))}
            </div>
          )}
          {tab === 'overview' && (
            <div>
              {!myBarberProfile?.barbershopId && !myBarberProfile?.isIndependent ? (
                <div>
                  {/* Banner informativo si fue recién contratado */}
                  {!myBarberProfile && (
                    <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
                      <div className="flex items-start gap-3">
                        <Bell className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-blue-300 mb-1">
                            ¿Acabas de ser contratado?
                          </p>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            Si un dueño acaba de aprobar tu solicitud, <strong className="text-white">presiona F5 para refrescar</strong> la página y ver tu panel completo con citas y clientes.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                      <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic">Encuentra trabajo</h1>
                      <p className="text-zinc-500 text-sm">Postúlate a una barbería o comienza por tu cuenta.</p>
                    </div>
                  </div>

                  {/* Independent Option Card */}
                  <div className="mb-10 relative group overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-600/20 to-blue-900/10 p-8 shadow-2xl shadow-blue-500/10">
                    <div className="absolute top-0 right-0 -m-4 h-32 w-32 bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-500/20">
                          <Star className="h-3 w-3 fill-blue-400" /> Nuevo: Membresía Prime
                        </div>
                        <h2 className="text-3xl font-black text-white mb-3">Trabaja de forma Independiente</h2>
                        <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
                          ¿No quieres depender de una barbería física? Activa el modo <strong>A Domicilio</strong>.
                          Aparece en el directorio nacional, gestiona tu propio calendario y quédate con el 100% de tus ganancias.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                            <CheckCircle className="h-3.5 w-3.5 text-blue-400" /> Agenda propia
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                            <CheckCircle className="h-3.5 w-3.5 text-blue-400" /> Chat con clientes
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                            <CheckCircle className="h-3.5 w-3.5 text-blue-400" /> Mayor visibilidad
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                        <div className="text-2xl font-black text-white mb-1 uppercase tracking-tight">Próximamente</div>
                        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-4">Membresía Prime</p>
                        <button
                          disabled
                          className="w-full px-8 py-3 bg-zinc-800 text-zinc-500 font-black text-xs uppercase tracking-widest rounded-xl transition-all opacity-50 cursor-not-allowed"
                        >
                          Próximamente
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">O únete a una barbería</span>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {barbershops.filter(b => b.isPublic).map(shop => (
                      <div key={shop.id} className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 hover:border-zinc-700 transition">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"><Store className="h-6 w-6 text-white" /></div>
                          <div><h3 className="font-bold">{shop.name}</h3><p className="text-xs text-zinc-500">{shop.address}</p></div>
                        </div>
                        <button onClick={() => handleJoinShop(shop.id)} disabled={isJoining} className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition border border-white/10">
                          {isJoining ? 'Enviando...' : 'Solicitar Unirse'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl font-bold mb-1">Panel de Control</h1>
                  <p className="text-zinc-400 text-sm mb-8">Bienvenido, {(currentUser.name || 'Invitado').split(' ')[0]}</p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    {[
                      { label: 'Cortes completados', value: completed.length, icon: Scissors, color: 'from-emerald-400 to-emerald-600' },
                      { label: 'Citas Pendientes', value: pendingRequests.length + futureAppointments.length, icon: Clock, color: 'from-purple-400 to-purple-600' },
                      { label: 'Mensajes sin leer', value: myMessages.filter(m => m.receiverId === currentUser.id && !m.read).length, icon: MessageSquare, color: 'from-blue-400 to-blue-600' },
                      { label: 'Ingresos Totales', value: `$${totalEarned}`, icon: BarChart3, color: 'from-amber-400 to-orange-500' },
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

                  {pendingRequests.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Bell className="h-5 w-5 text-yellow-400" /> Solicitudes Pendientes
                      </h2>
                      <div className="space-y-3">
                        {pendingRequests.map(apt => (
                          <div key={apt.id} className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 transition hover:bg-yellow-500/10">
                            <div className="flex items-center gap-4 mb-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400 shrink-0">
                                <User className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-base font-bold text-white truncate">{apt.clientName || 'Cliente'}</p>
                                <p className="text-xs text-zinc-400 truncate mt-0.5">
                                  {apt.service} <span className="mx-1 text-zinc-600">|</span> {apt.barberName || myBarberProfile?.name}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 w-full">
                                  <span className="flex items-center gap-1.5 text-xs text-zinc-500"><Calendar className="h-3 w-3" /> {apt.date}</span>
                                  <span className="flex items-center gap-1.5 text-xs text-zinc-500"><Clock className="h-3 w-3" /> {formatTime12h(apt.time)}</span>
                                  <span className="text-xs font-bold text-white bg-white/5 px-2 py-0.5 rounded-lg ml-auto">${apt.price}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end pt-2 border-t border-yellow-500/10">
                              <button onClick={() => handleUpdateStatus(apt.id, 'confirmed')} className="rounded-lg bg-green-500/10 px-4 py-2 text-xs font-bold text-green-400 hover:bg-green-500/20 transition flex-1 sm:flex-none text-center">Aceptar</button>
                              <button onClick={() => handleUpdateStatus(apt.id, 'cancelled')} className="rounded-lg bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition flex-1 sm:flex-none text-center">Rechazar</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}



                  <div className="grid gap-6 lg:grid-cols-2 mb-8">
                    <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
                      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" /> Ingresos (7 días)
                      </h3>
                      <div className="flex items-end justify-between h-48 gap-2">
                        {Array.from({ length: 7 }, (_, i) => {
                          const d = new Date();
                          d.setDate(d.getDate() - (6 - i));
                          const date = d.toISOString().split('T')[0];
                          const dailyRevenue = myAppointments.filter(a => a.date === date && a.status === 'completed').reduce((sum, a) => sum + (a.price || 0), 0);
                          const maxRev = Math.max(...Array.from({ length: 7 }, (_, j) => {
                            const d2 = new Date(); d2.setDate(d2.getDate() - (6 - j));
                            const dStr = d2.toISOString().split('T')[0];
                            return myAppointments.filter(a => a.date === dStr && a.status === 'completed').reduce((s, a) => s + (a.price || 0), 0);
                          }), 500);
                          const height = (dailyRevenue / maxRev) * 100;
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                              <div className="absolute -top-8 bg-zinc-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">${dailyRevenue}</div>
                              <div className="w-full bg-blue-500/20 rounded-t-lg hover:bg-blue-500/40 transition relative group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]" style={{ height: `${Math.max(height, 5)}%` }}></div>
                              <span className="text-[10px] text-zinc-500">{date.slice(8)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
                      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Scissors className="h-5 w-5 text-purple-500" /> Cortes (7 días)
                      </h3>
                      <div className="flex items-end justify-between h-48 gap-2">
                        {Array.from({ length: 7 }, (_, i) => {
                          const d = new Date();
                          d.setDate(d.getDate() - (6 - i));
                          const date = d.toISOString().split('T')[0];
                          const totalApts = myAppointments.filter(a => a.date === date).length;
                          const completedCuts = myAppointments.filter(a => a.date === date && a.status === 'completed').length;
                          const maxCount = Math.max(...Array.from({ length: 7 }, (_, j) => {
                            const d2 = new Date(); d2.setDate(d2.getDate() - (6 - j));
                            const dStr = d2.toISOString().split('T')[0];
                            return myAppointments.filter(a => a.date === dStr).length;
                          }), 3);
                          const hTotal = (totalApts / maxCount) * 100;
                          const hCuts = (completedCuts / maxCount) * 100;
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                              <div className="absolute -top-12 bg-zinc-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">{completedCuts} cortes / {totalApts} citas</div>
                              <div className="w-full flex items-end h-full relative">
                                <div className="w-1/2 bg-purple-500/20 rounded-t-sm" style={{ height: `${Math.max(hTotal, 5)}%` }} />
                                <div className="w-1/2 bg-blue-500/20 rounded-t-sm absolute bottom-0 right-0" style={{ height: `${Math.max(hCuts, 0)}%` }} />
                              </div>
                              <span className="text-[10px] text-zinc-500">{date.slice(8)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* AdSlot below charts - Only for Free/Basic plans (slot único para Barber Overview) */}
                  {isFreePlan && (
                    <AdSlot
                      adClient="ca-pub-3430296497693127"
                      adSlot="4002227989"
                      adFormat="auto"
                      className="mb-8"
                    />
                  )}
                </div>
              )}

            </div>
          )}

          {tab === 'appointments' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-white">Gestión de Citas</h1>
                  <p className="text-sm text-zinc-400 mt-1">Control de flujo de clientes y servicios</p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowManualApt(true)}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 active:scale-95"
                  >
                    <Plus className="h-4 w-4" /> Registrar Venta Directa
                  </button>
                </div>
              </div>

              {/* Citas Pendientes por Cerrar (pasadas de hoy) */}
              {(() => {
                const now = new Date();
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                const pastApts = myAppointments
                  .filter(a => {
                    if (a.date !== todayStr) return false;
                    if (a.status === 'cancelled' || a.status === 'completed' || a.status === 'lost') return false;
                    const aptDate = new Date(`${a.date}T${a.time}`);
                    return aptDate < now;
                  })
                  .sort((a, b) => a.time.localeCompare(b.time));

                if (pastApts.length === 0) return null;

                return (
                  <div className="mb-8 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 shadow-lg shadow-amber-500/5">
                    <h2 className="text-base font-bold mb-3 flex items-center gap-2 text-amber-400">
                      <AlertCircle className="h-4 w-4" /> Citas Pendientes por Cerrar
                    </h2>
                    <div className="space-y-2">
                      {pastApts.map(apt => {
                        const [hours, minutes] = (apt.time || "00:00").split(':');
                        const h = parseInt(hours, 10);
                        const ampm = h >= 12 ? 'PM' : 'AM';
                        const h12 = h % 12 || 12;
                        const time12 = `${h12}:${minutes} ${ampm}`;
                        return (
                          <div key={'past-' + apt.id} className="flex flex-col gap-3 rounded-lg bg-zinc-900 border border-white/10 p-3 hover:border-amber-500/30 transition shadow-sm overflow-hidden text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="text-center bg-zinc-800 rounded-xl px-3 py-2.5 shrink-0 border border-white/5 flex flex-col items-center justify-center gap-0.5 min-h-[70px]">
                                  <span className="block text-[10px] font-black text-amber-400 uppercase tracking-widest">PASADA</span>
                                  <span className="block text-base font-black text-white whitespace-nowrap leading-tight">{time12}</span>
                                  <span className="block text-[10px] text-zinc-500 font-medium whitespace-nowrap">{apt.date}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-base font-bold text-white leading-tight">{apt.clientName || 'Cliente'}</p>
                                  <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                                    {apt.service} <span className="mx-1 text-zinc-600">|</span> {myShop?.name || 'Barbería'}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                                    <span className="text-xs font-bold text-white bg-white/5 px-2 py-0.5 rounded-lg">${apt.price}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-end">{statusBadge(apt.status)}</div>
                            </div>
                            <div className="flex flex-wrap justify-end gap-2 mt-1 sm:mt-0">
                              <button
                                onClick={() => handleUpdateStatus(apt.id, 'completed')}
                                disabled={isUpdatingStatus}
                                className="w-full sm:w-auto rounded-lg bg-green-600 hover:bg-green-500 px-3 py-1.5 text-xs font-medium text-white transition flex items-center justify-center gap-1 disabled:opacity-50"
                              >
                                <CheckCircle className="h-3 w-3" /> Completar
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                                disabled={isUpdatingStatus}
                                className="flex-1 sm:flex-none rounded-lg bg-red-600 hover:bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition flex items-center justify-center gap-1 disabled:opacity-50"
                              >
                                <XCircle className="h-3 w-3" /> No Asistió
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Citas de Hoy */}
              <div className="mb-8 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 shadow-lg shadow-blue-500/5">
                <h2 className="text-base font-bold mb-3 flex items-center gap-2 text-blue-400">
                  <Calendar className="h-4 w-4" /> Citas de Hoy
                </h2>
                <div className="space-y-2">
                  {(() => {
                    const now = new Date();
                    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                    const todayApts = myAppointments
                      .filter(a => {
                        if (a.date !== todayStr) return false;
                        if (a.status === 'cancelled' || a.status === 'completed' || a.status === 'lost') return false;
                        const aptDate = new Date(`${a.date}T${a.time}`);
                        return aptDate >= now;
                      })
                      .sort((a, b) => a.time.localeCompare(b.time));

                    if (todayApts.length === 0) return <p className="text-sm text-zinc-500">No hay citas activas para hoy.</p>;

                    return todayApts.map(apt => {
                      const [hours, minutes] = (apt.time || "00:00").split(':');
                      const h = parseInt(hours, 10);
                      const ampm = h >= 12 ? 'PM' : 'AM';
                      const h12 = h % 12 || 12;
                      const time12 = `${h12}:${minutes} ${ampm}`;
                      return (
                        <div key={'today-' + apt.id} className="flex flex-col gap-3 rounded-lg bg-zinc-900 border border-white/10 p-3 hover:border-blue-500/30 transition shadow-sm overflow-hidden text-left">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="text-center bg-zinc-800 rounded-xl px-3 py-2.5 shrink-0 border border-white/5 flex flex-col items-center justify-center gap-0.5 min-h-[70px]">
                                <span className="block text-[10px] font-black text-blue-400 uppercase tracking-widest">HOY</span>
                                <span className="block text-base font-black text-white whitespace-nowrap leading-tight">{time12}</span>
                                <span className="block text-[10px] text-zinc-500 font-medium whitespace-nowrap">{apt.date}</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-base font-bold text-white leading-tight">{apt.clientName || 'Cliente'}</p>
                                <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{apt.service} <span className="mx-1 text-zinc-600">|</span> {myShop?.name || 'Barbería'}</p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                                  <span className="text-xs font-bold text-white bg-white/5 px-2 py-0.5 rounded-lg">${apt.price}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-end">{statusBadge(apt.status)}</div>
                          </div>
                          <div className="flex flex-wrap justify-end gap-2 mt-1 sm:mt-0">
                            {apt.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                                  disabled={isUpdatingStatus}
                                  className="flex-1 sm:flex-none rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition flex items-center justify-center gap-1 disabled:opacity-50"
                                >
                                  <CheckCircle className="h-3 w-3" /> Confirmar
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                                  disabled={isUpdatingStatus}
                                  className="flex-1 sm:flex-none rounded-lg bg-red-600 hover:bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition flex items-center justify-center gap-1 disabled:opacity-50"
                                >
                                  <XCircle className="h-3 w-3" /> Rechazar
                                </button>
                              </>
                            )}
                            {apt.status === 'confirmed' && (
                              <>
                                <button onClick={() => handleUpdateStatus(apt.id, 'completed')} className="flex-1 sm:flex-none rounded-lg bg-green-600 hover:bg-green-500 px-3 py-1.5 text-xs font-medium text-white transition flex items-center justify-center gap-1">
                                  <CheckCircle className="h-3 w-3" /> Completar
                                </button>
                                <button onClick={() => handleUpdateStatus(apt.id, 'cancelled')} className="flex-1 sm:flex-none rounded-lg bg-red-600 hover:bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition flex items-center justify-center gap-1">
                                  <XCircle className="h-3 w-3" /> Cancelar
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              <h2 className="text-lg font-bold mb-4">Todas las Citas</h2>
              <div className="space-y-3">
                {(() => {
                  const now = new Date();
                  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                  const filtered = myAppointments
                    .filter(apt => {
                      if (apt.status === 'completed' || apt.status === 'cancelled' || apt.status === 'lost') return false;
                      if (apt.date <= todayStr) return false;
                      return true;
                    })
                    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-16 text-zinc-500">
                        <Calendar className="mx-auto h-12 w-12 mb-3 text-zinc-700" />
                        <p className="text-lg">No hay citas futuras</p>
                      </div>
                    );
                  }

                  return filtered.map(apt => (
                    <div key={apt.id} className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 sm:p-5 overflow-hidden text-left">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                              <Scissors className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-white text-base leading-tight">{apt.clientName || 'Cliente'}</h3>
                              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{apt.service} <span className="mx-1 text-zinc-600">|</span> {myShop?.name || 'Barbería'}</p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 w-full">
                                <span className="flex items-center gap-1.5 text-xs text-zinc-500"><Calendar className="h-3 w-3" /> {apt.date}</span>
                                <span className="flex items-center gap-1.5 text-xs text-zinc-500"><Clock className="h-3 w-3" /> {formatTime12h(apt.time)}</span>
                                <span className="text-xs font-bold text-white bg-white/5 px-2 py-0.5 rounded-lg ml-auto">${apt.price}</span>
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0">{statusBadge(apt.status)}</div>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-white/5">
                          {apt.status === 'pending' && (
                            <>
                              <button onClick={() => handleUpdateStatus(apt.id, 'confirmed')} className="flex-1 sm:flex-none rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-2 text-xs font-bold text-white transition flex items-center justify-center gap-2">
                                <CheckCircle className="h-4 w-4" /> Confirmar
                              </button>
                              <button onClick={() => handleUpdateStatus(apt.id, 'cancelled')} className="flex-1 sm:flex-none rounded-lg bg-red-600 hover:bg-red-500 px-3 py-2 text-xs font-bold text-white transition flex items-center justify-center gap-2">
                                <XCircle className="h-4 w-4" /> Rechazar
                              </button>
                            </>
                          )}
                          {apt.status === 'confirmed' && (
                            <button onClick={() => handleUpdateStatus(apt.id, 'cancelled')} className="w-full sm:w-auto rounded-lg bg-red-600 hover:bg-red-500 px-3 py-2 text-xs font-bold text-white transition flex items-center justify-center gap-2">
                              <XCircle className="h-4 w-4" /> Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {showManualApt && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
              <div className="w-full max-w-xl bg-zinc-900 border border-white/10 rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 italic uppercase tracking-tighter">
                      <Plus className="h-5 w-5 text-blue-500" /> Registrar Venta / Cita
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">Ingresa los detalles para el registro manual</p>
                  </div>
                  <button onClick={() => setShowManualApt(false)} className="p-2 rounded-full hover:bg-white/5 transition">
                    <X className="h-5 w-5 text-zinc-500 hover:text-white" />
                  </button>
                </div>

                <form onSubmit={handleManualAppointment} className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nombre Cliente</label>
                    <input
                      className="w-full bg-zinc-800/50 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500/50 transition-all font-bold placeholder:text-zinc-600"
                      placeholder="Ej. Juan Pérez"
                      value={manualClientName}
                      onChange={e => setManualClientName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Servicio</label>
                    <input
                      className="w-full bg-zinc-800/50 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500/50 transition-all font-bold placeholder:text-zinc-600"
                      placeholder="Ej. Corte y Barba"
                      value={manualService}
                      onChange={e => setManualService(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Precio ($)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                      <input
                        className="w-full bg-zinc-800/50 border border-white/5 rounded-xl pl-8 pr-4 py-3 text-sm outline-none focus:border-blue-500/50 transition-all font-bold"
                        type="number"
                        placeholder="0"
                        value={manualPrice === '0' ? '' : manualPrice}
                        onChange={e => setManualPrice(e.target.value === '' ? '0' : e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Fecha</label>
                    <input
                      className="w-full bg-zinc-800/50 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500/50 transition-all font-bold text-white [color-scheme:dark]"
                      type="date"
                      value={manualDate}
                      onChange={e => setManualDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Hora</label>
                    <input
                      className="premium-clock w-full bg-zinc-800/50 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500/50 transition-all font-bold text-white [color-scheme:dark]"
                      type="time"
                      value={manualTime}
                      onChange={e => setManualTime(e.target.value)}
                      required
                    />
                  </div>

                  <div className="sm:col-span-2 flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowManualApt(false)}
                      className="flex-1 px-6 py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold rounded-2xl transition-all active:scale-95 text-xs uppercase tracking-widest"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isAddingAppointment}
                      className="flex-[2] px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all text-sm uppercase tracking-tighter italic"
                    >
                      {isAddingAppointment ? 'Procesando...' : 'Registrar Venta Directa'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {tab === 'agenda' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-white">Mi Agenda</h1>
                  <p className="text-sm text-zinc-400 mt-1">Planificación y control de tiempo</p>
                </div>
                {myBarberProfile?.barbershopId && (
                  <button onClick={() => setShowManualApt(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition shadow-lg shadow-blue-600/20 active:scale-95">
                    <Plus className="h-4 w-4" /> Nueva Cita
                  </button>
                )}
              </div>

              <div className="flex flex-col lg:flex-row gap-10">
                <div className="w-full lg:w-[320px] flex-shrink-0">
                  <div className="sticky top-8">
                    <MiniCalendar appointments={myAppointments} selectedDate={filterDate} onDateSelect={(d) => setFilterDate(d === filterDate ? null : d)} color="blue" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                    <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {filterDate ? `Agenda del ${filterDate}` : 'Agenda del Mes'}
                    </h3>
                    {filterDate && (
                      <button
                        onClick={() => setFilterDate(null)}
                        className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors"
                      >
                        Ver todas
                      </button>
                    )}
                  </div>
                  <div>
                    {(filterDate ? myAppointments.filter(a => a.date === filterDate) : myAppointments)
                      .sort((a, b) => {
                        if (a.status === 'pending' && b.status !== 'pending') return -1;
                        if (a.status !== 'pending' && b.status === 'pending') return 1;
                        if (a.date !== b.date) return a.date.localeCompare(b.date);
                        return a.time.localeCompare(b.time);
                      })
                      .map(apt => (
                        <div key={apt.id} className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 sm:p-5 hover:border-blue-500/30 transition group overflow-hidden mb-3 text-left">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold shrink-0">
                                {(apt.clientName || '?')[0]}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-white text-base leading-tight">{apt.clientName || 'Cliente'}</p>
                                <p className="text-xs text-zinc-400 mb-1.5 line-clamp-2">
                                  {apt.service} <span className="mx-1 text-zinc-600">|</span> {myShop?.name || 'Barbería'} <span className="mx-1 text-zinc-600">|</span> {apt.barberName || myBarberProfile?.name}
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
                        <p className="text-lg">No hay registros para este período.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'messages' && (
            <div className="h-[calc(100vh-140px)] flex flex-col">
              <h1 className="text-2xl font-bold mb-4">Mensajería</h1>
              <div className="flex-1 overflow-hidden relative">
                <div className={`absolute inset-0 rounded-2xl border border-white/10 bg-zinc-900/50 flex flex-col overflow-hidden transition-transform duration-300 ${msgTo ? '-translate-x-full' : 'translate-x-0'}`}>
                  <div className="p-2 border-b border-white/10 bg-zinc-900/80 flex gap-1">
                    <button
                      onClick={() => setMsgSubTab('clients')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition ${msgSubTab === 'clients' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                    >
                      <User className="h-3.5 w-3.5" /> Clientes
                    </button>
                    <button
                      onClick={() => setMsgSubTab('owner')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition ${msgSubTab === 'owner' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                    >
                      <Store className="h-3.5 w-3.5" /> Dueño
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {(msgSubTab === 'clients' ? clientContacts : ownerContacts).map(c => (
                      <button
                        key={c.id}
                        onClick={() => setMsgTo(c.id)}
                        className={`w-full text-left p-4 hover:bg-zinc-800/50 transition flex items-center gap-3 border-b border-white/10/30 ${msgTo === c.id ? 'bg-blue-500/10 border-l-4 border-l-blue-500 pl-3' : 'pl-4'}`}
                      >
                        <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold shrink-0 text-white">{(c.name || '?')[0]}</div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm text-zinc-200">{c.name || 'Desconocido'}</div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">{c.role === 'owner' ? 'Administrador' : 'Cliente'}</div>
                        </div>
                      </button>
                    ))}
                    {(msgSubTab === 'clients' ? clientContacts : ownerContacts).length === 0 && (
                      <div className="p-8 text-center text-xs text-zinc-500">No hay contactos disponibles.</div>
                    )}
                  </div>
                </div>
                <div className={`absolute inset-0 rounded-2xl border border-white/10 bg-zinc-900/50 flex flex-col overflow-hidden transition-transform duration-300 ${msgTo ? 'translate-x-0' : 'translate-x-full'} z-10`}>
                  {msgTo ? (
                    <>
                      <div className="p-4 border-b border-white/10 font-bold bg-zinc-900/80 flex items-center justify-between gap-3 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/20">
                            {([...clientContacts, ...ownerContacts].find(c => c.id === msgTo)?.name || '?')[0]}
                          </div>
                          <span className="text-lg text-white">
                            {[...clientContacts, ...ownerContacts].find(c => c.id === msgTo)?.name}
                          </span>
                        </div>
                        <button
                          onClick={() => setMsgTo('')}
                          className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#050505]/30">
                        {currentChatMessages.length === 0 && <div className="text-center py-20 opacity-50"><MessageSquare className="h-12 w-12 mx-auto mb-2 text-zinc-600" /> <p className="text-zinc-500">Inicia la conversación</p></div>}
                        {currentChatMessages.map(msg => (
                          <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-md relative ${msg.senderId === currentUser.id ? 'bg-blue-600 text-white rounded-br-none bg-gradient-to-br from-blue-600 to-blue-700 ml-4' : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700/50 mr-4'}`}>
                              <div className="pb-4">{msg.content}</div>
                              <div className={`absolute bottom-1 right-3 flex items-center gap-1 text-[10px] ${msg.senderId === currentUser.id ? 'text-blue-100/70' : 'text-zinc-500'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t border-white/10 bg-zinc-900/50 backdrop-blur-md">
                        <div className="flex gap-2 relative">
                          <input
                            type="text"
                            value={msgContent}
                            onChange={e => setMsgContent(e.target.value)}
                            placeholder="Escribe un mensaje..."
                            className="flex-1 bg-zinc-800/80 border border-zinc-700/50 rounded-xl pl-4 pr-12 py-3 text-sm focus:border-blue-500 focus:bg-zinc-800 outline-none transition text-white placeholder-zinc-500"
                            onKeyDown={e => e.key === 'Enter' && handleSendMsg()}
                          />
                          <button
                            onClick={handleSendMsg}
                            disabled={!msgContent.trim() || isSendingMessage}
                            className="absolute right-2 top-2 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-500 disabled:opacity-0 transition-all shadow-lg shadow-blue-600/20"
                          >
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



          {tab === 'profile' && (
            <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-tight">Tu Perfil Profesional</h1>
                  <p className="text-zinc-500 text-sm">Gestiona tu perfil, visibilidad y preferencias en la plataforma</p>
                </div>
              </div>

              {/* 1. Información Personal Básica */}
              <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 sm:p-8">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-400" />
                  Información Personal Básica
                </h2>
                <div className="flex flex-col sm:flex-row gap-8">
                  <div className="flex flex-col items-center gap-3 shrink-0">
                    <div className="relative group">
                      <div className="h-32 w-32 rounded-[2rem] bg-gradient-to-br from-blue-500/20 to-teal-500/20 border-2 border-blue-500/30 flex items-center justify-center text-4xl font-black text-blue-500 overflow-hidden shadow-2xl">
                        {(profileForm.name || '?')[0]}
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
                          className="w-full bg-zinc-800 border border-white/5 rounded-2xl px-5 py-4 text-base focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-zinc-500 tracking-widest">Email</label>
                        <input
                          value={currentUser.email}
                          disabled
                          className="w-full bg-zinc-800/50 border border-white/5 rounded-2xl px-5 py-4 text-base text-zinc-500 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-zinc-500 tracking-widest">Teléfono</label>
                        <input
                          value={profileForm.phone}
                          onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full bg-zinc-800 border border-white/5 rounded-2xl px-5 py-4 text-base focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-zinc-500 tracking-widest">Especialidad</label>
                        <input
                          value={profileForm.specialty}
                          onChange={e => setProfileForm({ ...profileForm, specialty: e.target.value })}
                          className="w-full bg-zinc-800 border border-white/5 rounded-2xl px-5 py-4 text-base focus:border-blue-500 outline-none"
                          placeholder="Ej. Degradados, Barba..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-zinc-500 tracking-widest">Fecha de Nacimiento</label>
                        <input
                          type="date"
                          value={profileForm.birthday}
                          onChange={e => setProfileForm({ ...profileForm, birthday: e.target.value })}
                          className="w-full bg-zinc-800 border border-white/5 rounded-2xl px-5 py-4 text-base focus:border-blue-500 outline-none transition text-zinc-300"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-xs font-black uppercase text-zinc-500 tracking-widest">Biografía</label>
                        <textarea
                          value={profileForm.bio}
                          onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                          className="w-full bg-zinc-800 border border-white/5 rounded-2xl px-5 py-4 text-base focus:border-blue-500 outline-none h-32 resize-none"
                          placeholder="Cuéntanos un poco sobre tu experiencia..."
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
                        disabled={isUpdatingProfile}
                        className="flex-1 w-full px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm sm:text-base tracking-wide transition-all shadow-lg shadow-blue-600/20 border border-blue-500/50"
                      >
                        {isUpdatingProfile ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                {/* 2. Estatus y Barbería */}
                <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 sm:p-8 space-y-8">
                  <div>
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      Estatus de Barbero
                    </h2>

                    <div className="bg-zinc-800 p-5 rounded-2xl border border-white/5 flex flex-col items-center sm:flex-row sm:items-center justify-between gap-6 mb-6">
                      <div className="text-center sm:text-left">
                        <p className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-1">Estado</p>
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <p className={`font-black uppercase text-2xl ${myBarberProfile?.isApproved ? 'text-green-400' : 'text-yellow-500'}`}>
                            {myBarberProfile?.isApproved ? 'Aprobado' : 'Pendiente'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                        <Star className="h-4 w-4 fill-amber-500" /> {myBarberProfile?.rating || '5.0'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-zinc-800/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <Eye className="h-4 w-4 text-blue-400 mb-2" />
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Visibilidad</p>
                        <p className="font-bold text-white text-xs">{myBarberProfile?.isPublic ? 'Público' : 'Privado'}</p>
                      </div>
                      <div className="bg-zinc-800/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <Store className="h-4 w-4 text-zinc-400 mb-2" />
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Reseñas</p>
                        <p className="font-black text-white text-lg">{myBarberProfile?.reviewCount || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Store className="h-5 w-5 text-purple-500" />
                      Mi Barbería & Preferencias
                    </h2>
                    <div className="space-y-4">
                      <div className="bg-zinc-800/50 p-5 rounded-2xl border border-white/5">
                        <p className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-1">Establecimiento</p>
                        <p className="font-bold text-white text-lg">{myBarberProfile?.barbershopName || 'Independiente'}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between bg-zinc-800 p-3 rounded-xl border border-white/5">
                          <span className="text-sm font-bold text-white">Modo Oscuro</span>
                          <div className="w-10 h-5 bg-blue-500 rounded-full relative">
                            <div className="absolute right-1 top-[2px] h-4 w-4 bg-black rounded-full shadow-sm" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between bg-zinc-800 p-3 rounded-xl border border-white/5">
                          <span className="text-sm font-bold text-white">Idioma</span>
                          <select className="bg-transparent text-sm text-blue-400 font-bold outline-none cursor-pointer">
                            <option>Español (MX)</option>
                            <option>English (US)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Actividad y Notificaciones */}
                <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 sm:p-8 space-y-8">
                  <div>
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-emerald-400" />
                      Resumen de Actividad
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-zinc-800/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <Scissors className="h-4 w-4 text-emerald-400 mb-2" />
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Completados</p>
                        <p className="font-black text-white text-lg">{completed.length}</p>
                      </div>
                      <div className="bg-zinc-800/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <Clock className="h-4 w-4 text-blue-400 mb-2" />
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Pendientes</p>
                        <p className="font-black text-blue-400 text-lg">{pendingRequests.length + futureAppointments.length}</p>
                      </div>
                      <div className="bg-zinc-800/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <User className="h-4 w-4 text-purple-400 mb-2" />
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Clientes</p>
                        <p className="font-black text-white text-lg">{clientContacts.length}</p>
                      </div>
                      <div className="bg-zinc-800/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <TrendingUp className="h-4 w-4 text-emerald-400 mb-2" />
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Ingresos</p>
                        <p className="font-black text-emerald-400 text-lg">${totalEarned}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-teal-400" />
                      Notificaciones
                    </h2>
                    <div className="space-y-4">
                      {[
                        { label: 'Recordatorios de citas', desc: 'Avisos antes de cada servicio' },
                        { label: 'Avisos de cancelaciones', desc: 'Cuando un cliente cancela' },
                        { label: 'Alertas de pagos', desc: 'Confirmaciones de ingresos' },
                        { label: 'Alertas de stock bajo', desc: 'Avisos de inventario (Dueños)' }
                      ].map(notif => (
                        <div key={notif.label} className="flex items-start gap-4 p-4 bg-zinc-800 rounded-2xl border border-white/5">
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-10 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                          </label>
                          <div>
                            <p className="font-bold text-sm text-white">{notif.label}</p>
                            <p className="text-[10px] text-zinc-500">{notif.desc}</p>
                          </div>
                        </div>
                      ))}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Rec. 1 (min)</label>
                          <input
                            type="number"
                            value={timer1}
                            onChange={e => setTimer1(parseInt(e.target.value) || 0)}
                            className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Rec. 2 (min)</label>
                          <input
                            type="number"
                            value={timer2}
                            onChange={e => setTimer2(parseInt(e.target.value) || 0)}
                            className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => saveSettings(notifEnabled, timer1, timer2)}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-500 hover:opacity-90 text-white rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                      >
                        Guardar Configuración
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Zona de Peligro & Acciones Extra */}
              <div className="rounded-3xl border border-red-500/10 bg-red-500/5 p-6 sm:p-8">
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

      {/* Interstitial Ad - Shows on tab change */}
      {
        showInterstitial && (
          <InterstitialAd
            isOpen={showInterstitial}
            onClose={() => setShowInterstitial(false)}
          />
        )
      }
    </div>
  );
}
