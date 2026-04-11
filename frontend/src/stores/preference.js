import { defineStore } from 'pinia'

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
}

export const usePreferenceStore = defineStore('preference', {
  state: () => ({
    matrixConfig: {
      ...defaultSettings,
    },
    ranker: undefined,
  }),
  actions: {
    resetSetting(name) {
      this.matrixConfig[name] = defaultSettings[name]
    },
  },
})
