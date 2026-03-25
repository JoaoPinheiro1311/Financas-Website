/**
 * API Configuration
 * Dynamically sets the API URL based on the current environment
 */

// Get the API base URL based on the current environment
export const getApiBaseUrl = () => {
  if (window.location.hostname !== 'localhost') {
    return window.location.origin
  }
  return 'http://localhost:5000'
}

export const API_BASE_URL = getApiBaseUrl()

export const SERVICES = {
  IDENTITY: 'http://localhost:8001/api/v1/auth',
  FINANCE: 'http://localhost:8002/api/v1',
  INVESTMENTS: 'http://localhost:8003/api/v1',
  GOALS: 'http://localhost:8004/api/v1',
  NOTIFICATIONS: 'http://localhost:8005/api/v1',
};

/**
 * Fetch wrapper that automatically includes credentials
 */
export const apiFetch = (endpoint, options = {}) => {
  let url = endpoint
  
  const getCookie = (name) => {
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    } catch (e) { return null; }
  }
  const userId = getCookie('user_id');
  const token = getCookie('access_token');

  if (!url.startsWith('http')) {
    if (url.startsWith('/api/dashboard') || url.startsWith('/api/user') || url.startsWith('/api/logout') || url.startsWith('/api/auth')) {
      url = `${SERVICES.IDENTITY}${url.replace('/api/auth', '').replace('/api', '')}`
    } else if (url.startsWith('/api/savings-goals')) {
      url = `${SERVICES.GOALS}/goals/`
    } else if (url.startsWith('/api/investments')) {
      url = `${SERVICES.INVESTMENTS}/investments/`
    } else if (url.startsWith('/api/stock')) {
      url = `${SERVICES.INVESTMENTS}/investments/`
    } else if (url.startsWith('/api/notifications')) {
      url = `${SERVICES.NOTIFICATIONS}/notifications/`
    } else if (url.startsWith('/api/activity-summary')) {
      url = `${SERVICES.FINANCE}/summary/`
    } else if (url.startsWith('/api/financial-health')) {
      url = `${SERVICES.FINANCE}/summary/health`
    } else if (url.startsWith('/api/transactions')) {
      url = `${SERVICES.FINANCE}/transactions/`
    } else if (url.startsWith('/api/summary/insights')) {
      url = `${SERVICES.FINANCE}/summary/insights`
    } else if (url.startsWith('/api/summary/analysis')) {
      url = `${SERVICES.FINANCE}/summary/analysis`
    } else if (url.startsWith('/api/categories')) {
      url = `${SERVICES.FINANCE}/categories/`
    } else {
      url = `${SERVICES.FINANCE}${url.replace('/api', '')}`
    }
  }

  if (userId && !url.includes('user_id=')) {
    url += (url.includes('?') ? '&' : '?') + `user_id=${userId}`;
  }

  const requestId = Math.random().toString(36).substring(7);
  return fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      'Authorization': token ? `Bearer ${token}` : undefined,
      ...options.headers,
    },
  })
}

/**
 * Get the login URL
 */
export const getLoginUrl = () => {
  return `${SERVICES.IDENTITY}/login/google`
}

export default {
  API_BASE_URL,
  apiFetch,
  getLoginUrl,
}
