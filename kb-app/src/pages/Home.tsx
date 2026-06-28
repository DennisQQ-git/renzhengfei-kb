import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Reveal from '../components/Reveal'
import { useApp } from '../utils/context'
import { fetchFeatured } from '../utils/api'

const TAG_CATEGORIES: Record<string, string[]> = {
  '技术创新': ['5G', 'HarmonyOS', '半导体', '基础研究', '备胎计划', '操作系统', '海思', '研发管理', '芯片', '鸿蒙', '主航道', '网络安全'],
  '公司管理': ['IBM', 'IPD', 'ISC', 'LTC', '人力资源', '价值分配', '企业制度', '企业文化', '决策机制', '企业价值观', '华为管理', '流程变革', '灰度', '熵减', '管理', '管理体系', '管理变革', '管理哲学', '组织活力', '自我批判', '聚焦', '对抗机制'],
  '关键人物': ['任正非', '孟晚舟', '梁华', '胡厚崑', '郭平', '徐直军', '余承东', '何庭波'],
}

export default function Home() {
  const { indexData } = useApp()
  const { years, documents, topics, allTags, total } = indexData

  const recentDocs = [...documents].reverse().slice(0, 10)

  const [featuredDocs, setFeaturedDocs] = useState<any[]>([])

  useEffect(() => {
    fetchFeatured().then(setFeaturedDocs).catch(() => setFeaturedDocs([]))
  }, [])

  const tagCounts: Record<string, number> = {}
  documents.forEach(d => {
    d.tags?.forEach(t => {
      if (t) tagCounts[t] = (tagCounts[t] || 0) + 1
    })
  })
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])

  const nonBookTopics = topics.filter(t => t.category !== '管理思想丛书')
  // Topic pagination: 5 per page
  const TOPICS_PER_PAGE = 5
  const topicPages = Math.ceil(nonBookTopics.length / TOPICS_PER_PAGE)
  const [topicPage, setTopicPage] = useState(0)
  const visibleTopics = nonBookTopics.slice(
    topicPage * TOPICS_PER_PAGE,
    (topicPage + 1) * TOPICS_PER_PAGE
  )

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
              V1.1
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

      {/* Topic Articles — paginated horizontally */}
      <section>
        <Reveal>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-serif font-bold text-ink-800 flex items-center gap-2">
              <span className="w-1 h-5 bg-gold-500 rounded-full inline-block" />
              专题文章
            </h2>
            {/* Page tabs */}
            {topicPages > 1 && (
              <div className="flex items-center gap-1.5">
                {Array.from({ length: topicPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setTopicPage(i)}
                    className={`w-7 h-7 text-xs rounded-lg transition-all duration-200 ${
                      i === topicPage
                        ? 'bg-ink-800 text-cream-50 font-medium'
                        : 'text-ink-400 hover:bg-cream-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {visibleTopics.map((topic, i) => (
            <Reveal key={topic.slug} delay={(i % 5 + 1) as 1 | 2 | 3 | 4 | 5}>
              <Link
                to={`/article/${topic.slug}`}
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

      {/* Management Philosophy Series — three books */}
      <section>
        <Reveal>
          <h2 className="text-xl font-serif font-bold text-ink-800 mb-5 flex items-center gap-2">
            <span className="w-1 h-5 bg-amber-500 rounded-full inline-block" />
            管理思想丛书
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topics.filter(t => t.category === '管理思想丛书' && !t.slug.includes('-')).map((book, i) => (
            <Reveal key={book.slug} delay={(i + 1) as 1 | 2 | 3}>
              <Link
                to={`/article/${book.slug}`}
                className="card-hover p-5 block group border-l-4 border-amber-400 bg-gradient-to-br from-white to-amber-50/30"
              >
                <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2.5 py-0.5 rounded inline-block mb-3">
                  {i === 0 ? '业务管理' : i === 1 ? '人力资源管理' : '财经管理'}
                </span>
                <h3 className="text-base font-serif font-bold text-ink-800 group-hover:text-amber-700 transition-colors leading-snug mb-2">
                  {book.title}
                </h3>
                <p className="text-xs text-ink-400 leading-relaxed line-clamp-3">
                  {book.tags.filter(Boolean).join(' · ')}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured Articles — random auto-scroll carousel */}
      <section>
        <Reveal>
          <h2 className="text-xl font-serif font-bold text-ink-800 mb-5 flex items-center gap-2">
            <span className="w-1 h-5 bg-gold-500 rounded-full inline-block" />
            精选文章
          </h2>
        </Reveal>
        <FeaturedCarousel docs={featuredDocs} />
      </section>

      {/* Tag Cloud — categorized */}
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
                      to={`/tag/${encodeURIComponent(tag)}`}
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

      {/* Recent — horizontal */}
      <section>
        <Reveal>
          <h2 className="text-xl font-serif font-bold text-ink-800 mb-5 flex items-center gap-2">
            <span className="w-1 h-5 bg-gold-500 rounded-full inline-block" />
            近期更新
          </h2>
        </Reveal>
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
          {recentDocs.map((doc, i) => (
            <Reveal key={doc.slug} delay={(i % 5 + 1) as 1 | 2 | 3 | 4 | 5}>
              <Link
                to={`/article/${doc.slug}`}
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

function FeaturedCarousel({ docs }: { docs: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const cardWidth = 280 + 12 // card + gap

  const scrollTo = (index: number) => {
    const el = scrollRef.current
    if (!el) return
    const max = Math.max(0, el.scrollWidth - el.clientWidth)
    const pos = Math.min(index * cardWidth, max)
    el.scrollTo({ left: pos, behavior: 'smooth' })
    setCurrentIndex(index)
  }

  const next = () => scrollTo(Math.min(currentIndex + 1, docs.length - 1))
  const prev = () => scrollTo(Math.max(currentIndex - 1, 0))

  // Auto-scroll
  useEffect(() => {
    if (isPaused) return
    intervalRef.current = setInterval(() => {
      const el = scrollRef.current
      if (!el) return
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2
      if (atEnd) {
        scrollTo(0)
      } else {
        scrollTo(currentIndex + 1)
      }
    }, 2500)
    return () => clearInterval(intervalRef.current)
  }, [currentIndex, isPaused])

  // Track scroll position for dots
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / cardWidth)
      setCurrentIndex(Math.min(idx, docs.length - 1))
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [cardWidth, docs.length])

  const visibleCount = Math.min(docs.length, 8)

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 pb-2"
      >
        {docs.slice(0, 10).map((doc) => (
          <Link
            key={doc.slug}
            to={`/article/${doc.slug}`}
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

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1
                   w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-cream-200
                   shadow-sm flex items-center justify-center text-ink-400
                   hover:text-ink-700 hover:bg-white hover:shadow-md
                   opacity-0 group-hover:opacity-100 transition-all duration-300
                   md:flex hidden"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1
                   w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-cream-200
                   shadow-sm flex items-center justify-center text-ink-400
                   hover:text-ink-700 hover:bg-white hover:shadow-md
                   opacity-0 group-hover:opacity-100 transition-all duration-300
                   md:flex hidden"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {Array.from({ length: Math.min(visibleCount, 8) }, (_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'w-5 bg-gold-500'
                : 'w-1.5 bg-cream-300 hover:bg-cream-400'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
