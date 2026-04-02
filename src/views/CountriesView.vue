<template>
  <div class="screen">
    <div class="hdr">
      <div class="hdr-back" @click="router.push('/home')">←</div>
      <div class="hdr-title">Страны</div>
    </div>

    <div class="scroll-area">
      <!-- Search -->
      <div class="search-box">
        <span>🔍</span>
        <input v-model="query" type="text" placeholder="Поиск страны..." />
      </div>

      <!-- Loading skeletons -->
      <template v-if="countries.loading">
        <div v-for="i in 5" :key="i" class="skel" style="height:68px; border-radius:16px; margin-bottom:10px" />
      </template>

      <!-- Grouped list -->
      <template v-else>
        <div v-for="group in groupedFiltered" :key="group.continent" class="continent-section">
          <div class="continent-title">{{ group.continent }}</div>
          <div class="country-list">
            <div
              v-for="c in group.items" :key="c.id"
              class="country-card"
              @click="open(c)"
            >
              <div class="country-flag">{{ c.flag }}</div>
              <div class="country-info">
                <div class="country-name">{{ c.name }}</div>
                <div class="country-sub">{{ c.currency_code }} · {{ c.timezone_label }} · {{ c.city }}</div>
              </div>
              <div class="country-arr">›</div>
            </div>
          </div>
        </div>
        <div v-if="!groupedFiltered.length" class="empty-msg">Ничего не найдено</div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCountriesStore } from '@/stores/countries'
import { haptic } from '@/composables/useUtils'

const router    = useRouter()
const countries = useCountriesStore()
const query     = ref('')

onMounted(() => countries.fetchList())

const groupedFiltered = computed(() => {
  const q = query.value.toLowerCase()
  const filtered = q
    ? countries.list.filter(c => c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q))
    : countries.list

  const map = {}
  filtered.forEach(c => {
    if (!map[c.continent]) map[c.continent] = []
    map[c.continent].push(c)
  })
  return Object.entries(map).map(([continent, items]) => ({ continent, items }))
})

function open(c) {
  haptic()
  router.push({ name: 'country', params: { id: c.id } })
}
</script>

<style scoped>
.screen { position: absolute; inset: 0; background: var(--bg); display: flex; flex-direction: column; }
.search-box {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--r); padding: 12px 16px;
  display: flex; gap: 10px; align-items: center; margin-bottom: 16px;
}
.search-box input {
  flex: 1; background: transparent; border: none; outline: none;
  color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 15px;
}
.search-box input::placeholder { color: var(--text3); }

.continent-section  { margin-bottom: 8px; }
.continent-title    { font-size: 11px; letter-spacing: 3px; color: var(--text3); text-transform: uppercase; padding: 8px 0 10px; }
.country-list       { display: flex; flex-direction: column; gap: 10px; }
.country-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--r); padding: 16px;
  display: flex; align-items: center; gap: 14px;
  cursor: pointer; transition: all .2s;
}
.country-card:active { transform: scale(.98); border-color: rgba(201,168,76,.3); }
.country-flag  { font-size: 32px; line-height: 1; }
.country-info  { flex: 1; }
.country-name  { font-size: 16px; font-weight: 500; }
.country-sub   { font-size: 12px; color: var(--text3); margin-top: 2px; }
.country-arr   { color: var(--text3); font-size: 18px; }
.empty-msg     { text-align: center; color: var(--text3); padding: 40px 0; font-size: 15px; }
</style>
