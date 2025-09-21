import "./CafeMarker.css"

// 地図上に描画するマーカーを作成する
export function CafeMarkerElement(mediaUrl: string | null | undefined, storeName?: string | null): HTMLDivElement {
    const safeUrl = mediaUrl ?? "" // null/undefinedなら空文字にする
    const safeName = storeName ?? "cafe"
    
    console.log('Creating marker:', { mediaUrl, safeUrl, storeName }) // デバッグログ
    
    const el = document.createElement("div")
    el.className = "cafe-marker"
  
    // 画像URLが空の場合は最初からフォールバック表示
    if (!safeUrl.trim()) {
        el.classList.add("cafe-marker--fallback")
        const fallbackImg = document.createElement("img")
        fallbackImg.src = "/icon.jpg"
        fallbackImg.alt = "カフェ"
        fallbackImg.className = "cafe-marker__fallback-img"
        el.appendChild(fallbackImg)
        return el
    }
  
    const img = document.createElement("img")
    img.src = safeUrl
    img.alt = safeName
    img.loading = "lazy"
    img.className = "cafe-marker__img"
  
    img.onerror = () => {
      // 画像読み込み失敗時はアイコンだけ出す
      console.log('Image load failed for:', safeUrl) // デバッグログ
      img.style.display = "none"
      el.classList.add("cafe-marker--fallback")
      const fallbackImg = document.createElement("img")
      fallbackImg.src = "/icon.jpg"
      fallbackImg.alt = "カフェ"
      fallbackImg.className = "cafe-marker__fallback-img"
      el.appendChild(fallbackImg)
    }
  
    el.appendChild(img)
    return el
  }
  