import { Link } from 'react-router-dom';
import {
    Scissors, Users, ShieldCheck, Zap, Star, Globe, ArrowLeft,
    CheckCircle, TrendingUp, HeartHandshake, Sparkles
} from 'lucide-react';

const TEAM = [
    {
        name: 'Equipo de Desarrollo',
        role: 'Ingeniería & Producto',
        emoji: '💻',
        desc: 'Apasionados por crear herramientas digitales que transforman negocios reales.',
    },
    {
        name: 'Soporte & Éxito',
        role: 'Atención al Cliente',
        emoji: '🎯',
        desc: 'Comprometidos a que cada barbería logre su máximo potencial con nuestra plataforma.',
    },
    {
        name: 'Diseño & UX',
        role: 'Experiencia de Usuario',
        emoji: '✨',
        desc: 'Construimos interfaces que son intuitivas, rápidas y hermosas en cualquier dispositivo.',
    },
];

const VALUES = [
    { icon: ShieldCheck, title: 'Confianza', desc: 'Tu información y la de tus clientes siempre está protegida con los más altos estándares de seguridad.' },
    { icon: Zap, title: 'Velocidad', desc: 'Sabemos que en una barbería el tiempo es dinero. Por eso todo en nuestra plataforma funciona en segundos.' },
    { icon: HeartHandshake, title: 'Comunidad', desc: 'No somos solo software. Somos aliados del negocio del barbero mexicano y latinoamericano.' },
    { icon: TrendingUp, title: 'Crecimiento', desc: 'Cada función que construimos tiene un objetivo: hacer crecer tu negocio y aumentar tus ingresos.' },
];

const STATS = [
    { value: '+35%', label: 'Crecimiento Ventas' },
    { value: '-10h', label: 'Ahorro Semanal' },
    { value: '4.9/5', label: 'Calificación VIP' },
    { value: '24/7', label: 'Soporte Técnico' },
];

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Header / Nav */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050505]/90 backdrop-blur-xl">
                <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Scissors className="h-5 w-5 text-zinc-900" />
                        </div>
                        <span className="font-black text-lg tracking-tight">Barber<span className="text-amber-400">Os</span> LM</span>
                    </Link>
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver al inicio
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <section className="relative overflow-hidden py-24 px-6">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />
                    <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-emerald-500/5 blur-[80px]" />
                </div>
                <div className="relative mx-auto max-w-4xl text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-widest mb-6">
                        <Sparkles className="h-3 w-3" />
                        Nuestra Historia
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-black uppercase italic tracking-tighter leading-none mb-6">
                        Sobre <span className="text-amber-400">Nosotros</span>
                    </h1>
                    <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto font-medium">
                        Somos <strong className="text-white">BarberOs LM</strong> — la plataforma de gestión integral diseñada
                        específicamente para barberías modernas. Nacimos con una misión clara: digitalizar y potenciar
                        cada barbería de habla hispana.
                    </p>
                </div>
            </section>

            {/* Stats */}
            <section className="border-y border-white/5 bg-zinc-900/30 py-12 px-6">
                <div className="mx-auto max-w-5xl grid grid-cols-2 sm:grid-cols-4 gap-8">
                    {STATS.map((s) => (
                        <div key={s.label} className="text-center">
                            <p className="text-4xl font-black text-amber-400 mb-1">{s.value}</p>
                            <p className="text-xs text-zinc-500 font-black uppercase tracking-widest">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Mission */}
            <section className="py-20 px-6">
                <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest mb-4">
                            <Globe className="h-4 w-4" />
                            Nuestra Misión
                        </div>
                        <h2 className="text-4xl font-black uppercase italic tracking-tight leading-tight mb-6">
                            El futuro del negocio <span className="text-emerald-400">barbero</span>
                        </h2>
                        <p className="text-zinc-400 leading-relaxed mb-6">
                            BarberOs LM nació de la necesidad real que tienen los dueños de barberías: administrar citas,
                            gestionar barberos, controlar ingresos y conectar con clientes — todo desde un solo lugar,
                            sin complicaciones.
                        </p>
                        <p className="text-zinc-400 leading-relaxed mb-8">
                            Entendemos el ritmo de una barbería porque trabajamos de cerca con sus dueños. Cada función
                            que lanzamos fue construida escuchando a la comunidad barbera.
                        </p>
                        <div className="space-y-3">
                            {[
                                'Sistema de citas online 24/7',
                                'Gestión de barberos y sillas',
                                'Reportes de ingresos en tiempo real',
                                'Widget de reservas personalizable',
                                'Marketing y campañas integradas',
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-3 text-sm text-zinc-300">
                                    <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        {VALUES.map((v) => (
                            <div key={v.title} className="flex gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-white/5 hover:border-amber-500/20 transition-all group">
                                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
                                    <v.icon className="h-6 w-6 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="font-black text-white uppercase text-sm tracking-wide mb-1">{v.title}</h3>
                                    <p className="text-xs text-zinc-500 leading-relaxed">{v.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-20 px-6 bg-zinc-900/20 border-y border-white/5">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-2 text-blue-400 text-xs font-black uppercase tracking-widest mb-4">
                            <Users className="h-4 w-4" />
                            Nuestro Equipo
                        </div>
                        <h2 className="text-4xl font-black uppercase italic tracking-tight">
                            Las personas detrás de la plataforma
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {TEAM.map((member) => (
                            <div key={member.name} className="p-8 rounded-3xl bg-zinc-900/80 border border-white/5 hover:border-white/10 transition-all text-center hover:shadow-xl">
                                <div className="text-5xl mb-4">{member.emoji}</div>
                                <h3 className="font-black text-white text-lg uppercase italic tracking-wide">{member.name}</h3>
                                <p className="text-xs text-amber-400 font-black uppercase tracking-widest mt-1 mb-3">{member.role}</p>
                                <p className="text-sm text-zinc-500 leading-relaxed">{member.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why trust us */}
            <section className="py-20 px-6">
                <div className="mx-auto max-w-4xl text-center">
                    <div className="inline-flex items-center gap-2 text-purple-400 text-xs font-black uppercase tracking-widest mb-4">
                        <Star className="h-4 w-4" />
                        ¿Por qué elegirnos?
                    </div>
                    <h2 className="text-4xl font-black uppercase italic tracking-tight mb-6">
                        Transparencia y <span className="text-purple-400">calidad</span>
                    </h2>
                    <p className="text-zinc-400 leading-relaxed text-lg max-w-2xl mx-auto mb-12">
                        En BarberOs LM nos comprometemos a operar con total transparencia. Somos respetuosos de
                        las políticas de publicidad, privacidad y seguridad tanto de nuestros usuarios como de
                        los servicios que integramos — incluyendo Google AdSense.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 text-zinc-900 font-black uppercase text-sm tracking-widest rounded-2xl hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20"
                        >
                            Contáctanos
                        </Link>
                        <Link
                            to="/privacy"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-800 text-white font-black uppercase text-sm tracking-widest rounded-2xl hover:bg-zinc-700 transition-all border border-white/5"
                        >
                            Política de Privacidad
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8 px-6">
                <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-zinc-600">© {new Date().getFullYear()} BarberOs LM. Todos los derechos reservados.</p>
                    <div className="flex items-center gap-6">
                        <Link to="/privacy" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Privacidad</Link>
                        <Link to="/terms" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Términos</Link>
                        <Link to="/contact" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Contacto</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
