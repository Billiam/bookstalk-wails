export const roundPlaces = (num, places = 2) => {
  const mult = Math.pow(10, places)
  return Math.round((num + Number.EPSILON) * mult) / mult
}
