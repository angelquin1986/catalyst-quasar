<template>
  <q-page class="q-pa-sm">
    <div class="q-pa-md example-row-equal-width">

      <div class="row">
        <div class="col">
          <settings-players />
        </div>
<!--        <div class="col">
          .col
        </div>-->
      </div>

      <div class="row">
        <div class="col">
          .col
        </div>
        <div class="col">
          .col
        </div>
        <div class="col">
          .col
        </div>
      </div>

    </div>
  </q-page>
</template>
<style lang="sass">

</style>
<script>
import { defineComponent ,defineAsyncComponent} from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'

// Register ECharts modules
use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])

export default defineComponent({
  name: 'SystemMaintenance',
  components: {
    SettingsPlayers: defineAsyncComponent(() => import('components/settings/system/SettingsPlayers.vue')),
  },
  setup() {
    return {}
  }
})
</script>
<style scoped>

</style>
