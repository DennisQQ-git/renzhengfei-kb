import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Reveal from '../components/Reveal'
import { fetchDocument } from '../utils/api'
import type { Document } from '../types'

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>()
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
          to={doc.year ? `/year/${doc.year}` : '/topics'}
          className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-gold-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {doc.year ? `返回 ${doc.year} 年` : '返回专题'}
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
                专题
              </span>
            )}
            {doc.category && (
              <span className="text-xs text-ink-400">{doc.category}</span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-ink-800 leading-tight">
            {doc.title}
          </h1>

          {/* Tags */}
          {doc.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {doc.tags.map(tag => (
                <Link
                  key={tag}
                  to={`/topics/${encodeURIComponent(tag)}`}
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

      {/* Navigation */}
      <Reveal delay={3}>
        <div className="border-t border-cream-200 pt-6 mt-12">
          <Link
            to={doc.year ? `/year/${doc.year}` : '/topics'}
            className="btn-secondary text-sm"
          >
            ← 返回{doc.year ? `${doc.year} 年` : '专题'}
          </Link>
        </div>
      </Reveal>
    </div>
  )
}
