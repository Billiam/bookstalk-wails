const toGraphqlDate = (date) => {
  return (
    date.getUTCFullYear() +
    '-' +
    (date.getUTCMonth() + 1).toString().padStart(2, '0') +
    '-' +
    date.getUTCDate().toString().padStart(2, '0')
  )
}
const toGraphqlDateTime = (date) => {
  return (
    toGraphqlDate(date) +
    'T' +
    date.getUTCHours().toString().padStart(2, '0') +
    ':' +
    date.getUTCMinutes().toString().padStart(2, '0') +
    ':' +
    date.getUTCSeconds().toString().padStart(2, '0') +
    '.' +
    date.getUTCMilliseconds().toString().padEnd(6, '0')
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

  const params = {
    $users: '[Int!]',
    $lastId: 'Int!',
    $limit: 'Int!',
  }

  if (dateFilter?.length > 0) {
    params['$fromDate'] = 'timestamp'
    andConditions.push({ last_activity_at: `{ _gt: $fromDate }` })

    if (dateFilter[1]) {
      params['$toDate'] = 'timestamp'
      andConditions.push({ last_activity_at: `{ _lte: $toDate }` })
    }
  }

  return `
  query( ${conditionsToGraphql(params)} ) {
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
      user_books(limit: 5, order_by: {last_read_date: desc_nulls_last}) {
        id
        last_read_date,
        book {
          id
          title
          release_year
          cached_image
          slug
        }
      }
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

const myBookQuery = ({ rated = true, after = null }) => {
  const conditions = {
    user_id: '{ _eq: $userId }',
    id: '{ _gt: $lastId }',
    status_id: '{ _in: [3, 5]}',
  }
  const params = {
    $userId: 'Int!',
    $lastId: 'Int!',
    $limit: 'Int!',
  }
  if (rated) {
    conditions['rating'] = '{ _is_null: false }'
  }
  if (after) {
    params['$after'] = 'date'
    conditions['_or'] =
      `[{ last_read_date: { _gte: $after }}, {_and: [{last_read_date: { _is_null: true }}, {first_started_reading_date: { _gte: $after }}]}]`
  }

  return `
  query(${conditionsToGraphql(params)}) {
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

const otherBookQuery = ({ rated = true, after = null }) => {
  const conditions = {
    user_id: '{ _neq: $userId }',
    id: '{ _gt: $lastId }',
    book_id: '{ _in: $bookIds }',
    status_id: '{ _in: [3, 5] }',
  }

  const params = {
    $bookIds: '[Int!]',
    $userId: 'Int!',
    $limit: 'Int!',
    $lastId: 'Int!',
  }
  if (rated) {
    conditions['rating'] = '{ _is_null: false }'
  }
  if (after) {
    params['$after'] = 'date'
    conditions['_or'] =
      `[{ last_read_date: { _gte: $after }}, {_and: [{last_read_date: { _is_null: true }}, {first_started_reading_date: { _gte: $after }}]}]`
  }

  return `
  query( ${conditionsToGraphql(params)} ) {
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
    return this.paginatedQuery(myBookQuery(options), {
      userId,
      limit: 1000,
      ...(options.after && { after: toGraphqlDate(options.after) }),
    })
  },

  userRatings(userId, bookIds, options = {}) {
    return this.paginatedQuery(otherBookQuery(options), {
      userId,
      bookIds,
      limit: 4000,
      ...(options.after && { after: toGraphqlDate(options.after) }),
    })
  },

  async fetchUsers(userIds, dateFilter) {
    if (userIds.length === 0) {
      return {}
    }
    const variables = { users: userIds, limit: 100 }
    if (dateFilter) {
      if (dateFilter[0]) {
        variables.fromDate = toGraphqlDateTime(dateFilter[0])
      }
      if (dateFilter[1]) {
        const endOfDay = new Date(dateFilter[1])
        endOfDay.setHours(23, 59, 59, 999)
        variables.toDate = toGraphqlDateTime(endOfDay)
      }
    }

    const userData = await this.paginatedQuery(
      otherUserQuery(dateFilter),
      variables,
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
