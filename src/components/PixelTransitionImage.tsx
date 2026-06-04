import { useMemo } from 'react'

type PixelTransitionImageProps = {
  src: string
  alt: string
}

function PixelTransitionImage({ src, alt }: PixelTransitionImageProps) {
  const cells = useMemo(
    () =>
      Array.from({ length: 81 }, (_, index) => ({
        id: index,
        delay: `${(index % 9) * 18 + Math.floor(index / 9) * 12}ms`,
      })),
    [],
  )

  return (
    <div className="pixel-transition">
      <img src={src} alt={alt} className="pixel-transition__image" />
      <div key={src} className="pixel-transition__overlay" aria-hidden="true">
        {cells.map((cell) => (
          <span
            key={cell.id}
            className="pixel-transition__cell"
            style={{ animationDelay: cell.delay }}
          />
        ))}
      </div>
    </div>
  )
}

export default PixelTransitionImage
