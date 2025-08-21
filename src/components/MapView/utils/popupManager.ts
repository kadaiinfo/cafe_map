import maplibregl from "maplibre-gl"
import type { Cafe } from "../../../lib/dataClient"

// ポップアップを表示する関数
export const showPopup = (
  cafe: Cafe,
  map: maplibregl.Map | null,
  currentPopupRef: React.MutableRefObject<maplibregl.Popup | null>
) => {
  console.log('showPopup called with cafe:', cafe.store_name, 'mapRef:', !!map)
  if (!map) {
    console.log('mapRef.current is null, returning')
    return
  }

  // 既存のポップアップがあれば削除
  if (currentPopupRef.current) {
    console.log('Removing existing popup')
    currentPopupRef.current.remove()
    currentPopupRef.current = null
  }

  // 新しいポップアップを作成
  const popup = new maplibregl.Popup({
    offset: 35,
    closeButton: false,
    className: 'custom-popup'
  }).setText(cafe.store_name || 'カフェ')

  console.log('Creating popup with text:', cafe.store_name || 'カフェ')

  // 少し遅延させてポップアップを地図に追加
  setTimeout(() => {
    if (map) {
      popup.setLngLat([cafe.lng, cafe.lat]).addTo(map)
      currentPopupRef.current = popup
      console.log('Popup added to map (delayed)')
    }
  }, 10)
  
  // デバッグ用：ポップアップ要素を確認
  setTimeout(() => {
    const popupElements = document.querySelectorAll('.maplibregl-popup')
    console.log('Popup elements found:', popupElements.length)
    popupElements.forEach((el, index) => {
      console.log(`Popup ${index}:`, el, 'visible:', window.getComputedStyle(el).display !== 'none')
    })
  }, 100)
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