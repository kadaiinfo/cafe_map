import maplibregl from "maplibre-gl"

// 現在地の座標型
export interface UserLocation {
  lng: number
  lat: number
  accuracy?: number
}

// 現在地取得のオプション
const geolocationOptions: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000 // 5分間キャッシュ
}

// 現在地を取得する関数
export const getCurrentLocation = (): Promise<UserLocation> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('このブラウザは位置情報に対応していません'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude, accuracy } = position.coords
        resolve({
          lng: longitude,
          lat: latitude,
          accuracy
        })
      },
      (error) => {
        let errorMessage = '位置情報の取得に失敗しました'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '位置情報の使用が許可されていません'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置情報を取得できません'
            break
          case error.TIMEOUT:
            errorMessage = '位置情報の取得がタイムアウトしました'
            break
        }
        
        reject(new Error(errorMessage))
      },
      geolocationOptions
    )
  })
}

// 現在地マーカーを作成する関数
export const createLocationMarkerElement = (): HTMLElement => {
  const el = document.createElement('div')
  el.className = 'user-location-marker'
  
  // 外側の円（精度を表す）
  const outerCircle = document.createElement('div')
  outerCircle.className = 'user-location-accuracy'
  
  // 内側の点（現在地を表す）
  const innerDot = document.createElement('div')
  innerDot.className = 'user-location-dot'
  
  el.appendChild(outerCircle)
  el.appendChild(innerDot)
  
  return el
}

// 現在地マーカーを地図に追加・更新する関数
export const updateUserLocationMarker = (
  map: maplibregl.Map | null,
  location: UserLocation,
  currentMarkerRef: React.MutableRefObject<maplibregl.Marker | null>
) => {
  if (!map) return

  // 既存のマーカーを削除
  if (currentMarkerRef.current) {
    currentMarkerRef.current.remove()
    currentMarkerRef.current = null
  }

  // 新しいマーカーを作成
  const markerEl = createLocationMarkerElement()
  
  // 精度に応じて外側の円のサイズを調整（最小20px、最大100px）
  if (location.accuracy) {
    const accuracyRadius = Math.min(Math.max(location.accuracy / 10, 20), 100)
    const accuracyEl = markerEl.querySelector('.user-location-accuracy') as HTMLElement
    if (accuracyEl) {
      accuracyEl.style.width = `${accuracyRadius}px`
      accuracyEl.style.height = `${accuracyRadius}px`
    }
  }

  const marker = new maplibregl.Marker({ element: markerEl })
    .setLngLat([location.lng, location.lat])
    .addTo(map)

  currentMarkerRef.current = marker
}

// 現在地に地図を移動する関数
export const moveToUserLocation = (
  map: maplibregl.Map | null,
  location: UserLocation,
  zoom: number = 16
) => {
  if (!map) return

  map.flyTo({
    center: [location.lng, location.lat],
    zoom: zoom,
    duration: 3000
  })
}