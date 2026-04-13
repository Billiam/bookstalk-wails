<script setup>
import UserBook from '@/components/UserBook.vue'

const props = defineProps({
  books: {
    required: true,
  },
})
</script>
<template>
  <ol>
    <li v-for="book in books" :key="book.id">
      <UserBook :book="book" />
    </li>
  </ol>
</template>
<style scoped>
ol {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  position: relative;
}
li {
  margin: 0;
  padding: 0;
}
</style>
