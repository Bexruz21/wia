<!-- ThanksView.vue -->
<template>
  <div class="screen-thanks">
    <div class="thanks-icon">🎉</div>
    <div class="thanks-h serif">Заявка<br>принята!</div>
    <div class="thanks-p">Ваш персональный менеджер уже подбирает лучшие варианты. Ожидайте ответа в течение 30 минут.</div>
    <button class="btn-primary" style="max-width:280px" @click="router.push('/home')">На главную</button>
    <button class="btn-outline" style="margin-top:8px" @click="router.push('/support')">Связаться с менеджером</button>
  </div>
</template>
<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>
<style scoped>
.screen-thanks {
  position: absolute; inset: 0; background: var(--bg);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 40px; text-align: center; gap: 20px;
}
.thanks-icon { font-size: 80px; animation: bounce .6s ease; }
.thanks-h    { font-size: 32px; font-weight: 400; line-height: 1.2; }
.thanks-p    { font-size: 15px; color: var(--text2); line-height: 1.6; max-width: 280px; }
</style>
