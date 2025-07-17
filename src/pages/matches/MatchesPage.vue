<template>
  <q-page class="q-pa-md">
    <div class="q-pa-md">
      <q-table
        flat
        bordered
        separator="cell"
        title="Matches"
        :rows="groupedRows"
        :columns="columns"
        row-key="id"
        :loading="loading"
        v-model:pagination="pagination"
        hide-bottom
        :grid="$q.screen.lt.md"
      >
        <template v-slot:top-right>
          <div class="row q-gutter-md items-center justify-end">
            <!-- Filtros -->
            <div class="row q-gutter-sm items-center">
              <div class="text-subtitle2 text-grey-7 q-mr-sm">Filtros:</div>
              <q-select
                v-model="selectedSeason"
                :options="seasons"
                label="Temporada"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                clearable
                filled
                dense
                style="min-width: 180px;"
                class="filter-select"
              />
              <q-select
                v-model="selectedRound"
                :options="roundOptions"
                label="Ronda"
                emit-value
                map-options
                clearable
                filled
                dense
                style="min-width: 120px;"
                class="filter-select"
              />
              <q-select
                v-model="selectedTeam"
                :options="filteredTeamsForFilter"
                label="Equipo"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                clearable
                filled
                dense
                use-input
                @filter="filterTeamsForFilter"
                style="min-width: 180px;"
                class="filter-select"
              />
            </div>
            
            <!-- Separador -->
            <q-separator vertical />
            
            <!-- Botones de acción -->
            <div class="row q-gutter-xs items-center">
              <q-btn
                color="blue"
                icon="event"
                round
                dense
                flat
                @click="openAddScheduledMatchDialog"
              >
                <q-tooltip>Agregar Partido Programado</q-tooltip>
              </q-btn>
              <q-btn
                color="primary"
                icon="add"
                round
                dense
                flat
                @click="openAddMatchDialog"
              >
                <q-tooltip>Agregar Partido</q-tooltip>
              </q-btn>
            </div>
          </div>
        </template>

        <template v-slot:item="props">
          <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
            <q-card bordered flat>
              <q-card-section class="text-center">
                <div class="text-grey-8">{{ format(new Date(props.row.date), 'dd/MM/yyyy') }}{{ props.row.hour ? ` ${props.row.hour}:00` : '' }} - {{ props.row.season.name }}</div>
                <div class="text-grey-8">Round: {{ props.row.round }} | Status: <span class="text-bold">{{ props.row.status }}</span></div>
                <div class="text-h6 q-mt-sm">{{ props.row.home_team.name }} vs {{ props.row.away_team.name }}</div>
                <div class="text-h5 q-my-sm">
                  <span :class="{'text-bold winner-highlight': props.row.home_team_score > props.row.away_team_score, 'draw-highlight': props.row.home_team_score === props.row.away_team_score}">{{ props.row.home_team_score }}</span>
                  -
                  <span :class="{'text-bold winner-highlight': props.row.away_team_score > props.row.home_team_score, 'draw-highlight': props.row.home_team_score === props.row.away_team_score}">{{ props.row.away_team_score }}</span>
                </div>
              </q-card-section>
              <q-separator />
              <q-card-actions align="around">
                <q-btn flat round icon="edit" @click="openEditMatchDialog(props.row)" />
                <q-btn flat round icon="delete" @click="confirmDeleteMatch(props.row)" />
                <q-btn v-if="props.row.status === 'scheduled'" dense round flat icon="scoreboard" @click="openRegisterResultDialog(props.row)">
                  <q-tooltip>Register Result</q-tooltip>
                </q-btn>
              </q-card-actions>
            </q-card>
          </div>
        </template>

        <template v-slot:body="props">
          <q-tr v-if="props.row.isGroupHeader">
            <q-td :colspan="columns.length + 1" class="text-left bg-grey-2 text-bold q-py-sm">
              <q-icon name="sports_soccer" class="q-mr-sm" />Round {{ props.row.round }}
            </q-td>
          </q-tr>
          <q-tr v-else :props="props">
            <q-td key="home_team" :props="props" :class="{ 'winner-highlight': props.row.home_team_points > props.row.away_team_points, 'draw-highlight': props.row.home_team_points === props.row.away_team_points }">
              {{ props.row.home_team.name }}
            </q-td>
            <q-td key="away_team" :props="props" :class="{ 'winner-highlight': props.row.away_team_points > props.row.home_team_points, 'draw-highlight': props.row.home_team_points === props.row.away_team_points }">
              {{ props.row.away_team.name }}
            </q-td>
            <q-td key="score" :props="props" align="center">
              {{ `${props.row.home_team_score} - ${props.row.away_team_score}` }}
            </q-td>
            <q-td key="home_team_points" :props="props" align="center" :class="{ 'winner-highlight': props.row.home_team_points > props.row.away_team_points, 'draw-highlight': props.row.home_team_points === props.row.away_team_points }">
              {{ props.row.home_team_points }}
            </q-td>
            <q-td key="away_team_points" :props="props" align="center" :class="{ 'winner-highlight': props.row.away_team_points > props.row.home_team_points, 'draw-highlight': props.row.home_team_points === props.row.away_team_points }">
              {{ props.row.away_team_points }}
            </q-td>
            <q-td key="season" :props="props">
              {{ props.row.season.name }}
            </q-td>
            <q-td key="round" :props="props" align="center">
              {{ props.row.round }}
            </q-td>
            <q-td key="date_time" :props="props" align="center">
              {{ `${format(new Date(props.row.date), 'dd/MM/yyyy')}${props.row.hour ? ` ${props.row.hour}:00` : ''}` }}
            </q-td>
            <q-td key="status" :props="props" align="center">
              <q-badge :color="statusColor(props.row.status)" outline>
                {{ props.row.status }}
              </q-badge>
            </q-td>
            <q-td key="stadium" :props="props">
              {{ props.row.stadium.name }}
            </q-td>
            <q-td key="actions" :props="props">
              <q-btn dense round flat icon="edit" @click="openEditMatchDialog(props.row)"></q-btn>
              <q-btn dense round flat icon="delete" @click="confirmDeleteMatch(props.row)"></q-btn>
              <q-btn v-if="props.row.status === 'scheduled'" dense round flat icon="scoreboard" @click="openRegisterResultDialog(props.row)">
                <q-tooltip>Register Result</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>

    <!-- Match Dialog -->
    <q-dialog v-model="matchDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ dialogTitle }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit.prevent="saveMatch">
            <!-- Formulario para Add Scheduled Match en dos columnas -->
            <div v-if="dialogMode === 'schedule'" class="row q-col-gutter-md">
              <div class="col-6">
                <q-input
                  filled
                  v-model="matchForm.date"
                  label="Match Date"
                  mask="date"
                  :rules="['date']"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy
                        cover
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-date v-model="matchForm.date">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Close" color="primary" />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-6">
                <q-input
                  filled
                  v-model="matchForm.hour"
                  label="Match Hour (1-24)"
                  type="number"
                  min="1"
                  max="24"
                  :rules="[
                    val => val !== null && val !== '' && val !== undefined || 'Hour is required',
                    val => val >=1 && val <= 24 || 'Hour must be between 1 and 24'
                  ]"
                >
                </q-input>
              </div>
              <div class="col-6">
                <q-select
                  v-model="matchForm.season_id"
                  :options="seasons"
                  label="Season"
                  option-value="id"
                  option-label="name"
                  emit-value
                  map-options
                  filled
                  lazy-rules
                  :rules="[val => !!val || 'Season is required']"
                />
              </div>
              <div class="col-6">
                <q-select
                  v-model="matchForm.stadium_id"
                  :options="stadiums"
                  label="Stadium"
                  option-value="id"
                  option-label="name"
                  emit-value
                  map-options
                  filled
                  lazy-rules
                  :rules="[val => !!val || 'Stadium is required']"
                />
              </div>
              <div class="col-6">
                <q-select
                  v-model="matchForm.home_team_id"
                  :options="filteredHomeTeams"
                  label="Home Team"
                  option-value="id"
                  option-label="name"
                  emit-value
                  map-options
                  filled
                  use-input
                  input-debounce="0"
                  @filter="filterHomeTeams"
                  lazy-rules
                  :rules="[val => !!val || 'Home team is required']"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        No results found
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-6">
                <q-select
                  v-model="matchForm.away_team_id"
                  :options="filteredAwayTeams"
                  label="Away Team"
                  option-value="id"
                  option-label="name"
                  emit-value
                  map-options
                  filled
                  use-input
                  input-debounce="0"
                  @filter="filterAwayTeams"
                  lazy-rules
                  :rules="[
                    val => !!val || 'Away team is required',
                    val => val !== matchForm.home_team_id || 'Away team must be different from home team'
                  ]"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        No results found
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-6">
                <q-input
                  v-model.number="matchForm.round"
                  type="number"
                  label="Round"
                  filled
                  lazy-rules
                  :rules="[val => val !== null && val > 0 || 'Round is required']"
                />
              </div>
            </div>

            <!-- Formulario para otros modos (add, edit, result) -->
            <div v-if="dialogMode !== 'schedule'">
              <q-input
                v-if="dialogMode !== 'result'"
                filled
                v-model="matchForm.date"
                label="Match Date"
                mask="date"
                :rules="['date']"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="matchForm.date">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <q-input
                v-if="dialogMode !== 'result'"
                filled
                v-model="matchForm.hour"
                label="Match Hour (1-24)"
                type="number"
                min="1"
                max="24"
                :rules="[val => val >=1 && val <= 24 || 'Hour must be between 1 and 24']"
              />
              <q-select
                v-if="dialogMode !== 'result'"
                v-model="matchForm.season_id"
                :options="seasons"
                label="Season"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                filled
                lazy-rules
                :rules="[val => !!val || 'Season is required']"
              />
              <q-select
                v-if="dialogMode !== 'result'"
                v-model="matchForm.stadium_id"
                :options="stadiums"
                label="Stadium"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                filled
                lazy-rules
                :rules="[val => !!val || 'Stadium is required']"
              />

              <!-- Home/Away Teams & Scores -->
              <div v-if="dialogMode !== 'result'">
                <div class="row q-col-gutter-md q-mb-sm" :class="{
                 'winner-highlight': matchForm.home_team_score > matchForm.away_team_score,
                 'draw-highlight': matchForm.home_team_score === matchForm.away_team_score
                }">
                  <div class="col-8">
                    <q-select
                      v-model="matchForm.home_team_id"
                      :options="filteredHomeTeams"
                      label="Home Team"
                      option-value="id"
                      option-label="name"
                      emit-value
                      map-options
                      filled
                      use-input
                      input-debounce="0"
                      @filter="filterHomeTeams"
                      lazy-rules
                      :rules="[val => !!val || 'Home team is required']"
                    >
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            No results found
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>
                  <div class="col-4" v-if="dialogMode !== 'schedule'">
                    <q-input
                      v-model.number="matchForm.home_team_score"
                      type="number"
                      label="Score"
                      filled
                      lazy-rules
                      :rules="[val => val !== null && val !== '' || 'Score is required']"
                      @update:model-value="calculatePoints"
                    />
                  </div>
                </div>

                <div class="row q-col-gutter-md q-mb-md" :class="{
                 'winner-highlight': matchForm.away_team_score > matchForm.home_team_score,
                 'draw-highlight': matchForm.home_team_score === matchForm.away_team_score
                }">
                  <div class="col-8">
                    <q-select
                      v-model="matchForm.away_team_id"
                      :options="filteredAwayTeams"
                      label="Away Team"
                      option-value="id"
                      option-label="name"
                      emit-value
                      map-options
                      filled
                      use-input
                      input-debounce="0"
                      @filter="filterAwayTeams"
                      lazy-rules
                      :rules="[val => !!val || 'Away team is required', val => val !== matchForm.home_team_id || 'Away team must be different from home team']"
                    >
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            No results found
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>
                  <div class="col-4" v-if="dialogMode !== 'schedule'">
                    <q-input
                      v-model.number="matchForm.away_team_score"
                      type="number"
                      label="Score"
                      filled
                      lazy-rules
                      :rules="[val => val !== null && val !== '' || 'Score is required']"
                      @update:model-value="calculatePoints"
                    />
                  </div>
                </div>
              </div>

              <!-- Result Registration -->
              <div v-if="dialogMode === 'result'">
                <div class="text-subtitle1 q-mb-sm">
                  {{ matchForm.home_team.name }} vs {{ matchForm.away_team.name }}
                </div>
                 <div class="row q-col-gutter-md q-mb-sm">
                    <div class="col-12">
                       <q-input
                        v-model.number="matchForm.home_team_score"
                        type="number"
                        :label="`${matchForm.home_team.name} Score`"
                        filled
                        lazy-rules
                        :rules="[val => val !== null && val !== '' || 'Score is required']"
                        @update:model-value="calculatePoints"
                      />
                    </div>
                    <div class="col-12">
                      <q-input
                        v-model.number="matchForm.away_team_score"
                        type="number"
                        :label="`${matchForm.away_team.name} Score`"
                        filled
                        lazy-rules
                        :rules="[val => val !== null && val !== '' || 'Score is required']"
                        @update:model-value="calculatePoints"
                      />
                    </div>
                 </div>
              </div>

              <div class="row q-col-gutter-md" v-if="dialogMode !== 'schedule'">
                <div class="col-6">
                  <q-input
                    v-model.number="matchForm.home_team_points"
                    type="number"
                    :label="homeTeamPointsLabel"
                    filled
                    readonly
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model.number="matchForm.away_team_points"
                    type="number"
                    :label="awayTeamPointsLabel"
                    filled
                    readonly
                  />
                </div>
              </div>

              <q-input
                v-if="dialogMode !== 'result'"
                v-model.number="matchForm.round"
                type="number"
                label="Round"
                filled
                lazy-rules
                :rules="[val => val !== null && val > 0 || 'Round is required']"
              />

              <q-select
                v-if="dialogMode === 'add' || dialogMode === 'edit'"
                v-model="matchForm.status"
                :options="statusOptions"
                label="Status"
                filled
              />

               <q-input
                v-if="dialogMode !== 'schedule'"
                v-model="matchForm.observation"
                type="textarea"
                label="Observation"
                filled
                :lazy-rules="dialogMode === 'result'"
                :rules="dialogMode === 'result' ? [val => !!val || 'Observation is required'] : []"
              />
            </div>
            <q-card-actions align="right" class="text-primary">
              <q-btn flat label="Cancel" @click="closeMatchDialog" />
              <q-btn type="submit" flat :label="submitButtonLabel" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { MatchService } from 'src/services/MatchService'
import { useQuasar } from 'quasar'
import { format } from 'date-fns'

const $q = useQuasar()

const matches = ref([])
const loading = ref(false)
const matchDialog = ref(false)
const dialogMode = ref('add') // add, edit, schedule, result
const statusOptions = ['scheduled', 'in_progress', 'finished', 'postponed', 'cancelled']

const teams = ref([])
const seasons = ref()
const stadiums = ref([])
const filteredHomeTeams = ref([])
const filteredAwayTeams = ref([])
const filteredTeamsForFilter = ref([])

const pagination = ref({ rowsPerPage: 0, page: 1 }) // rowsPerPage: 0 means show all rows

const selectedSeason = ref(null)
const selectedRound = ref(null)
const selectedTeam = ref(null)

const roundOptions = computed(() => {
  const rounds = [...new Set(matches.value.map(match => match.round))].sort((a, b) => b - a)
  return rounds.map(round => ({ label: `Round ${round}`, value: round }))
})

const initialMatchForm = {
  id: null,
  home_team_id: null,
  away_team_id: null,
  season_id: null,
  stadium_id: null,
  date: format(new Date(), 'yyyy/MM/dd'),
  hour: 20,
  home_team_score: 0,
  away_team_score: 0,
  home_team_points: 0,
  away_team_points: 0,
  round: null,
  status: 'scheduled',
  observation: ''
}

const matchForm = ref({ ...initialMatchForm })

const columns = [
  { name: 'home_team', label: 'Home Team', align: 'left', field: row => row.home_team.name, sortable: true, headerStyle: 'width: 120px;' },
  { name: 'away_team', label: 'Away Team', align: 'left', field: row => row.away_team.name, sortable: true, headerStyle: 'width: 120px;' },
  { name: 'score', label: 'Score', align: 'center', field: row => `${row.home_team_score} - ${row.away_team_score}`, headerStyle: 'width: 70px;' },
  { name: 'home_team_points', label: 'Home Points', align: 'center', field: row => row.home_team_points, sortable: true, headerStyle: 'width: 70px;' },
  { name: 'away_team_points', label: 'Away Points', align: 'center', field: row => row.away_team_points, sortable: true, headerStyle: 'width: 70px;' },
  { name: 'season', label: 'Season', field: row => row.season.name, sortable: true, headerStyle: 'width: 110px;' },
  { name: 'round', label: 'Round', field: row => row.round, align: 'center', sortable: true, headerStyle: 'width: 60px;' },
  { name: 'date_time', label: 'Date & Time', field: row => `${format(new Date(row.date), 'dd/MM/yyyy')}${row.hour ? ` ${row.hour}:00` : ''}`, align: 'center', sortable: true, headerStyle: 'width: 120px;' },
  { name: 'status', label: 'Status', field: row => row.status, align: 'center', sortable: true, headerStyle: 'width: 90px;' },  { name: 'stadium', label: 'Stadium', field: row => row.stadium.name, sortable: true, headerStyle: 'width: 110px;' },
  { name: 'actions', label: 'Actions', field: 'id', align: 'right', headerStyle: 'width: 80' }
]
const fetchMatches = async () => {
  loading.value = true
  try {
    const response = await MatchService.getMatches()
    matches.value = response.data
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to load matches'
    $q.notify({
      color: 'negative',
      message: errorMessage,
      icon: 'report_problem'
    })
  } finally {
    loading.value = false
  }
}

const fetchDropdownData = async () => {
  try {
    const [teamsRes, seasonsRes, stadiumsRes] = await Promise.all([
      MatchService.getTeams(),
      MatchService.getSeasons(),
      MatchService.getStadiums()
    ])
    teams.value = teamsRes.data
    seasons.value = seasonsRes.data
    stadiums.value = stadiumsRes.data
    filteredTeamsForFilter.value = teamsRes.data
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to load form data'
    $q.notify({
      color: 'negative',
      message: errorMessage,
      icon: 'report_problem'
    })
  }
}

const groupedRows = computed(() => {
  // On mobile, don't group, just show the plain list for the grid view
  if ($q.screen.lt.md) {
    let sourceMatches = matches.value
    if (selectedSeason.value) {
      sourceMatches = sourceMatches.filter(match => match.season_id === selectedSeason.value)
    }
    if (selectedRound.value) {
      sourceMatches = sourceMatches.filter(match => match.round === selectedRound.value)
    }
    if (selectedTeam.value) {
      sourceMatches = sourceMatches.filter(match => match.home_team_id === selectedTeam.value || match.away_team_id === selectedTeam.value)
    }
    return sourceMatches.sort((a, b) => b.round - a.round || new Date(b.date) - new Date(a.date))
  }

  // --- Desktop Grouped View ---
  let sourceMatches = matches.value

  if (selectedSeason.value) {
    sourceMatches = sourceMatches.filter(match => match.season_id === selectedSeason.value)
  }

  if (selectedRound.value) {
    sourceMatches = sourceMatches.filter(match => match.round === selectedRound.value)
  }

  if (selectedTeam.value) {
    sourceMatches = sourceMatches.filter(match => match.home_team_id === selectedTeam.value || match.away_team_id === selectedTeam.value)
  }

  if (!sourceMatches || sourceMatches.length === 0) {
    return []
  }

  // Create a mutable copy and sort by round descending, then by date, hour, and stadium
  const sortedMatches = sourceMatches.sort((a, b) => {
    // First by round (descending)
    if (b.round !== a.round) {
      return b.round - a.round
    }
    
    // Then by date (descending)
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime()
    }

    // Then by stadium name (ascending)
    const stadiumComparison = (a.stadium.name || '').localeCompare(b.stadium.name || '')
    if (stadiumComparison !== 0) {
      return stadiumComparison
    }
    // Finally by hour (descending)
    return  (a.hour || 0) - (b.hour || 0) 
  })

  const rows = []
  let lastRound = null
  let lastStadium = null

  sortedMatches.forEach(match => {
    // Group by round
    if (match.round !== lastRound) {
      // Add a round header row
      rows.push({ isGroupHeader: true, round: match.round, id: `header_round_${match.round}`, headerType: 'round' })
      lastRound = match.round
      lastStadium = null // Reset stadium when round changes
    }
    
    // Group by stadium within each round
    if (match.stadium.name !== lastStadium) {
      // Add a stadium header row
      rows.push({
        isGroupHeader: true, 
        round: match.round, 
        stadium: match.stadium.name, 
        id: `header_stadium_${match.round}_${match.stadium.id}`, 
        headerType: 'stadium' 
      })
      lastStadium = match.stadium.name
    }
    
    // Add the actual match row
    rows.push(match)
  })

  return rows
})

const dialogTitle = computed(() => {
  const titles = {
    add: 'Add New Match',
    edit: 'Edit Match',
    schedule: 'Add Scheduled Match',
    result: 'Register Result'
  }
  return titles[dialogMode.value] || 'Add New Match'
})
const submitButtonLabel = computed(() => {
  return (dialogMode.value === 'add' || dialogMode.value === 'schedule') ? 'Save' : 'Update'
})

const homeTeamPointsLabel = computed(() => {
  if (matchForm.value.home_team_id) {
    const team = teams.value.find(t => t.id === matchForm.value.home_team_id)
    return team ? `${team.name} Points` : 'Home Team Points'
  }
  return 'Home Team Points'
})

const awayTeamPointsLabel = computed(() => {
  if (matchForm.value.away_team_id) {
    const team = teams.value.find(t => t.id === matchForm.value.away_team_id)
    return team ? `${team.name} Points` : 'Away Team Points'
  }
  return 'Away Team Points'
})
const statusColor = (status) => {
  const colors = {
    scheduled: 'primary',
    in_progress: 'orange',
    finished: 'positive',
    postponed: 'grey',
    cancelled: 'negative'
  }
  return colors[status] || 'grey'
}

const filterTeamsForFilter = (val, update) => {
  if (!val) {
    update(() => {
      filteredTeamsForFilter.value = teams.value
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    filteredTeamsForFilter.value = teams.value.filter(
      team => team.name.toLowerCase().indexOf(needle) > -1
    )
  })
}

const filterHomeTeams = (val, update) => {
  if (!val) {
    update(() => {
      filteredHomeTeams.value = teams.value
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    filteredHomeTeams.value = teams.value.filter(
      team => team.name.toLowerCase().indexOf(needle) > -1
    )
  })
}

const filterAwayTeams = (val, update) => {
  if (!val) {
    update(() => {
      filteredAwayTeams.value = teams.value
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    filteredAwayTeams.value = teams.value.filter(
      team => team.name.toLowerCase().indexOf(needle) > -1
    )
  })
}

const calculatePoints = () => {
  const homeScore = matchForm.value.home_team_score
  const awayScore = matchForm.value.away_team_score

  if (homeScore > awayScore) {
    matchForm.value.home_team_points = 3
    matchForm.value.away_team_points = 0
  } else if (awayScore > homeScore) {
    matchForm.value.home_team_points = 0
    matchForm.value.away_team_points = 3
  } else {
    matchForm.value.home_team_points = 1
    matchForm.value.away_team_points = 1
  }
}

const resetForm = () => {
  matchForm.value = { ...initialMatchForm, date: format(new Date(), 'yyyy/MM/dd'), hour: 20 }
}

const openAddMatchDialog = () => {
  dialogMode.value = 'add'
  resetForm()
  matchForm.value.status = 'scheduled'
  filteredHomeTeams.value = teams.value
  filteredAwayTeams.value = teams.value
  matchDialog.value = true
}

const openAddScheduledMatchDialog = () => {
  dialogMode.value = 'schedule'
  resetForm()
  matchForm.value.status = 'scheduled'
  filteredHomeTeams.value = teams.value
  filteredAwayTeams.value = teams.value
  matchDialog.value = true
}

const openEditMatchDialog = (match) => {
  dialogMode.value = 'edit'
  matchForm.value = {
    ...match,
    date: format(new Date(match.date), 'yyyy/MM/dd'),
    hour: match.hour || 20  }
  filteredHomeTeams.value = teams.value
  filteredAwayTeams.value = teams.value
  matchDialog.value = true
}

const openRegisterResultDialog = (match) => {
  dialogMode.value = 'result'
  matchForm.value = {
    ...match,
    date: format(new Date(match.date), 'yyyy/MM/dd'),
    hour: match.hour || 20,
    home_team_score: null,
    away_team_score: null,
    observation: ''
  }
  matchForm.value.status = 'finished'
  matchDialog.value = true
}

const closeMatchDialog = () => {
  matchDialog.value = false
}

const saveMatch = async () => {
  try {
    const dataToSave = { ...matchForm.value }
    dataToSave.date = new Date(dataToSave.date).toISOString()
    
    // Ensure hour is sent as integer
    if (dataToSave.hour !== null && dataToSave.hour !== undefined) {
      dataToSave.hour = parseInt(dataToSave.hour)
    }

    if (dialogMode.value === 'edit' || dialogMode.value === 'result') {
      const isResult = dialogMode.value === 'result'
      const updatePayload = {
        home_team_id: dataToSave.home_team_id,
        away_team_id: dataToSave.away_team_id,
        season_id: isResult ? undefined : dataToSave.season_id,
        stadium_id: isResult ? undefined : dataToSave.stadium_id,
        date: isResult ? undefined : dataToSave.date,
        hour: isResult ? undefined : dataToSave.hour,
        home_team_score: dataToSave.home_team_score,
        away_team_score: dataToSave.away_team_score,
        home_team_points: dataToSave.home_team_points,
        away_team_points: dataToSave.away_team_points,
        round: isResult ? undefined : dataToSave.round,
        status: isResult ? 'finished' : dataToSave.status,
        observation: dataToSave.observation
      }
      await MatchService.updateMatch(dataToSave.id, updatePayload)
      $q.notify({ color: 'positive', message: 'Match updated successfully' })
    } else { // add' or 'schedule'
      const isSchedule = dialogMode.value === 'schedule'
      const createPayload = {
        home_team_id: dataToSave.home_team_id,
        away_team_id: dataToSave.away_team_id,
        season_id: dataToSave.season_id,
        stadium_id: dataToSave.stadium_id,
        date: dataToSave.date,
        hour: dataToSave.hour,
        round: dataToSave.round,
        status: dataToSave.status,
        home_team_score: isSchedule ? 0 : dataToSave.home_team_score,
        away_team_score: isSchedule ? 0 : dataToSave.away_team_score,
        home_team_points: isSchedule ? 0 : dataToSave.home_team_points,
        away_team_points: isSchedule ? 0 : dataToSave.away_team_points,
        observation: isSchedule ? '' : dataToSave.observation
      }
      await MatchService.createMatch(createPayload)
      $q.notify({ color: 'positive', message: 'Match created successfully' })
    }
    fetchMatches()
    closeMatchDialog()
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to save match'
    $q.notify({
      color: 'negative',
      message: errorMessage,
      icon: 'report_problem'
    })
  }
}

const confirmDeleteMatch = (match) => {
  $q.dialog({
    title: 'Confirm',
    message: `Are you sure you want to delete the match between ${match.home_team.name} and ${match.away_team.name}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await MatchService.deleteMatch(match.id)
      $q.notify({ color: 'positive', message: 'Match deleted successfully' })
      fetchMatches()
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete match'
      $q.notify({ 
        color: 'negative',
        message: errorMessage,
        icon: 'report_problem'
      })
    }
  })
}

onMounted(() => {
  fetchMatches()
  fetchDropdownData()
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
.q-table__title {
    font-size: 1.5rem;
    font-weight: 500;
}

/* Estilos para los filtros y botones */
.filter-select {
  transition: all 0.3s ease;
}

.filter-select:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* Mejorar apariencia de los botones de acción */
.q-btn {
  transition: all 0.2s;
}

.q-btn:hover {
  transform: scale(1.1);
}

/* Separador vertical más visible */
.q-separator.vertical {
  height: 40px;
  margin: 0 16px;
}

/* Espaciado mejorado para el contenedor principal */
.q-table__top {
  padding: 16px 24px;
  background: linear-gradient(135deg, #f5fa 0%, #c3cfe2 100%);
  border-radius: 8px 0 0;
}
</style> 