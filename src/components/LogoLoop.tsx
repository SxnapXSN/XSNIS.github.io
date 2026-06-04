type LogoLoopItem = {
  label: string
  accent: string
}

type LogoLoopProps = {
  items: LogoLoopItem[]
}

function LogoLoop({ items }: LogoLoopProps) {
  const doubled = [...items, ...items]

  return (
    <div className="logo-loop" aria-hidden="true">
      <div className="logo-loop__track">
        {doubled.map((item, index) => (
          <div key={`${item.label}-${index}`} className="logo-loop__item">
            <span
              className="logo-loop__dot"
              style={{ background: item.accent, color: item.accent }}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LogoLoop
