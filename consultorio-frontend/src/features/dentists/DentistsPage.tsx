import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { Dentist, Specialty, PageResponse } from '../../types';
import { Plus, Search, Edit2, Trash2, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';

const emptyForm = {
  name: '', cro: '', croState: '', specialtyId: '' as any,
  phone: '', email: '', userId: '' as any,
};

export default function DentistsPage() {
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Dentist | null>(null);
  const [viewing, setViewing] = useState<Dentist | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (search.trim()) {
        res = await api.get<PageResponse<Dentist>>('/api/dentists/search', { params: { q: search, page, size: 15 } });
        setDentists(res.data.content);
        setTotal(res.data.totalElements);
      } else {
        const r = await api.get<Dentist[]>('/api/dentists');
        setDentists(r.data);
        setTotal(r.data.length);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(0); }, [search]);
  useEffect(() => {
    api.get<Specialty[]>('/api/specialties').then(r => setSpecialties(r.data)).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null); setForm(emptyForm); setError(''); setViewing(null); setModalOpen(true);
  };
  const openEdit = (d: Dentist) => {
    setEditing(d);
    setForm({ name: d.name, cro: d.cro, croState: d.croState, specialtyId: d.specialty.id, phone: d.phone || '', email: d.email, userId: '' });
    setError(''); setViewing(null); setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const payload = { ...form, specialtyId: Number(form.specialtyId), userId: form.userId ? Number(form.userId) : undefined };
      if (editing) await api.put(`/dentists/${editing.id}`, payload);
      else await api.post('/dentists', payload);
      setModalOpen(false); load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erro ao salvar dentista');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Desativar este dentista?')) return;
    try { await api.delete(`/dentists/${id}`); load(); } catch { /* ignore */ }
  };

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white">Dentistas</h1>
          <p className="text-zinc-400 mt-1">{total} dentistas ativos</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-3 rounded-xl transition-colors">
          <Plus size={18} /> Novo Dentista
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-zinc-500" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou CRO..."
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-11 pr-5 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-600 transition-colors" />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Dentista', 'CRO', 'Especialidade', 'Email', 'Telefone', 'Ações'].map(h => (
                <th key={h} className="text-left text-xs uppercase tracking-widest text-zinc-500 px-5 py-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center text-zinc-400 py-12">Carregando...</td></tr>
            ) : dentists.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-zinc-400 py-12">Nenhum dentista encontrado.</td></tr>
            ) : dentists.map(d => (
              <tr key={d.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 text-sm font-bold flex-shrink-0">
                      {d.name.charAt(0)}
                    </div>
                    <span className="text-white font-medium">Dr(a). {d.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-zinc-300 font-mono text-sm">{d.cro}-{d.croState}</td>
                <td className="px-5 py-4">
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/40 text-emerald-400 border border-emerald-800/50">{d.specialty?.name}</span>
                </td>
                <td className="px-5 py-4 text-zinc-300 text-sm">{d.email}</td>
                <td className="px-5 py-4 text-zinc-300 text-sm">{d.phone || '-'}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setViewing(d); setModalOpen(false); }} className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-900/20 rounded-lg transition-colors"><Eye size={16} /></button>
                    <button onClick={() => openEdit(d)} className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(d.id)} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">{editing ? 'Editar Dentista' : 'Novo Dentista'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="Nome completo *"><input value={form.name} onChange={f('name')} className={inp} placeholder="Dr. João Silva" /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="CRO *"><input value={form.cro} onChange={f('cro')} className={inp} placeholder="12345" /></Field>
                <Field label="Estado CRO *"><input value={form.croState} onChange={f('croState')} className={inp} placeholder="PE" maxLength={2} /></Field>
              </div>
              <Field label="Especialidade *">
                <select value={form.specialtyId} onChange={f('specialtyId')} className={inp}>
                  <option value="">Selecionar...</option>
                  {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>
              <Field label="Email *"><input type="email" value={form.email} onChange={f('email')} className={inp} /></Field>
              <Field label="Telefone"><input value={form.phone} onChange={f('phone')} className={inp} /></Field>

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

      {/* View Modal */}
      {viewing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">Detalhes do Dentista</h2>
              <button onClick={() => setViewing(null)} className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl">
                <div className="w-14 h-14 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 text-2xl font-bold">{viewing.name.charAt(0)}</div>
                <div>
                  <h3 className="text-xl font-bold text-white">Dr(a). {viewing.name}</h3>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/40 text-emerald-400">{viewing.specialty?.name}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <VF label="CRO" value={`${viewing.cro}-${viewing.croState}`} />
                <VF label="Telefone" value={viewing.phone || '-'} />
                <div className="col-span-2"><VF label="Email" value={viewing.email} /></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inp = "w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-600 transition-colors";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-zinc-400 text-sm block mb-2">{label}</label>{children}</div>;
}
function VF({ label, value }: { label: string; value: string }) {
  return <div><p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">{label}</p><p className="text-white">{value}</p></div>;
}