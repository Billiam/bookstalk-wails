<script setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import { usePreferenceStore } from '@/stores/preference.js'

import Config from '@/components/Config.vue'

const preferenceStore = usePreferenceStore()

const { ranker } = storeToRefs(preferenceStore)

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
  if (value > 0) {
    hue = (value / range.value.max) * 100 + 60
  } else {
    hue = 60 - (value / range.value.min) * 60
  }
  return `hsl(${hue} 59.2% 49.1%)`
}
</script>
<template>
  <Panel>
    <table class="matrix" v-if="ranker.matrix">
      <thead>
        <tr>
          <th></th>
          <th :key="key" v-for="[key] in ranker.matrix">{{ key }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="[key, ranks] in ranker.matrix" :key="key">
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
  //-webkit-text-stroke: 3px #000;
  //-webkit-text-combine: all;
  //paint-order: stroke fill;
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
