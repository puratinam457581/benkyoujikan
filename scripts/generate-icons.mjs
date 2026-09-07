/**
 * アプリアイコン(PNG)を生成するスクリプト。
 *
 *   node scripts/generate-icons.mjs   (npm run icons)
 *
 * 外部ライブラリ(sharp 等)を使わず、Node 標準の zlib だけで PNG を組み立てている。
 *   - 追加の npm パッケージを入れずに済む(ライセンス確認も不要)
 *   - 見た目を変えたくなったら、このコードを直して再実行すればよい
 *
 * 生成物は public/ 配下に置かれ、そのままビルドに含まれる。
 * モチーフは「積み上がる棒グラフ」= 勉強時間の可視化。favicon.svg と同じ。
 */
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// 配色(index.css のダークテーマ)
const VOID = [0x07, 0x0b, 0x14]
const CYAN = [0x00, 0xf0, 0xff]
const ELECTRIC = [0x2d, 0x5f, 0xff]
const PURPLE = [0xb2, 0x4b, 0xff]

function createCanvas(size, bg) {
  const pixels = Buffer.alloc(size * size * 4)
  for (let i = 0; i < size * size; i += 1) {
    pixels[i * 4] = bg[0]
    pixels[i * 4 + 1] = bg[1]
    pixels[i * 4 + 2] = bg[2]
    pixels[i * 4 + 3] = 255
  }
  return { size, pixels }
}

function fillRect(canvas, x, y, w, h, color) {
  const { size, pixels } = canvas
  const x0 = Math.max(0, Math.round(x))
  const y0 = Math.max(0, Math.round(y))
  const x1 = Math.min(size, Math.round(x + w))
  const y1 = Math.min(size, Math.round(y + h))
  for (let py = y0; py < y1; py += 1) {
    for (let px = x0; px < x1; px += 1) {
      const i = (py * size + px) * 4
      pixels[i] = color[0]
      pixels[i + 1] = color[1]
      pixels[i + 2] = color[2]
    }
  }
}

// 3本の棒(左から高くなる)を中央に描く
function drawIcon(size, inset) {
  const c = createCanvas(size, VOID)
  const pad = size * inset
  const areaX = pad
  const areaW = size - pad * 2
  const baseY = size - pad // 棒の下端
  const gap = areaW * 0.08
  const barW = (areaW - gap * 2) / 3
  const bars = [
    { color: CYAN, hRatio: 0.42 },
    { color: ELECTRIC, hRatio: 0.68 },
    { color: PURPLE, hRatio: 0.96 },
  ]
  bars.forEach((b, idx) => {
    const h = (size - pad * 2) * b.hRatio
    const x = areaX + idx * (barW + gap)
    fillRect(c, x, baseY - h, barW, h, b.color)
  })
  return c
}

// ---- PNG エンコード ----
const CRC_TABLE = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}
function encodePng({ size, pixels }) {
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const TARGETS = [
  { path: 'public/icons/icon-192.png', size: 192, inset: 0.2 },
  { path: 'public/icons/icon-512.png', size: 512, inset: 0.2 },
  { path: 'public/icons/icon-maskable-512.png', size: 512, inset: 0.28 },
  { path: 'public/apple-touch-icon.png', size: 180, inset: 0.18 },
]

for (const { path, size, inset } of TARGETS) {
  const file = resolve(ROOT, path)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, encodePng(drawIcon(size, inset)))
  console.log(`生成: ${path} (${size}x${size})`)
}
