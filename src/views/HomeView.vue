<template>
  <div class="home-screen">
    <div class="home-scroll">
      <div class="home-top">
        <div class="home-brand">Voyage Trip</div>
        <div class="home-greeting serif">
          Добрый день,<br><span class="gold">{{ auth.firstName }} 👋</span>
        </div>
        <div class="home-sub">Куда отправимся сегодня?</div>
      </div>

      <div class="home-card">
        <div class="home-card-label">Актуальный курс</div>
        <div class="home-card-val serif">1 USD = 12 800 UZS</div>
        <div class="home-card-sub">Обновлено сегодня в 10:00</div>
        <div class="home-card-badge">💰</div>
      </div>

      <div class="sec-title">Что вас интересует?</div>

      <div class="menu-grid">
        <div class="menu-btn" @click="go('order')">
          <div class="menu-icon">✈️</div>
          <div>
            <div class="menu-label">Заказать тур</div>
            <div class="menu-desc">Подберём лучшие варианты</div>
          </div>
        </div>
        <div class="menu-btn" @click="go('countries')">
          <div class="menu-icon">🌍</div>
          <div>
            <div class="menu-label">Страны</div>
            <div class="menu-desc">Информация, погода, фразы</div>
          </div>
        </div>
        <div class="menu-btn" @click="go('mytour')">
          <div class="menu-icon">🧳</div>
          <div>
            <div class="menu-label">Мой тур</div>
            <div class="menu-desc">Детали поездки</div>
          </div>
        </div>
        <div class="menu-btn" @click="openSafe">
          <div class="menu-icon">🔐</div>
          <div>
            <div class="menu-label">Мой сейф</div>
            <div class="menu-desc">Документы</div>
          </div>
        </div>
        <div class="menu-btn wide" @click="go('support')">
          <div class="menu-icon">💬</div>
          <div>
            <div class="menu-label">Поддержка</div>
            <div class="menu-desc">Менеджер всегда на связи</div>
          </div>
        </div>
      </div>
      <div style="height:100px"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCountriesStore } from '@/stores/countries'
import { usePinStore } from '@/stores/pin'
import { haptic } from '@/composables/useUtils'

const router    = useRouter()
const auth      = useAuthStore()
const countries = useCountriesStore()
const pin       = usePinStore()

onMounted(async () => {
  if (!auth.isAuth) await auth.fetchMe()
  countries.fetchList()
})

function go(name) { haptic(); router.push({ name }) }
function openSafe() { haptic(); pin.openSafe() }
</script>

<style scoped>
.home-screen { position: absolute; inset: 0; background: var(--bg); display: flex; flex-direction: column; }
.home-scroll { flex: 1; overflow-y: auto; scrollbar-width: none; }
.home-scroll::-webkit-scrollbar { display: none; }
.home-top { padding: 28px 24px 0; }
.home-brand { font-size: 13px; letter-spacing: 5px; color: var(--gold); text-transform: uppercase; }
.home-greeting { font-size: 36px; font-weight: 300; line-height: 1.1; margin-top: 6px; }
.gold { color: var(--gold2); }
.home-sub { font-size: 13px; color: var(--text3); margin-top: 6px; }

.home-card {
  margin: 20px 20px 0;
  background: linear-gradient(135deg, #1a2236, #0f1824);
  border: 1px solid rgba(201,168,76,.2);
  border-radius: var(--r2); padding: 22px 22px 18px;
  position: relative; overflow: hidden;
}
.home-card::before {
  content: ''; position: absolute; top: -40px; right: -40px;
  width: 180px; height: 180px;
  background: radial-gradient(circle, rgba(201,168,76,.12), transparent 70%);
  border-radius: 50%;
}
.home-card-label { font-size: 11px; letter-spacing: 3px; color: var(--gold); text-transform: uppercase; }
.home-card-val   { font-size: 28px; font-weight: 400; margin-top: 4px; }
.home-card-sub   { font-size: 12px; color: var(--text3); margin-top: 2px; }
.home-card-badge { position: absolute; right: 22px; top: 50%; transform: translateY(-50%); font-size: 42px; opacity: .6; }

.menu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding: 0 20px; }
.menu-btn {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--r2); padding: 22px 18px;
  cursor: pointer; transition: all .25s;
  display: flex; flex-direction: column; gap: 12px;
  position: relative; overflow: hidden;
}
.menu-btn:active { transform: scale(.96); border-color: rgba(201,168,76,.4); }
.menu-icon  { font-size: 30px; line-height: 1; }
.menu-label { font-size: 14px; font-weight: 500; color: var(--text); }
.menu-desc  { font-size: 11px; color: var(--text3); margin-top: 2px; }
.menu-btn.wide {
  grid-column: 1/-1; flex-direction: row;
  align-items: center; gap: 16px; padding: 18px 22px;
}
.menu-btn.wide .menu-label { font-size: 15px; }
</style>
