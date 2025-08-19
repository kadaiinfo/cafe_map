import "./CafeMarker.css"

// 地図上に描画するマーカーを作成する
export function CafeMarkerElement(mediaUrl: string | null | undefined, storeName?: string | null): HTMLDivElement {
    const safeUrl = mediaUrl ?? "" // null/undefinedなら空文字にする
    const safeName = storeName ?? "cafe"
    
    
    const el = document.createElement("div")
    el.className = "cafe-marker"
  
    // 画像URLが空の場合は最初からフォールバック表示
    if (!safeUrl.trim()) {
        el.classList.add("cafe-marker--fallback")
        el.textContent = "📷"
        return el
    }
  
    const img = document.createElement("img")
    img.src = safeUrl
    img.alt = safeName
    img.loading = "lazy"
    img.className = "cafe-marker__img"
  
    img.onerror = () => {
      // 画像読み込み失敗時はアイコンだけ出す
      img.style.display = "none"
      el.classList.add("cafe-marker--fallback")
      el.textContent = "📷"
    }
  
    el.appendChild(img)
    return el
  }
  