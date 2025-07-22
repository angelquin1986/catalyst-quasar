<template>
  <q-page class="q-pa-md">
    <div class="q-pa-md">
      <q-table
        flat
        bordered
        separator="cell"
        :title="$t('users.title')"
        :rows="users"
        :columns="columns"
        row-key="id"
        :loading="loading"
        v-model:pagination="pagination"
        :grid="$q.screen.lt.md"
      >
        <template v-slot:top-right>
          <div class="row q-gutter-xs items-center justify-end">
            <q-btn color="primary" icon="add" round dense flat :label="$t('users.create')" @click="openCreateDialog" />
          </div>
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn dense round flat icon="edit" color="primary" @click="openEditDialog(props.row)">
              <q-tooltip>{{ $t('users.edit') }}</q-tooltip>
            </q-btn>
            <q-btn dense round flat icon="lock_reset" color="secondary" @click="openResetDialog(props.row)">
              <q-tooltip>{{ $t('users.reset_password') }}</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Dialogo Crear/Editar Usuario -->
    <q-dialog v-model="userDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ dialogMode === 'edit' ? $t('users.edit') : $t('users.create') }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form @submit.prevent="saveUser">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input filled v-model="form.fullname" :label="$t('users.fullname')" required />
              </div>
              <div class="col-12">
                <q-input filled v-model="form.email" :label="$t('users.email')" required type="email" />
              </div>
              <div class="col-12" v-if="dialogMode === 'create'">
                <q-input filled v-model="form.password" :label="$t('users.password')" type="password" required />
              </div>
              <div class="col-12">
                <q-select filled v-model="form.role_id" :options="roleOptions" :label="$t('users.role')" required emit-value map-options />
              </div>
              <div class="col-12">
                <q-toggle v-model="form.active" :label="$t('users.active')" />
              </div>
            </div>
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('app.cancel')" v-close-popup />
          <q-btn color="primary" :label="$t('app.save')" @click="saveUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialogo Resetear Contraseña -->
    <q-dialog v-model="resetDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('users.reset_password') }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form @submit.prevent="resetPassword">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input filled v-model="resetForm.password" :label="$t('users.new_password')" type="password" required />
              </div>
              <div class="col-12">
                <q-input filled v-model="resetForm.repeat_password" :label="$t('users.repeat_password')" type="password" required />
              </div>
            </div>
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('app.cancel')" v-close-popup />
          <q-btn color="primary" :label="$t('users.reset_password')" @click="resetPassword" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { UserService } from 'src/services/UserService.js'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const { t } = useI18n()

const users = ref([])
const loading = ref(false)
const userDialog = ref(false)
const resetDialog = ref(false)
const dialogMode = ref('create') // 'create' | 'edit'
const form = ref({ id: null, fullname: '', email: '', password: '', role_id: '', active: true })
const resetForm = ref({ password: '', repeat_password: '' })
const selectedUser = ref(null)
const pagination = ref({ rowsPerPage: 10, page: 1 })
const roleOptions = ref([])

const columns = [
  { name: 'id', label: t('users.id'), field: 'id', align: 'left', sortable: true },
  { name: 'fullname', label: t('users.fullname'), field: 'fullname', align: 'left', sortable: true },
  { name: 'email', label: t('users.email'), field: 'email', align: 'left', sortable: true },
  { name: 'active', label: t('users.active'), field: 'active', align: 'center', format: val => val ? '✔️' : '❌' },
  { name: 'role_id', label: t('users.role'), field: 'role_id', align: 'left' },
  { name: 'actions', label: t('users.actions'), field: 'actions', align: 'center' }
]

async function fetchUsers() {
  loading.value = true
  try {
    const data = await UserService.getAllUsers()
    users.value = Array.isArray(data) ? data : []
  } catch (e) {
    $q.notify({ color: 'negative', message: t('users.error') + e })
  } finally {
    loading.value = false
  }
}

async function fetchRoles() {
  try {
    const data = await UserService.getRoles()
    // Si la respuesta es un array directo
    if (Array.isArray(data)) {
      roleOptions.value = data.map(r => ({ label: r.name, value: r.id }))
    } else if (Array.isArray(data.data)) {
      roleOptions.value = data.data.map(r => ({ label: r.name, value: r.id }))
    } else {
      roleOptions.value = []
    }
  } catch (e) {
    $q.notify({ color: 'negative', message: t('users.error') + ' (roles) ' + e })
  }
}

function openCreateDialog() {
  dialogMode.value = 'create'
  form.value = { id: null, fullname: '', email: '', password: '', role_id: '', active: true }
  userDialog.value = true
}

function openEditDialog(user) {
  dialogMode.value = 'edit'
  form.value = { ...user, role_id: user.role?.id || user.role_id, password: '' }
  userDialog.value = true
}

async function saveUser() {
  try {
    if (dialogMode.value === 'edit') {
      await UserService.updateUser({
        id: form.value.id,
        fullname: form.value.fullname,
        active: form.value.active,
        email: form.value.email,
        role_id: form.value.role_id
      })
      $q.notify({ color: 'positive', message: t('users.success_update') })
    } else {
      await UserService.createUser({
        email: form.value.email,
        fullname: form.value.fullname,
        password: form.value.password,
        role_id: form.value.role_id,
        company_id: 1 // Ajustar si es necesario
      })
      $q.notify({ color: 'positive', message: t('users.success_create') })
    }
    userDialog.value = false
    fetchUsers()
  } catch (e) {
    $q.notify({ color: 'negative', message: t('users.error') + e })
  }
}

function openResetDialog(user) {
  selectedUser.value = user
  resetForm.value = { password: '', repeat_password: '' }
  resetDialog.value = true
}

async function resetPassword() {
  try {
    await UserService.resetPassword({
      email: selectedUser.value.email,
      password: resetForm.value.password,
      repeat_password: resetForm.value.repeat_password
    })
    $q.notify({ color: 'positive', message: t('users.success_reset') })
    resetDialog.value = false
  } catch (e) {
    $q.notify({ color: 'negative', message: t('users.error') + e })
  }
}

onMounted(() => {
  fetchUsers()
  fetchRoles()
})
</script> 