import { X, Calendar, TrendingUp, DollarSign, Scissors, User, XCircle, Download } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

interface MonthlyReportModalProps {
    monthKey: string; // "YYYY-MM"
    onClose: () => void;
    appointments: any[];
    expenses: any[];
    myShop: any;
}

export function MonthlyReportModal({ monthKey, onClose, appointments, expenses, myShop }: MonthlyReportModalProps) {
    const { barbers } = useData();

    const [year, month] = monthKey.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1);
    const monthName = dateObj.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

    // Filter Data
    const monthAppointments = appointments.filter(a => (a.date || '').startsWith(monthKey));
    const monthExpenses = expenses.filter(e => e.barbershopId === myShop.id && (e.date || '').startsWith(monthKey));

    // Stats
    const completedApts = monthAppointments.filter(a => a.status === 'completed');
    const cancelledApts = monthAppointments.filter(a => a.status === 'cancelled');

    const totalRevenue = completedApts.reduce((sum, a) => sum + (a.price || 0), 0);
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netIncome = totalRevenue - totalExpenses;

    const totalClients = new Set(completedApts.map(a => a.clientName || a.clientPhone)).size;

    // Top Barbers
    const barberStats = barbers.map(b => {
        const apts = completedApts.filter(a => a.barberId === b.id);
        const revenue = apts.reduce((sum, a) => sum + (a.price || 0), 0);
        return { name: b.name, count: apts.length, revenue };
    }).sort((a, b) => b.revenue - a.revenue);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:p-0 print:bg-white">
            <div className="bg-white text-black w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl print:w-full print:max-w-none print:max-h-none print:rounded-none print:shadow-none print:overflow-visible">

                {/* Header (Print & Screen) */}
                <div className="p-8 border-b border-zinc-200 flex items-start justify-between bg-zinc-50 print:bg-white">
                    <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Reporte Mensual</p>
                        <h2 className="text-3xl font-black text-zinc-900 capitalize mb-2">{monthName}</h2>
                        <p className="text-sm text-zinc-500 font-medium">{myShop.name} — Generado el {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-4 print:hidden">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition active:scale-95"
                        >
                            <Download className="h-4 w-4" />
                            Descargar PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="p-3 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-zinc-500 transition"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="p-8 space-y-8">

                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-6">
                        <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 print:border-zinc-200">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Ingresos Totales</p>
                            <p className="text-3xl font-black text-emerald-600">${totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 print:border-zinc-200">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Gastos Operativos</p>
                            <p className="text-3xl font-black text-red-500">-${totalExpenses.toLocaleString()}</p>
                        </div>
                        <div className="p-6 bg-zinc-900 text-white rounded-2xl print:bg-zinc-100 print:text-black print:border print:border-zinc-200">
                            <p className="text-xs font-bold text-zinc-400 print:text-zinc-500 uppercase tracking-widest mb-2">Utilidad Neta</p>
                            <p className="text-3xl font-black">${netIncome.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Operational Cloud */}
                    <div className="grid grid-cols-4 gap-4 p-6 bg-zinc-50 rounded-2xl border border-zinc-100 print:border-zinc-200">
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Citas Completadas</p>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-zinc-400" />
                                <span className="text-xl font-black text-zinc-700">{completedApts.length}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Cancelaciones</p>
                            <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-400" />
                                <span className="text-xl font-black text-zinc-700">{cancelledApts.length}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Clientes Únicos</p>
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-400" />
                                <span className="text-xl font-black text-zinc-700">{totalClients}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Ticket Promedio</p>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                                <span className="text-xl font-black text-zinc-700">
                                    ${completedApts.length ? Math.round(totalRevenue / completedApts.length).toLocaleString() : 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        {/* Top Barbers */}
                        <div>
                            <h3 className="text-lg font-black text-zinc-900 mb-4 flex items-center gap-2">
                                <Scissors className="h-5 w-5 text-zinc-400" /> Rendimiento Staff
                            </h3>
                            <div className="border border-zinc-100 rounded-xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-zinc-50 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Barbero</th>
                                            <th className="px-4 py-3 text-center">Citas</th>
                                            <th className="px-4 py-3 text-right">Generado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {barberStats.map((b, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-3 font-bold text-zinc-700">{b.name}</td>
                                                <td className="px-4 py-3 text-center text-zinc-500">{b.count}</td>
                                                <td className="px-4 py-3 text-right font-bold text-emerald-600">${b.revenue.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Expenses List */}
                        <div>
                            <h3 className="text-lg font-black text-zinc-900 mb-4 flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-zinc-400" /> Desglose de Gastos
                            </h3>
                            {monthExpenses.length > 0 ? (
                                <div className="border border-zinc-100 rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-zinc-50 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Concepto</th>
                                                <th className="px-4 py-3 text-right">Monto</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100">
                                            {monthExpenses.map((e, i) => (
                                                <tr key={i}>
                                                    <td className="px-4 py-3 text-zinc-600">{e.description}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-red-500">-${e.amount.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-8 bg-zinc-50 rounded-xl border border-zinc-100 text-center text-zinc-400 text-sm italic">
                                    No se registraron gastos este mes.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-zinc-50 border-t border-zinc-200 text-center">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        Documento Confidencial • Generado desde BarberOs LM
                    </p>
                </div>
            </div>
        </div>
    );
}
