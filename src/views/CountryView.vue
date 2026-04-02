<template>
  <div class="screen">
    <!-- Header -->
    <div class="hdr">
      <div class="hdr-back" @click="router.push('/countries')">←</div>
      <div class="hdr-title">{{ country?.name || '...' }}</div>
      <div class="hdr-action" @click="router.push('/order')">✈️</div>
    </div>

    <template v-if="countries.loading && !country">
      <div class="scroll-area">
        <div v-for="i in 3" :key="i" class="skel" style="height:80px;border-radius:16px;margin-bottom:12px" />
      </div>
    </template>

    <template v-else-if="country">
      <!-- Hero -->
      <div class="country-hero">
        <div class="hero-flag">{{ country.flag }}</div>
        <div class="hero-name serif">{{ country.name }}</div>
        <div class="hero-meta">{{ country.continent }} · {{ country.timezone_label }} · {{ country.currency_code }}</div>
      </div>

      <!-- Tabs -->
      <div class="info-tabs">
        <div v-for="tab in tabs" :key="tab.id"
          class="info-tab"
          :class="{ active: activeTab === tab.id }"
          @click="switchTab(tab.id)"
        >{{ tab.label }}</div>
      </div>

      <!-- Content -->
      <div class="scroll-area" style="padding-top:0">

        <!-- CURRENCY -->
        <div v-if="activeTab === 'currency'">
          <div class="info-card">
            <div class="info-card-title">Курс к USD</div>
            <div class="currency-big serif">{{ country.currency_label }}</div>
            <div class="currency-rate">Обновлено сегодня</div>
          </div>
          <div class="info-card">
            <div class="info-card-title">Разница во времени</div>
            <div class="info-card-val serif">{{ country.timezone_label }}</div>
            <div class="info-card-sub">{{ country.timezone_diff }}</div>
          </div>
          <div class="info-card">
            <div class="info-card-title">Калькулятор</div>
            <div class="calc-row">
              <input class="form-input" type="number" v-model.number="calcUsd" placeholder="USD" />
              <span>→</span>
              <input class="form-input" :value="calcLocal" readonly placeholder="Местная" />
            </div>
          </div>
        </div>

        <!-- RULES -->
        <div v-if="activeTab === 'rules'">
          <div class="info-card">
            <div class="info-card-title">⚖️ Важные правила</div>
            <div v-for="r in country.rules" :key="r.id" class="rule-item">
              <div class="rule-ico">{{ r.icon }}</div>
              <div class="rule-text">{{ r.text }}</div>
            </div>
          </div>
        </div>

        <!-- CULTURE -->
        <div v-if="activeTab === 'culture'">
          <div class="info-card">
            <div class="info-card-title">🧠 Культура и этикет</div>
            <div v-for="t in country.culture_tips" :key="t.id" class="rule-item">
              <div class="rule-ico">{{ t.icon }}</div>
              <div class="rule-text">{{ t.text }}</div>
            </div>
          </div>
        </div>

        <!-- PHRASES -->
        <div v-if="activeTab === 'phrases'">
          <div class="info-card">
            <div class="info-card-title">🗣 Полезные фразы — {{ country.city }}</div>
            <div v-for="p in country.phrases" :key="p.id" class="phrase-item">
              <div>
                <div class="phrase-orig">{{ p.original }}</div>
                <div class="phrase-pron">{{ p.pronunciation }}</div>
                <div class="phrase-trans">{{ p.translation }}</div>
              </div>
              <div class="phrase-play" @click="speak(p.pronunciation)">🔊</div>
            </div>
          </div>
        </div>

        <!-- WEATHER -->
        <div v-if="activeTab === 'weather'">
          <div class="info-card">
            <div class="info-card-title">🌤 Погода на 7 дней — {{ country.city }}</div>
            <div class="weather-row">
              <div v-for="w in country.weather" :key="w.id" class="weather-day">
                <div class="weather-day-name">{{ w.day_code.toUpperCase() }}</div>
                <div class="weather-day-ico">{{ w.icon }}</div>
                <div class="weather-day-temp">{{ w.temp }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI CHAT -->
        <div v-if="activeTab === 'ai'">
          <div class="ai-chat-wrap" id="ai-messages">
            <div class="ai-bubble bot">👋 Привет! Я ваш AI-гид по <b>{{ country.name }}</b> — работаю 24/7. Спросите куда сходить, где поесть или о местных традициях! 🌍</div>
            <div class="ai-timestamp">Сейчас</div>

            <template v-for="(msg, i) in chatMessages" :key="i">
              <div class="ai-bubble" :class="msg.role === 'user' ? 'user' : msg.role === 'manager' ? 'manager' : 'bot'">
                <span v-if="msg.isHtml" v-html="msg.text" />
                <span v-else>{{ msg.text }}</span>
              </div>
              <div v-if="msg.ts" class="ai-timestamp">{{ msg.ts }}</div>
            </template>

            <div v-if="aiLoading" class="ai-bubble bot typing">
              <div class="typing-dots">
                <div class="typing-dot"/><div class="typing-dot"/><div class="typing-dot"/>
              </div>
            </div>
          </div>
          <div style="height:80px"/>
        </div>

      </div><!-- /scroll-area -->

      <!-- AI input bar -->
      <div v-if="activeTab === 'ai'" class="ai-input-row">
        <input
          class="ai-input"
          v-model="aiInput"
          placeholder="Спросите что угодно..."
          @keydown.enter="sendAI"
        />
        <button class="ai-send" @click="sendAI">➤</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCountriesStore } from '@/stores/countries'
import { haptic, useToast } from '@/composables/useUtils'
import api from '@/composables/useApi'

const route     = useRoute()
const router    = useRouter()
const countries = useCountriesStore()
const { showToast } = useToast()

const country    = computed(() => countries.current)
const activeTab  = ref('currency')
const calcUsd    = ref('')
const calcLocal  = computed(() => calcUsd.value ? (calcUsd.value * (country.value?.currency_rate || 1)).toLocaleString('ru') : '')

const aiInput    = ref('')
const aiLoading  = ref(false)
const chatMessages = ref([])

const tabs = [
  { id: 'currency', label: '💱 Валюта'  },
  { id: 'rules',    label: '⚖️ Правила' },
  { id: 'culture',  label: '🧠 Местное' },
  { id: 'phrases',  label: '🗣 Фразы'   },
  { id: 'weather',  label: '🌤 Погода'  },
  { id: 'ai',       label: '🤖 AI-чат'  },
]

onMounted(async () => {
  await countries.fetchDetail(route.params.id)
  loadHistory()
})

function switchTab(id) { haptic(); activeTab.value = id }

function speak(text) {
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = country.value?.lang_code || 'en'
    u.rate = 0.8
    speechSynthesis.speak(u)
  }
  showToast('🔊 ' + text)
  haptic()
}

async function loadHistory() {
  if (!country.value) return
  try {
    const { data } = await api.get(`/chat-messages/?country=${country.value.id}&ordering=created_at`)
    const msgs = data.results || data
    msgs.slice(-20).forEach(m => chatMessages.value.push({ role: m.role, text: m.text }))
  } catch {}
}

const MANAGER_KEYWORDS = ['виза','визу','визы','бронь','тур','путевка','билет','страховка','паспорт','посольство','цена тура']
function isManagerQ(text) {
  return MANAGER_KEYWORDS.some(k => text.toLowerCase().includes(k))
}

function getTime() { return new Date().toLocaleTimeString('ru', { hour:'2-digit', minute:'2-digit' }) }

async function saveChatMsg(role, text) {
  if (!country.value) return
  try { await api.post('/chat-messages/', { country: country.value.id, role, text }) } catch {}
}

async function sendAI() {
  const msg = aiInput.value.trim()
  if (!msg || aiLoading.value) return
  aiInput.value = ''
  haptic()

  chatMessages.value.push({ role: 'user', text: msg, ts: getTime() })
  saveChatMsg('user', msg)
  scrollChat()

  if (isManagerQ(msg)) {
    chatMessages.value.push({ role: 'bot', text: 'Для вопросов по визам и бронированиям перенаправлю к менеджеру 👇' })
    chatMessages.value.push({
      role: 'manager', isHtml: true, text: `
        <div class="manager-card">
          <div class="manager-card-title">👨‍💼 Этот вопрос лучше решит менеджер</div>
          <div class="manager-card-btn" onclick="window.open('https://t.me/voyagetrip','_blank')">✈️ &nbsp;Telegram — @voyagetrip</div>
          <div class="manager-card-btn" onclick="window.open('https://wa.me/998908810333','_blank')">💬 &nbsp;WhatsApp — +998 90 881-03-33</div>
        </div>`
    })
    scrollChat()
    return
  }

  aiLoading.value = true
  scrollChat()

  const sysPrompt = buildSysPrompt()
  const history = chatMessages.value
    .filter(m => m.role === 'user' || m.role === 'bot')
    .slice(-10)
    .map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text }))

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        system: sysPrompt,
        messages: history,
      })
    })
    const data = await resp.json()
    const reply = data.content?.[0]?.text || 'Попробуйте ещё раз 🔄'
    aiLoading.value = false
    chatMessages.value.push({ role: 'bot', text: reply, ts: getTime() })
    saveChatMsg('bot', reply)
  } catch {
    aiLoading.value = false
    chatMessages.value.push({ role: 'bot', text: 'Ошибка соединения. Попробуйте снова 🔄' })
  }
  scrollChat()
}

function buildSysPrompt() {
  const name = country.value?.name || 'этой стране'
  return `Ты — персональный AI-гид по ${name} от туристической компании Voyage Trip. Отвечай кратко и дружелюбно на русском языке, используй эмодзи. Если вопрос о визах, бронировании или ценах — направь к менеджеру @voyagetrip или WhatsApp +998908810333.`
}

function scrollChat() {
  nextTick(() => {
    const el = document.getElementById('ai-messages')
    if (el) el.scrollTop = el.scrollHeight
  })
}
</script>

<style scoped>
.screen { position: absolute; inset: 0; background: var(--bg); display: flex; flex-direction: column; overflow: hidden; }

.country-hero { padding: 0 20px 16px; flex-shrink: 0; }
.hero-flag    { font-size: 52px; line-height: 1; margin-bottom: 10px; }
.hero-name    { font-size: 34px; font-weight: 300; }
.hero-meta    { font-size: 13px; color: var(--text3); margin-top: 4px; }

.info-tabs {
  display: flex; gap: 8px; padding: 0 20px 14px;
  overflow-x: auto; scrollbar-width: none; flex-shrink: 0;
}
.info-tabs::-webkit-scrollbar { display: none; }
.info-tab {
  padding: 9px 16px; border-radius: 50px;
  background: var(--card); border: 1px solid var(--border);
  font-size: 13px; color: var(--text2); cursor: pointer;
  white-space: nowrap; transition: all .2s; flex-shrink: 0;
}
.info-tab.active { background: var(--gold-glow); border-color: var(--gold); color: var(--gold2); }

.info-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--r); padding: 18px; margin-bottom: 12px; }
.info-card-title { font-size: 12px; letter-spacing: 2px; color: var(--gold); text-transform: uppercase; margin-bottom: 10px; }
.info-card-val   { font-size: 28px; font-weight: 400; }
.info-card-sub   { font-size: 13px; color: var(--text2); margin-top: 4px; line-height: 1.5; }

.currency-big { font-size: 48px; font-weight: 300; color: var(--gold2); }
.currency-rate { font-size: 14px; color: var(--text3); }
.calc-row { display: flex; gap: 10px; align-items: center; margin-top: 8px; }
.calc-row span { color: var(--text3); }

.rule-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); align-items: flex-start; }
.rule-item:last-child { border-bottom: none; }
.rule-ico  { font-size: 20px; line-height: 1; flex-shrink: 0; margin-top: 2px; }
.rule-text { font-size: 14px; color: var(--text2); line-height: 1.5; }

.phrase-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border); gap: 12px; }
.phrase-item:last-child { border-bottom: none; }
.phrase-orig  { font-size: 15px; font-weight: 500; }
.phrase-pron  { font-size: 12px; color: var(--gold); margin-top: 1px; }
.phrase-trans { font-size: 13px; color: var(--text3); margin-top: 2px; }
.phrase-play  { font-size: 20px; cursor: pointer; flex-shrink: 0; }

.weather-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
.weather-day { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 10px 6px; text-align: center; display: flex; flex-direction: column; gap: 4px; }
.weather-day-name { font-size: 10px; color: var(--text3); letter-spacing: 1px; }
.weather-day-ico  { font-size: 22px; }
.weather-day-temp { font-size: 13px; font-weight: 600; }

.ai-chat-wrap { display: flex; flex-direction: column; gap: 10px; padding-bottom: 8px; }

.ai-input-row {
  display: flex; gap: 10px; padding: 12px 20px 24px;
  background: var(--bg); flex-shrink: 0;
  border-top: 1px solid var(--border);
}
.ai-input {
  flex: 1; background: var(--card); border: 1px solid var(--border);
  border-radius: 50px; padding: 12px 18px;
  color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none;
}
.ai-send {
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--gold); border: none; font-size: 18px;
  cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ai-send:active { transform: scale(.9); }
</style>
