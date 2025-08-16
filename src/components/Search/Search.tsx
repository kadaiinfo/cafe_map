import { useState } from "react"
import "./Search.css"
import iconImage from "./icon.jpg"

interface SearchProps {
  onSearch: (query: string) => void
}

export default function Search({ onSearch }: SearchProps) {
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
      </form>
    </div>
  )
}