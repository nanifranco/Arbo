import { copyFileSync, rmSync } from 'node:fs'
copyFileSync('dist/dev.html', 'dist/index.html')
rmSync('dist/dev.html')
copyFileSync('dist/index.html', 'index.html')
console.log('index.html actualizado (dist/ y raíz)')
