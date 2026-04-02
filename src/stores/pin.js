import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const usePinStore = defineStore('pin', () => {
  const isOpen       = ref(false)
  const mode         = ref('verify') // 'setup' | 'confirm' | 'verify'
  const buffer       = ref('')
  const confirmBuf   = ref('')
  const errorMsg     = ref('')
  const shaking      = ref(false)
  const attempts     = ref(0)

  const savedPin = ref(localStorage.getItem('vt_pin') || '')

  function openSafe() {
    buffer.value  = ''
    errorMsg.value = ''
    mode.value = savedPin.value ? 'verify' : 'setup'
    isOpen.value = true
  }

  function close() {
    isOpen.value  = false
    buffer.value  = ''
    confirmBuf.value = ''
    errorMsg.value = ''
  }

  function pressKey(digit) {
    if (buffer.value.length >= 4) return
    buffer.value += digit
    if (buffer.value.length === 4) {
      setTimeout(processPin, 150)
    }
  }

  function deleteLast() {
    buffer.value = buffer.value.slice(0, -1)
  }

  function shake(msg) {
    errorMsg.value = msg
    shaking.value = true
    setTimeout(() => {
      shaking.value = false
      buffer.value  = ''
    }, 500)
    if (navigator.vibrate) navigator.vibrate([40, 30, 40])
  }

  async function processPin() {
    if (mode.value === 'setup') {
      confirmBuf.value = buffer.value
      buffer.value = ''
      mode.value = 'confirm'
      errorMsg.value = ''
    } else if (mode.value === 'confirm') {
      if (buffer.value === confirmBuf.value) {
        savedPin.value = buffer.value
        localStorage.setItem('vt_pin', savedPin.value)
        close()
        // Navigate to safe
        const { default: router } = await import('@/router')
        router.push({ name: 'safe' })
      } else {
        shake('PIN-коды не совпадают. Попробуйте снова.')
        mode.value = 'setup'
        confirmBuf.value = ''
      }
    } else if (mode.value === 'verify') {
      if (buffer.value === savedPin.value) {
        attempts.value = 0
        close()
        const { default: router } = await import('@/router')
        router.push({ name: 'safe' })
      } else {
        attempts.value++
        const left = 5 - attempts.value
        if (attempts.value >= 5) {
          shake('Слишком много попыток. Подождите 30 сек.')
          setTimeout(() => { attempts.value = 0; errorMsg.value = '' }, 30000)
        } else {
          shake(`Неверный PIN. Осталось попыток: ${left}`)
        }
      }
    }
  }

  const modeTitle = () => {
    if (mode.value === 'setup')   return 'Создайте PIN-код'
    if (mode.value === 'confirm') return 'Повторите PIN-код'
    return 'Введите PIN-код'
  }
  const modeSub = () => {
    if (mode.value === 'setup')   return 'Придумайте 4-значный код для сейфа'
    if (mode.value === 'confirm') return 'Подтвердите ваш PIN-код'
    return 'Доступ к вашему сейфу'
  }
  const modeIcon = () => {
    if (mode.value === 'setup')   return '🔑'
    if (mode.value === 'confirm') return '✅'
    return '🔐'
  }

  return {
    isOpen, mode, buffer, errorMsg, shaking, attempts,
    openSafe, close, pressKey, deleteLast,
    modeTitle, modeSub, modeIcon,
  }
})
