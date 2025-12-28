/**
 * API Configuration
 * Dynamically sets the API URL based on the current environment
 */

// Get the API base URL based on the current environment
export const getApiBaseUrl = () => {
  // In production, use relative URLs (same domain)
  if (window.location.hostname !== 'localhost') {
    return window.location.origin
  }
  
  // In development, use localhost
  return 'http://localhost:5000'
}

export const API_BASE_URL = getApiBaseUrl()

/**
 * Fetch wrapper that automatically includes credentials
 */
export const apiFetch = (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  return fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}

/**
 * Get the login URL
 */
export const getLoginUrl = () => {
  return `${API_BASE_URL}/login/google`
}

export default {
  API_BASE_URL,
  apiFetch,
  getLoginUrl,
}
