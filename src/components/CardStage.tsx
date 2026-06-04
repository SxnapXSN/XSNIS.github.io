import { useEffect, useRef } from 'react'

import type { CardPosition, IdentityState, TextLayer } from '../types'

type CardStageProps = {
  identity: IdentityState
  layers: TextLayer[]
  selectedLayerId: string | null
  cardPosition: CardPosition
  onSelectLayer: (layerId: string) => void
  onUpdateLayer: (layerId: string, patch: Partial<TextLayer>) => void
  onMoveCard: (position: CardPosition) => void
}

const CARD_WIDTH = 1000
const CARD_HEIGHT = 1600

function resolveLayerText(layer: TextLayer, identity: IdentityState) {
  if (layer.kind === 'fullName') {
    const fullName = `${identity.firstName} ${identity.lastName}`.trim()
    return fullName || 'ชื่อ นามสกุล'
  }

  if (layer.kind === 'nickname') {
    return identity.nickname.trim() || 'ชื่อเล่น'
  }

  return layer.text.trim() || 'ข้อความใหม่'
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function CardStage({
  identity,
  layers,
  selectedLayerId,
  cardPosition,
  onSelectLayer,
  onUpdateLayer,
  onMoveCard,
}: CardStageProps) {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const interactionRef = useRef<
    | {
        type: 'card'
        startX: number
        startY: number
        originX: number
        originY: number
      }
    | {
        type: 'layer'
        layerId: string
        startX: number
        startY: number
        originX: number
        originY: number
        scaleX: number
        scaleY: number
      }
    | {
        type: 'resize'
        layerId: string
        startX: number
        startY: number
        originWidth: number
        originHeight: number
        scaleX: number
        scaleY: number
      }
    | null
  >(null)

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const active = interactionRef.current
      const card = cardRef.current
      const stage = stageRef.current

      if (!active || !card || !stage) {
        return
      }

      if (active.type === 'card') {
        const nextX = active.originX + (event.clientX - active.startX)
        const nextY = active.originY + (event.clientY - active.startY)
        const stageRect = stage.getBoundingClientRect()
        const cardRect = card.getBoundingClientRect()
        const maxX = Math.max((stageRect.width - cardRect.width) / 2, 20)
        const maxY = Math.max((stageRect.height - cardRect.height) / 2, 20)

        onMoveCard({
          x: clampNumber(nextX, -maxX, maxX),
          y: clampNumber(nextY, -maxY, maxY),
        })

        return
      }

      if (active.type === 'layer') {
        const deltaX = (event.clientX - active.startX) * active.scaleX
        const deltaY = (event.clientY - active.startY) * active.scaleY
        onUpdateLayer(active.layerId, {
          x: active.originX + deltaX,
          y: active.originY + deltaY,
        })
      } else {
        const deltaWidth = (event.clientX - active.startX) * active.scaleX
        const deltaHeight = (event.clientY - active.startY) * active.scaleY
        onUpdateLayer(active.layerId, {
          width: active.originWidth + deltaWidth,
          height: active.originHeight + deltaHeight,
        })
      }
    }

    const clearInteraction = () => {
      interactionRef.current = null
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', clearInteraction)
    window.addEventListener('pointercancel', clearInteraction)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', clearInteraction)
      window.removeEventListener('pointercancel', clearInteraction)
    }
  }, [onMoveCard, onUpdateLayer])

  const beginCardDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return
    }

    interactionRef.current = {
      type: 'card',
      startX: event.clientX,
      startY: event.clientY,
      originX: cardPosition.x,
      originY: cardPosition.y,
    }
  }

  const renderLayer = (layer: TextLayer) => {
    const text = resolveLayerText(layer, identity)
    const isSelected = selectedLayerId === layer.id
    const left = `${(layer.x / CARD_WIDTH) * 100}%`
    const top = `${(layer.y / CARD_HEIGHT) * 100}%`
    const width = `${(layer.width / CARD_WIDTH) * 100}%`
    const height = `${(layer.height / CARD_HEIGHT) * 100}%`

    const beginLayerDrag = (event: React.PointerEvent<HTMLDivElement>) => {
      event.stopPropagation()
      onSelectLayer(layer.id)

      if (layer.locked || !cardRef.current) {
        return
      }

      const cardRect = cardRef.current.getBoundingClientRect()
      interactionRef.current = {
        type: 'layer',
        layerId: layer.id,
        startX: event.clientX,
        startY: event.clientY,
        originX: layer.x,
        originY: layer.y,
        scaleX: CARD_WIDTH / cardRect.width,
        scaleY: CARD_HEIGHT / cardRect.height,
      }
    }

    const beginResize = (event: React.PointerEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      onSelectLayer(layer.id)

      if (layer.locked || !cardRef.current) {
        return
      }

      const cardRect = cardRef.current.getBoundingClientRect()
      interactionRef.current = {
        type: 'resize',
        layerId: layer.id,
        startX: event.clientX,
        startY: event.clientY,
        originWidth: layer.width,
        originHeight: layer.height,
        scaleX: CARD_WIDTH / cardRect.width,
        scaleY: CARD_HEIGHT / cardRect.height,
      }
    }

    return (
      <div
        key={layer.id}
        className={[
          'card-layer',
          isSelected ? 'card-layer--selected' : '',
          layer.locked ? 'card-layer--locked' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          left,
          top,
          width,
          height,
          color: layer.color,
          fontSize: `${(layer.fontSize / CARD_WIDTH) * 100}cqi`,
          fontWeight: layer.weight,
          textAlign: layer.align,
          transform: `rotate(${layer.rotate}deg)`,
        }}
        onPointerDown={beginLayerDrag}
      >
        <span className="card-layer__badge">{layer.label}</span>
        <div className="card-layer__text">{text}</div>
        {layer.locked ? (
          <span className="card-layer__status">Locked</span>
        ) : null}
        {!layer.locked ? (
          <button
            type="button"
            className="card-layer__resize"
            aria-label={`Resize ${layer.label}`}
            onPointerDown={beginResize}
          />
        ) : null}
      </div>
    )
  }

  return (
    <section className="studio-stage">
      <div className="studio-stage__head">
        <div>
          <p className="eyebrow">Preview Stage</p>
          <h2>ลากบัตรและจัดเลเยอร์ได้ตรงนี้</h2>
        </div>
        <span className="studio-stage__hint">ลากพื้นหลังของบัตรเพื่อขยับทั้งใบ</span>
      </div>

      <div ref={stageRef} className="studio-stage__arena">
        <div
          ref={cardRef}
        className="identity-card"
        style={{
            transform: `translate(-50%, -50%) translate(${cardPosition.x}px, ${cardPosition.y}px)`,
        }}
      >
          <div className="identity-card__chrome" />
          <div className="identity-card__noise" />
          <div className="identity-card__meta">
            <span>XSN Identity</span>
            <span>Interactive Composer</span>
          </div>
          <div className="identity-card__surface" onPointerDown={beginCardDrag}>
            {layers.map(renderLayer)}
          </div>
          <div className="identity-card__footer">
            <span>Responsive editor core</span>
            <span>Premium / stable / low-jank</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CardStage
