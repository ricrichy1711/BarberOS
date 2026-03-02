import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Appointment } from '@/types';

type ColorTheme = 'emerald' | 'amber' | 'blue' | 'purple';

interface Props {
    appointments: Appointment[];
    selectedDate: string | null;
    onDateSelect: (date: string) => void;
    color?: ColorTheme;
}

export function MiniCalendar({ appointments, selectedDate, onDateSelect, color = 'emerald' }: Props) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const today = new Date().toISOString().split('T')[0];
    const numDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

    const hasAppointment = (day: number) => {
        const d = new Date(year, month, day).toLocaleDateString('en-CA');
        return appointments.some(a => a.date === d);
    };

    const isSelected = (day: number) => {
        const d = new Date(year, month, day).toLocaleDateString('en-CA');
        return selectedDate === d;
    };

    const isToday = (day: number) => {
        const d = new Date(year, month, day).toLocaleDateString('en-CA');
        return today === d;
    };

    // Color Maps
    const theme = {
        emerald: {
            selected: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20',
            today: 'text-emerald-400 border border-emerald-500/30',
            dot: 'bg-emerald-500'
        },
        amber: {
            selected: 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/20 font-bold',
            today: 'text-amber-400 border border-amber-500/30',
            dot: 'bg-amber-500'
        },
        blue: {
            selected: 'bg-blue-500 text-white shadow-lg shadow-blue-500/20',
            today: 'text-blue-400 border border-blue-500/30',
            dot: 'bg-blue-500'
        },
        purple: {
            selected: 'bg-purple-500 text-white shadow-lg shadow-purple-500/20',
            today: 'text-purple-400 border border-purple-500/30',
            dot: 'bg-purple-500'
        }
    };

    const activeTheme = theme[color];

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-zinc-300">
                    {currentMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex gap-1">
                    <button onClick={prevMonth} className="p-1 hover:bg-zinc-800 rounded"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={nextMonth} className="p-1 hover:bg-zinc-800 rounded"><ChevronRight className="w-4 h-4" /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(d => (
                    <div key={d} className="text-[10px] font-bold text-zinc-600">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-8" />
                ))}
                {Array.from({ length: numDays }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = new Date(year, month, day).toLocaleDateString('en-CA');
                    const hasAppt = hasAppointment(day);
                    const selected = isSelected(day);
                    const todayMarker = isToday(day);

                    return (
                        <button
                            key={day}
                            onClick={() => onDateSelect(dateStr)}
                            className={`
                h-8 text-xs font-medium rounded-lg relative transition-all
                ${selected ? activeTheme.selected : 'hover:bg-zinc-800 text-zinc-400'}
                ${todayMarker && !selected ? activeTheme.today : ''}
              `}
                        >
                            {day}
                            {hasAppt && !selected && (
                                <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${activeTheme.dot}`} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

