import { useEffect, useMemo, useRef } from 'react'

import type { IdentityState, TextLayer } from '../types'

type InspectorPanelProps = {
  identity: IdentityState
  layers: TextLayer[]
  selectedLayerId: string | null
  onIdentityChange: (field: keyof IdentityState, value: string) => void
  onSelectLayer: (layerId: string) => void
  onUpdateLayer: (layerId: string, patch: Partial<TextLayer>) => void
  onDeleteLayer: (layerId: string) => void
  onToggleLock: (layerId: string) => void
}

function InspectorPanel({
  identity,
  layers,
  selectedLayerId,
  onIdentityChange,
  onSelectLayer,
  onUpdateLayer,
  onDeleteLayer,
  onToggleLock,
}: InspectorPanelProps) {
  const customInputRef = useRef<HTMLTextAreaElement | null>(null)

  const selectedLayer = useMemo(
    () => layers.find((layer) => layer.id === selectedLayerId) ?? null,
    [layers, selectedLayerId],
  )

  useEffect(() => {
    if (selectedLayer?.kind === 'custom') {
      customInputRef.current?.focus()
    }
  }, [selectedLayer])

  return (
    <aside className="inspector-panel">
      <div className="inspector-panel__header">
        <p className="eyebrow">Inspector</p>
        <h1>ตั้งค่าข้อความบนบัตร</h1>
        <p className="inspector-panel__intro">
          ฝั่งนี้คุมข้อมูลหลัก, เลเยอร์ข้อความ, และสถานะ lock/unlock ให้ไม่เผลอขยับผิดตำแหน่ง
        </p>
      </div>

      <section className="panel-card">
        <div className="panel-card__head">
          <h2>ชื่อและนามสกุล</h2>
          <button
            type="button"
            className="text-link"
            onClick={() => onSelectLayer('full-name')}
          >
            เลือกบนบัตร
          </button>
        </div>

        <div className="field-grid field-grid--double">
          <label className="field">
            <span>ชื่อ</span>
            <input
              value={identity.firstName}
              onChange={(event) => onIdentityChange('firstName', event.target.value)}
              placeholder="Anurak"
            />
          </label>
          <label className="field">
            <span>นามสกุล</span>
            <input
              value={identity.lastName}
              onChange={(event) => onIdentityChange('lastName', event.target.value)}
              placeholder="Srisuk"
            />
          </label>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-card__head">
          <h2>ชื่อเล่น</h2>
          <button
            type="button"
            className="text-link"
            onClick={() => onSelectLayer('nickname')}
          >
            เลือกบนบัตร
          </button>
        </div>
        <label className="field">
          <span>Nickname</span>
          <input
            value={identity.nickname}
            onChange={(event) => onIdentityChange('nickname', event.target.value)}
            placeholder="XSN"
          />
        </label>
      </section>

      <section className="panel-card">
        <div className="panel-card__head">
          <h2>เลเยอร์ทั้งหมด</h2>
          <span className="layer-count">{layers.length} layers</span>
        </div>

        <div className="layer-list">
          {layers.map((layer) => {
            const selected = selectedLayerId === layer.id
            return (
              <button
                key={layer.id}
                type="button"
                className={[
                  'layer-row',
                  selected ? 'layer-row--selected' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onSelectLayer(layer.id)}
              >
                <div>
                  <strong>{layer.label}</strong>
                  <span>{layer.locked ? 'Locked' : 'Editable'}</span>
                </div>
                <span>{layer.kind}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="panel-card panel-card--flex">
        <div className="panel-card__head">
          <h2>Layer Inspector</h2>
          {selectedLayer ? (
            <button
              type="button"
              className="text-link"
              onClick={() => onToggleLock(selectedLayer.id)}
            >
              {selectedLayer.locked ? 'ปลดล็อค' : 'ล็อคตำแหน่ง'}
            </button>
          ) : null}
        </div>

        {selectedLayer ? (
          <>
            <div className="field-grid field-grid--double">
              <label className="field">
                <span>ตำแหน่ง X</span>
                <input
                  type="number"
                  value={Math.round(selectedLayer.x)}
                  onChange={(event) =>
                    onUpdateLayer(selectedLayer.id, {
                      x: Number(event.target.value),
                    })
                  }
                  disabled={selectedLayer.locked}
                />
              </label>
              <label className="field">
                <span>ตำแหน่ง Y</span>
                <input
                  type="number"
                  value={Math.round(selectedLayer.y)}
                  onChange={(event) =>
                    onUpdateLayer(selectedLayer.id, {
                      y: Number(event.target.value),
                    })
                  }
                  disabled={selectedLayer.locked}
                />
              </label>
            </div>

            <div className="field-grid field-grid--double">
              <label className="field">
                <span>ความกว้าง</span>
                <input
                  type="number"
                  value={Math.round(selectedLayer.width)}
                  onChange={(event) =>
                    onUpdateLayer(selectedLayer.id, {
                      width: Number(event.target.value),
                    })
                  }
                  disabled={selectedLayer.locked}
                />
              </label>
              <label className="field">
                <span>ความสูง</span>
                <input
                  type="number"
                  value={Math.round(selectedLayer.height)}
                  onChange={(event) =>
                    onUpdateLayer(selectedLayer.id, {
                      height: Number(event.target.value),
                    })
                  }
                  disabled={selectedLayer.locked}
                />
              </label>
            </div>

            <div className="field-grid field-grid--triple">
              <label className="field">
                <span>ขนาดตัวอักษร</span>
                <input
                  type="number"
                  value={selectedLayer.fontSize}
                  onChange={(event) =>
                    onUpdateLayer(selectedLayer.id, {
                      fontSize: Number(event.target.value),
                    })
                  }
                />
              </label>
              <label className="field">
                <span>หมุน</span>
                <input
                  type="number"
                  value={selectedLayer.rotate}
                  onChange={(event) =>
                    onUpdateLayer(selectedLayer.id, {
                      rotate: Number(event.target.value),
                    })
                  }
                  disabled={selectedLayer.locked}
                />
              </label>
              <label className="field">
                <span>น้ำหนัก</span>
                <input
                  type="number"
                  step="100"
                  min="400"
                  max="800"
                  value={selectedLayer.weight}
                  onChange={(event) =>
                    onUpdateLayer(selectedLayer.id, {
                      weight: Number(event.target.value),
                    })
                  }
                />
              </label>
            </div>

            <div className="field-grid field-grid--double">
              <label className="field">
                <span>สีข้อความ</span>
                <input
                  type="color"
                  value={selectedLayer.color}
                  onChange={(event) =>
                    onUpdateLayer(selectedLayer.id, {
                      color: event.target.value,
                    })
                  }
                />
              </label>
              <label className="field">
                <span>จัดวาง</span>
                <select
                  value={selectedLayer.align}
                  onChange={(event) =>
                    onUpdateLayer(selectedLayer.id, {
                      align: event.target.value as TextLayer['align'],
                    })
                  }
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </label>
            </div>

            {selectedLayer.kind === 'custom' ? (
              <label className="field">
                <span>ข้อความ</span>
                <textarea
                  ref={customInputRef}
                  value={selectedLayer.text}
                  onChange={(event) =>
                    onUpdateLayer(selectedLayer.id, {
                      text: event.target.value,
                    })
                  }
                  rows={4}
                />
              </label>
            ) : (
              <div className="panel-note">
                เลเยอร์หลักใช้ข้อมูลจากฟอร์มด้านบน แต่ยังขยับตำแหน่งและล็อคได้ตามปกติ
              </div>
            )}

            {selectedLayer.kind === 'custom' ? (
              <button
                type="button"
                className="danger-button"
                onClick={() => onDeleteLayer(selectedLayer.id)}
              >
                ลบข้อความนี้
              </button>
            ) : null}
          </>
        ) : (
          <div className="panel-note">เลือกเลเยอร์จากรายการด้านบนก่อน</div>
        )}
      </section>
    </aside>
  )
}

export default InspectorPanel
