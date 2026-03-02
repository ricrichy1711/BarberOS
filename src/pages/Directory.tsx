import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import {
  Store, Users, Star, MapPin, Phone, Mail,
  Search, ChevronRight, ArrowLeft, Filter, Sparkles, ArrowRight, X, Star as StarSolid, User, MessageSquare
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { BookingWidget } from '@/components/BookingWidget';

export default function Directory() {
  const { currentUser, barbershops, barbers, appointments, reviews } = useData();
  const [tab, setTab] = useState<'shops' | 'barbers'>('shops');
  const [search, setSearch] = useState('');
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [viewingBarberProfile, setViewingBarberProfile] = useState<any>(null);
  const [showBooking, setShowBooking] = useState(false);

  const getShopRank = (shopId: string) => {
    const shop = barbershops.find(s => s.id === shopId);
    if (!shop) return { label: 'Rookie', color: 'text-zinc-500', bg: 'bg-zinc-500/10 border-zinc-500/20' };

    const shopApts = appointments.filter(a => a.barbershopId === shopId);
    const shopBarbers = barbers.filter(b => b.barbershopId === shopId);
    const score = (shop.rating * 10) + (shopApts.length * 2) + (shopBarbers.length * 5) + (shop.reviewCount);

    if (score > 100) return { label: 'Legendary', color: 'text-amber-500', bg: 'bg-amber-500/20 border-amber-500/30' };
    if (score > 60) return { label: 'Elite', color: 'text-zinc-300', bg: 'bg-zinc-300/10 border-zinc-300/20' };
    if (score > 30) return { label: 'Pro', color: 'text-blue-500', bg: 'bg-blue-500/20 border-blue-500/30' };
    return { label: 'Rookie', color: 'text-zinc-500', bg: 'bg-zinc-500/10 border-zinc-500/20' };
  };

  const publicShops = useMemo(() => barbershops.filter(s => s.isPublic), [barbershops]);
  const publicBarbers = useMemo(() => barbers.filter(b => b.isPublic && b.isApproved), [barbers]);

  const filteredShops = useMemo(() => publicShops.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.address.toLowerCase().includes(search.toLowerCase())
  ), [publicShops, search]);

  const filteredBarbers = useMemo(() => publicBarbers.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.specialty.toLowerCase().includes(search.toLowerCase()) ||
    b.barbershopName.toLowerCase().includes(search.toLowerCase())
  ), [publicBarbers, search]);

  const shopDetail = selectedShop ? barbershops.find(s => s.id === selectedShop) : null;
  const shopBarbers = selectedShop ? barbers.filter(b => b.barbershopId === selectedShop && b.isApproved) : [];

  if (shopDetail) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <Logo />
            <Link to="/" className="text-zinc-400 hover:text-white transition uppercase text-[10px] font-black tracking-widest">
              Volver
            </Link>
          </div>
        </nav>
        <div className="mx-auto max-w-4xl px-6 pt-32 pb-16">
          <button onClick={() => setSelectedShop(null)} className="mb-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-amber-500 transition">
            <ArrowLeft className="h-4 w-4" /> Volver al directorio
          </button>
          <div className="rounded-[40px] border border-white/5 bg-zinc-900/40 overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-12">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                <div className="flex h-32 w-32 items-center justify-center rounded-[32px] bg-gradient-to-br from-amber-400 via-amber-600 to-amber-700 text-5xl font-black text-black shadow-2xl shadow-amber-600/20 shrink-0">
                  {shopDetail.name[0]}
                </div>
                <div className="text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <h1 className="text-5xl font-black tracking-tight uppercase leading-none">{shopDetail.name}</h1>
                    <span className={`inline-block mx-auto md:mx-0 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] border ${getShopRank(shopDetail.id).bg} ${getShopRank(shopDetail.id).color}`}>
                      RANK: {getShopRank(shopDetail.id).label}
                    </span>
                  </div>
                  <div className="mt-6 flex flex-wrap justify-center md:justify-start items-center gap-6 text-sm font-medium text-zinc-400">
                    <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5"><Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {shopDetail.rating} ({shopDetail.reviewCount} reseñas)</span>
                    <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5"><MapPin className="h-4 w-4 text-blue-500" /> {shopDetail.address}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-12 space-y-12">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-4">Sobre Nosotros</h3>
                <p className="text-zinc-400 text-lg leading-relaxed font-medium">{shopDetail.description}</p>
              </div>

              {shopDetail.featuredReviewId && reviews.find(r => r.id === shopDetail.featuredReviewId) && (
                <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-6 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Reseña Destacada
                  </h3>
                  {(() => {
                    const review = reviews.find(r => r.id === shopDetail.featuredReviewId)!;
                    return (
                      <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 p-8 rounded-[32px] relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Star className="h-24 w-24 fill-amber-500" />
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center font-bold text-amber-500 border border-white/10">
                            {review.userName[0]}
                          </div>
                          <div>
                            <p className="font-bold text-base">{review.userName}</p>
                            <div className="flex gap-0.5 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-zinc-800'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-xl text-zinc-300 italic leading-relaxed font-medium">"{review.comment}"</p>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="rounded-[24px] border border-white/5 bg-black/40 p-8 hover:border-white/10 transition">
                  <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-zinc-500 mb-3"><Phone className="h-4 w-4 text-emerald-500" /> WhatsApp</div>
                  <p className="font-bold text-xl">{shopDetail.phone}</p>
                </div>
                <div className="rounded-[24px] border border-white/5 bg-black/40 p-8 hover:border-white/10 transition">
                  <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-zinc-500 mb-3"><Mail className="h-4 w-4 text-blue-500" /> Email Directo</div>
                  <p className="font-bold text-xl">{shopDetail.email}</p>
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-8">Nuestros Talentos ({shopBarbers.length})</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {shopBarbers.map(b => (
                    <div key={b.id} className="group flex items-center gap-6 rounded-[28px] border border-white/5 bg-zinc-900/60 p-6 hover:border-amber-500/30 transition-all duration-300">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 font-black text-white text-xl border border-white/10 shrink-0 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black transition-all">
                        {b.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-lg uppercase tracking-tight">{b.name}</p>
                        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">{b.specialty}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          <span className="text-xs font-bold text-zinc-500">{b.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-amber-600/5 border border-amber-600/10 p-10 rounded-[32px] text-center">
                <h4 className="text-xl font-black mb-4">RESERVA TU EXPERIENCIA</h4>
                {currentUser && currentUser.role === 'client' ? (
                  <>
                    <p className="text-zinc-500 text-sm mb-8 max-w-md mx-auto">Agenda tu cita ahora y disfruta de una experiencia premium.</p>
                    <button
                      onClick={() => setShowBooking(true)}
                      className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-600/20"
                    >
                      Reservar Cita Ahora
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-zinc-500 text-sm mb-8 max-w-md mx-auto">Regístrate en BarberOs LM para agendar tu cita con prioridad y gestionar tus visitas.</p>
                    <Link to="/auth?mode=register" className="inline-block bg-white text-black px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-500 transition-all">
                      Registrarse Ahora
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Widget */}
        {showBooking && shopDetail && (
          <BookingWidget
            barbershop={shopDetail as any}
            barbers={shopBarbers}
            onClose={() => setShowBooking(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Logo />
          <Link to="/auth?mode=login" className="rounded-xl bg-white/5 border border-white/10 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-white hover:text-black">
            Ingresar
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 pt-40 pb-20">
        <div className="mb-20 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-4 flex items-center justify-center gap-2 italic">
            <Sparkles className="h-4 w-4" /> BarberOs LM Ecosistema
          </h2>
          <h1 className="text-6xl font-black sm:text-7xl tracking-tighter uppercase leading-none">
            Directorio <br />
            <span className="bg-gradient-to-b from-white to-zinc-600 bg-clip-text text-transparent">EXCLUSIVO</span>
          </h1>
        </div>

        <div className="mb-16 flex flex-col items-center gap-10">
          <div className="flex gap-2 rounded-3xl border border-white/5 bg-zinc-900/50 p-1.5 backdrop-blur-xl">
            <button
              onClick={() => setTab('shops')}
              className={`flex items-center gap-3 rounded-[20px] px-10 py-5 text-xs font-black uppercase tracking-widest transition-all ${tab === 'shops' ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-white'}`}
            >
              <Store className="h-4 w-4" /> Barberías ({filteredShops.length})
            </button>
            <button
              onClick={() => setTab('barbers')}
              className={`flex items-center gap-3 rounded-[20px] px-10 py-5 text-xs font-black uppercase tracking-widest transition-all ${tab === 'barbers' ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-white'}`}
            >
              <Users className="h-4 w-4" /> Barberos ({filteredBarbers.length})
            </button>
          </div>

          <div className="relative w-full max-w-3xl group">
            <Search className="absolute left-8 top-1/2 h-6 w-6 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
            <input
              id="directory-search"
              name="search"
              type="text"
              placeholder={`Buscar ${tab === 'shops' ? 'barberías por nombre o zona...' : 'barberos por talento o especialidad...'}`}
              className="w-full rounded-[30px] border border-white/5 bg-zinc-900/60 py-7 pl-20 pr-10 text-xl font-medium placeholder:text-zinc-700 focus:border-blue-500/30 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-zinc-800 rounded-full p-2 border border-white/5">
              <Filter className="h-4 w-4 text-zinc-500" />
            </div>
          </div>
        </div>

        {(tab === 'shops' ? filteredShops : filteredBarbers).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="h-20 w-20 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mb-6">
              <Search className="h-8 w-8 text-zinc-700" />
            </div>
            <p className="text-xl font-bold text-zinc-500">No se encontraron resultados para tu búsqueda.</p>
            <button onClick={() => setSearch('')} className="mt-6 text-sm font-black text-amber-500 uppercase tracking-widest hover:text-white transition">Limpiar Filtros</button>
          </div>
        ) : (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {tab === 'shops' ? filteredShops.map(shop => {
              const rank = getShopRank(shop.id);
              return (
                <div
                  key={shop.id}
                  onClick={() => setSelectedShop(shop.id)}
                  className={`group cursor-pointer rounded-[40px] border-2 bg-zinc-900/30 p-10 transition-all duration-500 hover:bg-zinc-900/60 hover:scale-[1.02] shadow-2xl ${rank.label === 'Legendary' ? 'border-amber-500/30 hover:border-amber-500 shadow-amber-500/10' :
                    rank.label === 'Elite' ? 'border-zinc-500/30 hover:border-zinc-500 shadow-zinc-500/10' :
                      rank.label === 'Pro' ? 'border-blue-500/30 hover:border-blue-500 shadow-blue-500/10' :
                        'border-white/5 hover:border-white/20'
                    }`}
                >
                  <div className={`mb-10 flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br text-3xl font-black text-black group-hover:scale-110 group-hover:rotate-3 transition-all ${rank.label === 'Legendary' ? 'from-amber-400 via-amber-600 to-amber-700' :
                    rank.label === 'Elite' ? 'from-zinc-300 via-zinc-500 to-zinc-600' :
                      rank.label === 'Pro' ? 'from-blue-400 via-blue-600 to-blue-700' :
                        'from-zinc-700 to-zinc-900 text-white'
                    }`}>
                    {shop.name[0]}
                  </div>
                  <h3 className={`text-3xl font-black mb-4 uppercase tracking-tighter transition-colors leading-none ${rank.label === 'Legendary' ? 'group-hover:text-amber-500' : rank.label === 'Pro' ? 'group-hover:text-blue-500' : 'group-hover:text-zinc-300'}`}>{shop.name}</h3>
                  <div className="space-y-3 mb-10">
                    <div className="flex items-center gap-3 text-sm font-semibold text-zinc-500">
                      <MapPin className="h-4 w-4 text-blue-500" /> {shop.address}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-semibold text-zinc-500">
                      <Star className={`h-4 w-4 ${rank.label === 'Legendary' ? 'fill-amber-500 text-amber-500' : 'fill-zinc-500 text-zinc-500'}`} /> {shop.rating} ({shop.reviewCount} reseñas)
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-8 border-t border-white/5">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${rank.color}`}>RANK: {rank.label}</span>
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            }) : filteredBarbers.map(barber => (
              <div
                key={barber.id}
                onClick={() => setViewingBarberProfile(barber)}
                className="group cursor-pointer rounded-[40px] border border-white/5 bg-zinc-900/30 p-10 transition-all duration-500 hover:bg-zinc-900/60 hover:border-blue-500/20 hover:scale-[1.02] text-center"
              >
                <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-fill border-2 border-white/10 p-2 group-hover:border-blue-500/30 transition-all">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-black text-3xl font-black uppercase transition-all overflow-hidden relative">
                    {barber.name[0]}
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-blue-500/20 blur-xl" />
                  </div>
                </div>
                <h3 className="text-3xl font-black mb-2 uppercase tracking-tighter leading-none">{barber.name}</h3>
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-500 mb-6">{barber.specialty}</p>

                <div className="flex flex-col items-center gap-4 py-8 border-y border-white/5 mb-8">
                  <div className="flex items-center gap-2 text-zinc-400 font-bold">
                    <Store className="h-4 w-4" /> {barber.barbershopName}
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < Math.floor(barber.rating) ? 'fill-amber-500 text-amber-500' : 'text-zinc-800'}`} />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                  Ver Perfil Completo <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 bg-black py-20 px-6">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-10 md:flex-row">
          <Logo />
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">
            © 2026 BARBEROS LM · SERIES PRO
          </div>
        </div>
      </footer>

      {/* Barber Profile Modal */}
      {viewingBarberProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
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
                      <StarSolid className="h-3.5 w-3.5 fill-current" />
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
                                <StarSolid key={i} className={`h-2.5 w-2.5 ${i < rev.rating ? 'text-yellow-400 fill-current' : 'text-zinc-700'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-zinc-400 italic">"{rev.comment}"</p>
                        </div>
                      ))}
                    {reviews.filter((r: any) => r.barberId === viewingBarberProfile.userId || r.barberId === viewingBarberProfile.id).length === 0 && (
                      <div className="text-center py-6 border-2 border-dashed border-white/5 rounded-2xl">
                        <StarSolid className="h-6 w-6 text-zinc-800 mx-auto mb-2" />
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
                  setSelectedShop(viewingBarberProfile.barbershopId);
                  setViewingBarberProfile(null);
                }}
                className="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-900 font-black text-sm uppercase tracking-tighter italic shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
              >
                Ver Barbería
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
