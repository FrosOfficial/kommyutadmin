import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { AlertCircle, Moon, Sun, Users, TrendingUp, UserCheck, GraduationCap, User, MapPin, DollarSign, BarChart3, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface UserStats {
  totalUsers: number;
  regularUsers: number;
  studentUsers: number;
  seniorUsers: number;
  pwdUsers: number;
  verifiedUsers: number;
}

interface AgeGroup {
  ageGroup: string;
  userCount: number;
  totalTrips: number;
  percentage: string;
}

interface AgeDemographics {
  ageGroups: AgeGroup[];
  summary: {
    totalUsers: number;
    totalTrips: number;
    avgTripsPerUser: string;
  };
}

interface RouteData {
  from_location: string;
  to_location: string;
  route_name: string;
  transit_type: string;
  trip_count: string;
  unique_users: string;
  avg_distance: string;
  avg_fare: string;
  total_revenue: string;
}

interface FareAnalytics {
  summary: {
    total_revenue: string;
    total_trips: string;
    unique_users: string;
    avg_fare_per_trip: string;
    total_distance: string;
  };
  breakdown: Array<{
    period: string;
    revenue: string;
    trips: string;
    users: string;
  }>;
}

const CEODashboard: React.FC = () => {
  const { logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );
  const [activeTab, setActiveTab] = useState<'executive-summary' | 'route-demand' | 'fare-analytics'>('executive-summary');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [ageDemographics, setAgeDemographics] = useState<AgeDemographics | null>(null);
  const [routeDemand, setRouteDemand] = useState<RouteData[]>([]);
  const [fareAnalytics, setFareAnalytics] = useState<FareAnalytics | null>(null);
  const [farePeriod, setFarePeriod] = useState<'day' | 'week' | 'month' | 'overall'>('overall');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch user statistics
  useEffect(() => {
    if (activeTab === 'executive-summary') {
      fetchUserStats();
      fetchAgeDemographics();
    }
  }, [activeTab]);

  // Fetch route demand data
  useEffect(() => {
    if (activeTab === 'route-demand') {
      fetchRouteDemand();
    }
  }, [activeTab]);

  // Fetch fare analytics data
  useEffect(() => {
    if (activeTab === 'fare-analytics') {
      fetchFareAnalytics();
    }
  }, [activeTab, farePeriod]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/.netlify/functions/users/stats');

      if (!response.ok) {
        throw new Error('Failed to fetch user statistics');
      }

      const data = await response.json();
      setUserStats(data);
    } catch (err) {
      console.error('Error fetching user stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgeDemographics = async () => {
    try {
      const response = await fetch('/.netlify/functions/users/age-demographics');

      if (!response.ok) {
        throw new Error('Failed to fetch age demographics');
      }

      const data = await response.json();
      setAgeDemographics(data);
    } catch (err) {
      console.error('Error fetching age demographics:', err);
      // Don't set error state here to avoid overriding other data
    }
  };

  const fetchRouteDemand = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/.netlify/functions/trips/route-demand');

      if (!response.ok) {
        throw new Error('Failed to fetch route demand data');
      }

      const data = await response.json();
      setRouteDemand(data);
    } catch (err) {
      console.error('Error fetching route demand:', err);
      setError(err instanceof Error ? err.message : 'Failed to load route demand data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFareAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = farePeriod === 'overall'
        ? '/.netlify/functions/trips/fare-analytics'
        : `/.netlify/functions/trips/fare-analytics?period=${farePeriod}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch fare analytics');
      }

      const data = await response.json();
      setFareAnalytics(data);
    } catch (err) {
      console.error('Error fetching fare analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load fare analytics');
    } finally {
      setLoading(false);
    }
  };

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

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Error Loading Statistics
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      );
    }

    if (activeTab === 'executive-summary' && userStats) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Executive Summary</h2>
            <p className="text-gray-600 dark:text-gray-400">Overview of registered users in the Kommyut platform</p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Users */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Users</p>
                  <p className="text-4xl font-bold mt-2">{userStats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="h-12 w-12 text-purple-200" />
              </div>
              <div className="mt-4 flex items-center text-purple-100 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                All registered users
              </div>
            </div>

            {/* Regular Users */}
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Regular Users</p>
                  <p className="text-4xl font-bold mt-2 text-gray-900 dark:text-white">{userStats.regularUsers.toLocaleString()}</p>
                </div>
                <User className="h-12 w-12 text-gray-400" />
              </div>
              <div className="mt-4 text-gray-500 dark:text-gray-400 text-sm">
                {((userStats.regularUsers / userStats.totalUsers) * 100).toFixed(1)}% of total
              </div>
            </div>

            {/* Verified Users */}
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Verified Users</p>
                  <p className="text-4xl font-bold mt-2 text-gray-900 dark:text-white">{userStats.verifiedUsers.toLocaleString()}</p>
                </div>
                <UserCheck className="h-12 w-12 text-green-500" />
              </div>
              <div className="mt-4 text-gray-500 dark:text-gray-400 text-sm">
                ID verified accounts
              </div>
            </div>

            {/* Student Users */}
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Student Users</p>
                  <p className="text-4xl font-bold mt-2 text-gray-900 dark:text-white">{userStats.studentUsers.toLocaleString()}</p>
                </div>
                <GraduationCap className="h-12 w-12 text-blue-500" />
              </div>
              <div className="mt-4 text-gray-500 dark:text-gray-400 text-sm">
                Student discount eligible
              </div>
            </div>

            {/* Senior Users */}
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Senior Citizens</p>
                  <p className="text-4xl font-bold mt-2 text-gray-900 dark:text-white">{userStats.seniorUsers.toLocaleString()}</p>
                </div>
                <Users className="h-12 w-12 text-orange-500" />
              </div>
              <div className="mt-4 text-gray-500 dark:text-gray-400 text-sm">
                Senior citizen discount
              </div>
            </div>

            {/* PWD Users */}
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">PWD Users</p>
                  <p className="text-4xl font-bold mt-2 text-gray-900 dark:text-white">{userStats.pwdUsers.toLocaleString()}</p>
                </div>
                <UserCheck className="h-12 w-12 text-purple-500" />
              </div>
              <div className="mt-4 text-gray-500 dark:text-gray-400 text-sm">
                PWD discount eligible
              </div>
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">User Distribution</h3>
            <p className="text-blue-700 dark:text-blue-400">
              Of the {userStats.totalUsers.toLocaleString()} total registered users,
              {' '}{userStats.verifiedUsers} ({((userStats.verifiedUsers / userStats.totalUsers) * 100).toFixed(1)}%) have verified their ID.
              {' '}Special user types include {userStats.studentUsers} students, {userStats.seniorUsers} senior citizens,
              and {userStats.pwdUsers} PWD users.
            </p>
          </div>

          {/* Age Demographics Section */}
          {ageDemographics && ageDemographics.ageGroups.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Age Demographics</h2>
              </div>

              {/* Age Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-100 text-sm font-medium">Users with Birthday</p>
                      <p className="text-4xl font-bold mt-2">{ageDemographics.summary.totalUsers.toLocaleString()}</p>
                    </div>
                    <Users className="h-12 w-12 text-indigo-200" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Trips by Age</p>
                      <p className="text-4xl font-bold mt-2 text-gray-900 dark:text-white">
                        {ageDemographics.summary.totalTrips.toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="h-12 w-12 text-blue-500" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Avg Trips per User</p>
                      <p className="text-4xl font-bold mt-2 text-gray-900 dark:text-white">
                        {parseFloat(ageDemographics.summary.avgTripsPerUser).toFixed(1)}
                      </p>
                    </div>
                    <BarChart3 className="h-12 w-12 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Pie Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Distribution Pie Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Distribution by Age</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={ageDemographics.ageGroups.filter(g => g.ageGroup !== 'Unknown').map(group => ({
                          name: group.ageGroup,
                          value: group.userCount,
                          percentage: group.percentage
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {ageDemographics.ageGroups.filter(g => g.ageGroup !== 'Unknown').map((entry, index) => {
                          const colors = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.9)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                        itemStyle={{
                          color: '#fff'
                        }}
                        labelStyle={{
                          color: '#fff'
                        }}
                        formatter={(value: any) => [`${value} users`, 'Count']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Trip Activity Pie Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trip Activity by Age</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={ageDemographics.ageGroups.filter(g => g.ageGroup !== 'Unknown' && g.totalTrips > 0).map(group => {
                          const totalTrips = ageDemographics.ageGroups.reduce((sum, g) => sum + g.totalTrips, 0);
                          const tripPercentage = totalTrips > 0 ? ((group.totalTrips / totalTrips) * 100).toFixed(1) : '0.0';
                          return {
                            name: group.ageGroup,
                            value: group.totalTrips,
                            percentage: tripPercentage
                          };
                        })}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {ageDemographics.ageGroups.filter(g => g.ageGroup !== 'Unknown' && g.totalTrips > 0).map((entry, index) => {
                          const colors = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.9)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                        itemStyle={{
                          color: '#fff'
                        }}
                        labelStyle={{
                          color: '#fff'
                        }}
                        formatter={(value: any) => [`${value} trips`, 'Count']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Age Groups Table/Cards */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Age Group Breakdown</h3>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Age Group</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Users</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Percentage</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Trips</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Avg Trips/User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Distribution</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {ageDemographics.ageGroups.map((group, index) => {
                        const avgTrips = group.userCount > 0 ? (group.totalTrips / group.userCount).toFixed(1) : '0.0';
                        const isUnknown = group.ageGroup === 'Unknown';

                        return (
                          <tr key={index} className={isUnknown ? 'bg-gray-50 dark:bg-gray-700/50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${isUnknown ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                {group.ageGroup}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                              {group.userCount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {group.percentage}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {group.totalTrips.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {avgTrips}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${group.percentage}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {ageDemographics.ageGroups.map((group, index) => {
                    const avgTrips = group.userCount > 0 ? (group.totalTrips / group.userCount).toFixed(1) : '0.0';
                    const isUnknown = group.ageGroup === 'Unknown';

                    return (
                      <div
                        key={index}
                        className={`rounded-lg border p-4 ${
                          isUnknown
                            ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600'
                            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-lg font-bold ${isUnknown ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                            {group.ageGroup}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                            {group.percentage}%
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Users</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                              {group.userCount.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Trips</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                              {group.totalTrips.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Trips</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                              {avgTrips}
                            </div>
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${group.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Insights Box */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-2">Age Demographics Insights</h3>
                <p className="text-purple-700 dark:text-purple-400">
                  {(() => {
                    const topAgeGroup = ageDemographics.ageGroups
                      .filter(g => g.ageGroup !== 'Unknown')
                      .sort((a, b) => b.userCount - a.userCount)[0];
                    const mostActiveGroup = ageDemographics.ageGroups
                      .filter(g => g.ageGroup !== 'Unknown')
                      .sort((a, b) => b.totalTrips - a.totalTrips)[0];

                    return (
                      <>
                        The largest age group is <span className="font-bold">{topAgeGroup?.ageGroup}</span> with{' '}
                        {topAgeGroup?.userCount.toLocaleString()} users ({topAgeGroup?.percentage}%).{' '}
                        The most active age group is <span className="font-bold">{mostActiveGroup?.ageGroup}</span> with{' '}
                        {mostActiveGroup?.totalTrips.toLocaleString()} total trips.
                      </>
                    );
                  })()}
                </p>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'route-demand') {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Route Demand Analysis</h2>
            <p className="text-gray-600 dark:text-gray-400">Most frequently used routes with highest demand</p>
          </div>

          {routeDemand.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Route Data Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">No completed trips have been recorded yet.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Route</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Transit Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Trips</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unique Users</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Avg Distance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Avg Fare</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {routeDemand.map((route, index) => (
                      <tr key={index} className={index < 3 ? 'bg-purple-50 dark:bg-purple-900/20' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                            index === 0 ? 'bg-yellow-400 text-yellow-900' :
                            index === 1 ? 'bg-gray-300 text-gray-900' :
                            index === 2 ? 'bg-orange-400 text-orange-900' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{route.from_location} → {route.to_location}</div>
                          {route.route_name && <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{route.route_name}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {route.transit_type || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                          {parseInt(route.trip_count).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {parseInt(route.unique_users).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {parseFloat(route.avg_distance).toFixed(2)} km
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ₱{parseFloat(route.avg_fare).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                          ₱{parseFloat(route.total_revenue).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {routeDemand.map((route, index) => (
                  <div
                    key={index}
                    className={`rounded-lg border p-4 ${
                      index < 3
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                            index === 0 ? 'bg-yellow-400 text-yellow-900' :
                            index === 1 ? 'bg-gray-300 text-gray-900' :
                            index === 2 ? 'bg-orange-400 text-orange-900' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            {route.transit_type || 'N/A'}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          {route.from_location} → {route.to_location}
                        </div>
                        {route.route_name && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {route.route_name}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Trips</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {parseInt(route.trip_count).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Unique Users</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {parseInt(route.unique_users).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Distance</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {parseFloat(route.avg_distance).toFixed(2)} km
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Fare</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          ₱{parseFloat(route.avg_fare).toFixed(2)}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Revenue</div>
                        <div className="text-xl font-bold text-green-600 dark:text-green-400">
                          ₱{parseFloat(route.total_revenue).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      );
    }

    if (activeTab === 'fare-analytics' && fareAnalytics) {
      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Fare Analytics</h2>
              <p className="text-gray-600 dark:text-gray-400">Total fare accumulated and revenue insights</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['overall', 'day', 'week', 'month'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setFarePeriod(period)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    farePeriod === period
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {period === 'overall' ? 'Overall' : `Per ${period.charAt(0).toUpperCase() + period.slice(1)}`}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs sm:text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">₱{parseFloat(fareAnalytics.summary.total_revenue || '0').toLocaleString()}</p>
                </div>
                <DollarSign className="h-10 w-10 sm:h-12 sm:w-12 text-green-200" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Total Trips</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-gray-900 dark:text-white">
                    {parseInt(fareAnalytics.summary.total_trips || '0').toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Unique Users</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-gray-900 dark:text-white">
                    {parseInt(fareAnalytics.summary.unique_users || '0').toLocaleString()}
                  </p>
                </div>
                <Users className="h-10 w-10 sm:h-12 sm:w-12 text-purple-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Avg Fare/Trip</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-gray-900 dark:text-white">
                    ₱{parseFloat(fareAnalytics.summary.avg_fare_per_trip || '0').toFixed(2)}
                  </p>
                </div>
                <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          {fareAnalytics.breakdown.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Breakdown</h3>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trips</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Users</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {fareAnalytics.breakdown.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {item.period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                          ₱{parseFloat(item.revenue).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {parseInt(item.trips).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {parseInt(item.users).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3">
                {fareAnalytics.breakdown.map((item, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.period}</span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        ₱{parseFloat(item.revenue).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>{parseInt(item.trips).toLocaleString()} trips</span>
                      <span>{parseInt(item.users).toLocaleString()} users</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-3">
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">CEO Dashboard</h1>
              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                Executive Access
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

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('executive-summary')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'executive-summary'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Executive Summary
            </button>
            <button
              onClick={() => setActiveTab('route-demand')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'route-demand'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Route Demand
            </button>
            <button
              onClick={() => setActiveTab('fare-analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'fare-analytics'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Fare Analytics
            </button>
          </nav>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Content Area */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 sm:p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default CEODashboard;
