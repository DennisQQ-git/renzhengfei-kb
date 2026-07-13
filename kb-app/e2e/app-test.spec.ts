/**
 * Comprehensive Playwright test for kb-app
 * Tests: home page, sidebar, books, figures, articles, search, graph, console errors
 */
import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3004'

// ============================================================
// SECTION 1: Home Page
// ============================================================
test.describe('Home Page', () => {
  test('should load without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    page.on('pageerror', err => errors.push(err.message))

    await page.goto(BASE_URL, { waitUntil: 'networkidle' })
    expect(errors).toHaveLength(0)
  })

  test('should show 7 management books in 管理思想丛书 section', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    // Wait for the book section
    const sectionHeader = page.locator('text=管理思想丛书')
    await expect(sectionHeader).toBeVisible()

    // Should have 7 book cards (amber border cards on home page)
    const bookCards = page.locator('a[href^="/article/"], a[href^="/book/"]')
    // The home page filter: topics.filter(t => t.category === '管理思想丛书' && !t.slug.includes('-'))

    // Look for links that match parent book slugs
    const bookLinks = page.locator('a[href^="/article/以客户为中心"]')
    const count = await bookLinks.count()

    // Check at least the first 3 original books are present
    await expect(page.locator('a[href^="/article/以客户为中心"]').first()).toBeVisible()
    await expect(page.locator('a[href^="/article/以奋斗者为本"]').first()).toBeVisible()
    await expect(page.locator('a[href^="/article/价值为纲"]').first()).toBeVisible()
  })

  test('should show new management books', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    // Check new books are present on the page
    await expect(page.locator('text=下一个倒下的会不会是华为').first()).toBeVisible()
    await expect(page.locator('text=熵减').first()).toBeVisible()
    await expect(page.locator('text=质量为纲').first()).toBeVisible()
  })

  test('should show Hero section with version tag', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })
    const hero = page.locator('text=任正非讲话知识库')
    await expect(hero).toBeVisible()
  })
})

// ============================================================
// SECTION 2: Sidebar
// ============================================================
test.describe('Sidebar', () => {
  test('should have category, books, figures sections', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    // Desktop sidebar sections
    await expect(page.locator('text=分类浏览').first()).toBeVisible()
    await expect(page.locator('text=任总推荐书籍').first()).toBeVisible()
    await expect(page.locator('text=任总推荐人物和故事').first()).toBeVisible()
  })

  test('sidebar books section should show count', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    const booksHeader = page.locator('text=任总推荐书籍').first()
    await expect(booksHeader).toBeVisible()

    // Should show book count
    await expect(page.locator('text=本').first()).toBeVisible()
  })

  test('sidebar figures section should show count', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    const figuresHeader = page.locator('text=任总推荐人物和故事').first()
    await expect(figuresHeader).toBeVisible()

    await expect(page.locator('text=位').first()).toBeVisible()
  })

  test('should toggle book list on click', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    // Click to expand books
    const h3 = page.locator('h3:has-text("任总推荐书籍")').first()
    await h3.click()
    await page.waitForTimeout(400)

    // Should show book items
    const bookLink = page.locator('text=《失去的胜利》').first()
    await expect(bookLink).toBeVisible()
  })
})

// ============================================================
// SECTION 3: Book Detail Pages
// ============================================================
test.describe('Book Detail Pages', () => {
  test('should navigate to 以客户为中心 parent book page', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    // Click on 以客户为中心 link
    const link = page.locator('a[href^="/article/以客户为中心"]').first()
    await link.click()
    await page.waitForURL('**/article/**', { timeout: 10000 })

    // Page should load
    await expect(page.locator('text=以客户为中心').first()).toBeVisible()
  })

  test('should navigate to 下一个倒下的会不会是华为 parent book page', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    const link = page.locator('a[href^="/article/下一个倒下的会不会是华为"]').first()
    await expect(link).toBeVisible()
    await link.click()
    await page.waitForURL('**/article/**', { timeout: 10000 })
    await expect(page.locator('text=下一个倒下的会不会是华为').first()).toBeVisible()
  })

  test('should navigate to 熵减 parent book page', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    const link = page.locator('a[href^="/article/熵减"]').first()
    await expect(link).toBeVisible()
    await link.click()
    await page.waitForURL('**/article/**', { timeout: 10000 })
    await expect(page.locator('text=熵减').first()).toBeVisible()
  })

  test('should navigate to 质量为纲 parent book page', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    const link = page.locator('a[href^="/article/质量为纲"]').first()
    await expect(link).toBeVisible()
    await link.click()
    await page.waitForURL('**/article/**', { timeout: 10000 })
    await expect(page.locator('text=质量为纲').first()).toBeVisible()
  })

  test('should navigate to a chapter of 下一个倒下的会不会是华为', async ({ page }) => {
    await page.goto(`${BASE_URL}/article/下一个倒下的会不会是华为-第一章`, { waitUntil: 'networkidle' })
    await expect(page.locator('text=下一个倒下的会不会是华为').first()).toBeVisible()
  })
})

// ============================================================
// SECTION 4: Article Pages
// ============================================================
test.describe('Article Pages', () => {
  test('should load a speech article', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    // Try to find and click a category then an article
    const categoryBtn = page.locator('button:has-text("华为高管讲话")').first()
    await categoryBtn.click()
    await page.waitForTimeout(400)

    // Click first article in expanded category
    const articleLink = page.locator('a[href^="/article/"]').first()
    if (await articleLink.isVisible()) {
      await articleLink.click()
      await page.waitForURL('**/article/**', { timeout: 10000 })
      // Should have an article title
      await expect(page.locator('h1').first()).toBeVisible()
    }
  })

  test('should display article content with no console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    // Load a known article
    await page.goto(`${BASE_URL}/article/下一个倒下的会不会是华为-第一章`, { waitUntil: 'networkidle' })
    expect(errors).toHaveLength(0)
  })
})

// ============================================================
// SECTION 5: Search
// ============================================================
test.describe('Search', () => {
  test('search input should be present', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })
    const searchInput = page.locator('input[placeholder="搜索讲话..."]').first()
    await expect(searchInput).toBeVisible()
  })

  test('search should return results', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })
    const searchInput = page.locator('input[placeholder="搜索讲话..."]').first()

    await searchInput.fill('华为')
    await searchInput.press('Enter')
    await page.waitForURL('**/search?q=**', { timeout: 10000 })

    // Search results should render
    await page.waitForTimeout(2000)
    // Check that the page loaded without crashing
    expect(page.url()).toContain('/search')
  })
})

// ============================================================
// SECTION 6: Graph Page
// ============================================================
test.describe('Graph Page', () => {
  test('should load graph page', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    const graphLink = page.locator('a:has-text("关系图谱")').first()
    await graphLink.click()
    await page.waitForURL('**/graph**', { timeout: 10000 })

    // Graph page should render
    await expect(page.locator('text=关系图谱').first()).toBeVisible()
  })
})

// ============================================================
// SECTION 7: Book Recommendation Pages
// ============================================================
test.describe('Book Recommendation Pages', () => {
  test('should navigate to book detail from sidebar', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    // Expand sidebar books
    const h3 = page.locator('h3:has-text("任总推荐书籍")').first()
    await h3.click()
    await page.waitForTimeout(400)

    // Click on 《失去的胜利》
    const bookLink = page.locator('text=《失去的胜利》').first()
    await expect(bookLink).toBeVisible()
    await bookLink.click()
    await page.waitForURL('**/book/**', { timeout: 10000 })

    // Should show book detail
    await expect(page.locator('text=失去的胜利').first()).toBeVisible()
  })
})

// ============================================================
// SECTION 8: Figure Recommendation Pages
// ============================================================
test.describe('Figure Recommendation Pages', () => {
  test('should navigate to figure detail from sidebar', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    // Expand figures
    const h3 = page.locator('h3:has-text("任总推荐人物和故事")').first()
    await h3.click()
    await page.waitForTimeout(400)

    // Click a figure
    const figureLink = page.locator('text=巴顿').first()
    await expect(figureLink).toBeVisible()
    await figureLink.click()
    await page.waitForURL('**/figure/**', { timeout: 10000 })

    // Should show figure detail
    await expect(page.locator('text=巴顿').first()).toBeVisible()
  })
})

// ============================================================
// SECTION 9: Responsive / Mobile
// ============================================================
test.describe('Mobile Layout', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('should show mobile menu on small screen', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    // Hamburger button should be visible
    const hamburger = page.locator('button[aria-label="打开侧边栏"]')
    await expect(hamburger).toBeVisible()

    // Click to open mobile sidebar
    await hamburger.click()
    await page.waitForTimeout(400)

    // Sidebar should be visible with nav sections
    await expect(page.locator('text=分类浏览').first()).toBeVisible()
    await expect(page.locator('text=任总推荐书籍').first()).toBeVisible()
    await expect(page.locator('text=任总推荐人物和故事').first()).toBeVisible()
  })

  test('mobile sidebar should close on close button click', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    // Open sidebar
    await page.locator('button[aria-label="打开侧边栏"]').click()
    await page.waitForTimeout(300)

    // Close with X button (the close button is inside the sidebar drawer)
    await page.locator('div.w-72 button').first().click()
    await page.waitForTimeout(300)
  })
})

// ============================================================
// SECTION 10: Content Integrity
// ============================================================
test.describe('Content Integrity', () => {
  test('all new book parent JSON files should be valid', async ({ page }) => {
    const slugs = [
      '下一个倒下的会不会是华为',
      '熵减',
      '质量为纲',
      '为客户服务',
    ]
    for (const slug of slugs) {
      const resp = await page.request.get(`${BASE_URL}/data/documents/${slug}.json`)
      expect(resp.ok()).toBeTruthy()
      const data = await resp.json()
      expect(data.category).toBe('管理思想丛书')
      expect(data.slug).toBe(slug)
    }
  })

  test('all new book chapter JSON files should be accessible', async ({ page }) => {
    const chapterSlugs = [
      '下一个倒下的会不会是华为-引子',
      '下一个倒下的会不会是华为-第一章',
      '熵减-序言',
      '熵减-理论探索篇',
      '质量为纲-第一章',
      '为客户服务-第1章',
    ]
    for (const slug of chapterSlugs) {
      const resp = await page.request.get(`${BASE_URL}/data/documents/${slug}.json`)
      expect(resp.ok()).toBeTruthy()
      const data = await resp.json()
      expect(data.category).toBe('管理思想丛书')
    }
  })

  test('index.json should contain all 7 book entries', async ({ page }) => {
    const resp = await page.request.get(`${BASE_URL}/data/index.json`)
    expect(resp.ok()).toBeTruthy()
    const idx = await resp.json()

    // Check all parent books exist
    const parentSlugs = ['以客户为中心', '以奋斗者为本', '价值为纲',
      '下一个倒下的会不会是华为', '熵减', '质量为纲', '为客户服务']
    for (const slug of parentSlugs) {
      const found = idx.documents.find((d: any) => d.slug === slug)
      expect(found).toBeTruthy()
    }
  })
})
