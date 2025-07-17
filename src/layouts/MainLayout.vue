<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title>
          Catalyst- Soft
        </q-toolbar-title>
        <div>Catalyst v{{ $q.version }}</div>
        <div>
          <q-btn round flat>
            <q-avatar size="26px">
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
            <q-menu
              transition-show="jump-down"
              transition-hide="jump-up">
              <q-list style="min-width: 100px">
                <UserOptions></UserOptions>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
        <!-- Add dark mode toggle button -->
        <q-btn
          flat
          dense
          round
          icon="brightness_6"
          aria-label="Toggle Dark Mode"
          @click="toggleDarkMode"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label header>
          Essential Links
        </q-item-label>

        <template v-for="link in filteredLinksList" :key="link.title">
          <q-expansion-item
            v-if="link.children && link.children.length"
            :icon="link.icon"
            :label="link.title"
          >
            <q-list class="q-pl-lg">
              <q-item  v-for="child in link.children"
                       :key="child.key"
                       :to="child.link"
                        active-class="q-item-no-link-highlighting" >
                <q-item-section avatar>
                  <q-icon :name="child.icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ child.title }}</q-item-label>
                  <q-item-label caption>{{ child.caption }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>
          <q-item v-else :to="link.link">
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.title }}</q-item-label>
              <q-item-label caption>{{ link.caption }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Dark } from 'quasar'
import UserOptions from './UserOptions.vue'
import { UserService } from 'src/services/UserService.js'

const filteredLinksList = ref([])

onMounted(async () => {

  const response = await fetch('/src/layouts/menu.json')
  let links = await response.json()
  links = await UserService.validateMenu(links)
  links.forEach(link => {
    link.children = link?.children?.filter(child => child.visible !== false)
  })
  filteredLinksList.value = links.filter(link => link.visible !== false)
})

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// Add dark mode toggle logic
function toggleDarkMode() {
  Dark.set(!Dark.isActive)
}
</script>

