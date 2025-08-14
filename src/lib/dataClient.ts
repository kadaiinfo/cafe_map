import cafe_data from "../data/instagram_posts_with_coords.json"

export const getCafeData = () => {
    return cafe_data
}

export const searchCafes = (query: string) => {
    if (!query.trim()) {
        return cafe_data
    }
    
    const searchTerm = query.toLowerCase()
    return cafe_data.filter(cafe => {
        const storeName = cafe.store_name ? cafe.store_name.toLowerCase() : ''
        const address = cafe.address ? cafe.address.toLowerCase() : ''
        return storeName.includes(searchTerm) || address.includes(searchTerm)
    })
}

