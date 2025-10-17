import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { BarChart3, TrendingUp, Users, MapPin, DollarSign } from 'lucide-react';

const ManagerDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const tabs = [
    { id: 'analytics', label: 'Operational Analytics', icon: BarChart3 },
    { id: 'routes', label: 'Route Performance', icon: MapPin },
    { id: 'revenue', label: 'Revenue Analytics', icon: DollarSign },
    { id: 'users', label: 'User Trends', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manager Dashboard</h1>
              <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Manager Access
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
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
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
          {activeTab === 'analytics' && (
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Operational Analytics Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Most used routes, peak hours, revenue per route, and active commuter statistics will display here once trip tracking is implemented.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'routes' && (
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Route Performance Analytics Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Interactive visualization of route usage and performance metrics will display here once trip data is collected.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Revenue Analytics Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Daily and weekly revenue breakdowns by route and payment method will display here once revenue tracking is implemented.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  User Activity Trends Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Commuter behavior patterns, usage statistics, and activity heatmaps will display here once user activity tracking is implemented.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
