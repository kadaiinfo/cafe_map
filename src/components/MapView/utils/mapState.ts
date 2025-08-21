// 地図の位置とズームレベルを保存/復元する関数
export const saveMapState = (center: [number, number], zoom: number) => {
  const mapState = {
    center,
    zoom,
    timestamp: Date.now()
  }
  localStorage.setItem('cafeMapState', JSON.stringify(mapState))
}

export const loadMapState = () => {
  try {
    const saved = localStorage.getItem('cafeMapState')
    if (saved) {
      const mapState = JSON.parse(saved)
      // 24時間以内の保存データのみ有効
      if (Date.now() - mapState.timestamp < 24 * 60 * 60 * 1000) {
        return mapState
      }
    }
  } catch (error) {
    console.warn('Failed to load map state:', error)
  }
  return null
}