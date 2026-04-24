export type PresetName = 'stitch' | 'midnight' | 'neon' | 'aurora' | 'ember' | 'ocean'

export interface MeshMakerOptions {
  preset?: PresetName
  dotSize?: number
  spacing?: number
  dotColor?: string
  dotOpacity?: number
  hover?: boolean
  hoverRadius?: number
  hoverStrength?: number
  hoverMomentum?: number
  underlay?: boolean
  colors?: string[]
  glowIntensity?: number
  glowSpeed?: number
  fps?: number
  pixelRatio?: number
  animate?: boolean
}

export interface Preset {
  name: string
  colors: string[]
  defaults?: Partial<Omit<MeshMakerOptions, 'preset' | 'colors'>>
}

export const DEFAULT_OPTIONS: Required<Omit<MeshMakerOptions, 'preset' | 'colors'>> = {
  dotSize: 1.2,
  spacing: 28,
  dotColor: '#ffffff',
  dotOpacity: 0.25,
  hover: true,
  hoverRadius: 0.15,
  hoverStrength: 0.5,
  hoverMomentum: 0.92,
  underlay: true,
  glowIntensity: 0.8,
  glowSpeed: 0.25,
  fps: 60,
  pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
  animate: true,
}
