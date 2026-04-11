import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    apiKey: null,
    user: null,
  }),

  actions: {
    setApiKey(apiKey) {
      this.apiKey = apiKey
      this.user = null
    },
  },
})
