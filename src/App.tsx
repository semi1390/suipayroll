import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreatePayrollPage } from './pages/CreatePayrollPage';
import { BatchDetailPage } from './pages/BatchDetailPage';
import { HistoryPage } from './pages/HistoryPage';
import { PayslipsPage } from './pages/PayslipsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const account = useCurrentAccount();
  const navigate = useNavigate();

  useEffect(() => {
    if (!account) navigate('/', { replace: true });
  }, [account, navigate]);

  if (!account) return null;
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="min-h-[calc(100vh-64px)] pb-20 md:pb-0 ">
        {children}
      </main>
      {/* Mobile bottom nav */}
<nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around px-2 py-2">
  {[
    { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
    { to: '/create', label: 'New', icon: '+' },
    { to: '/history', label: 'History', icon: '◷' },
    { to: '/payslips', label: 'Payslips', icon: '🪙' },
  ].map(link => (
    <Link key={link.to} to={link.to} className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-slate-500 hover:text-sky-400 transition-colors">
      <span className="text-lg">{link.icon}</span>
      <span className="text-xs font-display">{link.label}</span>
    </Link>
  ))}
</nav>
    </div>
  );
}

export default function App() {
  const account = useCurrentAccount();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CreatePayrollPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/batch/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <BatchDetailPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <AppLayout>
              <HistoryPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payslips"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PayslipsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={account ? '/dashboard' : '/'} replace />} />
    </Routes>
  );
}
