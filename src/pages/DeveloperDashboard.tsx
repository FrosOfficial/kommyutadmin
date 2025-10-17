import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Activity, Database, Monitor, Settings, Zap } from 'lucide-react';

// API URL configuration - use environment variable or default to production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://kommyut.netlify.app';

const DeveloperDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('monitoring');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);
  const [sendStatus, setSendStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationMessage.trim()) {
      setSendStatus({ type: 'error', message: 'Please enter a message' });
      return;
    }

    setIsSending(true);
    setSendStatus(null);

    try {
      const response = await fetch(`${API_BASE_URL}/.netlify/functions/push-notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: notificationMessage,
          topic: 'all-users',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSendStatus({
          type: 'success',
          message: `Notification sent successfully! Delivered to ${data.response?.successCount || 0} users`,
        });
        setNotificationMessage('');
        setLastSent(new Date().toLocaleString());
      } else {
        setSendStatus({
          type: 'error',
          message: data.error || 'Failed to send notification',
        });
      }
    } catch (error) {
      setSendStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Network error occurred',
      });
    } finally {
      setIsSending(false);
    }
  };

  const tabs = [
    { id: 'monitoring', label: 'System Monitoring', icon: Monitor },
    { id: 'database', label: 'Database Health', icon: Database },
    { id: 'api', label: 'API Logs', icon: Activity },
    { id: 'testing', label: 'Sandbox Testing', icon: Zap },
    { id: 'notifications', label: 'Push Notifications', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Developer Dashboard</h1>
              <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Developer Access
              </span>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab.id
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="grid gap-6">
          {activeTab === 'monitoring' && (
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
              <div className="text-center py-12">
                <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  System Monitoring Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Real-time API response times, database query metrics, error rates, and active user tracking will display here once monitoring is implemented.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'testing' && (
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
              <div className="pb-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sandbox Testing Environment</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Test geocoding, routing, and fare calculation APIs in a safe environment</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="w-full">Test Geocoding API</Button>
                  <Button variant="outline" className="w-full">Test Route Calculation</Button>
                  <Button variant="outline" className="w-full">Test Fare Calculator</Button>
                  <Button variant="outline" className="w-full">View API Logs</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
              <div className="pb-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Push Notification Control</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Send push notifications directly to users on kommyut.netlify.app</p>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    placeholder="Enter notification message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={isSending}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isSending) {
                        handleSendNotification();
                      }
                    }}
                  />
                  <Button onClick={handleSendNotification} disabled={isSending}>
                    {isSending ? 'Sending...' : 'Send Notification'}
                  </Button>
                </div>

                {sendStatus && (
                  <div
                    className={`p-3 rounded-md ${
                      sendStatus.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}
                  >
                    {sendStatus.message}
                  </div>
                )}

                {lastSent && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Last notification sent: {lastSent}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
              <div className="text-center py-12">
                <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Database Health Metrics Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Connection pool stats, query performance metrics, and storage usage will display here once database monitoring is implemented.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  API Logs & Error Tracking Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Real-time API request logs, response codes, and error tracking will display here once logging is implemented.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
