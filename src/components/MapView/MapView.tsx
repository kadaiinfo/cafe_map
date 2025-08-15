import { useState,useEffect, useRef } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import "./MapView.css"
import { getCafeData, searchCafes } from "../../lib/dataClient"
import { CafeMarkerElement } from "./CafeMarker"
import Information from "../Information/Information.tsx"
import Search from "../Search/Search.tsx"

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
    const allCafes = getCafeData() // 全店舗情報を取得する
    const [selected, setSelected] = useState<typeof allCafes[0] | null>(null)
    const markersRef = useRef<maplibregl.Marker[]>([]) // マーカーの参照を保持
    const [mapLoaded, setMapLoaded] = useState(false) // マップの読み込み状態

    const handleSearch = (query: string) => {
        const filteredCafes = searchCafes(query)
        
        // 検索結果がある場合、最初のカフェに移動して選択
        if (filteredCafes.length > 0 && mapRef.current && mapLoaded) {
            const firstCafe = filteredCafes[0]
            setSelected(firstCafe)
            
            // マーカーを画面左半分の中央に移動（マーカークリック時と同じ挙動）
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
                center: [firstCafe.lng + lngOffset, firstCafe.lat]
            })
        } else if (filteredCafes.length === 0) {
            // 検索結果がない場合は選択をクリア
            setSelected(null)
        }
    }

    // const handleClearSearch = () => {
    //     setSelected(null)
    // }

    useEffect(() => {
        if (!mapContainerRef.current) return

        const map = new maplibregl.Map({
        container: mapContainerRef.current, // マップを表示するHTML要素を指定する
        style: "https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json", // 地図のスタイルを指定
        center: [130.546634, 31.570480], // 地図の中心座標
        zoom: 14, // 地図のズームレベル
        })
        
        mapRef.current = map
        
        // マップの読み込み完了を待つ
        map.on('load', () => {
            setMapLoaded(true)
        })

        // クリーンアップ関数：useEffectが終了するときmapをremoveする
        return () => {
        map.remove()
        }
    },[])

    // マップが読み込まれたときに全てのマーカーを追加
    useEffect(() => {
        if (!mapRef.current || !mapLoaded) return

        // 既存のマーカーをすべて削除
        markersRef.current.forEach(marker => marker.remove())
        markersRef.current = []

        // 新しいマーカーを追加（常に全カフェデータを使用）
        allCafes.forEach(cafe => {
            const markerEl = CafeMarkerElement(cafe.media_url, cafe.store_name)
            const marker = new maplibregl.Marker({ element: markerEl })
              .setLngLat([cafe.lng, cafe.lat])
              .addTo(mapRef.current!)
            
            markersRef.current.push(marker)
            
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
    }, [mapLoaded])

    // ref={mapContainerRef}で、以下のdiv要素をmapContainerRef.currentに入れる
    return (
        <div className="map-layout">
            <Search onSearch={handleSearch} />
            <div ref={mapContainerRef} className="map-container" />
            {selected && <Information cafe={selected} onClose={() => setSelected(null)} />}
        </div>
    )
}
