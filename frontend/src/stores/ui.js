import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    apiKey: null,
    user: null,
    loadingRatings: false,
  }),

  actions: {
    setApiKey(apiKey) {
      this.apiKey = apiKey
      this.user = null
    },
  },
})
