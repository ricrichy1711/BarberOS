import { useState } from 'react';
import { Clock, Check, X, Scissors, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { AdSlot } from '@/components/AdSlot';
import type { Barbershop, Barber } from '@/types';

interface BookingWidgetProps {
    barbershop: Barbershop;
    barbers: Barber[];
    onClose: () => void;
}

export function BookingWidget({ barbershop, barbers, onClose }: BookingWidgetProps) {
    const { currentUser, addAppointment } = useData();
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedBarber, setSelectedBarber] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [isConfirmedPunctual, setIsConfirmedPunctual] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check if barbershop has required data
    const hasServices = barbershop.services && barbershop.services.length > 0;
    const hasBarbers = barbers && barbers.length > 0;
    const hasBusinessHours = barbershop.businessHours && Object.keys(barbershop.businessHours).length > 0;

    // Generate available dates (next 30 days, excluding closed dates and barber off days)
    const getAvailableDates = () => {
        const dates: string[] = [];
        const today = new Date();

        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dayOfWeek = date.getDay().toString();

            // Check if barbershop is closed on this date
            const isClosed = barbershop.closedDates?.some(cd => cd.date === dateStr);
            if (isClosed) continue;

            // Check if selected barber is off on this day
            if (selectedBarber) {
                const barber = barbers.find(b => b.id === selectedBarber);
                if (barber?.offDays?.includes(dayOfWeek)) continue;
            }

            dates.push(dateStr);
        }

        return dates;
    };

    // Generate available time slots
    const getAvailableTimeSlots = () => {
        if (!selectedDate || !selectedBarber || !hasBusinessHours) return [];

        const barber = barbers.find(b => b.id === selectedBarber);
        if (!barber) return [];

        const slots: string[] = [];
        const dayOfWeek = new Date(selectedDate + 'T00:00:00').getDay().toString();

        // Map 0-6 to day names used in DB
        const dayNames: Record<string, string> = {
            '0': 'sunday', '1': 'monday', '2': 'tuesday',
            '3': 'wednesday', '4': 'thursday', '5': 'friday', '6': 'saturday'
        };
        const dayName = dayNames[dayOfWeek];

        // Get business hours for the selected day (try name first, then number for fallback)
        const businessHours = barbershop.businessHours?.[dayName] || barbershop.businessHours?.[dayOfWeek];

        if (!businessHours || businessHours.closed || !businessHours.open || !businessHours.close) {
            console.log('No business hours for day:', dayName, businessHours);
            return [];
        }

        const [openHour, openMin] = businessHours.open.split(':').map(Number);
        const [closeHour, closeMin] = businessHours.close.split(':').map(Number);

        // Generate 30-minute slots
        let currentHour = openHour;
        let currentMin = openMin;

        while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
            const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;

            // Check if time is during lunch break
            const lunchStart = barber.lunchBreak?.start;
            const lunchEnd = barber.lunchBreak?.end;

            const isLunchTime = lunchStart && lunchEnd && timeStr >= lunchStart && timeStr < lunchEnd;

            if (!isLunchTime) {
                slots.push(timeStr);
            }

            // Increment by 30 minutes
            currentMin += 30;
            if (currentMin >= 60) {
                currentMin = 0;
                currentHour += 1;
            }
        }

        console.log('Generated slots for', selectedDate, ':', slots);
        return slots;
    };

    const handleSubmit = async () => {
        if (!currentUser || !selectedDate || !selectedTime || !selectedBarber || !selectedService) {
            return;
        }

        setIsSubmitting(true);

        const barber = barbers.find(b => b.id === selectedBarber);
        const service = barbershop.services?.find(s => s.name === selectedService);

        if (!barber || !service) {
            setIsSubmitting(false);
            return;
        }

        await addAppointment({
            clientId: currentUser.id,
            clientName: currentUser.name,
            clientPhone: currentUser.phone,
            barberId: barber.id,
            barberName: barber.name,
            barbershopId: barbershop.id,
            barbershopName: barbershop.name,
            service: service.name,
            date: selectedDate,
            time: selectedTime,
            status: 'pending',
            price: service.price,
        });

        setIsSubmitting(false);
        onClose();
    };

    const availableDates = getAvailableDates();
    const availableTimeSlots = getAvailableTimeSlots();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black uppercase tracking-tight">Reservar Cita</h2>
                    <button
                        onClick={onClose}
                        className="h-10 w-10 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Error Messages */}
                {!hasServices && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-6">
                        <p className="text-red-500 font-bold text-sm">⚠️ Esta barbería aún no ha configurado sus servicios.</p>
                        <p className="text-zinc-500 text-xs mt-2">Por favor contacta directamente con la barbería.</p>
                    </div>
                )}

                {!hasBarbers && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-6">
                        <p className="text-red-500 font-bold text-sm">⚠️ Esta barbería no tiene barberos disponibles.</p>
                        <p className="text-zinc-500 text-xs mt-2">Por favor contacta directamente con la barbería.</p>
                    </div>
                )}

                {!hasBusinessHours && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-6">
                        <p className="text-red-500 font-bold text-sm">⚠️ Esta barbería aún no ha configurado sus horarios.</p>
                        <p className="text-zinc-500 text-xs mt-2">Configura los horarios en Owner Dashboard → Mi Negocio → Horarios de Atención</p>
                    </div>
                )}

                {hasServices && hasBarbers && hasBusinessHours ? (
                    <div className="space-y-4">
                        {/* 1. Service Selection */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">
                                    1. Servicio
                                </label>
                                {selectedService && (
                                    <button
                                        onClick={() => {
                                            setSelectedService('');
                                            setSelectedBarber('');
                                            setSelectedDate('');
                                            setSelectedTime('');
                                        }}
                                        className="text-[10px] font-bold text-emerald-400 hover:underline bg-emerald-500/10 px-2 py-1 rounded"
                                    >
                                        Cambiar
                                    </button>
                                )}
                            </div>

                            {selectedService ? (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between animate-in zoom-in-95 duration-200">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                            <Scissors className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white">{selectedService}</p>
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                                ${barbershop.services?.find(s => s.name === selectedService)?.price} · {barbershop.services?.find(s => s.name === selectedService)?.duration} min
                                            </p>
                                        </div>
                                    </div>
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                </div>
                            ) : (
                                <div className="flex gap-2 overflow-x-auto pb-2 animate-in fade-in slide-in-from-top-1">
                                    {barbershop.services?.map(service => (
                                        <button
                                            key={service.name}
                                            onClick={() => setSelectedService(service.name)}
                                            className="flex-shrink-0 px-5 py-3 rounded-2xl border-2 border-white/5 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
                                        >
                                            <p className="font-black text-xs text-white group-hover:text-emerald-400 transition-colors">{service.name}</p>
                                            <p className="text-[10px] text-zinc-500 group-hover:text-zinc-400">${service.price} · {service.duration}min</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 2. Barber Selection */}
                        {selectedService && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">
                                        2. Barbero
                                    </label>
                                    {selectedBarber && (
                                        <button
                                            onClick={() => {
                                                setSelectedBarber('');
                                                setSelectedDate('');
                                                setSelectedTime('');
                                            }}
                                            className="text-[10px] font-bold text-emerald-400 hover:underline bg-emerald-500/10 px-2 py-1 rounded"
                                        >
                                            Cambiar
                                        </button>
                                    )}
                                </div>

                                {selectedBarber ? (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between animate-in zoom-in-95 duration-200">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 font-black text-lg">
                                                {barbers.find(b => b.id === selectedBarber)?.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white">{barbers.find(b => b.id === selectedBarber)?.name}</p>
                                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                                    {barbers.find(b => b.id === selectedBarber)?.specialty}
                                                </p>
                                            </div>
                                        </div>
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    </div>
                                ) : (
                                    <div className="flex gap-2 overflow-x-auto pb-2 animate-in fade-in slide-in-from-top-1">
                                        {barbers.map(barber => (
                                            <button
                                                key={barber.id}
                                                onClick={() => setSelectedBarber(barber.id)}
                                                className="flex-shrink-0 px-5 py-3 rounded-2xl border-2 border-white/5 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group flex items-center gap-3"
                                            >
                                                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center font-black text-zinc-400 text-xs border border-white/5 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                    {barber.name[0]}
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-black text-xs text-white group-hover:text-emerald-400 transition-colors">{barber.name}</p>
                                                    <p className="text-[10px] text-zinc-500 group-hover:text-zinc-400">{barber.specialty}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Date Selection - Compact Calendar */}
                        {selectedBarber && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">
                                        3. Fecha
                                    </label>
                                    {selectedDate && (
                                        <button
                                            onClick={() => setSelectedDate('')}
                                            className="text-[10px] font-bold text-emerald-400 hover:underline bg-emerald-500/10 px-2 py-1 rounded"
                                        >
                                            Cambiar Fecha
                                        </button>
                                    )}
                                </div>

                                {selectedDate ? (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between animate-in zoom-in-95 duration-200">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-emerald-500 flex flex-col items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                                <span className="text-[10px] font-black uppercase leading-none">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short' })}</span>
                                                <span className="text-lg font-black leading-none">{new Date(selectedDate + 'T00:00:00').getDate()}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white capitalize">
                                                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long' })}
                                                </p>
                                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Fecha Seleccionada</p>
                                            </div>
                                        </div>
                                        <Check className="h-5 w-5 text-emerald-500" />
                                    </div>
                                ) : (
                                    <div className="bg-black/20 border border-white/5 rounded-xl p-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        {(() => {
                                            const today = new Date();
                                            const currentMonth = today.getMonth();
                                            const currentYear = today.getFullYear();

                                            const firstDay = new Date(currentYear, currentMonth, 1);
                                            const lastDay = new Date(currentYear, currentMonth + 1, 0);
                                            const daysInMonth = lastDay.getDate();
                                            const startingDayOfWeek = firstDay.getDay();

                                            const calendarDays = [];
                                            for (let i = 0; i < startingDayOfWeek; i++) {
                                                calendarDays.push(null);
                                            }
                                            for (let day = 1; day <= daysInMonth; day++) {
                                                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                                calendarDays.push(dateStr);
                                            }

                                            const monthName = firstDay.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                                            const weekDays = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

                                            return (
                                                <>
                                                    <div className="text-center mb-2">
                                                        <h3 className="text-xs font-black uppercase text-white">
                                                            {monthName}
                                                        </h3>
                                                    </div>

                                                    <div className="grid grid-cols-7 gap-1 mb-1">
                                                        {weekDays.map(day => (
                                                            <div key={day} className="text-center text-[8px] font-black text-zinc-600 uppercase">
                                                                {day}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="grid grid-cols-7 gap-1">
                                                        {calendarDays.map((dateStr, index) => {
                                                            if (!dateStr) {
                                                                return <div key={`empty-${index}`} className="aspect-square" />;
                                                            }

                                                            const isAvailable = availableDates.includes(dateStr);
                                                            const isSelected = selectedDate === dateStr;
                                                            const isToday = dateStr === new Date().toISOString().split('T')[0];
                                                            const dayNumber = new Date(dateStr + 'T00:00:00').getDate();

                                                            return (
                                                                <button
                                                                    key={dateStr}
                                                                    onClick={() => {
                                                                        if (isAvailable) {
                                                                            setSelectedDate(dateStr);
                                                                            setSelectedTime('');
                                                                        }
                                                                    }}
                                                                    disabled={!isAvailable}
                                                                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-black transition-all ${isSelected
                                                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50'
                                                                        : isAvailable
                                                                            ? isToday
                                                                                ? 'bg-amber-500/20 text-amber-500 hover:bg-emerald-500/20 hover:text-emerald-500'
                                                                                : 'bg-white/5 text-white hover:bg-emerald-500/20 hover:text-emerald-500'
                                                                            : 'bg-transparent text-zinc-800 cursor-not-allowed text-[10px]'
                                                                        }`}
                                                                >
                                                                    {dayNumber}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Time Selection - Grid Layout */}
                        {selectedDate && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">
                                        4. Hora
                                    </label>
                                    {selectedTime && (
                                        <button
                                            onClick={() => setSelectedTime('')}
                                            className="text-[10px] font-bold text-emerald-400 hover:underline bg-emerald-500/10 px-2 py-1 rounded"
                                        >
                                            Cambiar
                                        </button>
                                    )}
                                </div>

                                {selectedTime ? (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between animate-in zoom-in-95 duration-200">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                                <Clock className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-white">{selectedTime}</p>
                                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Hora Seleccionada</p>
                                            </div>
                                        </div>
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    </div>
                                ) : (
                                    availableTimeSlots.length > 0 ? (
                                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 animate-in fade-in slide-in-from-top-1">
                                            {availableTimeSlots.map(time => (
                                                <button
                                                    key={time}
                                                    onClick={() => setSelectedTime(time)}
                                                    className="py-3 rounded-xl border border-white/5 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-xs font-black text-center text-white"
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-zinc-500 text-xs italic p-4 bg-white/5 rounded-2xl text-center border border-white/5">
                                            No hay horarios disponibles para esta fecha.
                                        </p>
                                    )
                                )}
                            </div>
                        )}

                        {/* Summary and Punctuality Check */}
                        {selectedService && selectedBarber && selectedDate && selectedTime && (
                            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 shadow-inner">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="h-4 w-4 text-emerald-500" />
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                            Resumen Final
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-zinc-500 font-bold uppercase">Servicio</p>
                                            <p className="font-black text-white">{selectedService}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-zinc-500 font-bold uppercase">Barbero</p>
                                            <p className="font-black text-white">{barbers.find(b => b.id === selectedBarber)?.name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-zinc-500 font-bold uppercase">Fecha</p>
                                            <p className="font-black text-white">
                                                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-zinc-500 font-bold uppercase">Hora</p>
                                            <p className="font-black text-white">{selectedTime}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-emerald-500/10">
                                        <div className="flex items-start gap-3 bg-black/40 p-4 rounded-xl border border-white/5">
                                            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-amber-500 text-xs font-black uppercase tracking-tight mb-1">Nota importante:</p>
                                                <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                                                    Recuerde llegar <span className="text-white font-black">10 o 15 minutos antes</span> de su cita y confirmar su llegada en su perfil al arribar al local.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsConfirmedPunctual(!isConfirmedPunctual)}
                                    className="w-full flex items-center gap-3 p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group"
                                >
                                    <div className={`h-6 w-6 rounded-lg flex items-center justify-center transition-all ${isConfirmedPunctual ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-800 text-zinc-600 border border-white/5'}`}>
                                        {isConfirmedPunctual && <Check className="h-4 w-4" />}
                                    </div>
                                    <span className={`text-[11px] font-black uppercase tracking-wide transition-colors ${isConfirmedPunctual ? 'text-white' : 'text-zinc-500'}`}>
                                        Confirmo que asistiré puntual
                                    </span>
                                </button>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedService || !selectedBarber || !selectedDate || !selectedTime || !isConfirmedPunctual || isSubmitting}
                            className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl ${!selectedService || !selectedBarber || !selectedDate || !selectedTime || !isConfirmedPunctual || isSubmitting
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed grayscale'
                                : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-emerald-500/20 active:scale-[0.98]'
                                }`}
                        >
                            {isSubmitting ? (
                                'Procesando...'
                            ) : (
                                <>
                                    <Check className="h-4 w-4" />
                                    Finalizar Reserva
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-zinc-500 text-sm">Por favor contacta directamente con la barbería para hacer tu reserva.</p>
                        <div className="mt-6 space-y-2">
                            {barbershop.phone && (
                                <p className="text-white font-bold">📞 {barbershop.phone}</p>
                            )}
                            {barbershop.email && (
                                <p className="text-white font-bold">✉️ {barbershop.email}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Optional Ad Slot for Free Barbershops */}
                {(barbershop.plan === 'free' || barbershop.plan === 'basic') && (
                    <div className="mt-8 pt-6 border-t border-white/5">
                        <AdSlot
                            adClient="ca-pub-3430296497693127"
                            adSlot="1815048346"
                            adFormat="auto"
                            className="h-24 sm:h-32"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
