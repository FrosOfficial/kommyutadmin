import { useState, useEffect, useCallback } from 'react'
import { ApiResponse, LoadingState } from '../types'

interface UseApiOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

interface UseApiReturn<T> extends LoadingState {
  data: T | null
  refetch: () => Promise<void>
}

export const useApi = <T = any>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
): UseApiReturn<T> => {
  const { immediate = true, onSuccess, onError } = options
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(immediate)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiCall()

      if (response.success && response.data) {
        setData(response.data)
        onSuccess?.(response.data)
      } else {
        const errorMessage = response.error || 'An error occurred'
        setError(errorMessage)
        onError?.(errorMessage)
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Network error'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [apiCall, onSuccess, onError])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return {
    data,
    isLoading,
    error,
    refetch: execute
  }
}
