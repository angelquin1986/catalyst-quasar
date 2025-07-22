<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <div class="row items-center q-mb-md">
          <q-btn 
            flat 
            icon="arrow_back" 
            :label="$t('app.back') + ' ' + $t('teams.title')" 
            @click="$router.push('/teams')"
            class="q-mr-md"
          />
          <div class="text-h4 text-weight-bold text-primary">
            <q-icon name="boy" class="q-mr-sm" />
            {{$t('teams.players', { team: team?.name || $t('teams.title') })}}
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
                {{$t('teams.founded')}}: {{ formatDate(team.birth_date) }}
              </div>
            </div>
            <div class="col-auto">
              <q-btn 
                color="primary" 
                icon="add" 
                :label="$t('teams.add_player')" 
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
                <div class="text-caption text-grey">{{$t('players.id')}}: {{ player.id }}</div>
                <div class="text-caption text-grey">
                  {{$t('players.birth_date')}}: {{ formatDate(player.birth_date) }}
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
                <div class="text-h6 text-grey q-mt-md">{{$t('teams.no_players')}}</div>
                <div class="text-caption text-grey q-mb-md">
                  {{$t('teams.first_player')}}
                </div>
                <q-btn 
                  color="primary" 
                  icon="add" 
                  :label="$t('teams.add_player')" 
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
          <div class="text-h6">{{ isEditing ? $t('players.edit') : $t('players.new') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="savePlayer" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="playerForm.id"
                  :label="$t('players.id')"
                  :rules="[
                    val => !!val || $t('validation.required'),
                    val => /^\d{10,13}$/.test(val) || $t('validation.id_length')
                  ]"
                  outlined
                  :readonly="isEditing"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="playerForm.number"
                  :label="$t('players.number')"
                  type="number"
                  :rules="[
                    val => !!val || $t('validation.required'),
                    val => val > 0 || $t('validation.number_positive')
                  ]"
                  outlined
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="playerForm.name"
                  :label="$t('players.name')"
                  :rules="[val => !!val || $t('validation.required')]"
                  outlined
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="playerForm.last_name"
                  :label="$t('players.last_name')"
                  :rules="[val => !!val || $t('validation.required')]"
                  outlined
                />
              </div>
            </div>

            <q-input
              v-model="playerForm.birth_date"
              :label="$t('players.birth_date')"
              type="date"
              :rules="[
                val => !!val || $t('validation.required'),
                val => validateAge(val) || $t('validation.min_age')
              ]"
              outlined
            />

            <div class="text-subtitle2 q-mb-sm">{{$t('players.photo')}}</div>
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
                  :label="$t('players.photo')"
                  accept=".jpg,.jpeg,.png"
                  @update:model-value="handlePhotoChange"
                  outlined
                >
                  <template v-slot:prepend>
                    <q-icon name="photo_camera" />
                  </template>
                </q-file>
                <div class="text-caption text-grey q-mt-xs">
                  {{$t('validation.photo_size')}}, {{$t('validation.photo_format')}} (tamaño carnet recomendado)
                </div>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('app.cancel')" color="primary" v-close-popup />
          <q-btn 
            unelevated 
            :label="isEditing ? $t('app.update') : $t('app.create')" 
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
          <span class="q-ml-sm">{{$t('app.confirm')}} {{$t('app.delete')}}?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('app.cancel')" color="primary" v-close-popup />
          <q-btn flat :label="$t('app.delete')" color="negative" @click="deletePlayer" />
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
import { useI18n } from 'vue-i18n'

export default {
  name: 'TeamPlayersPage',
  setup() {
    const $q = useQuasar()
    const route = useRoute()
    const { t } = useI18n()
    
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
          message: t('notifications.error_loading_team')+error,
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
          message: t('notifications.error_loading_players')+error,
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
          message: t('validation.photo_size_error'),
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
          message: t('validation.photo_format_error'),
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
            message: t('notifications.player_updated'),
            icon: 'check'
          })
        } else {
          await PlayerService.createPlayer(playerForm.value)
          $q.notify({
            color: 'positive',
            message: t('notifications.player_created'),
            icon: 'check'
          })
        }
        
        playerDialog.value = false
        await loadPlayers()
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: error.response?.data?.error || t('notifications.error_saving_player'),
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
          message: t('notifications.player_deleted'),
          
          icon: 'check'
        })
        deleteDialog.value = false
        await loadPlayers()
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: error.response?.data?.error || t('notifications.error_deleting_player'),
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