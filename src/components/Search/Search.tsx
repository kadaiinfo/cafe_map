import { useState, useEffect, useRef } from "react"
import "./Search.css"
// import iconImage from "./icon.jpg"
import mixerIcon from "./mixer.svg"
import { type Cafe } from "../../lib/dataClient"
import { normalizeText } from "../../utils/textNormalization"
import { hiraganaToRomaji } from "../../utils/romajiUtils"

interface SearchProps {
  onSearch: (query: string) => void
  onSettingsClick?: () => void
  onLocationClick?: () => void
  isLocating?: boolean
  cafes?: Cafe[]
  onSuggestionSelect?: (cafe: Cafe) => void
}

export default function Search({
  onSearch,
  onSettingsClick,
  onLocationClick,
  isLocating,
  cafes = [],
  onSuggestionSelect
}: SearchProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Cafe[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const isSelectionRef = useRef(false)

  // クリック外側の検知
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // 検索クエリが変わったらサジェストを更新
  useEffect(() => {
    if (isSelectionRef.current) {
      isSelectionRef.current = false
      return
    }

    if (!query.trim() || !cafes.length) {
      setSuggestions([])
      return
    }

    const normalizedQuery = normalizeText(query)
    const romajiQuery = hiraganaToRomaji(normalizedQuery)

    const filtered = cafes.filter(cafe => {
      const normalizedStoreName = normalizeText(cafe.store_name || "")
      const normalizedAddress = normalizeText(cafe.address || "")

      return normalizedStoreName.includes(normalizedQuery) ||
        normalizedAddress.includes(normalizedQuery) ||
        normalizedStoreName.toLowerCase().includes(romajiQuery) // ローマ字検索対応
    })
    setSuggestions(filtered)
    setShowSuggestions(true)
  }, [query, cafes])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestions(false)
    onSearch(query)
  }

  const handleSuggestionClick = (cafe: Cafe) => {
    isSelectionRef.current = true
    setQuery(cafe.store_name || "")
    setShowSuggestions(false)
    if (onSuggestionSelect) {
      onSuggestionSelect(cafe)
    }
  }

  return (
    <div className="search-container" ref={searchRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          {/* <img src={iconImage} alt="検索アイコン" className="search-icon" /> */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim() && suggestions.length > 0) {
                setShowSuggestions(true)
              }
            }}
            placeholder="店名や住所で検索..."
            className="search-input"
          />
        </div>
        <div className="search-buttons">
          {onSettingsClick && (
            <button
              type="button"
              onClick={onSettingsClick}
              className="settings-button"
              aria-label="設定"
            >
              <img src={mixerIcon} alt="設定" className="settings-icon" />
            </button>
          )}
          {onLocationClick && (
            <button
              type="button"
              onClick={onLocationClick}
              disabled={isLocating}
              className="location-button-search"
              aria-label="現在地を表示"
              title="現在地を表示"
            >
              <img src="/location.png" alt="現在地" className="location-icon" />
            </button>
          )}
        </div>
      </form>

      {/* サジェストリスト */}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="search-suggestions">
          {suggestions.map((cafe) => (
            <li
              key={cafe.id}
              className="search-suggestion-item"
              onClick={() => handleSuggestionClick(cafe)}
            >
              <div className="search-suggestion-name">{cafe.store_name || "—"}</div>
              <div className="search-suggestion-address">{cafe.address || "—"}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}