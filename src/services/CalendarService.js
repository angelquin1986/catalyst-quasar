import axios from 'axios'

const API_URL = 'http://192.168.100.91:8082/api/v1'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar el token de autenticación si está disponible
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

export const CalendarService = {
  // Obtiene todos los partidos, filtra por scheduled y ordena
  async getScheduledMatches () {
    const response = await apiClient.get('/matches')
    const allMatches = response.data
    
    // Filtrar solo partidos con status 'scheduled' y ordenar
    return allMatches
      .filter(match => match.status === 'scheduled')
      .sort((a, b) => {
        // Primero por fecha (ascendente)
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime()
        }
        
        // Luego por estadio (descendente)
        const stadiumA = a.stadium?.name || ''
        const stadiumB = b.stadium?.name || ''
        const stadiumComparison = stadiumB.localeCompare(stadiumA)
        if (stadiumComparison !== 0) {
          return stadiumComparison
        }
        
        // Finalmente por hora (ascendente)
        const hourA = a.hour || 0
        const hourB = b.hour || 0
        return  hourA - hourB
      })
  }
} 