<script>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import { useUiStore } from '@/stores/ui.js'
</script>

<script setup>
const props = defineProps(['invalid'])

const uiStore = useUiStore()
const { apiKey } = storeToRefs(uiStore)

const apiKeyProxy = computed({
  get() {
    return apiKey.value
  },
  set(value) {
    uiStore.setApiKey(value)
  },
})
</script>

<template>
  <div>
    <FloatLabel variant="on">
      <Password
        pt:pcinputtext:root:autocomplete="off"
        :feedback="false"
        id="api_key"
        :invalid="!!props.invalid"
        v-model="apiKeyProxy"
        toggleMask
      />
      <label for="api_key">Hardcover API key</label>
    </FloatLabel>
    <span class="error-message" v-if="!!props.invalid">{{ props.invalid }}</span>
  </div>
</template>

<style scoped>
.error-message {
  color: var(--p-red-400);
  height: 1rem;
}
</style>
