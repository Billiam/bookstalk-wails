import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    apiKey: null,
    user: null,
    userDateFilter: null,
    darkMode: !window.matchMedia || window.matchMedia('(prefers-color-scheme: dark)'),

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
