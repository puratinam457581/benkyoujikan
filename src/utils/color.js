// 色の計算。主な用途は「ある背景色の上の文字を白/黒どちらにするか」の判定。
// 教材カラー(ユーザーが選んだ色)をチップやアイコンの背景に使うときに必要。

export function hexToRgb(hex) {
  if (typeof hex !== 'string') return null
  const value = hex.trim().replace(/^#/, '')
  const full =
    value.length === 3
      ? value.split('').map((c) => c + c).join('')
      : value
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

// 相対輝度(0〜1)。WCAG の計算式。
export function relativeLuminance(hex) {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  const ch = (v) => {
    const x = v / 255
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * ch(rgb.r) + 0.7152 * ch(rgb.g) + 0.0722 * ch(rgb.b)
}

const CONTRAST_PIVOT = 0.179

// その色を背景にしたとき読みやすい文字色。
export function readableTextOn(hex) {
  return relativeLuminance(hex) > CONTRAST_PIVOT ? '#0f172a' : '#ffffff'
}

export function normalizeHex(hex, fallback = '#38bdf8') {
  const rgb = hexToRgb(hex)
  if (!rgb) return fallback
  const to2 = (n) => n.toString(16).padStart(2, '0')
  return `#${to2(rgb.r)}${to2(rgb.g)}${to2(rgb.b)}`
}
