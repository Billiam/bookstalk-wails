import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    apiKey: null,
    user: null,
    userDateFilter: null,

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
