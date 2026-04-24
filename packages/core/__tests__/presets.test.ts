import { describe, it, expect } from 'vitest'
import { getPreset, presetNames } from '../src/presets'

describe('presets', () => {
  it('exports all 6 preset names', () => {
    expect(presetNames).toEqual(['stitch', 'midnight', 'neon', 'aurora', 'ember', 'ocean'])
  })

  it('getPreset returns a preset by name', () => {
    const stitch = getPreset('stitch')
    expect(stitch.name).toBe('stitch')
    expect(stitch.colors.length).toBeGreaterThanOrEqual(2)
    expect(stitch.colors.length).toBeLessThanOrEqual(6)
  })

  it('every preset has 2-6 hex color strings', () => {
    for (const name of presetNames) {
      const preset = getPreset(name)
      expect(preset.colors.length).toBeGreaterThanOrEqual(2)
      expect(preset.colors.length).toBeLessThanOrEqual(6)
      for (const color of preset.colors) {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
      }
    }
  })

  it('getPreset throws for unknown preset', () => {
    expect(() => getPreset('nonexistent' as any)).toThrow()
  })
})
