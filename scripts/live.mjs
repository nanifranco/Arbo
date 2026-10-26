// Captura del sitio publicado en GitHub Pages.
import { chromium } from 'playwright'
const url = process.argv[2]
const browser = await chromium.launch()
const pg = await browser.newPage({ viewport: { width: 390, height: 844 } })
const errors = []
pg.on('pageerror', (e) => errors.push(String(e)))
const res = await pg.goto(url, { waitUntil: 'networkidle' })
await pg.waitForTimeout(2500)
await pg.screenshot({ path: 'shots/live.png' })
const text = (await pg.locator('body').innerText()).slice(0, 200).replace(/\s+/g, ' ')
console.log('HTTP', res?.status(), '| texto:', text, '| errores:', errors.join(' / ') || 'ninguno')
await browser.close()
