<script></script>

<script setup>
import { storeToRefs } from 'pinia'
import { watch } from 'vue'

import Ranker from '@/lib/ranker.js'
import { usePreferenceStore } from '@/stores/preference.js'

import Finder from '@/components/Finder.vue'

const preferenceStore = usePreferenceStore()
const { ranker, matrixConfig } = storeToRefs(preferenceStore)

const rankInstance = new Ranker()

rankInstance.setConfig(matrixConfig.value)
ranker.value = rankInstance

watch(
  matrixConfig,
  () => {
    ranker.value.setConfig(matrixConfig.value)
  },
  { deep: true },
)
</script>

<template>
  <Finder></Finder>
  <Todo></Todo>
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
