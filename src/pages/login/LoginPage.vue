<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex bg-image flex-center">
        <q-card v-bind:style="$q.screen.lt.sm?{'width': '80%'}:{'width':'30%'}">
          <q-card-section>
            <q-avatar size="103px" class="absolute-center shadow-10">
              <img src="profile.svg">
            </q-avatar>
          </q-card-section>
          <q-card-section>
            <div class="text-center q-pt-lg">
              <div class="col text-h6 ellipsis">
                {{$t('login.title')}}
              </div>
            </div>
          </q-card-section>
          <q-card-section>
            <q-form
              class="q-gutter-md"
            >
              <q-input
                filled
                v-model="username"
                :label="$t('login.username')"
                lazy-rules
              />

              <q-input
                type="password"
                filled
                v-model="password"
                :label="$t('login.password')"
                lazy-rules
                @keyup.enter="handleLogin"
              />

              <div>
                <q-btn
                  :label="$t('login.login')"
                  type="button"
                  color="primary"
                  @click="handleLogin"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from 'vue';
import { ref } from 'vue';
import { useRouter } from "vue-router";
import { UserService } from 'src/services/UserService.js'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  setup() {
    const $q = useQuasar()
    const { t } = useI18n()
    const username = ref('');
    const password = ref('');
    const router = useRouter(); // Initialize router

    const handleLogin = async () => {
      try {
        await UserService.login(username.value, password.value);
        router.push('/');
      } catch (error) {
        console.error('Login failed:', error.message);
        $q.notify(t('login.failed')+': '+error.message)
      }
    };

    return {
      username,
      password,
      handleLogin,
    };
  },
});
</script>

<style>
.bg-image {
  background-image: linear-gradient(135deg, #7028e4 0%, #e5b2ca 100%);
}
</style>
