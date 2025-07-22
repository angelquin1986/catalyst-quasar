<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card class="q-pa-xl" style="max-width: 400px; width: 100%;">
      <div class="column items-center q-gutter-md">
        <q-avatar size="100px" class="bg-primary text-white text-h3 flex flex-center" style="font-weight: bold;">FS</q-avatar>
        <div class="text-h5 text-primary text-center">Catalyst Soccer<br>by Forzamente S.A</div>
        <q-separator class="q-my-md" />
        <div class="text-body1 text-center">
          <q-icon name="email" class="q-mr-xs" />
          <a href="mailto:angel.quingaluisa@gmail.com" class="text-primary">angel.quingaluisa@gmail.com</a>
        </div>
        <div class="text-body2 text-center q-mt-sm">
          <q-icon name="link" class="q-mr-xs" />
          <a href="https://www.linkedin.com/in/angel-leonardo-quingaluisa-quispe-6a337762/" target="_blank" class="text-primary">
            LinkedIn: Angel Leonardo Quingaluisa Quispe
          </a>
        </div>
        <q-separator class="q-my-md" />
        <div class="text-caption text-grey-7 text-center">Versión de la app: v{{ appVersion }}</div>
        <div class="q-mt-md text-center text-grey-7">
          <q-icon name="copyright" size="18px" class="q-mr-xs" />
          2025 Catalyst Soccer by Forzamente S.A<br>Quito, Ecuador
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
const appVersion = import.meta.env.PACKAGE_VERSION
</script> 