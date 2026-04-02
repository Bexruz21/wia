import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/composables/useApi'

export const useCountriesStore = defineStore('countries', () => {
  const list    = ref([])
  const current = ref(null)
  const loading = ref(false)

  async function fetchList() {
    if (list.value.length) return
    loading.value = true
    try {
      const { data } = await api.get('/countries/')
      list.value = data.results || data
    } catch (e) {
      console.warn('Countries fetch failed', e.message)
    } finally {
      loading.value = false
    }
  }

  async function fetchDetail(id) {
    loading.value = true
    try {
      const { data } = await api.get(`/countries/${id}/`)
      current.value = data
    } finally {
      loading.value = false
    }
  }

  function getById(id) {
    return list.value.find(c => c.id === id)
  }

  return { list, current, loading, fetchList, fetchDetail, getById }
})
