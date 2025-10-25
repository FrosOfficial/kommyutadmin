import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { ApiResponse, PaginatedResponse, User, SystemHealth, RouteAnalytics, DashboardMetrics } from '../types'

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8888' : 'https://kommyut.netlify.app'),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Authentication API
export const authAPI = {
  // Login with email/password (fallback)
  login: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  // Refresh token
  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    const response = await api.post('/auth/refresh')
    return response.data
  },

  // Logout
  logout: async (): Promise<ApiResponse<void>> => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  // Get current user profile
  getProfile: async (uid: string): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get(`/.netlify/functions/users/${uid}`)
      // Wrap the response in ApiResponse format
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      console.error('getProfile error:', error);
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// Analytics API
export const analyticsAPI = {
  // Get dashboard metrics
  getDashboardMetrics: async (): Promise<ApiResponse<DashboardMetrics>> => {
    const response = await api.get('/analytics/dashboard')
    return response.data
  },

  // Get route analytics
  getRouteAnalytics: async (params?: { limit?: number; offset?: number }): Promise<ApiResponse<RouteAnalytics[]>> => {
    const response = await api.get('/analytics/routes', { params })
    return response.data
  },

  // Get user growth data
  getUserGrowth: async (params?: { period?: 'daily' | 'weekly' | 'monthly' }): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/analytics/user-growth', { params })
    return response.data
  },

  // Get revenue data
  getRevenueData: async (params?: { period?: 'daily' | 'weekly' | 'monthly' }): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/analytics/revenue', { params })
    return response.data
  }
}

// Notification API
export const notificationAPI = {
  // Send push notification
  sendNotification: async (payload: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/notifications/send', payload)
    return response.data
  },

  // Get notification history
  getNotificationHistory: async (params?: { limit?: number; offset?: number }): Promise<PaginatedResponse<any>> => {
    const response = await api.get('/notifications/history', { params })
    return response.data
  }
}

// User Management API (for admin users)
export const userManagementAPI = {
  // Get all users (admin only)
  getUsers: async (params?: { role?: string; limit?: number; offset?: number }): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/admin/users', { params })
    return response.data
  },

  // Update user role (admin only)
  updateUserRole: async (userId: string, role: string): Promise<ApiResponse<User>> => {
    const response = await api.patch(`/admin/users/${userId}/role`, { role })
    return response.data
  },

  // Approve user (admin only)
  approveUser: async (userId: string): Promise<ApiResponse<User>> => {
    const response = await api.patch(`/admin/users/${userId}/approve`)
    return response.data
  }
}

export default api
