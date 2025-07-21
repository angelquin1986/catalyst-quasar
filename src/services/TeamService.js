import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const TEAMS_API_URL = `${API_BASE_URL}/api/v1/teams`

// Función para deserializar photo de []byte a base64 string
const deserializePhoto = (photoData) => {
  console.log('🔍 Deserializando photo:', photoData)
  
  if (!photoData || !Array.isArray(photoData)) {
    console.log('❌ Photo data no válida:', photoData)
    return null
  }
  
  try {
    // Convertir array de bytes a Uint8Array
    const uint8Array = new Uint8Array(photoData)
    console.log('📊 Uint8Array length:', uint8Array.length)
    
    // Convertir a base64
    const base64 = btoa(String.fromCharCode.apply(null, uint8Array))
    console.log('🔄 Base64 generado, length:', base64.length)
    
    // Retornar como data URL para mostrar en img (solo PNG)
    const result = `data:image/png;base64,${base64}`
    console.log('✅ Photo deserializada correctamente')
    return result
  } catch (error) {
    console.error('❌ Error deserializing photo:', error)
    return null
  }
}

// Función para procesar datos recibidos del backend
const processTeamData = (teamData) => {
  console.log('🔄 Procesando team data:', teamData)
  if (teamData.photo) {
    console.log('📸 Team tiene photo, deserializando...')
    teamData.photo = deserializePhoto(teamData.photo)
  } else {
    console.log('❌ Team no tiene photo')
  }
  return teamData
}

export const TeamService = {
  // Obtener todos los teams
  async getAllTeams() {
    try {
      console.log('🚀 Obteniendo todos los teams...')
      const response = await axios.get(TEAMS_API_URL)
      console.log('📥 Response recibida:', response.data)
      
      // Procesar cada team para deserializar photos
      const teams = Array.isArray(response.data) 
        ? response.data.map(processTeamData)
        : processTeamData(response.data)
      
      console.log('✅ Teams procesados:', teams)
      return teams
    } catch (error) {
      console.error('Error fetching teams:', error)
      throw error
    }
  },

  // Obtener team por ID
  async getTeamById(id) {
    try {
      console.log('🚀 Obteniendo team por ID:', id)
      const response = await axios.get(`${TEAMS_API_URL}/${id}`)
      console.log('📥 Team response:', response.data)
      return processTeamData(response.data)
    } catch (error) {
      console.error('Error fetching team:', error)
      throw error
    }
  },

  // Crear nuevo team
  async createTeam(teamData) {
    try {
      // Convertir photo de base64 a []byte si existe
      const dataToSend = { ...teamData }
      if (dataToSend.photo) {
        // Extraer la parte base64 del string data:image/...;base64,...
        const base64Data = dataToSend.photo.split(',')[1]
        // Convertir base64 a Uint8Array (equivalente a []byte)
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
        dataToSend.photo = Array.from(binaryData) // Convertir a array para enviar como []byte
      }

      const response = await axios.post(TEAMS_API_URL, dataToSend, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return processTeamData(response.data)
    } catch (error) {
      console.error('Error creating team:', error)
      throw error
    }
  },

  // Actualizar team
  async updateTeam(id, teamData) {
    try {
      // Convertir photo de base64 a []byte si existe
      const dataToSend = { ...teamData }
      if (dataToSend.photo) {
        // Extraer la parte base64 del string data:image/...;base64,...
        const base64Data = dataToSend.photo.split(',')[1]
        // Convertir base64 a Uint8Array (equivalente a []byte)
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
        dataToSend.photo = Array.from(binaryData) // Convertir a array para enviar como []byte
      }

      const response = await axios.put(`${TEAMS_API_URL}/${id}`, dataToSend, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return processTeamData(response.data)
    } catch (error) {
      console.error('Error updating team:', error)
      throw error
    }
  },

  // Eliminar team
  async deleteTeam(id) {
    try {
      const response = await axios.delete(`${TEAMS_API_URL}/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting team:', error)
      throw error
    }
  },

  // Obtener team con sus players
  async getTeamWithPlayers(id) {
    try {
      console.log('🚀 Obteniendo team con players:', id)
      const response = await axios.get(`${TEAMS_API_URL}/${id}/players`)
      console.log('📥 Team with players response:', response.data)
      
      const teamData = processTeamData(response.data)
      
      // Procesar también las photos de los players si existen
      if (teamData.players && Array.isArray(teamData.players)) {
        console.log('👥 Procesando players photos...')
        teamData.players = teamData.players.map(player => {
          if (player.photo) {
            console.log('📸 Player tiene photo, deserializando...')
            player.photo = deserializePhoto(player.photo)
          }
          return player
        })
      }
      
      console.log('✅ Team with players procesado:', teamData)
      return teamData
    } catch (error) {
      console.error('Error fetching team with players:', error)
      throw error
    }
  }
} 