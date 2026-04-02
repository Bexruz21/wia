<template>
  <div class="screen">
    <div class="hdr">
      <div class="hdr-back" @click="router.push('/home')">←</div>
      <div class="hdr-title">Поддержка</div>
    </div>

    <div class="scroll-area">
      <div class="sec-title" style="padding-top:0">Связаться с нами</div>

      <div class="support-card" @click="openTg">
        <div class="support-ico tg">✈️</div>
        <div class="support-info">
          <div class="support-name">Telegram</div>
          <div class="support-sub">@voyagetrip — ответим быстро</div>
        </div>
        <div class="support-arr">›</div>
      </div>

      <div class="support-card" @click="openWa">
        <div class="support-ico wa">💬</div>
        <div class="support-info">
          <div class="support-name">WhatsApp</div>
          <div class="support-sub">+998 90 881-03-33</div>
        </div>
        <div class="support-arr">›</div>
      </div>

      <div class="support-card" @click="requestExcursion">
        <div class="support-ico tour">🗺</div>
        <div class="support-info">
          <div class="support-name">Запросить экскурсию</div>
          <div class="support-sub">Подберём лучший вариант</div>
        </div>
        <div class="support-arr">›</div>
      </div>

      <div class="sec-title">Частые вопросы</div>

      <div v-for="faq in faqs" :key="faq.q" class="faq-item" :class="{ open: faq.open }" @click="toggle(faq)">
        <div class="faq-q">
          <span class="faq-q-text">{{ faq.q }}</span>
          <span class="faq-arrow">▼</span>
        </div>
        <div class="faq-a" v-show="faq.open">{{ faq.a }}</div>
      </div>

      <div style="height:20px"/>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { haptic, useToast } from '@/composables/useUtils'
import api from '@/composables/useApi'

const router = useRouter()
const { showToast } = useToast()

function openTg() { haptic(); window.open('https://t.me/voyagetrip', '_blank') }
function openWa() { haptic(); window.open('https://wa.me/998908810333', '_blank') }

async function requestExcursion() {
  haptic()
  try {
    await api.post('/excursion-orders/', {
      city: 'Не указан',
      date: new Date().toISOString().split('T')[0],
      people_count: 1,
      excursion_type: 'cultural',
    })
    showToast('Запрос на экскурсию отправлен! ✅')
  } catch {
    router.push('/order')
  }
}

function toggle(faq) { haptic(); faq.open = !faq.open }

const faqs = reactive([
  {
    q: 'Сколько времени занимает оформление тура?',
    a: 'Обычно мы подбираем варианты в течение 30–60 минут после получения заявки. Для сложных маршрутов — до 2 часов.',
    open: false,
  },
  {
    q: 'Нужна ли виза для ОАЭ?',
    a: 'Гражданам Узбекистана виза в ОАЭ оформляется онлайн заранее. Мы помогаем с оформлением — просто оставьте заявку.',
    open: false,
  },
  {
    q: 'Как хранятся мои документы?',
    a: 'Все документы шифруются по стандарту AES-256. Доступ только по вашему Telegram-аккаунту. Мы не видим содержимое ваших документов.',
    open: false,
  },
  {
    q: 'Можно ли отменить тур?',
    a: 'Условия отмены зависят от конкретного тура и отеля. Мы всегда стараемся найти решение — свяжитесь с менеджером.',
    open: false,
  },
])
</script>

<style scoped>
.screen { position: absolute; inset: 0; background: var(--bg); display: flex; flex-direction: column; }

.support-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--r); padding: 18px;
  display: flex; align-items: center; gap: 14px;
  cursor: pointer; transition: all .2s; margin-bottom: 10px;
}
.support-card:active { transform: scale(.98); border-color: rgba(201,168,76,.3); }
.support-ico {
  width: 46px; height: 46px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; flex-shrink: 0;
}
.support-ico.tg   { background: rgba(41,155,220,.15); }
.support-ico.wa   { background: rgba(37,211,102,.15); }
.support-ico.tour { background: var(--gold-glow); }
.support-info { flex: 1; }
.support-name { font-size: 15px; font-weight: 500; }
.support-sub  { font-size: 12px; color: var(--text3); margin-top: 2px; }
.support-arr  { color: var(--text3); font-size: 16px; }

.faq-item {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--r); margin-bottom: 10px; overflow: hidden;
}
.faq-q {
  padding: 16px; display: flex; justify-content: space-between;
  align-items: center; cursor: pointer;
}
.faq-q-text { font-size: 14px; font-weight: 500; }
.faq-arrow  { color: var(--text3); transition: transform .2s; font-size: 12px; }
.faq-item.open .faq-arrow { transform: rotate(180deg); }
.faq-a { padding: 0 16px 16px; font-size: 13px; color: var(--text2); line-height: 1.6; }
</style>
