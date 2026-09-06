// 教材ごとの見た目(色・アイコン)。spec 6章「文字よりも視覚的に選べるように」。
//
// - ユーザーが未設定の教材にも、名前から決まる色を自動で割り当てる
//   (毎回同じ色になるので学習しやすい)
// - 設定画面から色・アイコンを上書きできる(materialStyles ドキュメント)

import {
  Book,
  BookOpen,
  Headphones,
  PencilLine,
  Calculator,
  FlaskConical,
  Globe,
  Languages,
  Code,
  Music,
  Dumbbell,
  NotebookPen,
  Sigma,
  Mic,
} from 'lucide-react'
import { comboKey } from '../data/tags.js'
import { normalizeHex } from './color.js'

// 両テーマで視認できる、彩度control えめの12色。
export const PRESET_COLORS = [
  '#f87171', // red
  '#fb923c', // orange
  '#fbbf24', // amber
  '#a3e635', // lime
  '#34d399', // emerald
  '#22d3ee', // cyan
  '#38bdf8', // sky
  '#818cf8', // indigo
  '#c084fc', // purple
  '#f472b6', // pink
  '#94a3b8', // slate
  '#a8a29e', // stone
]

// アイコン名 → lucide コンポーネント。設定で選べる候補。
export const MATERIAL_ICONS = {
  book: Book,
  bookOpen: BookOpen,
  notebook: NotebookPen,
  pencil: PencilLine,
  headphones: Headphones,
  mic: Mic,
  calculator: Calculator,
  sigma: Sigma,
  flask: FlaskConical,
  globe: Globe,
  languages: Languages,
  code: Code,
  music: Music,
  dumbbell: Dumbbell,
}
export const MATERIAL_ICON_NAMES = Object.keys(MATERIAL_ICONS)
export const DEFAULT_ICON_NAME = 'book'

// 文字列 → 安定した整数ハッシュ
function hashString(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

// 未設定時の既定色(教科+教材の名前から決まる)
export function defaultColorFor(subject, material) {
  const key = `${subject}␟${material}`
  return PRESET_COLORS[hashString(key) % PRESET_COLORS.length]
}

// materialStyles(Firestore の1ドキュメント)から、その教材の { color, iconName } を解決する。
export function resolveMaterialStyle(materialStyles, subject, material) {
  const saved = materialStyles?.[comboKey(subject, material)] || null
  return {
    color: normalizeHex(saved?.color || defaultColorFor(subject, material)),
    iconName:
      saved?.icon && MATERIAL_ICONS[saved.icon] ? saved.icon : DEFAULT_ICON_NAME,
  }
}

// アイコン名 → コンポーネント(無ければ既定)
export function iconComponent(name) {
  return MATERIAL_ICONS[name] || MATERIAL_ICONS[DEFAULT_ICON_NAME]
}
