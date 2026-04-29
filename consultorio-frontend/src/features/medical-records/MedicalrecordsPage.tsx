import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { MedicalRecord, Patient, Dentist, Treatment, PageResponse } from '../../types';
import { Plus, X, Search, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const emptyForm = {
  patientId: '' as any, dentistId: '' as any, appointmentId: '' as any, treatmentId: '' as any,
  description: '', diagnosis: '', prescription: '', nextSteps: '', toothNumber: '', priceCharged: '',
};

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [searchPatientId, setSearchPatientId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewing, setViewing] = useState<MedicalRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (searchPatientId) {
        res = await api.get<PageResponse<MedicalRecord>>(`/medical-records/patient/${searchPatientId}`, { params: { page, size: 15 } });
      } else {
        // fallback: get all via dentist 1, or just show empty until a patient is selected
        setRecords([]); setTotal(0); setLoading(false); return;
      }
      setRecords(res.data.content);
      setTotal(res.data.totalElements);
    } catch { setRecords([]); setTotal(0); } finally { setLoading(false); }
  }, [searchPatientId, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(0); }, [searchPatientId]);
  useEffect(() => {
    api.get('/patients', { params: { size: 200 } }).then(r => setPatients(r.data.content || r.data)).catch(() => {});
    api.get<Dentist[]>('/dentists').then(r => setDentists(r.data)).catch(() => {});
    api.get<Treatment[]>('/treatments').then(r => setTreatments(r.data)).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await api.post('/medical-records', {
        patientId: Number(form.patientId), dentistId: Number(form.dentistId),
        appointmentId: form.appointmentId ? Number(form.appointmentId) : undefined,
        treatmentId: form.treatmentId ? Number(form.treatmentId) : undefined,
        description: form.description, diagnosis: form.diagnosis, prescription: form.prescription,
        nextSteps: form.nextSteps, toothNumber: form.toothNumber,
        priceCharged: form.priceCharged ? Number(form.priceCharged) : undefined,
      });
      setModalOpen(false); load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erro ao salvar prontuário');
    } finally { setSaving(false); }
  };

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white">Prontuários</h1>
          <p className="text-zinc-400 mt-1">Histórico clínico dos pacientes</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setError(''); setModalOpen(true); }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-3 rounded-xl transition-colors">
          <Plus size={18} /> Novo Prontuário
        </button>
      </div>

      {/* Filter by patient */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <label className="text-zinc-400 text-sm block mb-3">Selecione um paciente para ver o histórico</label>
        <select value={searchPatientId} onChange={e => setSearchPatientId(e.target.value ? Number(e.target.value) : '')}
          className="w-full max-w-md bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-600 transition-colors">
          <option value="">Selecionar paciente...</option>
          {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Records */}
      {!searchPatientId ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <FileText className="mx-auto text-zinc-700 mb-4" size={48} />
          <p className="text-zinc-400">Selecione um paciente acima para visualizar seus prontuários.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-zinc-400 py-12">Carregando...</div>
          ) : records.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
              <p className="text-zinc-400">Nenhum prontuário encontrado para este paciente.</p>
            </div>
          ) : records.map(r => (
            <div key={r.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors cursor-pointer"
              onClick={() => setViewing(r)}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-emerald-400 font-mono text-sm">
                      {format(parseISO(r.createdAt), "dd/MM/yyyy 'às' HH:mm")}
                    </span>
                    {r.toothNumber && (
                      <span className="text-xs px-2 py-1 bg-blue-900/40 text-blue-400 rounded-full border border-blue-800/50">
                        Dente {r.toothNumber}
                      </span>
                    )}
                    {r.treatment && (
                      <span className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded-full">{r.treatment.name}</span>
                    )}
                  </div>
                  <p className="text-white font-medium mb-1">{r.description}</p>
                  {r.diagnosis && <p className="text-zinc-400 text-sm">Diagnóstico: {r.diagnosis}</p>}
                  <p className="text-zinc-500 text-sm mt-2">Dr(a). {r.dentist?.name}</p>
                </div>
                {r.priceCharged && (
                  <div className="text-right ml-6">
                    <p className="text-emerald-400 font-semibold">R$ {Number(r.priceCharged).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">Página {page + 1} de {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 rounded-lg bg-zinc-900 border border-zinc-800 transition-colors"><ChevronLeft size={18} /></button>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 rounded-lg bg-zinc-900 border border-zinc-800 transition-colors"><ChevronRight size={18} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900">
              <h2 className="text-xl font-bold text-white">Novo Prontuário</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FI label="Paciente *">
                  <select value={form.patientId} onChange={f('patientId')} className={inp}>
                    <option value="">Selecionar...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </FI>
                <FI label="Dentista *">
                  <select value={form.dentistId} onChange={f('dentistId')} className={inp}>
                    <option value="">Selecionar...</option>
                    {dentists.map(d => <option key={d.id} value={d.id}>Dr(a). {d.name}</option>)}
                  </select>
                </FI>
                <FI label="Tratamento">
                  <select value={form.treatmentId} onChange={f('treatmentId')} className={inp}>
                    <option value="">Sem tratamento</option>
                    {treatments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </FI>
                <FI label="Número do dente"><input value={form.toothNumber} onChange={f('toothNumber')} className={inp} placeholder="Ex: 36" /></FI>
              </div>
              <FI label="Descrição / Evolução *">
                <textarea value={form.description} onChange={f('description')} rows={3} className={`${inp} resize-none`} placeholder="Descreva o atendimento realizado..." />
              </FI>
              <FI label="Diagnóstico">
                <textarea value={form.diagnosis} onChange={f('diagnosis')} rows={2} className={`${inp} resize-none`} />
              </FI>
              <FI label="Prescrição">
                <textarea value={form.prescription} onChange={f('prescription')} rows={2} className={`${inp} resize-none`} />
              </FI>
              <FI label="Próximos passos">
                <textarea value={form.nextSteps} onChange={f('nextSteps')} rows={2} className={`${inp} resize-none`} />
              </FI>
              <FI label="Valor cobrado (R$)">
                <input type="number" step="0.01" value={form.priceCharged} onChange={f('priceCharged')} className={inp} placeholder="0,00" />
              </FI>
              {error && <div className="text-red-400 text-sm bg-red-950/40 border border-red-800 rounded-xl px-4 py-3">{error}</div>}
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-zinc-400 border border-zinc-700 rounded-xl hover:text-white transition-colors">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-semibold rounded-xl transition-colors">
                  {saving ? 'Salvando...' : 'Salvar Prontuário'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900">
              <h2 className="text-xl font-bold text-white">Prontuário #{viewing.id}</h2>
              <button onClick={() => setViewing(null)} className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <VF label="Paciente" value={viewing.patient?.name} />
                <VF label="Dentista" value={`Dr(a). ${viewing.dentist?.name}`} />
                <VF label="Data" value={format(parseISO(viewing.createdAt), "dd/MM/yyyy 'às' HH:mm")} />
                {viewing.toothNumber && <VF label="Dente" value={viewing.toothNumber} />}
                {viewing.treatment && <VF label="Tratamento" value={viewing.treatment.name} />}
                {viewing.priceCharged && <VF label="Valor cobrado" value={`R$ ${Number(viewing.priceCharged).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />}
              </div>
              {[
                { label: 'Descrição', val: viewing.description },
                { label: 'Diagnóstico', val: viewing.diagnosis },
                { label: 'Prescrição', val: viewing.prescription },
                { label: 'Próximos passos', val: viewing.nextSteps },
              ].filter(x => x.val).map(x => (
                <div key={x.label} className="border-t border-zinc-800 pt-4">
                  <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">{x.label}</p>
                  <p className="text-zinc-200 whitespace-pre-wrap">{x.val}</p>
                </div>
              ))}
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
function VF({ label, value }: { label: string; value?: string }) {
  return <div><p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">{label}</p><p className="text-white">{value || '-'}</p></div>;
}