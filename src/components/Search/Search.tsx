import { useState } from "react"
import "./Search.css"

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
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="店名や住所で検索...ああ"
          className="search-input"
        />
        <button type="submit" className="search-button">
          検索
        </button>
      </form>
    </div>
  )
}