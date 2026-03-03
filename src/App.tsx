import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider, useData } from '@/contexts/DataContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Logo } from '@/components/Logo';
import Home from '@/pages/Home';
import Directory from '@/pages/Directory';
import Auth from '@/pages/Auth';
import AuthCallback from '@/pages/AuthCallback';
import ClientDashboard from '@/pages/ClientDashboard';
import BarberDashboard from '@/pages/BarberDashboard';
import OwnerDashboard from '@/pages/OwnerDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfUse from '@/pages/TermsOfUse';
import AboutUs from '@/pages/AboutUs';
import ContactUs from '@/pages/ContactUs';
import CookieBanner from '@/components/CookieBanner';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { currentUser, loading } = useData();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4">
        <div className="flex flex-col items-center">
          <div className="relative mb-8 flex items-center justify-center p-4">
            {/* Anillo dorado giratorio */}
            <div className="absolute inset-0 rounded-full border-t-4 border-r-4 border-amber-500 border-opacity-80 animate-spin w-48 h-48 m-auto"></div>
            {/* Logo Estático Centrado */}
            <div className="z-10 scale-150 relative bg-zinc-950/50 backdrop-blur-sm rounded-3xl p-2">
              <Logo />
            </div>
          </div>
          <h2 className="text-xl font-bold text-amber-500 mb-2 animate-pulse">Cargando Plataforma...</h2>
          <p className="text-zinc-500 text-sm animate-pulse">Sincronizando base de datos</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/auth?mode=login" replace />;
  if (!allowedRoles.includes(currentUser.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
}

// Botón sol/luna renderizado fuera de #root (portal) — arrastrable por la pantalla.
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const saved = JSON.parse(localStorage.getItem('theme-btn-pos') || 'null');
  const [pos, setPos] = React.useState<{ x: number; y: number }>(
    saved || { x: window.innerWidth - 72, y: window.innerHeight - 120 }
  );
  const dragging = React.useRef(false);
  const offset = React.useRef({ x: 0, y: 0 });
  const moved = React.useRef(false);

  const onStart = (clientX: number, clientY: number) => {
    dragging.current = true;
    moved.current = false;
    offset.current = { x: clientX - pos.x, y: clientY - pos.y };
  };

  const onMove = (clientX: number, clientY: number) => {
    if (!dragging.current) return;
    moved.current = true;
    const x = Math.min(Math.max(0, clientX - offset.current.x), window.innerWidth - 48);
    const y = Math.min(Math.max(0, clientY - offset.current.y), window.innerHeight - 48);
    setPos({ x, y });
  };

  const onEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    localStorage.setItem('theme-btn-pos', JSON.stringify(pos));
  };

  React.useEffect(() => {
    const mm = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const tm = (e: TouchEvent) => onMove(e.touches[0].clientX, e.touches[0].clientY);
    const mu = () => onEnd();
    window.addEventListener('mousemove', mm);
    window.addEventListener('mouseup', mu);
    window.addEventListener('touchmove', tm);
    window.addEventListener('touchend', mu);
    return () => {
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mouseup', mu);
      window.removeEventListener('touchmove', tm);
      window.removeEventListener('touchend', mu);
    };
  });

  return createPortal(
    <button
      onMouseDown={(e) => { e.preventDefault(); onStart(e.clientX, e.clientY); }}
      onTouchStart={(e) => onStart(e.touches[0].clientX, e.touches[0].clientY)}
      onClick={() => { if (!moved.current) toggleTheme(); }}
      style={{ left: pos.x, top: pos.y, position: 'fixed' }}
      className="z-[9999] h-12 w-12 rounded-full bg-amber-500 text-zinc-900 shadow-xl shadow-amber-500/20 flex items-center justify-center hover:scale-110 transition-transform select-none cursor-grab active:cursor-grabbing"
      title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
    >
      {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
    </button>,
    document.body
  );
}

function AppRoutes() {
  return (
    <>
      <ThemeToggle />
      <CookieBanner />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/directory" element={<Directory />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfUse />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route
          path="/client"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/barber"
          element={
            <ProtectedRoute allowedRoles={['barber']}>
              <BarberDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}