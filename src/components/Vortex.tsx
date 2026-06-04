import { useEffect, useRef, type ReactNode } from 'react'
import { createNoise3D } from 'simplex-noise'

type VortexProps = {
  children?: ReactNode
  className?: string
  containerClassName?: string
  particleCount?: number
  rangeY?: number
  baseHue?: number
  baseSpeed?: number
  rangeSpeed?: number
  baseRadius?: number
  rangeRadius?: number
  backgroundColor?: string
  particleSaturation?: number
  particleLightness?: number
  particleAlpha?: number
  glowBoost?: number
  blendMode?: GlobalCompositeOperation
}

export default function Vortex({
  children,
  className = '',
  containerClassName = '',
  particleCount = 700,
  rangeY = 100,
  baseHue = 220,
  baseSpeed = 0,
  rangeSpeed = 1.5,
  baseRadius = 1,
  rangeRadius = 2,
  backgroundColor = '#000000',
  particleSaturation = 100,
  particleLightness = 60,
  particleAlpha = 1,
  glowBoost = 2,
  blendMode = 'lighter',
}: VortexProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    const noise3D = createNoise3D()
    let tick = 0
    const particlePropCount = 9
    const particlePropsLength = particleCount * particlePropCount
    const particleProps = new Float32Array(particlePropsLength)
    const center = { x: 0, y: 0 }
    const baseTTL = 50
    const rangeTTL = 150
    const rangeHue = 100
    const noiseSteps = 3
    const xOff = 0.00125
    const yOff = 0.00125
    const zOff = 0.0005
    const tau = Math.PI * 2

    const rand = (value: number) => value * Math.random()
    const randRange = (value: number) => value - rand(2 * value)
    const fadeInOut = (time: number, maxTime: number) => {
      const half = 0.5 * maxTime
      return Math.abs(((time + half) % maxTime) - half) / half
    }
    const lerp = (a: number, b: number, speed: number) => (1 - speed) * a + speed * b

    const initParticle = (index: number) => {
      particleProps.set(
        [
          rand(canvas.width),
          center.y + randRange(rangeY),
          0,
          0,
          0,
          baseTTL + rand(rangeTTL),
          baseSpeed + rand(rangeSpeed),
          baseRadius + rand(rangeRadius),
          baseHue + rand(rangeHue),
        ],
        index,
      )
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      center.x = 0.5 * canvas.width
      center.y = 0.5 * canvas.height

      for (let index = 0; index < particlePropsLength; index += particlePropCount) {
        initParticle(index)
      }
    }

    const draw = () => {
      tick += 1
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.fillStyle = backgroundColor
      context.fillRect(0, 0, canvas.width, canvas.height)

      for (let index = 0; index < particlePropsLength; index += particlePropCount) {
        const x = particleProps[index]
        const y = particleProps[index + 1]
        const n = noise3D(x * xOff, y * yOff, tick * zOff) * noiseSteps * tau
        const vx = lerp(particleProps[index + 2], Math.cos(n), 0.5)
        const vy = lerp(particleProps[index + 3], Math.sin(n), 0.5)
        const life = particleProps[index + 4]
        const ttl = particleProps[index + 5]
        const speed = particleProps[index + 6]
        const radius = particleProps[index + 7]
        const hue = particleProps[index + 8]
        const nextX = x + vx * speed
        const nextY = y + vy * speed

        context.save()
        context.lineCap = 'round'
        context.lineWidth = radius
        context.strokeStyle = `hsla(${hue},${particleSaturation}%,${particleLightness}%,${fadeInOut(life, ttl) * particleAlpha})`
        context.beginPath()
        context.moveTo(x, y)
        context.lineTo(nextX, nextY)
        context.stroke()
        context.restore()

        particleProps[index] = nextX
        particleProps[index + 1] = nextY
        particleProps[index + 2] = vx
        particleProps[index + 3] = vy
        particleProps[index + 4] = life + 1

        const outOfBounds =
          nextX > canvas.width ||
          nextX < 0 ||
          nextY > canvas.height ||
          nextY < 0

        if (outOfBounds || particleProps[index + 4] > ttl) {
          initParticle(index)
        }
      }

      context.save()
      context.filter = `blur(8px) brightness(${glowBoost * 100}%)`
      context.globalCompositeOperation = blendMode
      context.drawImage(canvas, 0, 0)
      context.restore()

      context.save()
      context.filter = `blur(4px) brightness(${glowBoost * 100}%)`
      context.globalCompositeOperation = blendMode
      context.drawImage(canvas, 0, 0)
      context.restore()

      context.save()
      context.globalCompositeOperation = blendMode
      context.drawImage(canvas, 0, 0)
      context.restore()

      frameRef.current = window.requestAnimationFrame(draw)
    }

    resize()
    frameRef.current = window.requestAnimationFrame(draw)
    window.addEventListener('resize', resize)

    return () => {
      window.cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [
    backgroundColor,
    baseHue,
    baseRadius,
    baseSpeed,
    blendMode,
    glowBoost,
    particleCount,
    particleAlpha,
    particleLightness,
    particleSaturation,
    rangeRadius,
    rangeSpeed,
    rangeY,
  ])

  return (
    <div className={`vortex-shell ${containerClassName}`}>
      <canvas ref={canvasRef} className="vortex-shell__canvas" />
      <div className={`vortex-shell__content ${className}`}>{children}</div>
    </div>
  )
}
