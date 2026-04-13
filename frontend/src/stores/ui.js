import { defineStore } from 'pinia'

import getLocalstorage from '@/stores/get-localstorage'

const getStoredDate = () => {
  const storedValue = getLocalstorage('userDateFilter', null)
  if (storedValue) {
    return storedValue.map((val) => (val ? new Date(val) : null))
  }
  return null
}
export const useUiStore = defineStore('ui', {
  state: () => ({
    apiKey: getLocalstorage('apiKey', null),
    user: getLocalstorage('user', null),
    userDateFilter: getStoredDate(),
    darkMode: getLocalstorage(
      'darkMode',
      !window.matchMedia || window.matchMedia('(prefers-color-scheme: dark)'),
    ),

    loadingUsers: false,
    loadingRatings: false,
  }),

  getters: {
    loadingData: (state) => state.loadingUsers || state.loadingRatings,
  },

  actions: {
    setApiKey(apiKey) {
      this.apiKey = apiKey
      this.user = null
    },
  },
})
