// Convierte dist/index.html en un fragmento para publicarlo como página de Claude (sin <html>/<head>/<body>).
import { readFileSync, writeFileSync } from 'node:fs'
const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8')
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1]
  .replace(/<meta charset[^>]*>/, '')
  .replace(/<meta name="viewport"[^>]*>/, '')
const body = html.match(/<body>([\s\S]*?)<\/body>/)[1]
const title = head.match(/<title>.*?<\/title>/)[0]
const rest = head.replace(title, '')
const out = `${title}\n<meta name="claude:viewport-fit-sides" content="cover">\n${rest}\n${body}`
writeFileSync(process.argv[2] ?? 'arbo-artifact.html', out)
