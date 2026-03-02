import { Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import {
  Star, Users, Store, MessageSquare, Sparkles, ArrowRight, CheckCircle2
} from 'lucide-react';
import { Logo } from '@/components/Logo';

const reviews = [
  { name: 'Alejandro M.', rating: 5, comment: 'Increíble plataforma. Encontré al mejor barbero de mi zona en minutos. Muy fácil de usar.', date: 'Hace 2 días' },
  { name: 'Laura S.', rating: 5, comment: 'Como dueña de barbería, esta plataforma me ha ayudado a organizar todo. Mis clientes están más contentos.', date: 'Hace 1 semana' },
  { name: 'Roberto K.', rating: 4, comment: 'Gran concepto. Me encanta poder ver los perfiles de los barberos antes de reservar. Muy profesional.', date: 'Hace 2 semanas' },
  { name: 'Daniel F.', rating: 5, comment: 'Llevo 3 meses usando la app y no volvería atrás. Agendar citas nunca fue tan fácil.', date: 'Hace 3 semanas' },
  { name: 'Patricia R.', rating: 5, comment: 'Registré mi barbería y en la primera semana ya tenía nuevos clientes. ¡Excelente servicio!', date: 'Hace 1 mes' },
  { name: 'Marcos T.', rating: 4, comment: 'La comunicación directa con el barbero es genial. Se nota que cuidan cada detalle.', date: 'Hace 1 mes' },
];

export default function Home() {
  const { currentUser } = useData();

  return (
    <div className="min-h-screen selection:bg-amber-500/30 bg-[#050505] text-white overflow-hidden">
      {/* Navbar de Lujo */}
      <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 bg-black/60 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
          <Logo className="scale-100" />

          <div className="hidden items-center gap-10 md:flex">
            <Link to="/directory" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 transition hover:text-amber-500">
              Directorio
            </Link>
            <a href="#services" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 transition hover:text-amber-500">
              Servicios
            </a>
            <a href="#pricing" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 transition hover:text-amber-500">
              Planes
            </a>
          </div>

          <div className="flex items-center gap-6">
            {currentUser ? (
              <Link
                to={
                  currentUser.role === 'admin' ? '/admin' :
                    currentUser.role === 'owner' ? '/owner' :
                      currentUser.role === 'barber' ? '/barber' : '/client'
                }
                className="group relative flex items-center gap-2 rounded-xl border border-amber-500/30 bg-zinc-900/50 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-amber-500 transition-all hover:bg-zinc-900 hover:border-amber-500 hover:text-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              >
                <span>Panel</span>
                <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" />
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/auth?mode=login" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 transition hover:text-white">
                  Log In
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-amber-500 transition hover:bg-amber-500 hover:text-black"
                >
                  Registro
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="relative">
        {/* Decorative Barber Pole Effect (Extended to CTA) */}
        <div className="absolute left-0 top-0 bottom-[400px] w-2.5 barber-pole-border opacity-40 hidden lg:block z-20" />
        <div className="absolute right-0 top-0 bottom-[400px] w-2.5 barber-pole-border opacity-40 hidden lg:block z-20" />

        {/* Hero Section - Elite Barber Interior */}
        <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden">
          {/* Background Image - Verified Sharp URL */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2000&auto=format&fit=crop"
              alt="Barbería Moderna y Profesional"
              className="h-full w-full object-cover opacity-70 brightness-[0.45] scale-100 transition-transform duration-1000 group-hover:scale-105"
            />
            {/* Overlay Gradients - Softened for better visibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050505_90%)]" />
          </div>



          <div className="relative z-10 mx-auto max-w-[1400px] px-6 text-center pt-16">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-amber-400 backdrop-blur-md animate-pulse">
              <Sparkles className="h-3 w-3" />
              La Plataforma de Élite para Barberías
            </div>

            <h1 className="mx-auto max-w-5xl text-5xl font-black leading-[0.95] tracking-tighter sm:text-7xl lg:text-[90px]">
              ELEVA TU ESTILO <br />
              <span className="bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700 bg-clip-text text-transparent drop-shadow-[0_5px_15px_rgba(245,158,11,0.3)]">
                DOMINA EL ARTE
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-relaxed text-zinc-400 drop-shadow-md">
              BarberOs LM es el ecosistema definitivo donde la técnica se encuentra con la tecnología.
              Gestiona tu imperio y escala al siguiente nivel profesional.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-6 sm:flex-row">
              <Link
                to="/auth?mode=register"
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 px-8 py-4 text-sm font-black text-black transition hover:scale-105 sm:w-auto shadow-[0_10px_40px_rgba(245,158,11,0.3)]"
              >
                EMPIEZA GRATIS
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </Link>
              <Link
                to="/directory"
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold text-white transition hover:bg-white/10 sm:w-auto backdrop-blur-xl group hover:border-amber-500/30"
              >
                EXPLORAR EL DIRECTORIO
              </Link>
            </div>

            {/* Stats Grid - Golden Outlined Boxes with Pulsing Border only */}
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 max-w-5xl mx-auto items-center">
              {[
                { label: 'Crecimiento Negocio', val: '+35%' },
                { label: 'Ahorro en Gestión', val: '-12h' },
                { label: 'Asistencia Citas', val: '98%' },
                { label: 'Satisfacción VIP', val: '4.9/5' }
              ].map((stat, idx) => (
                <div key={idx} className="relative flex flex-col items-center p-4 group duration-500">
                  {/* Pulsing Border Div */}
                  <div className="absolute inset-0 rounded-2xl border border-amber-500/40 animate-pulse z-0" />
                  {/* Static content div */}
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="text-2xl md:text-3xl font-black text-white mb-1 group-hover:text-amber-400 transition-colors uppercase italic">
                      {stat.val}
                    </span>
                    <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-500 font-bold text-center leading-tight">
                      {stat.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Grid - Heavy Visuals */}
        <section id="services" className="relative py-24 px-6 bg-[#080808]">
          <div className="mx-auto max-w-[1250px]">
            <div className="mb-20 text-center">
              <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-amber-500 mb-4 drop-shadow-lg">Ecosistema Gold</h2>
              <h3 className="text-4xl font-black sm:text-6xl tracking-tighter">DISEÑADO PARA GANAR.</h3>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: Store,
                  title: 'Control de Negocio',
                  desc: 'Gestiona ingresos, gastos y agenda en tiempo real con precisión milimétrica.',
                  img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop'
                },
                {
                  icon: Users,
                  title: 'Gestión de Staff',
                  desc: 'Asigna sillas, monitorea el desempeño de tus barberos y automatiza comisiones.',
                  img: 'https://images.unsplash.com/photo-1512690196236-d5a03bc66205?q=80&w=800&auto=format&fit=crop'
                },
                {
                  icon: MessageSquare,
                  title: 'Smart Chat',
                  desc: 'Comunicación instantánea y profesional entre clientes, barberos y dueños.',
                  img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop'
                }
              ].map((item, i) => (
                <div key={i} className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-900/20 transition-all duration-700 hover:border-amber-500/40 hover:-translate-y-2">
                  <div className="aspect-[16/10] w-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent z-10" />
                    <img src={item.img} alt={item.title} className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105 opacity-70 group-hover:opacity-100" />
                  </div>
                  <div className="p-8 z-20">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-black transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-[0_5px_15px_rgba(245,158,11,0.3)]">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h4 className="mb-3 text-2xl font-black uppercase tracking-tight text-white italic bebas">{item.title}</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed font-medium transition-colors group-hover:text-white">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing - Gold Standard */}
        <section id="pricing" className="relative py-24 px-6 bg-gradient-to-b from-[#080808] to-[#050505]">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-20 text-center">
              <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-zinc-500 mb-4">Tu Inversión</h2>
              <h3 className="text-4xl font-black sm:text-6xl tracking-tighter">FORJA TU LEYENDA.</h3>
              <p className="mt-4 text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic">
                *Nota: Los precios mostrados son preferenciales y pueden ajustarse en futuras actualizaciones.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: 'Clásico',
                  price: '$0',
                  period: '/siempre',
                  features: ['1 Barbero independiente', 'Agenda Básica', 'Perfil en Directorio', 'Soporte via Email'],
                  color: 'border-white/5',
                  btnClass: 'bg-white/5 text-white hover:bg-white hover:text-black border-white/10'
                },
                {
                  name: 'Ejecutivo',
                  price: '$199',
                  period: '/mes',
                  features: ['Hasta 3 Barberos', 'Gestión de Sillas', 'Gestión de Gastos', 'Estadísticas Avanzadas', 'Sin Anuncios'],
                  popular: true,
                  color: 'border-amber-500/50',
                  btnClass: 'bg-amber-500 text-black hover:bg-amber-400 shadow-[0_5px_25px_rgba(245,158,11,0.3)]'
                },
                {
                  name: 'Imperial',
                  price: '$349',
                  period: '/mes',
                  features: ['6 Barberos', 'Todo lo de Ejecutivo', 'Soporte VIP 24/7', 'Prioridad en el Mapa', 'Análisis con IA'],
                  color: 'border-zinc-500/30',
                  btnClass: 'bg-white/5 text-white hover:bg-white hover:text-black border-white/10'
                }
              ].map((p, i) => (
                <div key={i} className={`relative overflow-hidden rounded-[3rem] border-2 ${p.color} bg-black/60 p-10 transition-all duration-500 hover:scale-[1.03] flex flex-col group`}>
                  <div className="absolute top-8 right-8 flex flex-col items-end gap-2">
                    <div className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-[8px] font-black uppercase tracking-widest text-amber-500 animate-pulse">
                      🚀 LANZAMIENTO
                    </div>
                    {p.popular && (
                      <div className="rounded-full bg-amber-500 px-5 py-1.5 text-[9px] font-black uppercase tracking-widest text-black shadow-lg">
                        BEST SELLER
                      </div>
                    )}
                  </div>
                  <div className="mb-10">
                    <h4 className="text-lg font-black uppercase tracking-[0.3em] text-zinc-500 italic mb-2 bebas">{p.name}</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black text-white italic bebas">{p.price}</span>
                      <span className="text-base font-bold text-zinc-600 font-serif italic">{p.period}</span>
                    </div>
                    <p className="text-[9px] font-bold text-zinc-700 mt-3 uppercase tracking-[0.2em] italic">MXN • MENSUAL</p>
                  </div>
                  <ul className="mb-10 space-y-4 flex-1">
                    {p.features.map((f, fi) => (
                      <li key={fi} className="flex items-center gap-4 text-zinc-400 font-medium text-base italic transition-colors group-hover:text-zinc-200">
                        <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full rounded-[1.5rem] py-5 text-xs font-black uppercase tracking-[0.3em] transition-all duration-300 border ${p.btnClass}`}>
                    SOLICITAR ACCESO
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials - Signature Style */}
        <section className="py-24 px-6 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
          <div className="mx-auto max-w-[1400px] overflow-hidden relative">
            <h2 className="text-center text-[12px] font-black uppercase tracking-[0.6em] text-amber-500/50 mb-16 serif-italic">EL VERDICTO DEL MAESTRO</h2>
            <div className="flex flex-wrap justify-center gap-8">
              {reviews.slice(0, 3).map((r, i) => (
                <div key={i} className="w-full max-w-sm rounded-[2.5rem] border border-white/5 bg-zinc-900/10 p-10 hover:bg-zinc-900/30 hover:border-amber-500/30 transition-all duration-500 group relative">
                  <div className="absolute top-0 right-0 p-8 opacity-10 scale-125 rotate-12 transition-transform group-hover:scale-[1.5] group-hover:opacity-20">
                    <Sparkles className="h-16 w-16 text-white" />
                  </div>
                  <div className="flex gap-1.5 mb-6">
                    {[...Array(5)].map((_, star) => (
                      <Star key={star} className={`h-4 w-4 ${star < r.rating ? 'fill-amber-500 text-amber-500' : 'text-zinc-800'}`} />
                    ))}
                  </div>
                  <p className="text-lg serif-italic leading-relaxed text-zinc-300 mb-8 group-hover:text-white">"{r.comment}"</p>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-black text-lg text-black border-2 border-black ring-2 ring-amber-500/20">
                      {r.name[0]}
                    </div>
                    <div>
                      <div className="font-black uppercase tracking-[0.2em] text-white text-xs italic bebas">{r.name}</div>
                      <div className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest italic font-serif">{r.date || 'Cliente Verificado'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA - The Final Cut */}
        <section className="relative overflow-hidden bg-black py-32 px-6">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop"
              className="h-full w-full object-cover opacity-20 brightness-50 contrast-150 scale-100 blur-sm"
              alt="CTA Background"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center justify-center p-4 mb-10 rounded-2xl bg-amber-500 text-black shadow-[0_0_50px_rgba(245,158,11,0.5)]">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-5xl font-black sm:text-7xl tracking-tighter mb-8 italic bebas">
              EL PRÓXIMO <br />
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent animate-gradient-x">CORTE ES TUYO.</span>
            </h2>
            <p className="text-xl text-zinc-400 font-medium max-w-2xl mx-auto mb-12 leading-relaxed italic serif-italic">
              No somos una aplicación, somos el estándar de la industria.
              Eleva tu juego hoy mismo.
            </p>
            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
              <Link
                to="/auth?mode=register&role=owner"
                className="w-full sm:w-auto rounded-2xl bg-white px-12 py-6 font-black text-black shadow-2xl transition hover:scale-110 hover:shadow-white/20 uppercase tracking-[0.3em] text-xs italic"
              >
                REGISTRAR MI IMPERIO
              </Link>
              <Link
                to="/auth?mode=register"
                className="w-full sm:w-auto rounded-2xl border-2 border-white/20 bg-white/5 px-12 py-6 font-black text-white transition hover:border-amber-500 hover:text-amber-500 uppercase tracking-[0.3em] text-xs italic backdrop-blur-md"
              >
                SOY CLIENTE VIP
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/5 bg-black py-16 px-6 relative">
          <div className="mx-auto max-w-[1400px]">
            <div className="flex flex-col items-center justify-between gap-10 lg:flex-row">
              <div className="flex flex-col items-center lg:items-start gap-5">
                <Logo className="scale-110" />
                <p className="text-zinc-600 text-xs font-serif italic max-w-xs text-center lg:text-left">
                  El estándar de oro en la gestión de barberías modernas. Forjado para el éxito.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-10">
                <div className="flex flex-col gap-3 items-center lg:items-start text-center">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-500">Compañía</span>
                  <Link to="/about" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition italic">Sobre Nosotros</Link>
                  <Link to="/contact" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition italic">Contacto</Link>
                </div>
                <div className="flex flex-col gap-3 items-center lg:items-start">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-500">Legal</span>
                  <Link to="/privacy" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition italic">Privacidad</Link>
                  <Link to="/terms" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition italic">Términos</Link>
                </div>
              </div>
              <div className="pt-8 lg:pt-0 border-t lg:border-t-0 border-white/5 w-full lg:w-auto text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-700 italic">
                  © 2026 BARBEROS LM. TODOS LOS DERECHOS RESERVADOS.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
