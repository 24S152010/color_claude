import { useState, useCallback } from 'react'
import CoverCanvas from './components/CoverCanvas'
import EditorControls from './components/EditorControls'
import { extractColors } from './utils/color'
import type { RGB } from './utils/color'

function getTodayStr(): string {
  const d = new Date()
  const months = [
    'JAN','FEB','MAR','APR','MAY','JUN',
    'JUL','AUG','SEP','OCT','NOV','DEC'
  ]
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export default function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [title, setTitle] = useState('')
  const [dateStr, setDateStr] = useState(getTodayStr())
  const [splitRatio, setSplitRatio] = useState(50)
  const [fontSize, setFontSize] = useState(27)
  const [backgroundColor, setBackgroundColor] = useState<RGB>({ r: 220, g: 210, b: 200 })
  const [palette, setPalette] = useState<RGB[]>([{ r: 220, g: 210, b: 200 }])
  const [grain, setGrain] = useState(true)

  const handleImageUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setImage(img)
      const colors = extractColors(img)
      setBackgroundColor(colors.primary)
      setPalette(colors.palette)
    }
    img.src = url
  }, [])

  const handleExport = useCallback(() => {
    if (!image) return
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1350
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const topHeight = Math.round(1350 * (splitRatio / 100))
    const bottomHeight = 1350 - topHeight

    // Background
    const { r, g, b } = backgroundColor
    ctx.fillStyle = `rgb(${r},${g},${b})`
    ctx.fillRect(0, 0, 1080, topHeight)

    // Grain
    if (grain) {
      const imageData = ctx.getImageData(0, 0, 1080, topHeight)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 18
        data[i] = Math.max(0, Math.min(255, data[i] + noise))
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
      }
      ctx.putImageData(imageData, 0, 0)
    }

    // Photo (cover fit)
    const imgRatio = image.naturalWidth / image.naturalHeight
    const targetRatio = 1080 / bottomHeight
    let sx = 0, sy = 0, sw = image.naturalWidth, sh = image.naturalHeight
    if (imgRatio > targetRatio) {
      sw = image.naturalHeight * targetRatio
      sx = (image.naturalWidth - sw) / 2
    } else {
      sh = image.naturalWidth / targetRatio
      sy = (image.naturalHeight - sh) / 2
    }
    ctx.drawImage(image, sx, sy, sw, sh, 0, topHeight, 1080, bottomHeight)

    // Text
    const textColor =
      (0.2126 * (r/255) + 0.7152 * (g/255) + 0.0722 * (b/255)) > 0.5
        ? '#1a1a1a'
        : '#f5f5f5'
    ctx.fillStyle = textColor
    ctx.textAlign = 'center'

    const centerX = 540
    const centerY = topHeight / 2

    // Line
    ctx.strokeStyle = textColor
    ctx.lineWidth = 1.5
    const lineWidth = Math.max(40, fontSize * 1.5)
    ctx.beginPath()
    ctx.moveTo(centerX - lineWidth / 2, centerY - fontSize * 1.6)
    ctx.lineTo(centerX + lineWidth / 2, centerY - fontSize * 1.6)
    ctx.stroke()

    // Date
    ctx.font = `${Math.round(fontSize * 0.55)}px ui-monospace, 'SF Mono', Menlo, Consolas, monospace`
    ctx.fillText(dateStr.toUpperCase(), centerX, centerY - fontSize * 0.5)

    // Title
    if (title.trim()) {
      ctx.font = `400 ${Math.round(fontSize)}px ui-sans-serif, system-ui, -apple-system, sans-serif`
      ctx.fillText(title.trim(), centerX, centerY + fontSize * 0.7)
    }

    const link = document.createElement('a')
    link.download = `color-diary-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [image, title, dateStr, splitRatio, fontSize, backgroundColor, grain])

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">
          <div className="logo-box" />
          <span className="logo-text">Color Diary</span>
        </div>
        <div className="nav-right">
          <span>EN</span>
          <span>CN</span>
          <span>ABOUT</span>
        </div>
      </nav>

      {/* Main */}
      <div className="main">
        {/* Preview */}
        <div className="preview-area">
          <div className="preview-wrapper">
            {image ? (
              <CoverCanvas
                image={image}
                title={title}
                dateStr={dateStr}
                splitRatio={splitRatio}
                fontSize={fontSize}
                backgroundColor={backgroundColor}
                grain={grain}
                width={1080}
                height={1350}
              />
            ) : (
              <div className="preview-placeholder">
                <label className="upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file)
                    }}
                    style={{ display: 'none' }}
                  />
                  Upload a photo to get started
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="controls-area">
          <EditorControls
            onImageUpload={handleImageUpload}
            hasImage={!!image}
            title={title}
            onTitleChange={setTitle}
            dateStr={dateStr}
            onDateChange={setDateStr}
            onResetDate={() => setDateStr(getTodayStr())}
            splitRatio={splitRatio}
            onSplitRatioChange={setSplitRatio}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            backgroundColor={backgroundColor}
            palette={palette}
            onSelectColor={setBackgroundColor}
            onRandomColor={() =>
              setBackgroundColor(palette[Math.floor(Math.random() * palette.length)] || backgroundColor)
            }
            grain={grain}
            onToggleGrain={() => setGrain((g) => !g)}
            onExport={handleExport}
          />
        </div>
      </div>
    </div>
  )
}
