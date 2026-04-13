<script></script>

<script setup>
import { storeToRefs } from 'pinia'
import { inject, watch } from 'vue'

import Ranker from '@/lib/ranker.js'
import { usePreferenceStore } from '@/stores/preference.js'
import { useUiStore } from '@/stores/ui.js'

import Finder from '@/components/Finder.vue'
import Theme from '@/components/Theme.vue'
import Todo from '@/components/Todo.vue'
import UrlDisplay from '@/components/UrlDisplay.vue'

const uiStore = useUiStore()
const preferenceStore = usePreferenceStore()
const { ranker, matrixConfig } = storeToRefs(preferenceStore)
const { apiKey, darkMode, user, userDateFilter } = storeToRefs(uiStore)

const rankInstance = new Ranker()
// const pinia = inject('pinia')

rankInstance.setConfig(matrixConfig.value)
ranker.value = rankInstance

watch(
  matrixConfig,
  () => {
    ranker.value.setConfig(matrixConfig.value)
  },
  { deep: true },
)

preferenceStore.$subscribe((mutation, state) => {
  localStorage.setItem('rating-preferences', JSON.stringify(state.matrixConfig))
})
Object.entries({ apiKey, user, userDateFilter, darkMode }).forEach(([key, item]) => {
  watch(item, () => localStorage.setItem(key, JSON.stringify(item.value)))
})
</script>

<template>
  <Theme></Theme>
  <Finder></Finder>
  <Todo></Todo>
  <UrlDisplay></UrlDisplay>
</template>

<style>
@import './assets/base.css';
@import 'primeicons/primeicons.css';
body {
  display: flex;
  flex-direction: column;
  align-items: center;
}
#app {
  width: 100%;
}
</style>
