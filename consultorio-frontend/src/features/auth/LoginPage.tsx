import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('teste@example.com');
  const [password, setPassword] = useState('teste123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      // O redirecionamento agora acontece dentro do AuthContext
    } catch (err: any) {
      const message = err.response?.data?.message ||
                     err.response?.data?.error ||
                     'Email ou senha inválidos';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-3xl p-10 shadow-2xl">
        <div className="text-center mb-10">
          <div className="mx-auto mb-6 text-8xl">🦷</div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Consultório Dentista</h1>
          <p className="text-zinc-400 mt-3 text-lg">Sistema de Gestão Odontológica</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-zinc-400 text-sm block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-5 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-600 transition-colors"
              placeholder="teste@example.com"
              required
            />
          </div>

          <div>
            <label className="text-zinc-400 text-sm block mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-5 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-600 transition-colors"
              placeholder="teste123"
              required
            />
          </div>

          {error && (
            <div className="bg-red-950/50 border border-red-800 text-red-400 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl text-lg transition-all duration-200"
          >
            {loading ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-zinc-500">
          Teste com:<br />
          <span className="font-mono text-emerald-400">teste@example.com</span> /{' '}
          <span className="font-mono text-emerald-400">teste123</span>
        </div>
      </div>
    </div>
  );
}