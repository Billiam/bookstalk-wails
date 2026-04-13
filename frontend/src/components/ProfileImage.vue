<script setup>
import Link from '@/components/Link.vue'

const props = defineProps(['user'])
</script>
<template>
  <Link :href="`https://hardcover.app/@${props.user.username}`">
    <Avatar
      shape="circle"
      :image="`https://production-img.hardcover.app/enlarge?url=${props.user.cached_image.url}&width=60&height=60&type=webp`"
      size="large"
      :pt="{ image: { loading: 'lazy' } }"
    />
  </Link>
</template>

<style scoped>
:deep(.p-avatar) {
  box-shadow:
    0px 0.5px 0.6px #00000066,
    0.1px 1.5px 1.7px -0.8px #00000066,
    0.1px 3.7px 4.2px -1.7px #00000066,
    0.3px 9px 10.1px -2.5px #00000066;
}
</style>
