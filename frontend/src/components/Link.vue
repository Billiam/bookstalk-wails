<script setup>
import { storeToRefs } from 'pinia'

import { useUiStore } from '@/stores/ui.js'

const props = defineProps(['href'])

const { activeUrl } = storeToRefs(useUiStore())
</script>

<template>
  <a
    :href="props.href"
    _target="blank"
    @mouseover="activeUrl = props.href"
    @mouseout="activeUrl = null"
    ><slot></slot
  ></a>
</template>
