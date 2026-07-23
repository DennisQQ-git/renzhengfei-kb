import Link from 'next/link'
import Reveal from '@/components/Reveal'
import { getIndexData, getFeatured } from '@/lib/data'
import type { DocumentMeta } from '@/lib/types'

const TAG_CATEGORIES: Record<string, string[]> = {
  '技术创新': ['5G', 'HarmonyOS', '半导体', '基础研究', '备胎计划', '操作系统', '海思', '研发管理', '芯片', '鸿蒙', '主航道', '网络安全'],
  '公司管理': ['IBM', 'IPD', 'ISC', 'LTC', '人力资源', '价值分配', '企业制度', '企业文化', '决策机制', '企业价值观', '华为管理', '流程变革', '灰度', '熵减', '管理', '管理体系', '管理变革', '管理哲学', '组织活力', '自我批判', '聚焦', '对抗机制'],
  '关键人物': ['任正非', '孟晚舟', '梁华', '胡厚崑', '郭平', '徐直军', '余承东', '何庭波'],
}

export default function HomePage() {
  const indexData = getIndexData()
  const { years, documents, topics, allTags, total } = indexData
  const recentDocs = [...documents].reverse().slice(0, 10)
  const featuredDocs = getFeatured()

  const tagCounts: Record<string, number> = {}
  documents.forEach(d => {
    d.tags?.forEach(t => {
      if (t) tagCounts[t] = (tagCounts[t] || 0) + 1
    })
  })
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])

  const nonBookTopics = topics.filter(t => t.category !== '管理思想丛书')

  return (
    <div className="space-y-16 md:space-y-20">
      {/* Hero Section */}
      <section className="text-center pt-8 md:pt-12 pb-4">
        <Reveal>
          <div className="inline-block mb-5">
            <span className="text-xs font-medium text-gold-600 tracking-[0.2em] uppercase bg-gold-400/10 px-4 py-1.5 rounded-full">
              华为创始人管理思想全集
            </span>
          </div>
        </Reveal>
        <Reveal delay={1}>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-ink-800 leading-tight">
            任正非历年讲话
          </h1>
        </Reveal>
        <Reveal delay={2}>
          <p className="mt-4 text-base md:text-lg text-ink-400 max-w-xl mx-auto leading-relaxed">
            从<strong className="text-ink-600">1994</strong>到
            <strong className="text-ink-600">2025</strong>，跨越三十余年的管理思想实录
          </p>
        </Reveal>
        <Reveal delay={3}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            <Stat value={`${years.length}`} label="年份" />
            <span className="text-cream-300 text-lg hidden sm:inline">|</span>
            <Stat value={`${total}`} label="文章" />
            <span className="text-cream-300 text-lg hidden sm:inline">|</span>
            <Stat value={`${allTags.length}`} label="标签" />
          </div>
        </Reveal>
        <Reveal delay={4}>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-400">
            <span className="bg-cream-100 px-2.5 py-1 rounded-md font-mono tracking-wide">
              V1.2
            </span>
            <span>by</span>
            <a
              href="https://github.com/DennisQQ-git"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-600 hover:text-gold-500 font-medium transition-colors"
            >
              Dennisqgh
            </a>
          </div>
        </Reveal>
      </section>

      {/* Topic Articles section */}
      <TopicSection topics={nonBookTopics} />

      {/* Management Philosophy Series */}
      <BookSeriesSection topics={topics} />

      {/* Featured Articles */}
      <FeaturedSection docs={featuredDocs} />

      {/* Tag Cloud */}
      <TagCloudSection sortedTags={sortedTags} />

      {/* Recent Updates */}
      <RecentSection docs={recentDocs} />
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-serif font-bold text-gold-600">{value}</div>
      <div className="text-xs text-ink-400 mt-0.5 tracking-wider">{label}</div>
    </div>
  )
}

function TopicSection({ topics }: { topics: DocumentMeta[] }) {
  return (
    <section>
      <Reveal>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-serif font-bold text-ink-800 flex items-center gap-2">
            <span className="w-1 h-5 bg-gold-500 rounded-full inline-block" />
            专题文章
          </h2>
        </div>
      </Reveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {topics.slice(0, 5).map((topic, i) => (
          <Reveal key={topic.slug} delay={(i % 5 + 1) as 1 | 2 | 3 | 4 | 5}>
            <Link
              href={`/article/${topic.slug}`}
              className="card-hover p-4 block group h-full"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gold-600 bg-gold-400/10 px-2 py-0.5 rounded">
                  专题
                </span>
              </div>
              <h3 className="text-sm font-serif font-semibold text-ink-800 group-hover:text-gold-600 transition-colors leading-snug">
                {topic.title}
              </h3>
              {topic.category && (
                <p className="text-[11px] text-ink-400 mt-2">{topic.category}</p>
              )}
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function BookSeriesSection({ topics }: { topics: DocumentMeta[] }) {
  const labels: Record<string, string> = {
    '以客户为中心': '业务管理',
    '以奋斗者为本': '人力资源管理',
    '价值为纲': '财经管理',
    '下一个倒下的会不会是华为': '企业哲学',
    '为客户服务': '客户价值',
    '熵减': '组织活力',
    '质量为纲': '质量管理',
    '从偶然到必然': '研发管理',
    '鸟儿背着太阳飞': '四部曲·一',
    '没有退路就是胜利之路': '四部曲·二',
    '最艰难的路是捷径': '四部曲·三',
    '在悖论中前进': '四部曲·四',
    '科学：无尽的前沿': '序言',
  }

  return (
    <section>
      <Reveal>
        <h2 className="text-xl font-serif font-bold text-ink-800 mb-5 flex items-center gap-2">
          <span className="w-1 h-5 bg-amber-500 rounded-full inline-block" />
          管理思想丛书
        </h2>
      </Reveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topics.filter(t => t.category === '管理思想丛书' && !t.slug.includes('-')).map((book, i) => {
          const label = labels[book.slug] || '管理思想'
          return (
            <Reveal key={book.slug} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
              <Link
                href={`/article/${book.slug}`}
                className="card-hover p-5 block group border-l-4 border-amber-400 bg-gradient-to-br from-white to-amber-50/30"
              >
                <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2.5 py-0.5 rounded inline-block mb-3">
                  {label}
                </span>
                <h3 className="text-base font-serif font-bold text-ink-800 group-hover:text-amber-700 transition-colors leading-snug mb-2">
                  {book.title}
                </h3>
                <p className="text-xs text-ink-400 leading-relaxed line-clamp-3">
                  {book.tags.filter(Boolean).join(' · ')}
                </p>
              </Link>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

function FeaturedSection({ docs }: { docs: any[] }) {
  return (
    <section>
      <Reveal>
        <h2 className="text-xl font-serif font-bold text-ink-800 mb-5 flex items-center gap-2">
          <span className="w-1 h-5 bg-gold-500 rounded-full inline-block" />
          精选文章
        </h2>
      </Reveal>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
        {docs.slice(0, 10).map((doc: any) => (
          <Link
            key={doc.slug}
            href={`/article/${doc.slug}`}
            className="card-hover p-4 min-w-[220px] sm:min-w-[260px] w-[260px] flex-shrink-0 snap-start block group"
          >
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-xs font-medium text-ink-400 bg-cream-100 px-2 py-0.5 rounded">
                {doc.year}
              </span>
              {doc.tags?.slice(0, 1).filter(Boolean).map((tag: string) => (
                <span key={tag} className="text-xs text-gold-600">#{tag}</span>
              ))}
            </div>
            <h3 className="text-sm font-serif font-semibold text-ink-800 group-hover:text-gold-600 transition-colors duration-200 line-clamp-3 leading-snug">
              {doc.title}
            </h3>
            <p className="text-xs text-ink-400 mt-2 line-clamp-2 leading-relaxed">
              {doc.excerpt}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}

function TagCloudSection({ sortedTags }: { sortedTags: [string, number][] }) {
  return (
    <section>
      <Reveal>
        <h2 className="text-xl font-serif font-bold text-ink-800 mb-5 flex items-center gap-2">
          <span className="w-1 h-5 bg-gold-500 rounded-full inline-block" />
          标签云
        </h2>
      </Reveal>
      <div className="space-y-6">
        {Object.entries(TAG_CATEGORIES).map(([category, tagList]) => {
          const matched = sortedTags.filter(([tag]) => tagList.includes(tag))
          if (matched.length === 0) return null
          return (
            <div key={category}>
              <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">
                {category}
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {matched.map(([tag, count]) => (
                  <Link
                    key={tag}
                    href={`/tag/${encodeURIComponent(tag)}`}
                    className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                               border border-cream-200 bg-white text-sm text-ink-500
                               hover:border-gold-400 hover:text-gold-600 hover:shadow-sm
                               transition-all duration-200"
                  >
                    <span>{tag}</span>
                    <span className="text-xs text-cream-400 group-hover:text-gold-400 transition-colors">
                      {count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function RecentSection({ docs }: { docs: DocumentMeta[] }) {
  return (
    <section>
      <Reveal>
        <h2 className="text-xl font-serif font-bold text-ink-800 mb-5 flex items-center gap-2">
          <span className="w-1 h-5 bg-gold-500 rounded-full inline-block" />
          近期更新
        </h2>
      </Reveal>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
        {docs.map((doc, i) => (
          <Reveal key={doc.slug} delay={(i % 5 + 1) as 1 | 2 | 3 | 4 | 5}>
            <Link
              href={`/article/${doc.slug}`}
              className="card-hover p-4 min-w-[200px] sm:min-w-[220px] w-[220px] flex-shrink-0 snap-start block group"
            >
              <span className="text-xs text-ink-400 bg-cream-100 px-2 py-0.5 rounded inline-block mb-2">
                {doc.year}
              </span>
              <h3 className="text-sm font-serif font-semibold text-ink-800 group-hover:text-gold-600 transition-colors line-clamp-3 leading-snug">
                {doc.title}
              </h3>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
