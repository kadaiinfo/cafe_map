import maplibregl from "maplibre-gl"
import type { Cafe } from "../../../lib/dataClient"

// クラスター情報の型定義
export interface CafeCluster {
  id: string
  lng: number
  lat: number
  cafes: Cafe[]
  count: number
}

// 距離計算（メートル単位）
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000 // 地球の半径（メートル）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// ズームレベルに応じたクラスター距離の計算
const getClusterDistance = (zoom: number): number => {
  // ズームレベルが低いほど大きな距離でクラスタリング
  if (zoom <= 10) return 5000  // 5km
  if (zoom <= 12) return 2000  // 2km
  if (zoom <= 14) return 1000  // 1km
  return 500  // 500m
}

// カフェをクラスターにグループ化
export const createCafeClusters = (cafes: Cafe[], zoom: number): CafeCluster[] => {
  const clusters: CafeCluster[] = []
  const usedCafes = new Set<string>()
  const clusterDistance = getClusterDistance(zoom)

  // IDでソートして一貫した順序を保つ
  const sortedCafes = [...cafes].sort((a, b) => a.id.localeCompare(b.id))

  sortedCafes.forEach(cafe => {
    if (usedCafes.has(cafe.id)) return

    // 近くのカフェを探す（IDでソートして一貫性を保つ）
    const nearbyCafes = sortedCafes.filter(otherCafe => {
      if (usedCafes.has(otherCafe.id) || cafe.id === otherCafe.id) return false
      
      const distance = calculateDistance(cafe.lat, cafe.lng, otherCafe.lat, otherCafe.lng)
      return distance <= clusterDistance
    })

    // クラスターを作成
    const clusterCafes = [cafe, ...nearbyCafes]
    clusterCafes.forEach(c => usedCafes.add(c.id))

    // クラスターの中心点を最初のカフェ（最小ID）の位置に固定
    const representativeCafe = clusterCafes.sort((a, b) => a.id.localeCompare(b.id))[0]

    clusters.push({
      id: `cluster-${representativeCafe.id}`,
      lng: representativeCafe.lng,
      lat: representativeCafe.lat,
      cafes: clusterCafes,
      count: clusterCafes.length
    })
  })

  return clusters
}

// クラスターマーカーの要素を作成
export const createClusterMarkerElement = (cluster: CafeCluster): HTMLElement => {
  const el = document.createElement('div')
  
  // カフェ数に応じてサイズを調整
  const size = Math.min(60, Math.max(30, cluster.count * 8))
  
  el.className = 'cluster-marker'
  el.style.width = `${size}px`
  el.style.height = `${size}px`
  el.style.fontSize = `${Math.min(16, size * 0.3)}px`
  
  el.textContent = cluster.count.toString()
  
  return el
}

// クラスターマーカーを更新する関数
export const updateClusterMarkers = (
  zoom: number,
  map: maplibregl.Map | null,
  cafeDataLoaded: boolean,
  allCafes: Cafe[],
  ZOOM_THRESHOLD: number,
  setSelected: (cafe: Cafe) => void
) => {
  console.log('updateClusterMarkers called:', { zoom, ZOOM_THRESHOLD, cafeDataLoaded, allCafesLength: allCafes.length })
  
  if (!map || !cafeDataLoaded) {
    console.log('Early return: map or data not ready')
    return
  }

  // ズームレベルが閾値以下の場合はクラスターレイヤーを表示
  if (zoom <= ZOOM_THRESHOLD) {
    console.log('Zoom below threshold, showing cluster markers')
    
    // 全てのカフェからクラスターを作成（表示範囲の制限なし）
    const clusters = createCafeClusters(allCafes, zoom)
    console.log('Created clusters:', clusters.length)

    // GeoJSONデータを作成
    const geojsonData = {
      type: 'FeatureCollection' as const,
      features: clusters.map(cluster => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [cluster.lng, cluster.lat]
        },
        properties: {
          id: cluster.id,
          count: cluster.count,
          cafes: cluster.cafes
        }
      }))
    }

    // レイヤーが既に存在する場合はデータのみ更新
    if (map.getSource('clusters')) {
      const source = map.getSource('clusters') as maplibregl.GeoJSONSource
      source.setData(geojsonData)
    } else {
      // 初回のみソースとレイヤーを作成
      map.addSource('clusters', {
        type: 'geojson',
        data: geojsonData
      })

      // クラスターの円を描画
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'clusters',
        paint: {
          'circle-color': '#70513C', // 茶色で統一
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'count'],
            1, 15,
            10, 25,
            50, 35
          ],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff'
        }
      })

      // クラスターの数字ラベルを描画
      map.addLayer({
        id: 'cluster-labels',
        type: 'symbol',
        source: 'clusters',
        layout: {
          'text-field': ['get', 'count'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 14
        },
        paint: {
          'text-color': '#ffffff'
        }
      })

      // クラスタークリックイベントを設定（一度だけ）
      map.on('click', 'clusters', (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0]
          const properties = feature.properties
          
          console.log('Cluster clicked:', properties?.count, 'cafes')
          
          if (properties?.count === 1) {
            // 単一カフェの場合もズームインしてから詳細表示
            if (feature.geometry.type === 'Point') {
              const coordinates = feature.geometry.coordinates as [number, number]
              map.flyTo({
                center: coordinates,
                zoom: Math.min(zoom + 2, 18)
              })
              
              // ズーム完了後に詳細表示
              const currentClusters = createCafeClusters(allCafes, zoom)
              const cluster = currentClusters.find(c => c.id === properties.id)
              if (cluster && cluster.cafes.length > 0) {
                setSelected(cluster.cafes[0])
              }
            }
          } else {
            // 複数カフェの場合はズームイン
            if (feature.geometry.type === 'Point') {
              const coordinates = feature.geometry.coordinates as [number, number]
              map.flyTo({
                center: coordinates,
                zoom: Math.min(zoom + 2, 18)
              })
            }
          }
        }
      })

      // カーソルスタイルを設定（一度だけ）
      map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = ''
      })
    }
    
    return
  }

  // ズームレベルが閾値以上の場合は既存のクラスターレイヤーを削除
  if (map.getLayer('clusters')) {
    map.removeLayer('clusters')
  }
  if (map.getLayer('cluster-labels')) {
    map.removeLayer('cluster-labels')
  }
  if (map.getSource('clusters')) {
    map.removeSource('clusters')
  }
}