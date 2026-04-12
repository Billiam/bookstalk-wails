import { debounce } from 'perfect-debounce'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'

import binPack from '@/lib/bin.js'
import HardcoverApi from '@/lib/hardcover-api.js'
import { useUiStore } from '@/stores/ui.js'

export const useUserMatch = (ranker) => {
  const uiStore = useUiStore()
  const { apiKey, user, loadingRatings, loadingUsers, userDateFilter } = storeToRefs(uiStore)

  const waiting = ref(false)

  const myBooks = ref([])
  const otherUserBooks = ref([])
  const userList = ref([])
  const status = ref('')
  const apiKeyMessage = ref('')

  const totalRequests = ref(null)
  const completedRequests = ref(0)

  const client = computed(() => {
    if (apiKey.value) {
      return HardcoverApi(
        apiKey.value,
        (val) => {
          waiting.value = val
        },
        () => {
          completedRequests.value++
        },
      )
    }
    return null
  })

  const updateRankings = async () => {
    if (!client.value) {
      return
    }
    loadingUsers.value = true
    const userLimit = 200

    const dateFilter = userDateFilter.value
    const allUsers = ranker.value.rankUsers(myBooks.value, otherUserBooks.value)
    const topUsers = []
    // TODO: maintain user data list

    while (topUsers.length < userLimit && allUsers.length > 0) {
      const batchUsers = allUsers.splice(0, 1000)
      const batchUserData = await client.value.fetchUsers(
        batchUsers.map((user) => user.id),
        dateFilter,
      )

      batchUsers.every((user) => {
        const lookupData = batchUserData[user.id]
        if (topUsers.length === userLimit) {
          return
        }
        if (lookupData) {
          topUsers.push({ ...user, ...lookupData })
        }
        return true
      })
    }

    userList.value = Object.freeze(topUsers)
    loadingUsers.value = false
  }

  const fetchRatings = async () => {
    userList.value = []
    status.value = 'loading user data'
    apiKeyMessage.value = ''
    loadingRatings.value = true
    completedRequests.value = 0
    totalRequests.value = null
    try {
      let myUserData
      try {
        myUserData = await client.value.fetchMe()
      } catch (e) {
        console.error(e)
        apiKeyMessage.value = 'Request failed, verify API key'
        return
      }

      user.value = myUserData

      status.value = 'fetching my books'
      const myBookData = await client.value.myBooks(myUserData.id, {
        rated: !ranker.value.config.includeUnrated,
      })

      const userBookCounter = ranker.value.config.includeUnrated
        ? (item) => item.book.users_count
        : (item) => item.book.ratings_count
      const requestSets = binPack(myBookData, 10000, 100, userBookCounter)

      status.value = 'fetching user ratings'

      const idChunks = requestSets.map((set) => ({
        requests: Math.ceil(set.volume / 4000),
        ids: set.items.map((item) => item.book_id),
      }))
      totalRequests.value = idChunks.reduce((result, set) => {
        return result + set.requests
      }, 2 + completedRequests.value)

      const bookResults = await idChunks.reduce(async (list, chunk) => {
        const l = await list
        const completedRequestsAfter = completedRequests.value + chunk.requests

        const records = await client.value.userRatings(myUserData.id, chunk.ids, {
          rated: !ranker.value.config.includeUnrated,
        })

        completedRequests.value = completedRequestsAfter
        l.push(...records)
        return l
      }, Promise.resolve([]))

      myBooks.value = Object.freeze(myBookData)
      otherUserBooks.value = Object.freeze(bookResults)

      status.value = 'fetching user data'

      await updateRankings()
    } finally {
      status.value = ''
      loadingRatings.value = false
      totalRequests.value = null
      completedRequests.value = 0
    }
  }

  watch(
    [ranker.value.matrix, userDateFilter],

    debounce(async () => {
      return updateRankings()
    }, 1000),
  )

  watch([() => ranker.value.config.includeUnrated], () => {
    return fetchRatings()
  })

  return {
    apiKeyMessage,
    completedRequests,
    fetchRatings,
    myBooks,
    otherUserBooks,
    status,
    totalRequests,
    userList,
    waiting,
  }
}
