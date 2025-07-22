<template>
  <q-page class="q-pa-md">
    <div class="q-pa-md">
      <q-table
        flat
        bordered
        separator="cell"
        :title="$t('leaderboard.title')"
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
             <div class="text-h6">{{$t('leaderboard.title')}}</div>
            <q-select
              v-model="selectedSeason"
              :options="seasons"
              :label="$t('leaderboard.select_season')"
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
              <span class="text-bold">{{$t('leaderboard.legend')}}:</span>
              <span class="q-ml-md"><b>{{$t('leaderboard.pj')}}</b>: {{$t('leaderboard.played_full')}}</span>
              <span class="q-ml-md"><b>{{$t('leaderboard.g')}}</b>: {{$t('leaderboard.won_full')}}</span>
              <span class="q-ml-md"><b>{{$t('leaderboard.e')}}</b>: {{$t('leaderboard.drawn_full')}}</span>
              <span class="q-ml-md"><b>{{$t('leaderboard.p')}}</b>: {{$t('leaderboard.lost_full')}}</span>
              <span class="q-ml-md"><b>{{$t('leaderboard.gf')}}</b>: {{$t('leaderboard.goals_for_full')}}</span>
              <span class="q-ml-md"><b>{{$t('leaderboard.gc')}}</b>: {{$t('leaderboard.goals_against_full')}}</span>
              <span class="q-ml-md"><b>{{$t('leaderboard.dg')}}</b>: {{$t('leaderboard.goal_difference_full')}}</span>
              <span class="q-ml-md"><b>{{$t('leaderboard.pts')}}</b>: {{$t('leaderboard.points_full')}}</span>
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
                  <div class="text-caption text-grey">{{$t('leaderboard.pj')}}</div>
                </div>
                <div>
                  <div class="text-subtitle2">{{ props.row.won }}</div>
                  <div class="text-caption text-grey">{{$t('leaderboard.g')}}</div>
                </div>
                <div>
                  <div class="text-subtitle2">{{ props.row.drawn }}</div>
                  <div class="text-caption text-grey">{{$t('leaderboard.e')}}</div>
                </div>
                <div>
                  <div class="text-subtitle2">{{ props.row.lost }}</div>
                  <div class="text-caption text-grey">{{$t('leaderboard.p')}}</div>
                </div>
                 <div>
                  <div class="text-subtitle2">{{ props.row.goalsFor }}</div>
                  <div class="text-caption text-grey">{{$t('leaderboard.gf')}}</div>
                </div>
                 <div>
                  <div class="text-subtitle2">{{ props.row.goalsAgainst }}</div>
                  <div class="text-caption text-grey">{{$t('leaderboard.gc')}}</div>
                </div>
                <div>
                  <div class="text-subtitle2">{{ props.row.goalDifference }}</div>
                  <div class="text-caption text-grey">{{$t('leaderboard.dg')}}</div>
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
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const { t } = useI18n()

const leaderboard = ref([])
const seasons = ref([])
const selectedSeason = ref(null)
const loading = ref(false)

const pagination = ref({
  rowsPerPage: 0 // 0 means show all rows
})

const columns = [
  { name: 'position', label: '#', align: 'left' },
  { name: 'teamName', label: t('leaderboard.team'), align: 'left', field: 'teamName', sortable: true },
  { name: 'played', label: t('leaderboard.played'), align: 'center', field: 'played' },
  { name: 'won', label: t('leaderboard.won'), align: 'center', field: 'won' },
  { name: 'drawn', label: t('leaderboard.drawn'), align: 'center', field: 'drawn' },
  { name: 'lost', label: t('leaderboard.lost'), align: 'center', field: 'lost' },
  { name: 'goalsFor', label: t('leaderboard.goals_for'), align: 'center', field: 'goalsFor' },
  { name: 'goalsAgainst', label: t('leaderboard.goals_against'), align: 'center', field: 'goalsAgainst' },
  { name: 'goalDifference', label: t('leaderboard.goal_difference'), align: 'center', field: 'goalDifference' },
  { name: 'points', label: t('leaderboard.points'), align: 'center', field: 'points', sortable: true }
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
      message: t('leaderboard.failed_load_seasons')+error,
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
    const errorMessage = error.response?.data?.error || t('leaderboard.failed_load', { seasonId })
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