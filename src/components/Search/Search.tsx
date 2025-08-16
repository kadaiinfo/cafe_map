import { useState } from "react"
import "./Search.css"
import iconImage from "./icon.jpg"
import mixerIcon from "./mixer.svg"

interface SearchProps {
  onSearch: (query: string) => void
  onSettingsClick?: () => void
}

export default function Search({ onSearch, onSettingsClick }: SearchProps) {
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <img src={iconImage} alt="検索アイコン" className="search-icon" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="店名や住所で検索..."
            className="search-input"
          />
        </div>
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
      </form>
    </div>
  )
}