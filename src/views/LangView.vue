<template>
  <div class="screen-lang">
    <div class="lang-plane">✈️</div>
    <div class="lang-logo">
      <div class="brand serif">VOYAGE TRIP</div>
      <div class="sub">Premium Travel Concierge</div>
    </div>
    <div class="lang-title">Выберите язык</div>
    <div class="lang-btns">
      <button
        v-for="l in langs" :key="l.code"
        class="lang-btn"
        :class="{ sel: selected === l.code }"
        @click="choose(l.code)"
      >{{ l.label }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { haptic } from '@/composables/useUtils'

const router   = useRouter()
const auth     = useAuthStore()
const selected = ref('ru')

const langs = [
  { code: 'ru', label: 'RUS' },
  { code: 'en', label: 'ENG' },
  { code: 'uz', label: 'UZB' },
]

// При открытии страницы — сразу логиним через Telegram (получаем токен)
// Язык выберем позже, поэтому updateLanguage вызываем ПОСЛЕ loginTelegram
onMounted(async () => {
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
  if (tgUser?.id && !auth.isAuth) {
    await auth.loginTelegram(tgUser, 'ru')
  }
})

async function choose(code) {
  haptic()
  selected.value = code

  // Если ещё не залогинены (нет Telegram WebApp или оффлайн)
  if (!auth.isAuth) {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
    if (tgUser?.id) {
      await auth.loginTelegram(tgUser, code)
    }
    // Без Telegram просто сохраняем язык локально и идём дальше
    localStorage.setItem('vt_lang', code)
  } else {
    // Уже залогинены — обновляем язык (теперь токен есть)
    await auth.updateLanguage(code)
  }

  setTimeout(() => router.push('/onboard'), 300)
}
</script>

<style scoped>
.screen-lang {
  position: absolute; inset: 0;
  background: var(--bg);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 24px;
}
.lang-plane { font-size: 64px; filter: drop-shadow(0 0 24px rgba(201,168,76,.4)); }
.lang-logo  { text-align: center; }
.brand      { font-size: 36px; font-weight: 300; letter-spacing: 8px; color: var(--gold2); }
.sub        { font-size: 11px; letter-spacing: 4px; color: var(--text3); text-transform: uppercase; margin-top: 4px; }
.lang-title { font-size: 18px; color: var(--text2); letter-spacing: 1px; }
.lang-btns  { display: flex; gap: 14px; }
.lang-btn {
  padding: 14px 28px; border: 1px solid var(--border);
  border-radius: 50px; background: var(--card);
  color: var(--text); font-family: 'DM Sans', sans-serif;
  font-size: 15px; font-weight: 500; cursor: pointer;
  transition: all .25s; letter-spacing: 1px;
}
.lang-btn.sel,
.lang-btn:hover { background: var(--gold); border-color: var(--gold); color: #000; transform: scale(1.05); }
</style>
