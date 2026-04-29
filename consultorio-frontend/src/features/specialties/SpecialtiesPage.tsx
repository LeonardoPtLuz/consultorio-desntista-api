import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Specialty } from '../../types';
import { Plus, X, Edit2, Tag } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const emptyForm = { name: '', description: '' };

export default function SpecialtiesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Specialty | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get<Specialty[]>('/api/specialties');
      setSpecialties(r.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null); setForm(emptyForm); setError(''); setModalOpen(true);
  };
  const openEdit = (s: Specialty) => {
    setEditing(s);
    setForm({ name: s.name, description: s.description || '' });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
      setSaving(true); setError('');
      try {
        if (editing) await api.put(`/api/specialties/${editing.id}`, form);  // ✅
        else await api.post('/api/specialties', form);
        setModalOpen(false);
        load();
        } catch (e: any) {
          const status = e.response?.status;
          if (status === 403) {
            setError('Acesso negado. Apenas administradores podem gerenciar especialidades.');
          } else if (status === 409) {
            setError('Já existe uma especialidade com este nome.');
          } else {
            setError(e.response?.data?.message || 'Erro ao salvar especialidade.');
          }
        } finally { setSaving(false); }
      };

  const f = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white">Especialidades</h1>
          <p className="text-zinc-400 mt-1">{specialties.length} especialidades ativas</p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-3 rounded-xl transition-colors"
          >
            <Plus size={18} /> Nova Especialidade
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-3 text-zinc-400 text-sm">
          Visualização apenas. Somente administradores podem criar ou editar especialidades.
        </div>
      )}

      {loading ? (
        <div className="text-center text-zinc-400 py-12">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {specialties.length === 0 ? (
            <div className="col-span-3 text-center text-zinc-400 py-12">
              Nenhuma especialidade cadastrada.
            </div>
          ) : specialties.map(s => (
            <div
              key={s.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors group"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-900/50 flex items-center justify-center text-emerald-400">
                    <Tag size={18} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{s.name}</h3>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {s.active ? 'Ativa' : 'Inativa'}
                    </p>
                  </div>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => openEdit(s)}
                    className="p-2 text-zinc-600 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Edit2 size={15} />
                  </button>
                )}
              </div>
              {s.description && (
                <p className="text-zinc-400 text-sm mt-4 leading-relaxed">{s.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">
                {editing ? 'Editar Especialidade' : 'Nova Especialidade'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-zinc-400 text-sm block mb-2">Nome *</label>
                <input
                  value={form.name}
                  onChange={f('name')}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-600 transition-colors"
                  placeholder="Ex: Ortodontia"
                />
              </div>
              <div>
                <label className="text-zinc-400 text-sm block mb-2">Descrição</label>
                <textarea
                  value={form.description}
                  onChange={f('description')}
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-600 transition-colors resize-none"
                  placeholder="Descrição da especialidade..."
                />
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