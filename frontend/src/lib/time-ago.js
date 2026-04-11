export default (timestamp, locale = 'en') => {
  const diff = (new Date().getTime() - timestamp.getTime()) / 1000
  const minutes = Math.floor(diff / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = days / 7
  const months = Math.floor(days / 30)

  if (months > 4) {
    return timestamp.toLocaleDateString()
  }

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  console.log({ timestamp, diff })
  if (weeks > 6) {
    return rtf.format(-Math.floor(months), 'month')
  } else if (days > 12) {
    return rtf.format(-Math.floor(weeks), 'week')
  } else if (days > 0) {
    return rtf.format(-Math.floor(days), 'day')
  } else if (minutes > 80) {
    return rtf.format(-Math.floor(hours), 'hour')
  } else if (diff > 90) {
    return rtf.format(-Math.floor(minutes), 'minute')
  } else {
    return rtf.format(-Math.floor(diff), 'second')
  }
}
