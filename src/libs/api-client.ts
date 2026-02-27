// lib/api-client.ts
// Axios instance with automatic token injection and refresh

import axios, { AxiosInstance, AxiosError } from 'axios'
import { getAuthToken, clearAuthData } from './auth.utils'

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL

/**
 * Create axios instance with auth token
 */
export const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // Request interceptor - add token to headers
  client.interceptors.request.use(
    config => {
      const token = getAuthToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    error => {
      return Promise.reject(error)
    }
  )

  // Response interceptor - handle 401/403 errors
  client.interceptors.response.use(
    response => {
      return response
    },
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Token expired or invalid — clear auth and let useAuth redirect softly
        clearAuthData()
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('authStatusChanged', {
              detail: { status: 'logout', reason: 'unauthorized' }
            })
          )
        }
      }
      // 403 = authenticated but forbidden — do NOT clear auth or redirect;
      // let the calling component handle it (show error, etc.)

      return Promise.reject(error)
    }
  )

  return client
}

// Export singleton instance
export const apiClient = createApiClient()

/**
 * Helper functions for common API calls
 */
export const api = {
  get: (url: string, config = {}) => apiClient.get(url, config),
  post: (url: string, data = {}, config = {}) =>
    apiClient.post(url, data, config),
  put: (url: string, data = {}, config = {}) =>
    apiClient.put(url, data, config),
  patch: (url: string, data = {}, config = {}) =>
    apiClient.patch(url, data, config),
  delete: (url: string, config = {}) => apiClient.delete(url, config)
}
