<template>
  <div class="pin-overlay" :class="{ open: pin.isOpen }">
    <div class="pin-lock-icon">{{ pin.modeIcon() }}</div>
    <div class="pin-title serif">{{ pin.modeTitle() }}</div>
    <div class="pin-sub">{{ pin.modeSub() }}</div>

    <div class="pin-dots">
      <div
        v-for="i in 4" :key="i"
        class="pin-dot"
        :class="{
          filled: pin.buffer.length >= i,
          error:  pin.shaking,
          'pin-shake': pin.shaking
        }"
      />
    </div>

    <div class="pin-error-msg">{{ pin.errorMsg }}</div>

    <div class="pin-numpad">
      <div v-for="key in numpad" :key="key.val"
        class="pin-key"
        :class="{ empty: key.empty, del: key.del }"
        @click="handleKey(key)"
      >
        {{ key.label }}
      </div>
    </div>

    <button class="pin-back-btn" @click="pin.close()">← Назад</button>
  </div>
</template>

<script setup>
import { usePinStore } from '@/stores/pin'
import { haptic } from '@/composables/useUtils'

const pin = usePinStore()

const numpad = [
  { val:'1',label:'1' },{ val:'2',label:'2' },{ val:'3',label:'3' },
  { val:'4',label:'4' },{ val:'5',label:'5' },{ val:'6',label:'6' },
  { val:'7',label:'7' },{ val:'8',label:'8' },{ val:'9',label:'9' },
  { empty:true, label:'' },
  { val:'0',label:'0' },
  { del:true,  label:'⌫' },
]

function handleKey(key) {
  if (key.empty) return
  haptic()
  if (key.del) { pin.deleteLast(); return }
  pin.pressKey(key.val)
}
</script>

<style scoped>
.pin-overlay {
  position: fixed; inset: 0;
  background: var(--bg);
  z-index: 800;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 0;
  opacity: 0; pointer-events: none;
  transition: opacity .3s;
}
.pin-overlay.open { opacity: 1; pointer-events: all; }

.pin-lock-icon { font-size: 56px; margin-bottom: 20px; filter: drop-shadow(0 0 24px rgba(201,168,76,.4)); }
.pin-title { font-size: 28px; font-weight: 400; color: var(--text); margin-bottom: 6px; text-align: center; }
.pin-sub   { font-size: 14px; color: var(--text3); margin-bottom: 36px; text-align: center; }

.pin-dots  { display: flex; gap: 18px; margin-bottom: 12px; }

.pin-error-msg {
  font-size: 13px; color: var(--danger);
  height: 18px; margin-bottom: 28px;
  text-align: center; padding: 0 24px;
}

.pin-numpad {
  display: grid; grid-template-columns: repeat(3, 80px);
  gap: 14px;
}

.pin-key.empty { background: transparent; border-color: transparent; cursor: default; }
.pin-key.del:active { background: rgba(224,92,92,.1); border-color: rgba(224,92,92,.3); color: var(--danger); }

.pin-back-btn {
  margin-top: 28px; font-size: 13px; color: var(--text3);
  cursor: pointer; padding: 8px 16px;
  border: none; background: none;
}
</style>
