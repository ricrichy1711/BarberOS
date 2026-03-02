import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useData } from '@/contexts/DataContext';
import {
  Scissors, Calendar, MessageSquare, User, Clock, Store,
  CheckCircle, XCircle, TrendingUp, LogOut, Users, Lock,
  Plus, Star, Shield, Eye, Settings, BarChart3, AlertCircle, CheckCircle2,
  Edit3, Phone, LayoutDashboard, Armchair, Trash2, Check, CheckCheck, Menu, X, DollarSign, ArrowLeft,
  ChevronDown, Camera, Image as ImageIcon, Sparkles, UserX, Mail,
  Package, ShoppingCart, Tag,
  Activity, Bot, Printer, FileText, AlertTriangle, Info, History, Wallet, Search, StickyNote, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

import { MiniCalendar } from '@/components/MiniCalendar';
import { Logo } from '@/components/Logo';
import { MonthlyReportModal } from '@/components/MonthlyReportModal';
import { AdSlot } from '@/components/AdSlot';
import { InterstitialAd } from '@/components/InterstitialAd';
import { CampaignBanner } from '@/components/CampaignBanner';

// WhatsApp Helper
const sendWhatsAppReminder = (phone: string, clientName: string, date: string, time: string, shopName: string) => {
  const msg = `Hola ${clientName}, te recordamos tu cita en ${shopName} el día ${date} a las ${time}. ¡Te esperamos!`;
  const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
};

type Tab = 'overview' | 'barbers' | 'appointments' | 'agenda' | 'messages' | 'admin' | 'clients' | 'profile';

export default function OwnerDashboard() {
  const {
    currentUser, logout, deleteAccount, barbershops, barbers, appointments,
    getShopAppointments, updateAppointmentStatus, addAppointment, addBarbershop,
    getUserMessages, sendMessage, markAsRead, loading,
    chairs, addChair, removeChair, assignBarberToChair, dismissBarber,
    expenses, addExpense, updateBarbershop, joinRequests, handleJoinRequest,
    updateBarber, users, updateProfile,
    products, productSales, addProduct, updateProduct, sellProduct,
    reviews, campaigns
  } = useData();
  /* const navigate = useNavigate(); */

  const [tab, setTab] = useState<Tab>('overview');
  const [paymentPlan, setPaymentPlan] = useState<'PRO' | 'PREMIUM'>('PRO');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const lastAdTime = useRef(Date.now());

  const handleTabChange = (newTab: Tab) => {
    if (newTab !== tab) {
      setTab(newTab);
      setIsSidebarOpen(false);
      setShowManualApt(false);

      const now = Date.now();
      const isFreePlan = myShop?.plan === 'free' || myShop?.plan === 'basic';

      if (isFreePlan && now - lastAdTime.current > 60000) {
        setShowInterstitial(true);
        lastAdTime.current = now;
      }
    } else {
      setIsSidebarOpen(false);
    }
  };
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [newChairName, setNewChairName] = useState('');
  const [newExpense, setNewExpense] = useState({ description: '', amount: '' });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showUpgradeTokenInput, setShowUpgradeTokenInput] = useState(false);
  const [upgradeToken, setUpgradeToken] = useState('');
  const [expandWaitlist, setExpandWaitlist] = useState(false);
  const [expandExpenses, setExpandExpenses] = useState(false);
  const [expandServices, setExpandServices] = useState(false);
  const [expandHours, setExpandHours] = useState(false);
  const [expandWeeklyHours, setExpandWeeklyHours] = useState(false);
  const [editingHours, setEditingHours] = useState<Record<string, { open: string, close: string, closed: boolean }>>({});
  const [expandCharts, setExpandCharts] = useState(false);
  const [expandVisualProfile, setExpandVisualProfile] = useState(false);
  const [expandInventory, setExpandInventory] = useState(false);
  const [expandReviews, setExpandReviews] = useState(false);
  const [expandMonthlyReports, setExpandMonthlyReports] = useState(false);

  const [editingServices, setEditingServices] = useState<{ name: string, price: number, duration: number }[]>([]);
  const [visualProfileEditing, setVisualProfileEditing] = useState<{ address: string, phone: string, image: string, description: string }>({
    address: '',
    phone: '',
    image: '',
    description: ''
  });

  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [closedDateForm, setClosedDateForm] = useState({ date: '', reason: '' });

  // Monthly Report Modal State
  const [selectedReportMonth, setSelectedReportMonth] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [nameRequestStatus, setNameRequestStatus] = useState<'idle' | 'checking' | 'available' | 'exists' | 'requested'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Appointment State
  const [showManualApt, setShowManualApt] = useState(false);
  const [manualAptForm, setManualAptForm] = useState({
    barberId: '',
    clientName: '',
    service: '',
    date: '',

    time: '',
    clientPhone: '',
    price: 0
  });

  const [chairSelection, setChairSelection] = useState<Record<string, string>>({});

  const [msgTo, setMsgTo] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [msgSubTab, setMsgSubTab] = useState<'clients' | 'barbers'>('clients');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingBarberProfile, setViewingBarberProfile] = useState<any>(null);
  const [dismissingBarber, setDismissingBarber] = useState<any>(null);
  const [dismissRating, setDismissRating] = useState(5);
  const [dismissComment, setDismissComment] = useState('');

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    email: '',
    birthday: '',
    bio: ''
  });

  // Inventory State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 5,
    category: '',
    imageUrl: ''
  });

  // Admin Panel State
  const isAdmin = currentUser?.email === 'barberosfive@gmail.com';
  const [adminSubTab, setAdminSubTab] = useState<'stats' | 'shops' | 'users' | 'coupons' | 'transactions'>('stats');
  const [adminCoupons, setAdminCoupons] = useState<any[]>([]);
  const [adminTransactions, setAdminTransactions] = useState<any[]>([]);
  const [newCouponForm, setNewCouponForm] = useState({
    code: '',
    months: 1,
    planId: 'premium'
  });

  useEffect(() => {
    if (isAdmin && tab === 'admin') {
      const fetchAdminData = async () => {
        const { data: co } = await supabase.from('coupons').select('*, barbershops(name)').order('created_at', { ascending: false });
        const { data: tr } = await supabase.from('transactions').select('*, barbershops(name)').order('created_at', { ascending: false });
        if (co) setAdminCoupons(co);
        if (tr) setAdminTransactions(tr);
      };
      fetchAdminData();
    }
  }, [isAdmin, tab]);

  const handleCreateCoupon = async () => {
    if (!newCouponForm.code) return;
    const { error } = await supabase.from('coupons').insert({
      code: newCouponForm.code.toUpperCase(),
      months: newCouponForm.months,
      plan_id: newCouponForm.planId
    });
    if (error) {
      alert('Error creando cupón: ' + error.message);
    } else {
      alert('Cupón creado con éxito');
      setNewCouponForm({ ...newCouponForm, code: '' });
      // Refresh list
      const { data } = await supabase.from('coupons').select('*, barbershops(name)').order('created_at', { ascending: false });
      if (data) setAdminCoupons(data);
    }
  };

  const [showSellModal, setShowSellModal] = useState(false);
  const [sellForm, setSellForm] = useState({
    productId: '',
    quantity: 1,
    sellerId: ''
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
    if (!currentUser) return;
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-zinc-400 animate-pulse">Cargando panel de dueño...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  const [newShopName, setNewShopName] = useState('');
  const [newShopDesc, setNewShopDesc] = useState('');
  const [newShopAddress, setNewShopAddress] = useState('');
  const [newShopPhone, setNewShopPhone] = useState('');
  const [newShopEmail, setNewShopEmail] = useState('');

  const myShop = barbershops.find(s => s.ownerId === currentUser.id);
  console.log('🏪 OwnerDashboard: myShop found? ->', myShop ? 'YES' : 'NO', myShop?.id);
  const myBarbers = barbers.filter(b => b.barbershopId === myShop?.id);

  const canUseFinance = myShop?.plan === 'pro' || myShop?.plan === 'premium' || myShop?.plan === 'premium_pro';
  const canUseWhatsapp = myShop?.plan === 'premium' || myShop?.plan === 'premium_pro';
  const canUseStats = myShop?.plan === 'premium' || myShop?.plan === 'premium_pro';

  const handleCreateShop = async (e: FormEvent) => {
    e.preventDefault();
    console.log('🏪 handleCreateShop: Form submitted by user');
    if (!newShopName) return;

    // Verificar si el nombre ya existe (insensible a mayúsculas)
    const exists = barbershops.some(s => s.name.toLowerCase() === newShopName.toLowerCase());
    if (exists) {
      alert('Ya existe una barbería con este nombre. Por favor, elige otro.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addBarbershop({
        name: newShopName, // Se guarda con las mayúsculas/minúsculas del usuario
        description: newShopDesc,
        address: newShopAddress,
        phone: newShopPhone,
        email: newShopEmail,
        image: '',
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        isPublic: true,
        plan: 'basic',
      });
      // La barbería debería aparecer automáticamente gracias al contexto
    } catch (error) {
      console.error('Error creando barbería:', error);
      alert('Error al crear la barbería. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!myShop) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <div className="w-full max-w-md p-8 bg-zinc-900/50 border border-white/10 rounded-3xl">
          <Store className="mx-auto h-16 w-16 text-emerald-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-center">Bienvenido, {currentUser.name}</h1>
          <p className="text-zinc-400 mb-6 text-center">Para comenzar, registra tu primera barbería.</p>

          <form onSubmit={handleCreateShop} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Nombre de la Barbería *</label>
              <input
                required
                value={newShopName}
                onChange={e => setNewShopName(e.target.value)}
                className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 text-white focus:border-emerald-500 outline-none"
                placeholder="Ej. Barbería El Rey"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Dirección</label>
              <input
                value={newShopAddress}
                onChange={e => setNewShopAddress(e.target.value)}
                className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 text-white focus:border-emerald-500 outline-none"
                placeholder="Av. Siempre Viva 123"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Teléfono</label>
                <input
                  value={newShopPhone}
                  onChange={e => setNewShopPhone(e.target.value)}
                  className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 text-white focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
                <input
                  value={newShopEmail}
                  onChange={e => setNewShopEmail(e.target.value)}
                  className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 text-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Descripción</label>
              <textarea
                value={newShopDesc}
                onChange={e => setNewShopDesc(e.target.value)}
                className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 text-white focus:border-emerald-500 outline-none resize-none h-24"
                placeholder="Escribe una breve descripcion..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-700 py-2.5 font-bold text-white hover:opacity-90 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Creando...' : 'Registrar Barbería'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-zinc-500 hover:text-white transition">
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const shopBarbers = barbers.filter(b => b.barbershopId === myShop.id);
  const approvedBarbers = shopBarbers.filter(b => b.isApproved);
  const shopAppointments = getShopAppointments(myShop.id);
  const myMessages = getUserMessages(currentUser.id);
  const shopChairs = chairs.filter(c => c.barbershopId === myShop.id);
  const myJoinRequests = joinRequests.filter(r => r.barbershopId === myShop.id && r.status === 'pending');

  const completedApts = shopAppointments.filter(a => a.status === 'completed');
  const pendingApts = shopAppointments.filter(a => a.status === 'pending');
  const totalRevenue = completedApts.reduce((s, a) => s + a.price, 0);

  // Get all contacts from message history to ensure we don't miss anyone
  const messageContacts = [...new Set(myMessages.map(m => {
    const isSender = m.senderId === currentUser.id;
    return JSON.stringify({
      id: isSender ? m.receiverId : m.senderId,
      name: isSender ? m.receiverName : m.senderName,
      role: isSender ? m.receiverRole : m.senderRole
    });
  }))].map(c => JSON.parse(c));

  // Get all clients from shop appointments
  const shopClientsList = [...new Set(shopAppointments.filter(a => a.clientId).map(a => JSON.stringify({ id: a.clientId, name: a.clientName, role: 'client' })))].map(c => JSON.parse(c));

  // Merge and deduplicate client contacts
  const clientContacts = [
    ...shopClientsList,
    ...messageContacts.filter(c => c.role === 'client')
  ].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

  // Barber contacts from the shop + message history
  const barberContacts = [
    ...approvedBarbers.map(b => ({ id: b.userId, name: b.name, role: 'barber' })),
    ...messageContacts.filter(c => c.role === 'barber')
  ].filter((v, i, a) => v.id !== currentUser.id && a.findIndex(t => t.id === v.id) === i);

  // const uniqueClients = clientContacts.length; (Unused)

  const handleCreateChair = async (e: FormEvent) => {
    e.preventDefault();
    if (!newChairName) return;

    const limit = myShop.plan === 'premium_pro' ? 12 : myShop.plan === 'premium' ? 6 : myShop.plan === 'pro' ? 3 : 1;
    if (shopChairs.length >= limit) {
      alert(`Has alcanzado el límite de ${limit} ${limit === 1 ? 'barbero' : 'barberos'} para tu plan ${(myShop.plan || 'basic').toUpperCase()}. Actualiza tu plan para agregar más.`);
      setShowUpgradeModal(true);
      return;
    }

    setIsSubmitting(true);
    await addChair(myShop.id, newChairName);
    setNewChairName('');
    setIsSubmitting(false);
  };

  const handleAssignBarber = async (chairId: string, barberId: string) => {
    // Fix: DataContext expects (barberId, chairId), not (chairId, barberId)
    // Also, if 'none', we pass null as barberId to unassign (assuming DataContext handles types loosely or we cast)
    await assignBarberToChair(barberId === 'none' ? null as any : barberId, chairId);
  };

  const handleDeleteChair = async (id: string) => {
    if (window.confirm('Eliminar esta silla?')) {
      await removeChair(id);
    }
  };

  const handleManualBooking = async (e: FormEvent) => {
    e.preventDefault();
    if (!manualAptForm.barberId || !manualAptForm.clientName || !manualAptForm.date || !manualAptForm.time) {
      alert('Por favor completa todos los campos obligatorios (Barbero, Cliente, Fecha y Hora)');
      return;
    }

    const selectedBarber = shopBarbers.find(b => b.id === manualAptForm.barberId);

    // -----------------------------------------------------------
    // VALIDACIÓN DE HORARIO COMERCIAL (PARA EL DUEÑO ES UN AVISO)
    // -----------------------------------------------------------
    const dayNamesLookup: Record<number, string> = {
      0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
      4: 'thursday', 5: 'friday', 6: 'saturday'
    };
    const dateObj = new Date(manualAptForm.date + 'T12:00:00');
    const dayName = dayNamesLookup[dateObj.getDay()];
    const businessDay = myShop.businessHours?.[dayName];
    const isManuallyClosed = myShop.closedDates?.some(cd => cd.date === manualAptForm.date);

    let warningMsg = '';
    if (isManuallyClosed) {
      warningMsg = `La barbería está marcada como CERRADA manualmente para la fecha ${manualAptForm.date}.`;
    } else if (businessDay?.closed) {
      warningMsg = `La barbería está marcada como CERRADA los días ${dayName}.`;
    } else if (businessDay && (manualAptForm.time < businessDay.open || manualAptForm.time >= businessDay.close)) {
      warningMsg = `La hora seleccionada (${manualAptForm.time}) está fuera del horario comercial (${businessDay.open} a ${businessDay.close}).`;
    }

    if (warningMsg && !window.confirm(`${warningMsg}\n\¿Deseas agendar la cita de todos modos?`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await addAppointment({
        ...manualAptForm,
        clientId: null as any,
        barbershopId: myShop.id,
        clientPhone: manualAptForm.clientPhone || '',
        barberName: selectedBarber?.name || 'Barbero',
        barbershopName: myShop.name,
        status: 'confirmed'
      });
      setShowManualApt(false);
      setManualAptForm({
        barberId: '',
        clientName: '',
        service: '',
        date: '',
        time: '',
        clientPhone: '',
        price: 0
      });
      alert('¡Cita agendada con éxito!');
    } catch (error: any) {
      console.error('Error in manual booking:', error);
      alert('Error al agendar cita: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Contacts logic already moved up

  const handleSendMsg = async () => {
    if (!msgTo || !msgContent.trim()) return;

    // Find contact in either list
    const contact = [...clientContacts, ...barberContacts].find(c => c.id === msgTo);
    if (!contact) return;

    setIsSubmitting(true);
    await sendMessage({
      senderId: currentUser.id,
      senderName: `${currentUser.name} (Dueño)`,
      senderRole: 'owner',
      receiverId: contact.id,
      receiverName: contact.name,
      receiverRole: contact.role,
      content: msgContent.trim(),
      barbershopId: myShop.id,
    });
    setIsSubmitting(false);
    setMsgContent('');
  };

  const handleProductSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productForm);
        alert('Producto actualizado');
      } else {
        await addProduct({ ...productForm, barbershopId: myShop.id });
        alert('Producto agregado');
      }
      setShowProductModal(false);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSellSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const product = products.find(p => p.id === sellForm.productId);
      if (!product) throw new Error('Producto no encontrado');

      await sellProduct({
        barbershopId: myShop.id,
        productId: product.id,
        productName: product.name,
        quantity: sellForm.quantity,
        unitPrice: product.price,
        totalPrice: product.price * sellForm.quantity,
        sellerId: sellForm.sellerId
      });
      alert('¡Venta registrada con éxito!');
      setShowSellModal(false);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
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


  const handleDismissBarberWithRating = async () => {
    if (!dismissingBarber) return;

    // Validar que no tenga citas pendientes o confirmadas
    const barberAppointments = shopAppointments.filter(a =>
      a.barberId === dismissingBarber.id &&
      (a.status === 'pending' || a.status === 'confirmed')
    );

    if (barberAppointments.length > 0) {
      alert(`No puedes despedir a ${dismissingBarber.name} porque tiene ${barberAppointments.length} cita(s) pendiente(s) o confirmada(s). Por favor, cancela o completa todas sus citas primero.`);
      return;
    }

    setIsSubmitting(true);
    try {
      // En un futuro esto podría guardar en una tabla 'historical_ratings'
      console.log(`Clasificación final para ${dismissingBarber.name}: ${dismissRating} estrellas. Comentario: ${dismissComment}`);

      await dismissBarber(dismissingBarber.id);
      setDismissingBarber(null);
      setDismissRating(5);
      setDismissComment('');
      alert('Barbero despedido y clasificado correctamente.');
    } catch (error) {
      console.error(error);
      alert('Error al despedir al barbero.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showBarberProfile = (barberId: string) => {
    const user = users.find(u => u.id === barberId);
    if (!user) {
      alert('Información de barbero no encontrada.');
      return;
    }

    // Buscar si ya tiene un perfil extendido de barbero
    const barberProfile = barbers.find(b => b.userId === user.id);

    setViewingBarberProfile({
      ...user,
      specialty: barberProfile?.specialty || 'Barbero Profesional',
      bio: barberProfile?.bio || 'Sin biografía disponible.',
      rating: barberProfile?.rating || 5,
      reviewCount: barberProfile?.reviewCount || 0
    });
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

  // ── Cartera de Clientes ──────────────────────────────────────────────────
  const [clientSearch, setClientSearch] = useState('');
  const [clientFilter, setClientFilter] = useState<'all' | 'new' | 'recurring' | 'vip'>('all');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clientNotes, setClientNotes] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem('barber_client_notes') || '{}'); } catch { return {}; }
  });

  const saveClientNote = (clientId: string, note: string) => {
    const updated = { ...clientNotes, [`${myShop?.id}_${clientId}`]: note };
    setClientNotes(updated);
    localStorage.setItem('barber_client_notes', JSON.stringify(updated));
  };

  const shopClients = (() => {
    if (!myShop?.id) return [];
    const shopApts = appointments.filter(a => a.barbershopId === myShop.id && a.status !== 'cancelled');
    const map: Record<string, { id: string; name: string; phone: string; visits: number; totalSpent: number; lastVisit: string; firstVisit: string }> = {};
    shopApts.forEach(apt => {
      const clientId = apt.clientId || `guest_${apt.clientName}`;
      if (!map[clientId]) {
        map[clientId] = { id: clientId, name: apt.clientName || 'Cliente', phone: apt.clientPhone || '', visits: 0, totalSpent: 0, lastVisit: '', firstVisit: apt.date };
      }
      map[clientId].visits++;
      map[clientId].totalSpent += apt.price || 0;
      if (!map[clientId].lastVisit || apt.date > map[clientId].lastVisit) map[clientId].lastVisit = apt.date;
      if (apt.date < map[clientId].firstVisit) map[clientId].firstVisit = apt.date;
    });
    return Object.values(map).sort((a, b) => b.visits - a.visits);
  })();

  const thisMonth = new Date().toISOString().slice(0, 7);
  const filteredClients = shopClients
    .filter(c => {
      if (clientFilter === 'new') return c.firstVisit?.startsWith(thisMonth);
      if (clientFilter === 'recurring') return c.visits >= 2;
      if (clientFilter === 'vip') return c.visits >= 5;
      return true;
    })
    .filter(c => {
      const q = clientSearch.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.phone.includes(q);
    });
  // ─────────────────────────────────────────────────────────────────────────

  const navItems: { id: Tab; label: string; icon: typeof Calendar }[] = [
    { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
    { id: 'barbers', label: 'Mi Negocio / Horarios', icon: Store },
    { id: 'appointments', label: 'Citas', icon: Calendar },
    { id: 'agenda', label: 'Agenda', icon: Clock },
    { id: 'clients', label: 'Clientes', icon: Wallet },
    { id: 'messages', label: 'Mensajes', icon: MessageSquare },

    { id: 'profile', label: 'Perfil', icon: User },
    ...(isAdmin ? [{ id: 'admin' as Tab, label: 'Admin Panel', icon: Shield }] : []),
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-[#050505] border-b border-white/10 p-4">
        <div className="flex items-center gap-2 group">
          <Logo className="scale-75 origin-left" noLink />
        </div>
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-bold text-white">
                {(currentUser.name || '?')[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{currentUser.name}</p>
                <p className="text-xs text-zinc-500">Dueño</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Store className="h-3 w-3 text-zinc-500" />
              <p className="text-xs text-zinc-400 truncate">{myShop.name}</p>
              <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-bold ${myShop.plan === 'premium' ? 'bg-amber-500/20 text-amber-400' : myShop.plan === 'pro' ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-700/50 text-zinc-400'}`}>
                {(myShop.plan || 'basic').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${tab === item.id
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white border border-transparent'
                }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
              {item.id === 'barbers' && myJoinRequests.length > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-[10px] font-bold text-zinc-900">
                  {myJoinRequests.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Ad Slot for Sidebar (Free users) - Moved above footer */}
        {(myShop.plan === 'free' || myShop.plan === 'basic') && (
          <div className="px-3 mb-4">
            <AdSlot
              adClient="ca-pub-3430296497693127"
              adSlot="4002227989"
              adFormat="rectangle"
              className="h-32"
            />
          </div>
        )}

        <div className="border-t border-white/5 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20"
          >
            <LogOut className="h-5 w-5" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-64'}`}>
        <main className="flex-1 p-4 lg:p-8 mt-16 lg:mt-0 overflow-y-auto w-full bg-[#050505] min-h-full">
          {/* Banners de Campaña */}
          {(campaigns || []).filter(c => c.isActive && (c.target === 'all' || c.target === 'owner')).length > 0 && (
            <div className="space-y-2 mb-6">
              {(campaigns || []).filter(c => c.isActive && (c.target === 'all' || c.target === 'owner')).map(c => (
                <CampaignBanner key={c.id} campaign={c} />
              ))}
            </div>
          )}
          {/* Overview */}
          {tab === 'overview' && (
            <div key="overview-tab">
              <div>
                <h1 className="text-2xl font-bold mb-1">{myShop.name}</h1>
                <p className="text-zinc-400 text-sm mb-4">Panel de administración de tu barbería</p>

                {/* Main Hero Ad (Free users) */}
                {(myShop.plan === 'free' || myShop.plan === 'basic') && (
                  <div className="mb-8">
                    <AdSlot
                      adClient="ca-pub-3430296497693127"
                      adSlot="3070631130"
                      adFormat="auto"
                      className="min-h-[120px]"
                    />
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  {[
                    { label: 'Barberos activos', value: approvedBarbers.length, icon: Users, color: 'from-emerald-400 to-emerald-600' },
                    { label: 'Citas Pendientes', value: pendingApts.length, icon: Clock, color: 'from-blue-400 to-blue-600' },
                    { label: 'Mensajes sin leer', value: myMessages.filter(m => !m.read && m.receiverId === currentUser.id).length, icon: MessageSquare, color: 'from-purple-400 to-purple-600' },
                    { label: 'Ingresos totales', value: `$${totalRevenue}`, icon: TrendingUp, color: 'from-amber-400 to-orange-500' },
                  ].map((s, i) => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 shadow-lg shadow-emerald-500/5">
                      <div className={`inline-flex rounded-xl bg-gradient-to-br ${s.color} p-2.5 mb-3 shadow-lg shadow-emerald-500/20`}>
                        <s.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-2xl font-bold tracking-tight">{s.value}</div>
                      <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-semibold">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Solicitudes de Barberos */}
                {myJoinRequests.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-yellow-400" /> Solicitudes de Integración
                    </h2>
                    <div className="space-y-3">
                      {myJoinRequests.map(r => (
                        <div key={r.id} className="flex items-center justify-between rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-400">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{r.barberName}</p>
                              <p className="text-xs text-zinc-500">Solicitó unirse a tu barbería</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleJoinRequest(r.id, true)}
                              className="rounded-lg bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 flex items-center gap-1 transition-all border border-emerald-500/20"
                            >
                              <CheckCircle className="h-4 w-4" /> Contratar
                            </button>
                            <button
                              onClick={() => handleJoinRequest(r.id, false)}
                              className="rounded-lg bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 flex items-center gap-1 transition-all border border-red-500/20"
                            >
                              <XCircle className="h-4 w-4" /> Rechazar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Charts Section */}
                <div className="grid gap-6 lg:grid-cols-2 mb-8">
                  {/* Revenue Chart */}
                  <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-500" /> Ingresos (últimos 7 días)
                    </h3>
                    <div className="flex items-end justify-between h-48 gap-2">
                      {Array.from({ length: 7 }, (_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (6 - i));
                        return d.toISOString().split('T')[0];
                      }).map((date, i) => {
                        const dailyRevenue = shopAppointments
                          .filter(a => a.date === date && a.status === 'completed')
                          .reduce((sum, a) => sum + (a.price || 0), 0);
                        // Calculate max for scale normalization
                        const maxRev = Math.max(...Array.from({ length: 7 }, (_, j) => {
                          const d2 = new Date();
                          d2.setDate(d2.getDate() - (6 - j));
                          const dStr = d2.toISOString().split('T')[0];
                          return shopAppointments.filter(a => a.date === dStr && a.status === 'completed').reduce((s, a) => s + (a.price || 0), 0);
                        }), 1000);

                        const height = (dailyRevenue / maxRev) * 100;

                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                            <div className="absolute -top-8 bg-zinc-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                              ${dailyRevenue}
                            </div>
                            <div
                              className="w-full bg-emerald-500/20 rounded-t-lg hover:bg-emerald-500/40 transition relative group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                              style={{ height: `${Math.max(height, 5)}%` }}
                            ></div>
                            <span className="text-[10px] text-zinc-500">{date.slice(8)}/{date.slice(5, 7)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Appointments & Cuts Chart */}
                  <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 shadow-lg shadow-blue-500/5">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Scissors className="h-5 w-5 text-blue-500" /> Citas y Cortes (últimos 7 días)
                    </h3>
                    <div className="flex items-end justify-between h-48 gap-2">
                      {Array.from({ length: 7 }, (_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (6 - i));
                        return d.toISOString().split('T')[0];
                      }).map((date, i) => {
                        const totalApts = shopAppointments.filter(a => a.date === date).length;
                        const completedCuts = shopAppointments.filter(a => a.date === date && a.status === 'completed').length;

                        const maxCount = Math.max(...Array.from({ length: 7 }, (_, j) => {
                          const d2 = new Date();
                          d2.setDate(d2.getDate() - (6 - j));
                          const dStr = d2.toISOString().split('T')[0];
                          return shopAppointments.filter(a => a.date === dStr).length;
                        }), 5);

                        const hTotal = (totalApts / maxCount) * 100;
                        const hCuts = (completedCuts / maxCount) * 100;

                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                            <div className="absolute -top-12 bg-zinc-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                              {completedCuts} cortes / {totalApts} citas
                            </div>
                            <div className="w-full flex items-end justify-center gap-0.5 h-full relative">
                              <div
                                className="w-1/2 bg-blue-500/20 rounded-t-sm hover:bg-blue-500/40 transition"
                                style={{ height: `${Math.max(hTotal, 5)}%` }}
                              />
                              <div
                                className="w-1/2 bg-emerald-500/20 rounded-t-sm hover:bg-emerald-500/40 transition absolute bottom-0"
                                style={{ height: `${Math.max(hCuts, 0)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-zinc-500">{date.slice(8)}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-center gap-4 mt-4 text-xs">
                      <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500/40 rounded-full"></div> Total Citas</span>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500/40 rounded-full"></div> Cortes Completados</span>
                    </div>
                  </div>
                </div>



              </div>
            </div>
          )}

          {tab === 'barbers' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Header & Upgrade Button */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Mi Negocio</h1>
                  <p className="text-zinc-400 text-sm">gestión de Sillas y Recursos</p>
                </div>
                {myShop.plan === 'free' && (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:scale-105 transition"
                  >
                    <Star className="h-4 w-4 fill-white" /> Actualizar Plan
                  </button>
                )}
                {/* Premium Pro Mock Switcher */}
                {myShop.plan === 'premium_pro' && (
                  <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-lg">
                    <Store className="h-4 w-4 text-amber-500" />
                    <select className="bg-transparent text-sm font-medium outline-none text-white cursor-pointer">
                      <option>{myShop.name} (Sede Principal)</option>
                      <option>Sede Norte (Mock)</option>
                      <option>Sede Sur (Mock)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Stats - Reuse existing style */}
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6 flex flex-col justify-between hover:border-blue-500/20 transition">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 font-medium">Total Barberos</p>
                    <p className="text-3xl font-black text-white">{approvedBarbers.length}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6 flex flex-col justify-between hover:border-emerald-500/20 transition">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Armchair className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 font-medium">Sillas Activas</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-black text-white">{shopChairs.length}</p>
                      <span className="text-xs text-zinc-500 font-medium">/ {myShop.plan === 'premium_pro' ? 12 : myShop.plan === 'premium' ? 6 : myShop.plan === 'pro' ? 3 : 1}</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6 flex flex-col justify-between hover:border-amber-500/20 transition">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 font-medium">Ingresos Totales</p>
                    <p className="text-3xl font-black text-white">${totalRevenue}</p>
                  </div>
                </div>
              </div>

              {/* Ads for Free Plan */}
              {myShop.plan === 'free' && (
                <div className="space-y-4">
                  {(campaigns || []).filter(c => c.isActive && c.target === 'owner' && c.style === 'card').length > 0 ? (
                    (campaigns || []).filter(c => c.isActive && c.target === 'owner' && c.style === 'card').slice(0, 1).map(c => (
                      <div key={c.id} className="relative overflow-hidden rounded-[2rem] border border-amber-500/20 bg-zinc-900/50 p-8 text-center group transition-all hover:border-amber-500/40">
                        <div className="absolute top-3 right-4 text-[8px] font-black text-amber-500/40 tracking-widest uppercase italic">Comunicado Central</div>
                        <div className="flex flex-col items-center gap-4">
                          <span className="text-4xl animate-bounce-slow">{c.emoji}</span>
                          <div>
                            <p className="font-black text-lg text-white uppercase italic tracking-widest mb-1">{c.title}</p>
                            <p className="text-xs text-zinc-500 font-bold leading-relaxed max-w-sm mx-auto">{c.message}</p>
                          </div>
                          {c.linkUrl && (
                            <a href={c.linkUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 bg-amber-500 text-black text-[10px] font-black uppercase italic rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20">
                              {c.linkText || 'Ver Detalles'}
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
                      <div className="absolute top-2 right-2 text-[10px] text-zinc-600 border border-zinc-700 px-1 rounded bg-black/50">PLATAFORMA</div>
                      <p className="text-zinc-500 text-sm mb-2 font-bold italic">¿Quieres eliminar los anuncios y tener más sillas de barbero?</p>
                      <button onClick={() => setShowUpgradeModal(true)} className="text-emerald-400 text-sm font-black uppercase italic hover:text-emerald-300 transition-colors">Activar Planes Premium</button>
                      <div className="mt-4 h-16 bg-zinc-950/50 rounded-xl flex items-center justify-center text-zinc-800 text-[10px] font-black uppercase italic tracking-widest border border-dashed border-zinc-800">
                        Espacio publicitario disponible desde el panel
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Solicitudes Pendientes */}
              {myJoinRequests.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-400" /> Solicitudes Pendientes
                  </h2>
                  <div className="space-y-3">
                    {myJoinRequests.map(r => (
                      <div key={r.id} className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 hover:bg-yellow-500/10 transition group">
                        <div
                          className="flex items-center gap-4 cursor-pointer flex-1"
                          onClick={() => showBarberProfile(r.barberId)}
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500 group-hover:text-zinc-900 transition-all">
                            <User className="h-6 w-6" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black uppercase tracking-tight text-white group-hover:text-yellow-400 transition-colors">{r.barberName}</p>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                              Solicitud de unión  <span className="text-blue-400 flex items-center gap-1"><Eye className="h-3 w-3" /> Ver Perfil</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleJoinRequest(r.id, true)}
                            className="flex-1 sm:flex-none rounded-xl bg-emerald-500 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-900 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="h-4 w-4" /> Contratar
                          </button>
                          <button
                            onClick={() => handleJoinRequest(r.id, false)}
                            className="flex-1 sm:flex-none rounded-xl bg-zinc-800 px-4 py-2 text-[10px] font-bold text-zinc-400 hover:bg-red-500/10 hover:text-red-400 border border-white/5 transition flex items-center justify-center gap-2"
                          >
                            <XCircle className="h-4 w-4" /> Rechazar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Perfil Visual (Retrátil) */}
              <div className="mb-6">
                <button
                  onClick={() => {
                    if (!expandVisualProfile) {
                      setVisualProfileEditing({
                        address: myShop.address || '',
                        phone: myShop.phone || '',
                        image: myShop.image || '',
                        description: myShop.description || ''
                      });
                    }
                    setExpandVisualProfile(!expandVisualProfile);
                  }}
                  className="w-full flex items-center justify-between group bg-zinc-900/50 p-4 rounded-xl border border-white/5 hover:border-white/10 transition"
                >
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Store className="text-emerald-400 h-5 w-5" /> Configuración de Perfil Visual
                  </h2>
                  <div className={`rounded-full bg-zinc-800 p-1.5 transition-transform duration-300 ${expandVisualProfile ? 'rotate-180' : ''}`}>
                    <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-white" />
                  </div>
                </button>

                {expandVisualProfile && (
                  <div className="mt-2 bg-zinc-900/30 border border-white/10 rounded-xl p-6 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Logo / Foto */}
                      <div className="space-y-4">
                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">Logo de la Barbería</label>
                        <div className="flex items-center gap-6">
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="h-24 w-24 rounded-2xl bg-zinc-800 border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer"
                          >
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setVisualProfileEditing({ ...visualProfileEditing, image: reader.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            {visualProfileEditing.image ? (
                              <img src={visualProfileEditing.image} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                              <Camera className="h-8 w-8 text-zinc-600" />
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <span className="text-[10px] font-bold text-white uppercase">Cambiar</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-zinc-400 mb-3">Sube una foto clara que represente tu marca en el directorio.</p>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition flex items-center gap-2"
                            >
                              <ImageIcon className="h-3.5 w-3.5" /> Buscar en Archivos
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Dirección y Teléfono */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block mb-2">Dirección de la Barbería</label>
                            <div className="relative">
                              <input
                                type="text"
                                value={visualProfileEditing.address}
                                onChange={(e) => setVisualProfileEditing({ ...visualProfileEditing, address: e.target.value })}
                                className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500/50 transition pl-10"
                                placeholder="Ej. Calle Principal 123..."
                              />
                              <Store className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block mb-2">Teléfono para Citas</label>
                            <div className="relative">
                              <input
                                type="text"
                                value={visualProfileEditing.phone}
                                onChange={(e) => setVisualProfileEditing({ ...visualProfileEditing, phone: e.target.value })}
                                className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500/50 transition pl-10"
                                placeholder="Ej. +52 555 123 4567"
                              />
                              <Phone className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block mb-2">Sobre Nosotros (Descripción)</label>
                          <textarea
                            value={visualProfileEditing.description}
                            onChange={(e) => setVisualProfileEditing({ ...visualProfileEditing, description: e.target.value })}
                            className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500/50 transition h-32 resize-none"
                            placeholder="Escribe una descripción que enamore a tus clientes..."
                          />
                        </div>

                        <div className="pt-4 border-t border-white/5 mt-4">
                          <button
                            onClick={async () => {
                              setIsSubmitting(true);
                              await updateBarbershop(myShop.id, visualProfileEditing);
                              setIsSubmitting(false);
                              alert('Perfil visual actualizado correctamente.');
                            }}
                            disabled={isSubmitting}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-600/20"
                          >
                            {isSubmitting ? 'Guardando...' : 'Guardar Perfil Visual'}
                          </button>
                        </div>
                      </div>

                      {/* Nombre y Solicitud */}
                      <div className="space-y-4">
                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">Nombre en el Directorio</label>
                        <div className="bg-zinc-800/50 p-3 rounded-lg border border-white/5 flex items-center justify-between mb-4">
                          <span className="font-bold text-zinc-300">{myShop.name}</span>
                          <span className="text-[10px] font-bold bg-zinc-950 text-zinc-500 px-2 py-0.5 rounded uppercase">Protegido</span>
                        </div>

                        <div className="bg-zinc-950/50 p-4 rounded-xl border border-blue-500/10">
                          <p className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-tight">Solicitar Cambio de Nombre</p>
                          <div className="flex gap-2 mb-3">
                            <input
                              type="text"
                              value={newName}
                              onChange={(e) => {
                                setNewName(e.target.value);
                                setNameRequestStatus('idle');
                              }}
                              placeholder="Nuevo nombre..."
                              className="flex-1 bg-zinc-900 border border-white/5 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500/50 transition"
                            />
                            <button
                              onClick={() => {
                                if (!newName) return;
                                setNameRequestStatus('checking');
                                setTimeout(() => {
                                  const exists = barbershops.some(s => s.name.toLowerCase() === newName.toLowerCase());
                                  setNameRequestStatus(exists ? 'exists' : 'available');
                                }, 800);
                              }}
                              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition"
                            >
                              Verificar
                            </button>
                          </div>

                          {nameRequestStatus === 'exists' && (
                            <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold mb-3">
                              <AlertCircle className="h-3 w-3" /> Este nombre ya está en uso en el directorio.
                            </div>
                          )}

                          {nameRequestStatus === 'available' && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold">
                                <CheckCircle2 className="h-3 w-3" /> Nombre disponible! Puedes enviar la solicitud.
                              </div>
                              <button
                                onClick={() => setNameRequestStatus('requested')}
                                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-lg transition uppercase tracking-widest shadow-lg shadow-emerald-500/10"
                              >
                                Enviar Solicitud a Admin
                              </button>
                            </div>
                          )}

                          {nameRequestStatus === 'requested' && (
                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-3">
                              <CheckCircle2 className="h-4 w-4 text-blue-400" />
                              <p className="text-[10px] font-bold text-blue-400 uppercase leading-tight">
                                Solicitud enviada correctamente.<br />Un administrador la revisará pronto.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reseñas y Calidad (Retrátil) */}
              <div className="mb-6">
                <button
                  onClick={() => setExpandReviews(!expandReviews)}
                  className="w-full flex items-center justify-between group bg-zinc-900/50 p-4 rounded-xl border border-white/5 hover:border-white/10 transition"
                >
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Star className="text-amber-400 h-5 w-5 fill-amber-400" /> Reseñas y Calidad
                    <span className="text-xs font-medium text-zinc-500 ml-2">({reviews.filter(r => r.barbershopId === myShop.id).length} Reseñas)</span>
                  </h2>
                  <div className={`rounded-full bg-zinc-800 p-1.5 transition-transform duration-300 ${expandReviews ? 'rotate-180' : ''}`}>
                    <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-white" />
                  </div>
                </button>

                {expandReviews && (
                  <div className="mt-2 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-zinc-900/30 border border-white/10 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <p className="text-zinc-500 text-sm">Gestiona la reputación de tu barbería y selecciona tu mejor reseña para el directorio.</p>
                        </div>
                        <div className="bg-zinc-800/50 border border-white/5 px-4 py-2 rounded-2xl flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Promedio</p>
                            <p className="text-xl font-black text-amber-500 leading-none">
                              {reviews.filter(r => r.barbershopId === myShop.id).length > 0
                                ? (reviews.filter(r => r.barbershopId === myShop.id).reduce((acc, r) => acc + r.rating, 0) / reviews.filter(r => r.barbershopId === myShop.id).length).toFixed(1)
                                : "5.0"}
                            </p>
                          </div>
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {reviews.filter(r => r.barbershopId === myShop.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(review => (
                          <div key={review.id} className={`bg-zinc-900/50 border ${myShop.featuredReviewId === review.id ? 'border-amber-500/50 shadow-lg shadow-amber-500/5' : 'border-white/5'} p-6 rounded-[32px] flex flex-col hover:border-emerald-500/20 transition group relative`}>
                            {myShop.featuredReviewId === review.id && (
                              <div className="absolute -top-2 -right-2 bg-amber-500 text-zinc-900 text-[8px] font-black px-2 py-1 rounded-full shadow-lg flex items-center gap-1 active:scale-95 transition-transform">
                                <Sparkles className="h-3 w-3" /> DESTACADA
                              </div>
                            )}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-zinc-800 flex items-center justify-center font-bold text-emerald-500 border border-white/5 shadow-inner">
                                  {review.userName[0]}
                                </div>
                                <div>
                                  <p className="font-bold text-sm">{review.userName}</p>
                                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-zinc-800'}`} />
                                  ))}
                                </div>
                                <button
                                  onClick={async () => {
                                    const newId = myShop.featuredReviewId === review.id ? null : review.id;
                                    await updateBarbershop(myShop.id, { featuredReviewId: newId as string });
                                  }}
                                  className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border transition ${myShop.featuredReviewId === review.id
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                                    : 'bg-zinc-800/50 border-white/5 text-zinc-500 hover:text-white hover:bg-zinc-700'}`}
                                >
                                  {myShop.featuredReviewId === review.id ? 'Quitar Destacada' : 'Fijar Reseña'}
                                </button>
                              </div>
                            </div>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4 italic flex-1">"{review.comment}"</p>
                            <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Atendido por:</span>
                              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{barbers.find(b => b.id === review.barberId)?.name || "Barbero"}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {reviews.filter(r => r.barbershopId === myShop.id).length === 0 && (
                        <div className="p-16 text-center text-zinc-500 bg-zinc-800/20 rounded-[32px] border border-dashed border-white/5">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-10" />
                          <p className="font-bold text-lg">aún no hay Reseñas registradas</p>
                          <p className="text-sm">Invita a tus clientes a calificar el servicio después de su cita.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Barberos en Espera (Retractil) */}
              <div>
                <button
                  onClick={() => setExpandWaitlist(!expandWaitlist)}
                  className="w-full flex items-center justify-between group mb-4 bg-zinc-900/50 p-4 rounded-xl border border-white/5 hover:border-white/10 transition"
                >
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Users className="text-blue-400 h-5 w-5" /> Barberos en Espera / Sin Asignar
                    <span className="text-xs font-medium text-zinc-500 ml-2">({approvedBarbers.filter(b => !shopChairs.some(c => c.barberId === b.id)).length})</span>
                  </h2>
                  <div className={`rounded-full bg-zinc-800 p-1.5 transition-transform duration-300 ${expandWaitlist ? 'rotate-180' : ''}`}>
                    <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-white" />
                  </div>
                </button>
                {expandWaitlist && (
                  <div className="mb-6 bg-zinc-900/20 border border-white/5 rounded-xl p-5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {approvedBarbers.filter(b => !shopChairs.some(c => c.barberId === b.id)).map(b => (
                        <div key={b.id} className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
                          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-blue-500/20 shrink-0">
                              {b.name[0]}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-sm text-zinc-200 leading-tight">{b.name || 'Desconocido'}</div>
                                <button
                                  onClick={() => setViewingBarberProfile(b)}
                                  className="p-1 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all ml-1"
                                >
                                  <Info className="h-3 w-3" />
                                </button>
                              </div>
                              <div className="text-[10px] text-zinc-500 mt-0.5">{b.specialty || 'Barbero'}</div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-2 border border-white/5">
                              <span className="text-[10px] uppercase font-black text-zinc-500">Estado</span>
                              <span className="flex items-center gap-1.5 text-[10px] font-black text-yellow-400">
                                <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                                En espera
                              </span>
                            </div>
                            <button
                              onClick={() => setDismissingBarber(b)}
                              className="w-full py-2 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/20 flex items-center justify-center gap-2"
                            >
                              <UserX className="h-3 w-3" /> Despedir
                            </button>
                          </div>
                        </div>
                      ))}
                      {approvedBarbers.filter(b => !shopChairs.some(c => c.barberId === b.id)).length === 0 && (
                        <div className="col-span-full text-center py-6 text-zinc-500 text-sm">
                          Todos los barberos están asignados
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sillas de Trabajo */}
              <div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Armchair className="text-emerald-500" /> gestión de Sillas
                </h2>
                <div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {shopChairs.map(chair => {
                      const barber = approvedBarbers.find(b => b.id === chair.barberId);
                      const barberWeeklyRevenue = barber ? shopAppointments
                        .filter(a => {
                          if (a.barberId !== barber.id || (a.status !== 'confirmed' && a.status !== 'completed')) return false;
                          const aptDate = new Date(a.date);
                          const now = new Date();
                          const lastWeek = new Date();
                          lastWeek.setDate(now.getDate() - 7);
                          return aptDate >= lastWeek;
                        })
                        .reduce((sum, a) => sum + (a.price || 0), 0) : 0;

                      return (
                        <div key={chair.id} className="relative group rounded-2xl border border-white/10 bg-zinc-900/40 p-5 hover:border-white/20 transition flex flex-col hover:bg-zinc-900/60 shadow-lg shadow-black/20">
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-black text-zinc-500 uppercase tracking-widest bg-zinc-950 px-2 py-1 rounded">{chair.name}</span>
                            <button
                              onClick={() => handleDeleteChair(chair.id)}
                              className="text-zinc-600 hover:text-red-400 p-1 rounded-md hover:bg-red-500/10 transition opacity-50 group-hover:opacity-100"
                              title="Eliminar Silla"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {barber ? (
                            <div className="flex-1 flex flex-col space-y-3">
                              {/* Barber Card - Simple & Professional */}
                              <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-lg font-bold text-white shadow-lg shrink-0">
                                    {(barber.name || "?")[0].toUpperCase()}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <p className="font-bold text-base text-white truncate leading-tight">{barber.name}</p>
                                      <button
                                        onClick={() => setViewingBarberProfile(barber)}
                                        className="p-1 rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all ml-1"
                                      >
                                        <Info className="h-3 w-3" />
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                        <div className="h-1 w-1 rounded-full bg-emerald-500" />
                                        Activo
                                      </span>
                                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                                        <Star className="h-2.5 w-2.5 fill-amber-400" />
                                        {barber.rating || '5.0'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-2.5 border border-white/5">
                                    <span className="text-xs text-zinc-400 font-medium">Ganancias Semana</span>
                                    <span className="font-bold text-emerald-400 text-sm">${barberWeeklyRevenue}</span>
                                  </div>
                                  <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-2.5 border border-white/5">
                                    <span className="text-xs text-zinc-400 font-medium">Especialidad</span>
                                    <span className="text-xs font-bold text-zinc-200">{barber.specialty || 'Barbero'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Unassign Button */}
                              <button
                                onClick={() => handleAssignBarber(chair.id, 'none')}
                                className="w-full text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 py-2.5 rounded-lg transition font-medium border border-red-500/20 hover:border-red-500/40"
                              >
                                Desasignar Barbero
                              </button>
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-6 border-2 border-dashed border-zinc-800 rounded-xl bg-black/20 group-hover:border-zinc-700 transition space-y-4">
                              <p className="text-zinc-500 font-bold text-sm uppercase tracking-wide">Silla Disponible</p>
                              <div className="w-full px-4">
                                <select
                                  value={chairSelection[chair.id] || "none"}
                                  onChange={(e) => setChairSelection({ ...chairSelection, [chair.id]: e.target.value })}
                                  className="w-full appearance-none bg-zinc-800 text-white text-xs font-medium px-4 py-2.5 rounded-lg outline-none border border-zinc-700 cursor-pointer mb-2"
                                >
                                  <option value="none">Seleccionar Barbero...</option>
                                  {approvedBarbers.filter(b => !shopChairs.some(c => c.barberId === b.id)).map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={async () => {
                                    if (chairSelection[chair.id] && chairSelection[chair.id] !== 'none') {
                                      setIsSubmitting(true);
                                      await handleAssignBarber(chair.id, chairSelection[chair.id]);
                                      setIsSubmitting(false);
                                      setChairSelection({ ...chairSelection, [chair.id]: 'none' });
                                    }
                                  }}
                                  disabled={!chairSelection[chair.id] || chairSelection[chair.id] === 'none' || isSubmitting}
                                  className="w-full bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-lg hover:bg-emerald-600 transition disabled:opacity-50 disabled:bg-zinc-800"
                                >
                                  {isSubmitting ? 'Asignando...' : 'Asignar a Silla'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* New Chair Button */}
                    {shopChairs.length < (myShop.plan === 'premium_pro' ? 12 : myShop.plan === 'premium' ? 6 : myShop.plan === 'pro' ? 3 : 1) && (
                      <div className="rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-900/20 p-6 flex flex-col items-center justify-center text-center hover:bg-zinc-900/40 hover:border-emerald-500/30 transition cursor-pointer group min-h-[250px]">
                        <div className="mb-4 h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition border border-white/5 group-hover:border-emerald-500/20">
                          <Plus className="h-6 w-6" />
                        </div>
                        <h3 className="text-zinc-500 font-bold mb-4 group-hover:text-white transition">Nueva Silla</h3>
                        <form onSubmit={handleCreateChair} className="w-full max-w-[180px]" onClick={e => e.stopPropagation()}>
                          <input
                            value={newChairName}
                            onChange={e => setNewChairName(e.target.value)}
                            placeholder="Nombre (ej. Silla 4)"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white mb-2 text-center focus:border-emerald-500 outline-none transition focus:bg-black placeholder:text-zinc-600"
                          />
                          <button
                            type="submit"
                            className="w-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold py-2 rounded-lg hover:bg-emerald-500 hover:text-white transition"
                            disabled={!newChairName}
                          >
                            Crear
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>



              {/* CONFIGURACION DE LOCAL (SERVICIOS Y HORARIOS) */}
              <div className="space-y-4 mb-12">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Settings className="text-emerald-500" /> Configuracion de Local
                </h2>

                {/* Servicios Section */}
                <div>
                  <button
                    onClick={() => {
                      if (!expandServices && myShop.services) setEditingServices(myShop.services);
                      if (!expandServices && !myShop.services) setEditingServices([]);
                      setExpandServices(!expandServices);
                    }}
                    className="w-full flex items-center justify-between group bg-zinc-900/50 p-4 rounded-xl border border-white/5 hover:border-white/10 transition"
                  >
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Scissors className="text-emerald-400 h-5 w-5" /> Servicios y Precios
                      <span className="text-xs font-medium text-zinc-500 ml-2">({(myShop.services || []).length} servicios)</span>
                    </h3>
                    <div className={`rounded-full bg-zinc-800 p-1.5 transition-transform duration-300 ${expandServices ? 'rotate-180' : ''}`}>
                      <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-white" />
                    </div>
                  </button>

                  {expandServices && (
                    <div className="mt-2 p-6 bg-zinc-900/30 border border-white/5 rounded-xl animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-4">
                        {editingServices.map((service, index) => (
                          <div key={index} className="flex flex-col sm:flex-row gap-3 items-end bg-black/20 p-4 rounded-xl border border-white/5">
                            <div className="flex-1 w-full">
                              <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Nombre del Servicio</label>
                              <input
                                value={service.name}
                                onChange={(e) => {
                                  const newServices = [...editingServices];
                                  newServices[index].name = e.target.value;
                                  setEditingServices(newServices);
                                }}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-white"
                                placeholder="Ej. Corte Clasico"
                              />
                            </div>
                            <div className="w-full sm:w-32">
                              <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Precio ($)</label>
                              <input
                                type="number"
                                placeholder="0"
                                value={service.price === 0 ? '' : service.price}
                                onChange={(e) => {
                                  const newServices = [...editingServices];
                                  newServices[index].price = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                  setEditingServices(newServices);
                                }}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-white text-right"
                              />
                            </div>
                            <div className="w-full sm:w-32">
                              <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Tiempo (min)</label>
                              <input
                                type="number"
                                value={service.duration}
                                onChange={(e) => {
                                  const newServices = [...editingServices];
                                  newServices[index].duration = parseInt(e.target.value);
                                  setEditingServices(newServices);
                                }}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-white text-right"
                              />
                            </div>
                            <button
                              onClick={() => setEditingServices(editingServices.filter((_, i) => i !== index))}
                              className="p-2.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}

                        <div className="flex flex-col sm:flex-row gap-4 mt-6">
                          <button
                            onClick={() => setEditingServices([...editingServices, { name: '', price: 0, duration: 30 }])}
                            className="flex-1 bg-zinc-800 text-zinc-300 border border-white/5 py-3 rounded-xl text-sm font-bold hover:bg-zinc-700 transition flex items-center justify-center gap-2"
                          >
                            <Plus className="h-4 w-4" /> Agregar otro servicio
                          </button>
                          <button
                            onClick={async () => {
                              setIsSubmitting(true);
                              await updateBarbershop(myShop.id, { services: editingServices });
                              setIsSubmitting(false);
                              alert('Servicios actualizados correctamente');
                            }}
                            disabled={isSubmitting}
                            className="flex-1 bg-emerald-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20"
                          >
                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Horarios de Atencion (Regular Weekly Hours) */}
                <div>
                  <button
                    onClick={() => {
                      if (!expandWeeklyHours) {
                        const defaultHours = {
                          monday: { open: '09:00', close: '18:00', closed: false },
                          tuesday: { open: '09:00', close: '18:00', closed: false },
                          wednesday: { open: '09:00', close: '18:00', closed: false },
                          thursday: { open: '09:00', close: '18:00', closed: false },
                          friday: { open: '09:00', close: '18:00', closed: false },
                          saturday: { open: '09:00', close: '14:00', closed: false },
                          sunday: { open: '00:00', close: '00:00', closed: true },
                        };
                        setEditingHours(myShop.businessHours || defaultHours);
                      }
                      setExpandWeeklyHours(!expandWeeklyHours);
                    }}
                    className="w-full flex items-center justify-between group bg-zinc-900/50 p-4 rounded-xl border border-white/5 hover:border-white/10 transition"
                  >
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Clock className="text-emerald-400 h-5 w-5" /> Horarios de Atencion (Semanal)
                    </h3>
                    <div className={`rounded-full bg-zinc-800 p-1.5 transition-transform duration-300 ${expandWeeklyHours ? 'rotate-180' : ''}`}>
                      <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-white" />
                    </div>
                  </button>

                  {expandWeeklyHours && (
                    <div className="mt-2 p-6 bg-zinc-900/30 border border-white/5 rounded-xl animate-in fade-in slide-in-from-top-2">
                      <div className="max-w-3xl">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-emerald-500" />
                            <span className="text-xs font-black text-white uppercase tracking-widest">Horarios Semanales</span>
                          </div>
                          <button
                            onClick={() => {
                              const mon = editingHours['monday'] || { open: '09:00', close: '18:00', closed: false };
                              const newHours = { ...editingHours };
                              ['tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
                                newHours[day] = { ...mon };
                              });
                              setEditingHours(newHours);
                            }}
                            className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-all active:scale-95"
                          >
                            Copiar Lunes a Viernes
                          </button>
                        </div>

                        <div className="space-y-2">
                          {[
                            { key: 'monday', label: 'Lunes' },
                            { key: 'tuesday', label: 'Martes' },
                            { key: 'wednesday', label: 'Miercoles' },
                            { key: 'thursday', label: 'Jueves' },
                            { key: 'friday', label: 'Viernes' },
                            { key: 'saturday', label: 'Sabado' },
                            { key: 'sunday', label: 'Domingo' },
                          ].map((day) => {
                            const hours = editingHours[day.key] || { open: '09:00', close: '18:00', closed: false };
                            const isWeekend = day.key === 'saturday' || day.key === 'sunday';

                            return (
                              <div
                                key={day.key}
                                className={`group flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${hours.closed
                                  ? 'bg-zinc-950/40 border-white/5 opacity-50 grayscale'
                                  : 'bg-zinc-900/50 border-white/10 hover:border-emerald-500/30 shadow-lg shadow-black/20'
                                  }`}
                              >
                                <div className="flex items-center gap-4 w-32">
                                  <div className={`h-2 w-2 rounded-full ${hours.closed ? 'bg-zinc-700' : isWeekend ? 'bg-amber-500' : 'bg-emerald-500'} shadow-[0_0_10px_rgba(16,185,129,0.2)]`} />
                                  <span className={`text-sm font-black ${hours.closed ? 'text-zinc-500' : 'text-zinc-200'}`}>{day.label}</span>
                                </div>

                                <div className="flex-1 flex items-center justify-center gap-3">
                                  {!hours.closed ? (
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="time"
                                        className="premium-clock bg-zinc-800 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500/50 transition-all font-bold w-28 text-center"
                                        value={editingHours[day.key].open}
                                        onChange={e => setEditingHours({
                                          ...editingHours,
                                          [day.key]: { ...editingHours[day.key], open: e.target.value }
                                        })}
                                      />
                                      <span className="text-zinc-600 font-bold">-</span>
                                      <input
                                        type="time"
                                        className="premium-clock bg-zinc-800 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500/50 transition-all font-bold w-28 text-center"
                                        value={editingHours[day.key].close}
                                        onChange={e => setEditingHours({
                                          ...editingHours,
                                          [day.key]: { ...editingHours[day.key], close: e.target.value }
                                        })}
                                      />
                                    </div>
                                  ) : (
                                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Cerrado por descanso</span>
                                  )}
                                </div>

                                <div className="w-32 flex justify-end">
                                  <button
                                    onClick={() => setEditingHours({
                                      ...editingHours,
                                      [day.key]: { ...hours, closed: !hours.closed }
                                    })}
                                    className={`relative flex h-6 w-12 items-center rounded-full transition-all duration-300 focus:outline-none ${hours.closed ? 'bg-zinc-800' : 'bg-emerald-500/20 border border-emerald-500/30'}`}
                                  >
                                    <div className={`h-4 w-4 rounded-full transition-all duration-300 transform ${hours.closed ? 'translate-x-1 bg-zinc-600' : 'translate-x-7 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="pt-8 flex gap-4">
                          <button
                            onClick={async () => {
                              setIsSubmitting(true);
                              try {
                                await updateBarbershop(myShop.id, { businessHours: editingHours });
                                alert('Horarios guardados con exito!');
                              } catch (error) {
                                console.error('Error saving hours:', error);
                                alert('Error al guardar horarios');
                              } finally {
                                setIsSubmitting(false);
                              }
                            }}
                            disabled={isSubmitting}
                            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-[20px] transition shadow-xl shadow-emerald-500/20 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 active:scale-[0.98]"
                          >
                            {isSubmitting ? 'Guardando...' : (
                              <>
                                <CheckCheck className="h-4 w-4" /> Guardar Todos los Cambios
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Calendario de Días Cerrados (Días Especiales) */}
                <div>
                  <button
                    onClick={() => {
                      setExpandHours(!expandHours);
                    }}
                    className="w-full flex items-center justify-between group bg-zinc-900/50 p-4 rounded-xl border border-white/5 hover:border-white/10 transition"
                  >
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Calendar className="text-emerald-400 h-5 w-5" /> Calendario de Cierres (Dias Especiales)
                    </h3>
                    <div className={`rounded-full bg-zinc-800 p-1.5 transition-transform duration-300 ${expandHours ? 'rotate-180' : ''}`}>
                      <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-white" />
                    </div>
                  </button>

                  {expandHours && (
                    <div className="mt-2 p-4 bg-zinc-900/30 border border-white/5 rounded-xl animate-in fade-in slide-in-from-top-2 w-full">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* LEFT: Calendar UI (50% width) */}
                        <div className="space-y-6">
                          <div className="bg-black/20 rounded-[24px] p-6 border border-white/5 h-fit">
                            <div className="flex items-center justify-between mb-6">
                              <h4 className="text-xl font-black text-white capitalize flex items-center gap-2 tracking-tighter">
                                <Sparkles className="h-5 w-5 text-emerald-500" />
                                {currentCalendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                              </h4>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    const d = new Date(currentCalendarMonth);
                                    d.setMonth(d.getMonth() - 1);
                                    setCurrentCalendarMonth(d);
                                  }}
                                  className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all active:scale-95 border border-white/5"
                                >
                                  <Plus className="h-4 w-4 rotate-180" />
                                </button>
                                <button
                                  onClick={() => {
                                    const d = new Date(currentCalendarMonth);
                                    d.setMonth(d.getMonth() + 1);
                                    setCurrentCalendarMonth(d);
                                  }}
                                  className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all active:scale-95 border border-white/5"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-7 gap-2 mb-3">
                              {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map(day => (
                                <div key={day} className="text-center text-[9px] font-black text-zinc-700 uppercase tracking-widest py-1">
                                  {day}
                                </div>
                              ))}
                            </div>

                            <div className="grid grid-cols-7 gap-2">
                              {(() => {
                                const daysInMonth = new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() + 1, 0).getDate();
                                const firstDayOfMonth = new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth(), 1).getDay();
                                const days = [];

                                for (let i = 0; i < firstDayOfMonth; i++) {
                                  days.push(<div key={`empty-${i}`} className="aspect-square" />);
                                }

                                for (let d = 1; d <= daysInMonth; d++) {
                                  const fullDate = `${currentCalendarMonth.getFullYear()}-${String(currentCalendarMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                  const isSelected = selectedCalendarDate === fullDate;
                                  const isClosed = (myShop.closedDates || []).some(cd => cd.date === fullDate);

                                  // Logic for Sunday and Non-working days
                                  const dateObj = new Date(fullDate + 'T12:00:00');
                                  const dayNames: Record<number, string> = {
                                    0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
                                    4: 'thursday', 5: 'friday', 6: 'saturday'
                                  };
                                  const dayName = dayNames[dateObj.getDay()];
                                  const isWeeklyClosed = editingHours[dayName]?.closed ?? myShop?.businessHours?.[dayName]?.closed;
                                  const shouldShowRed = isClosed || isWeeklyClosed;

                                  const dayOfWeekString = dateObj.getDay().toString();
                                  const barbersOff = myBarbers.filter(b => (b.offDays || []).includes(dayOfWeekString));

                                  days.push(
                                    <button
                                      key={d}
                                      onClick={() => setSelectedCalendarDate(isSelected ? null : fullDate)}
                                      className={`aspect-square flex flex-col items-center justify-center rounded-xl border text-sm font-black transition-all relative group
                                         ${isSelected ? 'ring-2 ring-emerald-500 border-transparent bg-emerald-500/20 text-emerald-400 scale-105 z-10 shadow-xl shadow-emerald-500/20' :
                                          shouldShowRed ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20' :
                                            'bg-zinc-800/40 border-white/5 text-zinc-500 hover:border-emerald-500/50 hover:bg-zinc-800 hover:text-white'}
                                       `}
                                    >
                                      {d}
                                      <div className="absolute bottom-1.5 flex gap-1">
                                        {shouldShowRed && <div className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.4)]" />}
                                        {barbersOff.length > 0 && <div className="h-1.5 w-1.5 bg-amber-500 rounded-full shadow-[0_0_5px_rgba(245,158,11,0.4)]" />}
                                      </div>
                                    </button>
                                  );
                                }
                                return days;
                              })()}
                            </div>

                            <div className="mt-8 flex flex-wrap items-center gap-4 text-[9px] text-zinc-600 border-t border-white/5 pt-6">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500/50" />
                                <span className="font-bold uppercase tracking-widest text-zinc-500">Abierto</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                <span className="font-bold uppercase tracking-widest text-zinc-500">Cerrado</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-amber-500" />
                                <span className="font-bold uppercase tracking-widest text-zinc-500">Libres</span>
                              </div>
                              <div className="flex items-center gap-2 ml-auto">
                                <div className="h-2 w-2 rounded-full border border-emerald-500" />
                                <span className="font-bold uppercase tracking-widest text-zinc-500">Selecc.</span>
                              </div>
                            </div>

                          </div>
                        </div>

                        {/* RIGHT: Management Columns (1/3 width each) - WRAPPED in relative to match Calendar height */}

                        {/* Box 1: Closures Management */}
                        <div className="relative w-full h-auto"> {/* Grid Item Wrapper */}
                          <div className="absolute inset-0 bg-zinc-900 border border-white/10 rounded-[32px] p-6 shadow-2xl overflow-hidden flex flex-col">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                            <h4 className="text-sm font-black text-white mb-3 flex items-center gap-2 uppercase tracking-[0.2em] shrink-0">
                              <Calendar className="h-4 w-4 text-emerald-500" /> Gestion de Cierres
                            </h4>
                            <div className="space-y-3 mb-4 shrink-0">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                  <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block tracking-widest">Programar Fecha</label>
                                  <input
                                    type="date"
                                    value={closedDateForm.date}
                                    onChange={e => setClosedDateForm({ ...closedDateForm, date: e.target.value })}
                                    className="w-full bg-zinc-800 border border-white/5 rounded-xl p-2.5 text-[10px] text-white outline-none focus:border-emerald-500/50 transition-all font-bold"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block tracking-widest">Motivo del Cierre</label>
                                  <input
                                    type="text"
                                    value={closedDateForm.reason}
                                    onChange={e => setClosedDateForm({ ...closedDateForm, reason: e.target.value })}
                                    className="w-full bg-zinc-800 border border-white/5 rounded-xl p-2.5 text-[10px] text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/50 transition-all font-bold"
                                    placeholder="Ex: Reforma..."
                                  />
                                </div>
                              </div>
                              <button
                                onClick={async () => {
                                  if (!closedDateForm.date || !closedDateForm.reason) return;
                                  setIsSubmitting(true);
                                  const newClosedDates = [...(myShop.closedDates || []), { date: closedDateForm.date, reason: closedDateForm.reason }];
                                  await updateBarbershop(myShop.id, { closedDates: newClosedDates });
                                  setClosedDateForm({ date: '', reason: '' });
                                  setIsSubmitting(false);
                                }}
                                disabled={isSubmitting || !closedDateForm.date}
                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-[10px] transition-all shadow-xl shadow-emerald-600/20 uppercase tracking-[0.3em] active:scale-95 disabled:opacity-50"
                              >
                                {isSubmitting ? '...' : 'Confirmar Cierre'}
                              </button>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col mt-2">
                              {selectedCalendarDate ? (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                  <div className="flex items-center justify-between mb-4">
                                    <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Detalles: {selectedCalendarDate}</h5>
                                    <button onClick={() => setSelectedCalendarDate(null)} className="p-1 hover:bg-white/10 rounded-full transition text-zinc-500"><X className="h-3 w-3" /></button>
                                  </div>
                                  <div className="space-y-3 bg-black/20 rounded-lg p-2.5 border border-white/5">
                                    <div className="flex items-center justify-between gap-3">
                                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Estado Local</p>
                                      {(() => {
                                        const manualClosure = myShop.closedDates?.find(d => d.date === selectedCalendarDate);
                                        const dateObj = new Date(selectedCalendarDate + 'T12:00:00');
                                        const dayNames: Record<number, string> = {
                                          0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
                                          4: 'thursday', 5: 'friday', 6: 'saturday'
                                        };
                                        const dayName = dayNames[dateObj.getDay()];
                                        const isWeeklyClosed = editingHours[dayName]?.closed;

                                        if (manualClosure || isWeeklyClosed) {
                                          return (
                                            <div className="flex flex-col items-end gap-1">
                                              <span className="text-[8px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">Cerrado</span>
                                              <span className="text-[7px] font-black text-zinc-600 uppercase tracking-tighter italic">
                                                {manualClosure ? manualClosure.reason : 'Descanso semanal'}
                                              </span>
                                            </div>
                                          );
                                        }
                                        return <span className="text-[8px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Abierto</span>;
                                      })()}
                                    </div>
                                    <div className="space-y-1.5">
                                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Disponibilidad Staff</p>
                                      <div className="flex flex-wrap gap-1">
                                        {myBarbers.map(barber => {
                                          const isOff = (barber.offDays || []).includes(new Date(selectedCalendarDate).getDay().toString());
                                          return (
                                            <div key={barber.id} className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[8px] font-bold transition-all ${isOff ? 'bg-zinc-900 border-zinc-800 opacity-30 shadow-inner' : 'bg-emerald-500/10 border-emerald-500/20 shadow-lg shadow-emerald-500/5'}`}>
                                              <span className={isOff ? 'text-zinc-600' : 'text-emerald-500'}>{barber.name}</span>
                                              {isOff ? <UserX className="h-2 w-2 text-zinc-700" /> : <Check className="h-2 w-2 text-emerald-500" />}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="overflow-y-auto custom-scrollbar pr-2 max-h-[140px] [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-track]:bg-transparent">
                                  <h5 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4 sticky top-0 bg-zinc-900 pb-2">Próximos Cierres</h5>
                                  <div className="space-y-2 pb-2">
                                    {(myShop.closedDates || [])
                                      .filter(cd => new Date(cd.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
                                      .sort((a, b) => a.date.localeCompare(b.date))
                                      .map((cd, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 border border-white/5 group hover:bg-white/10 transition-colors">
                                          <div className="min-w-0">
                                            <p className="text-[10px] font-black text-white">{cd.date}</p>
                                            <p className="text-[8px] text-zinc-500 truncate lowercase">{cd.reason}</p>
                                          </div>
                                          <button
                                            onClick={async () => {
                                              const filtered = myShop.closedDates?.filter((_, i) => i !== (myShop.closedDates || []).indexOf(cd));
                                              await updateBarbershop(myShop.id, { closedDates: filtered });
                                            }}
                                            className="p-1 opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </button>
                                        </div>
                                      ))}
                                    {(myShop.closedDates || []).length === 0 && (
                                      <p className="text-[10px] text-zinc-600 italic py-4 text-center">No hay cierres programados</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Box 2: Barbers Off Days */}
                        <div className="relative w-full h-auto"> {/* Grid Item Wrapper */}
                          <div className="absolute inset-0 bg-zinc-900 border border-white/10 rounded-[32px] p-6 shadow-2xl flex flex-col overflow-hidden">
                            <h4 className="text-sm font-black text-white mb-6 flex items-center gap-2 uppercase tracking-[0.2em] shrink-0">
                              <UserX className="h-4 w-4 text-amber-500" /> Descansos Staff
                            </h4>
                            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 [&::-webkit-scrollbar-thumb]:bg-black [&::-webkit-scrollbar-track]:bg-transparent">
                              {myBarbers.map(barber => (
                                <div key={barber.id} className="p-4 rounded-2xl bg-zinc-800/20 border border-white/5 hover:border-white/10 transition-all">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center font-black text-emerald-500 text-xs shadow-inner">
                                        {barber.name[0]}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-xs font-black text-zinc-200 uppercase tracking-widest leading-none mb-1">{barber.name}</span>
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em] flex items-center gap-1">
                                          <Clock className="h-2.5 w-2.5" /> 09:00 - 20:00
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Lunch Break Configuration */}
                                  <div className="mb-3 p-2 bg-black/20 rounded-lg border border-white/5">
                                    <label className="text-[8px] text-zinc-500 font-bold uppercase mb-1.5 block tracking-widest">Hora de Comida</label>
                                    <div className="grid grid-cols-2 gap-2">
                                      <input
                                        type="time"
                                        value={barber.lunchBreak?.start || '14:00'}
                                        onChange={async (e) => {
                                          await updateBarber(barber.id, {
                                            lunchBreak: {
                                              start: e.target.value,
                                              end: barber.lunchBreak?.end || '15:00'
                                            }
                                          });
                                        }}
                                        className="w-full bg-zinc-800 border border-white/5 rounded-lg p-1.5 text-[9px] text-white outline-none focus:border-emerald-500/50 transition-all font-bold"
                                      />
                                      <input
                                        type="time"
                                        value={barber.lunchBreak?.end || '15:00'}
                                        onChange={async (e) => {
                                          await updateBarber(barber.id, {
                                            lunchBreak: {
                                              start: barber.lunchBreak?.start || '14:00',
                                              end: e.target.value
                                            }
                                          });
                                          if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                        className="w-full bg-zinc-800 border border-white/5 rounded-lg p-1.5 text-[9px] text-white outline-none focus:border-emerald-500/50 transition-all font-bold"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-7 gap-1">
                                    {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((d, i) => {
                                      const isOff = (barber.offDays || []).includes(i.toString());
                                      return (
                                        <button
                                          key={i}
                                          onClick={async () => {
                                            const currentOff = barber.offDays || [];
                                            const newOff = isOff ? currentOff.filter(x => x !== i.toString()) : [...currentOff, i.toString()];
                                            await updateBarber(barber.id, { offDays: newOff });
                                          }}
                                          className={`h-8 rounded-lg text-[9px] font-black transition-all border shadow-sm ${isOff
                                            ? 'bg-amber-600 border-transparent text-black scale-105 shadow-amber-500/20'
                                            : 'bg-zinc-900 border-white/5 text-zinc-600 hover:text-white hover:border-amber-500/30'
                                            }`}
                                          title={['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][i]}
                                        >
                                          {d}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Finanzas */}
              <div className="space-y-6 relative">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <TrendingUp className="text-emerald-500" /> Finanzas
                  {!canUseFinance && (
                    <span className="flex items-center gap-1 bg-amber-500/10 text-amber-500 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/20">
                      <Lock className="h-2 w-2" /> PLAN PRO+
                    </span>
                  )}
                </h2>

                {!canUseFinance ? (
                  <div className="relative group">
                    <div className="absolute inset-0 z-10 bg-[#050505]/60 backdrop-blur-[2px] rounded-[40px] flex flex-col items-center justify-center text-center p-8 border border-white/5 shadow-2xl">
                      <div className="h-16 w-16 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl flex items-center justify-center mb-4 border border-white/10 shadow-xl group-hover:scale-110 transition-transform">
                        <Lock className="h-8 w-8 text-amber-500" />
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Sección Bloqueada</h3>
                      <p className="text-zinc-400 text-sm max-w-[280px] mb-6 font-medium">
                        La gestión de <span className="text-white">Inventario, Gastos y Estadísticas</span> solo está disponible en planes <span className="text-emerald-500 font-bold">Pro</span> o <span className="text-amber-500 font-bold">Premium</span>.
                      </p>
                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="bg-white text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-lg shadow-white/5 active:scale-95"
                      >
                        Mejorar mi Plan Ahora
                      </button>
                    </div>
                    {/* Placeholder content blurred */}
                    <div className="opacity-20 pointer-events-none select-none filter blur-sm grayscale space-y-4">
                      <div className="h-16 bg-zinc-900 rounded-xl" />
                      <div className="h-16 bg-zinc-900 rounded-xl" />
                      <div className="h-16 bg-zinc-900 rounded-xl" />
                    </div>
                  </div>
                ) : (
                  <>

                    {/* Inventario y Productos (Retrátil) */}
                    <button
                      onClick={() => setExpandInventory(!expandInventory)}
                      className="w-full flex items-center justify-between group bg-zinc-900/50 p-4 rounded-xl border border-white/5 hover:border-white/10 transition"
                    >
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <Package className="text-emerald-500 h-5 w-5" /> Inventario y Productos
                      </h3>
                      <div className={`rounded-full bg-zinc-800 p-1.5 transition-transform duration-300 ${expandInventory ? 'rotate-180' : ''}`}>
                        <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-white" />
                      </div>
                    </button>

                    {expandInventory && (
                      <div className="mt-2 space-y-8 animate-in fade-in slide-in-from-top-2 duration-200 bg-zinc-900/20 border border-white/5 p-8 rounded-[40px]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-bold flex items-center gap-2">
                              <Tag className="h-5 w-5 text-emerald-500" /> Control de Stock
                            </h3>
                            <p className="text-zinc-500 text-xs">Administra los productos de tu barbería.</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setEditingProduct(null); setProductForm({ name: '', description: '', price: 0, cost: 0, stock: 0, minStock: 5, category: '', imageUrl: '' }); setShowProductModal(true); }}
                              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-2xl font-bold transition shadow-lg shadow-emerald-500/20 text-xs uppercase tracking-widest"
                            >
                              <Plus className="h-4 w-4" /> Nuevo Producto
                            </button>
                          </div>
                        </div>

                        {/* Stats Cards Inside Inventory */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-zinc-900/80 border border-white/10 p-6 rounded-[32px]">
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1 font-bold">Valor Inventario</p>
                            <p className="text-3xl font-black">${products.filter(p => p.barbershopId === myShop.id).reduce((acc, p) => acc + (p.cost * p.stock), 0).toLocaleString()}</p>
                          </div>
                          <div className="bg-zinc-900/80 border border-white/10 p-6 rounded-[32px]">
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1 font-bold">Bajo Stock</p>
                            <p className="text-3xl font-black text-amber-500">{products.filter(p => p.barbershopId === myShop.id && p.stock <= p.minStock).length}</p>
                          </div>
                          <div className="bg-zinc-900/80 border border-white/10 p-6 rounded-[32px]">
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1 font-bold">Ventas (Mes)</p>
                            <p className="text-3xl font-black text-emerald-500">
                              ${productSales.filter(s => s.barbershopId === myShop.id).reduce((acc, s) => acc + s.totalPrice, 0).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Products Table */}
                        <div className="bg-black/40 border border-white/5 rounded-[32px] overflow-hidden">
                          <div className="overflow-x-auto text-xs font-bold leading-none">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                                  <th className="px-8 py-5">Producto</th>
                                  <th className="px-8 py-5">Categoría</th>
                                  <th className="px-8 py-5 text-right">Precio / Costo</th>
                                  <th className="px-8 py-5 text-center">Stock</th>
                                  <th className="px-8 py-5 text-right">Acciones</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {products.filter(p => p.barbershopId === myShop.id).map(p => (
                                  <tr key={p.id} className="hover:bg-white/5 transition group">
                                    <td className="px-8 py-5">
                                      <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/5">
                                          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" /> : <Package className="h-5 w-5 text-zinc-600" />}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="font-black uppercase tracking-tighter truncate text-sm">{p.name}</p>
                                          <p className="text-[10px] text-zinc-500 truncate max-w-[150px]">{p.description}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-8 py-5">
                                      <span className="bg-white/5 text-zinc-500 text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border border-white/5">
                                        {p.category || 'General'}
                                      </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                      <p className="font-black text-white italic text-base">${p.price}</p>
                                      <p className="text-[9px] text-zinc-600 uppercase">Costo: ${p.cost}</p>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                      <div className={`inline-flex flex-col items-center justify-center min-w-[50px] p-2 rounded-xl border ${p.stock <= p.minStock ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                                        <span className="text-sm font-black italic">{p.stock}</span>
                                        <span className="text-[7px] font-bold uppercase tracking-tighter opacity-70">unid</span>
                                      </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                        <button
                                          onClick={() => { setShowSellModal(true); setSellForm({ productId: p.id, quantity: 1, sellerId: currentUser.id }); }}
                                          className="p-2 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition"
                                          title="Vender ahora"
                                        >
                                          <ShoppingCart className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={() => { setEditingProduct(p); setProductForm({ name: p.name, description: p.description, price: p.price, cost: p.cost, stock: p.stock, minStock: p.minStock, category: p.category, imageUrl: p.imageUrl || '' }); setShowProductModal(true); }}
                                          className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition"
                                        >
                                          <Edit3 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {products.filter(p => p.barbershopId === myShop.id).length === 0 && (
                              <div className="p-16 text-center text-zinc-500">
                                <Package className="h-10 w-10 mx-auto mb-4 opacity-10" />
                                <p className="font-bold text-sm uppercase tracking-widest">No hay productos en inventario</p>
                                <p className="text-[10px]">Empieza agregando tus ceras, aceites o souvenirs.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Gastos (Retrátil) */}
                    <button
                      onClick={() => setExpandExpenses(!expandExpenses)}
                      className="w-full flex items-center justify-between group mb-4 bg-zinc-900/50 p-4 rounded-xl border border-white/5 hover:border-white/10 transition"
                    >
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <DollarSign className="text-red-500 h-5 w-5" /> gestión de Gastos
                      </h3>
                      <div className={`rounded-full bg-zinc-800 p-1.5 transition-transform duration-300 ${expandExpenses ? 'rotate-180' : ''}`}>
                        <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-white" />
                      </div>
                    </button>

                    {expandExpenses && (
                      <div className="rounded-2xl border border-white/10 bg-zinc-900/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

                        <div className="p-6 bg-zinc-900/30">
                          {/* Formulario simple */}
                          <div className="mb-8 flex flex-col md:flex-row gap-4 items-end bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                            <div className="flex-1 w-full">
                              <label className="text-xs text-zinc-500 block mb-1 font-bold uppercase tracking-wider">Descripción del Gasto</label>
                              <input value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} className="w-full bg-zinc-800 text-white rounded-lg p-2.5 text-sm border border-zinc-700 focus:border-red-500 outline-none transition" placeholder="Ej. Renta, Luz..." />
                            </div>
                            <div className="w-full md:w-40">
                              <label className="text-xs text-zinc-500 block mb-1 font-bold uppercase tracking-wider">Monto</label>
                              <input type="number" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} className="w-full bg-zinc-800 text-white rounded-lg p-2.5 text-sm border border-zinc-700 focus:border-red-500 outline-none transition" placeholder="0.00" />
                            </div>
                            <button
                              onClick={() => {
                                if (!newExpense.description || !newExpense.amount) return;
                                addExpense({
                                  barbershopId: myShop.id,
                                  description: newExpense.description,
                                  amount: parseFloat(newExpense.amount),
                                  category: 'other',
                                  date: new Date().toISOString().split('T')[0]
                                });
                                setNewExpense({ description: '', amount: '' });
                              }}
                              className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-red-500 hover:text-white transition flex items-center justify-center gap-2 w-full md:w-auto"
                            >
                              <Plus className="h-4 w-4" /> Registrar
                            </button>
                          </div>

                          {/* Tabla de Gastos */}
                          <div className="overflow-hidden rounded-xl border border-white/10 mb-6 bg-zinc-900/50">
                            <table className="w-full text-sm text-left">
                              <thead className="bg-white/5 text-zinc-400 uppercase text-[10px] font-black tracking-widest border-b border-white/5">
                                <tr><th className="px-6 py-4">Concepto</th><th className="px-6 py-4">Fecha</th><th className="px-6 py-4 text-right">Monto</th></tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {expenses.filter(e => e.barbershopId === myShop.id).map(e => (
                                  <tr key={e.id} className="hover:bg-white/5 transition"><td className="px-6 py-4 font-medium">{e.description}</td><td className="px-6 py-4 text-zinc-500">{e.date}</td><td className="px-6 py-4 text-right text-red-400 font-bold">-${e.amount}</td></tr>
                                ))}
                                {expenses.filter(e => e.barbershopId === myShop.id).length === 0 && (
                                  <tr><td colSpan={3} className="px-6 py-12 text-center text-zinc-500 font-medium">No hay gastos registrados</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* Estadísticas Mensuales (Retrátil) */}
                    <button
                      onClick={() => setExpandCharts(!expandCharts)}
                      className="w-full flex items-center justify-between group mb-4 bg-zinc-900/50 p-4 rounded-xl border border-white/5 hover:border-white/10 transition"
                    >
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <BarChart3 className="text-blue-500 h-5 w-5" /> Estadísticas del Mes
                        {!canUseStats && (
                          <span className="flex items-center gap-1 bg-amber-500/10 text-amber-500 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/20">
                            <Lock className="h-2 w-2" /> PLAN PREMIUM
                          </span>
                        )}
                      </h3>
                      <div className={`rounded-full bg-zinc-800 p-1.5 transition-transform duration-300 ${expandCharts ? 'rotate-180' : ''}`}>
                        <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-white" />
                      </div>
                    </button>

                    {expandCharts && (
                      !canUseStats ? (
                        <div className="relative group mb-8">
                          <div className="absolute inset-0 z-10 bg-[#050505]/60 backdrop-blur-[2px] rounded-[40px] flex flex-col items-center justify-center text-center p-8 border border-white/5 shadow-2xl">
                            <div className="h-16 w-16 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl flex items-center justify-center mb-4 border border-white/10 shadow-xl group-hover:scale-110 transition-transform">
                              <Lock className="h-8 w-8 text-amber-500" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Sección Bloqueada</h3>
                            <p className="text-zinc-400 text-sm max-w-[280px] mb-6 font-medium">
                              Las <span className="text-white">Estadísticas y Análisis de fuga</span> solo están disponibles en el plan <span className="text-amber-500 font-bold">Premium</span>.
                            </p>
                            <button
                              onClick={() => setShowUpgradeModal(true)}
                              className="bg-white text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-lg shadow-white/5 active:scale-95"
                            >
                              Mejorar mi Plan Ahora
                            </button>
                          </div>
                          {/* Placeholder content blurred */}
                          <div className="opacity-20 pointer-events-none select-none filter blur-sm grayscale space-y-4 p-8 bg-zinc-900/20 rounded-[40px] border border-white/5">
                            <div className="h-32 bg-zinc-900 rounded-2xl" />
                            <div className="grid grid-cols-2 gap-4">
                              <div className="h-40 bg-zinc-900 rounded-2xl" />
                              <div className="h-40 bg-zinc-900 rounded-2xl" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">

                          {/* ROW 1: Statistics & Predictions */}
                          <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* 1. Simulador: Potencial Máximo (0% Cancelaciones + Recuperación) */}
                            {(() => {
                              const now = new Date();
                              const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                              const monthlyApts = shopAppointments.filter(a => (a.date || '').startsWith(currentMonthStr));

                              const actualEarnings = monthlyApts.filter(a => a.status === 'completed').reduce((sum, a) => sum + (a.price || 0), 0);
                              const lostEarnings = monthlyApts.filter(a => a.status === 'cancelled').reduce((sum, a) => sum + (a.price || 0), 0);
                              const pendingEarnings = monthlyApts.filter(a => a.status === 'confirmed' || a.status === 'pending').reduce((sum, a) => sum + (a.price || 0), 0);
                              const maxPotential = actualEarnings + lostEarnings + pendingEarnings;

                              return (
                                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-full relative group overflow-hidden">
                                  {/* Background Glow */}
                                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -z-10 transition group-hover:bg-emerald-500/10" />

                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                      <Sparkles className="h-4 w-4 text-emerald-400" />
                                    </div>
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Potencial Máximo</span>
                                  </div>

                                  <div className="mt-2">
                                    <p className="text-4xl font-bold text-white tracking-tight tabular-nums">
                                      ${maxPotential.toLocaleString()}
                                    </p>
                                    <p className="text-[10px] text-zinc-500 mt-1 font-medium">
                                      Ingreso total si toda cita se completa
                                    </p>
                                  </div>

                                  <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-3 gap-4">
                                    <div>
                                      <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Real</p>
                                      <p className="text-sm font-bold text-emerald-400 tabular-nums">${actualEarnings.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Pendiente</p>
                                      <p className="text-sm font-bold text-blue-400 tabular-nums">${pendingEarnings.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Perdido</p>
                                      <p className="text-sm font-bold text-rose-400 line-through decoration-rose-400/50 tabular-nums">${lostEarnings.toLocaleString()}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* 2. Simulador de Escenarios (10/20/30%) */}
                            {(() => {
                              const now = new Date();
                              const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

                              const currentRevenue = shopAppointments
                                .filter(a => (a.date || '').startsWith(currentMonthStr) && a.status === 'completed')
                                .reduce((s, a) => s + (a.price || 0), 0);

                              const potentialRevenue = shopAppointments
                                .filter(a => {
                                  if (!(a.date || '').startsWith(currentMonthStr)) return false;
                                  return (a.status === 'confirmed' || a.status === 'pending');
                                })
                                .reduce((sum, a) => sum + (a.price || 0), 0);

                              const scenarios = [
                                { label: 'Optimista (10%)', rate: 0.10, color: 'text-emerald-400', barColor: 'bg-emerald-500' },
                                { label: 'Realista (20%)', rate: 0.20, color: 'text-blue-400', barColor: 'bg-blue-500' },
                                { label: 'Pesimista (30%)', rate: 0.30, color: 'text-zinc-400', barColor: 'bg-zinc-600' },
                              ];

                              return (
                                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex flex-col h-full justify-between relative group overflow-hidden">
                                  <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -z-10 transition group-hover:bg-blue-500/10" />

                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                      <Activity className="h-4 w-4 text-indigo-400" />
                                    </div>
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Escenarios de Riesgo</span>
                                  </div>

                                  <div className="space-y-4">
                                    {scenarios.map((scenario, idx) => {
                                      const discountedPotential = potentialRevenue * (1 - scenario.rate);
                                      const totalProtected = currentRevenue + discountedPotential;
                                      return (
                                        <div key={idx} className="group/item">
                                          <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase">{scenario.label}</span>
                                            <span className={`text-xs font-bold ${scenario.color} tabular-nums`}>
                                              ${totalProtected.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </span>
                                          </div>
                                          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                            <div className={`h-full ${scenario.barColor} transition-all duration-500`} style={{ width: '100%' }} />
                                          </div>
                                        </div>
                                      );
                                    })}
                                    <p className="text-[9px] text-zinc-600 text-right pt-1">*Proyección con tasa de cancelación</p>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* 3. IA Prediction Module */}
                            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-full relative group overflow-hidden">
                              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -z-10 transition group-hover:bg-purple-500/20" />

                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                    <Bot className="h-4 w-4 text-purple-400" />
                                  </div>
                                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Predicción IA</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[9px] font-bold text-purple-400 uppercase tracking-wider">
                                  Beta
                                </span>
                              </div>

                              {(() => {
                                const now = new Date();
                                const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                                const currentDay = now.getDate();
                                const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

                                const currentRevenue = shopAppointments
                                  .filter(a => (a.date || '').startsWith(currentMonthStr) && a.status === 'completed')
                                  .reduce((sum, a) => sum + (a.price || 0), 0);

                                const futureRevenue = shopAppointments
                                  .filter(a => {
                                    if (!(a.date || '').startsWith(currentMonthStr)) return false;
                                    const aptDay = parseInt(a.date.split('-')[2]);
                                    return aptDay >= currentDay && (a.status === 'confirmed' || a.status === 'pending');
                                  })
                                  .reduce((sum, a) => sum + (a.price || 0), 0);

                                const effectiveDay = Math.max(currentDay, 1);
                                const dailyAvg = currentRevenue / effectiveDay;
                                const linearProjection = Math.round(dailyAvg * daysInMonth);
                                const safeProjection = Math.max(linearProjection, currentRevenue + futureRevenue);

                                return (
                                  <div className="mt-2">
                                    <p className="text-4xl font-bold text-white tracking-tight tabular-nums relative inline-block">
                                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                        ${safeProjection.toLocaleString()}
                                      </span>
                                    </p>
                                    <p className="text-[10px] text-zinc-500 mt-1 font-medium">
                                      Proyección de cierre estimada por IA
                                    </p>

                                    <div className="mt-6 pt-4 border-t border-white/5">
                                      <div className="flex justify-between items-center">
                                        <p className="text-[10px] text-zinc-500 uppercase font-bold">Base Asegurada</p>
                                        <p className="text-sm font-bold text-purple-300 tabular-nums">
                                          ${(currentRevenue + futureRevenue).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          {/* ROW 2: Charts & Balance */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* Gráfica de Citas */}
                            <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
                              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-500" /> Citas (Mensual)
                              </h3>
                              <div className="h-32 relative">
                                {(() => {
                                  const now = new Date();
                                  const year = now.getFullYear();
                                  const month = now.getMonth();
                                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                                  const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
                                    const d = new Date(year, month, i + 1);
                                    return d.toISOString().split('T')[0];
                                  });

                                  const counts = monthDays.map(date =>
                                    shopAppointments.filter(a => a.date === date).length
                                  );
                                  const maxCount = Math.max(...counts, 1);
                                  const points = counts.map((count, i) => {
                                    const x = (i / (counts.length - 1)) * 100;
                                    const y = 100 - ((count / maxCount) * 90);
                                    return `${x},${y}`;
                                  }).join(' ');

                                  return (
                                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                      {/* Grid lines */}
                                      <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                                      <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                                      <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

                                      {/* Gradient fill */}
                                      <defs>
                                        <linearGradient id="citasGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                          <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                                          <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                                        </linearGradient>
                                      </defs>
                                      <polygon points={`0,100 ${points} 100,100`} fill="url(#citasGradient)" />

                                      {/* Line */}
                                      <polyline
                                        points={points}
                                        fill="none"
                                        stroke="rgb(59, 130, 246)"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />

                                      {/* Points */}
                                      {counts.map((count, i) => {
                                        const x = (i / (counts.length - 1)) * 100;
                                        const y = 100 - ((count / maxCount) * 90);
                                        return (
                                          <circle
                                            key={i}
                                            cx={x}
                                            cy={y}
                                            r="2"
                                            fill="rgb(59, 130, 246)"
                                            stroke="rgb(24, 24, 27)"
                                            strokeWidth="1"
                                          />
                                        );
                                      })}
                                    </svg>
                                  );
                                })()}
                              </div>
                              <div className="flex justify-between mt-3 text-[10px] text-zinc-500 font-medium">
                                <span>Día 1</span>
                                <span>Día 15</span>
                                <span>Día {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}</span>
                              </div>
                            </div>

                            {/* Gráfica de Ganancias */}
                            <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
                              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-emerald-500" /> Ganancias (Mensual)
                              </h3>
                              <div className="h-32 relative">
                                {(() => {
                                  const now = new Date();
                                  const year = now.getFullYear();
                                  const month = now.getMonth();
                                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                                  const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
                                    const d = new Date(year, month, i + 1);
                                    return d.toISOString().split('T')[0];
                                  });

                                  const revenues = monthDays.map(date =>
                                    shopAppointments
                                      .filter(a => a.date === date && a.status === 'completed')
                                      .reduce((sum, a) => sum + (a.price || 0), 0)
                                  );
                                  const maxRevenue = Math.max(...revenues, 1);
                                  const points = revenues.map((revenue, i) => {
                                    const x = (i / (revenues.length - 1)) * 100;
                                    const y = 100 - ((revenue / maxRevenue) * 90);
                                    return `${x},${y}`;
                                  }).join(' ');

                                  return (
                                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                      {/* Grid lines */}
                                      <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                                      <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                                      <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

                                      {/* Gradient fill */}
                                      <defs>
                                        <linearGradient id="gananciaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                          <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.3" />
                                          <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0" />
                                        </linearGradient>
                                      </defs>
                                      <polygon points={`0,100 ${points} 100,100`} fill="url(#gananciaGradient)" />

                                      {/* Line */}
                                      <polyline
                                        points={points}
                                        fill="none"
                                        stroke="rgb(16, 185, 129)"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />

                                      {/* Points */}
                                      {revenues.map((revenue, i) => {
                                        const x = (i / (revenues.length - 1)) * 100;
                                        const y = 100 - ((revenue / maxRevenue) * 90);
                                        return (
                                          <circle
                                            key={i}
                                            cx={x}
                                            cy={y}
                                            r="2"
                                            fill="rgb(16, 185, 129)"
                                            stroke="rgb(24, 24, 27)"
                                            strokeWidth="1"
                                          />
                                        );
                                      })}
                                    </svg>
                                  );
                                })()}
                              </div>
                              <div className="flex justify-between mt-3 text-[10px] text-zinc-500 font-medium">
                                <span>Día 1</span>
                                <span>Día 15</span>
                                <span>Día {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}</span>
                              </div>
                            </div>

                            {/* Ganancia Neta */}
                            <div className="bg-zinc-900/50 p-1.5 rounded-2xl border border-white/10">
                              <div className="bg-black/40 p-6 rounded-xl border border-white/5 h-full flex flex-col justify-between">
                                {(() => {
                                  const now = new Date();
                                  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                                  const monthlyRevenue = shopAppointments
                                    .filter(a => (a.date || '').startsWith(currentMonthStr) && a.status === 'completed')
                                    .reduce((s, a) => s + (a.price || 0), 0);
                                  const monthlyExpenses = expenses
                                    .filter(e => e.barbershopId === myShop.id && (e.date || '').startsWith(currentMonthStr))
                                    .reduce((s, b) => s + (b.amount || 0), 0);
                                  const netEarnings = monthlyRevenue - monthlyExpenses;

                                  return (
                                    <>
                                      <div className="flex items-center justify-between gap-4 mb-4 pb-2 border-b border-white/5">
                                        <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Balance Mensual</span>
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                      </div>
                                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
                                        <div>
                                          <p className="text-xs text-zinc-400 mb-2 flex justify-between gap-8">
                                            <span className="font-medium">Ingresos del Mes:</span> <span className="text-emerald-400 font-bold">+${monthlyRevenue}</span>
                                          </p>
                                          <p className="text-xs text-zinc-400 mb-0 flex justify-between gap-8">
                                            <span className="font-medium">Gastos del Mes:</span> <span className="text-red-400 font-bold">-${monthlyExpenses}</span>
                                          </p>
                                        </div>
                                        <div className="pt-4 border-t sm:border-t-0 border-white/10 text-right">
                                          <span className={`text-5xl font-black block leading-none ${netEarnings >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                            ${netEarnings}
                                          </span>
                                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-2 italic">Neto Mensual</p>
                                        </div>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}

                    {/* Reportes Mensuales Section */}

                    <button
                      onClick={() => setExpandMonthlyReports(!expandMonthlyReports)}
                      className="w-full flex items-center justify-between group mb-4 mt-8 bg-zinc-900/50 p-4 rounded-xl border border-white/5 hover:border-white/10 transition"
                    >
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <FileText className="text-zinc-400 h-5 w-5" /> Reportes Mensuales
                      </h3>
                      <div className={`rounded-full bg-zinc-800 p-1.5 transition-transform duration-300 ${expandMonthlyReports ? 'rotate-180' : ''}`}>
                        <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-white" />
                      </div>
                    </button>

                    {expandMonthlyReports && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-200 mb-8">

                        {/* Storage Warning */}
                        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 flex items-start gap-3 mb-6">
                          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-amber-500 mb-1">Política de Almacenamiento</p>
                            <p className="text-xs text-amber-200/60 leading-relaxed">
                              Por motivos de rendimiento y privacidad, los reportes detallados solo se mantienen disponibles por un periodo de <strong>3 meses</strong>. Te recomendamos imprimir o guardar tus reportes periódicamente.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {(() => {
                            const months = [];
                            const today = new Date();
                            for (let i = 0; i < 3; i++) {
                              const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                              const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                              const monthName = d.toLocaleString('default', { month: 'long', year: 'numeric' });
                              months.push({ key: monthKey, name: monthName });
                            }

                            return months.map(m => (
                              <button
                                key={m.key}
                                onClick={() => setSelectedReportMonth(m.key)}
                                className="bg-zinc-900 border border-white/5 p-5 rounded-2xl flex flex-col items-start gap-4 hover:bg-zinc-800 transition-all group hover:border-white/10"
                              >
                                <div className="p-3 bg-zinc-950 rounded-xl border border-white/5 group-hover:bg-zinc-900 transition">
                                  <FileText className="h-6 w-6 text-zinc-500 group-hover:text-white transition" />
                                </div>
                                <div className="text-left">
                                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Reporte de</p>
                                  <p className="text-xl font-bold text-white capitalize">{m.name}</p>
                                </div>
                                <div className="mt-auto pt-4 border-t border-white/5 w-full flex items-center justify-between">
                                  <span className="text-xs font-bold text-zinc-600 group-hover:text-emerald-400 transition">Ver Detalles</span>
                                  <Printer className="h-4 w-4 text-zinc-700 group-hover:text-white transition" />
                                </div>
                              </button>
                            ));
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Monthly Report Modal */}
                    {selectedReportMonth && (
                      <MonthlyReportModal
                        monthKey={selectedReportMonth}
                        onClose={() => setSelectedReportMonth(null)}
                        appointments={shopAppointments}
                        expenses={expenses}
                        myShop={myShop}
                      />
                    )}

                  </>
                )}
              </div>
            </div>
          )}

          {/* Citas */}
          {tab === 'appointments' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Mis Citas</h1>
                  <p className="text-zinc-400 text-sm">Gestiona las citas de {myShop.name}</p>
                </div>
                <button
                  onClick={() => setShowManualApt(!showManualApt)}
                  className="rounded-xl bg-emerald-500 text-white px-5 py-2.5 font-bold flex items-center gap-2 hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  <Plus className="h-4 w-4" /> Registrar Venta / Cita
                </button>
              </div>
              {/* Citas Pendientes de Cerrar (Pasadas) */}
              {(() => {
                const now = new Date();
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                const pastApts = shopAppointments
                  .filter(a => {
                    if (a.date !== todayStr) return false;
                    if (a.status === 'cancelled' || a.status === 'completed') return false;
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
                                    {myShop.name} <span className="mx-1 text-zinc-600">|</span> {apt.barberName}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                                    <span className="text-xs font-bold text-white bg-white/5 px-2 py-0.5 rounded-lg">${apt.price}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-end">
                                {statusBadge(apt.status)}
                              </div>
                            </div>

                            <div className="flex flex-wrap justify-end gap-2 mt-1 sm:mt-0">
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                                className="w-full sm:w-auto rounded-lg bg-green-600 hover:bg-green-500 px-3 py-1.5 text-xs font-medium text-white transition flex items-center justify-center gap-1"
                              >
                                <CheckCircle className="h-3 w-3" /> <span className="sm:inline">Completar</span>
                              </button>
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                                className="flex-1 sm:flex-none rounded-lg bg-red-600 hover:bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition flex items-center justify-center gap-1"
                              >
                                <XCircle className="h-3 w-3" /> <span className="sm:inline">No Asistió</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Citas de Hoy (Moved here) */}
              <div className="mb-8 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 shadow-lg shadow-emerald-500/5">
                <h2 className="text-base font-bold mb-3 flex items-center gap-2 text-emerald-400">
                  <Calendar className="h-4 w-4" /> Citas de Hoy
                </h2>
                <div className="space-y-2">
                  {(() => {
                    const now = new Date();
                    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                    const todayApts = shopAppointments
                      .filter(a => {
                        if (a.date !== todayStr) return false;
                        if (a.status === 'cancelled' || a.status === 'completed') return false;

                        const aptDate = new Date(`${a.date}T${a.time}`);
                        const nowTime = new Date();
                        if (aptDate < nowTime) return false;

                        return true;
                      })
                      .sort((a, b) => a.time.localeCompare(b.time));

                    if (todayApts.length === 0) return <p className="text-sm text-zinc-500">No hay citas para hoy.</p>;

                    return todayApts.map(apt => {
                      // 12h format conversion
                      const [hours, minutes] = (apt.time || "00:00").split(':');
                      const h = parseInt(hours, 10);
                      const ampm = h >= 12 ? 'PM' : 'AM';
                      const h12 = h % 12 || 12;
                      const time12 = `${h12}:${minutes} ${ampm}`;

                      return (
                        <div key={'today-' + apt.id} className="flex flex-col gap-3 rounded-lg bg-zinc-900 border border-white/10 p-3 hover:border-emerald-500/30 transition shadow-sm overflow-hidden text-left">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="text-center bg-zinc-800 rounded-xl px-3 py-2.5 shrink-0 border border-white/5 flex flex-col items-center justify-center gap-0.5 min-h-[70px]">
                                <span className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest">HOY</span>
                                <span className="block text-base font-black text-white whitespace-nowrap leading-tight">{time12}</span>
                                <span className="block text-[10px] text-zinc-500 font-medium whitespace-nowrap">{apt.date}</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-base font-bold text-white leading-tight">{apt.clientName || 'Cliente'}</p>
                                <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                                  {myShop.name} <span className="mx-1 text-zinc-600">|</span> {apt.barberName}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                                  <span className="text-xs font-bold text-white bg-white/5 px-2 py-0.5 rounded-lg">${apt.price}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-end">
                              {statusBadge(apt.status)}
                            </div>
                          </div>

                          {/* Action Buttons for Today's Appointments */}
                          <div className="flex flex-wrap justify-end gap-2 mt-1 sm:mt-0">
                            {apt.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                                  className="flex-1 sm:flex-none rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition flex items-center justify-center gap-1"
                                >
                                  <CheckCircle className="h-3 w-3" /> <span className="sm:inline">Confirmar</span>
                                </button>
                                <button
                                  onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                                  className="flex-1 sm:flex-none rounded-lg bg-red-600 hover:bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition flex items-center justify-center gap-1"
                                >
                                  <XCircle className="h-3 w-3" /> <span className="sm:inline">Rechazar</span>
                                </button>
                              </>
                            )}
                            {apt.status === 'confirmed' && (
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                                className="w-full sm:w-auto rounded-lg bg-green-600 hover:bg-green-500 px-3 py-1.5 text-xs font-medium text-white transition flex items-center justify-center gap-1"
                              >
                                <CheckCircle className="h-3 w-3" /> <span className="sm:inline">Completar</span>
                              </button>
                            )}
                            {canUseWhatsapp && apt.clientPhone && (
                              <button
                                onClick={() => sendWhatsAppReminder(apt.clientPhone, apt.clientName, apt.date, apt.time, myShop.name)}
                                className="flex-1 sm:flex-none rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 text-xs font-medium hover:bg-emerald-600 hover:text-white transition flex items-center justify-center gap-1"
                                title="Enviar recordatorio WhatsApp"
                              >
                                <Phone className="h-3 w-3" /> <span className="sm:inline">WhatsApp</span>
                              </button>
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
                  const filtered = shopAppointments.filter(apt => {
                    if (apt.status === 'completed' || apt.status === 'cancelled') return false;
                    const now = new Date();
                    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                    if (apt.date <= todayStr) return false;
                    return true;
                  }).sort((a, b) => {
                    const dateA = new Date(`${a.date}T${a.time}`);
                    const dateB = new Date(`${b.date}T${b.time}`);
                    return dateA.getTime() - dateB.getTime();
                  });

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
                            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                              <Scissors className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-white text-base leading-tight">{apt.clientName || 'Cliente'}</h3>
                              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                                {myShop.name} <span className="mx-1 text-zinc-600">|</span> {apt.barberName}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 w-full">
                                <span className="flex items-center gap-1.5 text-xs text-zinc-500"><Calendar className="h-3 w-3" /> {apt.date}</span>
                                <span className="flex items-center gap-1.5 text-xs text-zinc-500"><Clock className="h-3 w-3" /> {apt.time}</span>
                                <span className="text-xs font-bold text-white bg-white/5 px-2 py-0.5 rounded-lg ml-auto">${apt.price}</span>
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0">
                            {statusBadge(apt.status)}
                          </div>
                        </div>

                        <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-white/5">
                          {apt.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                                className="flex-1 sm:flex-none rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-2 text-xs font-bold text-white transition flex items-center justify-center gap-2" title="Confirmar"
                              >
                                <CheckCircle className="h-4 w-4" /> <span className="sm:inline">Confirmar</span>
                              </button>
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                                className="flex-1 sm:flex-none rounded-lg bg-red-600 hover:bg-red-500 px-3 py-2 text-xs font-bold text-white transition flex items-center justify-center gap-2"
                                title="Rechazar"
                              >
                                <XCircle className="h-4 w-4" /> <span className="sm:inline">Rechazar</span>
                              </button>
                            </>
                          )}
                          {apt.status === 'confirmed' && (
                            <button
                              onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                              className="w-full sm:w-auto rounded-lg bg-red-600 hover:bg-red-500 px-3 py-2 text-xs font-bold text-white transition flex items-center justify-center gap-2"
                            >
                              <XCircle className="h-4 w-4" /> <span className="sm:inline">Cancelar</span>
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

          {/* Agenda */}
          {
            tab === 'agenda' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold mb-0.5 sm:mb-1 truncate">Agenda de Barbería</h1>
                    <p className="text-emerald-400 font-bold text-sm sm:text-base truncate">{myShop.name}</p>
                    <p className="text-zinc-500 text-[10px] sm:text-xs">Gestiona citas y reservas manuales.</p>
                  </div>
                  <button
                    onClick={() => setShowManualApt(!showManualApt)}
                    className="rounded-xl bg-emerald-500 text-white px-5 py-2.5 font-bold flex items-center gap-2 hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    <Plus className="h-4 w-4" /> Registrar Venta / Cita
                  </button>
                </div>

                <div className="flex flex-col xl:flex-row gap-8">
                  <div className="w-full xl:w-[350px] shrink-0">
                    <MiniCalendar
                      appointments={shopAppointments}
                      selectedDate={filterDate}
                      onDateSelect={(d) => setFilterDate(d === filterDate ? null : d)}
                      color="emerald"
                    />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {filterDate ? `Agenda del ${filterDate}` : 'Agenda del Mes'}
                      </h3>
                      {filterDate && (
                        <button
                          onClick={() => setFilterDate(null)}
                          className="text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
                        >
                          Ver todas
                        </button>
                      )}
                    </div>

                    {(filterDate ? shopAppointments.filter(a => a.date === filterDate) : shopAppointments)
                      .sort((a, b) => {
                        // 1. Priority: Pending First
                        if (a.status === 'pending' && b.status !== 'pending') return -1;
                        if (a.status !== 'pending' && b.status === 'pending') return 1;

                        // 2. All others: Chronological (Date/Time Ascending)
                        if (a.date !== b.date) return a.date.localeCompare(b.date);
                        return a.time.localeCompare(b.time);
                      })
                      .map(apt => (
                        <div key={apt.id} className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 sm:p-5 hover:border-emerald-500/30 transition group overflow-hidden mb-3 text-left">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                                {(apt.clientName || '?')[0]}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-white text-base leading-tight">{apt.clientName || 'Cliente'}</p>
                                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                                  {apt.service} <span className="mx-1 text-zinc-600">|</span> {myShop?.name || 'Barbería'} <span className="mx-1 text-zinc-600">|</span> {apt.barberName}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 w-full">
                                  <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                                    <Calendar className="h-3.5 w-3.5" /> {apt.date}
                                  </span>
                                  <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                                    <Clock className="h-3.5 w-3.5" /> {apt.time}
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

                    {(filterDate ? shopAppointments.filter(a => a.date === filterDate) : shopAppointments).length === 0 && (
                      <div className="text-center py-16 text-zinc-500">
                        <Calendar className="mx-auto h-12 w-12 mb-3 text-zinc-700" />
                        <p className="text-lg">Sin citas registradas</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          }




          {/* Reviews / Quality */}
          {
            tab === 'messages' && (
              <div className="h-[calc(100vh-140px)] flex flex-col">
                <h1 className="text-2xl font-bold mb-4">Mensajeria</h1>
                <div className="flex-1 overflow-hidden relative">
                  <div className={`absolute inset-0 rounded-2xl border border-white/10 bg-zinc-900/50 flex flex-col overflow-hidden transition-transform duration-300 ${msgTo ? '-translate-x-full' : 'translate-x-0'}`}>
                    <div className="p-2 border-b border-white/10 bg-zinc-900/80 flex gap-1">
                      <button
                        onClick={() => setMsgSubTab('clients')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition ${msgSubTab === 'clients' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                      >
                        <Users className="h-3.5 w-3.5" /> Clientes
                      </button>
                      <button
                        onClick={() => setMsgSubTab('barbers')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition ${msgSubTab === 'barbers' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                      >
                        <Scissors className="h-3.5 w-3.5" /> Barberos
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {msgSubTab === 'clients' ? (
                        <>
                          {clientContacts.length === 0 && <div className="p-8 text-center text-xs text-zinc-500">No hay clientes recientes.</div>}
                          {clientContacts.map((c: any) => (
                            <button
                              key={c.id}
                              onClick={() => setMsgTo(c.id)}
                              className={`w-full text-left p-4 hover:bg-zinc-800/50 transition flex items-center gap-3 border-b border-white/10/30 ${msgTo === c.id ? 'bg-emerald-500/10 border-l-4 border-l-emerald-500 pl-3' : 'pl-4'}`}
                            >
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${msgTo === c.id ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>{(c.name || '?')[0]}</div>
                              <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="font-medium text-sm text-zinc-200">{c.name}</div>
                                  <div className="text-[10px] text-zinc-500 mt-0.5">Cliente</div>
                                </div>
                                {/* No profile for clients usually, but let's keep it consistent if needed. For now just name. */}
                              </div>
                            </button>
                          ))}
                        </>
                      ) : (
                        <>
                          {barberContacts.length === 0 && <div className="p-8 text-center text-xs text-zinc-500">No hay barberos registrados.</div>}
                          {barberContacts.map((c: any) => (
                            <button
                              key={c.id}
                              onClick={() => setMsgTo(c.id)}
                              className={`w-full text-left p-4 hover:bg-zinc-800/50 transition flex items-center gap-3 border-b border-white/10/30 ${msgTo === c.id ? 'bg-emerald-500/10 border-l-4 border-l-emerald-500 pl-3' : 'pl-4'}`}
                            >
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${msgTo === c.id ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>{(c.name || '?')[0]}</div>
                              <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="font-medium text-sm text-zinc-200">{c.name}</div>
                                  <div className="text-[10px] text-zinc-500 mt-0.5">Barbero</div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const fullBarber = barbers.find((b: any) => b.userId === c.id || b.id === c.id);
                                    if (fullBarber) setViewingBarberProfile(fullBarber);
                                  }}
                                  className="p-1.5 rounded-full bg-zinc-800 text-emerald-500 hover:bg-emerald-500 hover:text-zinc-900 transition-all shrink-0"
                                >
                                  <Info className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  <div className={`absolute inset-0 rounded-2xl border border-white/10 bg-zinc-900/50 flex flex-col overflow-hidden transition-transform duration-300 ${msgTo ? 'translate-x-0' : 'translate-x-full'} z-10`}>
                    {msgTo ? (
                      <>
                        <div className="p-4 border-b border-white/10 font-bold bg-zinc-900/80 flex items-center justify-between gap-3 backdrop-blur-md">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-emerald-500/20">
                              {([...clientContacts, ...barberContacts].find(c => c.id === msgTo)?.name || '?')[0]}
                            </div>
                            <span className="text-lg">
                              {[...clientContacts, ...barberContacts].find(c => c.id === msgTo)?.name}
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
                          {currentChatMessages.length === 0 && <div className="text-center py-20 opacity-50"><MessageSquare className="h-12 w-12 mx-auto mb-2 text-zinc-600" /> <p>Inicia la conversación</p></div>}
                          {currentChatMessages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-md relative ${msg.senderId === currentUser.id
                                ? 'bg-emerald-600 text-white rounded-br-none bg-gradient-to-br from-emerald-600 to-emerald-700 ml-4'
                                : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700/50 mr-4'
                                }`}>
                                <div className="pb-4">{msg.content}</div>
                                <div className={`absolute bottom-1 right-3 flex items-center gap-1 text-[10px] ${msg.senderId === currentUser.id ? 'text-emerald-100/70' : 'text-zinc-500'}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  {msg.senderId === currentUser.id && (
                                    <span>
                                      {msg.read ? (
                                        <CheckCheck className="h-3 w-3 text-emerald-200" />
                                      ) : (
                                        <Check className="h-3 w-3" />
                                      )}
                                    </span>
                                  )}
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
                              className="flex-1 bg-zinc-800/80 border border-zinc-700/50 rounded-xl pl-4 pr-12 py-3 text-sm focus:border-emerald-500 focus:bg-zinc-800 outline-none transition"
                              onKeyDown={e => e.key === 'Enter' && handleSendMsg()}
                            />
                            <button onClick={handleSendMsg} disabled={!msgContent.trim()} className="absolute right-2 top-2 p-1.5 bg-emerald-600 rounded-lg text-white hover:bg-emerald-500 disabled:opacity-0 transition-all shadow-lg shadow-emerald-600/20">
                              <MessageSquare className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          }



          {/* Settings */}
          {
            tab === 'admin' && isAdmin && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                      <Shield className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-black tracking-tight">Panel Administrativo</h1>
                      <p className="text-zinc-400 text-sm">Control central de BarberOs LM</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-zinc-900/80 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md overflow-x-auto">
                    {[
                      { id: 'stats', label: 'Dashboard', icon: Activity },
                      { id: 'shops', label: 'Barberías', icon: Store },
                      { id: 'users', label: 'Usuarios', icon: Users },
                      { id: 'coupons', label: 'Cupones', icon: Tag },
                      { id: 'transactions', label: 'Pagos', icon: DollarSign }
                    ].map(st => (
                      <button
                        key={st.id}
                        onClick={() => setAdminSubTab(st.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adminSubTab === st.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                      >
                        <st.icon className="hidden sm:inline h-3.5 w-3.5" /> {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SubTab Content */}
                <div className="animate-in fade-in duration-300">
                  {adminSubTab === 'stats' && (
                    <div className="space-y-8">
                      {/* Global Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                          { label: 'Total Usuarios', value: users.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                          { label: 'Barberías', value: barbershops.length, icon: Store, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                          { label: 'Transacciones', value: adminTransactions.length, icon: ShoppingCart, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                          { label: 'Ingresos Totales', value: `$${adminTransactions.reduce((acc, t) => acc + (t.amount || 0), 0)}`, icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10' }
                        ].map((stat, i) => (
                          <div key={i} className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-xl hover:border-white/20 transition-all">
                            <stat.icon className={`h-8 w-8 ${stat.color} mb-4`} />
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
                            <p className="text-3xl font-black text-white mt-1">{stat.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid lg:grid-cols-2 gap-8">
                        <div className="rounded-[32px] border border-white/10 bg-indigo-600/10 p-8 backdrop-blur-xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Sparkles className="h-24 w-24 text-indigo-400" />
                          </div>
                          <h3 className="text-2xl font-black text-white mb-2 italic">¡Aumenta tus ventas!</h3>
                          <p className="text-indigo-200/70 text-sm max-w-sm mb-6">Genera cupones estratégicos para influencers o campañas de marketing y mide el impacto en tiempo real.</p>
                          <button onClick={() => setAdminSubTab('coupons')} className="px-6 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20">Ir a Cupones</button>
                        </div>
                        <div className="rounded-[32px] border border-white/10 bg-zinc-900/50 p-8 backdrop-blur-xl">
                          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2"><History className="h-5 w-5 text-emerald-400" /> Actividad Reciente</h3>
                          <div className="space-y-4">
                            {adminTransactions.slice(0, 5).map((t, i) => (
                              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <DollarSign className="h-5 w-5 text-emerald-400" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-white">{t.barbershops?.name}</p>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{t.plan_id}</p>
                                  </div>
                                </div>
                                <span className="font-black text-emerald-400">${t.amount}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {adminSubTab === 'shops' && (
                    <div className="space-y-6">
                      <div className="rounded-[32px] border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-8">
                          <h2 className="text-2xl font-black flex items-center gap-2"><Store className="h-6 w-6 text-indigo-400" /> Gestión de Barberías</h2>
                          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">{barbershops.length} REGISTRADAS</div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead>
                              <tr className="border-b border-white/5 text-zinc-500">
                                <th className="pb-4 font-black uppercase text-[10px] tracking-widest">Barbería</th>
                                <th className="pb-4 font-black uppercase text-[10px] tracking-widest">Dueño</th>
                                <th className="pb-4 font-black uppercase text-[10px] tracking-widest">Plan</th>
                                <th className="pb-4 font-black uppercase text-[10px] tracking-widest">Acciones</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {barbershops.map(s => (
                                <tr key={s.id} className="group hover:bg-white/5 transition-colors">
                                  <td className="py-6">
                                    <div className="flex items-center gap-4">
                                      <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center font-black text-lg border border-white/5 shadow-inner">{s.name[0]}</div>
                                      <div>
                                        <div className="font-black text-zinc-200">{s.name}</div>
                                        <div className="text-[10px] text-zinc-500 font-bold italic">{s.address}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-6 font-bold text-zinc-400">{s.ownerName || 'N/A'}</td>
                                  <td className="py-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${s.plan === 'premium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : s.plan === 'pro' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-zinc-800 text-zinc-400 border-white/10'}`}>
                                      {s.plan.toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="py-6">
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <select
                                        onChange={async (e) => {
                                          if (window.confirm(`¿Cambiar el plan de ${s.name} a ${e.target.value.toUpperCase()}?`)) {
                                            await updateBarbershop(s.id, { plan: e.target.value as any });
                                            alert('Plan actualizado con éxito');
                                          }
                                        }}
                                        className="bg-zinc-800 border border-white/10 rounded-lg text-xs px-2 py-1 outline-none text-zinc-400"
                                        value={s.plan}
                                      >
                                        <option value="free">FREE</option>
                                        <option value="pro">PRO</option>
                                        <option value="premium">PREMIUM</option>
                                      </select>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {adminSubTab === 'users' && (
                    <div className="space-y-6">
                      <div className="rounded-[32px] border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-8">
                          <h2 className="text-2xl font-black flex items-center gap-2"><Users className="h-6 w-6 text-emerald-400" /> Monitoreo de Usuarios</h2>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead>
                              <tr className="border-b border-white/5 text-zinc-500">
                                <th className="pb-4 font-black uppercase text-[10px] tracking-widest">Usuario</th>
                                <th className="pb-4 font-black uppercase text-[10px] tracking-widest">Rol</th>
                                <th className="pb-4 font-black uppercase text-[10px] tracking-widest">Contacto</th>
                                <th className="pb-4 font-black uppercase text-[10px] tracking-widest">Acciones</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {users.map(u => (
                                <tr key={u.id} className="group hover:bg-white/5 transition-colors">
                                  <td className="py-6">
                                    <div className="flex items-center gap-4">
                                      <div className="h-12 w-12 rounded-full border-2 border-white/10 p-0.5 shadow-xl">
                                        <div className="h-full w-full rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center font-black text-white">{u.name[0]}</div>
                                      </div>
                                      <div>
                                        <div className="font-black text-zinc-200">{u.name}</div>
                                        <div className="text-[10px] text-zinc-500 font-bold">{u.email}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-6">
                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${u.role === 'owner' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : u.role === 'barber' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                                      {u.role.toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="py-6 text-xs font-bold text-zinc-400">{u.phone || 'N/A'}</td>
                                  <td className="py-6">
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => {
                                          if (window.confirm(`¿Estás seguro de que quieres dar de baja a ${u.name}?`)) {
                                            alert('Función de borrado protegida. Contacta a DB Master.');
                                          }
                                        }}
                                        className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                      >
                                        <UserX className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {adminSubTab === 'coupons' && (
                    <div className="grid lg:grid-cols-3 gap-8">
                      {/* Coupon Generator */}
                      <div className="lg:col-span-1 space-y-6">
                        <div className="rounded-[32px] border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-xl">
                          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Sparkles className="h-5 w-5 text-indigo-400" /> Generar Cupón Seguro</h2>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Código (ej: INFLUENCER100)</label>
                              <input
                                value={newCouponForm.code}
                                onChange={e => setNewCouponForm({ ...newCouponForm, code: e.target.value.toUpperCase() })}
                                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition"
                                placeholder="CÓDIGO ÚNICO"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Meses</label>
                                <input
                                  type="number"
                                  value={newCouponForm.months}
                                  onChange={e => setNewCouponForm({ ...newCouponForm, months: parseInt(e.target.value) })}
                                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Plan</label>
                                <select
                                  value={newCouponForm.planId}
                                  onChange={e => setNewCouponForm({ ...newCouponForm, planId: e.target.value })}
                                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition"
                                >
                                  <option value="pro">Plan PRO</option>
                                  <option value="premium">Plan PREMIUM</option>
                                </select>
                              </div>
                            </div>
                            <button
                              onClick={handleCreateCoupon}
                              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                            >
                              Crear Cupón de {newCouponForm.months} Meses
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-2">
                        <div className="rounded-[32px] border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-xl">
                          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Tag className="h-5 w-5 text-zinc-400" /> Cupones Generados</h2>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                              <thead>
                                <tr className="border-b border-white/5">
                                  <th className="pb-4 font-bold text-zinc-500 uppercase text-[10px]">Código</th>
                                  <th className="pb-4 font-bold text-zinc-500 uppercase text-[10px]">Plan</th>
                                  <th className="pb-4 font-bold text-zinc-500 uppercase text-[10px]">Meses</th>
                                  <th className="pb-4 font-bold text-zinc-500 uppercase text-[10px]">Estado</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {adminCoupons.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-zinc-500">No hay cupones registrados.</td></tr>}
                                {adminCoupons.map(c => (
                                  <tr key={c.id}>
                                    <td className="py-4 font-mono font-bold text-indigo-400">{c.code}</td>
                                    <td className="py-4 text-xs tracking-widest uppercase">{c.plan_id}</td>
                                    <td className="py-4 font-bold">{c.months}</td>
                                    <td className="py-4">
                                      {c.is_used ? (
                                        <span className="flex flex-col">
                                          <span className="text-red-400 font-bold text-[10px]">USADO</span>
                                          <span className="text-[9px] text-zinc-500">Por: {c.barbershops?.name}</span>
                                        </span>
                                      ) : (
                                        <span className="text-green-400 font-bold text-[10px]">DISPONIBLE</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {adminSubTab === 'transactions' && (
                    <div className="rounded-[32px] border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-xl">
                      <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><DollarSign className="h-5 w-5 text-emerald-400" /> Historial de Transacciones</h2>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-white/5">
                              <th className="pb-4 font-bold text-zinc-500 uppercase text-[10px]">Negocio</th>
                              <th className="pb-4 font-bold text-zinc-500 uppercase text-[10px]">Plan</th>
                              <th className="pb-4 font-bold text-zinc-500 uppercase text-[10px]">Monto</th>
                              <th className="pb-4 font-bold text-zinc-500 uppercase text-[10px]">Estado</th>
                              <th className="pb-4 font-bold text-zinc-500 uppercase text-[10px]">ID / Code</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {adminTransactions.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-zinc-500">No hay transacciones aún.</td></tr>}
                            {adminTransactions.map(t => (
                              <tr key={t.id}>
                                <td className="py-4 font-bold text-zinc-200">{t.barbershops?.name}</td>
                                <td className="py-4 text-xs font-bold uppercase">{t.plan_id}</td>
                                <td className="py-4 font-bold">${t.amount || 0}</td>
                                <td className="py-4 uppercase text-[10px] font-black">{t.status}</td>
                                <td className="py-4 text-[10px] font-mono text-zinc-500">{t.mercado_pago_id}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          }



          {
            showUpgradeModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="w-full max-w-4xl rounded-3xl bg-zinc-900 border border-white/10 p-1 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="relative bg-zinc-950/50 rounded-[22px] p-6 md:p-10">
                    <button
                      onClick={() => { setShowUpgradeModal(false); setShowUpgradeTokenInput(false); }}
                      className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition"
                    >
                      <X className="h-6 w-6" />
                    </button>

                    <div className="text-center mb-10">
                      <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-black uppercase tracking-widest mb-4 border border-indigo-500/20">Planes BarberOs LM</span>
                      <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Eleva tu Negocio <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">al Siguiente Nivel</span></h2>
                      <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Desbloquea herramientas avanzadas, elimina limites y gestiona multiples sedes con nuestros planes premium.</p>
                    </div>

                    {!showUpgradeTokenInput ? (
                      <div className="grid md:grid-cols-4 gap-6">
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300">
                          <h3 className="text-xl font-bold text-white mb-2">Gratuito</h3>
                          <div className="text-3xl font-black text-white mb-6">$0<span className="text-sm font-medium text-zinc-500">/mes</span></div>
                          <ul className="space-y-3 mb-8 text-sm text-zinc-400">
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-zinc-600" /> 1 Barbero independiente</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-zinc-600" /> Agenda Básica</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-zinc-600" /> Perfil en Directorio</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-zinc-600" /> Soporte via Email</li>
                          </ul>
                          <button disabled className="w-full py-3 rounded-xl bg-zinc-800 text-zinc-500 font-bold text-sm">Plan Actual</button>
                        </div>

                        <div className="relative rounded-2xl border border-indigo-500/30 bg-indigo-900/10 p-6 transform hover:-translate-y-1 transition duration-300 shadow-xl shadow-indigo-500/10">
                          <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">POPULAR</div>
                          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Star className="h-5 w-5 fill-indigo-500 text-indigo-500" /> PRO</h3>
                          <div className="text-3xl font-black text-white mb-6">$199<span className="text-sm font-medium text-zinc-500">/mes</span></div>
                          <ul className="space-y-3 mb-8 text-sm text-zinc-300">
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-400" /> Hasta 3 Barberos</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-400" /> gestión de Sillas</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-400" /> gestión de Gastos</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-400" /> Estadísticas Avanzadas</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-400" /> Sin Anuncios</li>
                          </ul>
                          <button
                            onClick={() => {
                              setPaymentPlan('PRO');
                              setUpgradeToken('');
                              setShowUpgradeTokenInput(true);
                            }}
                            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/25"
                          >
                            Actualizar a PRO
                          </button>
                        </div>

                        <div className="rounded-2xl border border-amber-500/30 bg-amber-900/10 p-6 transform hover:-translate-y-1 transition duration-300">
                          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Shield className="h-5 w-5 fill-amber-500 text-amber-500" /> Premium</h3>
                          <div className="text-3xl font-black text-white mb-6">$349<span className="text-sm font-medium text-zinc-500">/mes</span></div>
                          <ul className="space-y-3 mb-8 text-sm text-zinc-300">
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500" /> 6 Barberos</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500" /> Todo lo de PRO</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500" /> Soporte 24/7</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500" /> Prioridad en el Directorio</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500" /> Predicción de Ventas con IA</li>
                          </ul>
                          <button
                            onClick={() => {
                              setPaymentPlan('PREMIUM');
                              setUpgradeToken('');
                              setShowUpgradeTokenInput(true);
                            }}
                            className="w-full py-3 rounded-xl bg-amber-600 text-white font-bold text-sm hover:bg-amber-500 transition shadow-lg shadow-amber-500/25"
                          >
                            Actualizar a Premium
                          </button>
                        </div>

                        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-900/10 p-6 transform hover:-translate-y-1 transition duration-300">
                          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Store className="h-5 w-5 fill-emerald-500 text-emerald-500" /> Empresas</h3>
                          <div className="text-xl font-black text-white mb-6">$499 - $799<span className="text-sm font-medium text-zinc-500">/mes</span></div>
                          <ul className="space-y-3 mb-8 text-sm text-zinc-300">
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Múltiples Negocios</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Marketing WhatsApp</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Todo lo de Premium</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Panel Empresarial</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Asesoría Personalizada</li>
                          </ul>
                          <button onClick={() => window.open('https://chat.whatsapp.com/BUjhLgtBdxiDQT6LMywGx1', '_blank')} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/25">Contactar Admin</button>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-md mx-auto text-center animate-in fade-in slide-in-from-bottom-4">
                        <div className="h-16 w-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-zinc-400">
                          <DollarSign className="h-8 w-8 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {paymentPlan === 'PRO' ? 'Suscripción PRO' : 'Suscripción Premium'}
                        </h3>
                        <p className="text-zinc-400 text-sm mb-6">Selecciona tu método de pago seguro.</p>

                        <div className="space-y-4 mb-8">
                          <button
                            onClick={async () => {
                              setIsSubmitting(true);
                              try {
                                // Crear preferencia de pago en el backend seguro
                                const { data, error } = await supabase.functions.invoke('create-preference', {
                                  body: {
                                    plan: paymentPlan,
                                    barbershopId: myShop.id,
                                    userId: currentUser.id
                                  }
                                });

                                if (error) throw new Error(error.message || 'Error al conectar con el servidor de pagos.');

                                if (data?.init_point) {
                                  // Redirigir al checkout oficial de Mercado Pago con referencia rastreable
                                  window.open(data.init_point, '_blank');
                                } else {
                                  throw new Error('El servidor no devolvió un enlace de pago válido.');
                                }
                              } catch (err: any) {
                                console.error('Error de pago:', err);
                                // NUNCA usar links directos sin external_reference - eso causaría pagos sin activar
                                alert(
                                  '⚠️ Error al generar el enlace de pago seguro.\n\n' +
                                  'Por favor contacta al soporte para completar tu pago:\n' +
                                  '📧 barberosfive@gmail.com\n\n' +
                                  'NO realices ningún pago hasta que el enlace se genere correctamente.\n\n' +
                                  'Detalle técnico: ' + (err.message || 'Error desconocido')
                                );
                              } finally {
                                setIsSubmitting(false);
                              }
                            }}
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-3 bg-[#009EE3] hover:bg-[#008ED0] text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-[#009EE3]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14.07 15.66c-.47-.1-.95-.15-1.44-.15-1.93 0-3.75.76-5.11 2.01l-2.08-2.08c2.09-1.92 4.87-3.09 7.91-3.09.75 0 1.48.07 2.2.21l-1.48 3.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
                            Pagar con Mercado Pago
                          </button>
                        </div>

                        <div className="relative flex py-2 items-center">
                          <div className="flex-grow border-t border-zinc-700"></div>
                          <span className="flex-shrink-0 mx-4 text-zinc-500 text-xs font-bold uppercase">O ingresa un código</span>
                          <div className="flex-grow border-t border-zinc-700"></div>
                        </div>

                        <input
                          type="text"
                          value={upgradeToken}
                          onChange={(e) => setUpgradeToken(e.target.value.toUpperCase())}
                          placeholder="CÓDIGO DE ACTIVACIÓN"
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest text-white mb-4 focus:border-indigo-500 outline-none transition mt-4"
                        />

                        <button
                          onClick={async () => {
                            if (!upgradeToken) return;
                            setIsSubmitting(true);
                            try {
                              const { data, error } = await supabase.functions.invoke('redeem-coupon', {
                                body: { code: upgradeToken, barbershopId: myShop.id }
                              });
                              if (error) throw error;
                              if (data.success) {
                                alert(`¡Éxito! Plan ${data.plan.toUpperCase()} activado hasta el ${new Date(data.expiry).toLocaleDateString()}`);
                                setShowUpgradeModal(false);
                                window.location.reload();
                              } else {
                                alert(data.error || 'Código inválido.');
                              }
                            } catch (err: any) {
                              alert(err.message || 'Error al validar.');
                            } finally {
                              setIsSubmitting(false);
                            }
                          }}
                          className="w-full bg-white text-black font-black py-3 rounded-xl hover:bg-zinc-200 transition disabled:opacity-50"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'VALIDANDO...' : 'ACTIVAR CUPÓN'}
                        </button>
                        <button onClick={() => setShowUpgradeTokenInput(false)} className="mt-4 text-sm text-zinc-500 hover:text-white transition">Volver a planes</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          }

          {
            viewingBarberProfile && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
                <div className="w-full max-w-lg overflow-hidden rounded-[40px] border border-white/10 bg-[#0a0a0a] shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
                  <div className="relative h-40 bg-gradient-to-br from-zinc-800 to-black">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <button
                      onClick={() => setViewingBarberProfile(null)}
                      className="absolute top-6 right-6 z-10 rounded-full bg-white/5 p-3 text-white/50 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                    >
                      <X className="h-6 w-6" />
                    </button>
                    <div className="absolute -bottom-16 left-12 rounded-[32px] border-[8px] border-[#0a0a0a] bg-zinc-800 p-1 shadow-2xl">
                      <div className="flex h-32 w-32 items-center justify-center rounded-[24px] bg-gradient-to-br from-amber-400 to-amber-600 text-5xl font-black text-black">
                        {viewingBarberProfile.name?.[0] || 'U'}
                      </div>
                    </div>
                  </div>

                  <div className="p-12 pt-20">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <h2 className="text-4xl font-black uppercase tracking-tight text-white leading-none">{viewingBarberProfile.name}</h2>
                      <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-amber-500 border border-amber-500/20">
                        <Star className="h-4 w-4 fill-amber-500" />
                        <span className="text-sm font-black">{viewingBarberProfile.rating}</span>
                      </div>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-8">{viewingBarberProfile.specialty}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div className="rounded-3xl border border-white/5 bg-white/5 p-6 hover:bg-white/[0.07] transition cursor-default">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2 flex items-center gap-2">
                          <Phone className="h-3 w-3" /> WhatsApp
                        </p>
                        <p className="font-bold text-white text-lg">{viewingBarberProfile.phone || 'No registrado'}</p>
                      </div>
                      <div className="rounded-3xl border border-white/5 bg-white/5 p-6 hover:bg-white/[0.07] transition cursor-default">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2 flex items-center gap-2">
                          <Mail className="h-3 w-3" /> Email
                        </p>
                        <p className="font-bold text-white text-sm truncate">{viewingBarberProfile.email}</p>
                      </div>
                    </div>

                    <div className="mb-10">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 mb-4">Curriculum / Bio</h3>
                      <div className="rounded-3xl border border-white/5 bg-black/40 p-6">
                        <p className="text-sm font-medium leading-relaxed text-zinc-400 italic">
                          "{viewingBarberProfile.bio || 'Este profesional aun no ha completado su biografia.'}"
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setViewingBarberProfile(null)}
                      className="w-full py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-amber-500 hover:text-black hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all active:scale-[0.98]"
                    >
                      Cerrar Perfil
                    </button>
                  </div>
                </div>
              </div>
            )
          }

          {
            dismissingBarber && (
              <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in duration-300">
                <div className="w-full max-w-md overflow-hidden rounded-[40px] border border-white/10 bg-[#0a0a0a] shadow-2xl animate-in zoom-in-95 duration-300">
                  <div className="p-10 text-center">
                    <div className="mx-auto mb-6 h-20 w-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                      <UserX className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Despedir a {dismissingBarber.name}</h2>
                    <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
                      Estas seguro de que deseas retirar a este barbero de tu equipo? Esta accion le quitara el acceso a tu salon.
                    </p>

                    <div className="bg-zinc-900/50 rounded-3xl p-6 border border-white/5 mb-8">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-4">Clasificacion Personal</p>
                      <div className="flex justify-center gap-2 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setDismissRating(star)}
                            className="transition-transform active:scale-90"
                          >
                            <Star
                              className={`h-8 w-8 transition-all ${star <= dismissRating ? 'fill-amber-500 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'text-zinc-700'}`}
                            />
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={dismissComment}
                        onChange={(e) => setDismissComment(e.target.value)}
                        placeholder="Escribe una nota interna sobre su desempeño (opcional)..."
                        className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-amber-500/50 transition h-24 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setDismissingBarber(null)}
                        className="py-4 rounded-2xl bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleDismissBarberWithRating}
                        disabled={isSubmitting}
                        className="py-4 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition shadow-lg shadow-red-600/20 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Procesando...' : 'Confirmar Despido'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          {/* Manual Appointment Modal (Global) */}
          {
            showManualApt && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                        <Plus className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white italic uppercase tracking-tighter">Registrar Venta / Cita</h3>
                        <p className="text-xs text-zinc-500 font-medium">Registro manual directo en la plataforma</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowManualApt(false)}
                      className="p-2 hover:bg-white/5 rounded-full transition text-zinc-500 hover:text-white"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <form onSubmit={handleManualBooking} className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">1. Elegir Barbero</label>
                      <select
                        required
                        value={manualAptForm.barberId}
                        onChange={e => setManualAptForm({ ...manualAptForm, barberId: e.target.value })}
                        className="w-full rounded-2xl bg-zinc-800 border border-white/5 px-4 py-3 text-sm text-white focus:border-emerald-500/50 outline-none transition-all font-bold appearance-none cursor-pointer"
                      >
                        <option value="">Seleccionar Barbero...</option>
                        {approvedBarbers.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">2. Nombre del Cliente</label>
                      <input
                        required
                        value={manualAptForm.clientName}
                        onChange={e => setManualAptForm({ ...manualAptForm, clientName: e.target.value })}
                        className="w-full rounded-2xl bg-zinc-800 border border-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 outline-none transition-all font-bold"
                        placeholder="Nombre completo"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">3. Telefono (Opcional)</label>
                      <input
                        type="tel"
                        value={manualAptForm.clientPhone}
                        onChange={e => setManualAptForm({ ...manualAptForm, clientPhone: e.target.value })}
                        className="w-full rounded-2xl bg-zinc-800 border border-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 outline-none transition-all font-bold"
                        placeholder="Numero de contacto"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">4. Servicio Realizado</label>
                      <input
                        required
                        value={manualAptForm.service}
                        onChange={e => setManualAptForm({ ...manualAptForm, service: e.target.value })}
                        className="w-full rounded-2xl bg-zinc-800 border border-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 outline-none transition-all font-bold"
                        placeholder="Ej. Corte Degradado"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">5. Precio ($)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold italic">$</span>
                        <input
                          required
                          type="number"
                          value={manualAptForm.price || ''}
                          onChange={e => setManualAptForm({ ...manualAptForm, price: parseFloat(e.target.value) || 0 })}
                          className="w-full rounded-2xl bg-zinc-800 border border-white/5 pl-8 pr-4 py-3 text-sm text-white focus:border-emerald-500/50 outline-none transition-all font-bold"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">6. Fecha</label>
                      <input
                        required
                        type="date"
                        value={manualAptForm.date}
                        onChange={e => setManualAptForm({ ...manualAptForm, date: e.target.value })}
                        className="w-full rounded-2xl bg-zinc-800 border border-white/5 px-4 py-3 text-sm text-white focus:border-emerald-500/50 outline-none transition-all font-bold [color-scheme:dark]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">7. Hora</label>
                      <input
                        required
                        type="time"
                        value={manualAptForm.time}
                        onChange={e => setManualAptForm({ ...manualAptForm, time: e.target.value })}
                        className="w-full rounded-2xl bg-zinc-800 border border-white/5 px-4 py-3 text-sm text-white focus:border-emerald-500/50 outline-none transition-all font-bold [color-scheme:dark]"
                      />
                    </div>

                    <div className="col-span-full pt-6 border-t border-white/5 mt-2">
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setShowManualApt(false)}
                          className="flex-1 px-6 py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold rounded-2xl transition-all active:scale-95 text-xs uppercase tracking-widest"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-[2] px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/20 active:scale-95 transition-all text-sm uppercase tracking-tighter italic"
                        >
                          {isSubmitting ? 'Registrando...' : 'Confirmar Registro de Venta'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )
          }

          {/* Product Modal */}
          {showProductModal && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="w-full max-w-xl bg-zinc-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Package className="h-5 w-5 text-emerald-500" />
                    {editingProduct ? 'Editar Producto' : 'Añadir Producto'}
                  </h3>
                  <button onClick={() => setShowProductModal(false)} className="text-zinc-500 hover:text-white"><X className="h-6 w-6" /></button>
                </div>
                <form onSubmit={handleProductSubmit} className="p-8 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Nombre</label>
                      <input
                        required
                        type="text"
                        value={productForm.name}
                        onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full bg-zinc-800 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Descripción</label>
                      <textarea
                        value={productForm.description}
                        onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                        className="w-full bg-zinc-800 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-emerald-500 outline-none h-20 resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Precio Venta</label>
                      <input
                        required
                        type="number"
                        value={productForm.price}
                        onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
                        className="w-full bg-zinc-800 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Costo Unidad</label>
                      <input
                        required
                        type="number"
                        value={productForm.cost}
                        onChange={e => setProductForm({ ...productForm, cost: Number(e.target.value) })}
                        className="w-full bg-zinc-800 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Stock Inicial</label>
                      <input
                        required
                        type="number"
                        value={productForm.stock}
                        onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                        className="w-full bg-zinc-800 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Stock Mínimo</label>
                      <input
                        required
                        type="number"
                        value={productForm.minStock}
                        onChange={e => setProductForm({ ...productForm, minStock: Number(e.target.value) })}
                        className="w-full bg-zinc-800 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">URL Imagen (Opcional)</label>
                      <input
                        type="text"
                        value={productForm.imageUrl}
                        onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        className="w-full bg-zinc-800 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-emerald-600/20"
                    >
                      {isSubmitting ? 'Guardando...' : editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Sell Modal (POS) */}
          {showSellModal && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-emerald-500" />
                    Registrar Venta Directa
                  </h3>
                  <button onClick={() => setShowSellModal(false)} className="text-zinc-500 hover:text-white"><X className="h-6 w-6" /></button>
                </div>
                <form onSubmit={handleSellSubmit} className="p-8 space-y-6">
                  <div className="bg-zinc-800/50 p-6 rounded-3xl border border-white/5">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Producto Seleccionado</p>
                    <p className="font-bold text-lg">{products.find(p => p.id === sellForm.productId)?.name}</p>
                    <p className="text-emerald-500 font-bold">${products.find(p => p.id === sellForm.productId)?.price} / unidad</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Cantidad a Vender</label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setSellForm({ ...sellForm, quantity: Math.max(1, sellForm.quantity - 1) })}
                        className="h-12 w-12 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center text-xl font-bold hover:bg-zinc-700 transition"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={sellForm.quantity}
                        readOnly
                        className="flex-1 bg-transparent border-none text-center text-2xl font-black outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setSellForm({ ...sellForm, quantity: sellForm.quantity + 1 })}
                        className="h-12 w-12 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center text-xl font-bold hover:bg-zinc-700 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Vendedor (Opcional)</label>
                    <select
                      value={sellForm.sellerId}
                      onChange={e => setSellForm({ ...sellForm, sellerId: e.target.value })}
                      className="w-full bg-zinc-800 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-emerald-500 outline-none"
                    >
                      <option value={currentUser.id}>Yo ({currentUser.name})</option>
                      {approvedBarbers.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-sm text-zinc-500 font-bold">Total a Cobrar:</p>
                      <p className="text-3xl font-black text-white">${(products.find(p => p.id === sellForm.productId)?.price || 0) * sellForm.quantity}</p>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-emerald-600/20"
                    >
                      Confirmar Venta
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ══════════════════ CARTERA DE CLIENTES ══════════════════ */}
          {tab === 'clients' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight">Cartera de Clientes</h1>
                <p className="text-zinc-500 text-sm mt-1">Todos los clientes que han agendado en <strong className="text-white">{myShop.name}</strong></p>
              </div>

              {/* Resumen rápido */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Clientes Únicos', value: shopClients.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                  { label: 'Nuevos este mes', value: shopClients.filter(c => c.firstVisit?.startsWith(thisMonth)).length, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                  { label: 'VIP (5+ visitas)', value: shopClients.filter(c => c.visits >= 5).length, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                  { label: 'Gasto Promedio', value: `$${shopClients.length ? Math.round(shopClients.reduce((a, c) => a + c.totalSpent, 0) / shopClients.length) : 0}`, icon: DollarSign, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                ].map(stat => (
                  <div key={stat.label} className={`rounded-2xl border ${stat.bg} p-4 flex items-center gap-4`}>
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-white/5`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Búsqueda y filtros */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    value={clientSearch}
                    onChange={e => setClientSearch(e.target.value)}
                    placeholder="Buscar por nombre o teléfono…"
                    className="w-full bg-zinc-900/60 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm focus:border-emerald-500/50 outline-none placeholder:text-zinc-600"
                  />
                </div>
                <div className="flex gap-2">
                  {(['all', 'new', 'recurring', 'vip'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setClientFilter(f)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition ${clientFilter === f ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-900/60 text-zinc-500 border border-white/5 hover:text-white'
                        }`}
                    >
                      {f === 'all' ? 'Todos' : f === 'new' ? 'Nuevos' : f === 'recurring' ? 'Recurrentes' : '⭐ VIP'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabla de clientes */}
              {filteredClients.length === 0 ? (
                <div className="text-center py-20 text-zinc-600">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="font-black uppercase italic">Sin clientes aún</p>
                  <p className="text-sm mt-1">Los clientes aparecerán aquí cuando agenden su primera cita</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredClients.map(client => {
                    const noteKey = `${myShop.id}_${client.id}`;
                    const hasNote = !!clientNotes[noteKey];
                    return (
                      <div
                        key={client.id}
                        className="flex items-center gap-4 rounded-2xl border border-white/5 bg-zinc-900/40 px-5 py-4 hover:border-white/10 transition-all group cursor-pointer"
                        onClick={() => setSelectedClient(client)}
                      >
                        {/* Avatar */}
                        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-black text-white shrink-0">
                          {client.name[0]?.toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm truncate">{client.name}</p>
                            {client.visits >= 5 && <span className="text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5 uppercase">VIP</span>}
                            {hasNote && <StickyNote className="h-3 w-3 text-yellow-500/60" />}
                          </div>
                          <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3" /> {client.phone || 'Sin teléfono'}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="hidden sm:flex items-center gap-8 text-center shrink-0">
                          <div>
                            <p className="text-sm font-black text-white">{client.visits}</p>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Visitas</p>
                          </div>
                          <div>
                            <p className="text-sm font-black text-emerald-400">${client.totalSpent}</p>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Gastado</p>
                          </div>
                          <div>
                            <p className="text-sm font-black text-white">{client.lastVisit}</p>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Última visita</p>
                          </div>
                        </div>

                        <ChevronRight className="h-4 w-4 text-zinc-700 group-hover:text-zinc-400 transition shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══ MODAL DETALLE DE CLIENTE ══ */}
          {selectedClient && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedClient(null)}>
              <div className="w-full max-w-lg bg-[#09090b] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/5 p-6 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-black text-white">
                    {selectedClient.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-lg">{selectedClient.name}</h3>
                    <p className="text-sm text-zinc-400 flex items-center gap-1"><Phone className="h-3 w-3" />{selectedClient.phone || 'Sin teléfono'}</p>
                  </div>
                  <button onClick={() => setSelectedClient(null)} className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Visitas', value: selectedClient.visits, color: 'text-blue-400' },
                      { label: 'Gastado', value: `$${selectedClient.totalSpent}`, color: 'text-emerald-400' },
                      { label: 'Últ. visita', value: selectedClient.lastVisit, color: 'text-zinc-300' },
                    ].map(s => (
                      <div key={s.label} className="text-center bg-zinc-900 rounded-xl p-3 border border-white/5">
                        <p className={`font-black text-sm ${s.color}`}>{s.value}</p>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Notas */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-yellow-500/80 flex items-center gap-1.5 mb-2">
                      <StickyNote className="h-3 w-3" /> Nota del cliente
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ej: Prefiere corte fade, alergia a X producto…"
                      value={clientNotes[`${myShop.id}_${selectedClient.id}`] || ''}
                      onChange={e => saveClientNote(selectedClient.id, e.target.value)}
                      className="w-full bg-zinc-900 border border-yellow-500/20 rounded-xl px-4 py-3 text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-yellow-500/50 outline-none resize-none"
                    />
                  </div>

                  {/* Historial de citas */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-1.5"><History className="h-3.5 w-3.5" /> Historial de citas</p>
                    <div className="space-y-2">
                      {appointments
                        .filter(a => a.clientId === selectedClient.id && a.barbershopId === myShop.id)
                        .sort((a, b) => b.date.localeCompare(a.date))
                        .map(apt => (
                          <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-white/5">
                            <div className="text-center shrink-0 w-12">
                              <p className="text-xs font-black text-white">{apt.date.slice(5)}</p>
                              <p className="text-[10px] text-zinc-600">{apt.time}</p>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate">{apt.service}</p>
                              <p className="text-[10px] text-zinc-500">con {apt.barberName}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-black text-emerald-400">${apt.price || 0}</p>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${apt.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : apt.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : apt.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-700/50 text-zinc-400'}`}>
                                {apt.status === 'completed' ? 'Completada' : apt.status === 'cancelled' ? 'Cancelada' : apt.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════ PERFIL ══════════════════ */}
          {tab === 'profile' && (
            <div className="space-y-6 max-w-7xl mx-auto pb-10">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-tight">Tu Perfil</h1>
                  <p className="text-zinc-500 text-sm">Gestiona tu cuenta, preferencias y seguridad</p>
                </div>
              </div>

              {/* 1. Información Personal Básica */}
              <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 sm:p-8">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-400" />
                  Información Personal Básica
                </h2>
                <div className="flex flex-col sm:flex-row gap-8">
                  <div className="flex flex-col items-center gap-3 shrink-0">
                    <div className="relative group">
                      <div className="h-32 w-32 rounded-[2rem] bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500/30 flex items-center justify-center text-4xl font-black text-emerald-500 overflow-hidden shadow-2xl">
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
                          className="w-full bg-zinc-800 border border-white/5 rounded-2xl px-5 py-4 text-base focus:border-emerald-500 outline-none"
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
                          className="w-full bg-zinc-800 border border-white/5 rounded-2xl px-5 py-4 text-base focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-zinc-500 tracking-widest">Fecha de Nacimiento</label>
                        <input
                          type="date"
                          value={profileForm.birthday}
                          onChange={e => setProfileForm({ ...profileForm, birthday: e.target.value })}
                          className="w-full bg-zinc-800 border border-white/5 rounded-2xl px-5 py-4 text-base focus:border-emerald-500 outline-none text-zinc-300"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-xs font-black uppercase text-zinc-500 tracking-widest">Biografía / Sobre Mí</label>
                        <textarea
                          value={profileForm.bio}
                          onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                          placeholder="Háblanos sobre ti o tu visión del negocio..."
                          className="w-full bg-zinc-800 border border-white/5 rounded-2xl px-5 py-4 text-base focus:border-emerald-500 outline-none h-32 resize-none"
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
                        className="flex-1 w-full px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm sm:text-base tracking-wide transition-all shadow-lg shadow-emerald-600/20 border border-emerald-500/50"
                      >
                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                {/* 3. Visibilidad y Plan */}
                <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 sm:p-8 space-y-8">
                  <div>
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      Visibilidad y Plan
                    </h2>

                    {/* Plan Badge Header */}
                    <div className="bg-zinc-800 p-5 rounded-2xl border border-white/5 flex flex-col items-center sm:flex-row sm:items-center justify-between gap-6 mb-6">
                      <div className="text-center sm:text-left">
                        <p className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-1">Plan actual</p>
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <p className={`font-black uppercase text-2xl ${myShop.plan === 'premium' ? 'text-amber-400' : myShop.plan === 'pro' ? 'text-blue-400' : 'text-zinc-300'}`}>
                            {myShop.plan || 'Básico'}
                          </p>
                          {myShop.plan === 'premium' && <Sparkles className="h-5 w-5 text-amber-500" />}
                        </div>
                      </div>
                      <button onClick={() => setShowUpgradeModal(true)} className={`w-full sm:w-auto px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition shadow-lg ${myShop.plan === 'premium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 shadow-amber-500/10' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 shadow-emerald-500/10'}`}>
                        Mejorar Plan
                      </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-zinc-800/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <Calendar className="h-4 w-4 text-zinc-400 mb-2" />
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Expiración</p>
                        <p className="font-bold text-white text-xs">22/03/2026</p>
                        <p className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full mt-1">25d</p>
                      </div>
                      <div className="bg-zinc-800/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <Store className="h-4 w-4 text-blue-400 mb-2" />
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Visibilidad</p>
                        <p className="font-bold text-blue-400 text-sm">Público</p>
                      </div>
                      <div className="bg-zinc-800/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <Star className="h-4 w-4 text-emerald-400 mb-2" />
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Rating</p>
                        <p className="font-black text-white text-lg">0</p>
                      </div>
                      <div className="bg-zinc-800/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <MessageSquare className="h-4 w-4 text-purple-400 mb-2" />
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Reseñas</p>
                        <p className="font-black text-white text-lg">0</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Settings className="h-5 w-5 text-purple-500" />
                      Preferencias
                    </h2>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-zinc-800 p-3 rounded-xl border border-white/5">
                        <span className="text-sm font-bold">Modo Oscuro</span>
                        <div className="w-10 h-5 bg-emerald-500 rounded-full relative"><div className="absolute right-1 top-[2px] h-4 w-4 bg-black rounded-full shadow-sm" /></div>
                      </div>
                      <div className="flex items-center justify-between bg-zinc-800 p-3 rounded-xl border border-white/5">
                        <span className="text-sm font-bold">Idioma</span>
                        <select className="bg-transparent text-sm text-emerald-400 font-bold outline-none cursor-pointer">
                          <option>Español (MX)</option>
                          <option>English (US)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 5. Notificaciones (Movido aquí para compartir la fila con Visibilidad y Plan) */}
                <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 sm:p-8">
                  <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-teal-400" />
                    Preferencias de Notificaciones
                  </h2>
                  <div className="flex flex-col gap-4">
                    {[
                      { label: 'Recordatorios de citas', desc: 'Avisos antes de cada servicio' },
                      { label: 'Avisos de cancelaciones', desc: 'Cuando un cliente cancela' },
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
                    <div className="border-t border-white/5 pt-4 mt-2">
                      <p className="text-xs text-zinc-500">Sonido de notificaciones</p>
                      <select className="w-full mt-2 bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none">
                        <option>Predeterminado (Campana)</option>
                        <option>Suave (Bloop)</option>
                        <option>Clásico (Timbre)</option>
                        <option>Silencioso</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones de Peligro / Extra */}
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
      </div >

      {/* Interstitial Ad */}
      {showInterstitial && (
        <InterstitialAd
          isOpen={showInterstitial}
          onClose={() => setShowInterstitial(false)}
        />
      )}
    </div >
  );
}