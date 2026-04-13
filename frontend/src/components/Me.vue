<script setup>
import { storeToRefs } from 'pinia'

import { useUiStore } from '@/stores/ui.js'

import Activity from '@/components/Activity.vue'
import Link from '@/components/Link.vue'
import ProfileImage from '@/components/ProfileImage.vue'

const uiStore = useUiStore()
const { user } = storeToRefs(uiStore)
</script>

<template>
  <div class="user mb-1" v-if="user">
    <ProfileImage :user="user" />

    <div>
      <Link :href="`https://hardcover.app/@${user.username}`">
        <span class="username">@{{ user.username }}</span>
      </Link>

      <Link :href="`https://hardcover.app/@${user.username}`" class="name">
        <span>{{ user.name }}</span>
      </Link>
      <Activity :date="user.last_activity_at" />
    </div>
  </div>
</template>

<style scoped>
.name {
  display: block;
  color: var(--p-text-color);
  font-weight: bold;
  text-decoration: none;
}
</style>
