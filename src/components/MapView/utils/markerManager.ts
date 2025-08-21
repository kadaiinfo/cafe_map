import maplibregl from "maplibre-gl"
import type { Cafe } from "../../../lib/dataClient"
import { CafeMarkerElement } from "../CafeMarker"
import { getVisibleCafes } from "./visibleCafes"
import { handleCafeSelection } from "./mapPosition"

// マーカーを更新する関数（ズーム値を指定）
export const updateMarkersWithZoom = (
  zoom: number,
  map: maplibregl.Map | null,
  cafeDataLoaded: boolean,
  allCafes: Cafe[],
  ZOOM_THRESHOLD: number,
  markersRef: React.MutableRefObject<Map<string, maplibregl.Marker>>,
  setSelected: (cafe: Cafe) => void
) => {
  console.log('updateMarkersWithZoom called:', { zoom, ZOOM_THRESHOLD, cafeDataLoaded, allCafesLength: allCafes.length })
  
  if (!map || !cafeDataLoaded) {
    console.log('Early return: map or data not ready')
    return
  }

  // ズームレベルが閾値以下の場合はマーカーをすべて削除
  if (zoom <= ZOOM_THRESHOLD) {
    console.log('Zoom below threshold, removing all markers')
    const currentMarkers = markersRef.current
    currentMarkers.forEach((marker) => {
      marker.remove()
    })
    currentMarkers.clear()
    return
  }

  // 閾値以上の場合は通常のマーカー更新処理
  const visibleCafes = getVisibleCafes(map, allCafes, cafeDataLoaded)
  console.log('Visible cafes found:', visibleCafes.length)
  const currentMarkers = markersRef.current

  // 現在表示されているマーカーのIDセット
  const visibleCafeIds = new Set(visibleCafes.map(cafe => cafe.id))
  
  // 表示範囲外のマーカーを削除
  currentMarkers.forEach((marker, id) => {
    if (!visibleCafeIds.has(id)) {
      marker.remove()
      currentMarkers.delete(id)
    }
  })

  // 新しく表示すべきマーカーを追加（逆順で処理して最新の情報を前面に）
  visibleCafes.slice().reverse().forEach(cafe => {
    if (!currentMarkers.has(cafe.id)) {
      const markerEl = CafeMarkerElement(cafe.media_url, cafe.store_name)
      const marker = new maplibregl.Marker({ element: markerEl })
        .setLngLat([cafe.lng, cafe.lat])
        .addTo(map)
      
      currentMarkers.set(cafe.id, marker)
      
      // マーカークリック時の処理
      markerEl.addEventListener('click', () => {
        console.log('Marker clicked:', cafe.store_name)
        handleCafeSelection(cafe, map, setSelected, true) // maintainZoom: true
        
        // マーカークリック時の処理完了
      })
    }
  })
}