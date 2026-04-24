import type { Preset } from '../types'

export const stitch: Preset = {
  name: 'stitch',
  colors: ['#6056e0', '#8855dd', '#4090f4', '#40d9c8'],
  defaults: {
    dotSize: 1.0,
    spacing: 28,
    dotOpacity: 0.27,
    hoverRadius: 0.35,
    hoverStrength: 0.5,
    hoverMomentum: 0.96,
    voidRadius: 0.02,
    glowIntensity: 0.3,
    glowSpeed: 0.15,
  },
}
