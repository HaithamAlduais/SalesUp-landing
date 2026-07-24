/*
 * Minimal spec-compliant ZIP writer (STORE method, forward-slash entry
 * names, UTF-8 flag). Exists because on Windows both Compress-Archive
 * and .NET Framework's ZipFile write backslash entry names, which
 * Linux servers unpack as literal "dir\file" filenames — WordPress
 * then rejects the theme as "missing style.css". PNG/JS assets are
 * already compressed, so storing uncompressed costs almost nothing.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function walk(dir, prefix, out) {
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name)
    const rel = prefix + name
    if (statSync(full).isDirectory()) walk(full, rel + '/', out)
    else out.push({ rel, full })
  }
  return out
}

function dosDateTime(d) {
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)
  const date = (((d.getFullYear() - 1980) & 0x7f) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()
  return { time, date }
}

/** zipDirectory('wp-theme/salesup', 'salesup', 'dist-wp/out.zip') */
export function zipDirectory(srcDir, rootName, outFile) {
  const files = walk(srcDir, rootName + '/', [])
  const chunks = []
  const central = []
  let offset = 0
  const { time, date } = dosDateTime(new Date())

  for (const f of files) {
    const data = readFileSync(f.full)
    const name = Buffer.from(f.rel, 'utf8')
    const crc = crc32(data)

    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4) /* version needed */
    local.writeUInt16LE(0x0800, 6) /* UTF-8 names */
    local.writeUInt16LE(0, 8) /* method: store */
    local.writeUInt16LE(time, 10)
    local.writeUInt16LE(date, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(data.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(name.length, 26)
    local.writeUInt16LE(0, 28)
    chunks.push(local, name, data)

    const cd = Buffer.alloc(46)
    cd.writeUInt32LE(0x02014b50, 0)
    cd.writeUInt16LE(20, 4) /* made by */
    cd.writeUInt16LE(20, 6) /* version needed */
    cd.writeUInt16LE(0x0800, 8)
    cd.writeUInt16LE(0, 10)
    cd.writeUInt16LE(time, 12)
    cd.writeUInt16LE(date, 14)
    cd.writeUInt32LE(crc, 16)
    cd.writeUInt32LE(data.length, 20)
    cd.writeUInt32LE(data.length, 24)
    cd.writeUInt16LE(name.length, 28)
    /* extra, comment, disk, internal attrs = 0 */
    cd.writeUInt32LE(0, 38) /* external attrs */
    cd.writeUInt32LE(offset, 42)
    central.push(Buffer.concat([cd, name]))

    offset += 30 + name.length + data.length
  }

  const cdBuf = Buffer.concat(central)
  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(0x06054b50, 0)
  eocd.writeUInt16LE(files.length, 8)
  eocd.writeUInt16LE(files.length, 10)
  eocd.writeUInt32LE(cdBuf.length, 12)
  eocd.writeUInt32LE(offset, 16)
  writeFileSync(outFile, Buffer.concat([...chunks, cdBuf, eocd]))
  return files.length
}
