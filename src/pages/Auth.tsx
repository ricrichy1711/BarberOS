import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Mail, Lock, User, Phone, Store, AlertCircle, ArrowRight, Scissors } from 'lucide-react';
import { Logo } from '@/components/Logo';
import type { UserRole } from '@/types';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') || 'login';
  const initialRole = searchParams.get('role') as UserRole | null;
  const shopId = searchParams.get('shopId');

  const [mode, setMode] = useState<'login' | 'register'>(initialMode as 'login' | 'register');
  const [role, setRole] = useState<UserRole>(initialRole || 'client');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const { login, register } = useData();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        try {
          const ok = await login(email.trim(), password);
          if (!ok) {
            setError('❌ Email o contraseña incorrectos.\n\n📧 Si acabas de registrarte, asegúrate de haber confirmado tu email. Revisa tu bandeja de entrada y spam.');
            setIsSubmitting(false);
            return;
          }
          navigate('/');
        } catch (loginError: any) {
          console.error('Login error:', loginError);
          if (loginError.message?.includes('Timeout') || loginError.message?.includes('tardando')) {
            setError('⏱️ La operación tardó demasiado. Verifica tu conexión e intenta de nuevo.');
          } else if (loginError.message?.includes('Email not confirmed')) {
            setError('📧 Debes confirmar tu email antes de iniciar sesión.\n\nRevisa tu bandeja de entrada (y spam) para el correo de confirmación de Supabase.');
          } else {
            setError('❌ Error al iniciar sesión.\n\n📧 Si acabas de registrarte, confirma tu email primero. Revisa tu bandeja de entrada y spam.');
          }
          setIsSubmitting(false);
          return;
        }
      } else {
        if (!name || !email || !phone || !password || !confirmPassword) {
          setError('Todos los campos son obligatorios');
          setIsSubmitting(false);
          return;
        }

        if (!acceptedTerms) {
          setError('Debes aceptar los Términos de Uso y la Política de Privacidad para continuar.');
          setIsSubmitting(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden');
          setIsSubmitting(false);
          return;
        }

        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres');
          setIsSubmitting(false);
          return;
        }

        try {
          await register({ name, email, phone, password, role, barbershopId: shopId || undefined });

          // Mostrar mensaje de éxito con instrucciones
          setError('');
          alert('✅ ¡Registro exitoso!\n\n' +
            '📧 IMPORTANTE: Revisa tu email para confirmar tu cuenta.\n\n' +
            '📬 Busca un correo de Supabase en tu bandeja de entrada (y en spam).\n\n' +
            '⏰ Una vez que confirmes tu email, podrás iniciar sesión.');

          // Cambiar a modo login
          setMode('login');
          setIsSubmitting(false);
          return;
        } catch (regError: any) {
          console.error('Registration error:', regError);
          if (regError.message?.includes('already registered')) {
            setError('Este email ya está registrado. Si no has confirmado tu email, revisa tu bandeja de entrada (y spam) para el correo de confirmación.');
          } else if (regError.message?.includes('base de datos')) {
            setError('Error al guardar los datos. Por favor contacta al administrador.');
          } else {
            setError(regError.message || 'Error al registrarse. Intenta de nuevo.');
          }
          setIsSubmitting(false);
          return;
        }
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setError('Error de conexión con el servidor.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
        <div className="flex flex-col items-center mb-8 transform transition-all">
          <Logo className="mb-6 scale-110" />

          <h1 className="text-3xl font-bold text-white text-center">
            {mode === 'login' ? '¡Bienvenido de nuevo!' : 'Crea tu cuenta'}
          </h1>
          <p className="text-zinc-400 text-sm mt-2 text-center">
            {mode === 'login'
              ? 'Ingresa tus datos para acceder a tu panel de control.'
              : 'Únete a la nueva era de la barbería digital.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              {/* Role Selection */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Tipo de cuenta</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { r: 'client' as UserRole, label: 'Cliente', icon: User },
                    { r: 'barber' as UserRole, label: 'Barbero', icon: Scissors },
                    { r: 'owner' as UserRole, label: 'Dueño', icon: Store },
                  ].map(opt => (
                    <button
                      key={opt.r}
                      type="button"
                      onClick={() => setRole(opt.r)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-[10px] font-bold uppercase tracking-wider transition-all ${role === opt.r
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
                        }`}
                    >
                      <opt.icon className="h-5 w-5" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="register-name" className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    id="register-name"
                    name="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Escribe tu nombre"
                    autoComplete="name"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-amber-500/50 placeholder-zinc-600"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="register-phone" className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    id="register-phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+52 555 000 0000"
                    autoComplete="tel"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-amber-500/50 placeholder-zinc-600"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label htmlFor="auth-email" className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                id="auth-email"
                name="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-amber-500/50 placeholder-zinc-600"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="auth-password" className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                id="auth-password"
                name="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-amber-500/50 placeholder-zinc-600"
              />
            </div>
          </div>

          {/* Confirm Password */}
          {mode === 'register' && (
            <div>
              <label htmlFor="register-confirm-password" className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Confirmar Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Escribe de nuevo tu contraseña"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-amber-500/50 placeholder-zinc-600"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <label htmlFor="accept-terms" className="flex items-start gap-3 cursor-pointer group mt-1">
              <div className="flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  id="accept-terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${acceptedTerms
                    ? 'bg-amber-500 border-amber-500'
                    : 'bg-zinc-900 border-zinc-600 group-hover:border-amber-500/50'
                    }`}
                >
                  {acceptedTerms && (
                    <svg className="h-3 w-3 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                He leído y acepto los{' '}
                <Link to="/terms" className="text-amber-400 hover:underline font-bold" target="_blank">Términos y Condiciones de Uso</Link>
                {' '}y la{' '}
                <Link to="/privacy" className="text-amber-400 hover:underline font-bold" target="_blank">Política de Privacidad</Link>
                {' '}de BarberOs LM, incluyendo el uso de cookies y el tratamiento de mis datos personales conforme a la LFPDPPP.
              </p>
            </label>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-4 text-sm font-bold text-zinc-900 transition hover:shadow-lg hover:shadow-amber-400/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Procesando...' : (mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta')}
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-500">
          {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="ml-2 font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            {mode === 'login' ? 'Regístrate aquí' : 'Inicia Sesión'}
          </button>
        </p>
      </div>
    </div>
  );
}