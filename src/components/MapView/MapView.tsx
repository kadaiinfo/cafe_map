import { useEffect, useRef } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import "./MapView.css"
import { getCafeData } from "../../lib/dataClient"
import { createCafeMarkerElement } from "./createCafeMarker"

// 地図を描画するコンポーネント
// この記事を参考に実装した 
// https://zenn.dev/asahina820/books/c29592e397a35b/viewer/0200eb
export default function MapView() {
    const mapContainerRef = useRef<HTMLDivElement | null>(null)
    const cafes = getCafeData() // 店舗情報を取得する

    useEffect(() => {
        if (!mapContainerRef.current) return

        const map = new maplibregl.Map({
        container: mapContainerRef.current, // マップを表示するHTML要素のidを指定
        style: "https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json", // 地図のスタイルを指定
        center: [130.546634, 31.570480], // 地図の中心座標
        zoom: 14, // ズームレベル
        })

        // 副作用なので map ではなく forEach を使う
        cafes.forEach(cafe => {
            const markerEl = createCafeMarkerElement(cafe.media_url, cafe.store_name)
            new maplibregl.Marker({ element: markerEl })
              .setLngLat([cafe.lng, cafe.lat])
              .addTo(map)
          })
  

        // 画面から外れる時removeする
        return () => {
        map.remove()
        }
    },[])

    return <div ref={mapContainerRef} className="map-container" />
}
