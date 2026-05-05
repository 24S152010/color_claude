import { rgbToHex } from '../utils/color'
import type { RGB } from '../utils/color'
import type { Translations } from '../locales'

interface EditorControlsProps {
  t: Translations['controls']
  onImageUpload: (file: File) => void
  hasImage: boolean
  title: string
  onTitleChange: (v: string) => void
  dateStr: string
  onDateChange: (v: string) => void
  onResetDate: () => void
  splitRatio: number
  onSplitRatioChange: (v: number) => void
  fontSize: number
  onFontSizeChange: (v: number) => void
  backgroundColor: RGB
  palette: RGB[]
  onSelectColor: (c: RGB) => void
  onRandomColor: () => void
  grain: boolean
  onToggleGrain: () => void
  onExport: () => void
}

function Section({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          fontSize: 11,
          letterSpacing: '1.5px',
          color: '#999',
          marginBottom: 12,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  )
}

export default function EditorControls({
  t,
  onImageUpload,
  hasImage,
  title,
  onTitleChange,
  dateStr,
  onDateChange,
  onResetDate,
  splitRatio,
  onSplitRatioChange,
  fontSize,
  onFontSizeChange,
  backgroundColor,
  palette,
  onSelectColor,
  onRandomColor,
  grain,
  onToggleGrain,
  onExport,
}: EditorControlsProps) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onImageUpload(file)
  }

  return (
    <div
      style={{
        padding: '24px',
        overflowY: 'auto',
        height: '100%',
      }}
    >
      <Section label={t.photo}>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            border: '1px solid #d4d4d4',
            fontSize: 13,
            cursor: 'pointer',
            color: '#333',
            background: '#fff',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.borderColor = '#999')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.borderColor = '#d4d4d4')
          }
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            style={{ display: 'none' }}
          />
          {hasImage ? t.replacePhoto : t.uploadPhoto}
        </label>
      </Section>

      <Section label={t.title}>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={t.enterTitle}
          style={{
            width: '100%',
            padding: '8px 0',
            border: 'none',
            borderBottom: '1px solid #d4d4d4',
            fontSize: 14,
            outline: 'none',
            background: 'transparent',
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
          }}
        />
      </Section>

      <Section label={t.date}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            value={dateStr}
            onChange={(e) => onDateChange(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 0',
              border: 'none',
              borderBottom: '1px solid #d4d4d4',
              fontSize: 14,
              outline: 'none',
              background: 'transparent',
              fontFamily:
                "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
            }}
          />
          <button
            onClick={onResetDate}
            style={{
              padding: '6px 12px',
              border: '1px solid #d4d4d4',
              background: '#fff',
              fontSize: 11,
              letterSpacing: '1px',
              cursor: 'pointer',
              color: '#666',
            }}
          >
            {t.reset}
          </button>
        </div>
      </Section>

      <Section label={t.splitRatio}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 13,
            color: '#666',
          }}
        >
          <span style={{ minWidth: 28 }}>{splitRatio}</span>
          <input
            type="range"
            min={30}
            max={70}
            value={splitRatio}
            onChange={(e) => onSplitRatioChange(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ minWidth: 28 }}>{100 - splitRatio}</span>
        </div>
      </Section>

      <Section label={t.fontSize}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 13,
            color: '#666',
          }}
        >
          <span style={{ minWidth: 36 }}>{fontSize}px</span>
          <input
            type="range"
            min={16}
            max={64}
            value={fontSize}
            onChange={(e) => onFontSizeChange(Number(e.target.value))}
            style={{ flex: 1 }}
          />
        </div>
      </Section>

      <Section label={t.backgroundColor}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              background: rgbToHex(backgroundColor),
              border: '1px solid #e0e0e0',
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontFamily:
                "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
              color: '#555',
              textTransform: 'uppercase',
            }}
          >
            {rgbToHex(backgroundColor)}
          </span>
          <button
            onClick={onRandomColor}
            style={{
              marginLeft: 'auto',
              padding: '6px 12px',
              border: '1px solid #d4d4d4',
              background: '#fff',
              fontSize: 11,
              letterSpacing: '1px',
              cursor: 'pointer',
              color: '#666',
            }}
          >
            {t.random}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {palette.map((c, i) => (
            <button
              key={i}
              onClick={() => onSelectColor(c)}
              style={{
                width: 28,
                height: 28,
                background: rgbToHex(c),
                border:
                  rgbToHex(c) === rgbToHex(backgroundColor)
                    ? '2px solid #333'
                    : '1px solid #e0e0e0',
                cursor: 'pointer',
                padding: 0,
              }}
              title={rgbToHex(c)}
            />
          ))}
        </div>
      </Section>

      <Section label={t.grain}>
        <button
          onClick={onToggleGrain}
          style={{
            padding: '6px 14px',
            border: '1px solid #d4d4d4',
            background: grain ? '#1a1a1a' : '#fff',
            color: grain ? '#fff' : '#333',
            fontSize: 12,
            letterSpacing: '1px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {grain ? t.on : t.off}
        </button>
      </Section>

      <div style={{ marginTop: 8 }}>
        <button
          onClick={onExport}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #1a1a1a',
            background: '#1a1a1a',
            color: '#fff',
            fontSize: 13,
            letterSpacing: '1.5px',
            cursor: 'pointer',
          }}
        >
          {t.exportPng}
        </button>
      </div>
    </div>
  )
}
