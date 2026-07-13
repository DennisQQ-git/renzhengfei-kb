import type { Metadata } from 'next'
import ClientLayout from '@/components/ClientLayout'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: '任正非讲话知识库',
    template: '%s | 任正非讲话知识库',
  },
  description: '华为创始人管理思想与战略思维的完整记录 — 任正非历年讲话全文收录，涵盖企业管理、技术创新、人才培养等方向',
  openGraph: {
    title: '任正非讲话知识库',
    description: '华为创始人管理思想与战略思维的完整记录',
    type: 'website',
    locale: 'zh_CN',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&family=Noto+Serif+SC:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-cream-50 text-ink-800 antialiased" suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
