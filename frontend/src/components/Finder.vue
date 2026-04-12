<script setup>
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

import { useUserMatch } from '@/lib/user-match.js'
import { usePreferenceStore } from '@/stores/preference.js'
import { useUiStore } from '@/stores/ui.js'

import ApiKey from '@/components/ApiKey.vue'
import Matrix from '@/components/Matrix.vue'
import Me from '@/components/Me.vue'
import User from '@/components/User.vue'
import UserSkeleton from '@/components/UserSkeleton.vue'

const uiStore = useUiStore()
const { apiKey, user, userDateFilter, loadingData, darkMode } = storeToRefs(uiStore)

const preferenceStore = usePreferenceStore()
const { ranker } = storeToRefs(preferenceStore)

const advancedVisible = ref(false)

const {
  apiKeyMessage,
  userList,
  status,
  totalRequests,
  completedRequests,

  fetchRatings,
} = useUserMatch(ranker)

const now = new Date()
const hardcoverStartDate = new Date(2021, 9, 2)

const toggleDarkModeIcon = computed(() => {
  return darkMode.value ? 'pi pi-moon' : 'pi pi-sun'
})
const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
}
</script>

<template>
  <div class="menu">
    <div class="menu-content">
      <div class="logotype"><span class="book">Book</span><span class="stalk">Stalk</span></div>

      <form @submit.prevent="fetchRatings">
        <div class="flex flex-column">
          <div class="flex">
            <ApiKey class="mr-1" :invalid="apiKeyMessage"></ApiKey>
            <Button
              severity="primary"
              type="submit"
              size="small"
              label="Fetch"
              :disabled="!apiKey || apiKey?.length < 300"
            />
          </div>
        </div>
      </form>

      <Button
        @click="advancedVisible = true"
        severity="secondary"
        size="small"
        label="Advanced"
        icon="pi pi-cog"
      />

      <Button :icon="toggleDarkModeIcon" size="small" @click="toggleDarkMode()" />
    </div>
  </div>

  <div class="main">
    <Badge class="mb-1" severity="secondary" :value="status" v-if="status" />
    <ProgressBar
      class="mb-1"
      v-if="loadingData"
      :mode="totalRequests == null ? 'indeterminate' : 'determinate'"
      :value="Math.min(100, (completedRequests / totalRequests) * 100)"
    >
      {{ completedRequests }}/{{ totalRequests }}
    </ProgressBar>

    <Me></Me>

    <Drawer
      class="advanced-drawer"
      v-model:visible="advancedVisible"
      header="Settings"
      position="right"
    >
      <Matrix />
    </Drawer>

    <Panel>
      <DataView :value="userList" paginator :alwaysShowPaginator="false" :rows="10">
        <template #header>
          <FloatLabel>
            <DatePicker
              v-model="userDateFilter"
              selectionMode="range"
              hideOnRangeSelection
              :maxDate="now"
              :minDate="hardcoverStartDate"
              showButtonBar
              iconDisplay="input"
              showIcon
              inputId="activity_date"
              size="small"
            />
            <label for="activity_date">Filter by activity date</label>
          </FloatLabel>
        </template>
        <template #empty>
          <ol class="user-list" v-if="loadingData">
            <li v-for="i in 10" :key="i">
              <UserSkeleton />
            </li>
          </ol>
        </template>
        <template #list="slotProps">
          <ol class="user-list">
            <li v-for="(otherUser, index) in slotProps.items" :key="index">
              <User :user="otherUser" :me="user" />
            </li>
          </ol>
        </template>
      </DataView>
    </Panel>
  </div>
</template>

<style>
.advanced-drawer {
  width: 38rem !important;
}
</style>

<style scoped>
.user-list {
  list-style-type: none;
  margin: 0 auto;
  padding: 0;
  width: 600px;

  li {
    margin-bottom: 2rem;
  }
}

.menu {
  background-color: var(--p-surface-0);
  //background-color: var(--p-teal-100);
  border-bottom: 1px solid var(--p-primary-200);
  padding-top: 0.5rem;
}
.main,
.menu-content {
  padding: 1rem;
  max-width: 55rem;
  margin: 0 auto;
}
.menu-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logotype {
  font-size: 2rem;
  font-family: serif;
  .book {
    color: var(--p-primary-950);
  }
  .stalk {
    color: var(--p-primary-color);
  }
}

.darkmode {
  .menu {
    background-color: var(--p-surface-800);
    border-bottom-color: var(--p-primary-800);
  }
  .logotype {
    .book {
      color: var(--p-primary-50);
    }
  }
}
:deep(.p-dataview-header) {
  margin-bottom: 2rem;
}
:deep(.p-panel-header) {
  padding: 0.5rem;
}
</style>
