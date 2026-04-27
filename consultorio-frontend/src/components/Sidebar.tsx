import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Users, Calendar, UserCog, FileText,
  CreditCard, Stethoscope, Settings
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Pacientes', path: '/patients' },
  { icon: Calendar, label: 'Agendamentos', path: '/appointments' },
  { icon: UserCog, label: 'Dentistas', path: '/dentists' },
  { icon: FileText, label: 'Prontuários', path: '/medical-records' },
  { icon: CreditCard, label: 'Pagamentos', path: '/payments' },
];

export function Sidebar() {
  const { user } = useAuth();

  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      <div className="p-6 border-b border-zinc-800">
        <h2 className="text-2xl font-bold text-emerald-500">DentalPro</h2>
      </div>

      <nav className="flex-1 p-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white'
                  : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {user?.role === 'ADMIN' && (
        <div className="p-4 border-t border-zinc-800">
          <NavLink to="/admin" className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl">
            <Settings size={20} />
            <span>Administração</span>
          </NavLink>
        </div>
      )}
    </div>
  );
}