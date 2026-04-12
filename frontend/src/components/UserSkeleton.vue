<script setup></script>
<template>
  <div class="user mb-2">
    <div class="avatar">
      <Skeleton shape="circle" size="3rem" />
    </div>
    <div>
      <Skeleton width="12rem" class="mb-1 username" />
      <Skeleton width="6rem" />
    </div>

    <Skeleton height="2rem" width="3rem" />
  </div>
</template>

<style>
.user {
  display: grid;
  align-items: center;
  grid-template-columns: 5rem 2fr 0.5fr 1fr 1fr;
  gap: 1rem;
}
.username {
  margin-bottom: 0.5rem;
}
.avatar {
  width: 5rem;
}
</style>
