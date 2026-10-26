// Capturas del prototipo para revisión visual (se ejecuta en GitHub Actions).
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
mkdirSync('shots', { recursive: true })
const browser = await chromium.launch()
for (const [w, h, tag] of [[390, 844, 'm'], [1280, 860, 'd']]) {
  const pg = await browser.newPage({ viewport: { width: w, height: h } })
  await pg.goto(`file://${process.cwd()}/dist/index.html`)
  await pg.waitForTimeout(2500)
  await pg.screenshot({ path: `shots/${tag}0-welcome.png` })
  await pg.getByText('Entrar con perfil de demostración').click()
  await pg.waitForTimeout(3000)
  await pg.screenshot({ path: `shots/${tag}1-home.png`, fullPage: true })
  await pg.locator('main button:has-text("Ver funciones y boletos")').first().click()
  await pg.waitForTimeout(3000)
  await pg.screenshot({ path: `shots/${tag}2-detail.png`, fullPage: true })
  const nav = tag === 'm' ? pg.locator('nav[aria-label=Principal]').last() : pg.locator('aside nav')
  await nav.getByText('Buscar').click()
  await pg.waitForTimeout(2500)
  await pg.screenshot({ path: `shots/${tag}3-explore.png`, fullPage: true })
  await pg.getByRole('tab', { name: 'Teatros' }).click()
  await pg.waitForTimeout(2500)
  await pg.screenshot({ path: `shots/${tag}4-teatros.png`, fullPage: true })
  await pg.close()
}
await browser.close()
