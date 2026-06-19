import { useParams, Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import { useApp } from '../utils/context'

export default function YearView() {
  const { year } = useParams<{ year: string }>()
  const { indexData } = useApp()
  const yearNum = parseInt(year || '0')

  const docs = indexData.documents.filter(d => d.year === yearNum)
  const yearIndex = indexData.years.indexOf(yearNum)

  if (!year || docs.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-ink-400">该年份暂无文章</p>
        <Link to="/" className="btn-primary mt-4 inline-block">返回首页</Link>
      </div>
    )
  }

  const prevYear = yearIndex > 0 ? indexData.years[yearIndex - 1] : null
  const nextYear = yearIndex < indexData.years.length - 1 ? indexData.years[yearIndex + 1] : null

  const yearTags = [...new Set(docs.flatMap(d => d.tags))].filter(Boolean).sort()

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <Reveal>
        <div className="text-center pb-5 border-b border-cream-200">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-gold-600 transition-colors mb-3">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            返回首页
          </Link>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-ink-800">
            {yearNum}
          </h1>
          <p className="text-ink-400 mt-2 text-sm">
            共 <strong className="text-gold-600">{docs.length}</strong> 篇讲话
            {yearTags.length > 0 && (
              <span className="ml-2">· {yearTags.length} 个标签</span>
            )}
          </p>

          <div className="flex items-center justify-center gap-4 mt-4">
            {prevYear ? (
              <Link to={`/year/${prevYear}`} className="btn-ghost text-sm gap-1">
                ← {prevYear}
              </Link>
            ) : <div />}
            {nextYear ? (
              <Link to={`/year/${nextYear}`} className="btn-ghost text-sm gap-1">
                {nextYear} →
              </Link>
            ) : <div />}
          </div>

          {yearTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {yearTags.map(tag => (
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
        </div>
      </Reveal>

      {/* Article list */}
      <div className="space-y-3">
        {docs.map((doc, i) => (
          <Reveal key={doc.slug} delay={(i % 5 + 1) as 1 | 2 | 3 | 4 | 5}>
            <Link
              to={`/article/${doc.slug}`}
              className="card-hover p-4 md:p-5 block group"
            >
              <h2 className="text-base md:text-lg font-serif font-semibold text-ink-800 group-hover:text-gold-600 transition-colors">
                {doc.title}
              </h2>
              <p className="text-sm text-ink-400 mt-1.5 line-clamp-2 leading-relaxed">
                {doc.excerpt}
              </p>
              {doc.tags?.filter(Boolean).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {doc.tags.filter(Boolean).map(tag => (
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
