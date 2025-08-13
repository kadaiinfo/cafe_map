// 地図上に描画するマーカーを作成する
export function createCafeMarkerElement(mediaUrl: string | null | undefined, storeName?: string | null): HTMLDivElement {
    const safeUrl = mediaUrl ?? "" // null/undefinedなら空文字にする
    const safeName = storeName ?? "cafe"
    
    
    const el = document.createElement("div")
    el.style.width = "40px"
    el.style.height = "40px"
    el.style.borderRadius = "50%"
    el.style.border = "3px solid #fff"
    el.style.overflow = "hidden"
    el.style.boxShadow = "0 2px 4px rgba(0,0,0,.3)"
    el.style.cursor = "pointer"
  
    const img = document.createElement("img")
    img.src = safeUrl
    img.alt = safeName
    img.loading = "lazy"
    img.style.width = "100%"
    img.style.height = "100%"
    img.style.objectFit = "cover"
    img.style.display = "block"
  
    img.onerror = () => {
      el.style.background = "#ff6b6b"
      el.textContent = "📷"
      el.style.color = "#fff"
      el.style.display = "flex"
      el.style.alignItems = "center"
      el.style.justifyContent = "center"
      el.style.fontSize = "12px"
    }
  
    el.appendChild(img)
    return el
  }
  