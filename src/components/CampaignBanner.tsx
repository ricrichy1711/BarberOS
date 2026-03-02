import { useState } from 'react';
import type { Campaign } from '@/types';
import { Trash2, Eye, EyeOff, Plus, Sparkles, Link, Image, Tag } from 'lucide-react';

// ─── Paleta de colores ─────────────────────────────────────────────────────────
const COLORS: { id: Campaign['color']; label: string; bg: string; border: string; text: string; btn: string }[] = [
    { id: 'amber', label: '🔥 Ámbar', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-300', btn: 'bg-amber-500 hover:bg-amber-400 text-black' },
    { id: 'blue', label: '💙 Azul', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-300', btn: 'bg-blue-500 hover:bg-blue-400 text-white' },
    { id: 'green', label: '💚 Verde', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-300', btn: 'bg-emerald-500 hover:bg-emerald-400 text-white' },
    { id: 'purple', label: '💜 Morado', bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-300', btn: 'bg-purple-500 hover:bg-purple-400 text-white' },
    { id: 'red', label: '❤️ Rojo', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-300', btn: 'bg-red-500 hover:bg-red-400 text-white' },
];

const TARGETS = [
    { id: 'all', label: 'Todos (dueños, barberos y clientes)' },
    { id: 'owner', label: 'Solo Dueños de Barbería' },
    { id: 'barber', label: 'Solo Barberos' },
    { id: 'client', label: 'Solo Clientes' },
];

function getColor(id: Campaign['color']) {
    return COLORS.find(c => c.id === id) || COLORS[0];
}

// ─── Plantillas de IA ───────────────────────────────────────────────────────────
const AI_TEMPLATES: Omit<Campaign, 'id' | 'createdAt' | 'isActive'>[] = [
    {
        emoji: '✂️', color: 'amber', target: 'all',
        title: '¡Oferta Flash de Corte!',
        message: 'El estilo que buscas, al precio que mereces. ¡Agenda hoy y recibe un 20% de descuento en tu primer corte!',
        linkText: 'Reservar Ahora',
        linkUrl: '', imageUrl: '', advertiser: '',
        style: 'banner', priority: 1
    },
    {
        emoji: '🏆', color: 'blue', target: 'owner',
        title: 'Impulsa Tu Barbería al Siguiente Nivel',
        message: 'Actualiza a Premium y desbloquea reportes avanzados, citas ilimitadas y soporte prioritario. ¡Por tiempo limitado!',
        linkText: 'Ver Planes', linkUrl: '', imageUrl: '', advertiser: '',
        style: 'banner', priority: 1
    },
    {
        emoji: '💰', color: 'green', target: 'barber',
        title: '¡Aumenta Tus Ingresos Este Mes!',
        message: 'Los barberos top ganan hasta 3x más cuando activan su perfil público. Completa tu perfil hoy y empieza a recibir más clientes.',
        linkText: 'Completar Perfil', linkUrl: '', imageUrl: '', advertiser: '',
        style: 'banner', priority: 1
    },
    {
        emoji: '⚡', color: 'purple', target: 'all',
        title: 'Nuevo: Citas Express en 60 Segundos',
        message: 'Agenda tu corte en segundos desde cualquier dispositivo. Sin esperas, sin llamadas. ¡Solo tu estilo!',
        linkText: 'Agendar Ahora', linkUrl: '', imageUrl: '', advertiser: '',
        style: 'banner', priority: 1
    },
    {
        emoji: '🎁', color: 'red', target: 'client',
        title: '¡Trae un Amigo y Obtén un Corte Gratis!',
        message: 'Refiere a un amigo a tu barbería favorita y ambos recibirán un descuento especial. ¡La amistad también se estila!',
        linkText: 'Compartir Oferta', linkUrl: '', imageUrl: '', advertiser: '',
        style: 'banner', priority: 1
    },
    {
        emoji: '👑', color: 'amber', target: 'owner',
        title: 'Vende el Espacio de Este Banner',
        message: '¿Tienes un negocio local? Este banner llega a cientos de usuarios activos diariamente. Contáctanos para anunciarte aquí.',
        linkText: 'Contactar Admin', linkUrl: '', imageUrl: '', advertiser: 'Espacio Publicitario',
        style: 'banner', priority: 1
    },
];

// ─── Banner visible en dashboards ───────────────────────────────────────────────
export function CampaignBanner({ campaign }: { campaign: Campaign }) {
    const [dismissed, setDismissed] = useState(false);
    if (dismissed) return null;
    const col = getColor(campaign.color);

    const content = (
        <div className={`relative flex gap-3 rounded-2xl border ${col.bg} ${col.border} shadow-xl animate-[fadeSlideIn_0.5s_ease] overflow-hidden`}>
            {/* Imagen lateral (si existe) */}
            {campaign.imageUrl && (
                <div className="flex-shrink-0 w-20 h-full min-h-[70px]">
                    <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-full object-cover" />
                </div>
            )}

            <div className="flex items-center gap-3 flex-1 min-w-0 px-4 py-3">
                <span className="text-2xl flex-shrink-0">{campaign.emoji}</span>
                <div className="flex-1 min-w-0">
                    {campaign.advertiser && (
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">
                            Publicidad · {campaign.advertiser}
                        </span>
                    )}
                    <p className={`font-black text-sm uppercase italic tracking-tight ${col.text}`}>{campaign.title}</p>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-snug">{campaign.message}</p>
                </div>

                {/* CTA Button */}
                {campaign.linkUrl && campaign.linkText && (
                    <a
                        href={campaign.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all shadow-lg ${col.btn}`}
                    >
                        {campaign.linkText}
                    </a>
                )}

                {/* Cerrar */}
                <button
                    onClick={() => setDismissed(true)}
                    className="flex-shrink-0 text-zinc-600 hover:text-white transition-colors text-lg leading-none ml-1"
                    title="Cerrar"
                >×</button>
            </div>
        </div>
    );

    // Si tiene link y NO tiene botón CTA separado, todo el banner es clickeable
    if (campaign.linkUrl && !campaign.linkText) {
        return (
            <a href={campaign.linkUrl} target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
                {content}
            </a>
        );
    }

    return content;
}

// ─── Creador de Campañas (Admin) ────────────────────────────────────────────────
interface Props {
    campaigns: Campaign[];
    addCampaign: (d: Omit<Campaign, 'id' | 'createdAt'>) => Promise<void>;
    updateCampaign: (id: string, d: Partial<Campaign>) => Promise<void>;
    deleteCampaign: (id: string) => Promise<void>;
}

export function CampaignCreator({ campaigns, addCampaign, updateCampaign, deleteCampaign }: Props) {
    const [form, setForm] = useState({
        title: '', message: '', emoji: '📢',
        color: 'amber' as Campaign['color'],
        target: 'all' as Campaign['target'],
        imageUrl: '',
        linkUrl: '',
        linkText: 'Ver más',
        advertiser: '',
        style: 'banner' as Campaign['style'],
        priority: 1 as Campaign['priority'],
    });
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    const handleCreate = async () => {
        if (!form.title.trim() || !form.message.trim()) return;
        setSaving(true);
        try {
            await addCampaign({ ...form, isActive: true });
            setForm({ title: '', message: '', emoji: '📢', color: 'amber', target: 'all', imageUrl: '', linkUrl: '', linkText: 'Ver más', advertiser: '', style: 'banner', priority: 1 });
            setShowForm(false);
            setShowAdvanced(false);
        } finally {
            setSaving(false);
        }
    };

    // Generador de IA: elige plantilla aleatoria con variación
    const handleAI = () => {
        setAiLoading(true);
        setTimeout(() => {
            const template = AI_TEMPLATES[Math.floor(Math.random() * AI_TEMPLATES.length)];
            setForm(prev => ({
                ...prev,
                ...template,
                linkUrl: prev.linkUrl, // mantiene URL si ya había
                imageUrl: prev.imageUrl, // mantiene imagen si ya había
            }));
            setShowForm(true);
            setShowAdvanced(false);
            setAiLoading(false);
        }, 800); // delay para dar sensación de procesamiento
    };

    const previewColor = getColor(form.color);

    return (
        <div className="space-y-3">
            {/* ── Botones principales ── */}
            {!showForm && (
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex-1 py-3 bg-amber-500 text-black font-black uppercase tracking-widest italic text-xs rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Lanzar Campaña
                    </button>
                    <button
                        onClick={handleAI}
                        disabled={aiLoading}
                        title="Generar campaña automáticamente con IA"
                        className="px-4 py-3 bg-purple-500/20 border border-purple-500/30 text-purple-300 font-black uppercase text-xs rounded-xl hover:bg-purple-500/30 transition-all flex items-center gap-2 disabled:opacity-60"
                    >
                        {aiLoading ? (
                            <span className="animate-spin text-base">✨</span>
                        ) : (
                            <Sparkles className="w-4 h-4" />
                        )}
                        IA
                    </button>
                </div>
            )}

            {/* ── Formulario ── */}
            {showForm && (
                <div className="space-y-3 bg-zinc-900/60 border border-white/5 rounded-2xl p-4">

                    {/* Header con botón IA integrado */}
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Nueva Campaña</p>
                        <button
                            onClick={handleAI}
                            disabled={aiLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-black rounded-lg hover:bg-purple-500/30 transition-all"
                        >
                            {aiLoading ? <span className="animate-spin">✨</span> : <Sparkles className="w-3 h-3" />}
                            {aiLoading ? 'Generando...' : 'Generar con IA'}
                        </button>
                    </div>

                    {/* Emoji + Título */}
                    <div className="flex gap-2">
                        <input
                            value={form.emoji}
                            onChange={e => setForm(p => ({ ...p, emoji: e.target.value }))}
                            className="w-14 bg-zinc-800 border border-white/10 rounded-lg text-center text-xl outline-none focus:border-amber-500/40"
                            maxLength={2}
                        />
                        <input
                            value={form.title}
                            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                            placeholder="Título de la campaña"
                            className="flex-1 bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/40"
                        />
                    </div>

                    {/* Mensaje */}
                    <textarea
                        value={form.message}
                        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        placeholder="Mensaje de la campaña..."
                        rows={2}
                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/40 resize-none"
                    />

                    {/* Colores */}
                    <div className="flex gap-1.5 flex-wrap">
                        {COLORS.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setForm(p => ({ ...p, color: c.id }))}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all ${form.color === c.id ? `${c.bg} ${c.border} ${c.text}` : 'bg-zinc-800 border-white/5 text-zinc-500'}`}
                            >{c.label}</button>
                        ))}
                    </div>

                    {/* Audiencia */}
                    <select
                        value={form.target}
                        onChange={e => setForm(p => ({ ...p, target: e.target.value as any }))}
                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                    >
                        {TARGETS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>

                    {/* Toggle opciones avanzadas */}
                    <button
                        onClick={() => setShowAdvanced(v => !v)}
                        className="w-full py-1.5 text-[10px] font-black text-zinc-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                        <Link className="w-3 h-3" />
                        {showAdvanced ? '▲ Ocultar opciones avanzadas' : '▼ Link, imagen y anunciante (publicidad externa)'}
                    </button>

                    {showAdvanced && (
                        <div className="space-y-2 border-t border-white/5 pt-3">
                            {/* URL del link */}
                            <div className="flex gap-2 items-center">
                                <Link className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                                <input
                                    value={form.linkUrl}
                                    onChange={e => setForm(p => ({ ...p, linkUrl: e.target.value }))}
                                    placeholder="https://tusitio.com (destino al hacer clic)"
                                    className="flex-1 bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/40"
                                />
                            </div>

                            {/* Texto del botón CTA */}
                            {form.linkUrl && (
                                <input
                                    value={form.linkText}
                                    onChange={e => setForm(p => ({ ...p, linkText: e.target.value }))}
                                    placeholder='Texto del botón, ej: "Ver Oferta"'
                                    className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/40"
                                />
                            )}

                            {/* URL de imagen */}
                            <div className="flex gap-2 items-center">
                                <Image className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                                <input
                                    value={form.imageUrl}
                                    onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                                    placeholder="URL de imagen/logo del anunciante"
                                    className="flex-1 bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/40"
                                />
                            </div>

                            {/* Nombre del anunciante */}
                            <div className="flex gap-2 items-center">
                                <Tag className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                                <input
                                    value={form.advertiser}
                                    onChange={e => setForm(p => ({ ...p, advertiser: e.target.value }))}
                                    placeholder='Nombre del anunciante, ej: "Tienda XYZ" (opcional)'
                                    className="flex-1 bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/40"
                                />
                            </div>

                            <p className="text-[9px] text-zinc-600 italic">
                                💡 Si vendes este espacio, completa el nombre del anunciante. El banner mostrará "Publicidad · Nombre".
                            </p>
                        </div>
                    )}

                    {/* Preview */}
                    {form.title && (
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${previewColor.bg} ${previewColor.border} overflow-hidden`}>
                            {form.imageUrl && (
                                <img src={form.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" onError={e => (e.currentTarget.style.display = 'none')} />
                            )}
                            <span className="text-xl flex-shrink-0">{form.emoji}</span>
                            <div className="flex-1 min-w-0">
                                {form.advertiser && <span className="text-[9px] text-zinc-500 uppercase">Publicidad · {form.advertiser}</span>}
                                <p className={`font-black text-xs uppercase italic ${previewColor.text}`}>{form.title}</p>
                                <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2">{form.message}</p>
                            </div>
                            {form.linkUrl && form.linkText && (
                                <span className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black ${previewColor.btn}`}>{form.linkText}</span>
                            )}
                        </div>
                    )}

                    {/* Acciones */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleCreate}
                            disabled={saving || !form.title || !form.message}
                            className="flex-1 py-2 bg-amber-500 text-black font-black text-xs uppercase rounded-lg hover:bg-amber-400 transition disabled:opacity-50"
                        >{saving ? 'Publicando...' : '🚀 Publicar Campaña'}</button>
                        <button
                            onClick={() => { setShowForm(false); setShowAdvanced(false); }}
                            className="px-4 py-2 bg-zinc-800 text-zinc-400 text-xs rounded-lg hover:bg-zinc-700 transition"
                        >Cancelar</button>
                    </div>
                </div>
            )}

            {/* ── Lista de campañas ── */}
            {campaigns.length > 0 && (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-black">Campañas ({campaigns.length})</p>
                    {campaigns.map(c => {
                        const col = getColor(c.color);
                        return (
                            <div key={c.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${c.isActive ? `${col.bg} ${col.border}` : 'bg-zinc-900/40 border-white/5'}`}>
                                {c.imageUrl && <img src={c.imageUrl} alt="" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />}
                                <span className="text-base flex-shrink-0">{c.emoji}</span>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-black truncate ${c.isActive ? col.text : 'text-zinc-600'}`}>{c.title}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[9px] text-zinc-600">{TARGETS.find(t => t.id === c.target)?.label}</span>
                                        {c.advertiser && <span className="text-[9px] text-amber-500/60 font-black">💰 {c.advertiser}</span>}
                                        {c.linkUrl && <span className="text-[9px] text-blue-400/60">🔗 link</span>}
                                    </div>
                                </div>
                                <button
                                    onClick={() => updateCampaign(c.id, { isActive: !c.isActive })}
                                    className="flex-shrink-0 text-zinc-500 hover:text-white transition"
                                    title={c.isActive ? 'Desactivar' : 'Activar'}
                                >
                                    {c.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                    onClick={() => { if (confirm('¿Eliminar campaña?')) deleteCampaign(c.id); }}
                                    className="flex-shrink-0 text-zinc-600 hover:text-red-400 transition"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
