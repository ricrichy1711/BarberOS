import { useState } from 'react';
import type { Campaign } from '@/types';
import {
    Sparkles, Plus, Eye, Trash2, Link, Image as ImageIcon,
    Tag, Megaphone, LayoutTemplate, Bell, Star, TrendingUp,
    Zap, X, ToggleLeft, ToggleRight, ExternalLink, Activity, CreditCard
} from 'lucide-react';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const COLORS: { id: Campaign['color']; label: string; bg: string; border: string; text: string; btn: string; glow: string; accent: string }[] = [
    { id: 'amber', label: '🔥 Ámbar Neón', bg: 'from-amber-600/40 to-amber-950/20', border: 'border-amber-500/50', text: 'text-amber-400', btn: 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]', glow: 'shadow-amber-500/30', accent: 'amber' },
    { id: 'blue', label: '💠 Azul Ártico', bg: 'from-blue-600/40 to-blue-950/20', border: 'border-blue-500/50', text: 'text-blue-400', btn: 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]', glow: 'shadow-blue-500/30', accent: 'blue' },
    { id: 'green', label: '🔫 Verde Cíber', bg: 'from-emerald-600/40 to-emerald-950/20', border: 'border-emerald-500/50', text: 'text-emerald-400', btn: 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]', glow: 'shadow-emerald-500/30', accent: 'emerald' },
    { id: 'purple', label: '👾 Púrpura Vacío', bg: 'from-purple-600/40 to-purple-950/20', border: 'border-purple-500/50', text: 'text-purple-400', btn: 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]', glow: 'shadow-purple-500/30', accent: 'purple' },
    { id: 'red', label: '🧨 Furia Carmesí', bg: 'from-red-600/40 to-red-950/20', border: 'border-red-500/50', text: 'text-red-400', btn: 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]', glow: 'shadow-red-500/30', accent: 'red' },
];

const STYLES: { id: Campaign['style']; label: string; icon: typeof Megaphone; desc: string }[] = [
    { id: 'banner', label: 'Impacto Superior', icon: LayoutTemplate, desc: 'Banner horizontal de alto impacto' },
    { id: 'card', label: 'Cubo de Cristal', icon: Star, desc: 'Tarjeta 3D con desenfoque' },
    { id: 'hero', label: 'Cinematográfico', icon: TrendingUp, desc: 'Pantalla completa con visuales' },
    { id: 'toast', label: 'Notificación Pulse', icon: Bell, desc: 'Alerta lateral dinámica' },
];

const TARGETS = [
    { id: 'all', label: '👥 Todos', desc: 'Dueños + Barberos + Clientes' },
    { id: 'owner', label: '🏠 Dueños', desc: 'Solo propietarios de barberías' },
    { id: 'barber', label: '✂️ Barberos', desc: 'Solo profesionales' },
    { id: 'client', label: '👤 Clientes', desc: 'Solo clientes finales' },
];

const PRIORITIES: { id: 1 | 2 | 3; label: string; color: string }[] = [
    { id: 1, label: 'Normal', color: 'text-zinc-400' },
    { id: 2, label: 'Alta', color: 'text-amber-400' },
    { id: 3, label: 'Urgente', color: 'text-red-400' },
];

const AI_TEMPLATES: Omit<Campaign, 'id' | 'createdAt'>[] = [
    { emoji: '✂️', color: 'amber', style: 'banner', target: 'all', priority: 2, title: '¡Oferta Flash de Corte!', message: 'El estilo que mereces, al precio que buscas. Agenda hoy y recibe 20% OFF en tu próximo corte.', linkText: 'Reservar', linkUrl: '', imageUrl: '', advertiser: '', isActive: true },
    { emoji: '🏆', color: 'blue', style: 'hero', target: 'owner', priority: 2, title: 'Lleva Tu Barbería al Siguiente Nivel', message: 'Plan Premium desbloqueado: reportes avanzados, citas ilimitadas y soporte VIP. Solo por tiempo limitado.', linkText: 'Ver Planes', linkUrl: '', imageUrl: '', advertiser: '', isActive: true },
    { emoji: '💰', color: 'green', style: 'card', target: 'barber', priority: 1, title: 'Triplica Tus Ingresos Este Mes', message: 'Activa tu perfil público y empieza a recibir clientes sin esfuerzo. El sistema trabaja por ti 24/7.', linkText: 'Activar Perfil', linkUrl: '', imageUrl: '', advertiser: '', isActive: true },
    { emoji: '⚡', color: 'purple', style: 'toast', target: 'all', priority: 3, title: 'Nueva Función: Citas Express', message: 'Agenda en 60 segundos desde cualquier dispositivo. Sin llamadas, sin esperas.', linkText: 'Probar', linkUrl: '', imageUrl: '', advertiser: '', isActive: true },
    { emoji: '🎁', color: 'red', style: 'banner', target: 'client', priority: 2, title: '¡Trae un Amigo y Ambos Ganan!', message: 'Comparte tu código y recibe un descuento especial en tu próximo servicio.', linkText: 'Compartir', linkUrl: '', imageUrl: '', advertiser: '', isActive: true },
    { emoji: '👑', color: 'amber', style: 'hero', target: 'all', priority: 1, title: 'Espacio Publicitario Disponible', message: 'Este banner llega a cientos de usuarios activos diariamente. Contáctanos para anunciarte aquí.', linkText: 'Contactar', linkUrl: '', imageUrl: '', advertiser: 'Tu Negocio', isActive: true },
    { emoji: '🔥', color: 'red', style: 'card', target: 'owner', priority: 3, title: 'Promo Exclusiva: Febrero Caliente', message: 'Solo este mes: plan Pro al precio de Basic. ¡Actúa antes que se agoten los cupos!', linkText: 'Aprovechar', linkUrl: '', imageUrl: '', advertiser: '', isActive: true },
    { emoji: '📱', color: 'blue', style: 'toast', target: 'all', priority: 1, title: 'Descarga Nuestra App Móvil', message: 'Gestiona citas, mensajes y reportes desde tu celular. ¡Disponible ya en tu tienda favorita!', linkText: 'Descargar', linkUrl: '', imageUrl: '', advertiser: '', isActive: true },
];

function getColor(id: Campaign['color']) { return COLORS.find(c => c.id === id) || COLORS[0]; }

// ─── Preview de Banner según estilo ────────────────────────────────────────────
function BannerPreview({ form }: { form: Partial<Campaign> }) {
    const col = getColor(form.color || 'amber');
    const title = form.title || 'Título de tu campaña';
    const message = form.message || 'Descripción de tu campaña aparecerá aquí.';
    const emoji = form.emoji || '📢';

    if (form.style === 'hero') return (
        <div className={`relative rounded-[2.5rem] overflow-hidden border ${col.border} shadow-2xl ${col.glow} group/hero`} style={{ minHeight: 180 }}>
            {form.imageUrl ? (
                <div className="absolute inset-0">
                    <img src={form.imageUrl} alt="" className="w-full h-full object-cover opacity-60 group-hover/hero:scale-105 transition-transform duration-700" />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent`} />
                </div>
            ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${col.bg}`} />
            )}
            <div className="relative z-10 p-10 flex flex-col justify-end h-full min-h-[180px]">
                <div className="mb-2">
                    {form.advertiser && <span className={`text-[10px] ${col.text} font-black uppercase tracking-[0.2em] mb-2 block`}>AD · {form.advertiser}</span>}
                    <h2 className={`text-3xl font-black uppercase italic ${col.text} tracking-tight leading-tight flex items-center gap-3`}>
                        <span className="text-4xl">{emoji}</span> {title}
                    </h2>
                    <p className="text-sm text-zinc-300 mt-2 max-w-lg font-bold leading-relaxed">{message}</p>
                </div>
                {form.linkUrl && (
                    <div className="mt-6">
                        <span className={`inline-flex px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest ${col.btn} transition-all hover:scale-105 active:scale-95`}>
                            {form.linkText || 'EXPLORAR AHORA'}
                        </span>
                    </div>
                )}
            </div>
            <div className={`absolute top-0 right-0 p-8 opacity-20 group-hover/hero:opacity-40 transition-all`}>
                <Sparkles className={`w-20 h-20 ${col.text}`} />
            </div>
        </div>
    );

    if (form.style === 'card') return (
        <div className={`rounded-[2.5rem] border ${col.border} shadow-2xl overflow-hidden bg-zinc-950/60 backdrop-blur-3xl group/card relative`}>
            {form.imageUrl && (
                <div className="relative h-40 overflow-hidden">
                    <img src={form.imageUrl} alt="" className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                </div>
            )}
            <div className="p-8 relative">
                {form.advertiser && <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block mb-4 italic">Estudio de Publicidad Premium · {form.advertiser}</span>}
                <div className={`w-14 h-14 rounded-2xl bg-zinc-900 border ${col.border} flex items-center justify-center text-3xl mb-6 shadow-xl`}>
                    {emoji}
                </div>
                <h3 className={`font-black text-xl uppercase italic ${col.text} tracking-wider leading-tight`}>{title}</h3>
                <p className="text-[11px] text-zinc-400 mt-3 leading-relaxed font-bold">{message}</p>
                {form.linkUrl && (
                    <button className={`mt-8 w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest ${col.btn} transition-all`}>
                        {form.linkText || 'ACCIÓN REQUERIDA'}
                    </button>
                )}
            </div>
        </div>
    );

    if (form.style === 'toast') return (
        <div className={`flex items-start gap-4 p-5 rounded-[2rem] border ${col.border} bg-zinc-950/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-sm relative overflow-hidden group/toast`}>
            <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${col.bg}`} />
            <span className="text-3xl flex-shrink-0">{emoji}</span>
            <div className="flex-1 min-w-0">
                {form.advertiser && <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest block mb-1">{form.advertiser}</span>}
                <p className={`font-black text-sm uppercase italic tracking-widest ${col.text}`}>{title}</p>
                <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">{message}</p>
                {form.linkUrl && (
                    <button className={`mt-3 px-5 py-2 rounded-xl text-[9px] font-black uppercase ${col.btn}`}>
                        {form.linkText || 'Abrir'}
                    </button>
                )}
            </div>
        </div>
    );

    // banner (default)
    return (
        <div className={`flex items-center gap-6 px-8 py-5 rounded-[2rem] border ${col.border} bg-zinc-950/40 backdrop-blur-2xl shadow-2xl overflow-hidden relative group/banner`}>
            <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${col.bg}`} />
            {form.imageUrl && (
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/5 flex-shrink-0 ring-4 ring-white/5 shadow-inner">
                    <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
            )}
            <span className="text-4xl flex-shrink-0 animate-bounce transition-all duration-700">{emoji}</span>
            <div className="flex-1 min-w-0">
                {form.advertiser && <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block mb-1">PROMOCIÓN · {form.advertiser}</span>}
                <p className={`font-black text-lg uppercase italic tracking-wider ${col.text}`}>{title}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1 font-bold italic">{message}</p>
            </div>
            {form.linkUrl && (
                <button className={`flex-shrink-0 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] ${col.btn} active:scale-95 transition-all`}>
                    {form.linkText || 'DETALLES'}
                </button>
            )}
        </div>
    );
}

// ─── MARKETING TAB PRINCIPAL ───────────────────────────────────────────────────
interface Props {
    campaigns: Campaign[];
    addCampaign: (d: Omit<Campaign, 'id' | 'createdAt'>) => Promise<void>;
    updateCampaign: (id: string, d: Partial<Campaign>) => Promise<void>;
    deleteCampaign: (id: string) => Promise<void>;
}

const EMPTY_FORM: Omit<Campaign, 'id' | 'createdAt'> = {
    title: '', message: '', emoji: '📢',
    color: 'amber', style: 'banner', target: 'all', priority: 1,
    isActive: true, imageUrl: '', linkUrl: '', linkText: 'Ver más', advertiser: '',
};

export function MarketingTab({ campaigns, addCampaign, updateCampaign, deleteCampaign }: Props) {
    const [form, setForm] = useState<Omit<Campaign, 'id' | 'createdAt'>>(EMPTY_FORM);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [section, setSection] = useState<'list' | 'adspace'>('list');

    const activeCampaigns = campaigns.filter(c => c.isActive);
    const inactiveCampaigns = campaigns.filter(c => !c.isActive);

    const f = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

    const handleCreate = async () => {
        if (!form.title.trim() || !form.message.trim()) return;
        setSaving(true);
        try { await addCampaign(form); setForm(EMPTY_FORM); setShowForm(false); }
        finally { setSaving(false); }
    };

    const handleAI = () => {
        setAiLoading(true);
        setTimeout(() => {
            const t = AI_TEMPLATES[Math.floor(Math.random() * AI_TEMPLATES.length)];
            setForm(p => ({ ...p, ...t, linkUrl: p.linkUrl, imageUrl: p.imageUrl }));
            setShowForm(true);
            setAiLoading(false);
        }, 900);
    };

    return (
        <div className="space-y-6">

            {/* ── STATS BAR ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Campañas Activas', value: activeCampaigns.length, icon: Zap, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                    { label: 'Total Campañas', value: campaigns.length, icon: Megaphone, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                    { label: 'Espacios Vendidos', value: campaigns.filter(c => c.advertiser).length, icon: Tag, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
                    { label: 'Alta Prioridad', value: campaigns.filter(c => c.priority && c.priority >= 2).length, icon: Star, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
                ].map(s => (
                    <div key={s.label} className={`flex items-center gap-3 p-4 rounded-2xl border ${s.color}`}>
                        <s.icon className="w-5 h-5 flex-shrink-0" />
                        <div>
                            <p className="text-2xl font-black">{s.value}</p>
                            <p className="text-[10px] uppercase tracking-widest opacity-70 font-black">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── ACCIONES PRINCIPALES ── */}
            <div className="flex flex-wrap gap-3 items-center">
                <button
                    onClick={() => { setShowForm(v => !v); setForm(EMPTY_FORM); }}
                    className="flex items-center gap-2 px-5 py-3 bg-amber-500 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
                >
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? 'Cancelar' : 'Nueva Campaña'}
                </button>

                <button
                    onClick={handleAI}
                    disabled={aiLoading}
                    className="flex items-center gap-2 px-5 py-3 bg-purple-500/20 border border-purple-500/40 text-purple-300 font-black uppercase text-xs tracking-widest rounded-xl hover:bg-purple-500/30 transition-all disabled:opacity-60"
                >
                    {aiLoading ? <span className="animate-spin text-base">✨</span> : <Sparkles className="w-4 h-4" />}
                    {aiLoading ? 'Generando con IA...' : 'Generar con IA'}
                </button>

                <div className="flex gap-2 ml-auto">
                    <button onClick={() => setSection('list')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${section === 'list' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-white'}`}>Mis Campañas</button>
                    <button onClick={() => setSection('adspace')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${section === 'adspace' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-white'}`}>Vender Espacio</button>
                </div>
            </div>

            {/* ══════════════════════════════ FORMULARIO ════════════════════════════ */}
            {showForm && (
                <div className="grid lg:grid-cols-2 gap-6">

                    {/* ── Panel izquierdo: Editor ── */}
                    <div className="bg-[#09090b] border border-white/5 rounded-3xl p-6 space-y-5">
                        <h3 className="text-sm font-black text-white uppercase italic tracking-widest flex items-center gap-2">
                            <Megaphone className="w-4 h-4 text-amber-500" /> Editor de Campaña
                        </h3>

                        {/* Emoji + Título */}
                        <div className="flex gap-2">
                            <input value={form.emoji} onChange={e => f('emoji', e.target.value)} maxLength={2}
                                className="w-16 h-11 bg-zinc-900 border border-white/10 rounded-xl text-center text-2xl outline-none focus:border-amber-500/50" />
                            <input value={form.title} onChange={e => f('title', e.target.value)} placeholder="Título de la campaña *"
                                className="flex-1 h-11 bg-zinc-900 border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-amber-500/50 font-bold" />
                        </div>

                        {/* Mensaje */}
                        <textarea value={form.message} onChange={e => f('message', e.target.value)} placeholder="Mensaje principal de la campaña *" rows={3}
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 resize-none" />

                        {/* Estilo de Banner */}
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-2">Estilo de Banner</p>
                            <div className="grid grid-cols-2 gap-2">
                                {STYLES.map(s => (
                                    <button key={s.id} onClick={() => f('style', s.id)}
                                        className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${form.style === s.id ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:border-zinc-600 hover:text-white'}`}>
                                        <s.icon className="w-4 h-4 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-black uppercase">{s.label}</p>
                                            <p className="text-[9px] opacity-70 leading-tight">{s.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color */}
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-2">Tema de Color</p>
                            <div className="flex gap-2 flex-wrap">
                                {COLORS.map(c => (
                                    <button key={c.id} onClick={() => f('color', c.id)}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all ${form.color === c.id ? `bg-gradient-to-br ${c.bg} ${c.border} ${c.text}` : 'bg-zinc-900 border-white/5 text-zinc-500 hover:border-zinc-600'}`}>
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Audiencia */}
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-2">Audiencia Objetivo</p>
                            <div className="grid grid-cols-2 gap-2">
                                {TARGETS.map(t => (
                                    <button key={t.id} onClick={() => f('target', t.id)}
                                        className={`p-3 rounded-xl border text-left transition-all ${form.target === t.id ? 'bg-amber-500/10 border-amber-500/40' : 'bg-zinc-900 border-white/5 hover:border-zinc-600'}`}>
                                        <p className="text-xs font-black text-white">{t.label}</p>
                                        <p className="text-[9px] text-zinc-500 mt-0.5">{t.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Prioridad */}
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-2">Prioridad de Visualización</p>
                            <div className="flex gap-2">
                                {PRIORITIES.map(p => (
                                    <button key={p.id} onClick={() => f('priority', p.id)}
                                        className={`flex-1 py-2 rounded-xl border text-xs font-black uppercase transition-all ${form.priority === p.id ? 'bg-zinc-700 border-zinc-500 text-white' : 'bg-zinc-900 border-white/5 text-zinc-500'}`}>
                                        <span className={p.color}>{p.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Link + Imagen + Anunciante */}
                        <div className="space-y-2 border-t border-white/5 pt-4">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Enlace y Medios (opcional)</p>

                            <div className="flex items-center gap-2">
                                <Link className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                                <input value={form.linkUrl} onChange={e => f('linkUrl', e.target.value)} placeholder="https://tusitio.com"
                                    className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500/40" />
                            </div>

                            {form.linkUrl && (
                                <input value={form.linkText} onChange={e => f('linkText', e.target.value)} placeholder='Texto del botón: "Ver Oferta", "Agendar"...'
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500/40" />
                            )}

                            <div className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                                <input value={form.imageUrl} onChange={e => f('imageUrl', e.target.value)} placeholder="URL de imagen o logo (opcional)"
                                    className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500/40" />
                            </div>

                            <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                                <input value={form.advertiser} onChange={e => f('advertiser', e.target.value)} placeholder='Anunciante (si vendes el espacio): "Tienda XYZ"'
                                    className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500/40" />
                            </div>
                        </div>

                        {/* Publicar */}
                        <button onClick={handleCreate} disabled={saving || !form.title || !form.message}
                            className="w-full py-3.5 bg-amber-500 text-black font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2">
                            {saving ? <><span className="animate-spin">✨</span> Publicando...</> : <><Megaphone className="w-4 h-4" /> Publicar Campaña</>}
                        </button>
                    </div>

                    {/* ── Panel derecho: Preview en Vivo ── */}
                    <div className="space-y-4">
                        <div className="bg-[#09090b] border border-white/5 rounded-3xl p-6">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-4 flex items-center gap-2">
                                <Eye className="w-3.5 h-3.5" /> Preview en Vivo
                            </p>
                            <BannerPreview form={form} />
                        </div>

                        {/* Tips según estilo */}
                        <div className="bg-zinc-900/60 border border-amber-500/10 rounded-2xl p-4 space-y-2">
                            <p className="text-[10px] text-amber-500/60 uppercase tracking-widest font-black">💡 Consejos para este estilo</p>
                            {form.style === 'hero' && <p className="text-xs text-zinc-500">El banner <strong className="text-white">Hero</strong> es el más impactante. Añade una imagen URL para el fondo y mantén el mensaje breve pero poderoso.</p>}
                            {form.style === 'card' && <p className="text-xs text-zinc-500">La <strong className="text-white">Tarjeta</strong> funciona bien con una imagen de producto. Ideal para promociones específicas.</p>}
                            {form.style === 'toast' && <p className="text-xs text-zinc-500">El <strong className="text-white">Toast</strong> aparece en la esquina y no interrumpe. Úsalo para notificaciones de urgencia media.</p>}
                            {form.style === 'banner' && <p className="text-xs text-zinc-500">El <strong className="text-white">Banner</strong> aparece en la parte superior del panel. Es el más visto y versátil.</p>}
                            <p className="text-xs text-zinc-600">Prioridad <strong className="text-white">Urgente</strong> → aparece cuando hay varias campañas activas, la de mayor prioridad gana.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════ LISTA DE CAMPAÑAS ═════════════════════ */}
            {section === 'list' && !showForm && (
                <div className="space-y-4">
                    {activeCampaigns.length > 0 && (
                        <div>
                            <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-black mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" /> Campañas Activas ({activeCampaigns.length})
                            </p>
                            <div className="space-y-3">
                                {activeCampaigns.map(c => <CampaignRow key={c.id} campaign={c} update={updateCampaign} del={deleteCampaign} />)}
                            </div>
                        </div>
                    )}
                    {inactiveCampaigns.length > 0 && (
                        <div>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-black mb-3">Inactivas ({inactiveCampaigns.length})</p>
                            <div className="space-y-2 opacity-60">
                                {inactiveCampaigns.map(c => <CampaignRow key={c.id} campaign={c} update={updateCampaign} del={deleteCampaign} />)}
                            </div>
                        </div>
                    )}
                    {campaigns.length === 0 && (
                        <div className="py-16 flex flex-col items-center gap-4 text-zinc-600">
                            <Megaphone className="w-12 h-12 opacity-30" />
                            <p className="font-black uppercase italic">No hay campañas aún</p>
                            <p className="text-xs">Crea tu primera campaña o usa el botón IA para generar una</p>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════ VENDER ESPACIO ════════════════════════ */}
            {section === 'adspace' && !showForm && (
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-[#09090b] border border-amber-500/30 rounded-[3rem] p-10 space-y-10 relative overflow-hidden group/sell shadow-[0_0_50px_rgba(245,158,11,0.1)]">
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover/sell:rotate-12 transition-transform duration-1000">
                            <TrendingUp className="w-32 h-32 text-amber-500" />
                        </div>

                        <div className="relative z-10 flex items-center gap-5">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500 text-black flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                                <Tag className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-black text-2xl text-white uppercase italic tracking-widest">Monetización de Espacios</h3>
                                <p className="text-[10px] text-amber-500/70 font-black uppercase tracking-[0.3em] mt-1 italic shadow-sm">Impulsa tu plataforma al siguiente nivel</p>
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <p className="text-sm text-zinc-400 leading-relaxed font-bold italic">
                                Transfórmate en un nodo de marketing global. Vende espacios de visualización a marcas locales y marcas de cuidado personal. Un banner en el <strong className="text-white">Panel Central</strong> garantiza miles de impactos mensuales.
                            </p>

                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { tipo: 'Superior (Diario)', precio: '$199 MXN', impacts: 'Visibilidad Diaria Pro', accent: 'amber', style: 'banner' },
                                    { tipo: 'Cuadrado (Semanal)', precio: '$999 MXN', impacts: 'Impactos de Alta Conversión', accent: 'emerald', style: 'card' },
                                    { tipo: 'Cine (Mensual)', precio: '$2,999 MXN', impacts: 'Máximo Alcance Directo', accent: 'blue', style: 'hero' },
                                ].map(item => (
                                    <div
                                        key={item.tipo}
                                        onClick={() => {
                                            setForm({ ...EMPTY_FORM, advertiser: 'Anunciante Externo', style: item.style as any, title: `Campaña ${item.tipo}` });
                                            setShowForm(true);
                                        }}
                                        className="flex items-center justify-between p-5 bg-zinc-950 border border-white/5 rounded-3xl hover:border-amber-500/30 transition-all cursor-pointer group/item"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full bg-${item.accent}-500 group-hover/item:animate-ping`} />
                                            <div>
                                                <p className="text-xs font-black text-white uppercase italic tracking-widest">{item.tipo}</p>
                                                <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1 italic">{item.impacts}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-black text-amber-500 italic tracking-tighter">{item.precio}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative z-10 pt-4">
                            <button
                                onClick={() => { setForm({ ...EMPTY_FORM, advertiser: 'Aliado Premium', style: 'hero', priority: 2 }); setShowForm(true); }}
                                className="w-full py-5 bg-white text-black font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-zinc-200 transition-all shadow-2xl flex items-center justify-center gap-3"
                            >
                                <Zap className="w-4 h-4" /> Iniciar Campaña Maestra
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[#09090b] border border-white/[0.05] rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="font-black text-white uppercase italic tracking-widest text-sm flex items-center gap-3">
                                    <Activity className="w-5 h-5 text-blue-500" /> Nodos Maestros Activos
                                </h4>
                                <span className="text-[10px] text-zinc-600 font-black uppercase italic">Seguimiento en Vivo</span>
                            </div>

                            {campaigns.filter(c => c.advertiser).length > 0 ? (
                                <div className="space-y-4">
                                    {campaigns.filter(c => c.advertiser).map(c => {
                                        const col = getColor(c.color);
                                        return (
                                            <div key={c.id} className={`flex items-center gap-5 p-5 rounded-[2rem] border ${c.isActive ? col.border : 'border-white/5'} bg-zinc-950 relative overflow-hidden group/node`}>
                                                {c.isActive && <div className={`absolute top-0 right-0 p-3 opacity-10`}><Sparkles className={`w-10 h-10 ${col.text}`} /></div>}
                                                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-3xl shadow-xl">
                                                    {c.emoji}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-black text-white uppercase italic tracking-widest truncate">{c.title}</p>
                                                    <p className={`text-[9px] ${col.text} font-black uppercase tracking-widest mt-1 italic flex items-center gap-1`}>
                                                        <CreditCard className="w-3 h-3" /> {c.advertiser}
                                                    </p>
                                                </div>
                                                <button onClick={() => updateCampaign(c.id, { isActive: !c.isActive })} className="relative">
                                                    {c.isActive ? <ToggleRight className="w-8 h-8 text-emerald-400 group-hover/node:scale-110 transition-transform" /> : <ToggleLeft className="w-8 h-8 text-zinc-700" />}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-20 text-center space-y-5">
                                    <Tag className="w-16 h-16 mx-auto opacity-10" />
                                    <p className="text-xs font-black text-zinc-700 uppercase italic tracking-widest leading-relaxed">Sistema esperando despliegue comercial.<br />Clic en iniciar para comenzar.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Fila de Campaña en la Lista ───────────────────────────────────────────────
function CampaignRow({ campaign: c, update, del }: { campaign: Campaign; update: (id: string, d: Partial<Campaign>) => Promise<void>; del: (id: string) => Promise<void> }) {
    const col = getColor(c.color);
    const styleIcon = STYLES.find(s => s.id === c.style);
    const StyleIcon = styleIcon?.icon || Megaphone;
    const priLabel = PRIORITIES.find(p => p.id === c.priority);

    return (
        <div className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${c.isActive ? `bg-gradient-to-r ${col.bg} ${col.border}` : 'bg-zinc-900/40 border-white/5'}`}>
            {c.imageUrl && <img src={c.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-white/10" onError={e => (e.currentTarget.style.display = 'none')} />}
            <span className="text-2xl flex-shrink-0 mt-0.5">{c.emoji}</span>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-black text-sm uppercase italic ${c.isActive ? col.text : 'text-zinc-600'} truncate`}>{c.title}</p>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border ${col.border} ${col.text} opacity-70`}>
                        {c.style}
                    </span>
                    {c.priority && c.priority > 1 && (
                        <span className={`text-[9px] font-black uppercase ${priLabel?.color}`}>{priLabel?.label}</span>
                    )}
                </div>
                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{c.message}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="flex items-center gap-1 text-[9px] text-zinc-600 font-black">
                        <StyleIcon className="w-3 h-3" /> {TARGETS.find(t => t.id === c.target)?.label}
                    </span>
                    {c.advertiser && <span className="text-[9px] text-amber-500/70 font-black">💰 {c.advertiser}</span>}
                    {c.linkUrl && (
                        <a href={c.linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[9px] text-blue-400/70 hover:text-blue-400 font-black">
                            <ExternalLink className="w-3 h-3" /> enlace
                        </a>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => update(c.id, { isActive: !c.isActive })} title={c.isActive ? 'Desactivar' : 'Activar'}
                    className="text-zinc-500 hover:text-white transition">
                    {c.isActive ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button onClick={() => { if (confirm('¿Eliminar campaña?')) del(c.id); }}
                    className="text-zinc-600 hover:text-red-400 transition">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
