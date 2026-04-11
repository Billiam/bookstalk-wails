<script setup>
import { computed } from 'vue'

import Activity from '@/components/Activity.vue'
import ProfileImage from '@/components/ProfileImage.vue'

const props = defineProps({
  user: {
    required: true,
  },
  me: {},
})
const followingMe = computed(() => {
  return props.me && props.me.followedBy.has(props.user.id)
})
const followedByMe = computed(() => {
  return props.me && props.me.following.has(props.user.id)
})
</script>
<template>
  <div class="user mb-2">
    <div class="avatar">
      <OverlayBadge :value="user.score" severity="primary" class="mr-2" size="small">
        <ProfileImage :user="user" />
      </OverlayBadge>
    </div>
    <div>
      <a :href="`https://hardcover.app/@${user.username}`" target="_blank" class="mr-1">
        <span class="username">@{{ user.username }}</span>
      </a>

      <div>
        <Activity :date="user.last_activity_at" />
      </div>
    </div>
    <a
      v-tooltip.top="`${user.count} shared reads`"
      class="mr-1"
      :href="`https://hardcover.app/@${user.username}/compare`"
      target="_blank"
    >
      <Tag severity="secondary" :value="user.count" icon="pi pi-book" />
    </a>
    <Badge class="mr-1" v-if="followingMe" severity="secondary" value="follows you" />
    <Badge v-if="followedByMe" value="following" />
  </div>
</template>

<style>
.user {
  display: grid;
  align-items: center;
  grid-template-columns: 5rem 2fr 0.5fr 1fr 1fr;
}
.avatar {
  width: 5rem;
}
.shared-reads {
}
</style>
