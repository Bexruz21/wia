<template>
  <div class="screen">
    <div class="hdr">
      <div class="hdr-back" @click="router.push('/home')">←</div>
      <div class="hdr-title">Мой сейф</div>
      <div class="hdr-action" @click="showToast('Шифрование AES-256 активно 🔒')">🔒</div>
    </div>

    <!-- Stats -->
    <div class="safe-stats">
      <div class="safe-stat"><div class="safe-stat-val ok">{{ stats.ok }}</div><div class="safe-stat-label">Действующих</div></div>
      <div class="safe-stat"><div class="safe-stat-val warn">{{ stats.warn }}</div><div class="safe-stat-label">Истекает</div></div>
      <div class="safe-stat"><div class="safe-stat-val">{{ docs.length }}</div><div class="safe-stat-label">Всего</div></div>
    </div>

    <div class="scroll-area" style="padding-top:4px">
      <!-- Skeleton -->
      <template v-if="loading">
        <div v-for="i in 2" :key="i" class="skel" style="height:130px;border-radius:24px;margin-bottom:12px"/>
      </template>

      <!-- Documents -->
      <template v-else>
        <div v-for="doc in docs" :key="doc.id" class="doc-card">
          <div class="doc-card-top">
            <div class="doc-type-badge">{{ docIcon(doc.doc_type) }} {{ docLabel(doc.doc_type) }}</div>
            <div class="doc-status" :class="docStatus(doc.valid_until)"/>
          </div>
          <div class="doc-name serif">{{ doc.title }}</div>
          <div class="doc-number">{{ doc.doc_number }}</div>
          <div v-if="doc.valid_until" class="doc-expiry" :class="docStatus(doc.valid_until)">
            {{ docExpiryLabel(doc.valid_until) }}
          </div>
          <div class="doc-actions">
            <div class="doc-action" @click="copyDoc(doc.doc_number)">📋 Копировать</div>
            <div class="doc-action" @click="deleteDoc(doc.id)">🗑 Удалить</div>
          </div>
          <div class="doc-strip" :class="stripColor(doc.doc_type)"/>
        </div>

        <button class="add-doc-btn" @click="modalOpen=true">＋ Добавить документ</button>
      </template>
    </div>

    <!-- Add doc modal -->
    <div class="modal-overlay" :class="{ open: modalOpen }" @click.self="modalOpen=false">
      <div class="modal-sheet">
        <div class="modal-handle"/>
        <div class="modal-title">Добавить документ</div>
        <div class="form-group">
          <label class="form-label">Тип документа</label>
          <select class="form-input" v-model="dForm.doc_type">
            <option value="passport">🛂 Паспорт</option>
            <option value="visa">🔖 Виза</option>
            <option value="insurance">🛡 Страховка</option>
            <option value="ticket">✈️ Билет</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" v-model="dForm.title" placeholder="Загранпаспорт"/></div>
        <div class="form-group"><label class="form-label">Владелец</label><input type="text" class="form-input" v-model="dForm.owner_name" placeholder="ФИО владельца"/></div>
        <div class="form-group"><label class="form-label">Номер документа</label><input type="text" class="form-input" v-model="dForm.doc_number" placeholder="AB 1234567"/></div>
        <div class="form-group"><label class="form-label">Срок действия</label><input type="date" class="form-input" v-model="dForm.valid_until"/></div>
        <button class="btn-primary" :disabled="saving" @click="saveDoc">
          {{ saving ? 'Сохранение...' : 'Сохранить' }}
        </button>
        <button class="btn-outline" style="width:100%;margin-top:8px" @click="modalOpen=false">Отмена</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { haptic, useToast } from '@/composables/useUtils'
import api from '@/composables/useApi'

const router = useRouter()
const { showToast } = useToast()

const loading   = ref(false)
const saving    = ref(false)
const modalOpen = ref(false)
const docs      = ref([])

const dForm = reactive({ doc_type:'passport', title:'', owner_name:'', doc_number:'', valid_until:'' })

const stats = computed(() => ({
  ok:   docs.value.filter(d => docStatus(d.valid_until) === 'ok').length,
  warn: docs.value.filter(d => docStatus(d.valid_until) === 'warn').length,
}))

onMounted(load)

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/documents/')
    docs.value = data.results || data
  } catch {} finally { loading.value = false }
}

function docStatus(validUntil) {
  if (!validUntil) return 'ok'
  const diff = (new Date(validUntil) - new Date()) / 86400000
  if (diff < 0)   return 'bad'
  if (diff < 180) return 'warn'
  return 'ok'
}
function docExpiryLabel(validUntil) {
  const d    = new Date(validUntil)
  const diff = Math.round((d - new Date()) / 86400000)
  const fmt  = d.toLocaleDateString('ru', { day:'numeric', month:'long', year:'numeric' })
  if (diff < 0)   return `🔴 Просрочен ${fmt}`
  if (diff < 180) return `⚠️ Истекает ${fmt}`
  return `✓ Действителен до ${fmt}`
}
const ICONS  = { passport:'🛂', visa:'🔖', insurance:'🛡', ticket:'✈️' }
const LABELS = { passport:'Паспорт', visa:'Виза', insurance:'Страховка', ticket:'Билет' }
const STRIPS = { passport:'gold', visa:'blue', insurance:'green', ticket:'gold' }
const docIcon  = t => ICONS[t]  || '📄'
const docLabel = t => LABELS[t] || t
const stripColor = t => STRIPS[t] || 'gold'

function copyDoc(num) {
  if (navigator.clipboard) navigator.clipboard.writeText(num.replace(/\s/g,''))
  showToast('Скопировано: ' + num)
  haptic()
}

async function deleteDoc(id) {
  if (!confirm('Удалить документ?')) return
  haptic()
  try {
    await api.delete(`/documents/${id}/`)
    docs.value = docs.value.filter(d => d.id !== id)
    showToast('Документ удалён')
  } catch { showToast('Ошибка удаления') }
}

async function saveDoc() {
  if (!dForm.title || !dForm.doc_number) { showToast('Заполните название и номер'); return }
  saving.value = true; haptic()
  try {
    const { data } = await api.post('/documents/', {
      doc_type:    dForm.doc_type,
      title:       dForm.title,
      owner_name:  dForm.owner_name || dForm.title,
      doc_number:  dForm.doc_number,
      valid_until: dForm.valid_until || null,
    })
    docs.value.unshift(data)
    modalOpen.value = false
    Object.assign(dForm, { doc_type:'passport', title:'', owner_name:'', doc_number:'', valid_until:'' })
    showToast('Документ сохранён 🔐')
  } catch (e) {
    showToast('Ошибка: ' + (e.response?.data?.detail || e.message))
  } finally { saving.value = false }
}
</script>

<style scoped>
.screen { position: absolute; inset: 0; background: var(--bg); display: flex; flex-direction: column; overflow: hidden; }

.safe-stats { display: flex; gap: 12px; padding: 0 20px 16px; flex-shrink: 0; }
.safe-stat  { flex: 1; background: var(--card); border: 1px solid var(--border); border-radius: var(--r); padding: 14px; text-align: center; }
.safe-stat-val   { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 400; }
.safe-stat-val.ok   { color: var(--ok); }
.safe-stat-val.warn { color: var(--warn); }
.safe-stat-label { font-size: 11px; color: var(--text3); margin-top: 2px; }

.doc-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--r2); padding: 20px; margin-bottom: 12px;
  position: relative; overflow: hidden;
}
.doc-card-top  { display: flex; justify-content: space-between; align-items: flex-start; }
.doc-type-badge { font-size: 11px; letter-spacing: 2px; color: var(--text3); text-transform: uppercase; }
.doc-name   { font-size: 22px; font-weight: 400; margin-top: 10px; }
.doc-number { font-size: 13px; color: var(--text3); letter-spacing: 2px; margin-top: 4px; font-family: monospace; }
.doc-expiry { font-size: 12px; margin-top: 8px; }
.doc-expiry.ok   { color: var(--ok); }
.doc-expiry.warn { color: var(--warn); }
.doc-expiry.bad  { color: var(--danger); }

.doc-actions { display: flex; gap: 8px; margin-top: 16px; }
.doc-action {
  flex: 1; padding: 10px; border: 1px solid var(--border);
  border-radius: 10px; background: var(--bg3);
  font-size: 12px; color: var(--text2); text-align: center;
  cursor: pointer; transition: all .2s;
}
.doc-action:active { border-color: var(--gold); color: var(--gold); }

.doc-strip { height: 4px; position: absolute; bottom: 0; left: 0; right: 0; }
.doc-strip.gold  { background: linear-gradient(90deg, var(--gold), var(--gold2)); }
.doc-strip.blue  { background: linear-gradient(90deg, #4c7ec9, #7ab4e8); }
.doc-strip.green { background: linear-gradient(90deg, var(--ok), #7ad4aa); }

.add-doc-btn {
  width: 100%; padding: 16px; background: transparent;
  border: 2px dashed var(--border); border-radius: var(--r2);
  color: var(--text3); font-family: 'DM Sans', sans-serif;
  font-size: 15px; cursor: pointer; display: flex;
  align-items: center; justify-content: center; gap: 8px;
  transition: all .2s; margin-top: 4px;
}
.add-doc-btn:active { border-color: var(--gold); color: var(--gold); }
.form-group { margin-bottom: 14px; }
</style>
