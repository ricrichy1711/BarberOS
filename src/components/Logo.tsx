import { Link } from 'react-router-dom';

interface LogoProps {
    className?: string;
    noLink?: boolean;
}

export function Logo({ className = "", noLink = false }: LogoProps) {
    const content = (
        <div className="relative transition-all duration-300 hover:scale-[1.05] active:scale-95 drop-shadow-[0_0_15px_rgba(251,191,36,0.1)]">
            <svg width="240" height="90" viewBox="47.5 30 340 125" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-auto h-12 md:h-14 lg:h-16">
                <defs>
                    {/* Gradiente Dorado de la Web */}
                    <linearGradient id="logoGoldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#fde68a" />
                        <stop offset="50%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>

                    {/* Brillo Decorativo */}
                    <linearGradient id="logoShine" x1="47.5" y1="30" x2="387.5" y2="155" gradientUnits="userSpaceOnUse">
                        <stop stopColor="white" stopOpacity="0.05" />
                        <stop offset="0.5" stopColor="white" stopOpacity="0" />
                        <stop offset="1" stopColor="white" stopOpacity="0.05" />
                    </linearGradient>
                </defs>

                {/* Fondo */}
                <rect x="47.5" y="30" width="340" height="125" rx="36" fill="#050505" />
                <rect x="49.5" y="32" width="336" height="121" rx="34" stroke="#d97706" strokeWidth="4" strokeOpacity="0.6" />

                {/* OS de Fondo */}
                <g>
                    <text x="200" y="124" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontStyle="italic" fontSize="105" fill="none" stroke="#1E3A8A" strokeWidth="1.5" strokeOpacity="0.3" letterSpacing="0">OS</text>
                    <text x="200" y="124" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontStyle="italic" fontSize="105" fill="none" stroke="#60a5fa" strokeWidth="0.2" strokeOpacity="0.8" letterSpacing="0">OS</text>
                    {/* Efecto Doble con el mismo azul claro */}
                    <text x="203" y="124" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontStyle="italic" fontSize="105" fill="none" stroke="#60a5fa" strokeWidth="0.3" strokeOpacity="0.6" letterSpacing="0">OS</text>
                </g>

                {/* BARBER */}
                <text x="200" y="95" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="48" fill="url(#logoGoldGradient)" letterSpacing="8" transform="skewX(-10) translate(35, 0)">BARBER</text>

                {/* LM */}
                <text x="200" y="122" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="28" fill="#00A86B" letterSpacing="12" transform="skewX(-10) translate(35, 0)">LM</text>

                {/* Capa de Brillo */}
                <rect x="47.5" y="30" width="340" height="125" rx="36" fill="url(#logoShine)" pointerEvents="none" />
            </svg>
        </div>
    );

    if (noLink) {
        return <div className={`flex items-center group ${className}`}>{content}</div>;
    }

    return (
        <Link to="/" className={`flex items-center group cursor-pointer ${className}`}>
            {content}
        </Link>
    );
}
