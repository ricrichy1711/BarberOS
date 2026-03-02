import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Cookie } from 'lucide-react';

const STORAGE_KEY = 'barberos_cookie_consent';

function hasConsented(): boolean {
    try {
        return localStorage.getItem(STORAGE_KEY) === 'accepted';
    } catch {
        return false;
    }
}

function setConsented(): void {
    try {
        localStorage.setItem(STORAGE_KEY, 'accepted');
    } catch {
        // silencioso
    }
}

export default function CookieBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!hasConsented()) {
            const t = setTimeout(() => setVisible(true), 800);
            return () => clearTimeout(t);
        }
    }, []);

    const handleAccept = () => {
        setConsented();
        setVisible(false);
    };

    // Al interactuar con la página (scroll o click fuera), aceptar implícitamente
    useEffect(() => {
        if (!visible) return;

        const handleImplicit = () => {
            setConsented();
            setVisible(false);
        };

        const timer = setTimeout(() => {
            window.addEventListener('scroll', handleImplicit, { once: true, passive: true });
        }, 2000); // espera 2s antes de activar aceptación implícita por scroll

        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', handleImplicit);
        };
    }, [visible]);

    if (!visible) return null;

    return (
        <div
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9990] w-[calc(100%-2rem)] max-w-xl"
            style={{
                animation: 'cookieSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
        >
            <style>{`
        @keyframes cookieSlideUp {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to   { transform: translate(-50%, 0);    opacity: 1; }
        }
      `}</style>

            <div className="flex items-center gap-3 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl shadow-black/50">
                {/* Icono */}
                <Cookie className="h-4 w-4 text-amber-400 flex-shrink-0" />

                {/* Texto */}
                <p className="text-xs text-zinc-400 leading-snug flex-1 min-w-0">
                    Al usar esta web aceptas nuestros{' '}
                    <Link
                        to="/terms"
                        target="_blank"
                        className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
                    >
                        Términos
                    </Link>{' '}
                    y{' '}
                    <Link
                        to="/privacy"
                        target="_blank"
                        className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
                    >
                        Privacidad
                    </Link>
                    .
                </p>

                {/* Botón aceptar */}
                <button
                    onClick={handleAccept}
                    className="flex-shrink-0 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-black text-[10px] uppercase tracking-widest rounded-lg transition-all"
                >
                    Aceptar
                </button>

                {/* Cerrar (acepta implícitamente) */}
                <button
                    onClick={handleAccept}
                    className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 transition-all"
                    title="Cerrar"
                >
                    <X className="h-3 w-3" />
                </button>
            </div>
        </div>
    );
}
