import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Calendar, Users, DollarSign, Clock } from 'lucide-react';
import { DashboardSummary } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, todayRes] = await Promise.all([
          api.get('/api/dashboard/summary'),
          api.get('/api/dashboard/appointments/today')
        ]);

        setSummary(summaryRes.data);
        setTodayAppointments(todayRes.data);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-white text-center py-12">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-white">Dashboard</h1>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-400 text-sm">Total de Pacientes</p>
              <p className="text-4xl font-bold text-white mt-2">{summary?.totalPatients}</p>
            </div>
            <Users className="h-8 w-8 text-emerald-500" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-400 text-sm">Dentistas Ativos</p>
              <p className="text-4xl font-bold text-white mt-2">{summary?.activeDentists}</p>
            </div>
            <Users className="h-8 w-8 text-emerald-500" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-400 text-sm">Agendamentos Hoje</p>
              <p className="text-4xl font-bold text-white mt-2">{summary?.appointmentsToday}</p>
            </div>
            <Calendar className="h-8 w-8 text-emerald-500" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-400 text-sm">Receita do Mês</p>
              <p className="text-4xl font-bold text-white mt-2">
                R$ {summary?.monthlyRevenue?.toLocaleString('pt-BR') || '0'}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Agenda de Hoje */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="h-6 w-6 text-emerald-500" />
          <h2 className="text-2xl font-semibold text-white">
            Agenda de Hoje — {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
          </h2>
        </div>

        {todayAppointments.length === 0 ? (
          <p className="text-zinc-400 py-8 text-center">Nenhum agendamento para hoje.</p>
        ) : (
          <div className="space-y-4">
            {todayAppointments.slice(0, 10).map((app: any) => (
              <div
                key={app.id}
                className="flex justify-between items-center p-5 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold text-white text-lg">{app.patient?.name}</p>
                  <p className="text-zinc-400">Dr(a). {app.dentist?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-2xl text-emerald-400 font-medium">
                    {new Date(app.scheduledAt).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-xs uppercase tracking-widest text-zinc-500 mt-1">
                    {app.status?.replace('_', ' ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}