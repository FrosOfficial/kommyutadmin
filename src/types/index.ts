// User and Authentication Types
export type UserRole = 'user' | 'developer' | 'manager' | 'ceo'

export interface User {
  uid: string
  email: string
  displayName?: string
  role: UserRole
  createdAt: Date
  lastLogin: Date
  needsApproval?: boolean
}

// Dashboard Types
export interface DashboardMetrics {
  totalUsers: number
  monthlyRevenue: number
  growthRate: number
  userEngagement: number
}

export interface RouteAnalytics {
  routeName: string
  usageCount: number
  revenue: number
  peakHours: string[]
}

export interface SystemHealth {
  apiResponseTime: number
  databaseQueries: number
  errorRate: number
  activeUsers: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

// Chart Data Types
export interface ChartDataPoint {
  label: string
  value: number
  date?: string
}

export interface TimeSeriesData {
  timestamp: string
  value: number
  category?: string
}

// Notification Types
export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, any>
}

export interface NotificationResponse {
  success: boolean
  messageId?: string
  error?: string
}

// Error Types
export interface AppError {
  code: string
  message: string
  statusCode: number
  details?: Record<string, any>
}

// Form Types
export interface LoginForm {
  email: string
  password: string
}

export interface SignupForm {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
}

// Component Props Types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface LoadingState {
  isLoading: boolean
  error?: string | null
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Environment Types
export interface EnvironmentConfig {
  firebase: {
    apiKey: string
    authDomain: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
  }
  api: {
    baseUrl: string
    timeout: number
  }
  app: {
    name: string
    version: string
    environment: 'development' | 'staging' | 'production'
  }
}
