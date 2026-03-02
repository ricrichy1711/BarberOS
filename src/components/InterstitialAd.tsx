import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { AdSlot } from './AdSlot';

interface InterstitialAdProps {
    isOpen: boolean;
    onClose: () => void;
}

export function InterstitialAd({ isOpen, onClose }: InterstitialAdProps) {
    const [canClose, setCanClose] = useState(false);
    const [countdown, setCountdown] = useState(3); // 3 seconds cooldown to ensure ad visibility

    useEffect(() => {
        if (isOpen) {
            setCanClose(false);
            setCountdown(3);
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setCanClose(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-3xl bg-zinc-900 border border-white/10 p-2 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <div>
                        <h3 className="text-sm font-bold text-white">Publicidad</h3>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Patrocinado</p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={!canClose}
                        className={`p-2 rounded-full transition-all ${canClose
                            ? 'bg-white/10 text-white hover:bg-white/20 hover:rotate-90'
                            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                            }`}
                    >
                        {canClose ? <X className="h-4 w-4" /> : <span className="text-[10px] font-bold w-4 h-4 flex items-center justify-center">{countdown}</span>}
                    </button>
                </div>

                {/* Ad Content */}
                <div className="p-4 bg-black/20 rounded-b-3xl min-h-[300px] flex items-center justify-center">
                    <AdSlot
                        adClient="ca-pub-3430296497693127"
                        adSlot="3388419234"
                        className="w-full h-full min-h-[250px]"
                    />
                </div>

                {/* Footer Action */}
                <div className="p-4">
                    <button
                        onClick={onClose}
                        disabled={!canClose}
                        className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${canClose
                            ? 'bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/10'
                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            }`}
                    >
                        {canClose ? 'Cerrar Publicidad' : `Cerrar en ${countdown}s`}
                    </button>
                </div>
            </div>
        </div>
    );
}
