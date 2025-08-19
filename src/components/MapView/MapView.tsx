import { useState,useEffect, useRef, useCallback } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import "./MapView.css"
import { getCafeData, searchCafes, type LightCafe } from "../../lib/dataClient"
import { CafeMarkerElement } from "./CafeMarker"
import Information from "../Information/Information.tsx"
import Search from "../Search/Search.tsx"
import MixerPanel from "../MixerPanel/MixerPanel.tsx"
import CafeList from "../CafeList/CafeList.tsx"

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
    const [allCafes, setAllCafes] = useState<LightCafe[]>([]) // 全店舗情報
    const [cafeDataLoaded, setCafeDataLoaded] = useState(false) // カフェデータの読み込み状態
    const [selected, setSelected] = useState<LightCafe | null>(null)
    const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map()) // マーカーの参照をMapで管理
    const [mapLoaded, setMapLoaded] = useState(false) // マップの読み込み状態
    const [currentZoom, setCurrentZoom] = useState(17) // 現在のズームレベル
    const ZOOM_THRESHOLD = 16.5 // この値以下だとマーカーを表示しない
    const [showMixerPanel, setShowMixerPanel] = useState(false) // MixerPanel表示状態
    const [showCafeList, setShowCafeList] = useState(false) // CafeList表示状態

    // カフェデータを読み込む
    useEffect(() => {
        const loadCafeData = async () => {
            try {
                const data = await getCafeData()
                setAllCafes(data)
                setCafeDataLoaded(true)
            } catch (error) {
                console.error('Failed to load cafe data:', error)
                setCafeDataLoaded(false)
            }
        }
        loadCafeData()
    }, [])

    // 地図の位置とズームレベルを保存/復元する関数
    const saveMapState = useCallback((center: [number, number], zoom: number) => {
        const mapState = {
            center,
            zoom,
            timestamp: Date.now()
        }
        localStorage.setItem('cafeMapState', JSON.stringify(mapState))
    }, [])

    const loadMapState = useCallback(() => {
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
    }, [])

    // 表示範囲内のカフェをフィルタリングする関数
    const getVisibleCafes = useCallback(() => {
        if (!mapRef.current || !cafeDataLoaded || allCafes.length === 0) {
            console.log('getVisibleCafes early return:', { mapRef: !!mapRef.current, cafeDataLoaded, allCafesLength: allCafes.length })
            return []
        }
        
        const bounds = mapRef.current.getBounds()
        const visibleCafes = allCafes.filter(cafe => 
            cafe.lng >= bounds.getWest() &&
            cafe.lng <= bounds.getEast() &&
            cafe.lat >= bounds.getSouth() &&
            cafe.lat <= bounds.getNorth()
        )
        console.log('getVisibleCafes result:', visibleCafes.length, 'out of', allCafes.length)
        return visibleCafes
    }, [allCafes, cafeDataLoaded])

    // ズーム値を指定してマーカーを更新する関数（閾値以下の場合のみ削除処理）
    const updateMarkersWithZoom = useCallback((zoom: number) => {
        if (!mapRef.current || !cafeDataLoaded) {
            return
        }

        // ズームレベルが閾値以下の場合はマーカーをすべて削除
        if (zoom <= ZOOM_THRESHOLD) {
            const currentMarkers = markersRef.current
            currentMarkers.forEach((marker) => {
                marker.remove()
            })
            currentMarkers.clear()
            return
        }

        // 閾値以上の場合は通常のマーカー更新処理
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
    }, [getVisibleCafes, ZOOM_THRESHOLD, cafeDataLoaded])

    // マーカーを更新する関数（currentZoom使用）
    const updateMarkers = useCallback(() => {
        updateMarkersWithZoom(currentZoom)
    }, [updateMarkersWithZoom, currentZoom])

    const handleSettingsClick = () => {
        setShowMixerPanel(true)
    }

    const handleCloseMixerPanel = () => {
        setShowMixerPanel(false)
    }

    const handleShowCafeList = () => {
        setShowMixerPanel(false)
        setShowCafeList(true)
    }

    const handleCloseCafeList = () => {
        setShowCafeList(false)
    }

    const handleCafeSelect = (cafe: LightCafe) => {
        setSelected(cafe)
        
        // カフェ選択時の地図移動処理（既存のマーカークリック処理と同様）
        if (mapRef.current) {
            const map = mapRef.current
            const mapContainer = map.getContainer()
            const mapWidth = mapContainer.offsetWidth
            
            const isMobile = mapWidth <= 768
            
            if (isMobile) {
                map.flyTo({
                    center: [cafe.lng, cafe.lat],
                    zoom: 17
                })
            } else {
                const targetX = mapWidth * 0.25
                const centerX = mapWidth * 0.5
                const offsetX = centerX - targetX
                
                const bounds = map.getBounds()
                const lngRange = bounds.getEast() - bounds.getWest()
                const lngOffset = (offsetX / mapWidth) * lngRange
                
                map.flyTo({
                    center: [cafe.lng + lngOffset, cafe.lat],
                    zoom: 17
                })
            }
        }
    }

    const handleAreaSelect = (lng: number, lat: number) => {
        if (mapRef.current) {
            mapRef.current.flyTo({
                center: [lng, lat],
                zoom: 17
            })
        }
    }

    const handleSearch = async (query: string) => {
        const filteredCafes = await searchCafes(query)
        
        // 検索結果がある場合、最初のカフェに移動して選択
        if (filteredCafes.length > 0 && mapRef.current && mapLoaded && query.trim()) {
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
                    zoom: 17
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
                    zoom: 17
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

        // 保存された地図状態を復元
        const savedState = loadMapState()
        const initialCenter: [number, number] = savedState?.center || [130.5548586, 31.5901844]
        const initialZoom = savedState?.zoom || 17

        const map = new maplibregl.Map({
        container: mapContainerRef.current, // マップを表示するHTML要素を指定する
        style: "https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json", // 地図のスタイルを指定（日中モード）
        center: initialCenter, // 地図の中心座標（保存された位置または初期位置）
        zoom: initialZoom, // 地図のズームレベル（保存されたズームまたは初期ズーム）
        })
        
        mapRef.current = map
        
        // マップの読み込み完了を待つ
        map.on('load', () => {
            setMapLoaded(true)
        })

        // 地図の移動時にマーカーを更新
        map.on('moveend', () => {
            const currentMapZoom = map.getZoom()
            const center = map.getCenter()
            console.log('moveend - zoom:', currentMapZoom, 'cafeDataLoaded:', cafeDataLoaded, 'allCafes.length:', allCafes.length)
            updateMarkersWithZoom(currentMapZoom)
            // 位置変更を保存
            saveMapState([center.lng, center.lat], currentMapZoom)
        })
        map.on('zoomend', () => {
            const newZoom = map.getZoom()
            const center = map.getCenter()
            setCurrentZoom(newZoom)
            // リアルタイムのズーム値を使ってマーカー更新
            updateMarkersWithZoom(newZoom)
            // ズーム変更を保存
            saveMapState([center.lng, center.lat], newZoom)
        })

        // クリーンアップ関数：useEffectが終了するときmapをremoveする
        return () => {
        map.remove()
        }
    }, [])

    // マップとカフェデータが読み込まれたときに初回マーカー表示
    useEffect(() => {
        if (mapLoaded && cafeDataLoaded) {
            updateMarkers()
        }
    }, [mapLoaded, cafeDataLoaded, updateMarkers])

    // ref={mapContainerRef}で、以下のdiv要素をmapContainerRef.currentに入れる
    return (
        <div className="map-layout">
            <Search onSearch={handleSearch} onSettingsClick={handleSettingsClick} />
            <div ref={mapContainerRef} className="map-container" />
            {!cafeDataLoaded && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '20px',
                    borderRadius: '8px',
                    zIndex: 2000
                }}>
                    カフェデータを読み込み中...
                </div>
            )}
            {/* <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '5px',
                fontSize: '12px',
                fontFamily: 'monospace',
                zIndex: 1000
            }}>
                Zoom: {currentZoom.toFixed(1)}
            </div> */}
            {currentZoom <= ZOOM_THRESHOLD && (
                <div className="zoom-warning">
                    <p>表示範囲が広すぎます。ズームしてください 🔍</p>
                </div>
            )}
            {selected && <Information cafe={selected} onClose={() => setSelected(null)} />}
            {showMixerPanel && (
                <MixerPanel 
                    onClose={handleCloseMixerPanel}
                    onShowCafeList={handleShowCafeList}
                    onAreaSelect={handleAreaSelect}
                />
            )}
            {showCafeList && (
                <CafeList 
                    onCafeSelect={handleCafeSelect}
                    onClose={handleCloseCafeList}
                />
            )}
        </div>
    )
}
