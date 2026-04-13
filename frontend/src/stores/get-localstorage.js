export default (key, defaultValue) => {
  const encodedVal = localStorage.getItem(key)
  if (encodedVal) {
    try {
      return JSON.parse(encodedVal)
    } catch {}
  }
  return defaultValue
}
