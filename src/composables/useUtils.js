import { ref } from 'vue'

// ── HAPTIC ──────────────────────────────────────────────
export function haptic() {
  try { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light') } catch {}
  if (navigator.vibrate) navigator.vibrate(10)
}

// ── TOAST ───────────────────────────────────────────────
const toastMsg  = ref('')
const toastShow = ref(false)
let toastTimer

export function useToast() {
  function showToast(msg) {
    toastMsg.value  = msg
    toastShow.value = true
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => { toastShow.value = false }, 2500)
  }
  return { toastMsg, toastShow, showToast }
}
