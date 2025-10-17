import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { KommyutLogo } from '../components/ui/KommyutLogo';
import { Sun, Moon } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithEmailAndPassword, loading, user, userRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (user && userRole && userRole !== 'user') {
      console.log('User authenticated, redirecting to:', `/${userRole}`);
      navigate(`/${userRole}`, { replace: true });
    }
  }, [user, userRole, navigate]);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(email, password);
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.message || 'Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="absolute top-4 right-4 z-10">
        <Button onClick={toggleDarkMode} variant="ghost" size="sm">
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>
      <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8">
        <div className="text-center mb-8">
          <KommyutLogo className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Sign in to access your administrative dashboard</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleEmailSignIn} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
            <div className="mt-1">
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="admin@kommyut.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <div className="mt-1">
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Access restricted to authorized personnel only</p>
          <p className="mt-2">Regular commuters: please use{' '}
            <a
              href="https://kommyut.netlify.app"
              className="text-primary dark:text-primary-light hover:underline font-medium"
            >
              Kommyut main
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
