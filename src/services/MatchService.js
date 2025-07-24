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

export const MatchService = {
  // == Matches CRUD ==
  getMatches () {
    return apiClient.get('/matches')
  },

  getMatch (id) {
    return apiClient.get(`/matches/${id}`)
  },

  createMatch (matchData) {
    return apiClient.post('/matches', matchData)
  },

  updateMatch (id, matchData) {
    return apiClient.put(`/matches/${id}`, matchData)
  },

  deleteMatch (id) {
    return apiClient.delete(`/matches/${id}`)
  },

  // == Data for Forms ==
  getTeams () {
    return apiClient.get('/teams')
  },

  getSeasons () {
    return apiClient.get('/seasons')
  },

  getStadiums () {
    return apiClient.get('/stadiums')
  },

  getTeamsBySeason (seasonId) {
    return apiClient.get(`/seasons/${seasonId}/teams`)
  }
} 