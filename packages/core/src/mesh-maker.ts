import { createWebGLContext } from './renderer/webgl-context'
import { createProgram } from './renderer/shader-compiler'
import { AnimationLoop } from './renderer/animation-loop'
import { buildVertexShader } from './shaders/vertex'
import { buildFragmentShader } from './shaders/fragment'
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

function hexToRGB(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return [r, g, b]
}

export class MeshMaker {
  private _canvas: HTMLCanvasElement
  private _gl: WebGLRenderingContext | WebGL2RenderingContext
  private _isWebGL2: boolean
  private _program: WebGLProgram
  private _loop: AnimationLoop
  private _resizeObserver: ResizeObserver | null = null
  private _options: ResolvedOptions

  private _uniforms: Record<string, WebGLUniformLocation | null> = {}
  private _positionBuffer: WebGLBuffer | null = null

  private _mouseTarget: [number, number] = [-1, -1]
  private _mouseCurrent: [number, number] = [-1, -1]
  private _onMouseMove: ((e: MouseEvent) => void) | null = null
  private _onTouchMove: ((e: TouchEvent) => void) | null = null
  private _onMouseLeave: (() => void) | null = null

  constructor(canvas: HTMLCanvasElement, options: MeshMakerOptions = {}) {
    this._canvas = canvas
    this._options = resolveOptions(options)

    const { gl, isWebGL2 } = createWebGLContext(canvas)
    this._gl = gl
    this._isWebGL2 = isWebGL2

    const vertexSource = buildVertexShader(isWebGL2)
    const fragmentSource = buildFragmentShader(isWebGL2)
    this._program = createProgram(gl, vertexSource, fragmentSource)
    gl.useProgram(this._program)

    this._setupQuad()
    this._cacheUniforms()
    this._uploadStaticUniforms()

    if (this._options.hover) {
      this._attachMouseListeners()
    }

    this._resizeObserver = new ResizeObserver(() => this._handleResize())
    this._resizeObserver.observe(canvas)
    this._handleResize()

    this._loop = new AnimationLoop(
      (time: number) => this._render(time),
      this._options.fps
    )

    if (this._options.animate) {
      this.play()
    } else {
      this._render(0)
    }
  }

  get isPlaying(): boolean { return this._loop.isPlaying }
  get currentPreset(): PresetName { return this._options.preset }

  play(): void { this._loop.play() }
  pause(): void { this._loop.pause() }

  destroy(): void {
    this._loop.stop()
    this._detachMouseListeners()
    if (this._resizeObserver) {
      this._resizeObserver.disconnect()
      this._resizeObserver = null
    }
    const gl = this._gl
    if (this._positionBuffer) {
      gl.deleteBuffer(this._positionBuffer)
      this._positionBuffer = null
    }
    gl.deleteProgram(this._program)
  }

  resize(): void { this._handleResize() }

  setPreset(name: PresetName): void {
    this._options = resolveOptions({ ...this._options, preset: name, colors: undefined })
    this._uploadStaticUniforms()
  }

  setColors(colors: string[]): void {
    this._options.colors = colors
    this._uploadColorUniforms()
  }

  setDotSize(size: number): void {
    this._options.dotSize = size
  }

  setSpacing(spacing: number): void {
    this._options.spacing = spacing
  }

  setHover(enabled: boolean): void {
    this._options.hover = enabled
    if (enabled) {
      this._attachMouseListeners()
    } else {
      this._detachMouseListeners()
      this._mouseTarget = [-1, -1]
      this._mouseCurrent = [-1, -1]
    }
  }

  setUnderlay(enabled: boolean): void {
    this._options.underlay = enabled
  }

  private _setupQuad(): void {
    const gl = this._gl
    const vertices = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1])
    this._positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
    const posAttr = gl.getAttribLocation(this._program, 'a_position')
    gl.enableVertexAttribArray(posAttr)
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0)
  }

  private _cacheUniforms(): void {
    const gl = this._gl
    const names = [
      'u_time', 'u_resolution', 'u_mouse',
      'u_dot_size', 'u_spacing', 'u_dot_color', 'u_dot_opacity',
      'u_hover', 'u_hover_radius', 'u_hover_strength',
      'u_underlay', 'u_glow_intensity', 'u_glow_speed',
      'u_glow_color_0', 'u_glow_color_1', 'u_glow_color_2', 'u_glow_color_3',
      'u_glow_color_count',
    ]
    for (const name of names) {
      this._uniforms[name] = gl.getUniformLocation(this._program, name)
    }
  }

  private _uploadStaticUniforms(): void {
    const gl = this._gl
    const u = this._uniforms
    const o = this._options
    const [dr, dg, db] = hexToRGB(o.dotColor)

    gl.uniform3f(u.u_dot_color, dr, dg, db)
    gl.uniform1f(u.u_dot_opacity, o.dotOpacity)
    gl.uniform1f(u.u_hover_radius, o.hoverRadius)
    gl.uniform1f(u.u_hover_strength, o.hoverStrength)
    gl.uniform1f(u.u_glow_intensity, o.glowIntensity)
    gl.uniform1f(u.u_glow_speed, o.glowSpeed)

    this._uploadColorUniforms()
  }

  private _uploadColorUniforms(): void {
    const gl = this._gl
    const u = this._uniforms
    const colors = this._options.colors

    const padded = [...colors]
    while (padded.length < 4) padded.push(padded[padded.length - 1])

    gl.uniform3f(u.u_glow_color_0, ...hexToRGB(padded[0]))
    gl.uniform3f(u.u_glow_color_1, ...hexToRGB(padded[1]))
    gl.uniform3f(u.u_glow_color_2, ...hexToRGB(padded[2]))
    gl.uniform3f(u.u_glow_color_3, ...hexToRGB(padded[3]))
    gl.uniform1f(u.u_glow_color_count, Math.min(colors.length, 4))
  }

  private _attachMouseListeners(): void {
    if (this._onMouseMove) return

    this._onMouseMove = (e: MouseEvent) => {
      const rect = this._canvas.getBoundingClientRect()
      this._mouseTarget = [
        (e.clientX - rect.left) / rect.width,
        (e.clientY - rect.top) / rect.height,
      ]
    }

    this._onTouchMove = (e: TouchEvent) => {
      const rect = this._canvas.getBoundingClientRect()
      const touch = e.touches[0]
      this._mouseTarget = [
        (touch.clientX - rect.left) / rect.width,
        (touch.clientY - rect.top) / rect.height,
      ]
    }

    this._onMouseLeave = () => {
      this._mouseTarget = [-1, -1]
    }

    this._canvas.addEventListener('mousemove', this._onMouseMove)
    this._canvas.addEventListener('touchmove', this._onTouchMove)
    this._canvas.addEventListener('mouseleave', this._onMouseLeave)
  }

  private _detachMouseListeners(): void {
    if (this._onMouseMove) {
      this._canvas.removeEventListener('mousemove', this._onMouseMove)
      this._onMouseMove = null
    }
    if (this._onTouchMove) {
      this._canvas.removeEventListener('touchmove', this._onTouchMove)
      this._onTouchMove = null
    }
    if (this._onMouseLeave) {
      this._canvas.removeEventListener('mouseleave', this._onMouseLeave)
      this._onMouseLeave = null
    }
  }

  private _handleResize(): void {
    const dpr = this._options.pixelRatio
    const displayWidth = Math.round(this._canvas.clientWidth * dpr)
    const displayHeight = Math.round(this._canvas.clientHeight * dpr)
    if (this._canvas.width !== displayWidth || this._canvas.height !== displayHeight) {
      this._canvas.width = displayWidth
      this._canvas.height = displayHeight
      this._gl.viewport(0, 0, displayWidth, displayHeight)
    }
  }

  private _render(time: number): void {
    const gl = this._gl
    const u = this._uniforms
    const o = this._options

    // Smooth mouse position
    const momentum = 1.0 - o.hoverMomentum
    if (this._mouseTarget[0] >= 0) {
      this._mouseCurrent[0] += (this._mouseTarget[0] - this._mouseCurrent[0]) * momentum
      this._mouseCurrent[1] += (this._mouseTarget[1] - this._mouseCurrent[1]) * momentum
    } else if (this._mouseCurrent[0] >= 0) {
      this._mouseCurrent[0] += (-1 - this._mouseCurrent[0]) * 0.05
      this._mouseCurrent[1] += (-1 - this._mouseCurrent[1]) * 0.05
      if (this._mouseCurrent[0] < -0.5) {
        this._mouseCurrent = [-1, -1]
      }
    }

    gl.uniform1f(u.u_time, time)
    gl.uniform2f(u.u_resolution, this._canvas.width, this._canvas.height)
    gl.uniform2f(u.u_mouse, this._mouseCurrent[0], this._mouseCurrent[1])
    gl.uniform1f(u.u_dot_size, o.dotSize)
    gl.uniform1f(u.u_spacing, o.spacing)
    gl.uniform1f(u.u_hover, o.hover ? 1.0 : 0.0)
    gl.uniform1f(u.u_underlay, o.underlay ? 1.0 : 0.0)

    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }
}
