import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import { SplashScreen, ProgressBar } from './components/loading-screen';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const CustomerTypesPage = lazy(() => import('./pages/CustomerTypesPage'));
const PurchasesPage = lazy(() => import('./pages/PurchasesPage'));
const InvoiceFormPage = lazy(() => import('./pages/InvoiceFormPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AdminsPage = lazy(() => import('./pages/AdminsPage'));

function Protected({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAuth();
  if (loading) return <SplashScreen />;
  if (!admin) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { loading } = useAuth();

  if (loading) return <SplashScreen />;

  return (
    <>
      <ProgressBar />
      <Suspense fallback={<SplashScreen />}>
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
      </Suspense>
    </>
  );
}
