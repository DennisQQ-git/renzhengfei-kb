import Link from 'next/link'
import Reveal from '@/components/Reveal'
import { recommendedBooks } from '@/data/recommendedBooks'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  return recommendedBooks.map(book => ({ name: book.name }))
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params
  return {
    title: `《${name}》`,
    description: `任正非推荐书籍《${name}》的介绍及其对华为管理的影响`,
  }
}

export default async function BookPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  // Next.js static export URL-encodes Chinese dynamic params; decode before matching.
  const book = recommendedBooks.find(b => b.name === decodeURIComponent(name))

  if (!book) {
    return (
      <div className="text-center py-20">
        <p className="text-ink-400">未找到该书籍</p>
        <Link href="/" className="btn-primary mt-4 inline-block">返回首页</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Reveal>
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-gold-600 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          返回首页
        </Link>
      </Reveal>

      <Reveal delay={1}>
        <article>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-ink-800 leading-tight">
            《{book.name}》
          </h1>
          <p className="text-sm text-ink-400 mt-2">{book.author}</p>
        </article>
      </Reveal>

      <Reveal delay={2}>
        <div className="bg-white rounded-xl p-6 md:p-8 border border-cream-200">
          <h2 className="text-sm font-semibold text-ink-400 uppercase tracking-wider mb-3">书籍简介</h2>
          <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-line">{book.description}</p>
        </div>
      </Reveal>

      <Reveal delay={3}>
        <div className="bg-cream-100/60 rounded-xl p-6 md:p-8 border border-cream-200">
          <h2 className="text-sm font-semibold text-ink-400 uppercase tracking-wider mb-3">
            <span className="text-gold-600">与华为管理的关系</span>
          </h2>
          <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-line">{book.huaweiRelation}</p>
        </div>
      </Reveal>

      {book.links.length > 0 && (
        <Reveal delay={4}>
          <div>
            <h2 className="text-sm font-semibold text-ink-400 uppercase tracking-wider mb-3">参考资料</h2>
            <div className="space-y-2">
              {book.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gold-600 hover:text-gold-500 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {link.title}
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      <Reveal delay={5}>
        <div className="border-t border-cream-200 pt-6">
          <Link href="/" className="btn-primary text-sm">← 返回首页</Link>
        </div>
      </Reveal>
    </div>
  )
}
