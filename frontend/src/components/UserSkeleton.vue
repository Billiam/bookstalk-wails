<script setup></script>
<template>
  <div class="user mb-2">
    <div class="avatar">
      <Skeleton shape="circle" size="3rem" />
    </div>

    <div class="userinfo">
      <Skeleton width="9rem" class="username" />
      <Skeleton width="6rem" />
      <Skeleton width="7rem" />
    </div>

    <Skeleton height="2rem" width="2.2rem" />

    <div></div>
    <div class="book-list">
      <Skeleton v-for="i in 5" :key="i" width="50px" height="75px" class="book" />
    </div>
  </div>
</template>

<style>
.user {
  display: grid;
  align-items: center;
  grid-template-columns: 5rem 2fr 0.5fr 1fr 2fr;
  gap: 1rem;
}
.userinfo {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.avatar {
  width: 5rem;
}
.book-list {
  display: flex;
}
.book {
  margin-right: 0.2rem;
}
</style>
