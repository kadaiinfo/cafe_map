import maplibregl from "maplibre-gl"
import type { Cafe } from "../../../lib/dataClient"

// ポップアップを表示する関数
export const showPopup = (
  cafe: Cafe,
  map: maplibregl.Map | null,
  currentPopupRef: React.MutableRefObject<maplibregl.Popup | null>,
  onPopupClick?: () => void
) => {
  if (!map) {
    return
  }

  // 既存のポップアップがあれば削除
  if (currentPopupRef.current) {
    currentPopupRef.current.remove()
    currentPopupRef.current = null
  }

  // 新しいポップアップを作成
  const popup = new maplibregl.Popup({
    offset: 35,
    closeButton: false,
    closeOnClick: false, // 地図クリックで閉じないようにする（MapView側で制御）
    className: 'custom-popup'
  }).setText(cafe.store_name || 'カフェ')

  // 少し遅延させてポップアップを地図に追加
  setTimeout(() => {
    if (map) {
      popup.setLngLat([cafe.lng, cafe.lat]).addTo(map)
      currentPopupRef.current = popup

      // ポップアップ要素にクリックイベントを追加
      if (onPopupClick) {
        const popupElement = popup.getElement()
        // ポップアップのコンテンツ部分（吹き出しの中身）にイベントリスナーを追加
        const content = popupElement.querySelector('.maplibregl-popup-content') as HTMLElement
        if (content) {
          content.style.cursor = 'pointer' // クリック可能であることを示すカーソル
          content.addEventListener('click', (e) => {
            e.stopPropagation() // 地図へのクリック伝播を防ぐ
            onPopupClick()
          })
        }
      }
    }
  }, 10)
}

// ポップアップを非表示にする関数
export const hidePopup = (
  currentPopupRef: React.MutableRefObject<maplibregl.Popup | null>
) => {
  if (currentPopupRef.current) {
    currentPopupRef.current.remove()
    currentPopupRef.current = null
  }
}