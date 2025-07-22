<template>
  <div>
    <q-list style="min-width: 100px">
      <q-item clickable>
        <q-item-section avatar>
          <q-icon name="person" />
        </q-item-section>
        <q-item-section>{{ $t('user.profile') }}</q-item-section>
      </q-item>
      <q-item clickable>
        <q-item-section avatar>
          <q-icon name="settings" />
        </q-item-section>
        <q-item-section>{{ $t('user.configuration') }}</q-item-section>
      </q-item>
      <q-separator />
      <q-item clickable @click="handleLogout">
        <q-item-section avatar>
          <q-icon name="power_settings_new" />
        </q-item-section>
        <q-item-section>{{ $t('user.logout') }}</q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { SessionUtils } from 'src/utils/SessionUtils.js'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'UserOptions',
  setup() {
    const router = useRouter();
    const handleLogout = () => {
      SessionUtils.logout();
      router.push('/login');
    }

    return {
      handleLogout
    }
  }
})
</script>

<style scoped>

</style>
