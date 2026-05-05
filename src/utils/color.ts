export interface RGB {
  r: number
  g: number
  b: number
}

export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '')
  const bigint = parseInt(clean, 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

export function getLuminance({ r, g, b }: RGB): number {
  const [rs, gs, bs] = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

export function isLightColor(rgb: RGB): boolean {
  return getLuminance(rgb) > 0.5
}

export function getContrastText(rgb: RGB): string {
  return isLightColor(rgb) ? '#1a1a1a' : '#f5f5f5'
}

function colorDistance(a: RGB, b: RGB): number {
  return Math.sqrt(
    Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2)
  )
}

function isValidColor(r: number, g: number, b: number, a: number): boolean {
  if (a < 128) return false
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max > 250 && min > 250) return false
  if (max < 15 && min < 15) return false
  if (max - min < 15) return false
  return true
}

function quantize(value: number, step: number): number {
  return Math.round(value / step) * step
}

export function extractColors(image: HTMLImageElement): {
  primary: RGB
  palette: RGB[]
} {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const size = 120
  canvas.width = size
  canvas.height = size
  ctx.drawImage(image, 0, 0, size, size)

  const data = ctx.getImageData(0, 0, size, size).data
  const colorMap = new Map<
    string,
    { sumR: number; sumG: number; sumB: number; count: number }
  >()

  const step = 24
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]

    if (!isValidColor(r, g, b, a)) continue

    const qr = quantize(r, step)
    const qg = quantize(g, step)
    const qb = quantize(b, step)
    const key = `${qr},${qg},${qb}`

    const existing = colorMap.get(key)
    if (existing) {
      existing.sumR += r
      existing.sumG += g
      existing.sumB += b
      existing.count++
    } else {
      colorMap.set(key, { sumR: r, sumG: g, sumB: b, count: 1 })
    }
  }

  const sorted = Array.from(colorMap.entries())
    .map(([key, val]) => ({
      key,
      rgb: {
        r: Math.round(val.sumR / val.count),
        g: Math.round(val.sumG / val.count),
        b: Math.round(val.sumB / val.count),
      },
      count: val.count,
    }))
    .sort((a, b) => b.count - a.count)

  const uniqueColors: RGB[] = []
  for (const item of sorted) {
    if (uniqueColors.length >= 8) break
    const tooClose = uniqueColors.some(
      (c) => colorDistance(c, item.rgb) < 40
    )
    if (!tooClose) {
      uniqueColors.push(item.rgb)
    }
  }

  if (uniqueColors.length === 0) {
    uniqueColors.push({ r: 200, g: 180, b: 160 })
  }

  return {
    primary: uniqueColors[0],
    palette: uniqueColors,
  }
}
