'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Reveal from '@/components/Reveal'
import { useDebounce } from '@/utils/hooks'
import { searchDocuments } from '@/lib/search'

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const debouncedQuery = useDebounce(query, 200)
  const [searchIndex, setSearchIndex] = useState<any[] | null>(null)
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    fetch('/data/search-index.json')
      .then(r => r.json())
      .then(setSearchIndex)
      .catch(() => setSearchIndex([]))
  }, [])

  useEffect(() => {
    if (!searchIndex) return
    if (debouncedQuery) {
      setResults(searchDocuments(debouncedQuery, searchIndex))
    } else {
      setResults([])
    }
  }, [debouncedQuery, searchIndex])

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
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索文章标题、内容、标签..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-cream-300 bg-white text-ink-800 placeholder:text-cream-400 text-base focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200"
            autoFocus
          />
        </div>
      </Reveal>

      {debouncedQuery && (
        <Reveal>
          <p className="text-sm text-ink-400">
            搜索 &ldquo;<strong className="text-ink-600">{debouncedQuery}</strong>&rdquo;
            {searchIndex ? `，共 ${results.length} 条结果` : '，加载索引中...'}
            {!searchIndex && (
              <span className="ml-2 inline-block w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin align-middle" />
            )}
          </p>
        </Reveal>
      )}

      <div className="space-y-3">
        {results.map((doc: any, i: number) => (
          <Reveal key={doc.slug} delay={(i % 5 + 1) as 1 | 2 | 3 | 4 | 5}>
            <Link
              href={`/article/${doc.slug}`}
              className="card-hover p-4 md:p-5 block group"
            >
              <div className="flex items-center gap-2 mb-1.5">
                {doc.year > 0 && (
                  <span className="text-xs text-ink-400 bg-cream-100 px-2 py-0.5 rounded">
                    {doc.year}
                  </span>
                )}
                {doc.category && (
                  <span className="text-xs text-ink-400">{doc.category}</span>
                )}
              </div>
              <h2 className="text-base md:text-lg font-serif font-semibold text-ink-800 group-hover:text-gold-600 transition-colors">
                {doc.title}
              </h2>
              {doc.excerpt && (
                <p className="text-sm text-ink-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {doc.excerpt}
                </p>
              )}
              {doc.tags?.filter(Boolean).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
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

        {debouncedQuery && searchIndex && results.length === 0 && (
          <div className="text-center py-16">
            <p className="text-ink-400">未找到相关结果</p>
            <p className="text-xs text-ink-300 mt-2">试试其他关键词</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
