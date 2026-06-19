import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import { useDebounce } from '../utils/hooks'
import { searchDocuments } from '../utils/api'
import { useApp } from '../utils/context'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { indexData } = useApp()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const debouncedQuery = useDebounce(query, 200)
  const [results, setResults] = useState(indexData.documents)

  useEffect(() => {
    if (debouncedQuery) {
      setSearchParams({ q: debouncedQuery }, { replace: true })
      searchDocuments(debouncedQuery, indexData.documents).then(setResults)
    } else {
      setSearchParams({}, { replace: true })
      setResults([])
    }
  }, [debouncedQuery, indexData.documents, setSearchParams])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Reveal>
        <h1 className="text-2xl font-serif font-bold text-ink-800">搜索</h1>

        <div className="relative mt-4">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="输入关键词搜索讲话..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-base rounded-xl border border-cream-300 bg-white
                       text-ink-800 placeholder:text-cream-400
                       focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent
                       transition-all duration-200"
            autoFocus
          />
        </div>
      </Reveal>

      {debouncedQuery && (
        <Reveal delay={1}>
          <p className="text-sm text-ink-400">
            {results.length > 0
              ? `找到 ${results.length} 条结果`
              : '未找到匹配结果'}
          </p>
        </Reveal>
      )}

      <div className="space-y-3">
        {results.map((doc, i) => (
          <Reveal key={doc.slug} delay={((i % 5) + 1) as 1 | 2 | 3 | 4 | 5}>
            <Link
              to={`/article/${doc.slug}`}
              className="card-hover p-4 md:p-5 block group"
            >
              <div className="flex items-center gap-2 mb-2">
                {doc.year > 0 && (
                  <span className="text-xs text-ink-400 bg-cream-100 px-2 py-0.5 rounded">
                    {doc.year}
                  </span>
                )}
                {doc.isTopic && (
                  <span className="text-xs text-gold-600 bg-gold-400/10 px-2 py-0.5 rounded">
                    专题
                  </span>
                )}
              </div>
              <h2 className="text-base font-serif font-semibold text-ink-800 group-hover:text-gold-600 transition-colors">
                {doc.title}
              </h2>
              <p className="text-sm text-ink-400 mt-1.5 line-clamp-2 leading-relaxed">
                {doc.excerpt}
              </p>
              {doc.tags?.filter(Boolean).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {doc.tags.filter(Boolean).map((tag: string) => (
                    <span key={tag} className="text-[11px] text-ink-400 bg-cream-100 px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
