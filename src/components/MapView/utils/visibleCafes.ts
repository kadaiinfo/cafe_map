import maplibregl from "maplibre-gl"
import type { Cafe } from "../../../lib/dataClient"

// 表示範囲内のカフェをフィルタリングする関数
export const getVisibleCafes = (
  map: maplibregl.Map | null,
  allCafes: Cafe[],
  cafeDataLoaded: boolean
): Cafe[] => {
  if (!map || !cafeDataLoaded || allCafes.length === 0) return []
  
  const bounds = map.getBounds()
  return allCafes.filter(cafe => 
    cafe.lng >= bounds.getWest() &&
    cafe.lng <= bounds.getEast() &&
    cafe.lat >= bounds.getSouth() &&
    cafe.lat <= bounds.getNorth()
  )
}