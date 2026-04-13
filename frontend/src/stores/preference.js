import { defineStore } from 'pinia'

import getLocalstorage from '@/stores/get-localstorage'

const defaultSettings = {
  dnfRanking: 0.5,
  treatDnfAsRanked: true,
  noRankingWeight: 0.5,
  posRange: 4,
  negRange: 5,
  posModifier: 2,
  negModifier: -2,
  matchingNegModifier: 1,
  posBonus: 0.75,
  negPenalty: 0,
  ignoreFriends: false,
  includeUnrated: false,
  myBookCutoff: null,
  othersBookCutoff: null,
}

export const usePreferenceStore = defineStore('preference', {
  state: () => {
    const storeDefaults = getLocalstorage('rating-preferences', defaultSettings)

    ;['myBookCutoff', 'othersBookCutoff'].forEach((dateKey) => {
      if (storeDefaults[dateKey] != null) {
        try {
          storeDefaults[dateKey] = new Date(storeDefaults[dateKey])
        } catch {
          storeDefaults[dateKey] = null
        }
      }
    })

    return {
      matrixConfig: {
        ...storeDefaults,
      },
      ranker: undefined,
    }
  },
  actions: {
    resetSetting(name) {
      this.matrixConfig[name] = defaultSettings[name]
    },
  },
})
