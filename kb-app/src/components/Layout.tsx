import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import ScrollToTop from './ScrollToTop'
import { useApp } from '../utils/context'
import { useScrollReveal } from '../utils/hooks'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { indexData } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedYear, setExpandedYear] = useState<number | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMenuOpen(false)
    }
  }

  const getYearCount = (year: number) =>
    indexData.documents.filter(d => d.year === year).length

  const getYearDocs = (year: number) =>
    indexData.documents.filter(d => d.year === year)

  // Category-based filtering
  const getCategoryDocs = (category: string) => {
    if (category === '任总内部讲话') {
      return indexData.documents.filter(d => !d.category && d.year > 0)
    }
    return indexData.documents.filter(d => d.category === category)
  }
  const getCategoryCount = (category: string) => getCategoryDocs(category).length

  const CATEGORIES = ['任总内部讲话', '任总媒体采访', '华为高管讲话', '媒体报道']

  return (
    <div className="min-h-screen bg-cream-50 relative">
      <div className="grain-overlay" />
      <ScrollToTop />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-cream-50/90 backdrop-blur-md border-b border-cream-200">
        <div className="container-page">
          <div className="flex items-center justify-between h-16">
            {/* Hamburger (triggers mobile sidebar) */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-ink-400 hover:bg-cream-100 transition-colors"
              aria-label="打开侧边栏"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-xl md:text-2xl font-serif font-bold text-ink-800 group-hover:text-gold-600 transition-colors duration-300">
                任正非讲话
              </span>
              <span className="hidden sm:inline text-xs text-ink-400 font-sans font-light tracking-wider uppercase">
                · 知识库
              </span>
            </Link>

            {/* Desktop Nav - simplified */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/" active={isActive('/')}>首页</NavLink>
              <NavLink to="/admin/users" active={isActive('/admin/users')}>管理</NavLink>

              {/* Search */}
              <form onSubmit={handleSearch} className="ml-4 relative">
                <input
                  type="text"
                  placeholder="搜索讲话..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-44 pl-9 pr-3 py-1.5 text-sm rounded-lg border border-cream-300 bg-white/60
                             text-ink-700 placeholder:text-cream-400
                             focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent
                             transition-all duration-200"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cream-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </form>
            </nav>

            {/* Mobile menu button (for search) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 -mr-2 rounded-lg text-ink-400 hover:bg-cream-100 transition-colors"
              aria-label="搜索"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {menuOpen && (
          <div className="md:hidden border-t border-cream-200 bg-cream-50/95 backdrop-blur-md">
            <div className="container-page py-3">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="搜索讲话..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-3 py-2 rounded-lg border border-cream-300 bg-white text-sm"
                />
              </form>
              <div className="flex gap-2 mt-3">
                <MobileNavLink to="/" onClick={() => setMenuOpen(false)}>首页</MobileNavLink>
                <MobileNavLink to="/admin/users" onClick={() => setMenuOpen(false)}>管理</MobileNavLink>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-72 bg-cream-50 border-r border-cream-200 overflow-y-auto shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-cream-50/90 backdrop-blur-sm border-b border-cream-200 px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-serif font-bold text-ink-700">浏览</span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 rounded text-ink-400 hover:bg-cream-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-4 pt-3 pb-2">
              <h4 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2">分类浏览</h4>
              <CategoryList
                categories={CATEGORIES}
                getCategoryDocs={getCategoryDocs}
                getCategoryCount={getCategoryCount}
                expandedCategory={expandedCategory}
                setExpandedCategory={setExpandedCategory}
                onNavigate={() => setMobileSidebarOpen(false)}
                years={indexData.years}
                getYearCount={getYearCount}
                getYearDocs={getYearDocs}
                expandedYear={expandedYear}
                setExpandedYear={setExpandedYear}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-56 lg:w-64 flex-shrink-0 border-r border-cream-200 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto bg-cream-50/50">
          <div className="p-4 space-y-5">
            {/* Categories */}
            <div>
              <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3 px-2">
                分类浏览
              </h3>
              <CategoryList
                categories={CATEGORIES}
                getCategoryDocs={getCategoryDocs}
                getCategoryCount={getCategoryCount}
                expandedCategory={expandedCategory}
                setExpandedCategory={setExpandedCategory}
                onNavigate={() => {}}
                years={indexData.years}
                getYearCount={getYearCount}
                getYearDocs={getYearDocs}
                expandedYear={expandedYear}
                setExpandedYear={setExpandedYear}
              />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 container-page py-6 md:py-10 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-cream-200 bg-cream-100/50">
        <div className="container-page py-6 md:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-ink-700">任正非讲话知识库</span>
              <span className="text-cream-400">·</span>
              <span className="text-xs text-ink-400">华为管理思想研究</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-ink-400">
              <span>基于公开资料整理</span>
              <span>仅供学习研究</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-cream-200 text-center text-[11px] text-ink-400 leading-relaxed">
            资料信息主要来自于
            <a href="https://github.com/fenwii/huaweimind" target="_blank" rel="noopener noreferrer" className="text-gold-600 hover:text-gold-500 mx-1">
              github.com/fenwii/huaweimind
            </a>
            和互联网
          </div>
        </div>
      </footer>
    </div>
  )
}

/* Year accordion list shared by desktop sidebar and mobile drawer */
function YearList({ years, getYearCount, getYearDocs, expandedYear, setExpandedYear, onNavigate }: {
  years: number[]
  getYearCount: (y: number) => number
  getYearDocs: (y: number) => IndexData['documents']
  expandedYear: number | null
  setExpandedYear: (y: number | null) => void
  onNavigate: () => void
}) {
  return (
    <nav className="space-y-0.5">
      {years.map(year => {
        const count = getYearCount(year)
        const isExpanded = expandedYear === year
        const docs = isExpanded ? getYearDocs(year).slice(0, 6) : []

        return (
          <div key={year}>
            <button
              onClick={() => setExpandedYear(isExpanded ? null : year)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                         text-ink-600 hover:bg-cream-100 hover:text-ink-800
                         transition-all duration-200 group"
            >
              <svg
                className={`w-3 h-3 text-cream-400 transition-transform duration-200 ${
                  isExpanded ? 'rotate-90' : ''
                }`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-serif font-semibold">{year}</span>
              <span className="text-xs text-ink-400 ml-auto">{count}篇</span>
            </button>

            {/* Expanded doc list */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="ml-5 pl-3 border-l-2 border-cream-200 space-y-0.5 py-1">
                {docs.map(doc => (
                  <Link
                    key={doc.slug}
                    to={`/article/${doc.slug}`}
                    onClick={onNavigate}
                    className="block px-3 py-1.5 text-xs text-ink-500 hover:text-gold-600 hover:bg-cream-50 rounded transition-colors truncate"
                  >
                    {doc.title}
                  </Link>
                ))}
                {count > 6 && (
                  <Link
                    to={`/year/${year}`}
                    onClick={onNavigate}
                    className="block px-3 py-1 text-xs text-gold-600 hover:text-gold-500 font-medium"
                  >
                    查看全部 {count} 篇 →
                  </Link>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </nav>
  )
}

/* Category accordion list, with year sub-accordion for 任总内部讲话 */
function CategoryList({ categories, getCategoryDocs, getCategoryCount, expandedCategory, setExpandedCategory, onNavigate, years, getYearCount, getYearDocs, expandedYear, setExpandedYear }: {
  categories: string[]
  getCategoryDocs: (cat: string) => IndexData['documents']
  getCategoryCount: (cat: string) => number
  expandedCategory: string | null
  setExpandedCategory: (cat: string | null) => void
  onNavigate: () => void
  years?: number[]
  getYearCount?: (y: number) => number
  getYearDocs?: (y: number) => IndexData['documents']
  expandedYear?: number | null
  setExpandedYear?: (y: number | null) => void
}) {
  return (
    <nav className="space-y-0.5">
      {categories.map(cat => {
        const count = getCategoryCount(cat)
        const isExpanded = expandedCategory === cat

        return (
          <div key={cat}>
            <button
              onClick={() => setExpandedCategory(isExpanded ? null : cat)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                         text-ink-600 hover:bg-cream-100 hover:text-ink-800
                         transition-all duration-200 group"
            >
              <svg
                className={`w-3 h-3 text-cream-400 transition-transform duration-200 ${
                  isExpanded ? 'rotate-90' : ''
                }`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-serif font-semibold">{cat}</span>
              <span className="text-xs text-ink-400 ml-auto">{count}篇</span>
            </button>

            {/* Expanded content */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="ml-5 pl-3 border-l-2 border-cream-200 space-y-0.5 py-1">
                {cat === '任总内部讲话' && years && getYearCount && getYearDocs && expandedYear !== undefined && setExpandedYear ? (
                  <YearList
                    years={years}
                    getYearCount={getYearCount}
                    getYearDocs={getYearDocs}
                    expandedYear={expandedYear}
                    setExpandedYear={setExpandedYear}
                    onNavigate={onNavigate}
                  />
                ) : (
                  isExpanded && getCategoryDocs(cat).slice(0, 10).map(doc => (
                    <Link
                      key={doc.slug}
                      to={`/article/${doc.slug}`}
                      onClick={onNavigate}
                      className="block px-3 py-1.5 text-xs text-ink-500 hover:text-gold-600 hover:bg-cream-50 rounded transition-colors truncate"
                    >
                      {doc.title}
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        )
      })}
    </nav>
  )
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
        active
          ? 'bg-cream-200 text-ink-800'
          : 'text-ink-500 hover:text-ink-700 hover:bg-cream-100'
      }`}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="inline-block px-3 py-2 text-sm font-medium text-ink-600 hover:bg-cream-100 rounded-lg transition-colors"
    >
      {children}
    </Link>
  )
}
