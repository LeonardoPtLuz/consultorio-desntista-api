import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { Appointment, Patient, Dentist, Treatment, PageResponse, AppointmentStatus } from '../../types';
import { Plus, X, Edit2, Trash2, ChevronLeft, ChevronRight, Calendar, Filter } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  AGENDADO: 'Agendado',
  CONFIRMADO: 'Confirmado',
  EM_ATENDIMENTO: 'Em atendimento',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
  NAO_COMPARECEU: 'Não compareceu',
};

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  AGENDADO: 'bg-blue-900/40 text-blue-400 border-blue-800/50',
  CONFIRMADO: 'bg-emerald-900/40 text-emerald-400 border-emerald-800/50',
  EM_ATENDIMENTO: 'bg-yellow-900/40 text-yellow-400 border-yellow-800/50',
  CONCLUIDO: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  CANCELADO: 'bg-red-900/40 text-red-400 border-red-800/50',
  NAO_COMPARECEU: 'bg-orange-900/40 text-orange-400 border-orange-800/50',
};

const emptyForm = {
  patientId: '' as any, dentistId: '' as any, treatmentId: '' as any,
  scheduledAt: '', durationMinutes: 30, notes: '',
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusModal, setStatusModal] = useState<Appointment | null>(null);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newStatus, setNewStatus] = useState<AppointmentStatus>('AGENDADO');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<PageResponse<Appointment>>('/api/appointments', { params: { page, size: 15 } });
      setAppointments(res.data.content);
      setTotal(res.data.totalElements);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    api.get<Patient[]>('/api/patients').then(r => setPatients(r.data.content || r.data)).catch(() => {});
    api.get<Dentist[]>('/api/dentists').then(r => setDentists(r.data)).catch(() => {});
    api.get<Treatment[]>('/api/treatments').then(r => setTreatments(r.data)).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null); setForm(emptyForm); setError(''); setModalOpen(true);
  };
  const openEdit = (a: Appointment) => {
    setEditing(a);
    setForm({
      patientId: a.patient.id, dentistId: a.dentist.id, treatmentId: a.treatment?.id || '',
      scheduledAt: a.scheduledAt.slice(0, 16), durationMinutes: a.durationMinutes, notes: a.notes || '',
    });
    setError(''); setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const payload = {
        patientId: Number(form.patientId), dentistId: Number(form.dentistId),
        treatmentId: form.treatmentId ? Number(form.treatmentId) : undefined,
        scheduledAt: form.scheduledAt + ':00', durationMinutes: Number(form.durationMinutes), notes: form.notes,
      };
      if (editing) await api.put(`/appointments/${editing.id}`, payload);
      else await api.post('/appointments', payload);
      setModalOpen(false); load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erro ao salvar agendamento');
    } finally { setSaving(false); }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Cancelar este agendamento?')) return;
    try { await api.patch(`/appointments/${id}/cancel`); load(); } catch { /* ignore */ }
  };

  const handleStatusChange = async () => {
    if (!statusModal) return;
    try { await api.patch(`/appointments/${statusModal.id}/status`, null, { params: { status: newStatus } }); setStatusModal(null); load(); } catch { /* ignore */ }
  };

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const filtered = filterStatus ? appointments.filter(a => a.status === filterStatus) : appointments;
  const totalPages = Math.ceil(total / 15);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white">Agendamentos</h1>
          <p className="text-zinc-400 mt-1">{total} agendamentos</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-3 rounded-xl transition-colors">
          <Plus size={18} /> Novo Agendamento
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterStatus('')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!filterStatus ? 'bg-emerald-600 text-white' : 'bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white'}`}>Todos</button>
        {Object.entries(STATUS_LABELS).map(([k, v]) => (
          <button key={k} onClick={() => setFilterStatus(k)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterStatus === k ? 'bg-emerald-600 text-white' : 'bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white'}`}>{v}</button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Data/Hora', 'Paciente', 'Dentista', 'Tratamento', 'Duração', 'Status', 'Ações'].map(h => (
                <th key={h} className="text-left text-xs uppercase tracking-widest text-zinc-500 px-5 py-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center text-zinc-400 py-12">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-zinc-400 py-12">Nenhum agendamento encontrado.</td></tr>
            ) : filtered.map(a => (
              <tr key={a.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-5 py-4">
                  <div>
                    <p className="text-white font-mono font-medium">
                      {format(parseISO(a.scheduledAt), 'HH:mm')}
                    </p>
                    <p className="text-zinc-500 text-xs">
                      {format(parseISO(a.scheduledAt), "dd/MM/yyyy")}
                    </p>
                  </div>
                </td>
                <td className="px-5 py-4 text-white">{a.patient?.name}</td>
                <td className="px-5 py-4 text-zinc-300">Dr(a). {a.dentist?.name}</td>
                <td className="px-5 py-4 text-zinc-400 text-sm">{a.treatment?.name || '-'}</td>
                <td className="px-5 py-4 text-zinc-400 text-sm">{a.durationMinutes} min</td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-3 py-1 rounded-full border font-medium ${STATUS_COLORS[a.status]}`}>
                    {STATUS_LABELS[a.status]}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setStatusModal(a); setNewStatus(a.status); }}
                      className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-900/20 rounded-lg transition-colors text-xs font-medium" title="Mudar status">
                      <Calendar size={15} />
                    </button>
                    {a.status !== 'CANCELADO' && a.status !== 'CONCLUIDO' && (
                      <button onClick={() => openEdit(a)} className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"><Edit2 size={15} /></button>
                    )}
                    {a.status !== 'CANCELADO' && a.status !== 'CONCLUIDO' && (
                      <button onClick={() => handleCancel(a.id)} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={15} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-zinc-800">
            <span className="text-zinc-400 text-sm">Página {page + 1} de {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-zinc-800 transition-colors"><ChevronLeft size={18} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-zinc-800 transition-colors"><ChevronRight size={18} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900">
              <h2 className="text-xl font-bold text-white">{editing ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <FI label="Paciente *">
                <select value={form.patientId} onChange={f('patientId')} className={inp}>
                  <option value="">Selecionar paciente...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </FI>
              <FI label="Dentista *">
                <select value={form.dentistId} onChange={f('dentistId')} className={inp}>
                  <option value="">Selecionar dentista...</option>
                  {dentists.map(d => <option key={d.id} value={d.id}>Dr(a). {d.name}</option>)}
                </select>
              </FI>
              <FI label="Tratamento">
                <select value={form.treatmentId} onChange={f('treatmentId')} className={inp}>
                  <option value="">Sem tratamento específico</option>
                  {treatments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </FI>
              <FI label="Data e Hora *">
                <input type="datetime-local" value={form.scheduledAt} onChange={f('scheduledAt')} className={inp} />
              </FI>
              <FI label="Duração (minutos)">
                <input type="number" value={form.durationMinutes} onChange={f('durationMinutes')} min={15} step={15} className={inp} />
              </FI>
              <FI label="Observações">
                <textarea value={form.notes} onChange={f('notes')} rows={3} className={`${inp} resize-none`} />
              </FI>

              {error && <div className="text-red-400 text-sm bg-red-950/40 border border-red-800 rounded-xl px-4 py-3">{error}</div>}
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-zinc-400 border border-zinc-700 rounded-xl hover:text-white transition-colors">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-semibold rounded-xl transition-colors">
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">Atualizar Status</h2>
              <button onClick={() => setStatusModal(null)} className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-zinc-400 text-sm mb-4">Consulta de <strong className="text-white">{statusModal.patient?.name}</strong></p>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <button key={k} onClick={() => setNewStatus(k as AppointmentStatus)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${newStatus === k ? 'border-emerald-600 bg-emerald-900/20 text-emerald-400' : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'}`}>
                  {v}
                </button>
              ))}
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setStatusModal(null)} className="px-5 py-2.5 text-zinc-400 border border-zinc-700 rounded-xl hover:text-white transition-colors">Cancelar</button>
                <button onClick={handleStatusChange} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors">Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inp = "w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-600 transition-colors";
function FI({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-zinc-400 text-sm block mb-2">{label}</label>{children}</div>;
}