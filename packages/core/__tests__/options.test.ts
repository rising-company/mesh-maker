import { describe, it, expect } from 'vitest'
import { resolveOptions } from '../src/mesh-maker'

describe('resolveOptions', () => {
  it('uses stitch preset by default', () => {
    const opts = resolveOptions({})
    expect(opts.preset).toBe('stitch')
    expect(opts.colors.length).toBeGreaterThanOrEqual(2)
  })

  it('applies preset defaults', () => {
    const opts = resolveOptions({ preset: 'midnight' })
    expect(opts.glowIntensity).toBe(0.4)
    expect(opts.dotOpacity).toBe(0.2)
  })

  it('user options override preset defaults', () => {
    const opts = resolveOptions({ preset: 'midnight', glowIntensity: 0.9 })
    expect(opts.glowIntensity).toBe(0.9)
  })

  it('custom colors override preset colors', () => {
    const custom = ['#111111', '#222222']
    const opts = resolveOptions({ colors: custom })
    expect(opts.colors).toEqual(custom)
  })

  it('applies global defaults for unset options', () => {
    // Use aurora preset which has no default overrides
    const opts = resolveOptions({ preset: 'aurora' })
    expect(opts.dotSize).toBe(1.5)
    expect(opts.spacing).toBe(20)
    expect(opts.dotColor).toBe('#ffffff')
    expect(opts.dotOpacity).toBe(0.15)
    expect(opts.hover).toBe(true)
    expect(opts.hoverRadius).toBe(0.2)
    expect(opts.hoverStrength).toBe(0.5)
    expect(opts.hoverMomentum).toBe(0.12)
    expect(opts.underlay).toBe(true)
    expect(opts.glowIntensity).toBe(0.8)
    expect(opts.glowSpeed).toBe(0.25)
    expect(opts.fps).toBe(60)
    expect(opts.animate).toBe(true)
  })

  it('hover and underlay can be disabled', () => {
    const opts = resolveOptions({ hover: false, underlay: false })
    expect(opts.hover).toBe(false)
    expect(opts.underlay).toBe(false)
  })
})
