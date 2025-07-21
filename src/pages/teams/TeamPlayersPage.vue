<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <div class="row items-center q-mb-md">
          <q-btn 
            flat 
            icon="arrow_back" 
            label="Volver a Equipos" 
            @click="$router.push('/teams')"
            class="q-mr-md"
          />
          <div class="text-h4 text-weight-bold text-primary">
            <q-icon name="boy" class="q-mr-sm" />
            Jugadores de {{ team?.name || 'Equipo' }}
          </div>
        </div>
        <q-separator class="q-mb-lg" />
      </div>

      <!-- Team Info Card -->
      <div class="col-12" v-if="team">
        <q-card class="team-info-card q-mb-lg">
          <q-card-section class="row items-center">
            <div class="col-auto">
              <q-avatar size="80px" class="team-photo">
                <q-img 
                  v-if="team.photo" 
                  :src="team.photo" 
                  spinner-color="primary"
                  spinner-size="24px"
                />
                <q-icon v-else name="sports_soccer" size="40px" color="grey-5" />
              </q-avatar>
            </div>
            <div class="col q-ml-md">
              <div class="text-h5 text-weight-bold">{{ team.name }}</div>
              <div class="text-subtitle1 text-grey">{{ team.category }}</div>
              <div class="text-caption text-grey">
                Fundado: {{ formatDate(team.birth_date) }}
              </div>
            </div>
            <div class="col-auto">
              <q-btn 
                color="primary" 
                icon="add" 
                label="Agregar Jugador" 
                @click="openPlayerDialog()"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Players Grid -->
      <div class="col-12">
        <div class="row q-col-gutter-md">
          <!-- Player Cards -->
          <div 
            v-for="player in players" 
            :key="player.id" 
            class="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <q-card class="player-card">
              <q-card-section class="text-center">
                <div class="player-photo-container q-mb-md">
                  <q-avatar size="100px" class="player-photo">
                    <q-img 
                      v-if="player.photo" 
                      :src="player.photo" 
                      spinner-color="primary"
                      spinner-size="24px"
                      @load="() => console.log('✅ Player photo cargada:', player.photo)"
                      @error="() => console.log('❌ Error cargando player photo:', player.photo)"
                    />
                    <q-icon v-else name="person" size="50px" color="grey-5" />
                  </q-avatar>
                  <div class="player-number">{{ player.number }}</div>
                </div>
                <div class="text-h6 text-weight-bold">{{ player.name }} {{ player.last_name }}</div>
                <div class="text-caption text-grey">Cédula: {{ player.id }}</div>
                <div class="text-caption text-grey">
                  Nacimiento: {{ formatDate(player.birth_date) }}
                </div>
              </q-card-section>

              <q-card-actions align="center">
                <q-btn 
                  flat 
                  color="orange" 
                  icon="edit" 
                  @click="editPlayer(player)"
                />
                <q-btn 
                  flat 
                  color="negative" 
                  icon="delete" 
                  @click="confirmDeletePlayer(player)"
                />
              </q-card-actions>
            </q-card>
          </div>

          <!-- Empty State -->
          <div v-if="players.length === 0" class="col-12">
            <q-card class="empty-state-card">
              <q-card-section class="text-center">
                <q-icon name="people" size="4rem" color="grey-5" />
                <div class="text-h6 text-grey q-mt-md">No hay jugadores registrados</div>
                <div class="text-caption text-grey q-mb-md">
                  Agrega el primer jugador al equipo
                </div>
                <q-btn 
                  color="primary" 
                  icon="add" 
                  label="Agregar Jugador" 
                  @click="openPlayerDialog()"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Player Dialog -->
    <q-dialog v-model="playerDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ isEditing ? 'Editar Jugador' : 'Nuevo Jugador' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="savePlayer" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="playerForm.id"
                  label="Cédula de Identidad"
                  :rules="[
                    val => !!val || 'La cédula es requerida',
                    val => /^\d{10,13}$/.test(val) || 'La cédula debe tener entre 10 y 13 dígitos'
                  ]"
                  outlined
                  :readonly="isEditing"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="playerForm.number"
                  label="Número de Camiseta"
                  type="number"
                  :rules="[
                    val => !!val || 'El número es requerido',
                    val => val > 0 || 'El número debe ser mayor a 0'
                  ]"
                  outlined
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="playerForm.name"
                  label="Nombre"
                  :rules="[val => !!val || 'El nombre es requerido']"
                  outlined
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="playerForm.last_name"
                  label="Apellido"
                  :rules="[val => !!val || 'El apellido es requerido']"
                  outlined
                />
              </div>
            </div>

            <q-input
              v-model="playerForm.birth_date"
              label="Fecha de Nacimiento"
              type="date"
              :rules="[
                val => !!val || 'La fecha es requerida',
                val => validateAge(val) || 'El jugador debe tener al menos 5 años'
              ]"
              outlined
            />

            <div class="text-subtitle2 q-mb-sm">Foto del Jugador</div>
            <div class="row items-center q-gutter-md">
              <q-avatar size="100px" class="player-photo-preview">
                <q-img 
                  v-if="playerForm.photo" 
                  :src="playerForm.photo" 
                  spinner-color="primary"
                />
                <q-icon v-else name="person" size="50px" color="grey-5" />
              </q-avatar>
              <div class="col">
                <q-file
                  v-model="photoFile"
                  label="Seleccionar Foto"
                  accept=".jpg,.jpeg,.png"
                  @update:model-value="handlePhotoChange"
                  outlined
                >
                  <template v-slot:prepend>
                    <q-icon name="photo_camera" />
                  </template>
                </q-file>
                <div class="text-caption text-grey q-mt-xs">
                  Máximo 500KB, formato JPG o PNG (tamaño carnet recomendado)
                </div>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn 
            unelevated 
            :label="isEditing ? 'Actualizar' : 'Crear'" 
            color="primary" 
            @click="savePlayer"
            :loading="loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation -->
    <q-dialog v-model="deleteDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">¿Estás seguro de que quieres eliminar este jugador?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Eliminar" color="negative" @click="deletePlayer" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { TeamService } from 'src/services/TeamService'
import { PlayerService } from 'src/services/PlayerService'
import { useQuasar } from 'quasar'

export default {
  name: 'TeamPlayersPage',
  setup() {
    const $q = useQuasar()
    const route = useRoute()
    
    const team = ref(null)
    const players = ref([])
    const playerDialog = ref(false)
    const deleteDialog = ref(false)
    const loading = ref(false)
    const isEditing = ref(false)
    const selectedPlayer = ref(null)
    const photoFile = ref(null)

    const playerForm = ref({
      id: '',
      name: '',
      last_name: '',
      birth_date: '',
      team_id: null,
      number: '',
      photo: ''
    })

    const teamId = computed(() => route.params.teamId)

    const loadTeam = async () => {
      try {
        loading.value = true
        team.value = await TeamService.getTeamById(teamId.value)
        playerForm.value.team_id = parseInt(teamId.value)
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: 'Error al cargar el equipo'+error,
          icon: 'error'
        })
      } finally {
        loading.value = false
      }
    }

    const loadPlayers = async () => {
      try {
        loading.value = true
        console.log('🔄 Cargando players...')
        players.value = await PlayerService.getPlayersByTeam(teamId.value)
        console.log('📊 Players cargados:', players.value)
        console.log('📸 Primer player photo:', players.value[0]?.photo)
      } catch (error) {
        console.error('❌ Error cargando players:', error)
        $q.notify({
          color: 'negative',
          message: 'Error al cargar los jugadores'+error,
          icon: 'error'
        })
      } finally {
        loading.value = false
      }
    }

    const openPlayerDialog = () => {
      isEditing.value = false
      playerForm.value = {
        id: '',
        name: '',
        last_name: '',
        birth_date: '',
        team_id: parseInt(teamId.value),
        number: '',
        photo: ''
      }
      photoFile.value = null
      playerDialog.value = true
    }

    const editPlayer = (player) => {
      isEditing.value = true
      selectedPlayer.value = player
      playerForm.value = {
        id: player.id,
        name: player.name,
        last_name: player.last_name,
        birth_date: player.birth_date ? player.birth_date.split('T')[0] : '',
        team_id: player.team_id,
        number: player.number,
        photo: player.photo || ''
      }
      photoFile.value = null
      playerDialog.value = true
    }

    const handlePhotoChange = (file) => {
      if (!file) return

      // Validar tamaño (500KB = 512000 bytes)
      if (file.size > 512000) {
        $q.notify({
          color: 'negative',
          message: 'La foto debe ser menor a 500KB',
          icon: 'error'
        })
        photoFile.value = null
        return
      }

      // Validar formato
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        $q.notify({
          color: 'negative',
          message: 'Solo se permiten formatos JPG y PNG',
          icon: 'error'
        })
        photoFile.value = null
        return
      }

      // Convertir a base64
      const reader = new FileReader()
      reader.onload = (e) => {
        playerForm.value.photo = e.target.result
      }
      reader.readAsDataURL(file)
    }

    const validateAge = (birthDate) => {
      if (!birthDate) return false
      const birth = new Date(birthDate)
      const today = new Date()
      const age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        return age - 1 >= 5
      }
      return age >= 5
    }

    const savePlayer = async () => {
      try {
        loading.value = true
        
        if (isEditing.value) {
          await PlayerService.updatePlayer(selectedPlayer.value.id, playerForm.value)
          $q.notify({
            color: 'positive',
            message: 'Jugador actualizado exitosamente',
            icon: 'check'
          })
        } else {
          await PlayerService.createPlayer(playerForm.value)
          $q.notify({
            color: 'positive',
            message: 'Jugador creado exitosamente',
            icon: 'check'
          })
        }
        
        playerDialog.value = false
        await loadPlayers()
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: error.response?.data?.error || 'Error al guardar el jugador',
          icon: 'error'
        })
      } finally {
        loading.value = false
      }
    }

    const confirmDeletePlayer = (player) => {
      selectedPlayer.value = player
      deleteDialog.value = true
    }

    const deletePlayer = async () => {
      try {
        loading.value = true
        await PlayerService.deletePlayer(selectedPlayer.value.id)
        $q.notify({
          color: 'positive',
          message: 'Jugador eliminado exitosamente',
          icon: 'check'
        })
        deleteDialog.value = false
        await loadPlayers()
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: error.response?.data?.error || 'Error al eliminar el jugador',
          icon: 'error'
        })
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('es-ES')
    }

    onMounted(async () => {
      await loadTeam()
      await loadPlayers()
    })

    return {
      team,
      players,
      playerDialog,
      deleteDialog,
      loading,
      isEditing,
      playerForm,
      photoFile,
      openPlayerDialog,
      editPlayer,
      handlePhotoChange,
      validateAge,
      savePlayer,
      confirmDeletePlayer,
      deletePlayer,
      formatDate
    }
  }
}
</script>

<style scoped>
.team-info-card {
  background: linear-gradient(135deg, #f5f5f5 0%, #e3f2fd 100%);
  border-left: 4px solid #1976d2;
}

.player-card {
  transition: all 0.3s ease;
  height: 320px;
}

.player-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.player-photo-container {
  position: relative;
  display: flex;
  justify-content: center;
}

.player-photo {
  border: 3px solid #e0e0e0;
  transition: all 0.3s ease;
}

.player-photo:hover {
  border-color: #1976d2;
  transform: scale(1.05);
}

.player-number {
  position: absolute;
  top: -10px;
  right: 50%;
  transform: translateX(50%);
  background: #1976d2;
  color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
}

.player-photo-preview {
  border: 2px solid #e0e0e0;
}

.empty-state-card {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8f5e8 100%);
  border: 2px dashed #4caf50;
}
</style> 