const STATUS = {
  TO_READ: 1,
  READING: 2,
  FINISHED: 3,
  DNF: 5,
}
const MATRIX_CONDITION = [
  { status_id: STATUS.READING },
  { status_id: STATUS.TO_READ },
  { status_id: STATUS.DNF },
  { rating: 0.5 },
  { rating: 1 },
  { rating: 1.5 },
  { rating: 2 },
  { rating: 2.5 },
  { rating: 3 },
  { rating: 3.5 },
  { rating: 4 },
  { rating: 4.5 },
  { rating: 5 },
]
const DNF = 'dnf'
const UNRANKED = 'none'

export default class Ranker {
  constructor() {
    this.config = {
      dnfRanking: 0.5,
      treatDnfAsRanked: true,
      noRankingWeight: 0.5,
      posRange: 4,
      negRange: 4,
      posModifier: 1,
      negModifier: 1,
      matchingNegModifier: 1,
      posBonus: 0.75,
      negPenalty: 0,
      includeUnrated: false,
    }
    this.matrix = new Map()
  }

  normalizeUserBook(userBook) {
    if (userBook.rating) {
      return userBook.rating
    }
    if (userBook.status_id === STATUS.DNF) {
      return DNF
    }
    return UNRANKED
  }

  lookup(r1, r2) {
    return this.matrix.get(r1).get(r2)
  }

  compare(r1, r2) {
    if (r1 === DNF) {
      r1 = this.config.treatDnfAsRanked ? this.config.dnfRanking : UNRANKED
    }
    if (r2 === DNF) {
      r2 = this.config.treatDnfAsRanked ? this.config.dnfRanking : UNRANKED
    }

    if (r1 === UNRANKED || r2 === UNRANKED) {
      return this.config.noRankingWeight
    }

    const posRange = this.config.posRange
    const negRange = this.config.negRange
    const posModifier = this.config.posModifier
    const negModifier = this.config.negModifier
    const matchingNegModifier = this.config.matchingNegModifier
    const posBonus = this.config.posBonus
    const negPenalty = this.config.negPenalty

    const positiveMatch = (Math.max(0, r1 + r2 - (10 - posRange * 0.5)) / 2) * posModifier
    const negativeMatch =
      (Math.max(0, Math.abs(r1 - r2) - (4.5 - negRange * 0.5)) / 2) * negModifier
    const matchingNegativeMatch =
      ((Math.min(r1 + r2 + 1, posRange) - posRange) / 2) * -matchingNegModifier

    const total = positiveMatch + negativeMatch + matchingNegativeMatch
    return total + (total >= 0 ? posBonus : 0) + (total < 0 ? negPenalty : 0)
  }

  populateMatrix() {
    const matrixRatings = MATRIX_CONDITION.map(this.normalizeUserBook)

    matrixRatings.forEach((ratingA) => {
      if (!this.matrix.has(ratingA)) {
        this.matrix.set(ratingA, new Map())
      }
      const ratingLeaf = this.matrix.get(ratingA)
      matrixRatings.forEach((ratingB) => {
        ratingLeaf.set(ratingB, this.compare(ratingA, ratingB))
      })
      //
      // this.matrix[ratingA] = matrixRatings.reduce((subRatingMap, ratingB) => {
      //   subRatingMap[ratingB] = this.compare(ratingA, ratingB)
      //   return subRatingMap
      // }, {})

      // this.matrix[ratingA] ||= {}
      // matrixRatings.forEach((ratingB) => {
      //   this.matrix[ratingA][ratingB] = this.compare(ratingA, ratingB)
      // })
    })
  }

  rankUsers(listA, listB) {
    const myRatings = listA.reduce((lookup, book) => {
      lookup[book.book_id] = this.normalizeUserBook(book)
      return lookup
    }, {})

    const userList = listB.reduce((lookup, book) => {
      const value = this.normalizeUserBook(book)
      const score = this.lookup(myRatings[book.book_id], value)
      if (score !== 0) {
        lookup[book.user_id] ||= { score: 0, count: 0, id: book.user_id }
        lookup[book.user_id].score += score
        lookup[book.user_id].count++
      }
      return lookup
    }, {})

    return Object.values(userList).sort((a, b) => b.score - a.score)
  }

  cacheMatrix() {
    this.populateMatrix()
  }

  setConfig(config) {
    this.config = config
    this.cacheMatrix()
  }
}
