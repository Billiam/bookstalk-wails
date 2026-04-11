<script setup>
const props = defineProps(['href'])
</script>

<template>
  <a :href="props.href" :title="props.href" _target="blank"><slot></slot></a>
</template>
