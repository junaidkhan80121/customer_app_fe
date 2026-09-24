import { Navigate, Route, Routes } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from './auth/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import CustomerTypesPage from './pages/CustomerTypesPage';
import PurchasesPage from './pages/PurchasesPage';
import InvoiceFormPage from './pages/InvoiceFormPage';
import LeaderboardPage from './pages/LeaderboardPage';
import SettingsPage from './pages/SettingsPage';
import AdminsPage from './pages/AdminsPage';

function Protected({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAuth();
  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!admin) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <Protected>
            <DashboardLayout />
          </Protected>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customer-types" element={<CustomerTypesPage />} />
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="purchases/new" element={<InvoiceFormPage />} />
        <Route path="purchases/:id" element={<InvoiceFormPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="admins" element={<AdminsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
