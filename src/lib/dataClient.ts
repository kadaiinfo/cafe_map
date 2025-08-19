// import cafe_data from "../data/instagram_posts_with_coords.json"

// APIからデータを取得する型定義
type CafeDataFromAPI = {
    id: string
    store_name?: string | null
    address?: string | null
    lat: number
    lng: number
    caption?: string | null
    media_url?: string | null
    thumbnail_url?: string | null
    permalink?: string | null
    username?: string | null
    media_type?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | string
    like_count?: number
    comments_count?: number
    timestamp?: string
}

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

// APIから取得したデータのキャッシュ
let cafeDataCache: CafeDataFromAPI[] | null = null
let lightCafeDataCache: LightCafe[] | null = null

// APIからカフェデータを取得
const fetchCafeDataFromAPI = async (): Promise<CafeDataFromAPI[]> => {
    if (cafeDataCache) {
        return cafeDataCache
    }
    
    try {
        const response = await fetch('/api/fetch_cafedata')
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: CafeDataFromAPI[] = await response.json()
        cafeDataCache = data
        return data
    } catch (error) {
        console.error('Failed to fetch cafe data:', error)
        throw error
    }
}

// 軽量データを生成
const generateLightCafeData = (apiData: CafeDataFromAPI[]): LightCafe[] => {
    return apiData.map(cafe => ({
        id: cafe.id,
        lat: cafe.lat,
        lng: cafe.lng,
        store_name: cafe.store_name ?? null,
        address: cafe.address ?? null,
        media_url: cafe.media_type === "VIDEO" ? cafe.thumbnail_url ?? null : cafe.media_url ?? null
    }))
}

// 軽量データを取得
export const getCafeData = async (): Promise<LightCafe[]> => {
    if (lightCafeDataCache) {
        return lightCafeDataCache
    }
    
    const apiData = await fetchCafeDataFromAPI()
    lightCafeDataCache = generateLightCafeData(apiData)
    return lightCafeDataCache
}

// 詳細データを取得
export const getCafeDetail = async (id: string): Promise<DetailedCafe | null> => {
    const apiData = await fetchCafeDataFromAPI()
    const cafe = apiData.find(cafe => cafe.id === id)
    return cafe || null
}

// 検索機能
export const searchCafes = async (query: string): Promise<LightCafe[]> => {
    const lightData = await getCafeData()
    
    if (!query.trim()) {
        return lightData
    }
    
    const searchTerm = query.toLowerCase()
    return lightData.filter(cafe => {
        const storeName = cafe.store_name ? cafe.store_name.toLowerCase() : ''
        const address = cafe.address ? cafe.address.toLowerCase() : ''
        return storeName.includes(searchTerm) || address.includes(searchTerm)
    })
}

