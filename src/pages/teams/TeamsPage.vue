<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <div class="text-h4 text-weight-bold text-primary q-mb-md">
          <q-icon name="sports_soccer" class="q-mr-sm" />
          Administración de Equipos
        </div>
        <q-separator class="q-mb-lg" />
      </div>

      <!-- Teams Grid -->
      <div class="col-12">
        <div class="row q-col-gutter-md">
          <!-- Add Team Card -->
          <div class="col-12 col-sm-6 col-md-4 col-lg-3">
            <q-card 
              class="add-team-card cursor-pointer" 
              @click="openTeamDialog()"
              style="height: 200px;"
            >
              <q-card-section class="flex flex-center column full-height">
                <q-icon name="add_circle" size="4rem" color="primary" />
                <div class="text-h6 text-primary q-mt-md">Agregar Equipo</div>
                <div class="text-caption text-grey">Crear nuevo equipo</div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Team Cards -->
          <div 
            v-for="team in teams" 
            :key="team.id" 
            class="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <q-card class="team-card">
              <q-card-section class="text-center">
                <div class="team-photo-container q-mb-md">
                  <q-avatar size="80px" class="team-photo">
                    <q-img 
                      v-if="team.photo" 
                      :src="team.photo" 
                      spinner-color="primary"
                      spinner-size="24px"
                      @load="() => console.log('✅ Team photo cargada:', team.photo)"
                      @error="() => console.log('❌ Error cargando team photo:', team.photo)"
                    />
                    <q-icon v-else name="sports_soccer" size="40px" color="grey-5" />
                  </q-avatar>
                </div>
                <div class="text-h6 text-weight-bold">{{ team.name }}</div>
                <div class="text-caption text-grey">{{ team.category }}</div>
                <div class="text-caption text-grey">
                  Fundado: {{ formatDate(team.birth_date) }}
                </div>
              </q-card-section>

              <q-card-actions align="center">
                <q-btn 
                  flat 
                  color="primary" 
                  icon="visibility" 
                  label="Ver Jugadores"
                  @click="viewTeamPlayers(team)"
                />
                <q-btn 
                  flat 
                  color="orange" 
                  icon="edit" 
                  @click="editTeam(team)"
                />
                <q-btn 
                  flat 
                  color="negative" 
                  icon="delete" 
                  @click="confirmDeleteTeam(team)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Team Dialog -->
    <q-dialog v-model="teamDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ isEditing ? 'Editar Equipo' : 'Nuevo Equipo' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveTeam" class="q-gutter-md">
            <q-input
              v-model="teamForm.name"
              label="Nombre del Equipo"
              :rules="[val => !!val || 'El nombre es requerido']"
              outlined
            />

            <q-input
              v-model="teamForm.birth_date"
              label="Fecha de Fundación"
              type="date"
              :rules="[val => !!val || 'La fecha es requerida']"
              outlined
            />

            <q-select
              v-model="teamForm.category"
              :options="teamCategories"
              label="Categoría"
              :rules="[val => !!val || 'La categoría es requerida']"
              outlined
            />

            <div class="text-subtitle2 q-mb-sm">Foto del Equipo</div>
            <div class="row items-center q-gutter-md">
              <q-avatar size="80px" class="team-photo-preview">
                <q-img 
                  v-if="teamForm.photo" 
                  :src="teamForm.photo" 
                  spinner-color="primary"
                />
                <q-icon v-else name="sports_soccer" size="40px" color="grey-5" />
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
                  Máximo 500KB, formato JPG o PNG
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
            @click="saveTeam"
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
          <span class="q-ml-sm">¿Estás seguro de que quieres eliminar este equipo?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Eliminar" color="negative" @click="deleteTeam" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { TeamService } from 'src/services/TeamService'
import { useQuasar } from 'quasar'

export default {
  name: 'TeamsPage',
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    
    const teams = ref([])
    const teamDialog = ref(false)
    const deleteDialog = ref(false)
    const loading = ref(false)
    const isEditing = ref(false)
    const selectedTeam = ref(null)
    const photoFile = ref(null)

    const teamForm = ref({
      name: '',
      birth_date: '',
      category: '',
      photo: ''
    })

    const teamCategories = [
      'Professional',
      'Amateur',
      'Youth',
      'Senior',
      'Women'
    ]

    const loadTeams = async () => {
      try {
        loading.value = true
        console.log('🔄 Cargando teams...')
        teams.value = await TeamService.getAllTeams()
        console.log('📊 Teams cargados:', teams.value)
        console.log('📸 Primer team photo:', teams.value[0]?.photo)
      } catch (error) {
        console.error('❌ Error cargando teams:', error)
        $q.notify({
          color: 'negative',
          message: 'Error al cargar los equipos'+error,
          icon: 'error'
        })
      } finally {
        loading.value = false
      }
    }

    const openTeamDialog = () => {
      isEditing.value = false
      teamForm.value = {
        name: '',
        birth_date: '',
        category: '',
        photo: ''
      }
      photoFile.value = null
      teamDialog.value = true
    }

    const editTeam = (team) => {
      isEditing.value = true
      selectedTeam.value = team
      teamForm.value = {
        name: team.name,
        birth_date: team.birth_date ? team.birth_date.split('T')[0] : '',
        category: team.category,
        photo: team.photo || ''
      }
      photoFile.value = null
      teamDialog.value = true
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
        teamForm.value.photo = e.target.result
      }
      reader.readAsDataURL(file)
    }

    const saveTeam = async () => {
      try {
        loading.value = true
        
        if (isEditing.value) {
          await TeamService.updateTeam(selectedTeam.value.id, teamForm.value)
          $q.notify({
            color: 'positive',
            message: 'Equipo actualizado exitosamente',
            icon: 'check'
          })
        } else {
          await TeamService.createTeam(teamForm.value)
          $q.notify({
            color: 'positive',
            message: 'Equipo creado exitosamente',
            icon: 'check'
          })
        }
        
        teamDialog.value = false
        await loadTeams()
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: error.response?.data?.error || 'Error al guardar el equipo',
          icon: 'error'
        })
      } finally {
        loading.value = false
      }
    }

    const confirmDeleteTeam = (team) => {
      selectedTeam.value = team
      deleteDialog.value = true
    }

    const deleteTeam = async () => {
      try {
        loading.value = true
        await TeamService.deleteTeam(selectedTeam.value.id)
        $q.notify({
          color: 'positive',
          message: 'Equipo eliminado exitosamente',
          icon: 'check'
        })
        deleteDialog.value = false
        await loadTeams()
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: error.response?.data?.error || 'Error al eliminar el equipo',
          icon: 'error'
        })
      } finally {
        loading.value = false
      }
    }

    const viewTeamPlayers = (team) => {
      router.push(`/teams/${team.id}/players`)
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('es-ES')
    }

    onMounted(() => {
      loadTeams()
    })

    return {
      teams,
      teamDialog,
      deleteDialog,
      loading,
      isEditing,
      teamForm,
      photoFile,
      teamCategories,
      openTeamDialog,
      editTeam,
      handlePhotoChange,
      saveTeam,
      confirmDeleteTeam,
      deleteTeam,
      viewTeamPlayers,
      formatDate
    }
  }
}
</script>

<style scoped>
.add-team-card {
  border: 2px dashed #1976d2;
  background: linear-gradient(135deg, #f5f5f5 0%, #e3f2fd 100%);
  transition: all 0.3s ease;
}

.add-team-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.team-card {
  transition: all 0.3s ease;
  height: 280px;
}

.team-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.team-photo-container {
  display: flex;
  justify-content: center;
}

.team-photo {
  border: 3px solid #e0e0e0;
  transition: all 0.3s ease;
}

.team-photo:hover {
  border-color: #1976d2;
  transform: scale(1.05);
}

.team-photo-preview {
  border: 2px solid #e0e0e0;
}
</style> 