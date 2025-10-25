import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Toast, ToastType } from '../components/ui/Toast';
import { Moon, Sun, Shield, CheckCircle, XCircle, FileText, Calendar, User, Mail, History, TrendingUp } from 'lucide-react';

interface PendingUser {
  uid: string;
  email: string;
  display_name: string;
  user_type: string;
  id_document_url: string;
  birthday: string;
  created_at: string;
  updated_at: string;
}

interface VerificationHistoryRecord {
  id: number;
  uid: string;
  email: string;
  display_name: string;
  user_type: string;
  id_document_url: string | null;
  action: 'approve' | 'reject' | 're-approve';
  verified: boolean;
  note: string;
  verified_at: string;
}

interface TripStatistics {
  completed_trips: string;
  active_trips: string;
  total_trips: string;
  users_completed: string;
  users_active: string;
  total_users: string;
  total_distance_completed: string;
  total_revenue: string;
}

const ManagerDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('verification');
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [historyUsers, setHistoryUsers] = useState<VerificationHistoryRecord[]>([]);
  const [tripStats, setTripStats] = useState<TripStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [verificationNote, setVerificationNote] = useState('');
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<VerificationHistoryRecord | null>(null);
  const [reApproveNote, setReApproveNote] = useState('');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

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

  // Fetch pending ID verifications
  const fetchPendingVerifications = async () => {
    setIsLoading(true);
    try {
      const API_URL = import.meta.env.PROD ? '/.netlify/functions' : '/.netlify/functions';
      const response = await fetch(`${API_URL}/users/pending-verification`);

      if (!response.ok) {
        throw new Error('Failed to fetch pending verifications');
      }

      const data = await response.json();
      setPendingUsers(data);
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch verification history
  const fetchVerificationHistory = async () => {
    setIsLoading(true);
    try {
      const API_URL = import.meta.env.PROD ? '/.netlify/functions' : '/.netlify/functions';
      const response = await fetch(`${API_URL}/users/verification-history`);

      if (!response.ok) {
        throw new Error('Failed to fetch verification history');
      }

      const data = await response.json();
      setHistoryUsers(data);
    } catch (error) {
      console.error('Error fetching verification history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch trip statistics
  const fetchTripStatistics = async () => {
    setIsLoading(true);
    try {
      const API_URL = import.meta.env.PROD ? '/.netlify/functions' : '/.netlify/functions';
      const response = await fetch(`${API_URL}/trips/all-stats`);

      if (!response.ok) {
        throw new Error('Failed to fetch trip statistics');
      }

      const data = await response.json();
      setTripStats(data);
    } catch (error) {
      console.error('Error fetching trip statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch pending verifications when verification tab is active
  useEffect(() => {
    if (activeTab === 'verification') {
      fetchPendingVerifications();
    } else if (activeTab === 'history') {
      fetchVerificationHistory();
    } else if (activeTab === 'trips') {
      fetchTripStatistics();
    }
  }, [activeTab]);

  // Handle approve/reject verification
  const handleVerification = async (uid: string, action: 'approve' | 'reject') => {
    // Require note when rejecting
    if (action === 'reject' && !verificationNote.trim()) {
      setToast({
        message: 'Please provide a reason for rejection',
        type: 'error'
      });
      return;
    }

    try {
      const API_URL = import.meta.env.PROD ? '/.netlify/functions' : '/.netlify/functions';
      const response = await fetch(`${API_URL}/users/${uid}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, note: verificationNote || undefined }),
      });

      if (!response.ok) {
        throw new Error('Failed to update verification');
      }

      // Refresh the list
      await fetchPendingVerifications();
      setSelectedUser(null);
      setVerificationNote('');

      // Show success toast
      setToast({
        message: `ID ${action === 'approve' ? 'approved' : 'rejected'} successfully!`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating verification:', error);
      // Show error toast
      setToast({
        message: `Failed to ${action} ID verification`,
        type: 'error'
      });
    }
  };

  // Handle re-approve verification from history
  const handleReApprove = async (uid: string) => {
    // Require note when re-approving
    if (!reApproveNote.trim()) {
      setToast({
        message: 'Please provide a note for re-approval',
        type: 'error'
      });
      return;
    }

    try {
      const API_URL = import.meta.env.PROD ? '/.netlify/functions' : '/.netlify/functions';
      const response = await fetch(`${API_URL}/users/${uid}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 're-approve', note: reApproveNote }),
      });

      if (!response.ok) {
        throw new Error('Failed to re-approve verification');
      }

      // Refresh the history list
      await fetchVerificationHistory();
      setSelectedHistoryRecord(null);
      setReApproveNote('');

      // Show success toast
      setToast({
        message: 'ID re-approved successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error re-approving verification:', error);
      // Show error toast
      setToast({
        message: 'Failed to re-approve ID verification',
        type: 'error'
      });
    }
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'student': return 'Student';
      case 'senior': return 'Senior Citizen';
      case 'pwd': return 'Person with Disability (PWD)';
      default: return 'Regular';
    }
  };

  const tabs = [
    { id: 'verification', label: 'ID Verification', icon: Shield },
    { id: 'history', label: 'Verification History', icon: History },
    { id: 'trips', label: 'Trip Statistics', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-3">
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Manager Dashboard</h1>
              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Manager Access
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
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.id === 'analytics' ? 'Analytics' : tab.id === 'routes' ? 'Routes' : tab.id === 'revenue' ? 'Revenue' : 'Users'}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="grid gap-6">
          {activeTab === 'verification' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        ID Verification Management
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Review and approve user ID verification requests
                      </p>
                    </div>
                  </div>
                  <Button onClick={fetchPendingVerifications} variant="outline">
                    Refresh
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 dark:text-blue-400">Pending</p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                          {pendingUsers.length}
                        </p>
                      </div>
                      <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Verifications List */}
              {isLoading ? (
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading pending verifications...</p>
                  </div>
                </div>
              ) : pendingUsers.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-12">
                  <div className="text-center">
                    <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Pending Verifications
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      All ID verification requests have been processed.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6">
                  {pendingUsers.map((user) => (
                    <div
                      key={user.uid}
                      className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* User Information */}
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
                                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                  {user.display_name || 'No Name'}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {getUserTypeLabel(user.user_type)}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-sm">
                                <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                <span className="text-gray-700 dark:text-gray-300">{user.email}</span>
                              </div>

                              {user.birthday && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {new Date(user.birthday).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center space-x-2 text-sm">
                                <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                <span className="text-gray-700 dark:text-gray-300">
                                  Submitted: {new Date(user.updated_at).toLocaleDateString('en-US')}
                                </span>
                              </div>
                            </div>

                            {/* Note Input */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Verification Note <span className="text-red-600 dark:text-red-400">(Required for rejection)</span>
                              </label>
                              <textarea
                                value={selectedUser?.uid === user.uid ? verificationNote : ''}
                                onChange={(e) => {
                                  setSelectedUser(user);
                                  setVerificationNote(e.target.value);
                                }}
                                placeholder="Add a note about this verification (e.g., 'Invalid ID document', 'Expired ID', 'Photo unclear')..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                rows={3}
                              />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  handleVerification(user.uid, 'approve');
                                }}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                              >
                                <CheckCircle className="w-5 h-5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  handleVerification(user.uid, 'reject');
                                }}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                              >
                                <XCircle className="w-5 h-5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          </div>

                          {/* ID Document Preview */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              ID Document
                            </label>
                            <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
                              {user.id_document_url ? (
                                <img
                                  src={user.id_document_url}
                                  alt="ID Document"
                                  className="w-full h-auto object-contain max-h-96 cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(user.id_document_url, '_blank')}
                                />
                              ) : (
                                <div className="flex items-center justify-center h-64 text-gray-400">
                                  <FileText className="w-16 h-16" />
                                </div>
                              )}
                            </div>
                            {user.id_document_url && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                Click image to view full size in new tab
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <History className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Verification History
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        View all approved and rejected ID verifications
                      </p>
                    </div>
                  </div>
                  <Button onClick={fetchVerificationHistory} variant="outline">
                    Refresh
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 dark:text-green-400">Approved</p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                          {historyUsers.filter(u => u.verified).length}
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-600 dark:text-red-400">Rejected</p>
                        <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                          {historyUsers.filter(u => !u.verified).length}
                        </p>
                      </div>
                      <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 dark:text-blue-400">Total</p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                          {historyUsers.length}
                        </p>
                      </div>
                      <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* History List */}
              {isLoading ? (
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading verification history...</p>
                  </div>
                </div>
              ) : historyUsers.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-12">
                  <div className="text-center">
                    <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Verification History
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      No ID verifications have been processed yet.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6">
                  {historyUsers.map((record) => (
                    <div
                      key={record.id}
                      className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden"
                    >
                      <div className="p-6">
                        {/* Status Badge */}
                        <div className="mb-4 flex items-center justify-between">
                          {record.verified ? (
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              {record.action === 're-approve' ? 'Re-Approved' : 'Approved'}
                            </div>
                          ) : (
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                              <XCircle className="w-4 h-4 mr-2" />
                              Rejected
                            </div>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Record #{record.id}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* User Information */}
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <div className={`rounded-full p-3 ${
                                record.verified
                                  ? 'bg-green-100 dark:bg-green-900/30'
                                  : 'bg-red-100 dark:bg-red-900/30'
                              }`}>
                                <User className={`w-6 h-6 ${
                                  record.verified
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`} />
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                  {record.display_name || 'No Name'}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {getUserTypeLabel(record.user_type)}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-sm">
                                <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                <span className="text-gray-700 dark:text-gray-300">{record.email}</span>
                              </div>

                              <div className="flex items-center space-x-2 text-sm">
                                <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                <span className="text-gray-700 dark:text-gray-300">
                                  Processed: {new Date(record.verified_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>

                            {/* Verification Note */}
                            {record.note && (
                              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  {record.verified ? (record.action === 're-approve' ? 'Re-Approval' : 'Approval') : 'Rejection'} Note
                                </label>
                                <p className="text-sm text-gray-900 dark:text-white">
                                  {record.note}
                                </p>
                              </div>
                            )}

                            {/* Re-Approve Section for Rejected Items */}
                            {!record.verified && (
                              <div className="mt-4 space-y-3">
                                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Re-Approval Note <span className="text-red-600 dark:text-red-400">(Required)</span>
                                  </label>
                                  <textarea
                                    value={selectedHistoryRecord?.id === record.id ? reApproveNote : ''}
                                    onChange={(e) => {
                                      setSelectedHistoryRecord(record);
                                      setReApproveNote(e.target.value);
                                    }}
                                    placeholder="Provide a note explaining why this ID is now being re-approved (e.g., 'User submitted updated ID document', 'Verification error corrected')..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                    rows={2}
                                  />
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedHistoryRecord(record);
                                    handleReApprove(record.uid);
                                  }}
                                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                  <span>Re-Approve</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* ID Document Preview */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              ID Document
                            </label>
                            <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
                              {record.id_document_url ? (
                                <img
                                  src={record.id_document_url}
                                  alt="ID Document"
                                  className="w-full h-auto object-contain max-h-96 cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => record.id_document_url && window.open(record.id_document_url, '_blank')}
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                  <XCircle className="w-16 h-16 mb-2" />
                                  <p className="text-sm">No document available</p>
                                </div>
                              )}
                            </div>
                            {record.id_document_url && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                Click image to view full size in new tab
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'trips' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Trip Statistics
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Monitor user trip activity and completion rates
                      </p>
                    </div>
                  </div>
                  <Button onClick={fetchTripStatistics} variant="outline">
                    Refresh
                  </Button>
                </div>

                {/* Statistics */}
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : tripStats ? (
                  <div>
                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-600 dark:text-green-400">Completed Trips</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                              {parseInt(tripStats.completed_trips).toLocaleString()}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              {tripStats.users_completed} users
                            </p>
                          </div>
                          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                      </div>

                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-yellow-600 dark:text-yellow-400">Active Trips</p>
                            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                              {parseInt(tripStats.active_trips).toLocaleString()}
                            </p>
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                              {tripStats.users_active} users
                            </p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-blue-600 dark:text-blue-400">Total Trips</p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                              {parseInt(tripStats.total_trips).toLocaleString()}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              {tripStats.total_users} total users
                            </p>
                          </div>
                          <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-purple-600 dark:text-purple-400">Total Distance</p>
                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                              {parseFloat(tripStats.total_distance_completed).toLocaleString()} km
                            </p>
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                              Completed trips only
                            </p>
                          </div>
                          <Calendar className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>

                      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-indigo-600 dark:text-indigo-400">Total Revenue</p>
                            <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                              ₱{parseFloat(tripStats.total_revenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                              From completed trips
                            </p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                      </div>
                    </div>

                    {/* Completion Rate */}
                    <div className="mt-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trip Completion Rate</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {parseInt(tripStats.total_trips) > 0
                              ? ((parseInt(tripStats.completed_trips) / parseInt(tripStats.total_trips)) * 100).toFixed(1)
                              : '0'}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                          <div
                            className="bg-green-600 h-4 rounded-full transition-all duration-500"
                            style={{
                              width: `${parseInt(tripStats.total_trips) > 0
                                ? (parseInt(tripStats.completed_trips) / parseInt(tripStats.total_trips)) * 100
                                : 0}%`
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Completed: {parseInt(tripStats.completed_trips).toLocaleString()}</span>
                          <span>Active: {parseInt(tripStats.active_trips).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Trip Data Available
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Trip statistics will appear here once users start taking trips.
                    </p>
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

export default ManagerDashboard;
