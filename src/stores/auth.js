import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/composables/useApi'

export const useAuthStore = defineStore('auth', () => {
  const user    = ref(null)
  const loading = ref(false)

  const isAuth    = computed(() => !!user.value)
  const firstName = computed(() => {
    if (!user.value?.full_name) return 'Путешественник'
    return user.value.full_name.split(' ')[0]
  })

  // Логин через Telegram WebApp — вызывать как можно раньше
  async function loginTelegram(tgUser, lang = 'ru') {
    loading.value = true
    try {
      const { data } = await api.post('/auth/login/', {
        telegram_id: tgUser.id,
        first_name:  tgUser.first_name || '',
        last_name:   tgUser.last_name  || '',
        username:    tgUser.username   || '',
        language:    lang,
      })
      localStorage.setItem('vt_access',  data.access)
      localStorage.setItem('vt_refresh', data.refresh)
      user.value = data.user
      return data.user
    } catch (e) {
      console.error('loginTelegram error:', e)
    } finally {
      loading.value = false
    }
  }

  // Восстановить сессию по сохранённому токену
  async function fetchMe() {
    const token = localStorage.getItem('vt_access')
    if (!token) return null
    try {
      const { data } = await api.get('/auth/me/')
      user.value = data
      return data
    } catch {
      // Токен протух — чистим
      localStorage.removeItem('vt_access')
      localStorage.removeItem('vt_refresh')
      user.value = null
      return null
    }
  }

  // Обновить язык — только если уже залогинены
  async function updateLanguage(lang) {
    if (!user.value) return
    try {
      const { data } = await api.patch('/auth/me/', { language: lang })
      user.value = data
    } catch {}
  }

  function logout() {
    localStorage.removeItem('vt_access')
    localStorage.removeItem('vt_refresh')
    user.value = null
  }

  return { user, loading, isAuth, firstName, loginTelegram, fetchMe, updateLanguage, logout }
})
