import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-6xl font-serif font-bold text-ink-300 mb-4">404</h1>
      <p className="text-ink-400 mb-8">页面未找到</p>
      <Link href="/" className="btn-primary">
        返回首页
      </Link>
    </div>
  )
}
