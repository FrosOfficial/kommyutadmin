import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { TrendingUp, Users, DollarSign, Target, Award, AlertCircle, RefreshCw } from 'lucide-react';
import { analyticsAPI } from '../services/api';
import type { DashboardMetrics } from '../types';
// Recharts will be used when real data is available
// import { LineChart, BarChart, AreaChart, PieChart } from 'recharts';

const CEODashboard: React.FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const response = await analyticsAPI.getDashboardMetrics();
      if (response.success && response.data) {
        setMetrics(response.data);
      } else {
        setError('Failed to fetch dashboard metrics');
      }
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      setError('Unable to load dashboard data.');
      // No fallback data - show actual error
      setMetrics(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Chart colors for future use
  // const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

  const tabs = [
    { id: 'overview', label: 'Executive Summary', icon: Target },
    { id: 'growth', label: 'Engagement Trends', icon: TrendingUp },
    { id: 'financial', label: 'Fare Analytics', icon: DollarSign },
    { id: 'forecasts', label: 'Ridership Forecasts', icon: Award },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading executive dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CEO Dashboard</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                Executive Access
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                disabled={refreshing}
                className="flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleLogout} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="w-full px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

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
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
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
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</h3>
                    <Users className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {metrics?.totalUsers.toLocaleString() || '0'}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Registered users
                    </p>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Revenue</h3>
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      ₱{metrics?.monthlyRevenue.toLocaleString() || '0'}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      No revenue data yet
                    </p>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Growth Rate</h3>
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {metrics?.growthRate || '0'}%
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Awaiting historical data
                    </p>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">User Engagement</h3>
                    <Target className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {metrics?.userEngagement || '0'}%
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Requires trip tracking
                    </p>
                  </div>
                </div>
              </div>

              {/* Analytics Status */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 dark:text-blue-200 mb-2">
                  📊 Analytics System Status
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
                  The dashboard is ready to display charts and insights once trip tracking data becomes available.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <p className="font-medium text-gray-900 dark:text-white">✅ Ready</p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                      <li>• User authentication (Neon DB)</li>
                      <li>• Role-based access control</li>
                      <li>• Real-time data fetching</li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <p className="font-medium text-gray-900 dark:text-white">⏳ Pending Data Collection</p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                      <li>• Trip records</li>
                      <li>• Revenue tracking</li>
                      <li>• Engagement metrics</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'growth' && (
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  User Engagement Trends Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  High-level user engagement trends and ridership patterns will display here once trip data is collected.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Fare Analytics Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Daily, weekly, and monthly fare summaries will display here once fare tracking is implemented.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'forecasts' && (
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Predictive Ridership Forecasts Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-4">
                  AI-powered predictions for future ridership and revenue will appear here once we have sufficient historical data.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Forecasts will help with capacity planning and strategic decision-making.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CEODashboard;
