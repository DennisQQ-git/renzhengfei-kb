import Link from 'next/link'
import Reveal from '@/components/Reveal'
import { getIndexData } from '@/lib/data'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const index = getIndexData()
  return index.years.map(year => ({ year: String(year) }))
}

export async function generateMetadata({ params }: { params: Promise<{ year: string }> }): Promise<Metadata> {
  const { year } = await params
  return {
    title: `${year} 年讲话`,
    description: `任正非 ${year} 年讲话合集`,
  }
}

export default async function YearPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params
  const yearNum = parseInt(year)
  const index = getIndexData()
  const docs = index.documents.filter(d => d.year === yearNum)
  const yearIndex = index.years.indexOf(yearNum)
  const prevYear = yearIndex > 0 ? index.years[yearIndex - 1] : null
  const nextYear = yearIndex < index.years.length - 1 ? index.years[yearIndex + 1] : null
  const yearTags = [...new Set(docs.flatMap(d => d.tags))].filter(Boolean).sort()

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Reveal>
        <div className="text-center pb-5 border-b border-cream-200">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-gold-600 transition-colors mb-3">
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
              <Link href={`/year/${prevYear}`} className="btn-ghost text-sm gap-1">
                ← {prevYear}
              </Link>
            ) : <div />}
            {nextYear ? (
              <Link href={`/year/${nextYear}`} className="btn-ghost text-sm gap-1">
                {nextYear} →
              </Link>
            ) : <div />}
          </div>

          {yearTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {yearTags.map(tag => (
                <Link
                  key={tag}
                  href={`/tag/${encodeURIComponent(tag)}`}
                  className="text-xs text-ink-400 bg-cream-100 hover:bg-cream-200 px-2.5 py-1 rounded-full transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </Reveal>

      <div className="space-y-3">
        {docs.map((doc, i) => (
          <Reveal key={doc.slug} delay={(i % 5 + 1) as 1 | 2 | 3 | 4 | 5}>
            <Link
              href={`/article/${doc.slug}`}
              className="card-hover p-4 md:p-5 block group"
            >
              <h2 className="text-base md:text-lg font-serif font-semibold text-ink-800 group-hover:text-gold-600 transition-colors">
                {doc.title}
              </h2>
              {doc.excerpt && (
                <p className="text-sm text-ink-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {doc.excerpt}
                </p>
              )}
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
