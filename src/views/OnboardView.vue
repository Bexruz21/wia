<template>
  <div class="ob-wrap">
    <div class="ob-slides">
      <transition-group name="slide">
        <div v-for="(slide, i) in slides" :key="slide.tag"
          v-show="i === current"
          class="ob-slide"
        >
          <div class="ob-tag">{{ slide.tag }}</div>
          <div class="ob-emoji" v-if="slide.emoji">{{ slide.emoji }}</div>
          <div class="safe-anim" v-if="slide.safe">🔐</div>
          <div class="vt-badge" v-if="slide.badge">VT</div>
          <div class="ob-h serif">{{ slide.title }}</div>
          <div class="ob-p">{{ slide.desc }}</div>
        </div>
      </transition-group>
    </div>

    <div class="ob-bottom">
      <div class="ob-dots">
        <div v-for="(_, i) in slides" :key="i" class="ob-dot" :class="{ active: i === current }" />
      </div>
      <button class="btn-primary" @click="next">
        {{ current < slides.length - 1 ? 'Далее' : 'Начать ✈️' }}
      </button>
      <button class="ob-skip" @click="goHome">Пропустить</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { haptic } from '@/composables/useUtils'

const router  = useRouter()
const auth    = useAuthStore()
const current = ref(0)

const slides = [
  { tag: 'Добро пожаловать', emoji: '✈️', title: 'Твой личный консьерж в кармане', desc: 'Все документы и секреты путешествия в одном месте' },
  { tag: 'Безопасность',     safe: true,   title: 'Безопасность прежде всего',      desc: 'Храни документы надёжно — даже без интернета они всегда с тобой' },
  { tag: 'AI-помощник',      emoji: '🤖',  title: 'Спрашивай о чём угодно',         desc: 'Такси, еда, правила, фразы — всё об интересующей стране' },
  { tag: 'Старт',            badge: true,  title: 'Готов к путешествию?',            desc: 'Получите доступ к вашему персональному консьержу' },
]

function next() {
  haptic()
  if (current.value < slides.length - 1) { current.value++; return }
  goHome()
}

async function goHome() {
  haptic()

  // Если токена нет — логиним через Telegram
  if (!auth.isAuth) {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
    if (tgUser?.id) {
      const lang = localStorage.getItem('vt_lang') || 'ru'
      await auth.loginTelegram(tgUser, lang)
    }
  }

  router.push('/home')
}
</script>

<style scoped>
.ob-wrap {
  position: absolute; inset: 0;
  background: var(--bg);
  display: flex; flex-direction: column;
}
.ob-slides { flex: 1; position: relative; overflow: hidden; }
.ob-slide {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 32px 28px; gap: 20px;
}
.ob-tag   { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); }
.ob-emoji { font-size: 80px; line-height: 1; filter: drop-shadow(0 0 32px rgba(201,168,76,.5)); animation: float 3s ease-in-out infinite; }
.ob-h     { font-size: 32px; font-weight: 400; text-align: center; line-height: 1.2; color: var(--text); }
.ob-p     { font-size: 15px; line-height: 1.6; text-align: center; color: var(--text2); max-width: 300px; }

.safe-anim {
  width: 120px; height: 100px;
  background: linear-gradient(135deg, var(--bg3), var(--bg2));
  border: 1px solid var(--border); border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
  font-size: 56px;
  animation: pulse-safe 2s ease-in-out infinite;
}
.vt-badge {
  width: 80px; height: 80px; border-radius: 50%;
  background: var(--gold-glow); border: 2px solid rgba(201,168,76,.4);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Cormorant Garamond', serif;
  font-size: 11px; letter-spacing: 2px; color: var(--gold); text-transform: uppercase;
}
.ob-bottom {
  padding: 24px 28px 40px;
  display: flex; flex-direction: column; gap: 16px; align-items: center;
}
.ob-dots { display: flex; gap: 8px; }
.ob-dot  { width: 6px; height: 6px; border-radius: 3px; background: var(--border); transition: all .3s; }
.ob-dot.active { width: 24px; background: var(--gold); }
.ob-skip { font-size: 13px; color: var(--text3); cursor: pointer; padding: 4px; border: none; background: none; }

.slide-enter-active, .slide-leave-active { transition: all .4s ease; }
.slide-enter-from { opacity: 0; transform: translateX(60px); }
.slide-leave-to   { opacity: 0; transform: translateX(-60px); }
</style>
