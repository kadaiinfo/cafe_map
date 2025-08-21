import { useState,useEffect, useRef, useCallback } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import "./MapView.css"
import { getCafeData, searchCafes, type Cafe } from "../../lib/dataClient"
import Information from "../Information/Information.tsx"
import Search from "../Search/Search.tsx"
import MixerPanel from "../MixerPanel/MixerPanel.tsx"
import CafeList from "../CafeList/CafeList.tsx"

// Utils imports
import { saveMapState, loadMapState } from "./utils/mapState"
import { showPopup, hidePopup } from "./utils/popupManager"
import { handleCafeSelection } from "./utils/mapPosition"
import { updateMarkersWithZoom } from "./utils/markerManager"
import { handleSearch } from "./utils/searchHandler"

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
    const [allCafes, setAllCafes] = useState<Cafe[]>([]) // 全店舗情報
    const [cafeDataLoaded, setCafeDataLoaded] = useState(false) // カフェデータの読み込み状態
    const [selected, setSelected] = useState<Cafe | null>(null)
    const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map()) // マーカーの参照をMapで管理
    const currentPopupRef = useRef<maplibregl.Popup | null>(null) // 現在表示中のポップアップの参照
    const [mapLoaded, setMapLoaded] = useState(false) // マップの読み込み状態
    const DEFAULT_ZOOM_LEVEL = 17 // デフォルトのズームレベル
    const [currentZoom, setCurrentZoom] = useState(DEFAULT_ZOOM_LEVEL) // 現在のズームレベル
    const ZOOM_THRESHOLD = 14 // この値以下だとマーカーを表示しない
    const [showMixerPanel, setShowMixerPanel] = useState(false) // MixerPanel表示状態
    const [showCafeList, setShowCafeList] = useState(false) // CafeList表示状態
    const [mapCenter, setMapCenter] = useState<[number, number] | null>(null) // 地図中心位置

    // カフェデータを読み込む（コンポーネント初回マウント時のみ）
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

    // マーカーを更新する関数（currentZoom使用）
    // Reactコンポーネントは通常stateやpropsが変わるたびに再レンダリングされる
    // useCallbackすることで、依存が変わらない限り同じ関数を再利用
    const updateMarkers = useCallback(() => {
        updateMarkersWithZoom(
            currentZoom,
            mapRef.current,
            cafeDataLoaded,
            allCafes,
            ZOOM_THRESHOLD,
            markersRef,
            setSelected
        )
    }, [currentZoom, cafeDataLoaded, allCafes, ZOOM_THRESHOLD])

    // -------- 設定（MixerPanel）の処理------------
    // 設定（MixerPanel）を開く - 検索バーの設定ボタンクリック時
    const handleSettingsClick = () => {
        setShowMixerPanel(true) // 設定パネルを開く
    }

    // 設定パネルを閉じる - MixerPanel の×ボタンクリック時
    const handleCloseMixerPanel = () => {
        setShowMixerPanel(false) // 設定パネルを閉じる
    }

    // カフェ一覧を表示 - MixerPanel の「カフェ一覧」ボタンクリック時
    const handleShowCafeList = () => {
        setShowMixerPanel(false)  // 設定パネルを閉じる
        setShowCafeList(true)     // カフェ一覧を開く
    }

    // カフェ一覧を閉じる - CafeList の×ボタンクリック時
    const handleCloseCafeList = () => {
        setShowCafeList(false) // カフェ一覧を閉じる
    }

    // カフェ一覧からカフェを選択 - CafeList のアイテムクリック時
    const handleCafeSelect = (cafe: Cafe) => {
        handleCafeSelection(cafe, mapRef.current, setSelected)  // 地図移動＋選択状態更新（デフォルトズーム固定）
    }

    // エリア選択で地図移動 - MixerPanel の地域ボタンクリック時
    const handleAreaSelect = (lng: number, lat: number) => {
        if (mapRef.current) {
            mapRef.current.flyTo({
                center: [lng, lat],
                zoom: DEFAULT_ZOOM_LEVEL  // デフォルトズームで指定座標に移動
            })
        }
    }


    // ---------検索(Search)の処理---------------
    // 検索実行 - Search コンポーネントからの検索クエリ処理
    const handleSearchAction = async (query: string) => {
        await handleSearch(
            query,
            searchCafes,
            mapRef.current,
            mapLoaded,
            setSelected,
            updateMarkers
        )
    }

    // 地図を初期化・イベントリスナー設定（コンポーネント初回マウント時のみ）
    useEffect(() => {
        if (!mapContainerRef.current) return


        // 保存された地図状態を復元(savedStateがあれば地図の中心やズームを復元，なければデフォルト位置に)
        const savedState = loadMapState()
        const initialCenter: [number, number] = savedState?.center || [130.5548586, 31.5901844]
        const initialZoom = savedState?.zoom || DEFAULT_ZOOM_LEVEL

        // maplibregl.Map で地図を生成し，mapRef.currentに保持する
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


        // 以下に2つのコールバック関数を定義
        // 地図の移動時に地図の状態を更新するコールバック関数
        const handleMoveEnd = () => {
            const currentMapZoom = map.getZoom()
            const center = map.getCenter()
            // 状態を更新してuseEffectで地図の状態の更新をトリガー
            setCurrentZoom(currentMapZoom)
            setMapCenter([center.lng, center.lat])
            // 位置変更を保存
            saveMapState([center.lng, center.lat], currentMapZoom)
        }
        
        // ズーム操作が完了した時に呼ばれるコールバック関数
        const handleZoomEnd = () => {
            const newZoom = map.getZoom() // 現在のzoomレベルを保存
            const center = map.getCenter() // 現在の地図中心座標を保存
            setCurrentZoom(newZoom) // 変更を反映
            saveMapState([center.lng, center.lat], newZoom) //ローカルストレージに保存
        }
        
        // maplibregl.Map が提供するイベントにリスナー
        map.on('moveend', handleMoveEnd) // ユーザーが地図をドラッグして移動し終わったときに handleMoveEnd を実行
        map.on('zoomend', handleZoomEnd) // ユーザーが地図のズーム操作を終えたときに handleZoomEnd を実行

        // クリーンアップ関数：useEffectが終了するときmapをremoveする
        return () => {
            map.off('moveend', handleMoveEnd)
            map.off('zoomend', handleZoomEnd)
            map.remove()
        }
    }, []) //初回マウント時だけ実行（依存配列が [] なので1回きり）


    // 初回マーカー表示（地図とカフェデータ読み込み完了時のみ）
    useEffect(() => {
        if (mapLoaded && cafeDataLoaded) {
            updateMarkers()
        }
    }, [mapLoaded, cafeDataLoaded, updateMarkers]) //どれか更新が入ると処理が走る


    // マーカー更新（ズーム・地図移動時に毎回実行）
    useEffect(() => {
        if (mapRef.current && cafeDataLoaded && mapLoaded) {
            updateMarkers()
        }
    }, [currentZoom, mapCenter, updateMarkers, cafeDataLoaded, mapLoaded]) //どれか更新が入ると処理が走る

    
    // ポップアップ表示制御（カフェ選択状態変更時に毎回実行）
    useEffect(() => {
        console.log('selected changed:', selected?.store_name || 'null')
        if (selected) {
            showPopup(selected, mapRef.current, currentPopupRef)
        } else {
            hidePopup(currentPopupRef)
        }
    }, [selected]) 




    // ref={mapContainerRef}で、以下のdiv要素をmapContainerRef.currentに入れる
    return (
        <div className="map-layout">
            <Search onSearch={handleSearchAction} onSettingsClick={handleSettingsClick} />
            <div ref={mapContainerRef} className="map-container" />

            {/* カフェデータの読み込み中の表示 */}
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

            {/* 表示範囲が広すぎる時の表示 */}
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