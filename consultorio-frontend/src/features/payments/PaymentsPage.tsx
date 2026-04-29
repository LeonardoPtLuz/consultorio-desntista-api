import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { Payment, Patient, Appointment, PageResponse, PaymentMethod, PaymentStatus } from '../../types';
import { Plus, X, CheckCircle, XCircle, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const METHOD_LABELS: Record<PaymentMethod, string> = {
  DINHEIRO: 'Dinheiro', CARTAO_CREDITO: 'Cartão de Crédito', CARTAO_DEBITO: 'Cartão de Débito',
  PIX: 'PIX', CONVENIO: 'Convênio', BOLETO: 'Boleto',
};
const STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDENTE: 'bg-yellow-900/40 text-yellow-400 border-yellow-800/50',
  PAGO: 'bg-emerald-900/40 text-emerald-400 border-emerald-800/50',
  CANCELADO: 'bg-red-900/40 text-red-400 border-red-800/50',
  ESTORNADO: 'bg-orange-900/40 text-orange-400 border-orange-800/50',
};

const emptyForm = { patientId: '' as any, appointmentId: '' as any, amount: '', discount: '0', paymentMethod: 'PIX' as PaymentMethod, notes: '' };

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<PageResponse<Payment>>('/api/payments', { params: { page, size: 15 } });
      setPayments(res.data.content);
      setTotal(res.data.totalElements);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    api.get('/api/patients', { params: { size: 200 } }).then(r => setPatients(r.data.content || r.data)).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await api.post('/payments', {
        patientId: Number(form.patientId),
        appointmentId: form.appointmentId ? Number(form.appointmentId) : undefined,
        amount: Number(form.amount),
        discount: Number(form.discount) || 0,
        paymentMethod: form.paymentMethod,
        notes: form.notes,
      });
      setModalOpen(false); setForm(emptyForm); load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erro ao registrar pagamento');
    } finally { setSaving(false); }
  };

  const handleConfirm = async (id: number) => {
    try { await api.patch(`/payments/${id}/confirm`); load(); } catch { /* ignore */ }
  };
  const handleCancel = async (id: number) => {
    if (!confirm('Cancelar/estornar este pagamento?')) return;
    try { await api.patch(`/payments/${id}/cancel`); load(); } catch { /* ignore */ }
  };

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const totalPages = Math.ceil(total / 15);
  const totalRevenue = payments.filter(p => p.status === 'PAGO').reduce((s, p) => s + p.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white">Pagamentos</h1>
          <p className="text-zinc-400 mt-1">{total} registros</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setError(''); setModalOpen(true); }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-3 rounded-xl transition-colors">
          <Plus size={18} /> Registrar Pagamento
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="text-emerald-500" size={20} />
          <span className="text-zinc-400 text-sm">Total recebido (esta página)</span>
        </div>
        <p className="text-3xl font-bold text-emerald-400">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Paciente', 'Valor', 'Desconto', 'Total', 'Método', 'Status', 'Data', 'Ações'].map(h => (
                <th key={h} className="text-left text-xs uppercase tracking-widest text-zinc-500 px-5 py-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center text-zinc-400 py-12">Carregando...</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-zinc-400 py-12">Nenhum pagamento encontrado.</td></tr>
            ) : payments.map(p => (
              <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-5 py-4 text-white font-medium">{p.patient?.name}</td>
                <td className="px-5 py-4 text-zinc-300">R$ {Number(p.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-4 text-zinc-400 text-sm">
                  {Number(p.discount) > 0 ? <span className="text-orange-400">-R$ {Number(p.discount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> : '-'}
                </td>
                <td className="px-5 py-4 text-emerald-400 font-semibold">R$ {Number(p.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-4 text-zinc-300 text-sm">{METHOD_LABELS[p.paymentMethod]}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-3 py-1 rounded-full border font-medium ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                </td>
                <td className="px-5 py-4 text-zinc-400 text-sm">
                  {p.paidAt ? format(parseISO(p.paidAt), 'dd/MM/yyyy') : format(parseISO(p.createdAt), 'dd/MM/yyyy')}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    {p.status === 'PENDENTE' && (
                      <button onClick={() => handleConfirm(p.id)} title="Confirmar pagamento"
                        className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-900/20 rounded-lg transition-colors"><CheckCircle size={16} /></button>
                    )}
                    {p.status !== 'CANCELADO' && p.status !== 'ESTORNADO' && (
                      <button onClick={() => handleCancel(p.id)} title="Cancelar/Estornar"
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"><XCircle size={16} /></button>
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

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">Registrar Pagamento</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <FI label="Paciente *">
                <select value={form.patientId} onChange={f('patientId')} className={inp}>
                  <option value="">Selecionar paciente...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </FI>
              <div className="grid grid-cols-2 gap-4">
                <FI label="Valor (R$) *"><input type="number" step="0.01" value={form.amount} onChange={f('amount')} className={inp} placeholder="0,00" /></FI>
                <FI label="Desconto (R$)"><input type="number" step="0.01" value={form.discount} onChange={f('discount')} className={inp} placeholder="0,00" /></FI>
              </div>
              {form.amount && (
                <div className="p-3 bg-emerald-900/20 border border-emerald-800/40 rounded-xl text-emerald-400 text-sm">
                  Total: R$ {(Number(form.amount) - Number(form.discount || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              )}
              <FI label="Método de Pagamento *">
                <select value={form.paymentMethod} onChange={f('paymentMethod')} className={inp}>
                  {Object.entries(METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </FI>
              <FI label="Observações">
                <textarea value={form.notes} onChange={f('notes')} rows={2} className={`${inp} resize-none`} />
              </FI>
              {error && <div className="text-red-400 text-sm bg-red-950/40 border border-red-800 rounded-xl px-4 py-3">{error}</div>}
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-zinc-400 border border-zinc-700 rounded-xl hover:text-white transition-colors">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-semibold rounded-xl transition-colors">
                  {saving ? 'Salvando...' : 'Registrar'}
                </button>
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