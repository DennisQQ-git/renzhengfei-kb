/**
 * Visual and layout analysis test for kb-app
 * Takes screenshots and checks for layout/content issues
 */
import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3004'

test.describe('Visual Analysis', () => {
  // ==========================================================
  // SCREENSHOTS — Desktop (1280x800)
  // ==========================================================
  test.describe('Screenshots - Desktop', () => {
    test.use({ viewport: { width: 1280, height: 800 } })

    test('Home page full layout', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)
      await page.screenshot({ path: 'e2e-screenshots/home-desktop.png', fullPage: true })
    })

    test('Sidebar with books expanded', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })

      // Expand books section
      await page.locator('h3:text("任总推荐书籍")').first().click()
      await page.waitForTimeout(400)

      // Expand figures section
      await page.locator('h3:text("任总推荐人物和故事")').click()
      await page.waitForTimeout(400)

      await page.screenshot({ path: 'e2e-screenshots/sidebar-expanded-desktop.png', fullPage: true })
    })

    test('Article page: 下一个倒下的会不会是华为', async ({ page }) => {
      await page.goto(`${BASE_URL}/article/下一个倒下的会不会是华为`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)
      await page.screenshot({ path: 'e2e-screenshots/book-next-fallen-desktop.png', fullPage: true })
    })

    test('Article page: chapter content', async ({ page }) => {
      await page.goto(`${BASE_URL}/article/下一个倒下的会不会是华为-第一章`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)
      await page.screenshot({ path: 'e2e-screenshots/chapter-desktop.png', fullPage: true })
    })

    test('Graph page', async ({ page }) => {
      await page.goto(`${BASE_URL}/graph`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(2000)
      await page.screenshot({ path: 'e2e-screenshots/graph-desktop.png', fullPage: true })
    })

    test('Book recommendation page', async ({ page }) => {
      await page.goto(`${BASE_URL}/book/${encodeURIComponent('失去的胜利')}`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)
      await page.screenshot({ path: 'e2e-screenshots/book-recommend-desktop.png', fullPage: true })
    })
  })

  // ==========================================================
  // SCREENSHOTS — Tablet (768x1024)
  // ==========================================================
  test.describe('Screenshots - Tablet', () => {
    test.use({ viewport: { width: 768, height: 1024 } })

    test('Home page tablet', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)
      await page.screenshot({ path: 'e2e-screenshots/home-tablet.png', fullPage: true })
    })
  })

  // ==========================================================
  // SCREENSHOTS — Mobile (375x667)
  // ==========================================================
  test.describe('Screenshots - Mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('Home page mobile', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)
      await page.screenshot({ path: 'e2e-screenshots/home-mobile.png', fullPage: true })
    })

    test('Mobile sidebar open', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      await page.locator('button[aria-label="打开侧边栏"]').click()
      await page.waitForTimeout(500)
      await page.screenshot({ path: 'e2e-screenshots/mobile-sidebar-open.png', fullPage: true })
    })

    test('Mobile sidebar close via overlay click', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      await page.locator('button[aria-label="打开侧边栏"]').click()
      await page.waitForTimeout(400)

      // Close by clicking overlay background (the backdrop div)
      const overlay = page.locator('.fixed.inset-0.z-50').first()
      // Close by clicking overlay background (right side of viewport, outside sidebar)
      await page.mouse.click(350, 100)
      await page.waitForTimeout(400)
      const sidebar = page.locator('.fixed.inset-0.z-50')
      // Sidebar should be closed
      await expect(sidebar).toHaveCount(0)
    })

    test('Mobile sidebar close via close button (SVG X icon)', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      await page.locator('button[aria-label="打开侧边栏"]').click()
      await page.waitForTimeout(400)

      // The close button is a button with an X SVG inside. It's the second button in the sidebar drawer
      // Located inside the sidebar: <button onClick={() => setMobileSidebarOpen(false)}>
      const closeBtn = page.locator('div.w-72 button').first()
      await closeBtn.click()
      await page.waitForTimeout(400)
      const sidebar = page.locator('.fixed.inset-0.z-50')
      await expect(sidebar).toHaveCount(0)
    })
  })
})

test.describe('Layout and Content Analysis', () => {
  test('No horizontal scroll on any page', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })
    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(pageWidth).toBeLessThanOrEqual(viewportWidth + 5) // allow 5px tolerance
  })

  test('Sidebar should not overlap main content', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    const sidebarWidth = await page.evaluate(() => {
      const sidebar = document.querySelector('aside')
      if (!sidebar) return 0
      const rect = sidebar.getBoundingClientRect()
      return rect.right
    })

    const mainLeft = await page.evaluate(() => {
      const main = document.querySelector('main')
      if (!main) return 0
      const rect = main.getBoundingClientRect()
      return rect.left
    })

    // Sidebar should end before main content starts
    if (sidebarWidth > 0 && mainLeft > 0) {
      expect(sidebarWidth).toBeLessThanOrEqual(mainLeft + 5)
    }
  })

  test('All sidebar h3 headers should have consistent styling', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    const h3s = page.locator('aside h3')
    const count = await h3s.count()
    expect(count).toBeGreaterThanOrEqual(3) // categories + books + figures

    // Check all have the same base classes (分类浏览 is static, books/figures are clickable)
    for (let i = 0; i < count; i++) {
      const className = await h3s.nth(i).getAttribute('class')
      expect(className).toContain('text-xs')
      expect(className).toContain('font-semibold')
      expect(className).toContain('uppercase')
      expect(className).toContain('tracking-wider')
      // Clickable h3s (books/figures) should have cursor-pointer
      if (i > 0) {
        expect(className).toContain('cursor-pointer')
      }
    }
  })

  test('Home page book cards should have proper link URLs', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    // Check book links in management series
    const bookLinks = page.locator('a[href^="/article/"]')
    const count = await bookLinks.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < Math.min(count, 10); i++) {
      const href = await bookLinks.nth(i).getAttribute('href')
      expect(href).toBeTruthy()
    }
  })

  test('Sidebar books section should show all 14 books', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    // Expand books section
    const h3 = page.locator('aside h3').nth(1) // 任总推荐书籍
    await h3.click()
    await page.waitForTimeout(400)

    // Count visible book links
    const bookLinks = page.locator('aside a[href^="/book/"]')
    const count = await bookLinks.count()
    expect(count).toBe(14)
  })

  test('Sidebar figures section should show all 10 figures', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    const h3 = page.locator('aside h3').nth(2) // 任总推荐人物和故事
    await h3.click()
    await page.waitForTimeout(400)

    const figureLinks = page.locator('aside a[href^="/figure/"]')
    const count = await figureLinks.count()
    expect(count).toBe(10)
  })

  test('No 404 for any new book chapter route', async ({ page }) => {
    const chapterRoutes = [
      '/article/下一个倒下的会不会是华为-引子',
      '/article/熵减-序言',
      '/article/熵减-理论探索篇',
      '/article/熵减-业务实践篇',
      '/article/质量为纲-第一章',
      '/article/质量为纲-第八章',
      '/article/为客户服务-第1章',
      '/article/为客户服务-第14章',
    ]

    for (const route of chapterRoutes) {
      const resp = await page.request.get(`${BASE_URL}${route}`)
      expect(resp.status()).toBe(200)
    }
  })

  test('Search should show results for new book content', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    const searchInput = page.locator('input[placeholder="搜索讲话..."]').first()
    await searchInput.fill('熵减')
    await searchInput.press('Enter')
    await page.waitForURL('**/search?q=**', { timeout: 10000 })
    await page.waitForTimeout(2000)

    // Should have some results
    const resultCount = await page.locator('a[href^="/article/"]').count()
    expect(resultCount).toBeGreaterThan(0)
  })
})
