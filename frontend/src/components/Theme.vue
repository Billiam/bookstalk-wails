<script setup>
import { storeToRefs } from 'pinia'
import { watch } from 'vue'

import { useUiStore } from '@/stores/ui.js'

const { darkMode } = storeToRefs(useUiStore())

watch(
  darkMode,
  () => {
    document.documentElement.classList.toggle('darkmode', darkMode.value)
  },
  { immediate: true },
)
</script>
<template></template>
