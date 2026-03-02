import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Scissors, Mail, MessageCircle, ArrowLeft, Send, CheckCircle,
    Clock, MapPin, ExternalLink, Sparkles, Phone, Instagram
} from 'lucide-react';

const CONTACT_METHODS = [
    {
        icon: Mail,
        title: 'Email Principal',
        value: 'barberosfive@gmail.com',
        desc: 'Respondemos en menos de 24 horas hábiles',
        href: 'mailto:barberosfive@gmail.com',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        btnColor: 'bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20',
        label: 'Enviar Email',
    },
    {
        icon: MessageCircle,
        title: 'WhatsApp',
        value: '+52 (Próximamente)',
        desc: 'Soporte rápido vía WhatsApp para suscriptores activos',
        href: '#',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        btnColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20',
        label: 'Abrir WhatsApp',
    },
    {
        icon: Instagram,
        title: 'Instagram',
        value: '@barberosfive',
        desc: 'Síguenos para novedades, tutoriales y actualizaciones',
        href: 'https://instagram.com/barberosfive',
        color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
        btnColor: 'bg-pink-500/10 border-pink-500/20 text-pink-300 hover:bg-pink-500/20',
        label: 'Ver Instagram',
    },
];

const FAQS = [
    {
        q: '¿Puedo probar la plataforma gratis?',
        a: 'Sí. Ofrecemos un plan gratuito con funciones básicas. Puedes registrarte en cualquier momento desde nuestra página principal.',
    },
    {
        q: '¿Cuánto tiempo tardan en responder los correos?',
        a: 'Nuestro equipo responde en un máximo de 24 horas hábiles (lunes a viernes). Para urgencias, usa el canal de WhatsApp.',
    },
    {
        q: '¿Puedo solicitar una demo personalizada?',
        a: 'Por supuesto. Escríbenos al email indicando "Solicitud de Demo" en el asunto y coordinaremos una reunión virtual.',
    },
    {
        q: '¿Tienen soporte en español?',
        a: 'Sí, todo nuestro soporte es 100% en español. Estamos basados en México y atendemos a toda Latinoamérica.',
    },
];

const TOPICS = [
    'Soporte técnico',
    'Preguntas sobre planes',
    'Reportar un problema',
    'Solicitar demo',
    'Publicidad / Anunciantes',
    'Otro',
];

export default function ContactUs() {
    const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' });
    const [sent, setSent] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Construir el mailto con los datos del formulario
        const subject = encodeURIComponent(`[BarberOs LM] ${form.topic || 'Consulta'} - ${form.name}`);
        const body = encodeURIComponent(
            `Nombre: ${form.name}\nEmail: ${form.email}\nAsunto: ${form.topic}\n\nMensaje:\n${form.message}`
        );
        window.location.href = `mailto:barberosfive@gmail.com?subject=${subject}&body=${body}`;
        setSent(true);
        setTimeout(() => setSent(false), 5000);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Header */}
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
            <section className="relative overflow-hidden py-20 px-6">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute top-1/3 left-1/3 h-80 w-80 rounded-full bg-blue-500/8 blur-[100px]" />
                    <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-amber-500/5 blur-[80px]" />
                </div>
                <div className="relative mx-auto max-w-4xl text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest mb-6">
                        <Sparkles className="h-3 w-3" />
                        Estamos aquí para ayudarte
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-black uppercase italic tracking-tighter leading-none mb-6">
                        Contáct<span className="text-amber-400">anos</span>
                    </h1>
                    <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
                        ¿Tienes preguntas, necesitas soporte o quieres anunciarte con nosotros?
                        Nuestro equipo está listo para ayudarte.
                    </p>
                </div>
            </section>

            {/* Contact Methods */}
            <section className="px-6 pb-10">
                <div className="mx-auto max-w-5xl grid md:grid-cols-3 gap-5">
                    {CONTACT_METHODS.map((m) => (
                        <div key={m.title} className={`p-6 rounded-3xl border ${m.color} bg-zinc-900/50 flex flex-col gap-4`}>
                            <div className={`h-12 w-12 rounded-2xl ${m.color} flex items-center justify-center`}>
                                <m.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-white uppercase text-sm tracking-wide">{m.title}</h3>
                                <p className="font-bold text-base text-white mt-1">{m.value}</p>
                                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{m.desc}</p>
                            </div>
                            <a
                                href={m.href}
                                target={m.href.startsWith('http') ? '_blank' : undefined}
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all mt-auto ${m.btnColor}`}
                            >
                                {m.label} <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    ))}
                </div>
            </section>

            {/* Info badges */}
            <section className="px-6 pb-16">
                <div className="mx-auto max-w-5xl flex flex-wrap gap-4 justify-center">
                    {[
                        { icon: Clock, text: 'Respuesta en menos de 24h hábiles' },
                        { icon: MapPin, text: 'Basados en México · Atención en Español' },
                        { icon: Phone, text: 'Soporte disponible Lun–Vie 9am–6pm CST' },
                    ].map((b) => (
                        <div key={b.text} className="flex items-center gap-2 px-4 py-2 bg-zinc-900/60 border border-white/5 rounded-xl text-xs text-zinc-400 font-bold">
                            <b.icon className="h-3.5 w-3.5 text-zinc-600" />
                            {b.text}
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact Form + FAQ */}
            <section className="px-6 pb-20 bg-zinc-900/20 border-y border-white/5 py-16">
                <div className="mx-auto max-w-5xl grid lg:grid-cols-2 gap-12">
                    {/* Form */}
                    <div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tight mb-2">
                            Envía un Mensaje
                        </h2>
                        <p className="text-zinc-500 text-sm mb-8">
                            Completa el formulario y te responderemos a tu correo electrónico.
                        </p>

                        {sent ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                                <CheckCircle className="h-16 w-16 text-emerald-400" />
                                <h3 className="text-xl font-black text-white uppercase italic">¡Mensaje listo!</h3>
                                <p className="text-zinc-400 text-sm max-w-xs">
                                    Se abrió tu cliente de correo. Si no se abrió, escríbenos directamente a{' '}
                                    <strong className="text-amber-400">barberosfive@gmail.com</strong>
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                                            Tu nombre *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={form.name}
                                            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                            placeholder="Ej. Juan Pérez"
                                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 transition-all placeholder:text-zinc-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                                            Tu email *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={form.email}
                                            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                                            placeholder="tu@email.com"
                                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 transition-all placeholder:text-zinc-600"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                                        Asunto / Tema
                                    </label>
                                    <select
                                        value={form.topic}
                                        onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 transition-all"
                                    >
                                        <option value="">Selecciona un tema...</option>
                                        {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                                        Mensaje *
                                    </label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={form.message}
                                        onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                                        placeholder="Cuéntanos en qué podemos ayudarte..."
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 transition-all resize-none placeholder:text-zinc-600"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={!form.name || !form.email || !form.message}
                                    className="w-full py-4 bg-amber-500 text-zinc-900 font-black uppercase text-sm tracking-widest rounded-2xl hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Send className="h-4 w-4" />
                                    Enviar Mensaje
                                </button>

                                <p className="text-[10px] text-zinc-600 text-center">
                                    Al enviar aceptas nuestra{' '}
                                    <Link to="/privacy" className="text-zinc-400 hover:text-white underline">Política de Privacidad</Link>.
                                </p>
                            </form>
                        )}
                    </div>

                    {/* FAQ */}
                    <div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tight mb-2">
                            Preguntas Frecuentes
                        </h2>
                        <p className="text-zinc-500 text-sm mb-8">
                            Puede que ya tengamos la respuesta que buscas.
                        </p>
                        <div className="space-y-3">
                            {FAQS.map((faq, i) => (
                                <div
                                    key={i}
                                    className="border border-white/5 rounded-2xl overflow-hidden bg-zinc-900/60"
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                                    >
                                        <span className="text-sm font-bold text-white pr-4">{faq.q}</span>
                                        <span className={`text-amber-400 font-black text-xl flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                                    </button>
                                    {openFaq === i && (
                                        <div className="px-5 pb-5 border-t border-white/5">
                                            <p className="text-sm text-zinc-400 leading-relaxed pt-4">{faq.a}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                            <p className="text-xs text-amber-400 font-black uppercase tracking-widest mb-1">📧 Email Directo</p>
                            <p className="text-white font-bold">barberosfive@gmail.com</p>
                            <p className="text-xs text-zinc-500 mt-1">Para anunciantes y convenios comerciales, indícalo en el asunto.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8 px-6">
                <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-zinc-600">© {new Date().getFullYear()} BarberOs LM. Todos los derechos reservados.</p>
                    <div className="flex items-center gap-6">
                        <Link to="/about" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Acerca de</Link>
                        <Link to="/privacy" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Privacidad</Link>
                        <Link to="/terms" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Términos</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
