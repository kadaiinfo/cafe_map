import cafe_data from "../data/instagram_posts_with_coords.json"

// 軽量データ構造（地図表示用）
export type LightCafe = {
    id: string
    lat: number
    lng: number
    store_name: string | null
    address: string | null
    media_url: string | null  // サムネイル用
}

// 詳細データ構造（情報パネル用）
export type DetailedCafe = {
    id: string
    store_name?: string | null
    address?: string | null
    caption?: string | null
    media_url?: string | null
    thumbnail_url?: string | null
    permalink?: string | null
    username?: string | null
    lat: number
    lng: number
    media_type?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | string
    like_count?: number
    comments_count?: number
    timestamp?: string
}

// 軽量データを生成（初期読み込み用）
const lightCafeData: LightCafe[] = cafe_data.map(cafe => ({
    id: cafe.id,
    lat: cafe.lat,
    lng: cafe.lng,
    store_name: cafe.store_name ?? null,
    address: cafe.address ?? null,
    media_url: cafe.media_type === "VIDEO" ? cafe.thumbnail_url ?? null : cafe.media_url ?? null // VIDEOの場合はサムネイルを使用
}))

// 軽量データを取得
export const getCafeData = (): LightCafe[] => {
    return lightCafeData
}

// 詳細データを取得（IDベース）
export const getCafeDetail = (id: string): DetailedCafe | null => {
    const cafe = cafe_data.find(cafe => cafe.id === id)
    return cafe || null
}

// 検索機能（軽量データベース）
export const searchCafes = (query: string): LightCafe[] => {
    if (!query.trim()) {
        return lightCafeData
    }
    
    const searchTerm = query.toLowerCase()
    return lightCafeData.filter(cafe => {
        const storeName = cafe.store_name ? cafe.store_name.toLowerCase() : ''
        const address = cafe.address ? cafe.address.toLowerCase() : ''
        return storeName.includes(searchTerm) || address.includes(searchTerm)
    })
}

