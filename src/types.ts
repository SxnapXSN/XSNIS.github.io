export type LayerKind = 'fullName' | 'nickname' | 'custom'

export type CardPosition = {
  x: number
  y: number
}

export type IdentityState = {
  firstName: string
  lastName: string
  nickname: string
}

export type TextLayer = {
  id: string
  kind: LayerKind
  label: string
  text: string
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  rotate: number
  color: string
  weight: number
  align: 'left' | 'center' | 'right'
  locked: boolean
}
