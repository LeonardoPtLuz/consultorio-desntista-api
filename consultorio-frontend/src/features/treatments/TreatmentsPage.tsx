import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Treatment, Specialty } from '../../types';
import { Plus, X, Edit2, Stethoscope, DollarSign, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const emptyForm = {
  name: '',
  description: '',
  specialtyId: '' as any,
  defaultPrice: '',
  durationMinutes: '30',
  active: true,
};

export default function TreatmentsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Treatment | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterSpecialtyId, setFilterSpecialtyId] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get<Treatment[]>('/api/treatments');
      setTreatments(r.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    api.get<Specialty[]>('/api/specialties').then(r => setSpecialties(r.data)).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (t: Treatment) => {
    setEditing(t);
    setForm({
      name: t.name,
      description: t.description || '',
      specialtyId: t.specialty?.id || '',
      defaultPrice: t.defaultPrice ? String(t.defaultPrice) : '0',
      durationMinutes: String(t.durationMinutes || 30),
      active: t.active ?? true,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Nome do tratamento é obrigatório');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || null,
        specialty: form.specialtyId ? { id: Number(form.specialtyId) } : null,
        defaultPrice: Number(form.defaultPrice) || 0,
        durationMinutes: Number(form.durationMinutes) || 30,
        active: form.active,
      };

      if (editing) {
        await api.put(`/api/treatments/${editing.id}`, payload);
      } else {
        await api.post('/api/treatments', payload);
      }

      setModalOpen(false);
      load();
    } catch (e: any) {
      const data = e.response?.data;
      if (e.response?.status === 403) {
        setError('Acesso negado. Apenas administradores podem gerenciar tratamentos.');
      } else {
        setError(data?.message || 'Erro ao salvar tratamento.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm('Desativar este tratamento?')) return;
    try {
      await api.delete(`/api/treatments/${id}`);
      load();
    } catch {
      /* ignore */
    }
  };

  const f = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }));

  const filtered = filterSpecialtyId
    ? treatments.filter(t => String(t.specialty?.id) === filterSpecialtyId)
    : treatments;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white">Tratamentos</h1>
          <p className="text-zinc-400 mt-1">{treatments.length} procedimentos cadastrados</p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-3 rounded-xl transition-colors"
          >
            <Plus size={18} /> Novo Tratamento
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-3 text-zinc-400 text-sm">
          Visualização apenas. Somente administradores podem criar ou editar tratamentos.
        </div>
      )}

      {/* Filtro por especialidade */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterSpecialtyId('')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            !filterSpecialtyId
              ? 'bg-emerald-600 text-white'
              : 'bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white'
          }`}
        >
          Todos
        </button>
        {specialties.map(s => (
          <button
            key={s.id}
            onClick={() => setFilterSpecialtyId(String(s.id))}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filterSpecialtyId === String(s.id)
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Grid de cards */}
      {loading ? (
        <div className="text-center text-zinc-400 py-12">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <Stethoscope className="mx-auto text-zinc-700 mb-4" size={48} />
          <p className="text-zinc-400">Nenhum tratamento encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => (
            <div
              key={t.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-900/50 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <Stethoscope size={18} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold leading-tight">{t.name}</h3>
                    {t.specialty && (
                      <span className="text-xs px-2 py-0.5 mt-1 inline-block rounded-full bg-blue-900/40 text-blue-400 border border-blue-800/50">
                        {t.specialty.name}
                      </span>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(t)}
                      className="p-2 text-zinc-600 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeactivate(t.id)}
                      className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}
              </div>

              {t.description && (
                <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{t.description}</p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <DollarSign size={15} />
                  <span className="font-semibold">
                    R$ {Number(t.defaultPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
                  <Clock size={14} />
                  <span>{t.durationMinutes} min</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar / Editar */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">
                {editing ? 'Editar Tratamento' : 'Novo Tratamento'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <Field label="Nome do tratamento *">
                <input
                  value={form.name}
                  onChange={f('name')}
                  className={inp}
                  placeholder="Ex: Limpeza dental, Extração, Implante..."
                />
              </Field>

              <Field label="Especialidade">
                <select value={form.specialtyId} onChange={f('specialtyId')} className={inp}>
                  <option value="">Sem especialidade específica</option>
                  {specialties.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Descrição">
                <textarea
                  value={form.description}
                  onChange={f('description')}
                  rows={3}
                  className={`${inp} resize-none`}
                  placeholder="Descrição do procedimento..."
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Preço padrão (R$)">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.defaultPrice}
                    onChange={f('defaultPrice')}
                    className={inp}
                    placeholder="0,00"
                  />
                </Field>
                <Field label="Duração (minutos)">
                  <input
                    type="number"
                    step="15"
                    min="15"
                    value={form.durationMinutes}
                    onChange={f('durationMinutes')}
                    className={inp}
                  />
                </Field>
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-950/40 border border-red-800 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 text-zinc-400 border border-zinc-700 rounded-xl hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.name.trim()}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inp =
  'w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-600 transition-colors';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-zinc-400 text-sm block mb-2">{label}</label>
      {children}
    </div>
  );
}