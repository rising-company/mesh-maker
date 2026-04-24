import { useEffect, useRef, type CSSProperties } from 'react'
import {
  MeshMaker as MeshMakerCore,
  type MeshMakerOptions,
  type PresetName,
} from '@rising-company/mesh-maker-core'

export interface MeshMakerProps extends MeshMakerOptions {
  className?: string
  style?: CSSProperties
  id?: string
}

const wrapperStyle: CSSProperties = { position: 'relative', overflow: 'hidden' }
const canvasStyle: CSSProperties = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }

export function MeshMaker({
  preset = 'stitch', colors, dotSize = 1.5, spacing = 24,
  dotColor = '#ffffff', dotOpacity = 0.3, hover = true,
  hoverRadius = 0.15, hoverStrength = 0.5, hoverMomentum = 0.1,
  underlay = true, glowIntensity = 0.6, glowSpeed = 0.3,
  fps = 60, pixelRatio, animate = true,
  className, style, id,
}: MeshMakerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const instanceRef = useRef<MeshMakerCore | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const instance = new MeshMakerCore(canvas, {
      preset: preset as PresetName, colors, dotSize, spacing, dotColor, dotOpacity,
      hover, hoverRadius, hoverStrength, hoverMomentum,
      underlay, glowIntensity, glowSpeed, fps, pixelRatio, animate,
    })
    instanceRef.current = instance
    return () => { instance.destroy(); instanceRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { if (instanceRef.current && preset) instanceRef.current.setPreset(preset as PresetName) }, [preset])
  useEffect(() => { if (instanceRef.current && colors) instanceRef.current.setColors(colors) }, [colors])
  useEffect(() => { if (instanceRef.current) instanceRef.current.setDotSize(dotSize) }, [dotSize])
  useEffect(() => { if (instanceRef.current) instanceRef.current.setSpacing(spacing) }, [spacing])
  useEffect(() => { if (instanceRef.current) instanceRef.current.setHover(hover) }, [hover])
  useEffect(() => { if (instanceRef.current) instanceRef.current.setUnderlay(underlay) }, [underlay])

  return (
    <div className={className} style={{ ...wrapperStyle, ...style }} id={id}>
      <canvas ref={canvasRef} style={canvasStyle} />
    </div>
  )
}
