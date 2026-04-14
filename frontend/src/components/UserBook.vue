<script setup>
import Alea from 'alea'
import { computed } from 'vue'

import Link from '@/components/Link.vue'

const props = defineProps({
  book: {
    required: true,
  },
})

const hasImage = computed(() => {
  return !!props.book.book.cached_image.url
})

const truncatedTitle = computed(() => {
  return !hasImage.value && props.book.book.title.split(':', 1)[0]
})

const image = computed(() => {
  if (hasImage.value) {
    return `https://production-img.hardcover.app/enlarge?url=${props.book.book.cached_image.url}&width=100&height=150&type=webp`
  }
  const prng = new Alea(props.book.book.id)
  const coverId = Math.floor(prng() * 9) + 1
  return `https://production-img.hardcover.app/enlarge?url=https://assets.hardcover.app/static/covers/cover${coverId}.webp&width=100&height=150&type=webp`
})
const bookDescription = computed(
  () =>
    `${props.book.book.title}${props.book.book.release_year ? ` (${props.book.book.release_year})` : ''}`,
)
const bookUrl = computed(() => `https://hardcover.app/books/${props.book.book.slug}`)
</script>
<template>
  <div class="book">
    <Link
      :href="bookUrl"
      class="booklink"
      v-tooltip.top="{ value: bookDescription, showDelay: 150 }"
    >
      <img :src="image" loading="lazy" class="cover" />
      <p class="title" v-if="!hasImage">{{ truncatedTitle }}</p>
    </Link>
  </div>
</template>
<style scoped>
.book {
  position: relative;
  margin-right: 0.2rem;
  width: 50px;
  height: 75px;

  &:hover {
    .booklink {
      z-index: 10;
      width: 100px;
      height: 150px;
      top: -37.5px;
      left: -25px;
    }
    .title {
      font-size: 1rem;
    }
  }
}
.booklink {
  position: absolute;
  top: 0;
  left: 0;
  width: 50px;
  height: 75px;
  display: block;
  overflow: hidden;
  transition: all 0.1s ease;
}
.cover {
  display: block;
  width: 100%;
  border-radius: 0.3rem;
}
.title {
  color: #fff;
  text-decoration: none;
  font-family: serif;
  position: absolute;
  bottom: 0;
  font-size: 0.7rem;
  line-height: 1;
  padding: 2px;
  margin: 0;
}
</style>
