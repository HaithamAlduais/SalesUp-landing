/*
 * Builds the WordPress-theme flavor of the site and packages it as an
 * uploadable theme zip.
 *
 *   npm run build:wp   →  dist-wp/salesup-theme.zip
 *
 * Steps: type-check → vite build with the theme base path (assets URL
 * /wp-content/themes/salesup/...) and the wp env (lead API pointed at
 * the Vercel function) → copy hashed assets + manifest into the theme
 * → zip. The PHP files in wp-theme/salesup are the hand-written theme;
 * assets/ and manifest.json inside it are build artifacts.
 */
import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { zipDirectory } from './make-zip.mjs'

const run = (cmd) => {
  console.log(`\n> ${cmd}`)
  execSync(cmd, { stdio: 'inherit' })
}

const THEME = 'wp-theme/salesup'

run('npx tsc --noEmit -p tsconfig.app.json')
/* relative base: asset URLs resolve against each module's own URL, so
   the theme works at the domain root AND in a subdirectory install
   (staging clones) without rebuilding */
run('npx vite build --base=./ --mode wp')

rmSync(`${THEME}/assets`, { recursive: true, force: true })
rmSync(`${THEME}/manifest.json`, { force: true })
cpSync('dist/assets', `${THEME}/assets`, { recursive: true })

const manifest = 'dist/.vite/manifest.json'
if (!existsSync(manifest)) {
  console.error('manifest.json missing — is build.manifest enabled for mode wp?')
  process.exit(1)
}
cpSync(manifest, `${THEME}/manifest.json`)

mkdirSync('dist-wp', { recursive: true })
rmSync('dist-wp/salesup-theme.zip', { force: true })
/* pure-Node zip: every Windows-native zipper here (Compress-Archive,
   .NET Framework ZipFile) writes backslash entry names, which Linux
   servers unpack as literal "salesup\\style.css" filenames and
   WordPress rejects the theme as missing style.css */
const count = zipDirectory(THEME, 'salesup', 'dist-wp/salesup-theme.zip')

console.log(`\n✓ theme zip ready: dist-wp/salesup-theme.zip (${count} files)`)
