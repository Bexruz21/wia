<template>
  <div id="app-root">
    <router-view v-slot="{ Component, route }">
      <transition name="fade-slide" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>

    <!-- Bottom Nav -->
    <nav class="bottom-nav" v-if="showNav">
      <div
        v-for="item in navItems"
        :key="item.route"
        class="nav-item"
        :class="{ active: $route.name === item.route }"
        @click="navigate(item.route)"
      >
        <div class="nav-icon">{{ item.icon }}</div>
        <div class="nav-label">{{ item.label }}</div>
      </div>
    </nav>

    <!-- Toast -->
    <div class="toast-container" :class="{ show: toastShow }">
      <div class="toast">{{ toastMsg }}</div>
    </div>

    <!-- PIN Overlay -->
    <PinOverlay />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast, haptic } from '@/composables/useUtils'
import PinOverlay from '@/components/PinOverlay.vue'

const route  = useRoute()
const router = useRouter()
const { toastMsg, toastShow } = useToast()

const navRoutes = ['home', 'countries', 'mytour', 'safe', 'support']
const showNav   = computed(() => navRoutes.includes(route.name))

const navItems = [
  { route: 'home',      icon: '🏠', label: 'Главная' },
  { route: 'countries', icon: '🌍', label: 'Страны'  },
  { route: 'mytour',    icon: '🧳', label: 'Мой тур' },
  { route: 'safe',      icon: '🔐', label: 'Сейф'    },
  { route: 'support',   icon: '💬', label: 'Помощь'  },
]

function navigate(name) {
  if (name === 'safe') {
    // PIN guard handled by PinOverlay store
    import('@/stores/pin').then(m => m.usePinStore().openSafe())
    return
  }
  haptic()
  router.push({ name })
}
</script>

<style scoped>
#app-root {
  position: relative;
  height: 100%;
  overflow: hidden;
}
</style>
