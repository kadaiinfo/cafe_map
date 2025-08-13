import "./CafeMarker.css"

// 地図上に描画するマーカーを作成する
export function CafeMarkerElement(mediaUrl: string | null | undefined, storeName?: string | null): HTMLDivElement {
    const safeUrl = mediaUrl ?? "" // null/undefinedなら空文字にする
    const safeName = storeName ?? "cafe"
    
    
    const el = document.createElement("div")
    el.className = "cafe-marker"
  
    const img = document.createElement("img")
    img.src = safeUrl
    img.alt = safeName
    img.loading = "lazy"
    img.className = "cafe-marker__img"
  
    img.onerror = () => {
      // 画像がない場合はアイコンだけ出す
    el.classList.add("cafe-marker--fallback")
    el.textContent = "📷"
    }
  
    el.appendChild(img)
    return el
  }
  