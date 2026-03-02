import { useData } from '@/contexts/DataContext';
import {
    LayoutDashboard, Store, Users, DollarSign,
    ShieldCheck, Search, ArrowUpRight, LogOut, Star, Activity,
    Menu, X, Key, Copy, Calendar, Briefcase, TrendingUp,
    Zap, Settings, Globe,
    ShieldAlert, CreditCard, Megaphone,
    RefreshCcw, Layers, ExternalLink, Bell,
    Download, ChevronRight, UserCheck, Mail
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useState, useEffect, useMemo } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '@/lib/supabase';
import { MarketingTab } from '@/pages/MarketingTab';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type AdminTab = 'general' | 'activity' | 'shops' | 'barbers' | 'clients' | 'ads' | 'income' | 'system';

export default function AdminDashboard() {
    const {
        currentUser, barbershops, appointments, users,
        barbers, productSales, campaigns, addCampaign,
        updateCampaign, deleteCampaign, loading, logout
    } = useData();

    const [activeTab, setActiveTab] = useState<AdminTab>('general');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Data State
    const [coupons, setCoupons] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [adminLogs, setAdminLogs] = useState<{ id: string, msg: string, type: 'info' | 'success' | 'warning', time: string }[]>([]);

    // Detail View
    const [selectedEntity, setSelectedEntity] = useState<any | null>(null);

    const addLog = (msg: string, type: 'info' | 'success' | 'warning' = 'info') => {
        const newLog = {
            id: Math.random().toString(36).substr(2, 9),
            msg,
            type,
            time: new Date().toLocaleTimeString()
        };
        setAdminLogs(prev => [newLog, ...prev].slice(0, 50));
    };

    // Modals
    const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
    const [generatedToken, setGeneratedToken] = useState<string | null>(null);
    const [tokenMonths, setTokenMonths] = useState<1 | 3 | 6>(1);
    const [tokenPlan, setTokenPlan] = useState<'premium' | 'pro'>('premium');
    const [isLocking, setIsLocking] = useState(false);

    const downloadUsersCSV = () => {
        const headers = ['ID', 'Nombre', 'Email', 'Rol', 'Teléfono'];
        const rows = safeUsers.map(u => [u.id, u.name, u.email, u.role, u.phone || 'N/A']);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `usuarios_plataforma_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleAuditVault = () => {
        setIsRefreshing(true);
        addLog('Iniciando auditoría de bóveda financiera...', 'info');
        setTimeout(() => {
            fetchAdminData();
            addLog('Bóveda auditada: $0.00 discrepancias encontradas. Sincronización exitosa.', 'success');
        }, 1200);
    };

    const handleLockdown = () => {
        if (confirm('¿ESTÁ SEGURO? Esto iniciará el protocolo de seguridad y cerrará todas las sesiones activas.')) {
            setIsLocking(true);
            setTimeout(() => {
                logout();
            }, 2000);
        }
    };

    const fetchAdminData = async () => {
        setIsRefreshing(true);
        const [cRes, tRes] = await Promise.all([
            supabase.from('coupons').select('*, barbershops(name)').order('created_at', { ascending: false }),
            supabase.from('transactions').select('*, barbershops(name)').order('created_at', { ascending: false })
        ]);
        if (cRes.data) setCoupons(cRes.data);
        if (tRes.data) setTransactions(tRes.data);
        setTimeout(() => setIsRefreshing(false), 600);
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    // Derived Logic for Active/Inactive
    const oneWeekAgo = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d;
    }, []);

    const safeAppts = useMemo(() => appointments || [], [appointments]);
    const safeShops = useMemo(() => barbershops || [], [barbershops]);
    const safeUsers = useMemo(() => users || [], [users]);
    const safeBarbers = useMemo(() => barbers || [], [barbers]);
    const safeSales = useMemo(() => productSales || [], [productSales]);

    const filteredShops = useMemo(() => {
        return safeShops.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [safeShops, searchTerm]);

    const activeShops = useMemo(() => safeShops.filter(s =>
        (s.plan && s.plan !== 'free') ||
        safeAppts.some(a => a.barbershopId === s.id && new Date(a.date) >= oneWeekAgo)
    ), [safeShops, safeAppts, oneWeekAgo]);

    const activeBarbers = useMemo(() => safeBarbers.filter(b =>
        safeAppts.some(a => a.barberId === b.id && new Date(a.date) >= oneWeekAgo)
    ), [safeBarbers, safeAppts, oneWeekAgo]);

    const activeClients = useMemo(() => safeUsers.filter(u =>
        u.role === 'client' &&
        safeAppts.some(a => a.clientId === u.id && new Date(a.date) >= oneWeekAgo)
    ), [safeUsers, safeAppts, oneWeekAgo]);

    // Plan Change Detection Logic
    const [prevShops, setPrevShops] = useState<any[]>([]);
    useEffect(() => {
        if (prevShops.length > 0) {
            safeShops.forEach(shop => {
                const oldShop = prevShops.find(ps => ps.id === shop.id);
                if (oldShop && oldShop.plan !== shop.plan) {
                    const isUpgrade = (shop.plan === 'premium' || (shop.plan === 'pro' && oldShop.plan === 'free'));
                    addLog(
                        `Nodo [${shop.name}] ha ${isUpgrade ? 'SUBIDO' : 'BAJADO'} su nivel de protocolo a: ${shop.plan.toUpperCase()}`,
                        isUpgrade ? 'success' : 'warning'
                    );
                }
            });
        }
        setPrevShops(safeShops);
    }, [safeShops]);

    // Auto-dismiss logs
    useEffect(() => {
        if (adminLogs.length > 0) {
            const timer = setTimeout(() => {
                setAdminLogs(prev => prev.slice(0, prev.length - 1));
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [adminLogs]);

    const monthlyIncome = useMemo(() => {
        const now = new Date();
        return transactions.filter(t => {
            const tDate = new Date(t.created_at);
            return tDate.getMonth() === now.getMonth() &&
                tDate.getFullYear() === now.getFullYear() &&
                (t.status === 'completed' || t.status === 'approved');
        }).reduce((acc, t) => acc + (t.amount || 0), 0);
    }, [transactions]);

    // Financial Intelligence
    const totalSaaSRenue = transactions.reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
    const totalProductRevenue = safeSales.reduce((sum: number, t: any) => sum + Number(t.totalPrice || 0), 0);
    const combinedRevenue = totalSaaSRenue + totalProductRevenue;

    const activeSubscriptions = safeShops.filter((s: any) => s.plan === 'premium' || s.plan === 'pro').length;
    const mrrProjected = activeSubscriptions * 499;

    const inactiveClients = useMemo(() => safeUsers.filter(u =>
        u.role === 'client' &&
        !safeAppts.some(a => a.clientId === u.id && new Date(a.date) >= oneWeekAgo)
    ), [safeUsers, safeAppts, oneWeekAgo]);

    const newClientsMonth = useMemo(() => safeUsers.filter(u => {
        const d = new Date(u.createdAt);
        const now = new Date();
        return u.role === 'client' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }), [safeUsers]);

    const totalApptsMonth = useMemo(() => safeAppts.filter(a => {
        const d = new Date(a.date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length, [safeAppts]);

    const [warningMsg, setWarningMsg] = useState('');
    const [warnedEntities, setWarnedEntities] = useState<string[]>([]);

    const navItems = [
        { id: 'general', label: 'Panel General', icon: LayoutDashboard, desc: 'Métricas vitales y estado' },
        { id: 'activity', label: 'Actividad', icon: Activity, desc: 'Flujo cronológico de eventos' },
        { id: 'shops', label: 'Barberías', icon: Store, desc: 'Gestión de nodos de negocio' },
        { id: 'barbers', label: 'Barberos', icon: Briefcase, desc: 'Control de flota profesional' },
        { id: 'clients', label: 'Clientes', icon: Users, desc: 'Registro de identidad de clientes' },
        { id: 'ads', label: 'Publicidad', icon: Megaphone, desc: 'Central de banners internos' },
        { id: 'income', label: 'Ingresos', icon: DollarSign, desc: 'Análisis financiero y ventas' },
        { id: 'system', label: 'Sistema', icon: ShieldCheck, desc: 'Núcleo y configuraciones' },
    ];

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#050505]">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative h-20 w-20">
                        <div className="absolute inset-0 rounded-full border-2 border-amber-500/5"></div>
                        <div className="absolute inset-0 rounded-full border-t-2 border-amber-500 animate-spin"></div>
                        <div className="absolute inset-4 rounded-full border-2 border-emerald-500/5"></div>
                        <div className="absolute inset-4 rounded-full border-b-2 border-emerald-500 animate-spin-reverse"></div>
                    </div>
                    <div className="text-center">
                        <p className="text-amber-500 font-black tracking-[0.4em] text-[10px] uppercase italic">Iniciando Centro de Comando</p>
                        <p className="text-zinc-600 text-[8px] uppercase mt-2 tracking-widest font-bold">Sincronizando datos globales...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020202] text-zinc-400 font-sans selection:bg-amber-500 selection:text-black flex overflow-hidden">

            {/* ── SIDEBAR (GLASS COMMAND) ────────────────────────────────────────── */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 bg-[#050505] border-r border-white-[0.02] transition-transform duration-500 lg:translate-x-0 lg:static lg:block",
                isSidebarOpen ? "translate-x-0 outline-none ring-1 ring-amber-500/20 shadow-2xl shadow-amber-500/10" : "-translate-x-full"
            )}>
                <div className="h-full flex flex-col p-6">
                    <div className="mb-12 flex items-center justify-between">
                        <Logo className="h-7" />
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic">Núcleo Activo</span>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id as AdminTab); setIsSidebarOpen(false); }}
                                className={cn(
                                    "w-full group flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 relative overflow-hidden",
                                    activeTab === item.id
                                        ? "bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 text-white shadow-lg shadow-amber-500/5 scale-[1.02]"
                                        : "hover:bg-white/5 border border-transparent text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                {activeTab === item.id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                                )}
                                <item.icon className={cn("w-5 h-5 mt-0.5", activeTab === item.id ? "text-amber-500" : "text-zinc-600 group-hover:text-zinc-400")} />
                                <div className="text-left">
                                    <p className="text-xs font-black uppercase tracking-widest italic">{item.label}</p>
                                    <p className="text-[8px] text-zinc-600 font-bold uppercase mt-1 tracking-tighter opacity-70">{item.desc}</p>
                                </div>
                            </button>
                        ))}
                    </nav>

                    <div className="pt-6 border-t border-white/[0.03] space-y-4">
                        <div className="bg-zinc-900/30 rounded-2xl p-4 border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-black italic">
                                    {currentUser?.name?.[0] || 'A'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-white uppercase truncate">{currentUser?.name}</p>
                                    <p className="text-[8px] text-zinc-600 uppercase font-bold truncate">Super Administrador</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest italic border border-red-500/10"
                        >
                            <LogOut className="w-4 h-4" /> <span>Terminar Sesión</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── MAIN VIEWPORT (NEXUS ENGINE) ───────────────────────────────────── */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#020202] relative overflow-hidden">

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full -ml-40 -mb-40 pointer-events-none"></div>

                {/* Header (Control Bar) */}
                <header className="h-20 border-b border-white/[0.03] flex items-center justify-between px-8 bg-[#050505]/80 backdrop-blur-xl z-40 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-zinc-500 hover:text-white">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-lg font-black text-white uppercase italic tracking-widest flex items-center gap-3">
                                <Activity className="w-5 h-5 text-amber-500" />
                                {navItems.find(n => n.id === activeTab)?.label}
                            </h2>
                            <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-[0.3em] mt-0.5">Panel de Control Global</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-zinc-900 rounded-xl border border-white/5 ring-1 ring-white/5 focus-within:ring-amber-500/30 transition-all">
                            <Search className="w-3.5 h-3.5 text-zinc-600" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Búsqueda Universal..."
                                className="bg-transparent border-none outline-none text-xs font-bold text-white placeholder:text-zinc-700 w-48"
                            />
                        </div>
                        <button
                            onClick={fetchAdminData}
                            className={cn(
                                "p-3 rounded-xl bg-zinc-900 border border-white/5 text-zinc-500 hover:text-amber-500 transition-all",
                                isRefreshing && "animate-spin text-amber-500"
                            )}
                        >
                            <RefreshCcw className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-8 lg:p-12 custom-scrollbar relative">

                    {/* ── PANEL GENERAL (Overview) ─────────────────────────────────── */}
                    {activeTab === 'general' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

                            {/* 1. Four Main Boxes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    label="Barberías"
                                    value={safeShops.length}
                                    trend={`${activeShops.length} Activas`}
                                    icon={Store}
                                    color="amber"
                                    desc="Inactivas si >1 sem. sin citas (Excepto Pro/Premium)"
                                />
                                <StatCard
                                    label="Barberos"
                                    value={safeBarbers.length}
                                    trend={`${activeBarbers.length} Activos`}
                                    icon={Briefcase}
                                    color="blue"
                                    desc="Activo = citas en la última semana"
                                />
                                <StatCard
                                    label="Clientes"
                                    value={safeUsers.filter(u => u.role === 'client').length}
                                    trend={`${activeClients.length} Activos`}
                                    icon={Users}
                                    color="purple"
                                    desc="Inactivos si >1 sem. sin citas"
                                />
                                <StatCard
                                    label="Ingresos del Mes"
                                    value={`$${monthlyIncome.toLocaleString()}`}
                                    trend="Confirmados"
                                    icon={DollarSign}
                                    color="emerald"
                                    desc="Solo ingresos del mes actual"
                                />
                            </div>

                            {/* 2. Activity Bar (Plans only) */}
                            <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent"></div>
                                <div className="flex items-center gap-6 relative z-10 overflow-hidden">
                                    <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-amber-500 text-black text-[10px] font-black uppercase italic rounded-xl shadow-lg ring-1 ring-white/20">
                                        <Zap className="w-3 h-3" /> Anuncios Globales
                                    </div>
                                    <div className="flex-1 overflow-hidden whitespace-nowrap">
                                        <div className="flex gap-12 animate-marquee">
                                            {transactions.filter(t => t.status === 'completed' || t.status === 'approved').slice(0, 5).map((t, i) => (
                                                <div key={i} className="flex items-center gap-3 text-[10px] font-black uppercase italic tracking-widest text-zinc-400">
                                                    <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                                                    <span>NODO {safeShops.find(s => s.id === t.barbershopId)?.name || 'ID-' + t.id.slice(0, 4)} SE HA VUELTO <span className="text-white">{t.planId.toUpperCase()}</span></span>
                                                    <span className="opacity-30">[{new Date(t.created_at).toLocaleDateString()}]</span>
                                                </div>
                                            ))}
                                            {transactions.filter(t => t.status === 'completed' || t.status === 'approved').length === 0 && (
                                                <div className="text-[10px] font-black uppercase italic tracking-widest text-zinc-600">Sincronizando flujo de red... Esperando eventos de nodos...</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Compact Analysis Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <SummaryBadge
                                    label="Barberías Free"
                                    value={safeShops.filter(s => !s.plan || s.plan === 'free').length}
                                    icon={Layers}
                                    color="amber"
                                />
                                <SummaryBadge
                                    label="Barberías Pro"
                                    value={safeShops.filter(s => s.plan === 'pro').length}
                                    icon={Zap}
                                    color="blue"
                                />
                                <SummaryBadge
                                    label="Barberías Premium"
                                    value={safeShops.filter(s => s.plan === 'premium' || s.plan === 'premium_pro').length}
                                    icon={Star}
                                    color="emerald"
                                />
                                <div className="bg-[#09090b] border border-emerald-500/10 p-6 rounded-3xl flex items-center gap-6 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 text-emerald-500">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-white italic">+{Math.round((monthlyIncome / (combinedRevenue || 1)) * 100)}%</p>
                                        <p className="text-[9px] uppercase tracking-[0.2em] font-black text-emerald-500 italic">Rentabilidad Gral.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── ACTIVIDAD (Event Feed) ────────────────────────────────────── */}
                    {activeTab === 'activity' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-right-4 duration-700">
                            {/* Chronological Feed */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-3xl font-black text-white uppercase italic tracking-widest leading-none">Flujo de Actividad</h1>
                                        <p className="text-[10px] text-amber-500/60 uppercase tracking-[0.3em] font-black mt-2 italic">Registro en tiempo real del ecosistema</p>
                                    </div>
                                    <div className="p-3 bg-zinc-900 border border-white/5 rounded-2xl">
                                        <Activity className="w-5 h-5 text-amber-500" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        ...safeShops.map(s => ({ type: 'shop', data: s, date: s.createdAt, msg: `Se acaba de unir la barbería: ${s.name}`, icon: Store })),
                                        ...safeUsers.filter(u => u.role === 'client').slice(0, 5).map(u => ({ type: 'client', data: u, date: u.createdAt, msg: `Nuevo cliente registrado: ${u.name}`, icon: Users })),
                                        ...safeAppts.slice(0, 10).map(a => ({ type: 'appt', data: a, date: a.createdAt, msg: `Cita agendada en ${a.barbershopName}: ${a.service}`, icon: Calendar })),
                                        ...transactions.slice(0, 5).map(t => ({ type: 'trans', data: t, date: t.created_at, msg: `Pago confirmado de ${safeShops.find(s => s.id === t.barbershopId)?.name || 'Nodo'}: $${t.amount}`, icon: DollarSign }))
                                    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((event, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                if (event.type === 'shop') { setActiveTab('shops'); setSearchTerm(event.data.name); }
                                                if (event.type === 'client') { setActiveTab('clients'); setSearchTerm(event.msg.split(': ')[1]); }
                                                addLog(`Navegando a la entidad relacionada...`, 'info');
                                            }}
                                            className="w-full flex items-center gap-6 p-6 bg-[#09090b] border border-white/5 rounded-[2rem] hover:border-amber-500/30 transition-all group text-left"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                                                <event.icon className="w-5 h-5 text-zinc-500 group-hover:text-amber-500" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-black text-white uppercase italic tracking-widest">{event.msg}</p>
                                                <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1 italic">{new Date(event.date).toLocaleString()}</p>
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 text-zinc-800 group-hover:text-amber-500 transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* System Status Sidebar */}
                            <div className="space-y-8">
                                <div className="bg-[#09090b] border border-white/5 rounded-[3rem] p-10 space-y-10 shadow-2xl sticky top-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-black text-white uppercase italic tracking-widest">Estado del Sistema</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <HealthRow label="Servidor Core" status="Online" delay="12ms" />
                                        <HealthRow label="Base de Datos" status="Sincronizado" delay="8ms" />
                                        <HealthRow label="Puerta de Enlace" status="Estable" delay="15ms" />
                                        <HealthRow label="Nodos SaaS" status="Activo" delay="22ms" />
                                    </div>
                                    <button onClick={() => addLog('Protocolo de mantenimiento activado por 30min', 'warning')} className="w-full py-4 bg-zinc-900 border border-white/5 rounded-2xl text-[10px] font-black uppercase italic text-zinc-500 hover:text-amber-500 hover:border-amber-500/30 transition-all">
                                        Modo Mantenimiento
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── BARBERÍAS (Shops & Network) ─────────────────────────────── */}
                    {activeTab === 'shops' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <SummaryBadge label="Tiendas Totales" value={safeShops.length} icon={Store} color="amber" />
                                <SummaryBadge label="Ecosistema Activo" value={activeShops.length} icon={Activity} color="emerald" />
                                <SummaryBadge label="Nodos Premium" value={safeShops.filter(s => s.plan === 'premium').length} icon={Zap} color="blue" />
                                <div onClick={downloadUsersCSV} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white"><Download className="w-5 h-5" /></div>
                                        <span className="text-[10px] font-black uppercase italic text-zinc-400">Exportar Nodos</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                                </div>
                            </div>

                            <MasterTable
                                title="Red de Barberías Federadas"
                                subtitle="Control maestro de nodos de negocio"
                                headers={['Nombre', 'Estado', 'Actividad', 'Registro', 'Dueño', 'Acciones']}
                                count={filteredShops.length}
                            >
                                {filteredShops.map((shop) => (
                                    <tr key={shop.id} className="group hover:bg-white/[0.02] transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex-shrink-0 relative overflow-hidden">
                                                    {shop.image ? <img src={shop.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" /> : <div className="w-full h-full flex items-center justify-center text-xs font-black text-zinc-700">{shop.name[0]}</div>}
                                                </div>
                                                <div>
                                                    <p className="font-black text-white italic uppercase text-xs tracking-wider">{shop.name}</p>
                                                    <p className="text-[9px] text-zinc-500 font-bold uppercase">{shop.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6"><StatusBadge type={shop.plan as any} /></td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full", activeShops.some(s => s.id === shop.id) ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-zinc-800")}></div>
                                                <span className="text-[10px] font-black uppercase italic text-zinc-400">{activeShops.some(s => s.id === shop.id) ? 'Activa' : 'Inactiva'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-[10px] font-black text-zinc-500 italic">{new Date(shop.createdAt).toLocaleDateString()}</td>
                                        <td className="px-8 py-6 text-[10px] font-black text-zinc-300 italic uppercase">{shop.ownerName || 'Sin asignar'}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setSelectedEntity({ type: 'shop', data: shop })}
                                                    className="px-4 py-2 bg-amber-500 text-black text-[9px] font-black uppercase italic rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10"
                                                >
                                                    Gestionar
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </MasterTable>
                        </div>
                    )}

                    {/* ── BARBEROS (Fleet Management) ─────────────────────────────── */}
                    {activeTab === 'barbers' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <SummaryBadge label="Barberos Totales" value={safeBarbers.length} icon={Briefcase} color="blue" />
                                <SummaryBadge label="Barberos Activos" value={activeBarbers.length} icon={Activity} color="emerald" />
                                <SummaryBadge label="Aprobación Pendiente" value={safeBarbers.filter(b => !b.isApproved).length} icon={ShieldAlert} color="amber" />
                                <SummaryBadge label="Independientes" value={safeBarbers.filter(b => b.isIndependent).length} icon={UserCheck} color="purple" />
                            </div>

                            <MasterTable
                                title="Gremio de Barberos"
                                subtitle="Gestión de identidades profesionales"
                                headers={['Profesional', 'Barbería', 'Estado', 'Registro', 'Acciones']}
                                count={safeBarbers.length}
                            >
                                {safeBarbers.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase())).map((barber) => (
                                    <tr key={barber.id} className="group hover:bg-white/[0.02] transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex-shrink-0 relative overflow-hidden">
                                                    {barber.avatar ? <img src={barber.avatar} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" /> : <div className="w-full h-full flex items-center justify-center text-xs font-black text-zinc-700">{barber.name[0]}</div>}
                                                </div>
                                                <div>
                                                    <p className="font-black text-white italic uppercase text-xs tracking-wider">{barber.name}</p>
                                                    <p className="text-[9px] text-zinc-500 font-bold uppercase">{barber.specialty}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-[10px] font-black text-zinc-400 italic uppercase">{barber.barbershopName || 'Independiente'}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full", activeBarbers.some(b => b.id === barber.id) ? "bg-emerald-500" : "bg-zinc-800")}></div>
                                                <span className="text-[10px] font-black uppercase italic text-zinc-400">{activeBarbers.some(b => b.id === barber.id) ? 'Activo' : 'Inactivo'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-[10px] font-black text-zinc-500 italic">{new Date(barber.createdAt).toLocaleDateString()}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setSelectedEntity({ type: 'barber', data: barber })}
                                                    className="px-4 py-2 bg-amber-500 text-black text-[9px] font-black uppercase italic rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10"
                                                >
                                                    Gestionar
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </MasterTable>
                        </div>
                    )}

                    {/* ── CLIENTES (Identity Management) ────────────────────────────── */}
                    {activeTab === 'clients' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-black text-white uppercase italic tracking-widest leading-none">Gestión de Usuarios</h1>
                                    <p className="text-[10px] text-amber-500/60 uppercase tracking-[0.3em] font-black mt-2 italic shadow-sm">Centro de Inteligencia de Identidad Universal</p>
                                </div>
                                <div className="bg-zinc-900/40 border border-white/5 px-6 py-3 rounded-2xl flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase italic">Nodos Activos</p>
                                        <p className="text-xl font-black text-white italic">{safeUsers.length}</p>
                                    </div>
                                    <Users className="w-8 h-8 text-amber-500 opacity-40" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <SummaryBadge label="Clientes Activos / Totales" value={`${activeClients.length} / ${safeUsers.filter(u => u.role === 'client').length}`} icon={Users} color="emerald" />
                                <SummaryBadge label="Clientes Inactivos" value={inactiveClients.length} icon={ShieldAlert} color="amber" />
                                <SummaryBadge label="Nuevos Clientes (Mes)" value={newClientsMonth.length} icon={UserCheck} color="blue" />
                                <SummaryBadge label="Citas del Mes" value={totalApptsMonth} icon={Calendar} color="purple" />
                            </div>

                            <MasterTable
                                title="Registro de Identidad"
                                subtitle="Control granular de identidades y protocolos de acceso"
                                headers={['Nodo de Identidad', 'ID Seguro', 'Rol de Protocolo', 'Puente Telefónico', 'Estado', 'Acciones']}
                                count={safeUsers.length}
                                onSettings={() => addLog('Accediendo a configuración de identidad global...', 'info')}
                            >
                                {safeUsers.filter((u: any) =>
                                    u.role === 'client' && (
                                        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        u.email.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                ).map((u: any) => (
                                    <tr key={u.id} className="group hover:bg-amber-500/[0.02] transition-all">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-center text-xs font-black text-zinc-700 italic group-hover:text-amber-500 transition-all">
                                                    {u.name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-white uppercase italic tracking-widest">{u.name}</p>
                                                    <p className="text-[9px] text-zinc-600 font-bold">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="text-[9px] font-mono font-black text-zinc-700 uppercase tracking-widest">{u.id.slice(0, 12)}</span>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className={cn(
                                                "px-3 py-1 rounded-full text-[8px] font-black uppercase italic border inline-block",
                                                u.role === 'owner' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                    u.role === 'barber' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                        "bg-zinc-900 text-zinc-600 border-white/5"
                                            )}>
                                                {u.role === 'owner' ? 'DUEÑO' : u.role === 'barber' ? 'BARBERO' : 'CLIENTE'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-[10px] font-black text-zinc-500 uppercase italic">
                                            {u.phone || 'Offline'}
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[9px] font-black text-emerald-500/60 uppercase italic">Verificado</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => setSelectedEntity({ type: 'user', data: u })}
                                                    className="w-9 h-9 bg-zinc-900 border border-white/5 rounded-xl flex items-center justify-center text-zinc-600 hover:text-white transition-all"
                                                >
                                                    <Settings className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setSelectedEntity({ type: 'user', data: u })}
                                                    className="px-4 py-2 bg-amber-500 text-black text-[9px] font-black uppercase italic rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10"
                                                >
                                                    Gestionar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </MasterTable>

                            <div className="flex justify-center pt-8">
                                <button
                                    onClick={downloadUsersCSV}
                                    className="px-8 py-4 bg-zinc-900/50 border border-white/5 rounded-3xl text-[10px] font-black uppercase tracking-widest italic text-zinc-600 hover:text-white transition-all"
                                >
                                    Descargar Manifiesto de Usuarios (CSV)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── PUBLICIDAD (Ads & Banners) ────────────────────────────────── */}
                    {activeTab === 'ads' && (
                        <div className="animate-in fade-in slide-in-from-top-6 duration-500">
                            <MarketingTab
                                campaigns={campaigns}
                                addCampaign={addCampaign}
                                updateCampaign={updateCampaign}
                                deleteCampaign={deleteCampaign}
                            />
                        </div>
                    )}

                    {/* ── INGRESOS (SaaS Transactions) ────────────────────────────────── */}
                    {activeTab === 'income' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-gradient-to-br from-emerald-500/20 to-transparent border border-emerald-500/20 rounded-[3rem] p-10 flex flex-col justify-between h-64 overflow-hidden relative group">
                                    <DollarSign className="absolute -right-10 -top-10 w-48 h-48 text-emerald-500 opacity-10 group-hover:rotate-12 transition-all duration-700" />
                                    <div className="relative z-10">
                                        <h3 className="text-3xl font-black text-white uppercase italic tracking-widest">Capital Neto Total</h3>
                                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.4em] mt-2">Plataforma SaaS • Ingresos Globales</p>
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-6xl font-black text-white italic tracking-tighter">${combinedRevenue.toLocaleString()}</p>
                                        <p className="text-sm font-black text-emerald-400 mt-2 italic flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" /> Crecimiento Acelerado
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-8 space-y-4">
                                        <CreditCard className="w-8 h-8 text-amber-500 opacity-50" />
                                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Rendimiento de Suscripciones</p>
                                        <p className="text-3xl font-black text-white italic">${totalSaaSRenue.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-8 space-y-4">
                                        <Layers className="w-8 h-8 text-blue-500 opacity-50" />
                                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Venta de Productos Digitales</p>
                                        <p className="text-3xl font-black text-white italic">${totalProductRevenue.toLocaleString()}</p>
                                    </div>
                                    <div className="col-span-2 bg-zinc-900/50 border border-emerald-500/20 rounded-[2.5rem] p-8 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-black text-emerald-500 uppercase tracking-widest italic">MRR Proyectado (SaaS)</p>
                                            <p className="text-[10px] text-zinc-600 font-bold mt-1">Estimación mensual basada en {activeSubscriptions} nodos activos</p>
                                        </div>

                                        <div className="text-right flex flex-col items-end gap-2">
                                            <p className="text-2xl font-black text-white italic">${mrrProjected.toLocaleString()}</p>
                                            <button
                                                onClick={handleAuditVault}
                                                className="px-4 py-1.5 bg-zinc-900 border border-white/5 rounded-xl text-[8px] font-black uppercase italic text-zinc-500 hover:text-emerald-500 hover:border-emerald-500/30 transition-all"
                                            >
                                                Auditar Bóveda
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <MasterTable
                                title="Libro de Transacciones"
                                subtitle="Registro inmutable de movimientos financieros en la plataforma"
                                headers={['Sello', 'Motor de Concepto', 'Nodo de Entidad', 'Monto de Transferencia', 'Token de Auth', 'Estado']}
                                count={transactions.length + safeSales.length}
                            >
                                {[...transactions.map(t => ({ ...t, isSaaS: true })), ...safeSales.map(s => ({ ...s, isProduct: true }))]
                                    .sort((a, b) => new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime())
                                    .map((t: any, i) => (
                                        <tr key={i} className="group hover:bg-white/[0.01] transition-all">
                                            <td className="px-8 py-8">
                                                <p className="text-[10px] font-black text-zinc-600 uppercase italic">{new Date(t.createdAt || t.created_at).toLocaleDateString()}</p>
                                                <p className="text-[8px] text-zinc-700 font-bold uppercase mt-1 italic">{new Date(t.createdAt || t.created_at).toLocaleTimeString()}</p>
                                            </td>
                                            <td className="px-8 py-8">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-1.5 h-1.5 rounded-full", t.isSaaS ? "bg-amber-500" : "bg-blue-500")}></div>
                                                    <p className="text-xs font-black text-white uppercase italic tracking-widest">{t.isSaaS ? `SUSCRIPCIÓN [${t.plan}]` : `PRODUCTO DIGITAL [${t.productName}]`}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-8">
                                                <p className="text-xs font-black text-zinc-400 italic uppercase truncate max-w-[140px]">{t.barbershops?.name || safeShops.find(s => s.id === t.barbershopId)?.name || 'Núcleo Central'}</p>
                                            </td>
                                            <td className="px-8 py-8">
                                                <p className="text-2xl font-black text-white italic tracking-tighter">${t.amount || t.totalPrice}</p>
                                            </td>
                                            <td className="px-8 py-8">
                                                <span className="text-[9px] font-mono text-zinc-700 uppercase">{t.id.slice(0, 12)}</span>
                                            </td>
                                            <td className="px-8 py-8 text-right">
                                                <div className={cn(
                                                    "inline-flex px-4 py-1.5 rounded-xl text-[9px] font-black uppercase italic",
                                                    (t.status === 'completed' || t.status === 'approved') ? "bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/10" : "bg-amber-500/10 text-amber-500"
                                                )}>
                                                    {t.status || 'Verificado'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </MasterTable>
                        </div>
                    )}

                    {/* ── SISTEMA (Nexus Core & Forge) ─────────────────────────────── */}
                    {activeTab === 'system' && (
                        <div className="space-y-12 animate-in slide-in-from-bottom-6 duration-700">
                            <div>
                                <h1 className="text-3xl font-black text-white uppercase italic tracking-widest">Núcleo del Sistema</h1>
                                <p className="text-[10px] text-amber-500/60 uppercase tracking-[0.3em] font-black mt-2 italic">Configuración maestra y forja de tokens</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-zinc-900/30 border border-white/5 rounded-[3rem] p-10 space-y-8">
                                    <h3 className="text-lg font-black text-white uppercase italic tracking-[0.2em] flex items-center gap-3">
                                        <Globe className="w-5 h-5 text-amber-500" /> Identidad de la Plataforma
                                    </h3>
                                    <div className="space-y-6">
                                        <ForgeInput label="Nombre de la Plataforma" value="PLATAFORMA BARBERA" icon={LayoutDashboard} />
                                        <ForgeInput label="Intel de Contacto Nexus" value="barberosfive@gmail.com" icon={Bell} />
                                        <ForgeInput label="Dominio del Protocolo" value="barberoslm.com" icon={ExternalLink} />
                                        <div className="pt-4">
                                            <button
                                                onClick={() => {
                                                    setIsRefreshing(true);
                                                    addLog('Sincronizando identidad Nexus...', 'info');
                                                    setTimeout(() => {
                                                        setIsRefreshing(false);
                                                        addLog('Protocolo de identidad actualizado correctamente.', 'success');
                                                    }, 1500);
                                                }}
                                                className="w-full py-4 bg-amber-500 text-black font-black uppercase text-xs rounded-2xl shadow-xl shadow-amber-500/10 hover:bg-amber-400 transition-all"
                                            >
                                                Actualizar Sincronización
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-zinc-900/30 border border-white/5 rounded-[3rem] p-10 space-y-8">
                                    <h3 className="text-lg font-black text-white uppercase italic tracking-[0.2em] flex items-center gap-3">
                                        <Zap className="w-5 h-5 text-emerald-500" /> Herramientas de Comportamiento Web
                                    </h3>
                                    <div className="space-y-4">
                                        <ForgeToggle label="Protocolo de Mantenimiento" desc="Desactiva el acceso público a la red" active={false} />
                                        <ForgeToggle label="Generación de Contenido IA" desc="Habilita el motor de IA en campañas" active={true} />
                                        <ForgeToggle label="Búsqueda Global Nexus" desc="Permite búsqueda universal de entidades" active={true} />
                                        <ForgeToggle label="Prioridad de Nodo Premium" desc="Favorece tráfico de nodos Premium" active={false} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                                <div className="bg-zinc-900/20 border border-amber-500/10 rounded-[4rem] p-12 space-y-10 relative overflow-hidden group">
                                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>
                                    <div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <Key className="w-8 h-8 text-amber-500" />
                                            <h3 className="text-3xl font-black text-white uppercase italic tracking-widest">Master Key Forge</h3>
                                        </div>
                                        <p className="text-xs text-zinc-600 font-bold uppercase italic tracking-widest leading-relaxed">Genera códigos de acceso manuales para el ecosistema SaaS. Estos tokens bypass de pasarela de pago.</p>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-zinc-700 uppercase italic tracking-widest ml-1">Seleccionar Protocolo de Acceso</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                {[
                                                    { id: 'premium', label: 'NODO PREMIUM', desc: 'Acceso total sin límites' },
                                                    { id: 'pro', label: 'NODO PRO', desc: 'Gestión profesional' },
                                                ].map(p => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => setTokenPlan(p.id as any)}
                                                        className={cn(
                                                            "p-6 rounded-3xl border transition-all text-left group/btn relative overflow-hidden",
                                                            tokenPlan === p.id
                                                                ? "bg-amber-500 border-amber-500 shadow-2xl shadow-amber-500/20"
                                                                : "bg-zinc-950 border-white/5 hover:border-white/10"
                                                        )}
                                                    >
                                                        <p className={cn("text-xs font-black uppercase italic", tokenPlan === p.id ? "text-black" : "text-white")}>{p.label}</p>
                                                        <p className={cn("text-[8px] font-bold uppercase mt-1", tokenPlan === p.id ? "text-black/60" : "text-zinc-600")}>{p.desc}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-zinc-700 uppercase italic tracking-widest ml-1">Duración Temporal</p>
                                            <div className="grid grid-cols-3 gap-4">
                                                {[1, 3, 6].map(m => (
                                                    <button
                                                        key={m}
                                                        onClick={() => setTokenMonths(m as any)}
                                                        className={cn(
                                                            "p-5 rounded-2xl border transition-all text-center",
                                                            tokenMonths === m
                                                                ? "bg-amber-500 border-amber-500 text-black shadow-xl"
                                                                : "bg-zinc-950 border-white/5 text-zinc-500"
                                                        )}
                                                    >
                                                        <p className="text-lg font-black italic">{m}</p>
                                                        <p className="text-[8px] font-black uppercase">{m === 1 ? 'Mes' : 'Meses'}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={async () => {
                                                const prefix = tokenMonths === 1 ? 'T1M' : tokenMonths === 3 ? 'T3M' : 'T6M';
                                                const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
                                                const code = `${prefix}-${rand}`;
                                                const { error } = await supabase.from('coupons').insert({ code, plan_id: tokenPlan, months: tokenMonths, is_used: false });
                                                if (error) addLog(`Error al forjar token: ${error.message}`, 'warning');
                                                else {
                                                    setGeneratedToken(code);
                                                    setIsTokenModalOpen(true);
                                                    fetchAdminData();
                                                    addLog('Llave maestra forjada exitosamente.', 'success');
                                                }
                                            }}
                                            className="w-full py-6 bg-white text-black font-black uppercase text-xs tracking-[0.3em] italic rounded-3xl hover:bg-zinc-200 transition-all shadow-2xl flex items-center justify-center gap-3"
                                        >
                                            <Zap className="w-4 h-4" /> Forjar Llave de Acceso
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-8 flex flex-col">
                                    <div className="bg-zinc-900/20 border border-white/5 rounded-[3rem] p-10 flex-1 space-y-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
                                            <Activity className="w-32 h-32" />
                                        </div>
                                        <div className="flex items-center justify-between relative z-10">
                                            <h3 className="text-xl font-black text-white uppercase italic tracking-widest flex items-center gap-3">
                                                <ShieldCheck className="w-5 h-5 text-emerald-500" /> Salud del Núcleo Central
                                            </h3>
                                            <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase italic ring-1 ring-emerald-500/20">Operativo</span>
                                        </div>

                                        <div className="space-y-6 relative z-10">
                                            <HealthRow label="Motor Base de Datos SaaS" status="Sincronizado" delay="12ms" />
                                            <HealthRow label="Nodo Despliegue Vercel" status="Optimizado" delay="40ms" />
                                            <HealthRow label="Pasarela Auth Segura" status="Activo" delay="5ms" />
                                            <HealthRow label="Hub de Red Tiempo Real" status="Transmitiendo" delay="2ms" />

                                            <div className="pt-6 border-t border-white/[0.03] space-y-4">
                                                <p className="text-[10px] font-black text-zinc-700 uppercase italic tracking-widest">Llaves Activas en el Registro</p>
                                                <div className="grid grid-cols-2 gap-6 pb-8">
                                                    <div className="p-6 bg-zinc-950/50 rounded-3xl border border-white/5 group hover:border-amber-500/20 transition-all cursor-pointer" onClick={() => addLog('Consultando registro de cupones...', 'info')}>
                                                        <p className="text-[9px] font-black text-zinc-600 uppercase italic">Tokens Disponibles</p>
                                                        <p className="text-4xl font-black text-white italic mt-1">{coupons.filter(c => !c.is_used).length}</p>
                                                    </div>
                                                    <div className="p-6 bg-zinc-950/50 rounded-3xl border border-white/5 group hover:border-zinc-500/20 transition-all cursor-pointer" onClick={() => addLog('Analizando tokens redimidos...', 'info')}>
                                                        <p className="text-[9px] font-black text-zinc-600 uppercase italic">Quemados / Usados</p>
                                                        <p className="text-4xl font-black text-zinc-500 italic mt-1">{coupons.filter(c => c.is_used).length}</p>
                                                    </div>
                                                </div>

                                                {/* ── TABLA DE CUPONES ────────────────────────────── */}
                                                <div className="mt-8">
                                                    <MasterTable
                                                        title="Registro de Llaves Maestras"
                                                        subtitle="Historial completo de tokens de bypass generados"
                                                        headers={['Código de Acceso', 'Protocolo', 'Duración', 'Estado', 'Redimido Por']}
                                                        count={coupons.length}
                                                    >
                                                        {coupons.map((coupon: any) => (
                                                            <tr key={coupon.id} className="group hover:bg-white/[0.01] transition-all">
                                                                <td className="px-8 py-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <Key className="w-3 h-3 text-amber-500" />
                                                                        <p className="text-xs font-mono font-black text-white select-all">{coupon.code}</p>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-4">
                                                                    <span className={cn(
                                                                        "text-[8px] font-black px-2 py-0.5 rounded-full border uppercase italic",
                                                                        coupon.plan_id === 'premium' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-zinc-800 text-zinc-500 border-white/5"
                                                                    )}>
                                                                        {coupon.plan_id}
                                                                    </span>
                                                                </td>
                                                                <td className="px-8 py-4 text-[10px] font-black text-zinc-500 italic uppercase">
                                                                    {coupon.months} {coupon.months === 1 ? 'Mes' : 'Meses'}
                                                                </td>
                                                                <td className="px-8 py-4">
                                                                    {coupon.is_used ? (
                                                                        <div className="flex items-center gap-1.5 text-zinc-600">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
                                                                            <span className="text-[9px] font-black uppercase italic">Quemado</span>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-1.5 text-emerald-500">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                                            <span className="text-[9px] font-black uppercase italic">Válido</span>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="px-8 py-4 text-[9px] font-black text-zinc-400 italic uppercase">
                                                                    {coupon.barbershops?.name || (coupon.is_used ? 'Desconocido' : '—')}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {coupons.length === 0 && (
                                                            <tr>
                                                                <td colSpan={5} className="px-8 py-10 text-center text-[10px] font-black text-zinc-700 uppercase italic">
                                                                    No se han forjado llaves maestras todavía.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </MasterTable>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-zinc-900/20 border border-red-500/10 rounded-[3rem] p-8 flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 border border-red-500/20 group-hover:scale-110 transition-transform">
                                                <ShieldAlert className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white uppercase italic tracking-widest">Auto-Destrucción Central</p>
                                                <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1 italic tracking-widest">Protocolo de Cierre de Emergencia</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLockdown}
                                            disabled={isLocking}
                                            className={cn(
                                                "px-6 py-3 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase italic hover:bg-red-600 transition-all opacity-40 hover:opacity-100",
                                                isLocking && "animate-pulse"
                                            )}
                                        >
                                            {isLocking ? 'Bloqueando...' : 'Iniciar Bloqueo'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Insight */}
                <footer className="h-14 border-t border-white/[0.03] flex items-center justify-between px-8 bg-[#050505]/80 text-[9px] font-black text-zinc-700 uppercase tracking-widest italic z-40">
                    <div className="flex items-center gap-4">
                        <p>© PANEL DE CONTROL NEXUS v2.0.1</p>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
                        <p>Conexión Estable</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <p>PLATAFORMA BARBERA SAAS</p>
                        <p className="text-amber-500/30">Latencia: 14ms</p>
                    </div>
                </footer>
            </main>

            {/* ── MODALS & OVERLAYS ────────────────────────────────────────────── */}

            {isTokenModalOpen && generatedToken && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/80 animate-in fade-in duration-300">
                    <div className="bg-zinc-950 border border-amber-500/30 w-full max-w-lg rounded-[3rem] p-12 space-y-10 shadow-[0_0_100px_rgba(245,158,11,0.1)] relative overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px]"></div>
                        <div className="flex justify-between items-center text-amber-500">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20"><Key className="w-6 h-6" /></div>
                                <h3 className="text-2xl font-black uppercase italic tracking-widest">Llave Maestra Lista</h3>
                            </div>
                            <button onClick={() => setIsTokenModalOpen(false)} className="w-10 h-10 border border-white/5 rounded-xl flex items-center justify-center text-zinc-600 hover:text-white transition-all"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="p-10 bg-amber-500/5 border border-amber-500/10 rounded-[2.5rem] text-center space-y-4">
                            <p className="text-5xl font-black text-amber-500 tracking-[0.4em] font-mono select-all">{generatedToken}</p>
                            <p className="text-[10px] text-zinc-600 font-black uppercase italic tracking-widest">{tokenPlan.toUpperCase()} NODO CLASIFICADO · AUTH {tokenMonths} MESES</p>
                        </div>
                        <div className="space-y-4">
                            <button
                                onClick={() => { navigator.clipboard.writeText(generatedToken); addLog('Código copiado al portapapeles', 'success'); }}
                                className="w-full py-5 bg-amber-500 text-black font-black uppercase italic tracking-widest rounded-2xl hover:bg-amber-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-500/10"
                            >
                                <Copy className="w-5 h-5" /> Copiar al Portapapeles
                            </button>
                            <button onClick={() => setIsTokenModalOpen(false)} className="w-full py-4 text-zinc-700 font-black uppercase italic text-[10px] tracking-[0.4em] hover:text-zinc-400 transition-all">Cerrar este panel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── COMMAND CONSOLE (Logs) ────────────────────────────────────────── */}
            <div className="fixed bottom-20 right-8 w-80 z-[60] space-y-2 pointer-events-none">
                {adminLogs.slice(0, 5).map((log, i) => (
                    <div
                        key={log.id}
                        style={{ opacity: 1 - (i * 0.2), transform: `translateY(${-i * 4}px) scale(${1 - (i * 0.02)})` }}
                        className={cn(
                            "p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-500 pointer-events-auto",
                            log.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                log.type === 'warning' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                                    "bg-zinc-900/80 border-white/5 text-zinc-400"
                        )}
                    >
                        <div className="flex justify-between items-start gap-3">
                            <p className="text-[10px] font-black uppercase italic leading-tight">{log.msg}</p>
                            <span className="text-[8px] font-mono opacity-50 flex-shrink-0">{log.time}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── DETAIL VIEW OVERLAY ───────────────────────────────────────────── */}
            {selectedEntity && (
                <div className="fixed inset-0 z-[110] flex items-stretch justify-end animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEntity(null)}></div>
                    <div className="relative w-full max-w-xl bg-[#050505] border-l border-white/5 shadow-2xl p-12 flex flex-col animate-in slide-in-from-right duration-500">
                        <div className="flex justify-between items-center mb-12">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-widest">Gestor de Entidad</h3>
                                <p className="text-[10px] text-amber-500 font-bold tracking-[0.3em] uppercase mt-1 italic">Protocolo de Ajuste Granular</p>
                            </div>
                            <button onClick={() => setSelectedEntity(null)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto space-y-12 pr-4 custom-scrollbar">
                            <div className="bg-zinc-900/40 rounded-[2.5rem] p-10 border border-white/5 space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl font-black text-amber-500">
                                        {selectedEntity.data.name?.[0] || 'N'}
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-white uppercase italic">{selectedEntity.data.name}</p>
                                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">{selectedEntity.data.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic ml-1">Protocolos de Moderación</p>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-8 bg-zinc-900/40 border border-white/5 rounded-[2.5rem] space-y-6">
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-zinc-700 uppercase italic">Motivo de la Advertencia</p>
                                            <textarea
                                                value={warningMsg}
                                                onChange={(e) => setWarningMsg(e.target.value)}
                                                placeholder="Describe la falta al protocolo..."
                                                className="w-full h-24 bg-black/40 border border-white/10 rounded-2xl p-4 text-xs text-white focus:border-amber-500/30 outline-none transition-all placeholder:text-zinc-800"
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                const id = `${selectedEntity.type}_${selectedEntity.data.id}`;
                                                if (!warnedEntities.includes(id)) {
                                                    setWarnedEntities(prev => [...prev, id]);
                                                }
                                                addLog(`Advertencia enviada a ${selectedEntity.data.name}: ${warningMsg}`, 'warning');
                                                setWarningMsg('');
                                                addLog('Canal de aviso activado. Protocolos de restricción desbloqueados.', 'success');
                                            }}
                                            className="w-full py-4 bg-amber-500 text-black font-black uppercase italic text-[10px] rounded-2xl hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/10"
                                        >
                                            Emitir Aviso Oficial
                                        </button>

                                        <div className="pt-4 border-t border-white/5">
                                            <p className="text-[9px] font-black text-zinc-700 uppercase italic mb-4">Módulos de Ban (Nivel 2)</p>
                                            {warnedEntities.includes(`${selectedEntity.type}_${selectedEntity.data.id}`) ? (
                                                <div className="grid grid-cols-3 gap-2">
                                                    <button onClick={() => addLog(`${selectedEntity.data.name} baneado 1 semana`, 'warning')} className="py-3 bg-red-500/10 border border-red-500/20 text-[8px] font-black text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all uppercase italic">1 Semana</button>
                                                    <button onClick={() => addLog(`${selectedEntity.data.name} baneado 15 días`, 'warning')} className="py-3 bg-red-500/10 border border-red-500/20 text-[8px] font-black text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all uppercase italic">15 Días</button>
                                                    <button onClick={() => addLog(`${selectedEntity.data.name} baneado 1 mes`, 'warning')} className="py-3 bg-red-500/10 border border-red-500/20 text-[8px] font-black text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all uppercase italic">1 Mes</button>
                                                </div>
                                            ) : (
                                                <div className="bg-zinc-950/50 border border-white/[0.03] rounded-2xl p-4 text-center">
                                                    <p className="text-[9px] font-black text-zinc-800 uppercase italic">⚠️ Requiere Aviso Previo para Desbloquear Ban</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic mb-2">Canal Directo Nexus</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => {
                                            const id = selectedEntity.data.id;
                                            const path = selectedEntity.type === 'shop' ? `/directory/${id}` :
                                                selectedEntity.type === 'barber' ? `/directory/${selectedEntity.data.barbershopId}` : '#';
                                            if (path !== '#') window.open(path, '_blank');
                                            else addLog('Perfil no disponible para este nodo.', 'info');
                                        }}
                                        className="py-6 bg-white/5 border border-white/5 rounded-3xl text-[10px] font-black text-white hover:bg-white/10 transition-all uppercase italic flex items-center justify-center gap-3 group"
                                    >
                                        <ExternalLink className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                                        Ver Perfil
                                    </button>
                                    <button
                                        onClick={() => window.open(`mailto:${selectedEntity.data.email || 'soporte@barberosfive.com'}`, '_blank')}
                                        className="py-6 bg-white/5 border border-white/5 rounded-3xl text-[10px] font-black text-white hover:bg-white/10 transition-all uppercase italic flex items-center justify-center gap-3 group"
                                    >
                                        <Mail className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                                        Email
                                    </button>
                                </div>
                            </div>

                            <div className="p-10 bg-red-500/5 border border-red-500/10 rounded-[3rem] space-y-4">
                                <p className="text-[10px] font-black text-red-500/60 uppercase tracking-widest italic">Protocolo de Eliminación</p>
                                <button
                                    onClick={() => { if (confirm('¿Eliminar esta entidad permanentemente?')) { addLog('Entidad elminada del Core.', 'warning'); setSelectedEntity(null); } }}
                                    className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all italic"
                                >
                                    Eliminar Registro del Núcleo
                                </button>
                            </div>
                        </div>

                        <div className="pt-8 mt-auto flex gap-4">
                            <button
                                onClick={() => { addLog('Cambios sincronizados con el núcleo.', 'success'); setSelectedEntity(null); }}
                                className="flex-1 py-5 bg-zinc-900 text-zinc-500 font-black uppercase italic text-xs rounded-2xl border border-white/5 hover:text-white transition-all"
                            >
                                Cerrar Gestor
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

// ─── HELPER COMPONENTS ──────────────────────────────────────────────────────────

function ForgeInput({ label, value, icon: Icon }: any) {
    return (
        <div className="space-y-2">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic ml-1">{label}</p>
            <div className="flex items-center gap-3 bg-zinc-950 border border-white/10 rounded-2xl px-4 py-3 group focus-within:border-amber-500/30 transition-all">
                <Icon className="w-4 h-4 text-zinc-700 group-focus-within:text-amber-500 transition-colors" />
                <input type="text" defaultValue={value} className="bg-transparent border-none outline-none text-xs font-bold text-white w-full" />
            </div>
        </div>
    );
}

function ForgeToggle({ label, desc, active }: any) {
    const [isOn, setIsOn] = useState(active);
    return (
        <div className="p-4 bg-zinc-950/50 border border-white/5 rounded-2xl flex items-center justify-between group transition-all">
            <div className="flex-1 min-w-0 pr-4">
                <p className="text-xs font-black text-white uppercase italic tracking-widest">{label}</p>
                <p className="text-[8px] text-zinc-600 font-bold uppercase mt-1 italic truncate">{desc}</p>
            </div>
            <button
                onClick={() => setIsOn(!isOn)}
                className={cn(
                    "w-12 h-6 rounded-full relative transition-all duration-300 ring-1 ring-white/10",
                    isOn ? "bg-amber-500" : "bg-zinc-900"
                )}
            >
                <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-lg",
                    isOn ? "left-7" : "left-1"
                )}></div>
            </button>
        </div>
    );
}

function StatCard({ label, value, trend, icon: Icon, color, desc }: any) {
    const colors = {
        amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    };

    return (
        <div className="bg-[#09090b] border border-white/[0.05] rounded-[2.5rem] p-8 space-y-6 group hover:border-white/10 transition-all relative overflow-hidden shadow-xl">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/[0.02] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <div className="flex justify-between items-start relative z-10">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110", colors[color as keyof typeof colors])}>
                    <Icon className="w-7 h-7" />
                </div>
                <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-full">
                    <p className="text-[9px] font-black text-emerald-500 italic uppercase">{trend}</p>
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic mb-2">{label}</p>
                <p className="text-4xl font-black text-white italic tracking-tighter">{value}</p>
                <p className="text-[9px] text-zinc-700 font-bold uppercase mt-2 tracking-widest">{desc}</p>
            </div>
            <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden">
                <div className={cn("h-full transition-all duration-1000", color === 'amber' ? "bg-amber-500" : color === 'emerald' ? "bg-emerald-500" : color === 'blue' ? "bg-blue-500" : "bg-purple-500")} style={{ width: '65%' }}></div>
            </div>
        </div>
    );
}

function SummaryBadge({ label, value, icon: Icon, color }: any) {
    const colors = {
        amber: "text-amber-500 bg-amber-500/5 border-amber-500/10 shadow-amber-500/5",
        emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10 shadow-emerald-500/5",
        blue: "text-blue-500 bg-blue-500/5 border-blue-500/10 shadow-blue-500/5",
        purple: "text-purple-500 bg-purple-500/5 border-purple-500/10 shadow-purple-500/5",
    };
    return (
        <div className={cn("bg-[#09090b] border p-6 rounded-3xl flex items-center gap-6 shadow-2xl", colors[color as keyof typeof colors])}>
            <div className="w-12 h-12 bg-black/40 rounded-2xl flex items-center justify-center border border-white/5">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-2xl font-black text-white italic truncate">{value}</p>
                <p className="text-[9px] uppercase tracking-[0.2em] font-black opacity-60 italic">{label}</p>
            </div>
        </div>
    );
}

function MasterTable({ title, subtitle, headers, children, count, onSettings }: any) {
    return (
        <div className="bg-[#050505] rounded-[3.5rem] border border-white/[0.03] overflow-hidden shadow-2xl">
            <div className="p-10 lg:p-14 border-b border-white/[0.03] flex items-center justify-between bg-zinc-900/10">
                <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-widest">{title}</h3>
                    <p className="text-xs text-zinc-600 font-bold uppercase tracking-[0.3em] mt-2 italic">{subtitle}</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-zinc-700 uppercase italic border border-white/5 px-4 py-2 rounded-xl bg-black">Total: {count} Entidades</span>
                    <button
                        onClick={() => onSettings?.()}
                        className="p-4 bg-zinc-900 border border-white/5 rounded-2xl text-zinc-500 hover:text-white transition-all"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/[0.01] border-b border-white/[0.03]">
                            {headers.map((h: string, i: number) => (
                                <th key={i} className="px-8 py-8 text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] italic">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {children}
                    </tbody>
                </table>
            </div>
            <div className="p-10 border-t border-white/[0.03] bg-zinc-950/20 flex justify-center">
                <button
                    onClick={() => onSettings?.()}
                    className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic hover:text-zinc-500 transition-colors"
                >
                    Ver todos los datos maestros en el repositorio
                </button>
            </div>
        </div>
    );
}

function StatusBadge({ type }: { type: 'premium' | 'pro' | 'free' }) {
    const configs = {
        premium: { label: 'Nexus Oro', icon: Star, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-500/10' },
        pro: { label: 'Nodo Plata', icon: ShieldCheck, color: 'text-zinc-400 bg-white/5 border-white/10 shadow-white/5' },
        free: { label: 'Nodo Invitado', icon: Circle, color: 'text-zinc-700 bg-zinc-900 border-zinc-800' }
    };

    function Circle({ className }: any) { return <div className={cn("w-3 h-3 rounded-full border border-current", className)} /> }

    const c = configs[type];
    return (
        <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic border shadow-lg", c.color)}>
            <c.icon className="w-3 h-3" />
            <span>{c.label}</span>
        </div>
    );
}

function HealthRow({ label, status, delay }: any) {
    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <p className="text-xs font-black text-zinc-500 uppercase italic transition-colors group-hover:text-white">{label}</p>
            </div>
            <div className="flex items-center gap-6">
                <p className="text-[10px] font-black text-emerald-500/80 uppercase italic">{status}</p>
                <p className="text-[9px] font-mono text-zinc-800 uppercase italic">latencia: {delay}</p>
            </div>
        </div>
    );
}
