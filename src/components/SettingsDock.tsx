import ClickSpark from './ClickSpark'

type SettingsDockProps = {
  open: boolean
  onToggle: () => void
  onAddText: () => void
}

function SettingsDock({ open, onToggle, onAddText }: SettingsDockProps) {
  return (
    <div className={`settings-dock ${open ? 'settings-dock--open' : ''}`}>
      <div className="settings-dock__panel" aria-hidden={!open}>
        <p className="eyebrow">Quick Tools</p>
        <button type="button" className="dock-action" onClick={onAddText}>
          + ข้อความ
        </button>
        <p className="settings-dock__caption">
          เพิ่มเลเยอร์ใหม่ แล้วไปแก้ข้อความ, ลาก, ขยาย หรือสั่งล็อคจากฝั่งขวาได้ทันที
        </p>
      </div>

      <ClickSpark sparkColor="#ff7bc8" sparkRadius={22} sparkSize={14}>
        <button type="button" className="settings-dock__toggle" onClick={onToggle}>
          {open ? 'ปิดตั้งค่า' : 'ตั้งค่า'}
        </button>
      </ClickSpark>
    </div>
  )
}

export default SettingsDock
