import { useState, useEffect } from "react"
import "./CafeList.css"
import { getCafeData, type Cafe } from "../../lib/dataClient"

interface CafeListProps {
  onCafeSelect: (cafe: Cafe) => void
  onClose: () => void
}

export default function CafeList({ onCafeSelect, onClose }: CafeListProps) {
  const [allCafes, setAllCafes] = useState<Cafe[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadCafes = async () => {
      try {
        const cafes = await getCafeData()
        setAllCafes(cafes)
      } catch (error) {
        console.error('Failed to load cafes:', error)
      }
    }
    loadCafes()
  }, [])

  // 検索フィルタリング
  const filteredCafes = allCafes.filter((cafe: Cafe) => 
    cafe.store_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cafe.address?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCafeClick = (cafe: Cafe) => {
    onCafeSelect(cafe)
    onClose() // リスト選択後は閉じる
  }

  return (
    <div className="cafe-list">
      <div className="cafe-list__header">
        <h2 className="cafe-list__title">カフェ一覧</h2>
        <button 
          className="cafe-list__close" 
          onClick={onClose}
          aria-label="閉じる"
        >
          ×
        </button>
      </div>

      <div className="cafe-list__search">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="店名や住所で絞り込み..."
          className="cafe-list__search-input"
        />
      </div>

      <div className="cafe-list__body">
        <div className="cafe-list__count">
          {filteredCafes.length}件のカフェ
        </div>
        
        <div className="cafe-list__items">
          {filteredCafes.map((cafe: Cafe) => (
            <div 
              key={cafe.id} 
              className="cafe-list__item"
              onClick={() => handleCafeClick(cafe)}
            >
              {cafe.media_url && (
                <img 
                  src={cafe.media_url} 
                  alt={cafe.store_name || "cafe"} 
                  className="cafe-list__item-image"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none"
                  }}
                />
              )}
              <div className="cafe-list__item-content">
                <h3 className="cafe-list__item-title">
                  {cafe.store_name || "—"}
                </h3>
                <p className="cafe-list__item-address">
                  {cafe.address || "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}