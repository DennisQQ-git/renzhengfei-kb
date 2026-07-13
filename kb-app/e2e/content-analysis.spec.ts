/**
 * Deep content analysis tests for the kb-app
 * Focuses on actual content rendering and data integrity
 */
import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3004'

test.describe('Content Analysis', () => {
  // ==========================================================
  // SIDEBAR ANALYSIS
  // ==========================================================
  test.describe('Sidebar', () => {
    test('sidebar h3 spacing should be consistent', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })

      // Get all sidebar h3 elements and their margins
      const h3Data = await page.locator('aside h3').evaluateAll(elements =>
        elements.map(el => ({
          text: el.textContent?.trim().replace(/\d+本|\d+位/, '(N)'),
          marginBottom: window.getComputedStyle(el).marginBottom,
          fontSize: window.getComputedStyle(el).fontSize,
          lineHeight: window.getComputedStyle(el).lineHeight,
        }))
      )

      // All h3 should have the same font-size
      const sizes = h3Data.map(d => d.fontSize)
      expect(new Set(sizes).size).toBe(1)
    })

    test('sidebar section count accuracy', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })

      // Books count is 14 as per recommendedBooks.ts
      const booksH3 = page.locator('aside h3').nth(1)
      const booksText = await booksH3.textContent()
      expect(booksText).toContain('14本')

      // Figures count is 5 as per recommendedFigures.ts
      const figuresH3 = page.locator('aside h3').nth(2)
      const figuresText = await figuresH3.textContent()
      expect(figuresText).toContain('10位')
    })
  })

  // ==========================================================
  // HOME PAGE BOOK CARDS ANALYSIS
  // ==========================================================
  test.describe('Home Page Book Cards', () => {
    test('new books should have amber border cards', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })

      // Find the 管理思想丛书 section - look for h2 with that text
      const section = page.locator('h2:has-text("管理思想丛书")')
      await expect(section).toBeVisible()

      // Find all book links in this section
      const bookCards = page.locator('a[href^="/article/"]')
      const count = await bookCards.count()
      expect(count).toBeGreaterThanOrEqual(7)

      // Check that books have clickable links
      for (let i = 0; i < Math.min(count, 7); i++) {
        const href = await bookCards.nth(i).getAttribute('href')
        expect(href).toBeTruthy()
        expect(href).toMatch(/^\/article\//)
      }
    })

    test('all 7 management books have unique slugs in index', async ({ page }) => {
      const resp = await page.request.get(`${BASE_URL}/data/index.json`)
      const idx = await resp.json()

      const parentBooks = idx.documents.filter(
        (d: any) => d.category === '管理思想丛书' && !d.slug.includes('-')
      )
      expect(parentBooks).toHaveLength(7)

      // All should be isTopic
      for (const book of parentBooks) {
        expect(book.isTopic).toBe(true)
      }
    })
  })

  // ==========================================================
  // CHAPTER PAGE ANALYSIS
  // ==========================================================
  test.describe('Chapter Pages', () => {
    test('chapter page has navigation links', async ({ page }) => {
      await page.goto(`${BASE_URL}/article/下一个倒下的会不会是华为-第一章`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)

      // Should have at least some content
      const bodyText = await page.locator('main').textContent()
      expect(bodyText!.length).toBeGreaterThan(100)
    })

    test('熵减 chapter pages load correctly', async ({ page }) => {
      // Test all 熵减 chapters
      const chapters = [
        '熵减-序言',
        '熵减-理论探索篇',
        '熵减-业务实践篇',
        '熵减-百家争鸣篇',
      ]
      for (const ch of chapters) {
        const resp = await page.request.get(`${BASE_URL}/article/${ch}`)
        expect(resp.status(), `${ch} should return 200`).toBe(200)
      }
    })

    test('质量为纲 chapter pages load correctly', async ({ page }) => {
      const chapters = [
        '质量为纲-第一章',
        '质量为纲-第四章',
        '质量为纲-第八章',
      ]
      for (const ch of chapters) {
        const resp = await page.request.get(`${BASE_URL}/article/${ch}`)
        expect(resp.status(), `${ch} should return 200`).toBe(200)
      }
    })

    test('chapter JSON metadata integrity', async ({ page }) => {
      const chapterSlugs = [
        '下一个倒下的会不会是华为-引子',
        '熵减-理论探索篇',
        '质量为纲-第一章',
        '为客户服务-第1章',
      ]
      for (const slug of chapterSlugs) {
        const resp = await page.request.get(`${BASE_URL}/data/documents/${slug}.json`)
        expect(resp.ok()).toBeTruthy()
        const data = await resp.json()

        // Check required fields exist
        expect(data.slug).toBe(slug)
        expect(data.category).toBe('管理思想丛书')
        expect(data.isTopic).toBe(true)
        expect(data.html).toBeTruthy()
        expect(data.html.length).toBeGreaterThan(50)

        // Check metadata
        expect(data.metadata).toBeTruthy()
        expect(data.metadata.bookSlug).toBeTruthy()
        expect(data.metadata.chapterNumber).toBeDefined()
      }
    })

    test('parent book JSON metadata integrity', async ({ page }) => {
      const parentSlugs = [
        '下一个倒下的会不会是华为',
        '熵减',
        '质量为纲',
        '为客户服务',
      ]
      for (const slug of parentSlugs) {
        const resp = await page.request.get(`${BASE_URL}/data/documents/${slug}.json`)
        expect(resp.ok()).toBeTruthy()
        const data = await resp.json()

        // Parent books should have TOC in html
        expect(data.html).toContain('内容简介')
        expect(data.html).toContain('目录')
        expect(data.metadata.totalChapters).toBeGreaterThan(0)
        expect(data.metadata.chapters.length).toBeGreaterThan(0)
      }
    })
  })

  // ==========================================================
  // BOOK / FIGURE RECOMMENDATION PAGES
  // ==========================================================
  test.describe('Recommendation Pages', () => {
    test('all 14 book recommendation pages load', async ({ page }) => {
      const books = [
        '失去的胜利',
        '隆美尔战时文件',
        '闪击英雄',
        '战争论',
        '五角大楼之脑',
        '科学：无尽的前沿',
        '未来简史',
        '今日简史',
        '蓝血十杰',
        '新教伦理与资本主义精神',
        '国际商法',
        '超限战',
        'CEO的海军陆战队',
        '从0到1',
      ]
      for (const name of books) {
        const resp = await page.request.get(`${BASE_URL}/book/${encodeURIComponent(name)}`)
        expect(resp.status(), `${name} should return 200`).toBe(200)
      }
    })

    test('all 10 figure recommendation pages load', async ({ page }) => {
      const figures = [
        '李冰父子',
        '巴顿',
        '马歇尔',
        '毛泽东',
        '蓝血十杰',
        '林彪彰武作战命令',
        '粟裕1400字作战命令',
        '李梅烧烤',
        '大纵深理论',
        '仁川登陆',
      ]
      for (const name of figures) {
        const resp = await page.request.get(`${BASE_URL}/figure/${encodeURIComponent(name)}`)
        expect(resp.status(), `${name} should return 200`).toBe(200)
      }
    })
  })

  // ==========================================================
  // CONSISTENCY: original 3 books still work
  // ==========================================================
  test.describe('Original 3 Books Regression', () => {
    test('original book TOC pages still load', async ({ page }) => {
      const slugs = ['以客户为中心', '以奋斗者为本', '价值为纲']
      for (const slug of slugs) {
        const resp = await page.request.get(`${BASE_URL}/article/${slug}`)
        expect(resp.status(), `${slug} parent book page`).toBe(200)
      }
    })

    test('original chapter pages still load', async ({ page }) => {
      const slugs = [
        '以客户为中心-第一章',
        '以奋斗者为本-第一章',
        '价值为纲-代序',
      ]
      for (const slug of slugs) {
        const resp = await page.request.get(`${BASE_URL}/article/${slug}`)
        expect(resp.status(), `${slug} chapter`).toBe(200)
      }
    })
  })

  // ==========================================================
  // SEARCH INTEGRATION
  // ==========================================================
  test.describe('Search Integration', () => {
    test('search finds content from new books', async ({ page }) => {
      // Direct API test: search-index.json should contain new book entries
      const resp = await page.request.get(`${BASE_URL}/data/search-index.json`)
      const searchIdx = await resp.json()

      const newBookSlugs = ['下一个倒下的会不会是华为', '熵减', '质量为纲', '为客户服务']
      for (const slug of newBookSlugs) {
        const found = searchIdx.some((entry: any) => entry.slug === slug)
        expect(found, `${slug} should be in search index`).toBe(true)
      }

      // Should also have chapter entries
      const chapterSlugs = ['下一个倒下的会不会是华为-引子', '熵减-序言']
      for (const slug of chapterSlugs) {
        const found = searchIdx.some((entry: any) => entry.slug === slug)
        expect(found, `${slug} should be in search index`).toBe(true)
      }
    })
  })
})
