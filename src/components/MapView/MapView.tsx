import { useState,useEffect, useRef, useCallback } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import "./MapView.css"
import { getCafeData, searchCafes, type LightCafe } from "../../lib/dataClient"
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
    const [selected, setSelected] = useState<LightCafe | null>(null)
    const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map()) // マーカーの参照をMapで管理
    const [mapLoaded, setMapLoaded] = useState(false) // マップの読み込み状態

    // 表示範囲内のカフェをフィルタリングする関数
    const getVisibleCafes = useCallback(() => {
        if (!mapRef.current) return []
        
        const bounds = mapRef.current.getBounds()
        return allCafes.filter(cafe => 
            cafe.lng >= bounds.getWest() &&
            cafe.lng <= bounds.getEast() &&
            cafe.lat >= bounds.getSouth() &&
            cafe.lat <= bounds.getNorth()
        )
    }, [allCafes])

    // マーカーを更新する関数
    const updateMarkers = useCallback(() => {
        if (!mapRef.current || !mapLoaded) return

        const visibleCafes = getVisibleCafes()
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

        // 新しく表示すべきマーカーを追加
        visibleCafes.forEach(cafe => {
            if (!currentMarkers.has(cafe.id)) {
                const markerEl = CafeMarkerElement(cafe.media_url, cafe.store_name)
                const marker = new maplibregl.Marker({ element: markerEl })
                    .setLngLat([cafe.lng, cafe.lat])
                    .addTo(mapRef.current!)
                
                currentMarkers.set(cafe.id, marker)
                
                // マーカークリック時の処理
                markerEl.addEventListener('click', () => {
                    setSelected(cafe)
                    if (mapRef.current) {
                        const map = mapRef.current
                        const mapContainer = map.getContainer()
                        const mapWidth = mapContainer.offsetWidth
                        
                        const isMobile = mapWidth <= 768
                        
                        if (isMobile) {
                            map.flyTo({
                                center: [cafe.lng, cafe.lat]
                            })
                        } else {
                            const targetX = mapWidth * 0.25
                            const centerX = mapWidth * 0.5
                            const offsetX = centerX - targetX
                            
                            const bounds = map.getBounds()
                            const lngRange = bounds.getEast() - bounds.getWest()
                            const lngOffset = (offsetX / mapWidth) * lngRange
                            
                            map.flyTo({
                                center: [cafe.lng + lngOffset, cafe.lat]
                            })
                        }
                    }
                })
            }
        })
    }, [mapLoaded, getVisibleCafes])

    const handleSearch = (query: string) => {
        const filteredCafes = searchCafes(query)
        
        // 検索結果がある場合、最初のカフェに移動して選択
        if (filteredCafes.length > 0 && mapRef.current && mapLoaded) {
            const firstCafe = filteredCafes[0]
            setSelected(firstCafe)
            
            // マーカークリック時と同じ挙動
            const map = mapRef.current
            const mapContainer = map.getContainer()
            const mapWidth = mapContainer.offsetWidth
            
            // スマホサイズかどうかの判定
            const isMobile = mapWidth <= 768
            
            if (isMobile) {
                // スマホの場合は中央に表示
                map.flyTo({
                    center: [firstCafe.lng, firstCafe.lat],
                    zoom: 16
                })
            } else {
                // デスクトップの場合は画面左半分の中央にマーカーを表示
                const targetX = mapWidth * 0.25 // 左半分の中央
                const centerX = mapWidth * 0.5   // 画面中央
                const offsetX = centerX - targetX
                
                // 経度のオフセットを計算（ピクセル差を経度差に変換）
                const bounds = map.getBounds()
                const lngRange = bounds.getEast() - bounds.getWest()
                const lngOffset = (offsetX / mapWidth) * lngRange
                
                map.flyTo({
                    center: [firstCafe.lng + lngOffset, firstCafe.lat],
                    zoom: 16
                })
            }
            
            // 移動完了後にマーカーを更新
            setTimeout(() => updateMarkers(), 500)
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
        style: "https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json", // 地図のスタイルを指定（日中モード）
        center: [130.548834, 31.570480], // 地図の中心座標
        zoom: 16, // 地図のズームレベル
        })
        
        mapRef.current = map
        
        // マップの読み込み完了を待つ
        map.on('load', () => {
            setMapLoaded(true)
        })

        // 地図の移動・ズーム時にマーカーを更新
        map.on('moveend', updateMarkers)
        map.on('zoomend', updateMarkers)

        // クリーンアップ関数：useEffectが終了するときmapをremoveする
        return () => {
        map.remove()
        }
    }, [updateMarkers])

    // マップが読み込まれたときに初回マーカー表示
    useEffect(() => {
        if (mapLoaded) {
            updateMarkers()
        }
    }, [mapLoaded, updateMarkers])

    // ref={mapContainerRef}で、以下のdiv要素をmapContainerRef.currentに入れる
    return (
        <div className="map-layout">
            <Search onSearch={handleSearch} />
            <div ref={mapContainerRef} className="map-container" />
            {selected && <Information cafe={selected} onClose={() => setSelected(null)} />}
        </div>
    )
}
