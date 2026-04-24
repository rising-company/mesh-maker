import type { Preset, PresetName } from '../types'
import { stitch } from './stitch'
import { midnight } from './midnight'
import { neon } from './neon'
import { aurora } from './aurora'
import { ember } from './ember'
import { ocean } from './ocean'

const presets: Record<PresetName, Preset> = {
  stitch,
  midnight,
  neon,
  aurora,
  ember,
  ocean,
}

export const presetNames: PresetName[] = ['stitch', 'midnight', 'neon', 'aurora', 'ember', 'ocean']

export function getPreset(name: PresetName): Preset {
  const preset = presets[name]
  if (!preset) {
    throw new Error(`Unknown preset: "${name}". Available: ${presetNames.join(', ')}`)
  }
  return preset
}
