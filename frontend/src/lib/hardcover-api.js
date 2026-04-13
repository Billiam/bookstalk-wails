const toGraphqlDate = (date) => {
  return (
    date.getFullYear() +
    '-' +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    '-' +
    date.getDate().toString().padStart(2, '0') +
    'T' +
    date.getHours().toString().padStart(2, '0') +
    ':' +
    date.getMinutes().toString().padStart(2, '0') +
    ':' +
    date.getSeconds().toString().padStart(2, '0') +
    '.' +
    date.getMilliseconds().toString().padEnd(6, '0')
  )
}
const conditionsToGraphql = (conditions) =>
  Object.entries(conditions)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ')

const andConditionsToGraphql = (conditions) =>
  '{' + conditions.map(conditionsToGraphql).join('}, {') + '}'

const otherUserQuery = (dateFilter) => {
  const andConditions = [{ id: '{ _in: $users }' }, { id: '{ _gt: $lastId }' }]

  if (dateFilter?.length > 0) {
    andConditions.push({ last_activity_at: `{ _gt: "${toGraphqlDate(dateFilter[0])}" }` })
    if (dateFilter[1]) {
      const endOfDay = new Date(dateFilter[1])
      endOfDay.setHours(23, 59, 59, 999)
      andConditions.push({ last_activity_at: `{ _lte: "${toGraphqlDate(endOfDay)}" }` })
    }
  }

  return `
  query($users: [Int!], $lastId: Int!, $limit: Int!) {
    results:users(
      where: { _and: [ ${andConditionsToGraphql(andConditions)} ]}
      limit: $limit
      order_by: { id: asc }
    ) {
      id
      username
      name
      cached_image
      last_activity_at
    }
  }`
}
const meQuery = `
query {
  results:me {
    id
    username
    name
    cached_image
    last_activity_at
  }
}`

const myBookQuery = (rated = true) => {
  const conditions = {
    user_id: '{ _eq: $userId }',
    id: '{ _gt: $lastId }',
    status_id: '{ _in: [3, 5]}',
  }
  if (rated) {
    conditions['rating'] = '{ _is_null: false }'
  }

  return `
  query($userId: Int!, $lastId: Int!, $limit: Int!) {
    results:user_books(
      where: { ${conditionsToGraphql(conditions)} }
      limit: $limit
      order_by: { id: asc }
    ) {
      id,
      book_id
      status_id
      rating
      book {
        users_count
        ratings_count
        title
      }
    }
  }`
}

const otherBookQuery = (rated = true) => {
  const conditions = {
    user_id: '{ _neq: $userId }',
    id: '{ _gt: $lastId }',
    book_id: '{ _in: $bookIds }',
    status_id: '{ _in: [3, 5] }',
  }
  if (rated) {
    conditions['rating'] = '{ _is_null: false }'
  }

  return `
  query($bookIds: [Int!], $userId: Int!, $limit: Int!, $lastId: Int!) {
    results:user_books(
      where: { ${conditionsToGraphql(conditions)} }
      limit: $limit
      order_by: { id: asc }
    ) {
      id,
      user_id
      book_id
      rating
      status_id
    }
  }`
}

const followsQuery = `
query($userId: Int!, $limit: Int!, $lastId: Int!) {
  results:followed_users(
    where: {
      _or: [{followed_user_id: {_eq: $userId}},{user_id: {_eq: $userId}}],
      id: {_gt: $lastId}
    }
    limit: $limit
    order_by: { id: asc }
  ) {
    id
    user_id
    followed_user_id
  }
}
`

let executed = false
let lastQueryTime = 0

export default (token, setWaiting, queryCallback) => ({
  wait() {
    return new Promise((resolve) => {
      setWaiting(true)
      setTimeout(
        () => {
          setWaiting(false)
          resolve()
        },
        lastQueryTime + 1050 - new Date().getTime(),
      )
    })
  },

  async query(query, variables = {}) {
    if (executed) {
      await this.wait()
    }
    executed = true

    const body = JSON.stringify({
      query,
      variables,
    })

    lastQueryTime = new Date().getTime()

    const response = await fetch(import.meta.env.VITE_HARDCOVER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      },
      body,
    })

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }
    const data = await response.json()
    if (data.errors) {
      throw new Error(`Query failed: ${data.errors.map((err) => err.message).join(', ')}`)
    }
    return data.data
  },

  async paginatedQuery(query, variables = {}, maxResults = null) {
    let lastId = 0
    let moreRecords = true
    const allResults = []
    variables.limit ||= 1000

    do {
      const paginatedVariables = structuredClone(variables)
      paginatedVariables.lastId = lastId

      const data = await this.query(query, paginatedVariables)
      if (queryCallback) {
        queryCallback(data)
      }

      const values = Object.values(data)[0]
      allResults.push(...values)

      if (data.total) {
        if (values.length === data.total.aggregate.count) {
          moreRecords = false
        }
      } else if (maxResults && allResults.length >= maxResults) {
        moreRecords = false
      } else if (values.length < variables.limit) {
        moreRecords = false
      }

      if (moreRecords) {
        lastId = values[values.length - 1].id
      }
    } while (moreRecords)

    return allResults
  },

  async fetchMe() {
    const result = await this.query(meQuery)
    const user = result.results[0]
    if (user) {
      const follows = await this.follows(user.id)
      user.followedBy = follows.followedBy
      user.following = follows.following
    }
    return user
  },

  myBooks(userId = null, options = {}) {
    const rated = options.rated ?? true
    return this.paginatedQuery(myBookQuery(rated), { userId, limit: 1000 })
  },

  userRatings(userId, bookIds, options = {}) {
    const rated = options.rated ?? true
    return this.paginatedQuery(otherBookQuery(rated), { userId, bookIds, limit: 4000 })
  },

  async fetchUsers(userIds, dateFilter) {
    if (userIds.length === 0) {
      return {}
    }

    const userData = await this.paginatedQuery(
      otherUserQuery(dateFilter),
      { users: userIds, limit: 100 },
      Math.min(userIds.length, 200),
    )
    return userData.reduce((lookup, user) => {
      lookup[user.id] = user
      return lookup
    }, {})
  },

  async follows(userId) {
    const follows = await this.paginatedQuery(followsQuery, { userId })

    return follows.reduce(
      (list, follow) => {
        if (follow.user_id === userId) {
          list.following.add(follow.followed_user_id)
        } else {
          list.followedBy.add(follow.user_id)
        }
        return list
      },
      { followedBy: new Set(), following: new Set() },
    )
  },
})
