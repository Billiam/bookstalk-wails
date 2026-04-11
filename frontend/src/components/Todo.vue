<script setup>
import { ref } from 'vue'

const todo = ref()

const toggle = (event) => {
  todo.value.toggle(event)
}
</script>

<template>
  <Button severity="info" size="small" class="todo-button" label="Todo" @click="toggle" />
  <Popover ref="todo">
    <ul>
      <li>Filter users by activity date</li>
      <li>Consider books in to-read lists</li>
      <li>Sort by rating or by book count</li>
      <li>Option to ignore already-followed users</li>
      <li>Logo/banner/favicon etc</li>
      <li>Data caching/partial updates</li>
      <li>Persist settings</li>
    </ul>
  </Popover>
</template>

<style scoped>
.todo-button {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
}
ul {
  font-size: 0.866rem;
  padding: 0 1rem;
  list-style-position: inside;
}
</style>
