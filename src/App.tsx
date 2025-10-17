import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DeveloperDashboard from './pages/DeveloperDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import CEODashboard from './pages/CEODashboard';
import LoadingSpinner from './components/common/LoadingSpinner';
import { Button } from './components/ui/Button';
import './App.css';

const UnauthorizedAccess = () => {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30">
            <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Unauthorized Access</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          You are logged in as: <strong className="text-gray-900 dark:text-white">{user?.email}</strong>
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This account does not have administrative privileges.
        </p>
        <div className="space-y-3">
          <Button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white">
            Logout and Sign In as Admin
          </Button>
          <a
            href="https://kommyut.netlify.app"
            className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Go to Kommyut Main App
          </a>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { user, loading, userRole } = useAuth();

  // Debug logging - check what role is being detected
  console.log('App render - User:', user?.email, 'Role:', userRole, 'Loading:', loading);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {user && userRole !== 'user' && (
          <>
            <Route path="/developer" element={<DeveloperDashboard />} />
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/ceo" element={<CEODashboard />} />
            <Route path="/" element={<Navigate to={`/${userRole}`} replace />} />
            <Route path="*" element={<Navigate to={`/${userRole}`} replace />} />
          </>
        )}
        {!user && <Route path="*" element={<Navigate to="/login" replace />} />}
        {user && userRole === 'user' && (
          <Route
            path="*"
            element={<UnauthorizedAccess />}
          />
        )}
      </Routes>
    </div>
  );
}

export default App
