import maplibregl from "maplibre-gl"
import type { Cafe } from "../../../lib/dataClient"
import { calculateMapPosition } from "./mapPosition"

// 検索処理を行う関数
export const handleSearch = async (
  query: string,
  searchCafes: (query: string) => Promise<Cafe[]>,
  map: maplibregl.Map | null,
  mapLoaded: boolean,
  setSelected: (cafe: Cafe | null) => void,
  updateMarkers: () => void
) => {
  const filteredCafes = await searchCafes(query)
  
  // 検索結果がある場合、最初のカフェに移動して選択
  if (filteredCafes.length > 0 && map && mapLoaded && query.trim()) {
    const firstCafe = filteredCafes[0]
    setSelected(firstCafe)
    
    const mapContainer = map.getContainer()
    const mapWidth = mapContainer.offsetWidth
    const isMobile = mapWidth <= 768
    
    const position = calculateMapPosition(firstCafe, map, isMobile)
    map.flyTo(position)
    
    // 移動完了後にマーカーを更新
    setTimeout(() => updateMarkers(), 500)
  } else if (filteredCafes.length === 0) {
    // 検索結果がない場合は選択をクリア
    setSelected(null)
  }
}