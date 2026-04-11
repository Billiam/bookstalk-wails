export default (list, maxVolume, maxItems, volumeCallback) => {
  const closedBins = []
  const openBins = []

  volumeCallback ||= (item) => item.volume

  list = list.toSorted((a, b) => volumeCallback(b) - volumeCallback(a))
  list.forEach((item) => {
    const itemVolume = volumeCallback(item)
    const maxCurrentVolume = maxVolume - itemVolume

    let bin = openBins.find((bin) => {
      return bin.volume < maxCurrentVolume
    })
    const binWasFound = !!bin

    if (bin) {
      bin.items.push(item)
      bin.volume += itemVolume
    } else {
      bin = { items: [item], volume: itemVolume }
    }

    if (bin.items.length === maxItems || bin.volume >= maxVolume) {
      if (binWasFound) {
        openBins.splice(openBins.indexOf(bin), 1)
      }
      closedBins.push(bin)
    } else {
      if (!binWasFound) {
        openBins.push(bin)
      }
    }
  })
  return [...closedBins, ...openBins]
}
