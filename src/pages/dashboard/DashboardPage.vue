<template>
  <q-page class="q-pa-md">
    <template v-if="!seasons.length">
      <div class="q-mt-xl q-mb-xl flex flex-center column items-center justify-center" style="min-height: 60vh;">
        <q-avatar size="120px" class="bg-primary text-white shadow-10 q-mb-md" font-size="60px">
          <span style="font-size: 1.5em; font-weight: bold;">CS</span>
        </q-avatar>
        <div class="text-h4 text-primary text-center q-mb-sm">Catalyst Soccer</div>
        <div class="text-subtitle1 text-grey-7 text-center">by Forzamente S.A</div>
      </div>
    </template>
    <template v-else>
      <q-tabs v-model="selectedTab" class="text-primary bg-grey-1 q-mb-md" align="left" dense>
        <q-tab v-for="season in seasons" :key="season.id" :name="season.id" :label="season.name" />
      </q-tabs>
      <div v-for="season in seasons" :key="season.id" v-show="selectedTab === season.id">
        <div class="row q-col-gutter-md">
          <!-- Tabla de posiciones (Top 5) -->
          <div class="col-12 col-md-7">
            <q-card class="bg-blue-1">
              <q-card-section>
                <div class="text-h6 text-primary">{{ $t('leaderboard.title') }} (Top 5)</div>
                <q-table
                  v-if="getLeaderboardTop(season.id).length > 0"
                  flat bordered separator="cell"
                  :rows="getLeaderboardTop(season.id)"
                  :columns="columns"
                  row-key="teamName"
                  :loading="loading"
                  hide-bottom
                  dense
                  color="primary"
                >
                  <template v-slot:body-cell-position="props">
                    <q-td :props="props">{{ props.pageIndex + 1 }}</q-td>
                  </template>
                </q-table>
                <div v-else class="q-pa-md text-grey-7 text-center">{{ $t('dashboard.no_data') }}</div>
              </q-card-section>
            </q-card>
          </div>
          <!-- Resumen de partidos -->
          <div class="col-12 col-md-5">
            <q-card class="bg-green-1">
              <q-card-section>
                <div class="text-h6 text-green-10">{{ $t('dashboard.summary') }}</div>
                <template v-if="getLeaderboardTop(season.id).length > 0">
                  <div class="q-mb-sm">{{$t('dashboard.total_matches')}}: <b>{{ getSummary(season.id).totalMatches }}</b></div>
                  <div class="q-mb-sm">{{$t('dashboard.total_goals')}}: <b>{{ getSummary(season.id).totalGoals }}</b></div>
                  <div class="q-mb-sm">{{$t('dashboard.total_wins')}}: <b>{{ getSummary(season.id).totalWins }}</b></div>
                  <div class="q-mb-sm">{{$t('dashboard.total_draws')}}: <b>{{ getSummary(season.id).totalDraws }}</b></div>
                  <div class="q-mb-sm">{{$t('dashboard.total_losses')}}: <b>{{ getSummary(season.id).totalLosses }}</b></div>
                </template>
                <div v-else class="q-pa-md text-grey-7 text-center">{{ $t('dashboard.no_data') }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
        <!-- Gráfico de goles por equipo -->
        <div class="q-mt-lg">
          <q-card class="bg-yellow-1">
            <q-card-section>
              <div class="text-h6 text-warning">{{ $t('dashboard.goals_by_team') }}</div>
              <template v-if="getLeaderboardTop(season.id).length > 0 && selectedTab === season.id">
                <DashboardGoalsChart
                  v-if="getLeaderboardTop(season.id).length > 0 && selectedTab === season.id"
                  :labels="getLeaderboardTop(season.id).map(t => t.teamName)"
                  :data="getLeaderboardTop(season.id).map(t => t.goalsFor)"
                  :label="t('dashboard.goals_by_team')"
                />
              </template>
              <div v-else class="q-pa-md text-grey-7 text-center">{{ $t('dashboard.no_data') }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { LeaderboardService } from 'src/services/LeaderboardService'
import { MatchService } from 'src/services/MatchService'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import DashboardGoalsChart from './DashboardGoalsChart.vue'

const $q = useQuasar()
const { t } = useI18n()

const seasons = ref([])
const selectedTab = ref(null)
const leaderboards = ref({}) // { [seasonId]: leaderboardArray }
const loading = ref(false)
const summaries = ref({}) // { [seasonId]: summaryObj }

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

async function fetchAllSeasonsAndLeaderboards() {
  loading.value = true
  try {
    const seasonsResp = await MatchService.getSeasons()
    seasons.value = seasonsResp.data
    if (!seasons.value.length) return
    selectedTab.value = seasons.value[0].id
    for (const season of seasons.value) {
      const response = await LeaderboardService.getLeaderboardBySeason(season.id)
      leaderboards.value[season.id] = response.data
      summaries.value[season.id] = calculateSummary(response.data)
      await nextTick()
    }
  } catch (e) {
    $q.notify({ color: 'negative', message: t('leaderboard.failed_load') + e })
  } finally {
    loading.value = false
  }
}

function getLeaderboardTop(seasonId) {
  return (leaderboards.value[seasonId] || []).slice(0, 5)
}

function getSummary(seasonId) {
  return summaries.value[seasonId] || { totalMatches: 0, totalGoals: 0, totalWins: 0, totalDraws: 0, totalLosses: 0 }
}

function calculateSummary(rows) {
  return {
    totalMatches: rows.reduce((acc, r) => acc + (r.played || 0), 0),
    totalGoals: rows.reduce((acc, r) => acc + (r.goalsFor || 0), 0),
    totalWins: rows.reduce((acc, r) => acc + (r.won || 0), 0),
    totalDraws: rows.reduce((acc, r) => acc + (r.drawn || 0), 0),
    totalLosses: rows.reduce((acc, r) => acc + (r.lost || 0), 0)
  }
}

onMounted(fetchAllSeasonsAndLeaderboards)
</script> 