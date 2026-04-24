import type { MeshMakerOptions, PresetName, Preset } from './types'
import { DEFAULT_OPTIONS } from './types'
import { getPreset } from './presets'

/** Fully resolved options with no optional fields */
export interface ResolvedOptions {
  preset: PresetName
  colors: string[]
  dotSize: number
  spacing: number
  dotColor: string
  dotOpacity: number
  hover: boolean
  hoverRadius: number
  hoverStrength: number
  hoverMomentum: number
  underlay: boolean
  glowIntensity: number
  glowSpeed: number
  fps: number
  pixelRatio: number
  animate: boolean
}

/**
 * Resolves user-provided options against preset defaults and global defaults.
 * Pure function — no WebGL or DOM access needed.
 */
export function resolveOptions(opts: MeshMakerOptions): ResolvedOptions {
  const presetName: PresetName = opts.preset ?? 'stitch'
  const preset: Preset = getPreset(presetName)
  const pd = preset.defaults ?? {}

  return {
    preset: presetName,
    colors: opts.colors ?? preset.colors,
    dotSize: opts.dotSize ?? pd.dotSize ?? DEFAULT_OPTIONS.dotSize,
    spacing: opts.spacing ?? pd.spacing ?? DEFAULT_OPTIONS.spacing,
    dotColor: opts.dotColor ?? pd.dotColor ?? DEFAULT_OPTIONS.dotColor,
    dotOpacity: opts.dotOpacity ?? pd.dotOpacity ?? DEFAULT_OPTIONS.dotOpacity,
    hover: opts.hover ?? pd.hover ?? DEFAULT_OPTIONS.hover,
    hoverRadius: opts.hoverRadius ?? pd.hoverRadius ?? DEFAULT_OPTIONS.hoverRadius,
    hoverStrength: opts.hoverStrength ?? pd.hoverStrength ?? DEFAULT_OPTIONS.hoverStrength,
    hoverMomentum: opts.hoverMomentum ?? pd.hoverMomentum ?? DEFAULT_OPTIONS.hoverMomentum,
    underlay: opts.underlay ?? pd.underlay ?? DEFAULT_OPTIONS.underlay,
    glowIntensity: opts.glowIntensity ?? pd.glowIntensity ?? DEFAULT_OPTIONS.glowIntensity,
    glowSpeed: opts.glowSpeed ?? pd.glowSpeed ?? DEFAULT_OPTIONS.glowSpeed,
    fps: opts.fps ?? pd.fps ?? DEFAULT_OPTIONS.fps,
    pixelRatio: opts.pixelRatio ?? pd.pixelRatio ?? DEFAULT_OPTIONS.pixelRatio,
    animate: opts.animate ?? pd.animate ?? DEFAULT_OPTIONS.animate,
  }
}
