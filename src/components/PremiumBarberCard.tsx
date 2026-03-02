import { Star, Award, TrendingUp } from 'lucide-react';

interface PremiumBarberCardProps {
    name: string;
    avatar?: string;
    rating: number;
    reviewsCount: number;
    weeklyRevenue: number;
    completedCuts: number;
    pendingCuts: number;
    status: 'online' | 'busy' | 'offline';
}

export function PremiumBarberCard({
    name = "Barbero Elite",
    avatar,
    rating = 5.0,
    reviewsCount = 42,
    weeklyRevenue = 1250,
    completedCuts = 12,
    pendingCuts = 3,
    status = 'online'
}: Partial<PremiumBarberCardProps>) {
    return (
        <div className="relative group w-80">
            {/* Glossy Background with Emerald Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/80 to-zinc-950 rounded-[2.5rem] border border-white/5 shadow-2xl transition-all duration-500 group-hover:border-emerald-500/30 group-hover:shadow-[0_20px_60px_rgba(16,185,129,0.1)]" />

            <div className="relative p-6 flex flex-col items-center">
                {/* Status Badge */}
                <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full shadow-inner">
                    <div className={`h-1.5 w-1.5 rounded-full animate-pulse shadow-lg ${status === 'online' ? 'bg-emerald-500 shadow-emerald-500/50' :
                        status === 'busy' ? 'bg-amber-500 shadow-amber-500/50' :
                            'bg-zinc-500 shadow-zinc-500/50'
                        }`} />
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none italic">
                        {status === 'online' ? 'Activo' : status === 'busy' ? 'Ocupado' : 'Offline'}
                    </span>
                </div>

                {/* Avatar Container with Luxury Ring */}
                <div className="relative mt-2 mb-6 group-hover:scale-105 transition-transform duration-500">
                    <div className="absolute -inset-1.5 bg-gradient-to-tr from-emerald-500/40 via-amber-500/20 to-transparent rounded-[2rem] blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative h-24 w-24 rounded-[1.8rem] bg-zinc-900 border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                        {avatar ? (
                            <img src={avatar} className="h-full w-full object-cover" alt={name} />
                        ) : (
                            <div className="text-3xl font-black text-emerald-500 bebas">{name[0]}</div>
                        )}
                        {/* Overlay Shine */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                    </div>
                    {/* Level Badge */}
                    <div className="absolute -bottom-2 -left-2 bg-zinc-950 border border-amber-500/30 p-1.5 rounded-xl shadow-lg">
                        <Award className="h-4 w-4 text-amber-500" />
                    </div>
                </div>

                {/* Name and Rating */}
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-black text-white bebas italic tracking-wider group-hover:text-emerald-400 transition-colors uppercase">{name}</h3>
                    <div className="flex items-center justify-center gap-2 mt-1">
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />
                            ))}
                        </div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{rating.toFixed(1)} ({reviewsCount})</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 w-full mb-6">
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-3 text-center hover:bg-black/60 transition-colors">
                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total Sem.</p>
                        <div className="flex items-center justify-center gap-1">
                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                            <p className="text-lg font-black text-emerald-500 bebas">${weeklyRevenue}</p>
                        </div>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-3 flex flex-col justify-center items-center hover:bg-black/60 transition-colors gap-1">
                        <div className="flex w-full justify-between items-center px-1">
                            <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Hechos</span>
                            <span className="text-xs font-black text-emerald-500 bebas">{completedCuts}</span>
                        </div>
                        <div className="w-full h-[1px] bg-white/5" />
                        <div className="flex w-full justify-between items-center px-1">
                            <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Pend.</span>
                            <span className="text-xs font-black text-amber-500 bebas">{pendingCuts}</span>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <button className="w-full bg-zinc-950 border border-white/5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-all shadow-xl">
                    GESTIONAR PERFIL
                </button>
            </div>

            {/* Bottom Glow Decoration */}
            <div className="absolute bottom-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        </div>
    );
}

