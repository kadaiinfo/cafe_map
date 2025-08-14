import { useState,useEffect, useRef } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import "./MapView.css"
import { getCafeData } from "../../lib/dataClient"
import { CafeMarkerElement } from "./CafeMarker"
import Information from "../Information/Information.tsx"

// 地図を描画するコンポーネント
// この記事を参考に実装した 
// https://zenn.dev/asahina820/books/c29592e397a35b/viewer/0200eb
export default function MapView() {
    // [MapView 実行] → JSX を返す (<div>)
    //           ↓
    // [React が DOM 作成] → ref に DOM をセット
    //           ↓
    // [useEffect 実行] → MapLibre に DOM を渡して地図描画

    const mapContainerRef = useRef(null)
    const mapRef = useRef<maplibregl.Map | null>(null)
    const cafes = getCafeData() // 店舗情報を取得する
    const [selected, setSelected] = useState<typeof cafes[0] | null>(null)

    useEffect(() => {
        if (!mapContainerRef.current) return

        const map = new maplibregl.Map({
        container: mapContainerRef.current, // マップを表示するHTML要素を指定する
        style: "https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json", // 地図のスタイルを指定
        center: [130.546634, 31.570480], // 地図の中心座標
        zoom: 14, // 地図のズームレベル
        })
        
        mapRef.current = map

        // 副作用なので map ではなく forEach を使う(ここ調べる)
        cafes.forEach(cafe => {
            const markerEl = CafeMarkerElement(cafe.media_url, cafe.store_name)
            const marker = new maplibregl.Marker({ element: markerEl })
              .setLngLat([cafe.lng, cafe.lat])
              .addTo(map)
            
            
            // マーカークリック時の処理
            markerEl.addEventListener('click', () => {
                setSelected(cafe)
                // マーカーを画面左半分の中央に移動
                if (mapRef.current) {
                    const map = mapRef.current
                    const mapContainer = map.getContainer()
                    const mapWidth = mapContainer.offsetWidth
                    
                    // 画面左半分の中央にマーカーを表示するためのオフセットを計算
                    const targetX = mapWidth * 0.25 // 左半分の中央
                    const centerX = mapWidth * 0.5   // 画面中央
                    const offsetX = centerX - targetX
                    
                    // 経度のオフセットを計算（ピクセル差を経度差に変換）
                    const bounds = map.getBounds()
                    const lngRange = bounds.getEast() - bounds.getWest()
                    const lngOffset = (offsetX / mapWidth) * lngRange
                    
                    map.flyTo({
                        center: [cafe.lng + lngOffset, cafe.lat]
                    })
                }
            })
          })
  

        // クリーンアップ関数：useEffectが終了するときmapをremoveする
        return () => {
        map.remove()
        }
    },[])

    // ref={mapContainerRef}で、以下のdiv要素をmapContainerRef.currentに入れる
    return (
        <div className="map-layout">
            <div ref={mapContainerRef} className="map-container" />
            {selected && <Information cafe={selected} onClose={() => setSelected(null)} />}
        </div>
    )
}
