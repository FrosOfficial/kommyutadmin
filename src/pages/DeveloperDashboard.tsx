import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Settings, Moon, Sun, Database, Activity, HardDrive, Cpu, Users, GitBranch } from 'lucide-react';
import { MetricsCard } from '../components/metrics/MetricsCard';
import { MetricsChart } from '../components/metrics/MetricsChart';
import SystemArchitecture from '../components/SystemArchitecture';

// API URL configuration - use environment variable or default to production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://kommyut.netlify.app';

interface DatabaseStats {
  connections: {
    active_connections: number;
    idle_connections: number;
    waiting_connections: number;
    total_connections: number;
  };
  database_size: {
    size_bytes: number;
    size_formatted: string;
  };
  cache: {
    cache_hit_ratio: number;
  };
  transactions: {
    commits: number;
    rollbacks: number;
    deadlocks: number;
  };
  tables: Array<{
    tablename: string;
    total_size: string;
    row_count: number;
  }>;
}

interface NeonMetrics {
  projectInfo: {
    id: string;
    name: string;
    region: string;
    createdAt: string;
    platformVersion: number;
  };
  branch: {
    id: string;
    name: string;
    primary: boolean;
    createdAt: string;
  };
  compute: {
    endpoints: Array<{
      id: string;
      type: string;
      currentState: string;
      autoscalingLimitMinCu: number;
      autoscalingLimitMaxCu: number;
      suspendTimeoutSeconds: number;
      poolerEnabled: boolean;
      poolerMode: string;
      disabled: boolean;
      host: string;
      createdAt: string;
      updatedAt: string;
    }>;
  };
  consumption?: {
    periods: any[];
    timeSeries: Array<{
      timestamp: string;
      activeTimeSeconds: number;
      computeTimeSeconds: number;
      writtenDataBytes: number;
      syntheticStorageBytes: number;
      logicalSizeBytes: number;
    }>;
  };
  timestamp: string;
}

const DeveloperDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);
  const [sendStatus, setSendStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  // Database monitoring state
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Neon metrics state
  const [neonMetrics, setNeonMetrics] = useState<NeonMetrics | null>(null);
  const [isLoadingNeonMetrics, setIsLoadingNeonMetrics] = useState(false);
  const [neonMetricsError, setNeonMetricsError] = useState<string | null>(null);
  const [lastNeonRefresh, setLastNeonRefresh] = useState<Date | null>(null);
  const [autoRefreshNeon, setAutoRefreshNeon] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('adminTheme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('adminTheme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('adminTheme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Fetch database statistics
  const fetchDatabaseStats = async () => {
    setIsLoadingStats(true);
    setStatsError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/.netlify/functions/database-stats`);
      const data = await response.json();

      if (response.ok && data.success) {
        setDbStats(data.stats);
        setLastRefresh(new Date());
      } else {
        setStatsError(data.error || 'Failed to fetch database statistics');
      }
    } catch (error) {
      setStatsError(error instanceof Error ? error.message : 'Network error occurred');
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch Neon metrics
  const fetchNeonMetrics = async () => {
    setIsLoadingNeonMetrics(true);
    setNeonMetricsError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/.netlify/functions/neon-metrics`);
      const data = await response.json();

      if (response.ok && data.success) {
        setNeonMetrics(data.metrics);
        setLastNeonRefresh(new Date());
      } else {
        setNeonMetricsError(data.error || 'Failed to fetch Neon metrics');
      }
    } catch (error) {
      setNeonMetricsError(error instanceof Error ? error.message : 'Network error occurred');
    } finally {
      setIsLoadingNeonMetrics(false);
    }
  };

  // Auto-refresh database stats
  useEffect(() => {
    if (activeTab === 'database' && autoRefresh) {
      const interval = setInterval(fetchDatabaseStats, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [activeTab, autoRefresh]);

  // Initial fetch when database tab is opened
  useEffect(() => {
    if (activeTab === 'database' && !dbStats) {
      fetchDatabaseStats();
    }
  }, [activeTab]);

  // Auto-refresh Neon metrics
  useEffect(() => {
    if (activeTab === 'database' && autoRefreshNeon) {
      const interval = setInterval(fetchNeonMetrics, 60000); // Refresh every 60 seconds (Neon updates every 15 min)
      return () => clearInterval(interval);
    }
  }, [activeTab, autoRefreshNeon]);

  // Initial fetch when database tab is opened
  useEffect(() => {
    if (activeTab === 'database' && !neonMetrics) {
      fetchNeonMetrics();
    }
  }, [activeTab]);

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
        // Check if notification was saved for in-app display
        const inAppSaved = data.response?.inAppNotificationSaved || data.success;
        const pushCount = data.response?.successCount || 0;

        setSendStatus({
          type: 'success',
          message: inAppSaved
            ? `✅ Notification saved! All users will see it in-app. ${pushCount > 0 ? `Also sent to ${pushCount} push subscribers.` : ''}`
            : `Notification sent to ${pushCount} users`,
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
    { id: 'notifications', label: 'Push Notifications', icon: Settings },
    { id: 'database', label: 'Database Monitoring', icon: Database },
    { id: 'architecture', label: 'System Architecture', icon: GitBranch },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-3">
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Developer Dashboard</h1>
              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Developer Access
              </span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
              <Button onClick={handleLogout} variant="outline" className="text-sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex flex-wrap gap-2 sm:gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.id === 'monitoring' ? 'Monitor' : tab.id === 'database' ? 'DB' : tab.id === 'api' ? 'API' : tab.id === 'testing' ? 'Test' : tab.id === 'architecture' ? 'Arch' : 'Notify'}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="grid gap-6">
          {activeTab === 'database' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT COLUMN - Database Health Metrics */}
              <div className="flex flex-col gap-6">
                {/* Database Health Header */}
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Database Health Metrics</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Real-time PostgreSQL database statistics and monitoring
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={autoRefresh}
                          onChange={(e) => setAutoRefresh(e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                        Auto-refresh (30s)
                      </label>
                      <Button
                        onClick={fetchDatabaseStats}
                        disabled={isLoadingStats}
                        variant="outline"
                        className="text-sm"
                      >
                        {isLoadingStats ? 'Refreshing...' : 'Refresh Now'}
                      </Button>
                    </div>
                    {lastRefresh && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Last updated: {lastRefresh.toLocaleString()}
                      </div>
                    )}
                    {statsError && (
                      <div className="p-3 rounded-md bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200">
                        {statsError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Database Metrics Grid */}
                {dbStats && !isLoadingStats && (
                  <>
                    {/* Connection Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MetricsCard
                      title="Active Connections"
                      value={dbStats.connections.active_connections}
                      subtitle="Currently executing queries"
                      icon={Activity}
                      status={
                        dbStats.connections.active_connections > 20
                          ? 'warning'
                          : dbStats.connections.active_connections > 50
                          ? 'error'
                          : 'success'
                      }
                    />
                    <MetricsCard
                      title="Idle Connections"
                      value={dbStats.connections.idle_connections}
                      subtitle="Waiting for queries"
                      icon={Users}
                      status="neutral"
                    />
                    <MetricsCard
                      title="Total Connections"
                      value={dbStats.connections.total_connections}
                      subtitle="All database connections"
                      icon={Database}
                      status={
                        dbStats.connections.total_connections > 80
                          ? 'error'
                          : dbStats.connections.total_connections > 50
                          ? 'warning'
                          : 'success'
                      }
                    />
                    <MetricsCard
                      title="Cache Hit Ratio"
                      value={`${dbStats.cache.cache_hit_ratio?.toFixed(2) || 0}%`}
                      subtitle="Data served from cache"
                      icon={Cpu}
                      status={
                        (dbStats.cache.cache_hit_ratio || 0) > 90
                          ? 'success'
                          : (dbStats.cache.cache_hit_ratio || 0) > 70
                          ? 'warning'
                          : 'error'
                      }
                    />
                  </div>

                  {/* Database Size and Performance */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MetricsCard
                      title="Database Size"
                      value={dbStats.database_size.size_formatted}
                      subtitle={`${(dbStats.database_size.size_bytes / (1024 * 1024)).toFixed(2)} MB`}
                      icon={HardDrive}
                      status="neutral"
                    />
                    <MetricsCard
                      title="Deadlocks"
                      value={dbStats.transactions.deadlocks || 0}
                      subtitle="Total deadlocks detected"
                      icon={Activity}
                      status={
                        (dbStats.transactions.deadlocks || 0) > 10
                          ? 'error'
                          : (dbStats.transactions.deadlocks || 0) > 0
                          ? 'warning'
                          : 'success'
                      }
                    />
                  </div>

                    {/* Connection Distribution Chart */}
                    <MetricsChart
                      title="Connection Distribution"
                      type="bar"
                      data={[
                        {
                          label: 'Active',
                          value: dbStats.connections.active_connections,
                          color: 'bg-green-500'
                        },
                        {
                          label: 'Idle',
                          value: dbStats.connections.idle_connections,
                          color: 'bg-blue-500'
                        },
                        {
                          label: 'Waiting',
                          value: dbStats.connections.waiting_connections,
                          color: 'bg-yellow-500'
                        }
                      ]}
                      height={200}
                    />

                    <MetricsChart
                      title="Transaction Success Rate"
                      type="progress"
                      data={[
                        {
                          label: 'Commits',
                          value: dbStats.transactions.commits,
                          color: 'bg-green-500'
                        },
                        {
                          label: 'Rollbacks',
                          value: dbStats.transactions.rollbacks,
                          color: 'bg-red-500'
                        }
                      ]}
                      maxValue={Math.max(dbStats.transactions.commits, dbStats.transactions.rollbacks, 1)}
                    />

                    {/* Top Tables by Size */}
                    {dbStats.tables && dbStats.tables.length > 0 && (
                      <div className="col-span-1 md:col-span-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                          Largest Tables
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Table Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Size
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Row Count
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {dbStats.tables.slice(0, 5).map((table, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                    {table.tablename}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                    {table.total_size}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                    {table.row_count?.toLocaleString() || 'N/A'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Loading State */}
                {isLoadingStats && !dbStats && (
                  <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading database metrics...</p>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN - Neon Infrastructure Metrics */}
              <div className="flex flex-col gap-6">
                {/* Neon Infrastructure Header */}
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Neon Infrastructure Metrics</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Neon project configuration and endpoint information
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={autoRefreshNeon}
                          onChange={(e) => setAutoRefreshNeon(e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                        Auto-refresh (60s)
                      </label>
                      <Button
                        onClick={fetchNeonMetrics}
                        disabled={isLoadingNeonMetrics}
                        variant="outline"
                        className="text-sm"
                      >
                        {isLoadingNeonMetrics ? 'Refreshing...' : 'Refresh Now'}
                      </Button>
                    </div>
                    {lastNeonRefresh && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Last updated: {lastNeonRefresh.toLocaleString()}
                      </div>
                    )}
                    {neonMetricsError && (
                      <div className="p-3 rounded-md bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                        {neonMetricsError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Neon Project Info */}
                {neonMetrics && !isLoadingNeonMetrics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MetricsCard
                      title="Project Region"
                      value={neonMetrics.projectInfo.region}
                      subtitle={neonMetrics.projectInfo.name}
                      icon={Database}
                      status="neutral"
                    />
                    <MetricsCard
                      title="PostgreSQL Version"
                      value={`v${neonMetrics.projectInfo.platformVersion}`}
                      subtitle="Platform version"
                      icon={Database}
                      status="success"
                    />
                    <MetricsCard
                      title="Compute Endpoints"
                      value={neonMetrics.compute.endpoints.length}
                      subtitle={neonMetrics.compute.endpoints[0]?.currentState || 'N/A'}
                      icon={Cpu}
                      status={
                        neonMetrics.compute.endpoints[0]?.currentState === 'active'
                          ? 'success'
                          : 'neutral'
                      }
                    />
                    <MetricsCard
                      title="Auto-scaling Range"
                      value={`${neonMetrics.compute.endpoints[0]?.autoscalingLimitMinCu || 0} - ${neonMetrics.compute.endpoints[0]?.autoscalingLimitMaxCu || 0}`}
                      subtitle="Compute Units (CU)"
                      icon={Activity}
                      status="neutral"
                    />
                  </div>
                )}

                {/* Loading State for Neon Metrics */}
                {isLoadingNeonMetrics && !neonMetrics && (
                  <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading Neon infrastructure metrics...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <SystemArchitecture />
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
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
