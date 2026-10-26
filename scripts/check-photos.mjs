// Verifica que todas las fotos de referencia respondan (se ejecuta en GitHub Actions).
import { readFileSync } from 'node:fs'
const src = readFileSync(new URL('../src/data/demo.ts', import.meta.url), 'utf8')
const ids = [...new Set(src.match(/photo-[0-9]+-[0-9a-f]+/g))]
let bad = 0
for (const id of ids) {
  const res = await fetch(`https://images.unsplash.com/${id}?w=200&auto=format`, { method: 'HEAD' })
  console.log(res.status, id)
  if (!res.ok) bad++
}
console.log(`${ids.length - bad}/${ids.length} fotos disponibles`)
