import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { RecommendedBook } from '../data/recommendedBooks'

export default function SidebarBooks({ books, onNavigate }: { books: RecommendedBook[]; onNavigate?: () => void }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ink-600 hover:bg-cream-100 hover:text-ink-800 transition-all duration-200 group"
      >
        <svg
          className={`w-3 h-3 text-cream-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-serif font-semibold">任总推荐书籍</span>
        <span className="text-xs text-ink-400 ml-auto">{books.length}本</span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="ml-5 pl-3 border-l-2 border-cream-200 space-y-0.5 py-1">
          {books.map(book => (
            <Link
              key={book.name}
              to={`/book/${encodeURIComponent(book.name)}`}
              onClick={onNavigate}
              className="block px-3 py-1.5 text-xs text-ink-500 hover:text-gold-600 hover:bg-cream-50 rounded transition-colors truncate"
            >
              《{book.name}》
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
