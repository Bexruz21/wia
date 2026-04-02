<template>
  <div class="screen">
    <div class="hdr">
      <div class="hdr-back" @click="router.push('/home')">←</div>
      <div class="hdr-title">Заказать тур</div>
    </div>

    <div class="scroll-area">
      <div class="form-group">
        <label class="form-label">Страна</label>
        <select class="form-input" v-model="form.destination">
          <option value="">— Выберите страну —</option>
          <option v-for="c in countries.list" :key="c.id" :value="c.id">
            {{ c.flag }} {{ c.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Дата вылета</label>
        <input type="date" class="form-input" v-model="form.departure_date" :min="today" />
      </div>

      <div class="form-group">
        <label class="form-label">Количество ночей</label>
        <div class="counter-row">
          <span>Ночей</span>
          <div class="counter-ctrl">
            <div class="counter-btn" @click="change('days',-1)">−</div>
            <span class="counter-val">{{ form.days }}</span>
            <div class="counter-btn" @click="change('days',1)">+</div>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Туристы</label>
        <div style="display:flex;flex-direction:column;gap:8px">
          <div class="counter-row">
            <span>Взрослые</span>
            <div class="counter-ctrl">
              <div class="counter-btn" @click="change('adults',-1)">−</div>
              <span class="counter-val">{{ form.adults }}</span>
              <div class="counter-btn" @click="change('adults',1)">+</div>
            </div>
          </div>
          <div class="counter-row">
            <span>Дети</span>
            <div class="counter-ctrl">
              <div class="counter-btn" @click="change('kids',-1)">−</div>
              <span class="counter-val">{{ form.kids }}</span>
              <div class="counter-btn" @click="change('kids',1)">+</div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Бюджет (USD)</label>
        <div class="budget-chips">
          <div
            v-for="b in budgets" :key="b.label"
            class="chip"
            :class="{ sel: form.budget === b.val }"
            @click="form.budget = b.val; haptic()"
          >{{ b.label }}</div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Пожелания</label>
        <textarea class="form-input" v-model="form.wishes" placeholder="Особые требования, предпочтения по отелю..." rows="3" style="resize:none" />
      </div>

      <button class="btn-primary" :disabled="loading" @click="submit">
        {{ loading ? 'Отправляем...' : 'Отправить заявку ✈️' }}
      </button>
      <div style="height:20px"/>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCountriesStore } from '@/stores/countries'
import { haptic, useToast } from '@/composables/useUtils'
import api from '@/composables/useApi'

const router    = useRouter()
const countries = useCountriesStore()
const { showToast } = useToast()
const loading   = ref(false)
const today     = new Date().toISOString().split('T')[0]

const form = reactive({
  destination:    '',
  departure_date: '',
  days:           7,
  adults:         2,
  kids:           0,
  budget:         1000,
  wishes:         '',
})

const budgets = [
  { label: 'до $500',        val: 500   },
  { label: '$500 – $1 500',  val: 1000  },
  { label: '$1 500 – $3 000',val: 2500  },
  { label: '$3 000 – $5 000',val: 4000  },
  { label: 'от $5 000',      val: 7000  },
]

onMounted(() => countries.fetchList())

function change(key, delta) {
  haptic()
  if (key === 'adults') form.adults = Math.max(1, form.adults + delta)
  else if (key === 'days') form.days = Math.max(1, form.days + delta)
  else form.kids = Math.max(0, form.kids + delta)
}

async function submit() {
  if (!form.destination) { showToast('Выберите страну'); return }
  if (!form.departure_date) { showToast('Выберите дату вылета'); return }
  loading.value = true
  haptic()
  try {
    await api.post('/tour-orders/', { ...form, destination: parseInt(form.destination) })
    router.push('/thanks')
  } catch (e) {
    showToast('Ошибка: ' + (e.response?.data?.detail || e.message))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.screen     { position: absolute; inset: 0; background: var(--bg); display: flex; flex-direction: column; }
.form-group { margin-bottom: 16px; }
.budget-chips { display: flex; flex-wrap: wrap; gap: 8px; }
</style>
