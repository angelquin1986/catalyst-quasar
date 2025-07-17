<template>
  <q-page class="q-pa-md">
    <div class="q-pa-md">
      <q-table
        flat
        bordered
        separator="cell"
        title="Leaderboard"
        :rows="leaderboard"
        :columns="columns"
        row-key="teamId"
        :loading="loading"
        hide-bottom
        :pagination="pagination"
        :grid="$q.screen.lt.md"
        
      >
        <template v-slot:top-left>
          <div class="row q-gutter-md items-center">
             <div class="text-h6">Leaderboard</div>
            <q-select
              v-model="selectedSeason"
              :options="seasons"
              label="Select Season"
              option-value="id"
              option-label="name"
              emit-value
              map-options
              filled
              dense
              style="min-width: 250px;"
              @update:model-value="fetchLeaderboard"
            />
          </div>
          <div class="q-mt-sm q-mb-md">
            <q-banner dense class="bg-grey-2 text-grey-8">
              <span class="text-bold">Leyenda:</span>
              <span class="q-ml-md"><b>PJ</b>: Partidos Jugados</span>
              <span class="q-ml-md"><b>G</b>: Ganados</span>
              <span class="q-ml-md"><b>E</b>: Empatados</span>
              <span class="q-ml-md"><b>P</b>: Perdidos</span>
              <span class="q-ml-md"><b>GF</b>: Goles a Favor</span>
              <span class="q-ml-md"><b>GC</b>: Goles en Contra</span>
              <span class="q-ml-md"><b>DG</b>: Diferencia de Goles</span>
              <span class="q-ml-md"><b>Pts</b>: Puntos</span>
            </q-banner>
          </div>
        </template>
        <template v-slot:item="props">
          <div class="q-pa-xs col-12">
            <q-card bordered flat :class="positionClass(props.rowIndex)">
              <q-card-section class="row items-center no-wrap">
                <div class="col-auto text-h6 text-grey-8 q-mr-md">#{{ props.rowIndex + 1 }}</div>
                <div class="col" style="min-width: 0;">
                  <div class="text-h6 ellipsis">{{ props.row.teamName }}</div>
                </div>
                <div class="col-auto">
                  <q-chip square color="primary" text-color="white" :label="`${props.row.points} Pts`" />
                </div>
              </q-card-section>
              <q-card-section class="row text-center q-gutter-sm justify-around">
                <div>
                  <div class="text-subtitle2">{{ props.row.played }}</div>
                  <div class="text-caption text-grey">PJ</div>
                </div>
                <div>
                  <div class="text-subtitle2">{{ props.row.won }}</div>
                  <div class="text-caption text-grey">G</div>
                </div>
                <div>
                  <div class="text-subtitle2">{{ props.row.drawn }}</div>
                  <div class="text-caption text-grey">E</div>
                </div>
                <div>
                  <div class="text-subtitle2">{{ props.row.lost }}</div>
                  <div class="text-caption text-grey">P</div>
                </div>
                 <div>
                  <div class="text-subtitle2">{{ props.row.goalsFor }}</div>
                  <div class="text-caption text-grey">GF</div>
                </div>
                 <div>
                  <div class="text-subtitle2">{{ props.row.goalsAgainst }}</div>
                  <div class="text-caption text-grey">GC</div>
                </div>
                <div>
                  <div class="text-subtitle2">{{ props.row.goalDifference }}</div>
                  <div class="text-caption text-grey">DG</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </template>
        <template v-slot:body="props">
          <q-tr :class="positionClass(props.rowIndex)">
            <q-td key="position" :props="props">
              {{ props.rowIndex + 1 }}
            </q-td>
            <q-td key="teamName" :props="props">
              {{ props.row.teamName }}
            </q-td>
            <q-td key="played" :props="props" align="center">
              {{ props.row.played }}
            </q-td>
            <q-td key="won" :props="props" align="center">
              {{ props.row.won }}
            </q-td>
            <q-td key="drawn" :props="props" align="center">
              {{ props.row.drawn }}
            </q-td>
            <q-td key="lost" :props="props" align="center">
              {{ props.row.lost }}
            </q-td>
            <q-td key="goalsFor" :props="props" align="center">
              {{ props.row.goalsFor }}
            </q-td>
            <q-td key="goalsAgainst" :props="props" align="center">
              {{ props.row.goalsAgainst }}
            </q-td>
            <q-td key="goalDifference" :props="props" align="center">
              {{ props.row.goalDifference }}
            </q-td>
            <q-td key="points" :props="props" align="center">
              {{ props.row.points }}
            </q-td>
          </q-tr>
        </template>
        <template v-slot:body-cell-position="props">
          <q-td :props="props" :class="positionClass(props.rowIndex)">
            {{ props.rowIndex + 1 }}
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { LeaderboardService } from 'src/services/LeaderboardService'
import { MatchService } from 'src/services/MatchService' // Re-using to get seasons
import { useQuasar } from 'quasar'

const $q = useQuasar()

const leaderboard = ref([])
const seasons = ref([])
const selectedSeason = ref(null)
const loading = ref(false)

const pagination = ref({
  rowsPerPage: 0 // 0 means show all rows
})

const columns = [
  { name: 'position', label: '#', align: 'left' },
  { name: 'teamName', label: 'Team', align: 'left', field: 'teamName', sortable: true },
  { name: 'played', label: 'PJ', align: 'center', field: 'played' },
  { name: 'won', label: 'G', align: 'center', field: 'won' },
  { name: 'drawn', label: 'E', align: 'center', field: 'drawn' },
  { name: 'lost', label: 'P', align: 'center', field: 'lost' },
  { name: 'goalsFor', label: 'GF', align: 'center', field: 'goalsFor' },
  { name: 'goalsAgainst', label: 'GC', align: 'center', field: 'goalsAgainst' },
  { name: 'goalDifference', label: 'DG', align: 'center', field: 'goalDifference' },
  { name: 'points', label: 'Pts', align: 'center', field: 'points', sortable: true }
]

const fetchSeasons = async () => {
  try {
    const response = await MatchService.getSeasons()
    seasons.value = response.data
    // Optionally, auto-select the first season
    if (seasons.value.length > 0) {
      selectedSeason.value = seasons.value[0].id
      fetchLeaderboard(selectedSeason.value)
    }
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Failed to load seasons'+error,
      icon: 'report_problem'
    })
  }
}

const fetchLeaderboard = async (seasonId) => {
  if (!seasonId) {
    leaderboard.value = []
    return
  }
  loading.value = true
  try {
    const response = await LeaderboardService.getLeaderboardBySeason(seasonId)
    leaderboard.value = response.data
  } catch (error) {
    leaderboard.value = []
    const errorMessage = error.response?.data?.error || `Failed to load leaderboard for season ${seasonId}`
    $q.notify({
      color: 'negative',
      message: errorMessage,
      icon: 'report_problem'
    })
  } finally {
    loading.value = false
  }
}

// Devuelve la clase de color según la posición
function positionClass(index) {
  // index es base 0
  if (index <= 3) return 'posicion-verde';
  if (leaderboard.value.length > 1 && (index >= leaderboard.value.length - 2)) return 'posicion-roja';
  return '';
}

onMounted(() => {
  fetchSeasons()
})
</script> 

<style scoped>
.posicion-verde {
  background-color: #e8f5e9 !important;
}
.posicion-roja {
  background-color: #ffebee !important;
}

/* Dark mode para posiciones destacadas */
.body--dark .posicion-verde {
  background-color: #388e3c !important;
  color: #fff;
}
.body--dark .posicion-roja {
  background-color: #b71c1c !important;
  color: #fff;
}

/* Banner y tabla adaptables al tema */
.q-banner.bg-grey-2 {
  background-color: #f5f5f5;
  color: #333;
}
.body--dark .q-banner.bg-grey-2 {
  background-color: #424242 !important;
  color: #fff !important;
}

/* Mejorar contraste de chips en dark mode */
.body--dark .q-chip {
  color: #fff !important;
}

/* Mejorar contraste de headers de tabla en dark mode */
.body--dark .q-table thead tr th {
  background-color: #333 !important;
  color: #fff !important;
}

/* Mejorar contraste de celdas en dark mode */
.body--dark .q-table tbody tr td {
  color: #fff;
}

/* Responsividad para cards y tabla */
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