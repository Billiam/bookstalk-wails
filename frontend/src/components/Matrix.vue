<script setup>
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

import { usePreferenceStore } from '@/stores/preference.js'
import { useUiStore } from '@/stores/ui.js'

import Config from '@/components/Config.vue'

const preferenceStore = usePreferenceStore()

const { ranker } = storeToRefs(preferenceStore)
const { darkMode } = storeToRefs(useUiStore())

const range = computed(() => {
  if (ranker.value.matrix) {
    const flatValues = ranker.value.matrix.values().reduce((set, row) => {
      set.push(...row.values())
      return set
    }, [])
    return { min: Math.min(...flatValues), max: Math.max(...flatValues) }
  }
  return { min: 0, max: 0 }
})

const colorGrade = (value) => {
  let hue
  const sl = darkMode.value ? '59.2% 49.1' : '85% 65%'
  if (value > 0) {
    hue = (value / range.value.max) * 100 + 60
  } else {
    hue = 60 - (value / range.value.min) * 60
  }
  return `hsl(${hue} ${sl})`
}
const filteredMatrix = computed(() => {
  const r = ranker.value
  if (!r.matrix) {
    return
  }

  if (r.config.includeUnrated) {
    return r.matrix
  }

  return Array.from(r.matrix).reduce((matrix, [key, value]) => {
    if (key !== 'none') {
      matrix.set(key, new Map([...value].filter(([sk]) => sk !== 'none')))
    }
    return matrix
  }, new Map())
})
</script>
<template>
  <Panel>
    <table class="matrix" v-if="filteredMatrix">
      <thead>
        <tr>
          <th></th>
          <th :key="key" v-for="[key] in filteredMatrix">{{ key }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="[key, ranks] in filteredMatrix" :key="key">
          <th>{{ key }}</th>
          <template v-for="[key, value] in ranks" :key="key">
            <td :style="{ backgroundColor: colorGrade(value) }">{{ value.toFixed(1) }}</td>
          </template>
        </tr>
      </tbody>
    </table>
  </Panel>

  <Config />
</template>

<style scoped>
.matrix {
  border-collapse: collapse;
  overflow: hidden;
  table-layout: fixed;
  height: 1px;
  width: 1px;
}

th,
td {
  width: 35px;
  height: 25px;
  overflow: hidden;
  font-size: 0.75rem;
}
td {
  color: #000;

  font-weight: bold;
  text-align: center;
  vertical-align: middle;
}
</style>
