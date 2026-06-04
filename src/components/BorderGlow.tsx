import { useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import type { CSSProperties } from 'react'

type BorderGlowProps = {
  children: ReactNode
  className?: string
  glowColor: string
}

function BorderGlow({ children, className = '', glowColor }: BorderGlowProps) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const glowStyle = { '--glow-color': glowColor } as CSSProperties

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const node = cardRef.current
      if (!node) {
        return
      }

      const rect = node.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      node.style.setProperty('--glow-x', `${x}px`)
      node.style.setProperty('--glow-y', `${y}px`)
      node.style.setProperty('--glow-color', glowColor)
    },
    [glowColor],
  )

  return (
    <div
      ref={cardRef}
      className={`border-glow ${className}`}
      onPointerMove={handlePointerMove}
      style={glowStyle}
    >
      <span className="border-glow__beam" />
      <div className="border-glow__inner">{children}</div>
    </div>
  )
}

export default BorderGlow
