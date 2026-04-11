<script setup>
import { computed } from 'vue'

import timeAgo from '@/lib/time-ago.js'

const props = defineProps(['date'])

const date = computed(() => {
  if (props.date) {
    return new Date(`${props.date}Z`)
  }
})

const activityDate = computed(() => {
  if (date.value) {
    return timeAgo(date.value)
  }
  return null
})
</script>

<template>
  <span :title="date?.toLocaleString()" class="activity" v-if="activityDate"
    >active {{ activityDate }}</span
  >
</template>

<style scoped>
.activity {
  font-style: italic;
  color: #888;
  font-size: 0.8666rem;
}
</style>
