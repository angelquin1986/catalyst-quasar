<template>
  <q-page class="q-pa-md">
    <div class="q-pa-md">
      <div class="row q-gutter-md items-center q-mb-md">
        <q-select
          v-model="selectedTeam"
          :options="teamOptions"
          :label="$t('calendar.filter_by_team')"
          option-value="id"
          option-label="name"
          emit-value
          map-options
          clearable
          filled
          dense
          use-input
          @filter="filterTeams"
          style="min-width: 200px;"
        />
      </div>
      <q-table
        flat
        bordered
        separator="cell"
        :title="$t('calendar.title')"
        :rows="groupedRows"
        :columns="columns"
        row-key="id"
        :loading="loading"
        hide-bottom
        :pagination="pagination"
        :grid="$q.screen.lt.md"
      >
        <!-- Vista de grid para móviles -->
        <template v-slot:item="props">
          <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
            <q-card bordered flat>
              <q-card-section class="text-center">
                <div class="text-grey-8">{{ formatDateTime(props.row.date, props.row.hour) }} - {{ props.row.season.name }}</div>
                <div class="text-grey-8">{{$t('calendar.round')}}: {{ props.row.round }} | {{$t('calendar.status')}}: <span class="text-bold">{{ props.row.status }}</span></div>
                <div class="text-h6 q-mt-sm">{{ props.row.home_team.name }} vs {{ props.row.away_team.name }}</div>
                <div class="text-h5 q-my-sm">
                  <span :class="{'text-bold': true, 'winner-highlight': props.row.home_team_score > props.row.away_team_score, 'draw-highlight': props.row.home_team_score === props.row.away_team_score}">{{ props.row.home_team_score }}</span>
                  -
                  <span :class="{'text-bold': true, 'winner-highlight': props.row.away_team_score > props.row.home_team_score, 'draw-highlight': props.row.home_team_score === props.row.away_team_score}">{{ props.row.away_team_score }}</span>
                </div>
                <div class="text-subtitle2 q-mt-sm">
                  <q-icon name="location_on" class="q-mr-xs" />
                  {{ props.row.stadium.name }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </template>
        <!-- Vista de tabla para desktop -->
        <template v-slot:body="props">
          <q-tr v-if="props.row.isGroupHeader">
            <q-td :colspan="columns.length" class="text-left bg-grey-2 text-bold q-py-sm">
              <q-icon name="location_on" class="q-mr-sm" />{{ props.row.stadium }}
            </q-td>
          </q-tr>
          <q-tr v-else :props="props">
            <q-td key="home_team" :props="props">
              {{ props.row.home_team.name }}
            </q-td>
            <q-td key="away_team" :props="props">
              {{ props.row.away_team.name }}
            </q-td>
            <q-td key="score" :props="props" align="center">
              {{ `${props.row.home_team_score} - ${props.row.away_team_score}` }}
            </q-td>
            <q-td key="home_team_points" :props="props" align="center">
              {{ props.row.home_team_points }}
            </q-td>
            <q-td key="away_team_points" :props="props" align="center">
              {{ props.row.away_team_points }}
            </q-td>
            <q-td key="season" :props="props">
              {{ props.row.season.name }}
            </q-td>
            <q-td key="round" :props="props" align="center">
              {{ props.row.round }}
            </q-td>
            <q-td key="date_time" :props="props" align="center">
              {{ formatDateTime(props.row.date, props.row.hour) }}
            </q-td>
            <q-td key="status" :props="props" align="center">
              <q-badge :color="statusColor(props.row.status)" outline>
                {{ props.row.status }}
              </q-badge>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { CalendarService } from 'src/services/CalendarService'
import { MatchService } from 'src/services/MatchService'
import { useQuasar } from 'quasar'
import { format } from 'date-fns'
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const matches = ref([])
const loading = ref(false)
const teams = ref([])
const selectedTeam = ref(null)
const filteredTeams = ref([])

const { t } = useI18n()
const columns = computed(() => [
  { name: 'home_team', label: t('calendar.home_team'), align: 'left', field: row => row.home_team.name, sortable: true, headerStyle: 'width: 120px;' },
  { name: 'away_team', label: t('calendar.away_team'), align: 'left', field: row => row.away_team.name, sortable: true, headerStyle: 'width: 120px;' },
  { name: 'score', label: t('calendar.score'), align: 'center', field: row => `${row.home_team_score} - ${row.away_team_score}`, headerStyle: 'width: 70px;' },
  { name: 'home_team_points', label: t('calendar.home_points'), align: 'center', field: row => row.home_team_points, sortable: true, headerStyle: 'width: 70px;' },
  { name: 'away_team_points', label: t('calendar.away_points'), align: 'center', field: row => row.away_team_points, sortable: true, headerStyle: 'width: 70px;' },
  { name: 'season', label: t('calendar.season'), field: row => row.season.name, sortable: true, headerStyle: 'width: 110px;' },
  { name: 'round', label: t('calendar.round'), field: row => row.round, align: 'center', sortable: true, headerStyle: 'width: 60px;' },
  { name: 'date_time', label: t('calendar.date_time'), field: row => formatDateTime(row.date, row.hour), align: 'center', sortable: true, headerStyle: 'width: 120px;' },
  { name: 'status', label: t('calendar.status'), field: row => row.status, align: 'center', sortable: true, headerStyle: 'width: 90px;' }
])

const pagination = ref({
  rowsPerPage: 0 // 0 means show all rows
})

const teamOptions = computed(() => filteredTeams.value.map(team => ({ label: team.name, value: team.id, id: team.id, name: team.name })))

function filterTeams(val, update) {
  if (!val) {
    update(() => {
      filteredTeams.value = teams.value
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    filteredTeams.value = teams.value.filter(
      team => team.name.toLowerCase().indexOf(needle) > -1
    )
  })
}

// Computed para agrupar por stadium (solo para desktop)
const groupedRows = computed(() => {
  let filtered = matches.value
  if (selectedTeam.value) {
    filtered = filtered.filter(match => match.home_team.id === selectedTeam.value || match.away_team.id === selectedTeam.value)
  }

  if (!filtered || filtered.length === 0) return []

  // En móviles, no agrupar, solo mostrar los partidos
  if ($q.screen.lt.md) {
    return filtered
  }

  const rows = []
  let lastStadium = null

  filtered.forEach(match => {
    // Agrupar por stadium
    if (match.stadium.name !== lastStadium) {
      rows.push({
        isGroupHeader: true,
        stadium: match.stadium.name,
        id: `header_stadium_${match.stadium.id}`
      })
      lastStadium = match.stadium.name
    }
    rows.push(match)
  })

  return rows
})

function formatDateTime(date, hour) {
  if (!date) return ''
  const d = new Date(date)
  return format(d, 'dd/MM/yyyy') + (hour ? ` ${hour}:00` : '')
}

function statusColor(status) {
  switch (status) {
    case 'scheduled': return 'primary'
    case 'in_progress': return 'orange'
    case 'finished': return 'green'
    case 'postponed': return 'grey'
    case 'cancelled': return 'red'
    default: return 'blue'
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const [scheduledMatches, teamsRes] = await Promise.all([
      CalendarService.getScheduledMatches(),
      MatchService.getTeams()
    ])
    matches.value = scheduledMatches
    teams.value = teamsRes.data
    filteredTeams.value = teamsRes.data
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Failed to load calendar matches: ' + e.message })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.winner-highlight {
  background-color: #e8f5e9; /* Light Green */
  border-radius: 4px;
}
.draw-highlight {
  background-color: #fff3e0; /* Light Orange */
  border-radius: 4px;
}

/* Estilos para modo dark */
.body--dark .winner-highlight {
  background-color: #388e3c; /* Darker Green */
  color: #fff;
}
.body--dark .draw-highlight {
  background-color: #8d6e63; /* Brownish for draw */
  color: #fff;
}

/* Headers de grupo adaptables al tema */
.q-table tbody tr td.bg-grey-2 {
  font-weight: bold;
  padding: 8px 16px;
}
.body--dark .q-table tbody tr td.bg-grey-2 {
  background-color: #424242 !important;
  color: #fff !important;
  border-bottom: 1px solid #616161;
}

/* Mejorar contraste en modo dark para los badges de status */
.body--dark .q-badge {
  color: #fff !important;
}

/* Estilos para el filtro en modo dark */
.body--dark .q-select {
  background-color: #424242;
}
.body--dark .q-select .q-field__control {
  background-color: #424242;
  color: #fff;
}

/* Asegurar que los iconos sean visibles en modo dark */
.body--dark .q-icon {
  color: #fff;
}

/* Estilos responsivos */
@media (max-width: 768px) {
  .q-table__title {
    font-size: 1.2rem;
  }
  .q-card {
    margin-bottom: 8px;
  }
  .text-h6 {
    font-size: 1rem;
  }
  .text-h5 {
    font-size: 1.2rem;
  }
}
</style> 