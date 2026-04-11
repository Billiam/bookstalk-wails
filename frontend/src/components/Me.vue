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
  <div class="user" v-if="user">
    <ProfileImage :user="user" />
    <div>
      <Link :href="`https://hardcover.app/@${user.username}`" class="mr-1">
        <span class="username">@{{ user.username }}</span>
      </Link>
      <div>
        <Activity :date="user.last_activity_at" />
      </div>
    </div>
  </div>
</template>
