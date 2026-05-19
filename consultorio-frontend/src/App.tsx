import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import PatientsPage from './features/patients/PatientsPage';
import DentistsPage from './features/dentists/DentistsPage';
import AppointmentsPage from './features/appointments/AppointmentsPage';
import PaymentsPage from './features/payments/PaymentsPage';
import MedicalRecordsPage from './features/medical-records/MedicalRecordsPage';
import SpecialtiesPage from './features/specialties/SpecialtiesPage';
import TreatmentsPage from './features/treatments/TreatmentsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="dentists" element={<DentistsPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="medical-records" element={<MedicalRecordsPage />} />
        <Route path="specialties" element={<SpecialtiesPage />} />
        <Route path="treatments" element={<TreatmentsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}