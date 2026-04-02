<template>
  <div class="screen">
    <div class="hdr">
      <div class="hdr-back" @click="router.push('/home')">←</div>
      <div class="hdr-title">Мой тур</div>
      <div class="hdr-action" @click="openModal">＋</div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="scroll-area">
      <div v-for="i in 2" :key="i" class="skel" style="height:100px;border-radius:20px;margin-bottom:12px"/>
    </div>

    <!-- Empty -->
    <div v-else-if="!tour" class="tour-empty">
      <div class="tour-empty-ico">🧳</div>
      <div class="tour-empty-h serif">Нет активных туров</div>
      <div class="tour-empty-sub">Добавьте информацию о вашей поездке, чтобы всё было под рукой</div>
      <button class="btn-primary" style="max-width:240px;margin-top:8px" @click="openModal">Добавить тур</button>
    </div>

    <!-- Tour card -->
    <template v-else>
      <div class="tour-card-hero">
        <div class="tour-country serif">{{ tour.country_detail?.flag }} {{ tour.country_detail?.name || '—' }}</div>
        <div class="tour-dates">{{ fmtDate(tour.departure_date) }} — {{ fmtDate(tour.return_date) }}</div>
        <div class="tour-hotel">🏨 {{ tour.hotel_name || '—' }}</div>
        <div class="tour-plane">✈️</div>
      </div>
      <div class="tour-detail-grid">
        <div class="tour-detail-item"><div class="td-label">Рейс туда</div><div class="td-val">{{ tour.flight_there || '—' }}</div></div>
        <div class="tour-detail-item"><div class="td-label">Рейс обратно</div><div class="td-val">{{ tour.flight_back || '—' }}</div></div>
        <div class="tour-detail-item"><div class="td-label">Туристы</div><div class="td-val">{{ tour.passengers }} чел.</div></div>
        <div class="tour-detail-item"><div class="td-label">Ночей</div><div class="td-val">{{ nights }}</div></div>
      </div>
      <div class="scroll-area" style="padding-top:0">
        <label class="form-label">Заметки</label>
        <textarea class="form-input" v-model="notes" placeholder="Добавьте заметки..." rows="4" style="resize:none;min-height:100px" @change="saveNotes"/>
      </div>
    </template>

    <!-- Modal -->
    <div class="modal-overlay" :class="{ open: modalOpen }" @click.self="modalOpen=false">
      <div class="modal-sheet">
        <div class="modal-handle"/>
        <div class="modal-title">Добавить тур</div>
        <div class="form-group">
          <label class="form-label">Страна</label>
          <select class="form-input" v-model="mForm.country">
            <option value="">— Выберите страну —</option>
            <option v-for="c in countriesList" :key="c.id" :value="c.id">{{ c.flag }} {{ c.name }}</option>
          </select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group"><label class="form-label">Вылет</label><input type="date" class="form-input" v-model="mForm.departure_date"/></div>
          <div class="form-group"><label class="form-label">Возврат</label><input type="date" class="form-input" v-model="mForm.return_date"/></div>
        </div>
        <div class="form-group"><label class="form-label">Отель</label><input type="text" class="form-input" v-model="mForm.hotel_name" placeholder="Название отеля"/></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group"><label class="form-label">Рейс туда</label><input type="text" class="form-input" v-model="mForm.flight_there" placeholder="HY 201"/></div>
          <div class="form-group"><label class="form-label">Рейс обратно</label><input type="text" class="form-input" v-model="mForm.flight_back" placeholder="HY 202"/></div>
        </div>
        <button class="btn-primary" :disabled="saving" @click="saveTour">
          {{ saving ? 'Сохранение...' : 'Сохранить' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCountriesStore } from '@/stores/countries'
import { haptic, useToast } from '@/composables/useUtils'
import api from '@/composables/useApi'

const router  = useRouter()
const cs      = useCountriesStore()
const { showToast } = useToast()

const loading    = ref(false)
const saving     = ref(false)
const tour       = ref(null)
const notes      = ref('')
const modalOpen  = ref(false)
const tourApiId  = ref(null)

const countriesList = computed(() => cs.list)

const mForm = reactive({
  country: '', hotel_name: '', flight_there: '',
  flight_back: '', departure_date: '', return_date: '',
})

const nights = computed(() => {
  if (!tour.value?.departure_date || !tour.value?.return_date) return 0
  return Math.round((new Date(tour.value.return_date) - new Date(tour.value.departure_date)) / 86400000)
})

onMounted(async () => {
  cs.fetchList()
  loading.value = true
  try {
    const { data } = await api.get('/my-tours/?is_active=true&ordering=-created_at')
    const tours = data.results || data
    if (tours.length) {
      tour.value  = tours[0]
      tourApiId.value = tours[0].id
      notes.value = tours[0].notes || ''
    }
  } catch {} finally { loading.value = false }
})

function openModal() { haptic(); modalOpen.value = true }

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ru', { day:'numeric', month:'long', year:'numeric' })
}

async function saveTour() {
  if (!mForm.departure_date || !mForm.return_date) { showToast('Укажите даты'); return }
  saving.value = true; haptic()
  try {
    const payload = {
      country:        mForm.country ? parseInt(mForm.country) : null,
      hotel_name:     mForm.hotel_name || 'Не указан',
      flight_there:   mForm.flight_there,
      flight_back:    mForm.flight_back,
      departure_date: mForm.departure_date,
      return_date:    mForm.return_date,
      passengers:     1,
      is_active:      true,
    }
    let resp
    if (tourApiId.value) resp = await api.patch(`/my-tours/${tourApiId.value}/`, payload)
    else                  resp = await api.post('/my-tours/', payload)
    tour.value = resp.data
    tourApiId.value = resp.data.id
    modalOpen.value = false
    showToast('Тур сохранён 🧳')
  } catch (e) {
    showToast('Ошибка: ' + (e.response?.data?.detail || e.message))
  } finally { saving.value = false }
}

async function saveNotes() {
  if (!tourApiId.value) return
  try { await api.patch(`/my-tours/${tourApiId.value}/`, { notes: notes.value }) } catch {}
}
</script>

<style scoped>
.screen { position: absolute; inset: 0; background: var(--bg); display: flex; flex-direction: column; overflow: hidden; }

.tour-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 40px; text-align: center; }
.tour-empty-ico  { font-size: 64px; opacity: .5; }
.tour-empty-h    { font-size: 24px; font-weight: 400; color: var(--text2); }
.tour-empty-sub  { font-size: 14px; color: var(--text3); line-height: 1.6; }

.tour-card-hero {
  margin: 0 20px 16px;
  background: linear-gradient(135deg, #1a2236, #0f1824);
  border: 1px solid rgba(201,168,76,.2); border-radius: var(--r2);
  padding: 22px; position: relative; overflow: hidden; flex-shrink: 0;
}
.tour-country  { font-size: 28px; font-weight: 400; }
.tour-dates    { font-size: 13px; color: var(--gold); margin-top: 6px; }
.tour-hotel    { font-size: 14px; color: var(--text2); margin-top: 4px; }
.tour-plane    { position: absolute; right: 20px; top: 50%; transform: translateY(-50%); font-size: 48px; opacity: .4; }

.tour-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 0 20px 16px; flex-shrink: 0; }
.tour-detail-item { background: var(--card); border: 1px solid var(--border); border-radius: var(--r); padding: 14px; }
.td-label { font-size: 11px; letter-spacing: 2px; color: var(--text3); text-transform: uppercase; }
.td-val   { font-size: 15px; font-weight: 500; margin-top: 4px; }
.form-group { margin-bottom: 14px; }
</style>
