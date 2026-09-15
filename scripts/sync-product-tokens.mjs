// Snapshot the product's own tokens; the committed output makes builds standalone.
// Usage: node scripts/sync-product-tokens.mjs [path-to-SalesUp]
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
const source = resolve(process.argv[2] ?? '../SalesUp', 'packages/ui/src/styles/globals.css')
const css = readFileSync(source, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const block = (start) => {
  const at = css.indexOf(start)
  if (at < 0) throw new Error(`Missing product token block: ${start}`)
  const open = css.indexOf('{', at)
  let depth = 1, end = open + 1
  while (depth && end < css.length) { if (css[end] === '{') depth++; if (css[end] === '}') depth--; end++ }
  return css.slice(open + 1, end - 1).trim()
}
const theme = block('@theme inline').split('\n').filter(line => !/--font-(sans|heading):/.test(line)).join('\n')
const output = `/* Generated from SalesUp/packages/ui/src/styles/globals.css. Do not invent token values here. */\n@theme inline {\n${theme}\n}\n.product-app {\n${block(':root {')}\n}\n[data-theme='dark'] .product-app {\n${block('.dark {')}\n}\n`
writeFileSync(resolve('src/product-tokens.css'), output)
console.log('Synced product tokens (light, dark, elevation and semantic colours).')
