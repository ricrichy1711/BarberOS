import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { User, Barbershop, Barber, Appointment, Message, UserRole, Expense, Chair, IntegrationRequest, Product, ProductSale, Review, Campaign } from '@/types';
import { supabase } from '@/lib/supabase';

interface DataContextType {
  // Auth
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  loading: boolean;
  users: User[];

  // Barbershops
  barbershops: Barbershop[];
  getBarbershop: (id: string) => Barbershop | undefined;
  addBarbershop: (data: Omit<Barbershop, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => Promise<void>;
  updateBarbershop: (id: string, data: Partial<Barbershop>) => Promise<void>;

  // Barbers
  barbers: Barber[];
  getBarber: (id: string) => Barber | undefined;
  getBarbersByShop: (shopId: string) => Barber[];
  addBarber: (data: Omit<Barber, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => Promise<void>;
  updateBarber: (id: string, data: Partial<Barber>) => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; birthday?: string; bio?: string }) => Promise<void>;
  approveBarber: (id: string) => Promise<void>;
  rejectBarber: (id: string) => Promise<void>;
  dismissBarber: (id: string) => Promise<void>;
  assignBarberToChair: (barberId: string | null, chairId: string) => Promise<void>;
  becomeIndependent: (barberId: string) => Promise<void>;

  // Citas
  appointments: Appointment[];
  getClientAppointments: (clientId: string) => Appointment[];
  getBarberAppointments: (barberId: string) => Appointment[];
  getShopAppointments: (shopId: string) => Appointment[];
  addAppointment: (data: Omit<Appointment, 'id' | 'createdAt'>) => Promise<void>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;

  // Messages
  messages: Message[];
  getUserMessages: (userId: string) => Message[];
  sendMessage: (data: Omit<Message, 'id' | 'createdAt' | 'read'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;

  // Expenses
  expenses: Expense[];
  addExpense: (data: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  getShopExpenses: (shopId: string) => Expense[];

  // Chairs
  chairs: Chair[];
  addChair: (shopId: string, name: string) => Promise<void>;
  removeChair: (id: string) => Promise<void>;
  getShopChairs: (shopId: string) => Chair[];

  // Join Requests
  joinRequests: IntegrationRequest[];
  joinBarbershop: (barberId: string, shopId: string) => Promise<void>;
  handleJoinRequest: (requestId: string, approve: boolean) => Promise<void>;
  getShopJoinRequests: (shopId: string) => IntegrationRequest[];

  // Inventory
  products: Product[];
  productSales: ProductSale[];
  addProduct: (data: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  sellProduct: (data: Omit<ProductSale, 'id' | 'createdAt'>) => Promise<void>;

  // Reviews
  reviews: Review[];
  addReview: (data: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;

  // Campaigns
  campaigns: Campaign[];
  addCampaign: (data: Omit<Campaign, 'id' | 'createdAt'>) => Promise<void>;
  updateCampaign: (id: string, data: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  isInitialSyncing: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  barbershopId?: string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Verificación de Vercel/Netlify temprana para disparar el ErrorBoundary si no hay ENV
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    throw new Error("Faltan las variables de entorno de Supabase en Producción (Vercel). Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para poder usar la app.");
  }

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('barberia_user_cache');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [isInitialSyncing, setIsInitialSyncing] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);
  const [users, setUsers] = useState<User[]>([]);
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [joinRequests, setJoinRequests] = useState<IntegrationRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSales, setProductSales] = useState<ProductSale[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Cargador de datos robusto con trazabilidad por tabla
  const fetchData = useCallback(async (userId?: string) => {
    const startTime = Date.now();
    const uid = userId || currentUser?.id;
    console.log('🏁 [v1.1-granular] Starting data synchronization for', uid || 'guest');

    const fetchWithLog = async (name: string, query: any) => {
      const tStart = Date.now();
      try {
        const res = await query;
        console.log(`📡 [Sync] Table '${name}': ${res.data?.length || 0} rows (${Date.now() - tStart}ms)`);
        if (res.error) {
          console.warn(`⚠️ Error in table '${name}':`, res.error.message);
          return [];
        }
        return res.data || [];
      } catch (e: any) {
        console.error(`🔥 Fatal error fetching '${name}':`, e.message);
        return [];
      }
    };

    try {
      // Ejecutar en paralelo pero con trazabilidad individual
      const [
        shops, brbs, apts, usersData, msgsData, expsData,
        chrsData, prodsData, salesData, revsData, jreqsData, campsData
      ] = await Promise.all([
        fetchWithLog('barbershops', supabase.from('barbershops').select('*')),
        fetchWithLog('barbers', supabase.from('barbers').select('*')),
        fetchWithLog('appointments', supabase.from('appointments').select('*')),
        fetchWithLog('users', supabase.from('users').select('*')),
        fetchWithLog('messages', supabase.from('messages').select('*')),
        fetchWithLog('expenses', supabase.from('expenses').select('*')),
        fetchWithLog('chairs', supabase.from('chairs').select('*')),
        fetchWithLog('products', supabase.from('products').select('*')),
        fetchWithLog('product_sales', supabase.from('product_sales').select('*')),
        fetchWithLog('reviews', supabase.from('reviews').select('*')),
        fetchWithLog('join_requests', supabase.from('join_requests').select('*')),
        fetchWithLog('campaigns', supabase.from('campaigns').select('*').order('created_at', { ascending: false }))
      ]);

      // Sincronización atómica de estados
      setUsers(usersData.map((u: any) => ({
        id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, avatar: u.avatar, createdAt: u.created_at, barbershopId: u.barbershop_id
      })));

      setBarbershops(shops.map((s: any) => ({
        id: s.id, name: s.name, description: s.description, address: s.address, phone: s.phone, email: s.email, image: s.image,
        ownerId: s.owner_id, ownerName: s.owner_name, isPublic: s.is_public, plan: s.plan, rating: s.rating, reviewCount: s.review_count,
        createdAt: s.created_at, chairs: s.chairs, services: s.services, businessHours: s.business_hours, closedDates: s.closed_dates,
        planExpiresAt: s.plan_expires_at, featuredReviewId: s.featured_review_id
      })));

      setBarbers(brbs.map((b: any) => ({
        id: b.id, userId: b.user_id, name: b.name, email: b.email, phone: b.phone, avatar: b.avatar,
        barbershopId: b.barbershop_id, barbershopName: b.barbershop_name, specialty: b.specialty, bio: b.bio,
        isPublic: b.is_public, isApproved: b.is_approved, rating: b.rating, reviewCount: b.review_count,
        createdAt: b.created_at, chairId: b.chair_id, isIndependent: b.is_independent, offDays: b.off_days, lunchBreak: b.lunch_break
      })));

      setAppointments(apts.map((a: any) => ({
        id: a.id, clientId: a.client_id, clientName: a.client_name, clientPhone: a.client_phone, barberId: a.barber_id, barberName: a.barber_name,
        barbershopId: a.barbershop_id, barbershopName: a.barbershop_name, service: a.service, date: a.date, time: a.time, status: a.status,
        price: a.price, createdAt: a.created_at
      })));

      setMessages(msgsData.map((m: any) => ({
        id: m.id, senderId: m.sender_id, senderName: m.sender_name, senderRole: m.sender_role, receiverId: m.receiver_id, receiverName: m.receiver_name, receiverRole: m.receiver_role,
        barbershopId: m.barbershop_id, content: m.content, read: m.read, createdAt: m.created_at
      })));

      setExpenses(expsData.map((e: any) => ({ id: e.id, barbershopId: e.barbershop_id, description: e.description, amount: e.amount, category: e.category, date: e.date, createdAt: e.created_at })));
      setChairs(chrsData.map((c: any) => ({ id: c.id, barbershopId: c.barbershop_id, name: c.name, barberId: c.barber_id, createdAt: c.created_at })));
      setProducts(prodsData.map((p: any) => ({ id: p.id, barbershopId: p.barbershop_id, name: p.name, description: p.description, price: p.price, cost: p.cost, stock: p.stock, minStock: p.min_stock, category: p.category, imageUrl: p.image_url, createdAt: p.created_at })));
      setProductSales(salesData.map((s: any) => ({ id: s.id, barbershopId: s.barbershop_id, productId: s.product_id, productName: s.product_name, quantity: s.quantity, unitPrice: s.unit_price, totalPrice: s.total_price, sellerId: s.seller_id, createdAt: s.created_at })));

      setReviews(revsData.map((r: any) => ({
        id: r.id, appointmentId: r.appointment_id, userId: r.client_id,
        userName: usersData.find((u: any) => u.id === r.client_id)?.name || 'Cliente',
        userAvatar: usersData.find((u: any) => u.id === r.client_id)?.avatar || '',
        barberId: r.barber_id, barbershopId: r.barbershop_id, rating: r.rating, comment: r.comment, createdAt: r.created_at
      })));

      setJoinRequests(jreqsData.map((j: any) => ({
        id: j.id, barberId: j.barber_id, barberName: j.barber_name, barbershopId: j.barbershop_id, status: j.status, createdAt: j.created_at
      })));

      setCampaigns(campsData.map((c: any) => ({
        id: c.id, title: c.title, message: c.message, emoji: c.emoji, color: c.color,
        style: c.style || 'banner', priority: c.priority || 1,
        target: c.target, isActive: c.is_active, expiresAt: c.expires_at, createdAt: c.created_at,
        imageUrl: c.image_url, linkUrl: c.link_url, linkText: c.link_text, advertiser: c.advertiser,
        scheduledAt: c.scheduled_at
      })));

      setIsInitialSyncing(false);
      console.log(`✨ Full synchronization complete in ${Date.now() - startTime}ms`);
      return true;
    } catch (error) {
      console.error('❌ Critical sync error:', error);
      return false;
    }
  }, [currentUser?.id]);

  const fetchDataWithTimeout = useCallback(async (ms = 15000) => {
    return Promise.race([
      fetchData(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout fetching data')), ms))
    ]).catch(err => {
      console.warn('⚠️ fetchData failed:', err);
      setLoading(false);
    });
  }, [fetchData]);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data && mountedRef.current) {
        setCurrentUser({
          ...data,
          barbershopId: data.barbershop_id,
          createdAt: data.created_at
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (mountedRef.current) setCurrentUser(null);
    }
  }, []);

  const initLock = useRef(false);
  const userRef = useRef<User | null>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    userRef.current = currentUser;
    if (currentUser) {
      localStorage.setItem('barberia_user_cache', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    let mounted = true;

    const performFullInit = async (session: any, reason: string, silent = false) => {
      if (!mounted) return;

      // Si ya estamos inicializando con el mismo usuario, ignorar para evitar duplicados
      if (initLock.current && userRef.current?.id === session?.user?.id && session?.user?.id) {
        console.log(`ℹ️ Skipping duplicate init for ${reason}`);
        return;
      }

      console.log(`🚀 [Init: ${reason}] Starting sequence (Silent: ${silent})...`);
      initLock.current = true;
      if (!silent) setLoading(true);

      try {
        if (session?.user) {
          const shouldFetchProfile = !userRef.current || userRef.current.id !== session.user.id || !silent;

          if (shouldFetchProfile) {
            console.log('👤 Fetching profile and all data...');
            await Promise.all([
              fetchUserProfile(session.user.id),
              fetchData(session.user.id)
            ]);
          }
        } else {
          setCurrentUser(null);
        }

        // Cuando habilitamos la UI, TODO está cargado
        if (mounted) setLoading(false);

      } catch (error) {
        console.error('❌ Init error:', error);
        if (mounted) setLoading(false);
      } finally {
        initLock.current = false;
        if (mounted) {
          isFirstLoad.current = false;
          console.log(`✅ [${reason}] Initialization complete (UI Unblocked)`);
        }
      }
    };

    // Escuchador Principal de Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔔 Auth Event [${event}]`, session?.user?.email || 'No user');

      switch (event) {
        case 'INITIAL_SESSION':
          if (!session) {
            // Si no hay sesión inicial, no bloqueamos. Simplemente marcamos carga lista y traemos datos públicos.
            setLoading(false);
            initLock.current = false;
            setCurrentUser(null);
            fetchData();
            isFirstLoad.current = false;
          } else {
            await performFullInit(session, 'INITIAL_SESSION', false);
          }
          break;

        case 'SIGNED_IN':
          // Si ya tenemos el mismo usuario y es de refresco silencioso (foco), no mostrar spinner
          const isSilent = userRef.current?.id === session?.user?.id;
          await performFullInit(session, 'SIGNED_IN', isSilent);
          break;

        case 'SIGNED_OUT':
          console.log('🚪 SIGNED_OUT event - Hard reset');
          setCurrentUser(null);
          setLoading(false);
          initLock.current = false;
          // Recargar datos públicos después de un delay para evitar conflictos
          setTimeout(() => {
            if (mounted && !initLock.current) {
              fetchData().catch(e => console.warn('Failed to fetch public data after signout:', e));
            }
          }, 500);
          break;

        case 'TOKEN_REFRESHED':
        case 'USER_UPDATED':
          if (session?.user && mounted) {
            await fetchUserProfile(session.user.id);
          }
          break;

        default:
          if (mounted && isFirstLoad.current && !initLock.current) {
            setLoading(false);
            isFirstLoad.current = false;
          }
          break;
      }
    });

    // Timeout de seguridad más robusto para evitar que la app quede en blanco
    const timer = setTimeout(() => {
      if (mounted && (initLock.current || loading)) {
        console.warn('⚠️ Safety timeout logic: Breaking stuck initialization or loading');
        setLoading(false);
        initLock.current = false;
        isFirstLoad.current = false;
      }
    }, 5000); // Reducido a 5s para evitar pantallas negras largas

    return () => {
      mounted = false;
      initLock.current = false;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, fetchData]);

  const login = useCallback(async (email: string, password: string) => {
    return new Promise<boolean>(async (resolve, reject) => {
      console.log('🧪 [Diagnostic] Iniciando validación de túnel de datos...');

      const safetyTimeout = setTimeout(() => {
        reject(new Error('🔐 BLOQUEO PERSISTENTE: Tu navegador está cortando la comunicación de forma silenciosa. Por favor, desactiva temporalmente extensiones como "uBlock", "AdBlock" o "Kaspersky/Avast Protection" y refresca la página (Ctrl+F5).'));
      }, 20000);

      try {
        // Test con AbortController para no esperar 30s si hay bloqueo silencioso
        const controller = new AbortController();
        const fetchTimeout = setTimeout(() => controller.abort(), 5000);

        console.log('📡 [Diagnostic] Verificando ruta:', import.meta.env.VITE_SUPABASE_URL);

        try {
          const testFetch = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/health`, {
            signal: controller.signal
          });
          clearTimeout(fetchTimeout);
          console.log('✅ [Diagnostic] Servidor respondiendo. Estado:', testFetch.status);
        } catch (e: any) {
          clearTimeout(fetchTimeout);
          console.error('🚫 [Diagnostic] Error de conexión directa:', e.name === 'AbortError' ? 'Timeout' : e.message);
          clearTimeout(safetyTimeout);
          reject(new Error('🌐 ERROR DE CONEXIÓN: Tu sistema (Windows/Navegador) impide la salida de datos hacia el servidor. Prueba: 1. Modo Incógnito, 2. Desactivar Antivirus, 3. Revisar si tienes una VPN activa.'));
          return;
        }

        console.log('🔑 [Auth] Intentando apretón de manos con Supabase...');
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });

        clearTimeout(safetyTimeout);
        if (error) throw error;
        resolve(true);
      } catch (error: any) {
        clearTimeout(safetyTimeout);
        console.error('🔥 [Auth Error]:', error.message);
        reject(error);
      }
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('🔄 Performing EMERGENCY deep logout...');

      // 1. Resetear estados locales inmediatamente
      initLock.current = false;
      setLoading(true); // Mostrar spinner mientras limpiamos
      setCurrentUser(null);

      // 2. Limpieza total de almacenamiento
      try {
        localStorage.removeItem('barberia_user_cache');
        localStorage.clear();
        sessionStorage.clear();
        console.log('🧹 Storage cleared');
      } catch (e) {
        console.warn('Storage clear failed', e);
      }

      // 3. Intento de SignOut con timeout ultra-rápido
      await Promise.race([
        supabase.auth.signOut(),
        new Promise(r => setTimeout(r, 1000))
      ]).catch(() => { });

      console.log('🚀 Forcing page reload to clean memory');
      window.location.href = '/auth?mode=login';
      setTimeout(() => window.location.reload(), 100);
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/auth?mode=login';
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: data.name,
            role: data.role,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          barbershop_id: data.barbershopId,
        });

        if (profileError) throw profileError;
      }

      return true;
    } catch (error: any) {
      console.error('Registration error:', error.message);
      throw error;
    }
  }, []);


  const getBarbershop = useCallback((id: string) => barbershops.find(b => b.id === id), [barbershops]);

  const addBarbershop = useCallback(async (data: Omit<Barbershop, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => {
    console.log('🏭 DataContext: addBarbershop called explicitly', data);
    const { error } = await supabase.from('barbershops').insert({
      name: data.name,
      description: data.description,
      address: data.address,
      phone: data.phone,
      email: data.email,
      owner_id: currentUser?.id,
      owner_name: currentUser?.name,
      plan: data.plan,
      is_public: data.isPublic
    });
    if (error) throw error;
    await fetchDataWithTimeout(5000);
  }, [currentUser, fetchDataWithTimeout]);

  const updateBarbershop = useCallback(async (id: string, data: Partial<Barbershop>) => {
    const updatePayload: any = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.address !== undefined) updatePayload.address = data.address;
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.isPublic !== undefined) updatePayload.is_public = data.isPublic;
    if (data.plan !== undefined) updatePayload.plan = data.plan;
    if (data.services !== undefined) updatePayload.services = data.services;
    if (data.businessHours !== undefined) updatePayload.business_hours = data.businessHours;
    if (data.closedDates !== undefined) updatePayload.closed_dates = data.closedDates;
    if (data.featuredReviewId !== undefined) updatePayload.featured_review_id = data.featuredReviewId;

    const { error } = await supabase.from('barbershops')
      .update(updatePayload)
      .eq('id', id);

    if (error) throw error;
    await fetchDataWithTimeout(5000);
  }, [fetchDataWithTimeout]);

  const getBarber = useCallback((id: string) => barbers.find(b => b.id === id), [barbers]);
  const getBarbersByShop = useCallback((shopId: string) => barbers.filter(b => b.barbershopId === shopId), [barbers]);

  const addBarber = useCallback(async (data: Omit<Barber, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => {
    // Verificar si ya existe un registro para este usuario
    const { data: existing } = await supabase
      .from('barbers')
      .select('id')
      .eq('user_id', data.userId)
      .maybeSingle();

    const payload = {
      user_id: data.userId,
      name: data.name,
      specialty: data.specialty,
      bio: data.bio,
      barbershop_id: data.barbershopId,
      barbershop_name: data.barbershopName,
      is_approved: data.isApproved,
      is_public: data.isPublic,
      is_independent: false // Al ser añadido por solicitud, no es independiente
    };

    if (existing) {
      const { error } = await supabase
        .from('barbers')
        .update(payload)
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('barbers')
        .insert(payload);
      if (error) throw error;
    }

    await fetchDataWithTimeout(5000);
  }, [fetchDataWithTimeout]);

  const updateBarber = useCallback(async (id: string, data: Partial<Barber>) => {
    try {
      const updateData: any = {
        name: data.name,
        phone: data.phone,
        specialty: data.specialty,
        bio: data.bio,
        avatar: data.avatar,
        is_public: data.isPublic,
        is_independent: data.isIndependent
      };

      if (data.offDays) updateData.off_days = data.offDays;
      if (data.lunchBreak) updateData.lunch_break = data.lunchBreak;

      const { error } = await supabase
        .from('barbers')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Si se actualiza el nombre del barbero, también actualizar el nombre del usuario si es el mismo
      const barber = barbers.find(b => b.id === id);
      if (barber && data.name) {
        await supabase.from('users').update({ name: data.name }).eq('id', barber.userId);
      }

      await fetchDataWithTimeout(8000);
      // Actualizar perfil local por si cambió el nombre
      if (barber && currentUser?.id === barber.userId) {
        await fetchUserProfile(barber.userId);
      }
    } catch (error) {
      console.error('Error updating barber:', error);
      throw error;
    }
  }, [fetchDataWithTimeout, fetchUserProfile, barbers, currentUser]);

  const updateProfile = useCallback(async (data: { name?: string; phone?: string; birthday?: string; bio?: string }) => {
    if (!currentUser) return;
    try {
      const { error } = await supabase.from('users').update({
        name: data.name,
        phone: data.phone,
        birthday: data.birthday,
        bio: data.bio
      }).eq('id', currentUser.id);

      if (error) throw error;

      // Actualizar estado local inmediatamente
      await fetchUserProfile(currentUser.id);
      await fetchDataWithTimeout(5000);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }, [currentUser, fetchUserProfile, fetchDataWithTimeout]);

  const approveBarber = useCallback(async (id: string) => {
    const { error } = await supabase.from('barbers').update({ is_approved: true }).eq('id', id);
    if (error) throw error;
    fetchData();
  }, [fetchData]);

  const rejectBarber = useCallback(async (id: string) => {
    const { error } = await supabase.from('barbers').delete().eq('id', id);
    if (error) throw error;
    fetchData();
  }, [fetchData]);

  const dismissBarber = useCallback(async (id: string) => {
    // 1. Unassign from chair if assigned
    const barber = barbers.find(b => b.id === id);
    if (!barber) return;

    if (barber.chairId) {
      await supabase.from('chairs').update({ barber_id: null }).eq('id', barber.chairId);
    }

    // 2. Remove barbershop affiliation
    const { error } = await supabase.from('barbers').update({
      barbershop_id: null,
      barbershop_name: null,
      is_approved: false
    }).eq('id', id);

    if (error) throw error;
    await fetchDataWithTimeout(5000);
  }, [barbers, fetchDataWithTimeout]);

  const assignBarberToChair = useCallback(async (barberId: string | null, chairId: string) => {
    // 1. Clear current barber from this chair if any
    const { data: chairData } = await supabase.from('chairs').select('barber_id').eq('id', chairId).single();
    if (chairData?.barber_id) {
      await supabase.from('barbers').update({ chair_id: null }).eq('id', chairData.barber_id);
    }

    // 2. Clear this chair from other barbers who might have it
    await supabase.from('barbers').update({ chair_id: null }).eq('chair_id', chairId);

    // 3. Assign new barber if provided
    if (barberId) {
      await supabase.from('barbers').update({ chair_id: chairId }).eq('id', barberId);
      await supabase.from('chairs').update({ barber_id: barberId }).eq('id', chairId);
    } else {
      await supabase.from('chairs').update({ barber_id: null }).eq('id', chairId);
    }

    fetchData();
  }, [fetchData]);

  const getClientAppointments = useCallback((clientId: string) =>
    appointments.filter(a => a.clientId === clientId), [appointments]);
  const getBarberAppointments = useCallback((barberId: string) =>
    appointments.filter(a => a.barberId === barberId), [appointments]);
  const getShopAppointments = useCallback((shopId: string) =>
    appointments.filter(a => a.barbershopId === shopId), [appointments]);

  const addAppointment = useCallback(async (data: Omit<Appointment, 'id' | 'createdAt'>) => {
    try {
      console.log('📅 Adding manual appointment:', data);

      const { error } = await Promise.race([
        supabase.from('appointments').insert({
          client_id: data.clientId || null,
          barber_id: data.barberId || null,
          barbershop_id: data.barbershopId,
          service: data.service,
          date: data.date,
          time: data.time,
          price: data.price,
          status: data.status,
          client_name: data.clientName,
          client_phone: data.clientPhone,
          barber_name: data.barberName,
          barbershop_name: data.barbershopName
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout al guardar cita')), 8000))
      ]) as any;

      if (error) throw error;

      console.log('✅ Appointment added successfully');
      await fetchDataWithTimeout(5000);
    } catch (error: any) {
      console.error('❌ Error in addAppointment:', error);
      throw error;
    }
  }, [fetchDataWithTimeout]);

  const updateAppointmentStatus = useCallback(async (id: string, status: Appointment['status']) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (error) throw error;
    fetchDataWithTimeout(5000);
  }, [fetchDataWithTimeout]);

  const getUserMessages = useCallback((userId: string) =>
    messages.filter(m => m.senderId === userId || m.receiverId === userId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)), [messages]);

  const sendMessage = useCallback(async (data: Omit<Message, 'id' | 'createdAt' | 'read'>) => {
    const { error } = await supabase.from('messages').insert({
      sender_id: data.senderId,
      sender_name: data.senderName,
      sender_role: data.senderRole,
      receiver_id: data.receiverId,
      receiver_name: data.receiverName,
      receiver_role: data.receiverRole,
      content: data.content,
      barbershop_id: data.barbershopId
    });
    if (error) throw error;
    fetchDataWithTimeout(5000);
  }, [fetchDataWithTimeout]);

  const markAsRead = useCallback(async (id: string) => {
    const { error } = await supabase.from('messages').update({ read: true }).eq('id', id);
    if (error) throw error;
    fetchData();
  }, [fetchData]);

  const addExpense = useCallback(async (data: Omit<Expense, 'id' | 'createdAt'>) => {
    const { error } = await supabase.from('expenses').insert({
      barbershop_id: data.barbershopId,
      description: data.description,
      amount: data.amount,
      category: data.category,
      date: data.date
    });
    if (error) throw error;
    fetchData();
  }, [fetchData]);

  const getShopExpenses = useCallback((shopId: string) =>
    expenses.filter(e => e.barbershopId === shopId), [expenses]);

  const addChair = useCallback(async (barbershopId: string, name: string) => {
    const { error } = await supabase.from('chairs').insert({
      barbershop_id: barbershopId,
      name
    });
    if (error) throw error;
    fetchData();
  }, [fetchData]);

  const removeChair = useCallback(async (id: string) => {
    const { error } = await supabase.from('chairs').delete().eq('id', id);
    if (error) throw error;
    fetchData();
  }, [fetchData]);

  const getShopChairs = useCallback((shopId: string) =>
    chairs.filter(c => c.barbershopId === shopId), [chairs]);

  const joinBarbershop = useCallback(async (barberId: string, barbershopId: string) => {
    try {
      const barber = users.find(u => u.id === barberId);
      if (!barber) {
        throw new Error('Usuario no encontrado');
      }

      // ═══════════════════════════════════════════════════════════
      // VALIDACIÓN CRÍTICA 1: Verificar si ya está contratado
      // ═══════════════════════════════════════════════════════════
      const { data: existingBarbers, error: checkError } = await supabase
        .from('barbers')
        .select('*, barbershops!inner(name)')
        .eq('user_id', barberId)
        .eq('is_approved', true)
        .not('barbershop_id', 'is', null);

      if (checkError) throw checkError;

      if (existingBarbers && existingBarbers.length > 0) {
        const currentShop = existingBarbers[0];
        const shopName = (currentShop as any).barbershops?.name || 'una barbería';
        alert(`❌ No puedes enviar solicitudes porque ya estás contratado en "${shopName}". Un barbero solo puede trabajar en una barbería a la vez.`);
        return;
      }

      // ═══════════════════════════════════════════════════════════
      // VALIDACIÓN CRÍTICA 2: Verificar solicitud pendiente duplicada
      // ═══════════════════════════════════════════════════════════
      const { data: existingRequest, error: reqError } = await supabase
        .from('join_requests')
        .select('*')
        .eq('barber_id', barberId)
        .eq('barbershop_id', barbershopId)
        .eq('status', 'pending');

      if (reqError) throw reqError;

      if (existingRequest && existingRequest.length > 0) {
        alert('Ya tienes una solicitud pendiente en esta barbería.');
        return;
      }

      // ═══════════════════════════════════════════════════════════
      // CREAR SOLICITUD VÁLIDA
      // ═══════════════════════════════════════════════════════════
      const { error } = await supabase.from('join_requests').insert({
        barber_id: barberId,
        barber_name: barber.name,
        barbershop_id: barbershopId,
        status: 'pending'
      });

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error en joinBarbershop:', error);
      throw error;
    }
  }, [users, fetchData]);

  const handleJoinRequest = useCallback(async (requestId: string, approve: boolean) => {
    try {
      const request = joinRequests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Solicitud no encontrada');
      }

      if (approve) {
        // ═══════════════════════════════════════════════════════════
        // VALIDACIÓN CRÍTICA 1: Verificar si ya está contratado
        // ═══════════════════════════════════════════════════════════
        const { data: existingBarbers, error: checkError } = await supabase
          .from('barbers')
          .select('*')
          .eq('user_id', request.barberId)
          .eq('is_approved', true)
          .not('barbershop_id', 'is', null);

        if (checkError) throw checkError;

        if (existingBarbers && existingBarbers.length > 0) {
          // El barbero YA está contratado en otra(s) barbería(s)
          const existingShop = existingBarbers[0];
          const shopName = barbershops.find(s => s.id === existingShop.barbershop_id)?.name || 'otra barbería';

          alert(`❌ CONTRATACIÓN RECHAZADA: ${request.barberName} ya está contratado en "${shopName}". Un barbero solo puede trabajar en una barbería a la vez.`);

          // Marcar esta solicitud como rechazada con motivo especial
          await supabase.from('join_requests')
            .update({
              status: 'rejected'
            })
            .eq('id', requestId);

          fetchData();
          return;
        }

        // ═══════════════════════════════════════════════════════════
        // VALIDACIÓN CRÍTICA 2: Verificar duplicados en misma barbería
        // ═══════════════════════════════════════════════════════════
        const { data: sameShopBarber, error: dupError } = await supabase
          .from('barbers')
          .select('*')
          .eq('user_id', request.barberId)
          .eq('barbershop_id', request.barbershopId);

        if (dupError) throw dupError;

        if (sameShopBarber && sameShopBarber.length > 0) {
          alert(`❌ ERROR: ${request.barberName} ya está registrado en esta barbería.`);

          await supabase.from('join_requests')
            .update({ status: 'rejected' })
            .eq('id', requestId);

          fetchData();
          return;
        }

        // ═══════════════════════════════════════════════════════════
        // APROBACIÓN VÁLIDA: Crear registro de barbero
        // ═══════════════════════════════════════════════════════════
        const barberUser = users.find(u => u.id === request.barberId);
        if (!barberUser) {
          throw new Error('Usuario barbero no encontrado');
        }

        // Crear el registro del barbero
        await addBarber({
          userId: barberUser.id,
          name: barberUser.name,
          email: barberUser.email,
          phone: barberUser.phone,
          avatar: barberUser.avatar,
          barbershopId: request.barbershopId,
          barbershopName: barbershops.find(s => s.id === request.barbershopId)?.name || '',
          specialty: 'Nuevo Barbero',
          bio: 'Barbero integrado via solicitud.',
          isPublic: true,
          isApproved: true,
        });

        // ═══════════════════════════════════════════════════════════
        // VALIDACIÓN CRÍTICA 3: Rechazar TODAS las otras solicitudes pendientes
        // ═══════════════════════════════════════════════════════════
        const { error: rejectOthersError } = await supabase
          .from('join_requests')
          .update({
            status: 'rejected'
          })
          .eq('barber_id', request.barberId)
          .eq('status', 'pending')
          .neq('id', requestId);

        if (rejectOthersError) {
          console.error('Error al rechazar otras solicitudes:', rejectOthersError);
        }

        // Aprobar la solicitud actual
        await supabase.from('join_requests')
          .update({ status: 'approved' })
          .eq('id', requestId);

        // ═══════════════════════════════════════════════════════════
        // CRÍTICO: Recargar datos ANTES del mensaje de éxito
        // ═══════════════════════════════════════════════════════════
        console.log('🔄 Recargando datos para actualizar perfil de barbero...');
        await fetchDataWithTimeout(8000);

        alert(`✅ ${request.barberName} ha sido contratado exitosamente.`);

      } else {
        // ═══════════════════════════════════════════════════════════
        // RECHAZO SIMPLE: Solo marcar como rechazada
        // ═══════════════════════════════════════════════════════════
        await supabase.from('join_requests')
          .update({ status: 'rejected' })
          .eq('id', requestId);
      }

      // Refresh final para actualizar UI
      await fetchDataWithTimeout(5000);
    } catch (error) {
      console.error('Error en handleJoinRequest:', error);
      throw error;
    }
  }, [joinRequests, users, barbershops, addBarber, fetchData, fetchDataWithTimeout]);

  const becomeIndependent = useCallback(async (barberId: string) => {
    // Si el usuario ya tiene un perfil de barbero, lo actualizamos. 
    // Si no, lo creamos directamente como independiente.
    const existingBarber = barbers.find(b => b.id === barberId || b.userId === barberId);

    if (existingBarber) {
      const { error } = await supabase
        .from('barbers')
        .update({
          is_independent: true,
          is_approved: true, // Auto-aprobado como independiente tras pago
          barbershop_id: null,
          barbershop_name: 'Independiente / A Domicilio'
        })
        .eq('id', existingBarber.id);
      if (error) throw error;
    } else {
      const user = users.find(u => u.id === barberId);
      if (!user) return;

      const { error } = await supabase.from('barbers').insert({
        user_id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: user.avatar || '',
        specialty: 'Barbero Independiente',
        bio: 'Disponible para servicios a domicilio.',
        is_public: true,
        is_approved: true,
        is_independent: true,
        barbershop_name: 'Independiente / A Domicilio'
      });
      if (error) throw error;
    }
    fetchData();
  }, [barbers, users, fetchData]);

  const getShopJoinRequests = useCallback((shopId: string) =>
    joinRequests.filter(r => r.barbershopId === shopId), [joinRequests]);

  // Inventory Management
  const addProduct = useCallback(async (data: Omit<Product, 'id' | 'createdAt'>) => {
    const { error } = await supabase.from('products').insert({
      barbershop_id: data.barbershopId,
      name: data.name,
      description: data.description,
      price: data.price,
      cost: data.cost,
      stock: data.stock,
      min_stock: data.minStock,
      category: data.category,
      image_url: data.imageUrl
    });
    if (error) throw error;
    fetchData();
  }, [fetchData]);

  const updateProduct = useCallback(async (id: string, data: Partial<Product>) => {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.price !== undefined) payload.price = data.price;
    if (data.cost !== undefined) payload.cost = data.cost;
    if (data.stock !== undefined) payload.stock = data.stock;
    if (data.minStock !== undefined) payload.min_stock = data.minStock;
    if (data.category !== undefined) payload.category = data.category;
    if (data.imageUrl !== undefined) payload.image_url = data.imageUrl;

    const { error } = await supabase.from('products').update(payload).eq('id', id);
    if (error) throw error;
    fetchData();
  }, [fetchData]);

  const sellProduct = useCallback(async (data: Omit<ProductSale, 'id' | 'createdAt'>) => {
    // 1. Registrar la venta
    const { error: saleError } = await supabase.from('product_sales').insert({
      barbershop_id: data.barbershopId,
      product_id: data.productId,
      product_name: data.productName,
      quantity: data.quantity,
      unit_price: data.unitPrice,
      total_price: data.totalPrice,
      seller_id: data.sellerId
    });
    if (saleError) throw saleError;

    // 2. Descontar del inventario si el producto existe
    if (data.productId) {
      const product = products.find(p => p.id === data.productId);
      if (product) {
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock: Math.max(0, product.stock - data.quantity) })
          .eq('id', data.productId);
        if (stockError) throw stockError;
      }
    }

    fetchData();
  }, [products, fetchData]);

  // Reviews & Satisfaction
  const addReview = useCallback(async (data: Omit<Review, 'id' | 'createdAt'>) => {
    const { error } = await supabase.from('reviews').insert({
      appointment_id: data.appointmentId,
      client_id: data.userId,
      barber_id: data.barberId,
      barbershop_id: data.barbershopId,
      rating: data.rating,
      comment: data.comment
    });
    if (error) throw error;
    fetchData();
  }, [fetchData]);

  const deleteAccount = useCallback(async () => {
    if (!currentUser) {
      console.warn('⚠️ No hay usuario logueado para eliminar cuenta.');
      return;
    }

    try {
      console.log('🗑️ Intentando eliminar cuenta del usuario:', currentUser.id);

      const { data, error } = await supabase.functions.invoke('delete-account', {
        method: 'POST',
      });

      if (error) {
        console.error('❌ Error de Supabase Functions invocation:', error);
        throw new Error(error.message || 'Error al invocar la función de eliminación');
      }

      console.log('✅ Cuenta eliminada con éxito:', data);

      // Clear local storage and redirect
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/auth?mode=login';
    } catch (error: any) {
      console.error('🔥 Error crítico eliminando cuenta:', error);
      alert('Error al eliminar cuenta: ' + (error.message || 'Error desconocido'));
      throw error;
    }
  }, [currentUser]);

  // Campaign CRUD
  const addCampaign = useCallback(async (data: Omit<Campaign, 'id' | 'createdAt'>) => {
    const { error } = await supabase.from('campaigns').insert({
      title: data.title, message: data.message, emoji: data.emoji,
      color: data.color, target: data.target, is_active: data.isActive,
      style: data.style || 'banner', priority: data.priority || 1,
      expires_at: data.expiresAt || null,
      scheduled_at: data.scheduledAt || null,
      image_url: data.imageUrl || null,
      link_url: data.linkUrl || null,
      link_text: data.linkText || 'Ver más',
      advertiser: data.advertiser || null
    });
    if (error) throw error;
    await fetchData();
  }, [fetchData]);

  const updateCampaign = useCallback(async (id: string, data: Partial<Campaign>) => {
    const { error } = await supabase.from('campaigns').update({
      ...(data.title !== undefined && { title: data.title }),
      ...(data.message !== undefined && { message: data.message }),
      ...(data.emoji !== undefined && { emoji: data.emoji }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.target !== undefined && { target: data.target }),
      ...(data.isActive !== undefined && { is_active: data.isActive }),
      ...(data.imageUrl !== undefined && { image_url: data.imageUrl }),
      ...(data.linkUrl !== undefined && { link_url: data.linkUrl }),
      ...(data.linkText !== undefined && { link_text: data.linkText }),
      ...(data.advertiser !== undefined && { advertiser: data.advertiser }),
    }).eq('id', id);
    if (error) throw error;
    await fetchData();
  }, [fetchData]);

  const deleteCampaign = useCallback(async (id: string) => {
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) throw error;
    setCampaigns(prev => prev.filter(c => c.id !== id));
  }, []);

  return (
    <DataContext.Provider value={{
      currentUser, login, register, logout, deleteAccount, loading, users,
      barbershops, getBarbershop, addBarbershop, updateBarbershop,
      barbers, getBarber, getBarbersByShop, addBarber, approveBarber, rejectBarber, dismissBarber, assignBarberToChair,
      appointments, getClientAppointments, getBarberAppointments, getShopAppointments, addAppointment, updateAppointmentStatus,
      messages, getUserMessages, sendMessage, markAsRead,
      expenses, addExpense, getShopExpenses,
      chairs, addChair, removeChair, getShopChairs,
      joinRequests, joinBarbershop, handleJoinRequest, getShopJoinRequests,
      becomeIndependent,
      updateBarber,
      updateProfile,
      products, productSales, addProduct, updateProduct, sellProduct,
      reviews, addReview,
      campaigns, addCampaign, updateCampaign, deleteCampaign,
      isInitialSyncing
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}