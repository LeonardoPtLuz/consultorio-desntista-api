import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Users, UserCheck, Calendar,
  DollarSign, FileText, Tag, LogOut, Stethoscope
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/patients', icon: Users, label: 'Pacientes' },
  { to: '/dentists', icon: UserCheck, label: 'Dentistas' },
  { to: '/appointments', icon: Calendar, label: 'Agendamentos' },
  { to: '/medical-records', icon: FileText, label: 'Prontuários' },
  { to: '/payments', icon: DollarSign, label: 'Pagamentos' },
  { to: '/specialties', icon: Tag, label: 'Especialidades' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🦷</div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">Consultório</h1>
            <p className="text-zinc-500 text-xs">Gestão Odontológica</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-zinc-800">
        {user && (
          <div className="px-4 py-3 mb-2">
            <p className="text-white text-sm font-medium truncate">{user.name}</p>
            <p className="text-zinc-500 text-xs">{user.role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-900/10 w-full transition-all duration-150"
        >
          <LogOut size={18} />
          Sair do sistema
        </button>
      </div>
    </aside>
  );
}