<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar class="bg-primary text-white">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="q-mr-sm"
        >
          <q-tooltip>{{ $t('header.menu') }}</q-tooltip>
        </q-btn>
        <q-toolbar-title class="row items-center no-wrap">
          <span class="text-white text-h6">Catalyst Soccer</span>
          <span class="q-ml-md text-white text-caption" style="font-weight: bold;">v{{ appVersion }}</span>
          <q-tooltip>{{ $t('header.version') }}</q-tooltip>
        </q-toolbar-title>
        <div class="row items-center q-gutter-sm">
          <q-btn round flat>
            <q-avatar size="32px" class="user-avatar">
              <template v-if="userProfile && userProfile.fullname">
                <span>{{ getInitials(userProfile.fullname) }}</span>
              </template>
              <template v-else>
                <q-icon name="person" />
              </template>
            </q-avatar>
            <q-tooltip>{{ $t('header.user') }}</q-tooltip>
            <q-menu transition-show="jump-down" transition-hide="jump-up">
              <q-list style="min-width: 180px">
                <q-item>
                  <q-item-section>
                    <div class="text-subtitle2">{{ userProfile?.fullname || 'Usuario' }}</div>
                    <div class="text-caption text-grey-7">{{ userProfile?.role?.name || userProfile?.role_id || '' }}</div>
                  </q-item-section>
                </q-item>
                <q-separator />
                <UserOptions />
              </q-list>
            </q-menu>
          </q-btn>
          <!-- Language selector -->
          <q-btn flat round dense>
            <q-avatar size="26px">
              <img :src="currentLocale === 'es' ? 'https://flagcdn.com/ec.svg' : 'https://flagcdn.com/us.svg'" alt="flag" />
            </q-avatar>
            <q-tooltip>{{ $t('header.language') }}</q-tooltip>
            <q-menu>
              <q-list>
                <q-item clickable v-close-popup @click="setLocale('es')">
                  <q-item-section avatar><img src="https://flagcdn.com/ec.svg" width="24" /></q-item-section>
                  <q-item-section>Español</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="setLocale('en')">
                  <q-item-section avatar><img src="https://flagcdn.com/us.svg" width="24" /></q-item-section>
                  <q-item-section>English</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <!-- Add dark mode toggle button -->
          <q-btn
            flat
            dense
            round
            icon="brightness_6"
            aria-label="Toggle Dark Mode"
            @click="toggleDarkMode"
          >
            <q-tooltip>{{ $t('header.dark_mode') }}</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
    >
      <q-list>
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
                  <q-item-label>{{ $t(child.title) }}</q-item-label>
                  <q-item-label caption>{{ $t(child.caption) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>
          <q-item v-else :to="link.link">
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t(link.title) }}</q-item-label>
              <q-item-label caption>{{ $t(link.caption) }}</q-item-label>
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
import { i18n } from 'src/boot/i18n'
import { computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const filteredLinksList = ref([])

onMounted(async () => {
  try {
    const response = await fetch('/src/layouts/menu.json')
    let links = await response.json()
    if (localStorage.getItem('authProfile')) {
      links = await UserService.validateMenu(links)
      links.forEach(link => {
        link.children = link?.children?.filter(child => child.visible !== false)
      })
      filteredLinksList.value = links.filter(link => link.visible !== false)
    } else {
      filteredLinksList.value = links // muestra todos si no hay usuario
    }
  } catch (e) {
    filteredLinksList.value = []
    // Opcional: notifica el error
     $q.notify({ color: 'negative', message: 'Error loading menu'+e })
  }
})

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// Add dark mode toggle logic
function toggleDarkMode() {
  Dark.set(!Dark.isActive)
}

const currentLocale = computed(() => i18n.global.locale.value)

function setLocale(locale) {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
}

// Obtener datos de usuario desde localStorage
const userProfile = computed(() => {
  try {
    const data = localStorage.getItem('authProfile')
    if (!data) return null
    const parsed = JSON.parse(data)
    return parsed.data || null
  } catch {
    return null
  }
})

function getInitials(name) {
  if (!name) return ''
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const appVersion = import.meta.env.PACKAGE_VERSION
</script>

<style scoped>
.user-avatar {
  border: 2px solid #1976d2;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1976d2;
  font-weight: bold;
  font-size: 1.1em;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

