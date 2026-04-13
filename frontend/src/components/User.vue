<script setup>
import { computed } from 'vue'

import Activity from '@/components/Activity.vue'
import Link from '@/components/Link.vue'
import ProfileImage from '@/components/ProfileImage.vue'
import UserBooks from '@/components/UserBooks.vue'

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
      <Link :href="`https://hardcover.app/@${user.username}`" class="mr-1">
        <span class="username">@{{ user.username }}</span>
      </Link>
      <div class="name">{{ user.name }}</div>
      <Activity :date="user.last_activity_at" />
    </div>
    <Link
      v-tooltip.top="`${user.count} shared read${user.count === 1 ? '' : 's'}`"
      class="mr-1"
      :href="`https://hardcover.app/@${user.username}/compare`"
      target="_blank"
    >
      <Tag severity="secondary" :value="user.count" icon="pi pi-book" />
    </Link>
    <div>
      <Badge class="mr-1" v-if="followingMe" severity="secondary" value="follows you" />
      <Badge v-if="followedByMe" value="following" />
    </div>
    <div>
      <UserBooks :books="user.user_books" />
    </div>
  </div>
</template>

<style scoped>
.user {
  display: grid;
  align-items: center;
  grid-template-columns: 5rem 2fr 0.5fr 1fr 2fr;
}
.avatar {
  width: 5rem;
}
.shared-reads {
}
</style>
