import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import Reveal from '../components/Reveal'
import { fetchDocument } from '../utils/api'
import { useApp } from '../utils/context'
import type { Document, DocumentMeta } from '../types'

function getRelated(doc: Document, allDocs: DocumentMeta[], limit = 5) {
  const tagSet = new Set(doc.tags.filter(Boolean))
  const scored: { doc: DocumentMeta; score: number }[] = []

  for (const d of allDocs) {
    if (d.slug === doc.slug) continue

    let score = 0

    // Score 1: shared tags
    if (tagSet.size > 0) {
      score += d.tags.filter(t => tagSet.has(t)).length * 10
    }

    // Score 2: keyword match in title (from current doc's tags and title)
    const titleLower = d.title.toLowerCase()
    const excerptLower = (d.excerpt || '').toLowerCase()

    for (const tag of tagSet) {
      if (titleLower.includes(tag.toLowerCase())) score += 5
      else if (excerptLower.includes(tag.toLowerCase())) score += 2
    }

    // Score 3: if current doc has year, match same-year docs
    if (doc.year > 0 && d.year === doc.year) score += 3

    if (score > 0) scored.push({ doc: d, score })
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map(s => s.doc)
}

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { indexData } = useApp()
  const [doc, setDoc] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError('')
    fetchDocument(slug)
      .then(data => {
        setDoc(data)
        setLoading(false)
      })
      .catch(() => {
        setError('文章未找到')
        setLoading(false)
      })
    window.scrollTo(0, 0)
  }, [slug])

  const related = useMemo(() => {
    if (!doc) return []
    const allDocs = indexData?.documents || []
    return getRelated(doc, allDocs)
  }, [doc, indexData])

  // Chapter navigation
  const chapterNav = useMemo(() => {
    if (!doc?.metadata?.bookSlug || !doc.metadata.chapterNumber) return null
    const meta = doc.metadata as Record<string, any>
    const chapters = (meta.chapters as string[]) || []
    if (chapters.length === 0) return null

    const idx = chapters.indexOf(doc.slug)
    if (idx === -1) return null

    return {
      prevSlug: idx > 0 ? chapters[idx - 1] : null,
      nextSlug: idx < chapters.length - 1 ? chapters[idx + 1] : null,
      bookSlug: meta.bookSlug as string,
      bookTitle: meta.book as string,
    }
  }, [doc])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !doc) {
    return (
      <div className="text-center py-20">
        <p className="text-ink-400">{error || '文章未找到'}</p>
        <Link to="/" className="btn-primary mt-4 inline-block">返回首页</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back link */}
      <Reveal>
        <Link
          to={doc.metadata?.bookSlug ? `/article/${doc.metadata.bookSlug}` : doc.year ? `/year/${doc.year}` : '/'}
          className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-gold-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {doc.metadata?.bookSlug ? `返回《${((doc.metadata as any).book || '').replace(/[《》].*/, '》')}` : doc.year ? `返回 ${doc.year} 年` : '返回首页'}
        </Link>
      </Reveal>

      {/* Article header */}
      <Reveal delay={1}>
        <article>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {doc.year > 0 && (
              <Link
                to={`/year/${doc.year}`}
                className="text-xs font-medium text-gold-600 bg-gold-400/10 px-3 py-1 rounded-full hover:bg-gold-400/20 transition-colors"
              >
                {doc.year}
              </Link>
            )}
            {doc.isTopic && (
              <span className="text-xs font-medium text-ink-500 bg-cream-200 px-3 py-1 rounded-full">
                {(doc.metadata as any)?.bookSlug ? '丛书' : '专题'}
              </span>
            )}
            {doc.category && (
              <span className="text-xs text-ink-400">{doc.category}</span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-ink-800 leading-tight">
            {doc.title}
          </h1>

          {/* Chapter nav — top */}
          {chapterNav && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-cream-100">
              <div>
                {chapterNav.prevSlug ? (
                  <Link to={`/article/${chapterNav.prevSlug}`} className="text-xs text-ink-400 hover:text-gold-600 transition-colors">
                    ← 上一章
                  </Link>
                ) : <span />}
              </div>
              <Link to={`/article/${chapterNav.bookSlug}`} className="text-xs text-gold-600 hover:text-gold-500 transition-colors font-medium">
                返回目录
              </Link>
              <div>
                {chapterNav.nextSlug ? (
                  <Link to={`/article/${chapterNav.nextSlug}`} className="text-xs text-ink-400 hover:text-gold-600 transition-colors">
                    下一章 →
                  </Link>
                ) : <span />}
              </div>
            </div>
          )}

          {/* Tags */}
          {doc.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {doc.tags.map(tag => (
                <Link
                  key={tag}
                  to={`/tag/${encodeURIComponent(tag)}`}
                  className="text-xs text-ink-400 bg-cream-100 hover:bg-cream-200 px-2.5 py-1 rounded-full transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </article>
      </Reveal>

      {/* Article body */}
      <Reveal delay={2}>
        <div
          className="prose-custom"
          dangerouslySetInnerHTML={{ __html: doc.html }}
        />
      </Reveal>

      {/* Chapter nav — bottom */}
      {chapterNav && (
        <Reveal delay={2}>
          <div className="flex items-center justify-between border-t border-cream-200 pt-5">
            <div>
              {chapterNav.prevSlug ? (
                <Link to={`/article/${chapterNav.prevSlug}`} className="btn-secondary text-sm inline-flex items-center gap-1">
                  ← 上一章
                </Link>
              ) : <span />}
            </div>
            <Link to={`/article/${chapterNav.bookSlug}`} className="text-xs text-gold-600 hover:text-gold-500 transition-colors">
              返回目录
            </Link>
            <div>
              {chapterNav.nextSlug ? (
                <Link to={`/article/${chapterNav.nextSlug}`} className="btn-secondary text-sm inline-flex items-center gap-1">
                  下一章 →
                </Link>
              ) : <span />}
            </div>
          </div>
        </Reveal>
      )}

      {/* Related reading */}
      {related.length > 0 && (
        <Reveal delay={3}>
          <div className="border-t border-cream-200 pt-6 mt-2">
            <h2 className="text-lg font-serif font-bold text-ink-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-gold-500 rounded-full inline-block" />
              推荐阅读
            </h2>
            <div className="space-y-3">
              {related.map((r, i) => (
                <Link
                  key={r.slug}
                  to={`/article/${r.slug}`}
                  className="card-hover p-3 md:p-4 block group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {r.year > 0 && (
                      <span className="text-[11px] text-ink-400 bg-cream-100 px-2 py-0.5 rounded">
                        {r.year}
                      </span>
                    )}
                    {r.category === '管理思想丛书' ? (
                      <span className="text-[11px] text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                        丛书
                      </span>
                    ) : r.isTopic ? (
                      <span className="text-[11px] text-gold-600 bg-gold-400/10 px-2 py-0.5 rounded">
                        专题
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-sm font-serif font-semibold text-ink-800 group-hover:text-gold-600 transition-colors leading-snug">
                    {r.title}
                  </h3>
                  {r.excerpt && (
                    <p className="text-xs text-ink-400 mt-1 line-clamp-1 leading-relaxed">
                      {r.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* Navigation */}
      {!chapterNav && (
        <Reveal delay={3}>
          <div className="border-t border-cream-200 pt-6 mt-12">
            <Link
              to={doc.year ? `/year/${doc.year}` : '/'}
              className="btn-secondary text-sm"
            >
              ← 返回{doc.year ? `${doc.year} 年` : '首页'}
            </Link>
          </div>
        </Reveal>
      )}
    </div>
  )
}
