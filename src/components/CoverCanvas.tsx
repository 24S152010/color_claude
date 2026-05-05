import { forwardRef, useEffect, useRef } from 'react'
import { rgbToHex, getContrastText } from '../utils/color'
import type { RGB } from '../utils/color'

interface CoverCanvasProps {
  image: HTMLImageElement | null
  title: string
  dateStr: string
  splitRatio: number
  fontSize: number
  backgroundColor: RGB
  grain: boolean
  width?: number
  height?: number
}

const CoverCanvas = forwardRef<HTMLCanvasElement, CoverCanvasProps>(
  function CoverCanvas(
    {
      image,
      title,
      dateStr,
      splitRatio,
      fontSize,
      backgroundColor,
      grain,
      width = 1080,
      height = 1350,
    },
    forwardedRef
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = width
      canvas.height = height

      const topHeight = Math.round(height * (splitRatio / 100))
      const bottomHeight = height - topHeight

      // Background
      const bgHex = rgbToHex(backgroundColor)
      ctx.fillStyle = bgHex
      ctx.fillRect(0, 0, width, topHeight)

      // Grain
      if (grain) {
        const imageData = ctx.getImageData(0, 0, width, topHeight)
        const data = imageData.data
        for (let i = 0; i < data.length; i += 4) {
          const noise = (Math.random() - 0.5) * 18
          data[i] = Math.max(0, Math.min(255, data[i] + noise))
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
        }
        ctx.putImageData(imageData, 0, 0)
      }

      // Photo
      if (image) {
        const imgRatio = image.naturalWidth / image.naturalHeight
        const targetRatio = width / bottomHeight
        let sx = 0
        let sy = 0
        let sw = image.naturalWidth
        let sh = image.naturalHeight

        if (imgRatio > targetRatio) {
          sw = image.naturalHeight * targetRatio
          sx = (image.naturalWidth - sw) / 2
        } else {
          sh = image.naturalWidth / targetRatio
          sy = (image.naturalHeight - sh) / 2
        }

        ctx.drawImage(
          image,
          sx,
          sy,
          sw,
          sh,
          0,
          topHeight,
          width,
          bottomHeight
        )
      }

      // Text
      const textColor = getContrastText(backgroundColor)
      ctx.fillStyle = textColor
      ctx.textAlign = 'center'

      const centerX = width / 2
      const centerY = topHeight / 2

      // Line
      ctx.strokeStyle = textColor
      ctx.lineWidth = 1
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
    }, [image, title, dateStr, splitRatio, fontSize, backgroundColor, grain, width, height])

    return (
      <canvas
        ref={(node) => {
          canvasRef.current = node
          if (typeof forwardedRef === 'function') {
            forwardedRef(node)
          } else if (forwardedRef) {
            forwardedRef.current = node
          }
        }}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
        }}
      />
    )
  }
)

export default CoverCanvas
