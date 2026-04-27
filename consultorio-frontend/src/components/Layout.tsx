import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-zinc-800 bg-zinc-900 px-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">🦷 Consultório Dentista</h1>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-zinc-500">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-zinc-800 rounded-lg text-red-400 hover:text-red-500 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}