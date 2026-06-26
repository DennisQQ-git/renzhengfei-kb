import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import { AppCtx } from './utils/context'
import type { IndexData } from './types'
import { fetchIndex } from './utils/api'

const YearView = lazy(() => import('./pages/YearView'))
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'))
const TagView = lazy(() => import('./pages/TagView'))
const Search = lazy(() => import('./pages/Search'))


export default function App() {
  const [indexData, setIndexData] = useState<IndexData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIndex()
      .then(data => {
        setIndexData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load index:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cream-50">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ink-400 text-sm">加载知识库中...</p>
        </div>
      </div>
    )
  }

  if (!indexData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cream-50">
        <div className="text-center">
          <p className="text-ink-500 mb-2">知识库数据加载失败</p>
          <p className="text-ink-400 text-sm">请运行 <code className="bg-cream-200 px-2 py-0.5 rounded text-xs">npm run preprocess</code> 生成数据</p>
        </div>
      </div>
    )
  }

  return (
    <AppCtx.Provider value={{ indexData }}>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-cream-50">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/year/:year" element={<YearView />} />
            <Route path="/article/:slug" element={<ArticleDetail />} />
            <Route path="/tag/:tag" element={<TagView />} />
            <Route path="/search" element={<Search />} />
          </Route>
        </Routes>
      </Suspense>
    </AppCtx.Provider>
  )
}
