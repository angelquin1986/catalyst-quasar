import axios from 'axios'

const API_URL = import.meta.env.VITE_API_BASE_URL+'/api/v1'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor to add auth token if available
apiClient.interceptors.request.use(config => {
  // Assuming token is stored in localStorage, similar to SessionUtils logic
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

export const LeaderboardService = {
  getLeaderboardBySeason (seasonId) {
    return apiClient.get(`/leaderboards/season/${seasonId}`)
  }
} 