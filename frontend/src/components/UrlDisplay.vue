<script setup>
import { debounce } from 'perfect-debounce'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'

import { useUiStore } from '@/stores/ui.js'

const { activeUrl } = storeToRefs(useUiStore())
const urlVisible = ref(false)
const urlValue = ref()

let timeout
const debouncedUpdate = debounce((newValue) => {
  urlValue.value = newValue
}, 250)

watch(
  activeUrl,
  (newValue) => {
    debouncedUpdate(newValue)
    if (newValue !== null) {
      debouncedUpdate.flush()
    }
  },
  // (newValue, oldValue) => {
  //   clearTimeout(timeout)
  //   if (newValue === null) {
  //     timeout = setTimeout(() => {
  //       urlValue.value = newValue
  //     }, 250)
  //   } else {
  //     urlValue.value = newValue
  //   }
  // },
  // debounce(() => {
  //   urlValue.value = activeUrl.value
  //   urlVisible.value = !!activeUrl.value
  // }, 200),
)
</script>

<template>
  <Transition>
    <div class="url" v-if="urlValue">{{ urlValue }}</div>
  </Transition>
</template>

<style scoped>
.url {
  transition: opacity 0.3s ease;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
}
.url {
  position: fixed;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.8);
  padding: 0.1rem 0.4rem;
  font-size: 0.9rem;
  border-top-right-radius: 3px;
  pointer-events: none;
}
</style>
