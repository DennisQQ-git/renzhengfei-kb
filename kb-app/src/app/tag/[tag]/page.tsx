import Link from 'next/link'
import Reveal from '@/components/Reveal'
import { getIndexData } from '@/lib/data'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const index = getIndexData()
  return index.allTags.map(tag => ({ tag: encodeURIComponent(tag) }))
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params
  return {
    title: `${decodeURIComponent(tag)} - 话题标签`,
    description: `任正非讲话中关于「${decodeURIComponent(tag)}」的话题`,
  }
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  const index = getIndexData()
  const filtered = index.documents.filter(d => d.tags?.includes(decodedTag))

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Reveal>
        <div className="pb-5 border-b border-cream-200">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-gold-600 transition-colors mb-3">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            返回首页
          </Link>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-ink-800">
            #{decodedTag}
          </h1>
          <p className="text-sm text-ink-400 mt-1">
            {filtered.length} 篇相关文章
          </p>
        </div>
      </Reveal>

      <div className="space-y-3">
        {filtered.map((doc, i) => (
          <Reveal key={doc.slug} delay={(i % 5 + 1) as 1 | 2 | 3 | 4 | 5}>
            <Link
              href={`/article/${doc.slug}`}
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
              <h2 className="text-base md:text-lg font-serif font-semibold text-ink-800 group-hover:text-gold-600 transition-colors">
                {doc.title}
              </h2>
              {doc.excerpt && <p className="text-sm text-ink-400 mt-1.5 line-clamp-2">{doc.excerpt}</p>}
            </Link>
          </Reveal>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-ink-400 py-10">该标签下暂无文章</p>
        )}
      </div>
    </div>
  )
}
