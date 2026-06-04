import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'

import heroImg from './assets/profile-default.jpg'
import './App.css'
import BorderGlow from './components/BorderGlow'
import LogoLoop from './components/LogoLoop'
import PixelTransitionImage from './components/PixelTransitionImage'
import Vortex from './components/Vortex'

const COLOR_THEMES = [
  { id: 'rose', label: 'Rose', hue: 335, glow: '#ff7dc4' },
  { id: 'violet', label: 'Violet', hue: 285, glow: '#b38cff' },
  { id: 'cyan', label: 'Cyan', hue: 205, glow: '#73d8ff' },
  { id: 'gold', label: 'Gold', hue: 38, glow: '#ffd36f' },
  { id: 'emerald', label: 'Emerald', hue: 146, glow: '#61e7ae' },
  { id: 'sunset', label: 'Sunset', hue: 12, glow: '#ff9a6b' },
  { id: 'ice', label: 'Ice', hue: 190, glow: '#a8f0ff' },
  { id: 'orchid', label: 'Orchid', hue: 315, glow: '#ff98f4' },
] as const

const SURFACE_THEMES = {
  dark: {
    backgroundColor: '#000000',
    shellClassName: 'theme-dark',
    particleLightness: 60,
    particleSaturation: 100,
    particleAlpha: 1,
    glowBoost: 2,
    blendMode: 'lighter' as GlobalCompositeOperation,
  },
  light: {
    backgroundColor: '#f6efe7',
    shellClassName: 'theme-light',
    particleLightness: 36,
    particleSaturation: 88,
    particleAlpha: 0.92,
    glowBoost: 1.02,
    blendMode: 'source-over' as GlobalCompositeOperation,
  },
} as const

const LOGO_ITEMS = [
  { label: 'XSN Identity', accent: '#73d8ff' },
  { label: 'React', accent: '#73d8ff' },
  { label: 'Pixel Transition', accent: '#ff7dc4' },
  { label: 'Border Glow', accent: '#b38cff' },
  { label: 'Vortex', accent: '#61e7ae' },
  { label: 'Portfolio Card', accent: '#ffd36f' },
]

const STORAGE_KEY = 'hp-shared-profile-image-v2'
const STORAGE_MODE_KEY = 'hp-shared-profile-image-mode-v2'

type SurfaceThemeId = keyof typeof SURFACE_THEMES
type ImageMode = 'upload' | 'url'
type EditableField = 'fullName' | 'nickname' | 'group' | 'tagline' | null

function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [imageMenuOpen, setImageMenuOpen] = useState(false)
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [editingField, setEditingField] = useState<EditableField>(null)
  const [themeId, setThemeId] = useState('cyan')
  const [surfaceTheme, setSurfaceTheme] = useState<SurfaceThemeId>('dark')
  const [imageZoom, setImageZoom] = useState(1)
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 })
  const [profile, setProfile] = useState({
    fullName: 'น.ส.ณัฐริกา ทองสมุด',
    nickname: 'ฟ้า',
    group: 'ปวส.1/ทดธ/1',
    tagline: 'FAHSAI',
    description: '',
  })
  const [imageSrc, setImageSrc] = useState(() => {
    if (typeof window === 'undefined') {
      return heroImg
    }

    return window.localStorage.getItem(STORAGE_KEY) || heroImg
  })
  const [imageMode, setImageMode] = useState<ImageMode>(() => {
    if (typeof window === 'undefined') {
      return 'upload'
    }

    const storedMode = window.localStorage.getItem(STORAGE_MODE_KEY)
    return storedMode === 'url' ? 'url' : 'upload'
  })
  const [imageUrlInput, setImageUrlInput] = useState(() => {
    if (typeof window === 'undefined') {
      return ''
    }

    const storedMode = window.localStorage.getItem(STORAGE_MODE_KEY)
    const storedSrc = window.localStorage.getItem(STORAGE_KEY)
    return storedMode === 'url' && storedSrc ? storedSrc : ''
  })

  const activeColorTheme =
    COLOR_THEMES.find((theme) => theme.id === themeId) ?? COLOR_THEMES[0]
  const activeSurfaceTheme = SURFACE_THEMES[surfaceTheme]

  const rootClassName = useMemo(
    () => `page-shell ${activeSurfaceTheme.shellClassName}`,
    [activeSurfaceTheme.shellClassName],
  )
  const themeGlowStyle = useMemo(
    () => ({ '--theme-glow': activeColorTheme.glow } as CSSProperties),
    [activeColorTheme.glow],
  )

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      if (!result) {
        return
      }

      setImageSrc(result)
      setImageMode('upload')
      setImageUrlInput('')
      window.localStorage.setItem(STORAGE_KEY, result)
      window.localStorage.setItem(STORAGE_MODE_KEY, 'upload')
      setImageMenuOpen(false)
    }

    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const handleApplyImageUrl = () => {
    const trimmed = imageUrlInput.trim()
    if (!trimmed) {
      return
    }

    setImageSrc(trimmed)
    setImageMode('url')
    window.localStorage.setItem(STORAGE_KEY, trimmed)
    window.localStorage.setItem(STORAGE_MODE_KEY, 'url')
    setImageMenuOpen(false)
  }

  const handleResetImage = () => {
    setImageSrc(heroImg)
    setImageUrlInput('')
    setImageMode('upload')
    window.localStorage.removeItem(STORAGE_KEY)
    window.localStorage.removeItem(STORAGE_MODE_KEY)
    setImageMenuOpen(false)
  }

  const handleFieldKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setEditingField(null)
      event.currentTarget.blur()
    }

    if (event.key === 'Escape') {
      setEditingField(null)
      event.currentTarget.blur()
    }
  }

  const handleOpenViewer = () => {
    setImageZoom(1)
    setImagePan({ x: 0, y: 0 })
    setImageViewerOpen(true)
  }

  return (
    <Vortex
      backgroundColor={activeSurfaceTheme.backgroundColor}
      className={rootClassName}
      particleCount={700}
      baseHue={activeColorTheme.hue}
      rangeY={600}
      baseSpeed={0.15}
      rangeSpeed={1.2}
      baseRadius={0.8}
      rangeRadius={1.4}
      particleLightness={activeSurfaceTheme.particleLightness}
      particleSaturation={activeSurfaceTheme.particleSaturation}
      particleAlpha={activeSurfaceTheme.particleAlpha}
      glowBoost={activeSurfaceTheme.glowBoost}
      blendMode={activeSurfaceTheme.blendMode}
    >
      <div className="page-theme-layer" style={themeGlowStyle}>
        {settingsOpen ? (
          <button
            type="button"
            className="theme-backdrop"
            aria-label="Close theme settings"
            onClick={() => setSettingsOpen(false)}
          />
        ) : null}

        {imageMenuOpen ? (
          <button
            type="button"
            className="theme-backdrop"
            aria-label="Close image settings"
            onClick={() => setImageMenuOpen(false)}
          />
        ) : null}

        <BorderGlow className="profile-frame-glow" glowColor={activeColorTheme.glow}>
          <section className="profile-frame">
            <div className="profile-card">
              <div className="profile-card__media">
                <button
                  type="button"
                  className="profile-card__media-button"
                  onClick={handleOpenViewer}
                  aria-label="Open image viewer"
                >
                  <PixelTransitionImage src={imageSrc} alt="Profile preview" />
                </button>

                <BorderGlow className="glow-frame glow-frame--icon" glowColor={activeColorTheme.glow}>
                  <button
                    type="button"
                    className="profile-card__edit"
                    onClick={() => setImageMenuOpen(true)}
                    aria-label="Edit image"
                  >
                    ✎
                  </button>
                </BorderGlow>

                {imageMenuOpen ? (
                  <BorderGlow className="glow-frame glow-frame--menu" glowColor={activeColorTheme.glow}>
                    <div className="image-menu" role="dialog" aria-label="Image settings">
                      <div className="image-menu__section">
                        <span className="image-menu__label">รูปภาพ</span>
                        <div className="image-menu__actions">
                          <button
                            type="button"
                            className="image-menu__button"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {imageMode === 'upload' && imageSrc !== heroImg ? 'เปลี่ยนรูป' : 'เลือกรูป'}
                          </button>
                          <button
                            type="button"
                            className="image-menu__button image-menu__button--ghost"
                            onClick={handleResetImage}
                          >
                            ลบรูป
                          </button>
                        </div>
                      </div>

                      <div className="image-menu__section">
                        <span className="image-menu__label">Image URL</span>
                        <input
                          className="image-menu__input"
                          value={imageUrlInput}
                          onChange={(event) => setImageUrlInput(event.target.value)}
                          placeholder="https://..."
                        />
                        <button
                          type="button"
                          className="image-menu__button image-menu__button--full"
                          onClick={handleApplyImageUrl}
                        >
                          ใช้ลิงก์รูป
                        </button>
                        <p className="image-menu__hint">
                          ถ้าอยากให้เปิดบน GitHub Pages แล้วเครื่องอื่นเห็นรูปเดียวกัน ให้ใช้ลิงก์รูปสาธารณะ
                        </p>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleFileChange}
                      />
                    </div>
                  </BorderGlow>
                ) : null}
              </div>

              <div className="profile-card__content">
                <div className="profile-card__header">
                  <BorderGlow className="glow-frame glow-frame--pill" glowColor={activeColorTheme.glow}>
                    <span className="profile-card__eyebrow">Profile</span>
                  </BorderGlow>

                  <BorderGlow className="glow-frame glow-frame--tagline" glowColor={activeColorTheme.glow}>
                    <button
                      type="button"
                      className={`tagline-pill ${editingField === 'tagline' ? 'tagline-pill--editing' : ''}`}
                      onClick={() => setEditingField('tagline')}
                    >
                      {editingField === 'tagline' ? (
                        <input
                          autoFocus
                          className="tagline-pill__input"
                          value={profile.tagline}
                          onChange={(event) =>
                            setProfile((current) => ({
                              ...current,
                              tagline: event.target.value,
                            }))
                          }
                          onBlur={() => setEditingField(null)}
                          onKeyDown={handleFieldKeyDown}
                        />
                      ) : (
                        <span>{profile.tagline}</span>
                      )}
                    </button>
                  </BorderGlow>
                </div>

                <div className="profile-card__fields">
                  <BorderGlow className="glow-frame glow-frame--field" glowColor={activeColorTheme.glow}>
                    <article
                      className={`info-box ${editingField === 'fullName' ? 'info-box--editing' : ''}`}
                      onClick={() => setEditingField('fullName')}
                    >
                      <span>ชื่อจริง</span>
                      {editingField === 'fullName' ? (
                        <input
                          autoFocus
                          className="info-box__input"
                          value={profile.fullName}
                          onChange={(event) =>
                            setProfile((current) => ({
                              ...current,
                              fullName: event.target.value,
                            }))
                          }
                          onBlur={() => setEditingField(null)}
                          onKeyDown={handleFieldKeyDown}
                        />
                      ) : (
                        <strong>{profile.fullName}</strong>
                      )}
                    </article>
                  </BorderGlow>

                  <BorderGlow className="glow-frame glow-frame--field" glowColor={activeColorTheme.glow}>
                    <article
                      className={`info-box ${editingField === 'nickname' ? 'info-box--editing' : ''}`}
                      onClick={() => setEditingField('nickname')}
                    >
                      <span>ชื่อเล่น</span>
                      {editingField === 'nickname' ? (
                        <input
                          autoFocus
                          className="info-box__input"
                          value={profile.nickname}
                          onChange={(event) =>
                            setProfile((current) => ({
                              ...current,
                              nickname: event.target.value,
                            }))
                          }
                          onBlur={() => setEditingField(null)}
                          onKeyDown={handleFieldKeyDown}
                        />
                      ) : (
                        <strong>{profile.nickname}</strong>
                      )}
                    </article>
                  </BorderGlow>

                  <BorderGlow className="glow-frame glow-frame--field" glowColor={activeColorTheme.glow}>
                    <article
                      className={`info-box ${editingField === 'group' ? 'info-box--editing' : ''}`}
                      onClick={() => setEditingField('group')}
                    >
                      <span>กลุ่ม / ห้อง</span>
                      {editingField === 'group' ? (
                        <input
                          autoFocus
                          className="info-box__input"
                          value={profile.group}
                          onChange={(event) =>
                            setProfile((current) => ({
                              ...current,
                              group: event.target.value,
                            }))
                          }
                          onBlur={() => setEditingField(null)}
                          onKeyDown={handleFieldKeyDown}
                        />
                      ) : (
                        <strong>{profile.group}</strong>
                      )}
                    </article>
                  </BorderGlow>
                </div>

                <BorderGlow className="glow-frame glow-frame--wide" glowColor={activeColorTheme.glow}>
                  <article className="info-box info-box--wide">
                    <textarea
                      className="info-box__textarea"
                      value={profile.description}
                      onChange={(event) =>
                        setProfile((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                    />
                  </article>
                </BorderGlow>
              </div>
            </div>
          </section>
        </BorderGlow>

        {imageViewerOpen ? (
          <ImageViewerModal
            src={imageSrc}
            zoom={imageZoom}
            pan={imagePan}
            onZoomChange={setImageZoom}
            onPanChange={setImagePan}
            onClose={() => setImageViewerOpen(false)}
            glowColor={activeColorTheme.glow}
          />
        ) : null}

        <div className={`theme-dock ${settingsOpen ? 'theme-dock--open' : ''}`}>
          <BorderGlow className="glow-frame glow-frame--dock-panel" glowColor={activeColorTheme.glow}>
            <div className="theme-dock__panel">
              <div className="theme-dock__head">
                <span>Theme Settings</span>
              </div>

              <div className="theme-dock__group">
                <span className="theme-dock__label">Surface</span>
                <div className="theme-dock__surface-toggle">
                  <button
                    type="button"
                    className={`surface-toggle ${surfaceTheme === 'dark' ? 'surface-toggle--active' : ''}`}
                    onClick={() => setSurfaceTheme('dark')}
                  >
                    Dark
                  </button>
                  <button
                    type="button"
                    className={`surface-toggle ${surfaceTheme === 'light' ? 'surface-toggle--active' : ''}`}
                    onClick={() => setSurfaceTheme('light')}
                  >
                    Light
                  </button>
                </div>
              </div>

              <div className="theme-dock__group">
                <span className="theme-dock__label">Vortex Color</span>
                <div className="theme-dock__swatches">
                  {COLOR_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      className={`theme-swatch ${theme.id === activeColorTheme.id ? 'theme-swatch--active' : ''}`}
                      onClick={() => setThemeId(theme.id)}
                      aria-label={`Use ${theme.label} theme`}
                    >
                      <span
                        className="theme-swatch__dot"
                        style={{ background: theme.glow, color: theme.glow }}
                      />
                      <span>{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </BorderGlow>

          <BorderGlow className="glow-frame glow-frame--dock-toggle" glowColor={activeColorTheme.glow}>
            <button
              type="button"
              className="theme-dock__toggle"
              onClick={() => setSettingsOpen((value) => !value)}
            >
              Setting
            </button>
          </BorderGlow>
        </div>

        <LogoLoop items={LOGO_ITEMS} />
      </div>
    </Vortex>
  )
}

export default App

type ImageViewerModalProps = {
  src: string
  zoom: number
  pan: { x: number; y: number }
  onZoomChange: (zoom: number) => void
  onPanChange: (pan: { x: number; y: number }) => void
  onClose: () => void
  glowColor: string
}

function ImageViewerModal({
  src,
  zoom,
  pan,
  onZoomChange,
  onPanChange,
  onClose,
  glowColor,
}: ImageViewerModalProps) {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 })

  const clampZoom = (value: number) => Math.min(3, Math.max(1, value))

  const clampPan = useCallback(
    (nextPan: { x: number; y: number }, nextZoom: number) => {
      if (nextZoom <= 1) {
        return { x: 0, y: 0 }
      }

      const stage = stageRef.current
      if (!stage || !imageSize.width || !imageSize.height) {
        return nextPan
      }

      const rect = stage.getBoundingClientRect()
      const fittedScale = Math.min(rect.width / imageSize.width, rect.height / imageSize.height)
      const baseWidth = imageSize.width * fittedScale
      const baseHeight = imageSize.height * fittedScale
      const scaledWidth = baseWidth * nextZoom
      const scaledHeight = baseHeight * nextZoom
      const maxX = Math.max(0, (scaledWidth - rect.width) / 2)
      const maxY = Math.max(0, (scaledHeight - rect.height) / 2)

      return {
        x: Math.min(maxX, Math.max(-maxX, nextPan.x)),
        y: Math.min(maxY, Math.max(-maxY, nextPan.y)),
      }
    },
    [imageSize.height, imageSize.width],
  )

  useEffect(() => {
    const nextPan = clampPan(pan, zoom)
    if (nextPan.x !== pan.x || nextPan.y !== pan.y) {
      onPanChange(nextPan)
    }
  }, [clampPan, onPanChange, pan, zoom])

  const handleZoomChange = (nextZoom: number) => {
    const clampedZoom = clampZoom(nextZoom)
    onZoomChange(clampedZoom)
    onPanChange(clampPan(pan, clampedZoom))
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (zoom <= 1) {
      return
    }

    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      panX: pan.x,
      panY: pan.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) {
      return
    }

    onPanChange(
      clampPan(
        {
          x: dragRef.current.panX + (event.clientX - dragRef.current.x),
          y: dragRef.current.panY + (event.clientY - dragRef.current.y),
        },
        zoom,
      ),
    )
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault()
    const delta = event.deltaY > 0 ? -0.12 : 0.12
    handleZoomChange(zoom + delta)
  }

  return (
    <div className="image-viewer" role="dialog" aria-label="Image viewer">
      <button
        type="button"
        className="image-viewer__backdrop"
        aria-label="Close image viewer"
        onClick={onClose}
      />

      <BorderGlow className="glow-frame glow-frame--viewer" glowColor={glowColor}>
        <div className="image-viewer__panel" onClick={(event) => event.stopPropagation()}>
          <div className="image-viewer__topbar">
            <span>Image Viewer</span>
            <button type="button" className="image-viewer__close" onClick={onClose}>
              ปิด
            </button>
          </div>

          <div
            ref={stageRef}
            className={`image-viewer__stage ${zoom > 1 ? 'image-viewer__stage--draggable' : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
          >
            <img
              src={src}
              alt="Zoom preview"
              className="image-viewer__image"
              onLoad={(event) =>
                setImageSize({
                  width: event.currentTarget.naturalWidth || 1,
                  height: event.currentTarget.naturalHeight || 1,
                })
              }
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              }}
            />
          </div>

          <div className="image-viewer__controls">
            <span>ซูม</span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(event) => handleZoomChange(Number(event.target.value))}
            />
            <button
              type="button"
              className="image-viewer__reset"
              onClick={() => {
                handleZoomChange(1)
              }}
            >
              รีเซ็ต
            </button>
          </div>
        </div>
      </BorderGlow>
    </div>
  )
}
