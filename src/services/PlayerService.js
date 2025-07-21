import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const PLAYERS_API_URL = `${API_BASE_URL}/api/v1/players`

// Función para deserializar photo de []byte a base64 string
const deserializePhoto = (photoData) => {
  console.log('🔍 Deserializando photo de player:', photoData)
  
  if (!photoData || !Array.isArray(photoData)) {
    console.log('❌ Photo data de player no válida:', photoData)
    return null
  }
  
  try {
    // Convertir array de bytes a Uint8Array
    const uint8Array = new Uint8Array(photoData)
    console.log('📊 Player Uint8Array length:', uint8Array.length)
    
    // Convertir a base64
    const base64 = btoa(String.fromCharCode.apply(null, uint8Array))
    console.log('🔄 Player base64 generado, length:', base64.length)
    
    // Retornar como data URL para mostrar en img (solo PNG)
    const result = `data:image/png;base64,${base64}`
    console.log('✅ Player photo deserializada correctamente')
    return result
  } catch (error) {
    console.error('❌ Error deserializing player photo:', error)
    return null
  }
}

// Función para procesar datos recibidos del backend
const processPlayerData = (playerData) => {
  console.log('🔄 Procesando player data:', playerData)
  if (playerData.photo) {
    console.log('📸 Player tiene photo, deserializando...')
    playerData.photo = deserializePhoto(playerData.photo)
  } else {
    console.log('❌ Player no tiene photo')
  }
  return playerData
}

export const PlayerService = {
  // Obtener todos los players
  async getAllPlayers() {
    try {
      console.log('🚀 Obteniendo todos los players...')
      const response = await axios.get(PLAYERS_API_URL)
      console.log('📥 Players response recibida:', response.data)
      
      // Procesar cada player para deserializar photos
      const players = Array.isArray(response.data) 
        ? response.data.map(processPlayerData)
        : processPlayerData(response.data)
      
      console.log('✅ Players procesados:', players)
      return players
    } catch (error) {
      console.error('Error fetching players:', error)
      throw error
    }
  },

  // Obtener player por cedula
  async getPlayerById(cedula) {
    try {
      console.log('🚀 Obteniendo player por cedula:', cedula)
      const response = await axios.get(`${PLAYERS_API_URL}/${cedula}`)
      console.log('📥 Player response:', response.data)
      return processPlayerData(response.data)
    } catch (error) {
      console.error('Error fetching player:', error)
      throw error
    }
  },

  // Crear nuevo player
  async createPlayer(playerData) {
    try {
      // Convertir photo de base64 a []byte si existe
      const dataToSend = { ...playerData }
      if (dataToSend.photo) {
        // Extraer la parte base64 del string data:image/...;base64,...
        const base64Data = dataToSend.photo.split(',')[1]
        // Convertir base64 a Uint8Array (equivalente a []byte)
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
        dataToSend.photo = Array.from(binaryData) // Convertir a array para enviar como []byte
      }

      const response = await axios.post(PLAYERS_API_URL, dataToSend, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return processPlayerData(response.data)
    } catch (error) {
      console.error('Error creating player:', error)
      throw error
    }
  },

  // Actualizar player
  async updatePlayer(cedula, playerData) {
    try {
      // Convertir photo de base64 a []byte si existe
      const dataToSend = { ...playerData }
      if (dataToSend.photo) {
        // Extraer la parte base64 del string data:image/...;base64,...
        const base64Data = dataToSend.photo.split(',')[1]
        // Convertir base64 a Uint8Array (equivalente a []byte)
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
        dataToSend.photo = Array.from(binaryData) // Convertir a array para enviar como []byte
      }

      const response = await axios.put(`${PLAYERS_API_URL}/${cedula}`, dataToSend, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return processPlayerData(response.data)
    } catch (error) {
      console.error('Error updating player:', error)
      throw error
    }
  },

  // Eliminar player
  async deletePlayer(cedula) {
    try {
      const response = await axios.delete(`${PLAYERS_API_URL}/${cedula}`)
      return response.data
    } catch (error) {
      console.error('Error deleting player:', error)
      throw error
    }
  },

  // Obtener players por team
  async getPlayersByTeam(teamId) {
    try {
      console.log('🚀 Obteniendo players por team:', teamId)
      const response = await axios.get(`${API_BASE_URL}/api/v1/teams/${teamId}/players`)
      console.log('📥 Players by team response:', response.data)
      
      // Procesar cada player para deserializar photos
      const players = Array.isArray(response.data) 
        ? response.data.map(processPlayerData)
        : processPlayerData(response.data)
      
      console.log('✅ Players by team procesados:', players)
      return players
    } catch (error) {
      console.error('Error fetching players by team:', error)
      throw error
    }
  },

  // Obtener player con su team
  async getPlayerWithTeam(cedula) {
    try {
      console.log('🚀 Obteniendo player con team:', cedula)
      const response = await axios.get(`${PLAYERS_API_URL}/${cedula}/team`)
      console.log('📥 Player with team response:', response.data)
      
      const playerData = processPlayerData(response.data)
      
      // Procesar también la photo del team si existe
      if (playerData.team && playerData.team.photo) {
        console.log('📸 Team del player tiene photo, deserializando...')
        playerData.team.photo = deserializePhoto(playerData.team.photo)
      }
      
      console.log('✅ Player with team procesado:', playerData)
      return playerData
    } catch (error) {
      console.error('Error fetching player with team:', error)
      throw error
    }
  }
} 