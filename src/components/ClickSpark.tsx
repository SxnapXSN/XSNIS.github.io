import { useCallback, useEffect, useRef, type ReactNode } from 'react'

type ClickSparkProps = {
  sparkColor?: string
  sparkSize?: number
  sparkRadius?: number
  sparkCount?: number
  duration?: number
  easing?: 'ease-out' | 'linear' | 'ease-in' | 'ease-in-out'
  extraScale?: number
  children: ReactNode
}

function ClickSpark({
  sparkColor = '#ffd0eb',
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = 'ease-out',
  extraScale = 1,
  children,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const sparksRef = useRef<
    Array<{ x: number; y: number; angle: number; startTime: number }>
  >([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas?.parentElement) {
      return
    }

    let resizeTimeout: number | undefined

    const resizeCanvas = () => {
      const parentRect = canvas.parentElement?.getBoundingClientRect()
      if (!parentRect) {
        return
      }

      const width = Math.round(parentRect.width)
      const height = Math.round(parentRect.height)

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
    }

    const observer = new ResizeObserver(() => {
      if (resizeTimeout) {
        window.clearTimeout(resizeTimeout)
      }

      resizeTimeout = window.setTimeout(resizeCanvas, 80)
    })

    observer.observe(canvas.parentElement)
    resizeCanvas()

    return () => {
      observer.disconnect()
      if (resizeTimeout) {
        window.clearTimeout(resizeTimeout)
      }
    }
  }, [])

  const easeFunc = useCallback(
    (value: number) => {
      switch (easing) {
        case 'linear':
          return value
        case 'ease-in':
          return value * value
        case 'ease-in-out':
          return value < 0.5
            ? 2 * value * value
            : -1 + (4 - 2 * value) * value
        default:
          return value * (2 - value)
      }
    },
    [easing],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) {
      return
    }

    let frameId = 0

    const draw = (timestamp: number) => {
      context.clearRect(0, 0, canvas.width, canvas.height)

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime
        if (elapsed >= duration) {
          return false
        }

        const progress = elapsed / duration
        const eased = easeFunc(progress)
        const distance = eased * sparkRadius * extraScale
        const lineLength = sparkSize * (1 - eased)

        const x1 = spark.x + distance * Math.cos(spark.angle)
        const y1 = spark.y + distance * Math.sin(spark.angle)
        const x2 =
          spark.x + (distance + lineLength) * Math.cos(spark.angle)
        const y2 =
          spark.y + (distance + lineLength) * Math.sin(spark.angle)

        context.strokeStyle = sparkColor
        context.lineWidth = 2
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()

        return true
      })

      frameId = window.requestAnimationFrame(draw)
    }

    frameId = window.requestAnimationFrame(draw)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [duration, easeFunc, extraScale, sparkColor, sparkRadius, sparkSize])

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const now = performance.now()

    const sparks = Array.from({ length: sparkCount }, (_, index) => ({
      x,
      y,
      angle: (2 * Math.PI * index) / sparkCount,
      startTime: now,
    }))

    sparksRef.current.push(...sparks)
  }

  return (
    <div className="click-spark" onClick={handleClick}>
      <canvas ref={canvasRef} className="click-spark__canvas" />
      {children}
    </div>
  )
}

export default ClickSpark
