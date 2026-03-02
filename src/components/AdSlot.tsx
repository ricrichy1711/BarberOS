import { useEffect } from 'react';

declare global {
    interface Window {
        adsbygoogle: { push: (opts: object) => void }[];
    }
}

interface AdSlotProps {
    adClient: string;
    adSlot: string;
    adFormat?: string;
    fullWidthResponsive?: boolean;
    className?: string;
}

/**
 * Componente AdSlot — carga anuncios de Google AdSense.
 * El consentimiento del usuario ya fue verificado por el CookieBanner
 * (consent wall) antes de que pudiera acceder a la plataforma.
 */
export function AdSlot({
    adClient,
    adSlot,
    adFormat = 'auto',
    fullWidthResponsive = true,
    className = ''
}: AdSlotProps) {

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const timer = setTimeout(() => {
                    ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
                }, 100);
                return () => clearTimeout(timer);
            } catch (e) {
                console.warn('AdSense initialization suppressed:', e);
            }
        }
    }, [adSlot]);

    return (
        <div className={`ad-wrapper relative overflow-hidden rounded-2xl bg-zinc-900/40 border border-white/5 flex items-center justify-center ${className}`}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block', minWidth: '250px', minHeight: '90px' }}
                data-ad-client={adClient}
                data-ad-slot={adSlot}
                data-ad-format={adFormat}
                data-full-width-responsive={fullWidthResponsive.toString()}
            />
        </div>
    );
}
