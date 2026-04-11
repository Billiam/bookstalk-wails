import { debounce } from 'perfect-debounce'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'

import binPack from '@/lib/bin.js'
import HardcoverApi from '@/lib/hardcover-api.js'
import { useUiStore } from '@/stores/ui.js'

export const useUserMatch = (ranker) => {
  const uiStore = useUiStore()
  const { apiKey, user, loadingRatings } = storeToRefs(uiStore)

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
    const topUsers = ranker.value.rankUsers(myBooks.value, otherUserBooks.value)
    const userData = await client.value.fetchUsers(topUsers.map((user) => user.id))
    const topUserData = topUsers.map((topUser) => ({ ...topUser, ...userData[topUser.id] }))
    userList.value = Object.freeze(topUserData)
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
        requests: Math.ceil(set.volume / 5000),
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
    ranker.value.matrix,
    debounce(() => {
      return updateRankings()
    }, 250),
  )

  watch(
    () => ranker.value.config.includeUnrated,
    () => {
      return fetchRatings()
    },
  )

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
