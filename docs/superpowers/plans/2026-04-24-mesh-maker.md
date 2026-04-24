# mesh-maker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a WebGL dot mesh grid library with noise-warp mouse distortion and optional animated gradient underlay, as a sibling to wave-maker.

**Architecture:** Single-pass procedural WebGL fragment shader rendering a dot grid, BCC noise UV distortion near mouse, and animated simplex noise gradient underlay. Monorepo with core + React/Vue/Svelte wrappers + interactive demo playground.

**Tech Stack:** TypeScript, WebGL 2 (WebGL 1 fallback), GLSL, tsup, vitest, pnpm workspaces, Vite (demo)

**Reference:** Sibling project at `../wave-maker/` — follow its patterns for monorepo structure, build config, and framework wrappers.

---

## File Structure

```
mesh-maker/
  package.json                          # root workspace scripts
  pnpm-workspace.yaml                   # workspace config
  tsconfig.json                         # shared TS config
  packages/
    core/
      package.json                      # @rising-company/mesh-maker-core
      tsconfig.json
      tsup.config.ts
      src/
        index.ts                        # public exports
        types.ts                        # MeshMakerOptions, Preset, defaults
        mesh-maker.ts                   # main MeshMaker class
        presets/
          index.ts                      # getPreset, presetNames
          stitch.ts                     # purple/indigo/teal/cyan
          midnight.ts                   # deep blue/navy/silver
          neon.ts                       # hot pink/electric blue/lime
          aurora.ts                     # green/cyan/magenta
          ember.ts                      # red/orange/gold
          ocean.ts                      # deep blue/teal/seafoam
        renderer/
          webgl-context.ts              # WebGL 2/1 context creation
          animation-loop.ts             # rAF with FPS cap
          shader-compiler.ts            # GLSL compile + link
        shaders/
          vertex.ts                     # fullscreen quad vertex shader
          fragment.ts                   # dot grid + noise warp + glow
          noise.ts                      # BCC noise + simplex noise GLSL
      __tests__/
        options.test.ts
        presets.test.ts
    react/
      package.json                      # @rising-company/mesh-maker-react
      tsup.config.ts
      src/
        index.ts
        MeshMaker.tsx
    vue/
      package.json                      # @rising-company/mesh-maker-vue
      tsup.config.ts
      src/
        index.ts
        MeshMaker.ts
    svelte/
      package.json                      # @rising-company/mesh-maker-svelte
      tsup.config.ts
      src/
        index.ts
        MeshMaker.svelte
  demo/
    package.json
    index.html
    vite.config.ts
    src/
      main.ts
      style.css
      sections/
        hero.ts
        showcase.ts
        playground.ts
```

---

### Task 1: Monorepo Scaffolding

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.json`
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/tsup.config.ts`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "mesh-maker-monorepo",
  "private": true,
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "dev": "pnpm --filter demo dev"
  },
  "devDependencies": {
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - "packages/*"
  - "demo"
```

- [ ] **Step 3: Create root tsconfig.json**

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  }
}
```

- [ ] **Step 4: Create core package.json**

```json
{
  "name": "@rising-company/mesh-maker-core",
  "version": "0.1.0",
  "description": "Interactive WebGL dot mesh grid with mouse distortion",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "keywords": ["webgl", "mesh", "dots", "grid", "animation", "shader", "interactive"],
  "license": "MIT",
  "devDependencies": {
    "jsdom": "^29.0.2",
    "tsup": "^8.0.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 5: Create core tsconfig.json**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

- [ ] **Step 6: Create core tsup.config.ts**

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
})
```

- [ ] **Step 7: Install dependencies**

Run: `pnpm install`
Expected: Lockfile created, node_modules populated.

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-workspace.yaml tsconfig.json packages/core/package.json packages/core/tsconfig.json packages/core/tsup.config.ts pnpm-lock.yaml
git commit -m "scaffold: monorepo with core package structure"
```

---

### Task 2: Types and Presets

**Files:**
- Create: `packages/core/src/types.ts`
- Create: `packages/core/src/presets/stitch.ts`
- Create: `packages/core/src/presets/midnight.ts`
- Create: `packages/core/src/presets/neon.ts`
- Create: `packages/core/src/presets/aurora.ts`
- Create: `packages/core/src/presets/ember.ts`
- Create: `packages/core/src/presets/ocean.ts`
- Create: `packages/core/src/presets/index.ts`
- Test: `packages/core/__tests__/presets.test.ts`

- [ ] **Step 1: Write presets test**

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/core && npx vitest run __tests__/presets.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Create types.ts**

```typescript
export type PresetName = 'stitch' | 'midnight' | 'neon' | 'aurora' | 'ember' | 'ocean'

export interface MeshMakerOptions {
  /** Named color preset. Default: 'stitch' */
  preset?: PresetName
  /** Dot radius in pixels. Default: 1.5 */
  dotSize?: number
  /** Grid spacing in pixels. Default: 24 */
  spacing?: number
  /** Dot color (hex). Default: '#ffffff' */
  dotColor?: string
  /** Base dot opacity (0-1). Default: 0.3 */
  dotOpacity?: number
  /** Enable mouse hover distortion. Default: true */
  hover?: boolean
  /** Distortion radius (0-1, fraction of canvas). Default: 0.15 */
  hoverRadius?: number
  /** Warp intensity (0-1). Default: 0.5 */
  hoverStrength?: number
  /** Mouse smoothing (0=instant, 1=very laggy). Default: 0.1 */
  hoverMomentum?: number
  /** Enable animated glow underlay. Default: true */
  underlay?: boolean
  /** Override preset colors for the glow (2-6 hex values). */
  colors?: string[]
  /** Glow brightness (0-1). Default: 0.6 */
  glowIntensity?: number
  /** Glow animation speed multiplier. Default: 0.3 */
  glowSpeed?: number
  /** Target frame rate cap. Default: 60 */
  fps?: number
  /** Device pixel ratio. Default: window.devicePixelRatio */
  pixelRatio?: number
  /** Auto-start animation on creation. Default: true */
  animate?: boolean
}

export interface Preset {
  name: string
  /** 2-6 hex color strings for the glow underlay */
  colors: string[]
  /** Default option overrides for this preset */
  defaults?: Partial<Omit<MeshMakerOptions, 'preset' | 'colors'>>
}

export const DEFAULT_OPTIONS: Required<Omit<MeshMakerOptions, 'preset' | 'colors'>> = {
  dotSize: 1.5,
  spacing: 24,
  dotColor: '#ffffff',
  dotOpacity: 0.3,
  hover: true,
  hoverRadius: 0.15,
  hoverStrength: 0.5,
  hoverMomentum: 0.1,
  underlay: true,
  glowIntensity: 0.6,
  glowSpeed: 0.3,
  fps: 60,
  pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
  animate: true,
}
```

- [ ] **Step 4: Create preset files**

`packages/core/src/presets/stitch.ts`:
```typescript
import type { Preset } from '../types'

export const stitch: Preset = {
  name: 'stitch',
  colors: ['#6040f0', '#5856d6', '#40c8c4', '#42d9c8'],
}
```

`packages/core/src/presets/midnight.ts`:
```typescript
import type { Preset } from '../types'

export const midnight: Preset = {
  name: 'midnight',
  colors: ['#1a1a4e', '#2d2d7f', '#4a4a8a', '#8888b0'],
  defaults: { glowIntensity: 0.4, dotOpacity: 0.2 },
}
```

`packages/core/src/presets/neon.ts`:
```typescript
import type { Preset } from '../types'

export const neon: Preset = {
  name: 'neon',
  colors: ['#ff1493', '#00bfff', '#39ff14', '#ff6ec7'],
  defaults: { glowIntensity: 0.8, dotOpacity: 0.4 },
}
```

`packages/core/src/presets/aurora.ts`:
```typescript
import type { Preset } from '../types'

export const aurora: Preset = {
  name: 'aurora',
  colors: ['#00ff87', '#00d4ff', '#b400ff', '#60efff'],
}
```

`packages/core/src/presets/ember.ts`:
```typescript
import type { Preset } from '../types'

export const ember: Preset = {
  name: 'ember',
  colors: ['#ff4500', '#ff8c00', '#ffd700', '#cc3300'],
  defaults: { glowIntensity: 0.7 },
}
```

`packages/core/src/presets/ocean.ts`:
```typescript
import type { Preset } from '../types'

export const ocean: Preset = {
  name: 'ocean',
  colors: ['#003366', '#006994', '#00a4a6', '#66cccc'],
  defaults: { glowIntensity: 0.5 },
}
```

`packages/core/src/presets/index.ts`:
```typescript
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd packages/core && npx vitest run __tests__/presets.test.ts`
Expected: PASS — all 4 tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/types.ts packages/core/src/presets/ packages/core/__tests__/presets.test.ts
git commit -m "feat: types, presets, and preset tests"
```

---

### Task 3: Option Resolution

**Files:**
- Create: `packages/core/src/mesh-maker.ts` (just `resolveOptions` and `ResolvedOptions` for now)
- Create: `packages/core/src/index.ts` (partial, enough for test imports)
- Test: `packages/core/__tests__/options.test.ts`

- [ ] **Step 1: Write options test**

```typescript
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
    const opts = resolveOptions({})
    expect(opts.dotSize).toBe(1.5)
    expect(opts.spacing).toBe(24)
    expect(opts.dotColor).toBe('#ffffff')
    expect(opts.dotOpacity).toBe(0.3)
    expect(opts.hover).toBe(true)
    expect(opts.hoverRadius).toBe(0.15)
    expect(opts.hoverStrength).toBe(0.5)
    expect(opts.hoverMomentum).toBe(0.1)
    expect(opts.underlay).toBe(true)
    expect(opts.glowIntensity).toBe(0.6)
    expect(opts.glowSpeed).toBe(0.3)
    expect(opts.fps).toBe(60)
    expect(opts.animate).toBe(true)
  })

  it('hover and underlay can be disabled', () => {
    const opts = resolveOptions({ hover: false, underlay: false })
    expect(opts.hover).toBe(false)
    expect(opts.underlay).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/core && npx vitest run __tests__/options.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Create mesh-maker.ts with resolveOptions**

```typescript
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
```

- [ ] **Step 4: Create index.ts (minimal for now)**

```typescript
export { resolveOptions } from './mesh-maker'
export type { ResolvedOptions } from './mesh-maker'
export type { MeshMakerOptions, Preset, PresetName } from './types'
export { getPreset, presetNames } from './presets'
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd packages/core && npx vitest run __tests__/options.test.ts`
Expected: PASS — all 6 tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/mesh-maker.ts packages/core/src/index.ts packages/core/__tests__/options.test.ts
git commit -m "feat: option resolution with preset layering"
```

---

### Task 4: Renderer Internals

**Files:**
- Create: `packages/core/src/renderer/webgl-context.ts`
- Create: `packages/core/src/renderer/animation-loop.ts`
- Create: `packages/core/src/renderer/shader-compiler.ts`

These are adapted directly from wave-maker with minimal changes.

- [ ] **Step 1: Create webgl-context.ts**

```typescript
/**
 * Creates a WebGL rendering context from a canvas element.
 * Tries WebGL 2 first, falls back to WebGL 1.
 */
export function createWebGLContext(canvas: HTMLCanvasElement): {
  gl: WebGLRenderingContext | WebGL2RenderingContext
  isWebGL2: boolean
} {
  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null
  let isWebGL2 = false

  gl = canvas.getContext('webgl2') as WebGL2RenderingContext | null
  if (gl) {
    isWebGL2 = true
    return { gl, isWebGL2 }
  }

  gl = (canvas.getContext('webgl') ||
    canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null

  if (!gl) {
    throw new Error(
      'WebGL is not supported in this browser. MeshMaker requires WebGL to render.'
    )
  }

  return { gl, isWebGL2 }
}
```

- [ ] **Step 2: Create animation-loop.ts**

```typescript
/**
 * Manages a requestAnimationFrame loop with FPS throttling.
 */
export class AnimationLoop {
  private _onFrame: (time: number) => void
  private _fps: number
  private _interval: number
  private _rafId: number | null = null
  private _lastFrameTime = 0
  private _startTime = 0
  private _playing = false

  constructor(onFrame: (time: number) => void, fps: number) {
    this._onFrame = onFrame
    this._fps = fps
    this._interval = 1000 / fps
  }

  get isPlaying(): boolean {
    return this._playing
  }

  setFps(fps: number): void {
    this._fps = fps
    this._interval = 1000 / fps
  }

  play(): void {
    if (this._playing) return
    this._playing = true
    this._lastFrameTime = performance.now()
    if (this._startTime === 0) {
      this._startTime = this._lastFrameTime
    }
    this._tick()
  }

  pause(): void {
    this._playing = false
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId)
      this._rafId = null
    }
  }

  stop(): void {
    this.pause()
    this._startTime = 0
  }

  private _tick = (): void => {
    if (!this._playing) return
    this._rafId = requestAnimationFrame(this._loop)
  }

  private _loop = (now: number): void => {
    if (!this._playing) return

    const elapsed = now - this._lastFrameTime
    if (elapsed >= this._interval) {
      this._lastFrameTime = now - (elapsed % this._interval)
      const timeInSeconds = (now - this._startTime) / 1000
      this._onFrame(timeInSeconds)
    }

    this._tick()
  }
}
```

- [ ] **Step 3: Create shader-compiler.ts**

```typescript
export function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) {
    throw new Error('Failed to create shader object')
  }

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`Shader compilation failed:\n${info}`)
  }

  return shader
}

export function createProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string
): WebGLProgram {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)

  const program = gl.createProgram()
  if (!program) {
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)
    throw new Error('Failed to create program object')
  }

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program)
    gl.deleteProgram(program)
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)
    throw new Error(`Program linking failed:\n${info}`)
  }

  gl.detachShader(program, vertexShader)
  gl.detachShader(program, fragmentShader)
  gl.deleteShader(vertexShader)
  gl.deleteShader(fragmentShader)

  return program
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/core/src/renderer/
git commit -m "feat: renderer internals (webgl context, animation loop, shader compiler)"
```

---

### Task 5: GLSL Shaders

**Files:**
- Create: `packages/core/src/shaders/vertex.ts`
- Create: `packages/core/src/shaders/noise.ts`
- Create: `packages/core/src/shaders/fragment.ts`

- [ ] **Step 1: Create vertex.ts**

```typescript
export function buildVertexShader(isWebGL2: boolean): string {
  if (isWebGL2) {
    return /* glsl */ `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`
  }
  return /* glsl */ `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`
}
```

- [ ] **Step 2: Create noise.ts**

This contains two noise functions: BCC noise for the mouse warp (with derivatives for smooth distortion) and simplex noise for the animated glow.

```typescript
export const noiseGLSL = /* glsl */ `
  //
  // 3D Simplex noise — Ashima Arts / stegu (MIT)
  //
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  //
  // BCC noise with derivatives — for UV warping
  // Adapted from OpenSimplex2 by KdotJPG
  //
  vec4 bcc_permute(vec4 t) { return t * (t * 34.0 + 133.0); }

  vec3 bcc_grad(float hash) {
    vec3 cube = mod(floor(hash / vec3(1.0, 2.0, 4.0)), 2.0) * 2.0 - 1.0;
    vec3 cuboct = cube;
    cuboct.x *= 1.0 - step(0.0, floor(hash / 16.0));
    cuboct.y *= 1.0 - step(0.0, floor(hash / 16.0) - 1.0);
    cuboct.z *= 1.0 - (1.0 - step(0.0, floor(hash / 16.0)) - step(0.0, floor(hash / 16.0) - 1.0));
    float type = mod(floor(hash / 8.0), 2.0);
    vec3 rhomb = (1.0 - type) * cube + type * (cuboct + cross(cube, cuboct));
    return (cuboct * 1.22474487139 + rhomb) * (1.0 - 0.042942436724648037 * type) * 3.5946317686139184;
  }

  vec4 bcc_noise_part(vec3 X) {
    vec3 b = floor(X);
    vec4 i4 = vec4(X - b, 2.5);
    vec3 v1 = b + floor(dot(i4, vec4(.25)));
    vec3 v2 = b + vec3(1,0,0) + vec3(-1,1,1) * floor(dot(i4, vec4(-.25,.25,.25,.35)));
    vec3 v3 = b + vec3(0,1,0) + vec3(1,-1,1) * floor(dot(i4, vec4(.25,-.25,.25,.35)));
    vec3 v4 = b + vec3(0,0,1) + vec3(1,1,-1) * floor(dot(i4, vec4(.25,.25,-.25,.35)));
    vec4 hashes = bcc_permute(mod(vec4(v1.x, v2.x, v3.x, v4.x), 289.0));
    hashes = bcc_permute(mod(hashes + vec4(v1.y, v2.y, v3.y, v4.y), 289.0));
    hashes = mod(bcc_permute(mod(hashes + vec4(v1.z, v2.z, v3.z, v4.z), 289.0)), 48.0);
    vec3 d1 = X - v1; vec3 d2 = X - v2; vec3 d3 = X - v3; vec3 d4 = X - v4;
    vec4 a = max(0.75 - vec4(dot(d1,d1), dot(d2,d2), dot(d3,d3), dot(d4,d4)), 0.0);
    vec4 aa = a * a; vec4 aaaa = aa * aa;
    vec3 g1 = bcc_grad(hashes.x); vec3 g2 = bcc_grad(hashes.y);
    vec3 g3 = bcc_grad(hashes.z); vec3 g4 = bcc_grad(hashes.w);
    vec4 extrapolations = vec4(dot(d1,g1), dot(d2,g2), dot(d3,g3), dot(d4,g4));
    vec3 derivative = -8.0 * mat4x3(d1,d2,d3,d4) * (aa * a * extrapolations)
      + mat4x3(g1,g2,g3,g4) * aaaa;
    return vec4(derivative, dot(aaaa, extrapolations));
  }

  vec4 bcc_noise(vec3 X) {
    mat3 orthonormalMap = mat3(
      0.788675134594813, -0.211324865405187, -0.577350269189626,
      -0.211324865405187, 0.788675134594813, -0.577350269189626,
      0.577350269189626, 0.577350269189626, 0.577350269189626);
    X = orthonormalMap * X;
    vec4 result = bcc_noise_part(X) + bcc_noise_part(X + 144.5);
    return vec4(result.xyz * orthonormalMap, result.w);
  }
`
```

- [ ] **Step 3: Create fragment.ts**

This is the main shader doing all four stages: glow, noise warp, dot grid, composite.

```typescript
import { noiseGLSL } from './noise'

export function buildFragmentShader(isWebGL2: boolean): string {
  const prefix = isWebGL2
    ? `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
`
    : `
precision highp float;
varying vec2 v_uv;
`

  const fragOut = isWebGL2 ? 'fragColor' : 'gl_FragColor'

  return `${prefix}

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

// Dot grid
uniform float u_dot_size;
uniform float u_spacing;
uniform vec3 u_dot_color;
uniform float u_dot_opacity;

// Hover
uniform float u_hover;
uniform float u_hover_radius;
uniform float u_hover_strength;

// Underlay
uniform float u_underlay;
uniform float u_glow_intensity;
uniform float u_glow_speed;
uniform vec3 u_glow_color_0;
uniform vec3 u_glow_color_1;
uniform vec3 u_glow_color_2;
uniform vec3 u_glow_color_3;
uniform float u_glow_color_count;

${noiseGLSL}

// --- Stage 1: Animated glow underlay ---
vec3 computeGlow(vec2 uv) {
  float t = u_time * u_glow_speed;
  float n1 = snoise(vec3(uv * 1.5, t * 0.5)) * 0.5 + 0.5;
  float n2 = snoise(vec3(uv * 2.5 + 10.0, t * 0.3)) * 0.5 + 0.5;
  float n3 = snoise(vec3(uv * 0.8 + 20.0, t * 0.7)) * 0.5 + 0.5;

  // Blend between glow colors using noise
  vec3 color = u_glow_color_0;
  float count = u_glow_color_count;
  if (count > 1.0) color = mix(color, u_glow_color_1, smoothstep(0.2, 0.8, n1));
  if (count > 2.0) color = mix(color, u_glow_color_2, smoothstep(0.3, 0.7, n2) * 0.6);
  if (count > 3.0) color = mix(color, u_glow_color_3, smoothstep(0.4, 0.9, n3) * 0.4);

  // Position-based fade: glow concentrated toward bottom-left
  float positionFade = smoothstep(1.4, 0.0, length(uv - vec2(0.2, 1.2)));
  return color * u_glow_intensity * positionFade;
}

// --- Stage 2: Noise warp UV distortion ---
vec2 warpUV(vec2 uv) {
  float aspectRatio = u_resolution.x / u_resolution.y;
  vec2 aspect = vec2(aspectRatio, 1.0);
  vec2 mouse = u_mouse;

  float dist = distance(uv * aspect, mouse * aspect);
  float radius = u_hover_radius;
  float influence = smoothstep(radius, 0.0, dist);

  if (influence <= 0.001) return uv;

  // BCC noise-based warp
  vec2 st = (uv - mouse) * aspect * 12.0 * 0.46;
  vec4 noise = bcc_noise(vec3(st * 0.7, u_time * 0.02));
  vec2 offset = noise.xy / 7.0 + 0.5;

  return mix(uv, offset, influence * u_hover_strength);
}

// --- Stage 3: Dot grid ---
float dotGrid(vec2 uv) {
  // Convert to pixel-space grid
  vec2 cellSize = vec2(u_spacing) / u_resolution;
  vec2 cell = fract(uv / cellSize);
  vec2 center = cell - 0.5;

  // Circle SDF
  float dotRadius = u_dot_size / u_spacing;
  float d = length(center) - dotRadius;

  // Anti-aliased edge (1 pixel smoothing)
  float pixelSize = 1.0 / min(u_resolution.x, u_resolution.y) / cellSize.x;
  return 1.0 - smoothstep(-pixelSize, pixelSize, d);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y; // flip Y so (0,0) is top-left

  // Stage 1: Glow underlay
  vec3 glow = u_underlay * computeGlow(uv);

  // Stage 2: Warp UV for dot grid (only when hover is on and mouse is on-screen)
  vec2 dotUV = uv;
  if (u_hover > 0.5 && u_mouse.x >= 0.0) {
    dotUV = warpUV(uv);
  }

  // Stage 3: Dot grid
  float dot = dotGrid(dotUV);

  // Stage 4: Composite
  vec3 dotCol = u_dot_color * u_dot_opacity * dot;
  vec3 finalColor = glow + dotCol;

  ${fragOut} = vec4(finalColor, 1.0);
}
`
}
```

- [ ] **Step 4: Update vertex.ts to pass UV**

The fragment shader needs `v_uv`. Update the vertex shader:

```typescript
export function buildVertexShader(isWebGL2: boolean): string {
  if (isWebGL2) {
    return /* glsl */ `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`
  }
  return /* glsl */ `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`
}
```

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/shaders/
git commit -m "feat: GLSL shaders (dot grid, BCC noise warp, simplex glow)"
```

---

### Task 6: MeshMaker Class

**Files:**
- Modify: `packages/core/src/mesh-maker.ts` (add the full MeshMaker class)
- Modify: `packages/core/src/index.ts` (add MeshMaker export)

- [ ] **Step 1: Implement MeshMaker class**

Add the following class to `packages/core/src/mesh-maker.ts` after the existing `resolveOptions` function:

```typescript
import { createWebGLContext } from './renderer/webgl-context'
import { createProgram } from './renderer/shader-compiler'
import { AnimationLoop } from './renderer/animation-loop'
import { buildVertexShader } from './shaders/vertex'
import { buildFragmentShader } from './shaders/fragment'

// (keep existing resolveOptions and ResolvedOptions above)

/**
 * Parses a hex color string to [r, g, b] in 0-1 range.
 */
function hexToRGB(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return [r, g, b]
}

/**
 * MeshMaker — interactive WebGL dot mesh grid renderer.
 */
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

  // Smoothed mouse position (0-1 UV space), -1 = off-screen
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

  /** Upload uniforms that only change when options change */
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
      // Mouse left — ease current toward off-screen
      this._mouseCurrent[0] += (-1 - this._mouseCurrent[0]) * 0.05
      this._mouseCurrent[1] += (-1 - this._mouseCurrent[1]) * 0.05
      if (this._mouseCurrent[0] < -0.5) {
        this._mouseCurrent = [-1, -1]
      }
    }

    // Per-frame uniforms
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
```

- [ ] **Step 2: Update index.ts exports**

```typescript
export { MeshMaker, resolveOptions } from './mesh-maker'
export type { ResolvedOptions } from './mesh-maker'
export type { MeshMakerOptions, Preset, PresetName } from './types'
export { getPreset, presetNames } from './presets'
```

- [ ] **Step 3: Build to verify compilation**

Run: `cd packages/core && npx tsup`
Expected: Build succeeds, `dist/` contains `index.js`, `index.cjs`, `index.d.ts`.

- [ ] **Step 4: Run all tests**

Run: `cd packages/core && npx vitest run`
Expected: All tests pass (presets + options).

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/
git commit -m "feat: MeshMaker class with mouse tracking and WebGL rendering"
```

---

### Task 7: Framework Wrappers

**Files:**
- Create: `packages/react/package.json`, `packages/react/tsup.config.ts`, `packages/react/src/index.ts`, `packages/react/src/MeshMaker.tsx`
- Create: `packages/vue/package.json`, `packages/vue/tsup.config.ts`, `packages/vue/src/index.ts`, `packages/vue/src/MeshMaker.ts`
- Create: `packages/svelte/package.json`, `packages/svelte/tsup.config.ts`, `packages/svelte/src/index.ts`, `packages/svelte/src/MeshMaker.svelte`

- [ ] **Step 1: Create React wrapper**

`packages/react/package.json`:
```json
{
  "name": "@rising-company/mesh-maker-react",
  "version": "0.1.0",
  "description": "React component for mesh-maker WebGL dot grid",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
      "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" }
    }
  },
  "files": ["dist"],
  "scripts": { "build": "tsup" },
  "license": "MIT",
  "peerDependencies": {
    "@rising-company/mesh-maker-core": "workspace:*",
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  },
  "devDependencies": {
    "@rising-company/mesh-maker-core": "workspace:*",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tsup": "^8.0.0"
  }
}
```

`packages/react/tsup.config.ts`:
```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['react', 'react-dom', '@rising-company/mesh-maker-core'],
})
```

`packages/react/src/index.ts`:
```typescript
export { MeshMaker, type MeshMakerProps } from './MeshMaker'
export type { MeshMakerOptions, PresetName, Preset } from '@rising-company/mesh-maker-core'
export { getPreset, presetNames } from '@rising-company/mesh-maker-core'
```

`packages/react/src/MeshMaker.tsx`:
```typescript
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
```

- [ ] **Step 2: Create Vue wrapper**

`packages/vue/package.json`:
```json
{
  "name": "@rising-company/mesh-maker-vue",
  "version": "0.1.0",
  "description": "Vue component for mesh-maker WebGL dot grid",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
      "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" }
    }
  },
  "files": ["dist", "src"],
  "scripts": { "build": "tsup" },
  "license": "MIT",
  "peerDependencies": { "@rising-company/mesh-maker-core": "workspace:*", "vue": "^3.3.0" },
  "devDependencies": { "@rising-company/mesh-maker-core": "workspace:*", "vue": "^3.5.0", "tsup": "^8.0.0" }
}
```

`packages/vue/tsup.config.ts`:
```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['vue', '@rising-company/mesh-maker-core'],
})
```

`packages/vue/src/index.ts`:
```typescript
export { MeshMaker } from './MeshMaker'
export type { MeshMakerOptions, PresetName, Preset } from '@rising-company/mesh-maker-core'
export { getPreset, presetNames } from '@rising-company/mesh-maker-core'
```

`packages/vue/src/MeshMaker.ts`:
```typescript
import { defineComponent, h, ref, onMounted, onBeforeUnmount, watch, type PropType, type CSSProperties } from 'vue'
import { MeshMaker as MeshMakerCore, type PresetName } from '@rising-company/mesh-maker-core'

export const MeshMaker = defineComponent({
  name: 'MeshMaker',
  inheritAttrs: false,
  props: {
    preset: { type: String as PropType<PresetName>, default: 'stitch' },
    colors: { type: Array as PropType<string[]>, default: undefined },
    dotSize: { type: Number, default: 1.5 },
    spacing: { type: Number, default: 24 },
    dotColor: { type: String, default: '#ffffff' },
    dotOpacity: { type: Number, default: 0.3 },
    hover: { type: Boolean, default: true },
    hoverRadius: { type: Number, default: 0.15 },
    hoverStrength: { type: Number, default: 0.5 },
    hoverMomentum: { type: Number, default: 0.1 },
    underlay: { type: Boolean, default: true },
    glowIntensity: { type: Number, default: 0.6 },
    glowSpeed: { type: Number, default: 0.3 },
    fps: { type: Number, default: 60 },
    pixelRatio: { type: Number, default: undefined },
    animate: { type: Boolean, default: true },
  },
  setup(props, { attrs }) {
    const canvasRef = ref<HTMLCanvasElement | null>(null)
    let instance: MeshMakerCore | null = null

    onMounted(() => {
      if (!canvasRef.value) return
      instance = new MeshMakerCore(canvasRef.value, { ...props })
    })

    onBeforeUnmount(() => { instance?.destroy(); instance = null })

    watch(() => props.preset, (v) => { if (instance && v) instance.setPreset(v) })
    watch(() => props.colors, (v) => { if (instance && v) instance.setColors(v) })
    watch(() => props.dotSize, (v) => { if (instance) instance.setDotSize(v) })
    watch(() => props.spacing, (v) => { if (instance) instance.setSpacing(v) })
    watch(() => props.hover, (v) => { if (instance) instance.setHover(v) })
    watch(() => props.underlay, (v) => { if (instance) instance.setUnderlay(v) })

    const wrapperStyle: CSSProperties = { position: 'relative', overflow: 'hidden' }
    const canvasStyle: CSSProperties = { position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', display: 'block' }

    return () => h('div', { class: attrs.class, id: attrs.id, style: { ...wrapperStyle, ...(attrs.style as any) } },
      [h('canvas', { ref: canvasRef, style: canvasStyle })])
  },
})
```

- [ ] **Step 3: Create Svelte wrapper**

`packages/svelte/package.json`:
```json
{
  "name": "@rising-company/mesh-maker-svelte",
  "version": "0.1.0",
  "description": "Svelte component for mesh-maker WebGL dot grid",
  "type": "module",
  "svelte": "./src/index.ts",
  "main": "./src/index.ts",
  "module": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": { "svelte": "./src/index.ts", "import": "./src/index.ts", "types": "./src/index.ts" }
  },
  "files": ["src"],
  "scripts": { "build": "echo 'Svelte components are compiled by the consumer bundler'" },
  "license": "MIT",
  "peerDependencies": { "@rising-company/mesh-maker-core": "workspace:*", "svelte": "^5.0.0" },
  "devDependencies": { "@rising-company/mesh-maker-core": "workspace:*", "svelte": "^5.0.0", "tsup": "^8.0.0" }
}
```

`packages/svelte/tsup.config.ts`:
```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['svelte', '@rising-company/mesh-maker-core'],
})
```

`packages/svelte/src/index.ts`:
```typescript
export { default as MeshMaker } from './MeshMaker.svelte'
export type { MeshMakerOptions, PresetName, Preset } from '@rising-company/mesh-maker-core'
export { getPreset, presetNames } from '@rising-company/mesh-maker-core'
```

`packages/svelte/src/MeshMaker.svelte`:
```svelte
<script lang="ts">
  import { MeshMaker as MeshMakerCore, type MeshMakerOptions, type PresetName } from '@rising-company/mesh-maker-core'

  let {
    preset = 'stitch', colors, dotSize = 1.5, spacing = 24,
    dotColor = '#ffffff', dotOpacity = 0.3, hover = true,
    hoverRadius = 0.15, hoverStrength = 0.5, hoverMomentum = 0.1,
    underlay = true, glowIntensity = 0.6, glowSpeed = 0.3,
    fps = 60, pixelRatio, animate = true,
    class: className = '', ...restProps
  }: MeshMakerOptions & { class?: string; [key: string]: any } = $props()

  let canvasEl: HTMLCanvasElement
  let instance: MeshMakerCore | null = null

  $effect(() => {
    instance = new MeshMakerCore(canvasEl, {
      preset: preset as PresetName, colors, dotSize, spacing, dotColor, dotOpacity,
      hover, hoverRadius, hoverStrength, hoverMomentum,
      underlay, glowIntensity, glowSpeed, fps, pixelRatio, animate,
    })
    return () => { instance?.destroy(); instance = null }
  })

  $effect(() => { if (instance && preset) instance.setPreset(preset as PresetName) })
  $effect(() => { if (instance && colors) instance.setColors(colors) })
  $effect(() => { if (instance) instance.setDotSize(dotSize) })
  $effect(() => { if (instance) instance.setSpacing(spacing) })
  $effect(() => { if (instance) instance.setHover(hover) })
  $effect(() => { if (instance) instance.setUnderlay(underlay) })
</script>

<div class={className} style="position: relative; overflow: hidden;" {...restProps}>
  <canvas bind:this={canvasEl} style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: block;" />
</div>
```

- [ ] **Step 4: Install all dependencies**

Run: `pnpm install`

- [ ] **Step 5: Build all packages**

Run: `pnpm build`
Expected: All packages build successfully.

- [ ] **Step 6: Commit**

```bash
git add packages/react/ packages/vue/ packages/svelte/ pnpm-lock.yaml
git commit -m "feat: React, Vue, and Svelte framework wrappers"
```

---

### Task 8: Demo Playground

**Files:**
- Create: `demo/package.json`
- Create: `demo/index.html`
- Create: `demo/vite.config.ts`
- Create: `demo/src/main.ts`
- Create: `demo/src/style.css`
- Create: `demo/src/sections/hero.ts`
- Create: `demo/src/sections/showcase.ts`
- Create: `demo/src/sections/playground.ts`

- [ ] **Step 1: Create demo package.json**

```json
{
  "name": "mesh-maker-demo",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@rising-company/mesh-maker-core": "workspace:*"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create demo/index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>mesh-maker — Interactive WebGL Dot Mesh</title>
    <link rel="stylesheet" href="/src/style.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 3: Create demo/vite.config.ts**

```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  server: { port: 3000 },
})
```

- [ ] **Step 4: Create demo/src/style.css**

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #0a0a0f; color: #fff; font-family: system-ui, -apple-system, sans-serif; }

.section { position: relative; width: 100%; overflow: hidden; }
.section--hero { height: 100vh; }
.section--showcase { padding: 80px 0; }
.section--playground { padding: 80px 40px; max-width: 1200px; margin: 0 auto; }

.overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1; pointer-events: none; }
.overlay h1 { font-size: 4rem; font-weight: 700; letter-spacing: -0.03em; }
.overlay p { font-size: 1.25rem; opacity: 0.6; margin-top: 0.5rem; }

.showcase-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; max-width: 1200px; margin: 0 auto; padding: 0 40px; }
.showcase-item { position: relative; height: 400px; border-radius: 12px; overflow: hidden; }
.showcase-item canvas { border-radius: 12px; }
.showcase-label { position: absolute; bottom: 16px; left: 16px; z-index: 1; font-size: 0.85rem; opacity: 0.5; pointer-events: none; }

h2 { font-size: 2rem; margin-bottom: 24px; }
.controls { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
.control-group { background: rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 8px; }
.control-group label { display: block; font-size: 0.75rem; text-transform: uppercase; opacity: 0.5; margin-bottom: 4px; }
.control-group input[type="range"] { width: 160px; }

.preset-btn { padding: 6px 16px; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; background: transparent; color: #fff; cursor: pointer; font-size: 0.85rem; }
.preset-btn:hover { border-color: rgba(255,255,255,0.4); }
.preset-btn.active { border-color: #6040f0; background: rgba(96,64,240,0.15); }

.toggle-btn { padding: 6px 16px; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; background: transparent; color: #fff; cursor: pointer; font-size: 0.85rem; }
.toggle-btn.active { border-color: #50fa7b; background: rgba(80,250,123,0.15); }

.playground-canvas { width: 100%; height: 500px; border-radius: 12px; overflow: hidden; margin-bottom: 24px; position: relative; }

.code-output { background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; font-family: monospace; font-size: 0.85rem; white-space: pre; overflow-x: auto; position: relative; }
.code-tabs { display: flex; gap: 8px; margin-bottom: 12px; }
.code-tab { padding: 4px 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; background: transparent; color: #fff; cursor: pointer; font-size: 0.75rem; }
.code-tab.active { border-color: #6040f0; background: rgba(96,64,240,0.15); }
.copy-btn { position: absolute; top: 12px; right: 12px; padding: 4px 10px; border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; background: transparent; color: #fff; cursor: pointer; font-size: 0.75rem; }
```

- [ ] **Step 5: Create demo/src/main.ts**

```typescript
import { createHero } from './sections/hero'
import { createShowcases } from './sections/showcase'
import { createPlayground } from './sections/playground'

const app = document.getElementById('app')!

const heroContainer = document.createElement('div')
const showcaseContainer = document.createElement('div')
const playgroundContainer = document.createElement('div')

app.appendChild(heroContainer)
app.appendChild(showcaseContainer)
app.appendChild(playgroundContainer)

createHero(heroContainer)
createShowcases(showcaseContainer)
createPlayground(playgroundContainer)
```

- [ ] **Step 6: Create demo/src/sections/hero.ts**

```typescript
import { MeshMaker } from '@rising-company/mesh-maker-core'

export function createHero(container: HTMLElement) {
  container.innerHTML = `
    <div class="section section--hero">
      <canvas id="hero-canvas" style="position:absolute;inset:0;width:100%;height:100%;display:block;"></canvas>
      <div class="overlay">
        <h1>mesh-maker</h1>
        <p>Interactive WebGL dot mesh for the web</p>
      </div>
    </div>
  `
  const canvas = container.querySelector('#hero-canvas') as HTMLCanvasElement
  new MeshMaker(canvas, { preset: 'stitch' })
}
```

- [ ] **Step 7: Create demo/src/sections/showcase.ts**

```typescript
import { MeshMaker } from '@rising-company/mesh-maker-core'

export function createShowcases(container: HTMLElement) {
  container.innerHTML = `
    <div class="section section--showcase">
      <div class="showcase-grid">
        <div class="showcase-item">
          <canvas id="showcase-1" style="position:absolute;inset:0;width:100%;height:100%;display:block;"></canvas>
          <div class="showcase-label">stitch preset — hover enabled</div>
        </div>
        <div class="showcase-item">
          <canvas id="showcase-2" style="position:absolute;inset:0;width:100%;height:100%;display:block;"></canvas>
          <div class="showcase-label">ember preset — dots only</div>
        </div>
      </div>
    </div>
  `
  new MeshMaker(container.querySelector('#showcase-1') as HTMLCanvasElement, { preset: 'stitch' })
  new MeshMaker(container.querySelector('#showcase-2') as HTMLCanvasElement, { preset: 'ember', hover: false })
}
```

- [ ] **Step 8: Create demo/src/sections/playground.ts**

This is the most complex file — the interactive editor with sliders, toggles, preset buttons, and code generator.

```typescript
import { MeshMaker, presetNames, type PresetName } from '@rising-company/mesh-maker-core'

export function createPlayground(container: HTMLElement) {
  let currentPreset: PresetName = 'stitch'
  let hover = true
  let underlay = true
  let dotSize = 1.5
  let spacing = 24
  let dotOpacity = 0.3
  let hoverRadius = 0.15
  let hoverStrength = 0.5
  let hoverMomentum = 0.1
  let glowIntensity = 0.6
  let glowSpeed = 0.3
  let codeTab = 'vanilla'

  container.innerHTML = `
    <div class="section section--playground">
      <h2>Playground</h2>
      <div class="playground-canvas">
        <canvas id="playground-canvas" style="position:absolute;inset:0;width:100%;height:100%;display:block;"></canvas>
      </div>
      <div class="controls">
        <div class="control-group">
          <label>Preset</label>
          <div id="preset-buttons" style="display:flex;gap:6px;flex-wrap:wrap;"></div>
        </div>
        <div class="control-group">
          <label>Hover</label>
          <button id="toggle-hover" class="toggle-btn active">On</button>
        </div>
        <div class="control-group">
          <label>Underlay</label>
          <button id="toggle-underlay" class="toggle-btn active">On</button>
        </div>
      </div>
      <div class="controls">
        <div class="control-group"><label>Dot Size</label><input type="range" id="s-dotSize" min="0.5" max="4" step="0.1" value="1.5"><span id="v-dotSize">1.5</span></div>
        <div class="control-group"><label>Spacing</label><input type="range" id="s-spacing" min="8" max="64" step="1" value="24"><span id="v-spacing">24</span></div>
        <div class="control-group"><label>Dot Opacity</label><input type="range" id="s-dotOpacity" min="0" max="1" step="0.05" value="0.3"><span id="v-dotOpacity">0.3</span></div>
        <div class="control-group"><label>Hover Radius</label><input type="range" id="s-hoverRadius" min="0.05" max="0.5" step="0.01" value="0.15"><span id="v-hoverRadius">0.15</span></div>
        <div class="control-group"><label>Hover Strength</label><input type="range" id="s-hoverStrength" min="0" max="1" step="0.05" value="0.5"><span id="v-hoverStrength">0.5</span></div>
        <div class="control-group"><label>Hover Momentum</label><input type="range" id="s-hoverMomentum" min="0" max="0.95" step="0.05" value="0.1"><span id="v-hoverMomentum">0.1</span></div>
        <div class="control-group"><label>Glow Intensity</label><input type="range" id="s-glowIntensity" min="0" max="1" step="0.05" value="0.6"><span id="v-glowIntensity">0.6</span></div>
        <div class="control-group"><label>Glow Speed</label><input type="range" id="s-glowSpeed" min="0" max="1" step="0.05" value="0.3"><span id="v-glowSpeed">0.3</span></div>
      </div>
      <div class="code-tabs" id="code-tabs"></div>
      <div class="code-output" id="code-output"><button class="copy-btn" id="copy-btn">Copy</button><code id="code-content"></code></div>
    </div>
  `

  const canvas = container.querySelector('#playground-canvas') as HTMLCanvasElement
  const mesh = new MeshMaker(canvas, { preset: currentPreset })

  // Preset buttons
  const presetContainer = container.querySelector('#preset-buttons')!
  for (const name of presetNames) {
    const btn = document.createElement('button')
    btn.className = `preset-btn${name === currentPreset ? ' active' : ''}`
    btn.textContent = name
    btn.onclick = () => {
      currentPreset = name
      mesh.setPreset(name)
      presetContainer.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      updateCode()
    }
    presetContainer.appendChild(btn)
  }

  // Toggles
  const hoverBtn = container.querySelector('#toggle-hover') as HTMLButtonElement
  hoverBtn.onclick = () => {
    hover = !hover
    mesh.setHover(hover)
    hoverBtn.textContent = hover ? 'On' : 'Off'
    hoverBtn.classList.toggle('active', hover)
    updateCode()
  }

  const underlayBtn = container.querySelector('#toggle-underlay') as HTMLButtonElement
  underlayBtn.onclick = () => {
    underlay = !underlay
    mesh.setUnderlay(underlay)
    underlayBtn.textContent = underlay ? 'On' : 'Off'
    underlayBtn.classList.toggle('active', underlay)
    updateCode()
  }

  // Sliders
  const sliders: [string, (v: number) => void][] = [
    ['dotSize', (v) => { dotSize = v; mesh.setDotSize(v) }],
    ['spacing', (v) => { spacing = v; mesh.setSpacing(v) }],
    ['dotOpacity', (v) => { dotOpacity = v }],
    ['hoverRadius', (v) => { hoverRadius = v }],
    ['hoverStrength', (v) => { hoverStrength = v }],
    ['hoverMomentum', (v) => { hoverMomentum = v }],
    ['glowIntensity', (v) => { glowIntensity = v }],
    ['glowSpeed', (v) => { glowSpeed = v }],
  ]

  for (const [name, setter] of sliders) {
    const input = container.querySelector(`#s-${name}`) as HTMLInputElement
    const display = container.querySelector(`#v-${name}`) as HTMLSpanElement
    input.oninput = () => {
      const v = parseFloat(input.value)
      setter(v)
      display.textContent = String(v)
      updateCode()
    }
  }

  // Code tabs
  const tabContainer = container.querySelector('#code-tabs')!
  const codeContent = container.querySelector('#code-content')!
  const tabs = ['vanilla', 'react', 'vue', 'svelte']

  for (const tab of tabs) {
    const btn = document.createElement('button')
    btn.className = `code-tab${tab === codeTab ? ' active' : ''}`
    btn.textContent = tab.charAt(0).toUpperCase() + tab.slice(1)
    btn.onclick = () => {
      codeTab = tab
      tabContainer.querySelectorAll('.code-tab').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      updateCode()
    }
    tabContainer.appendChild(btn)
  }

  // Copy button
  const copyBtn = container.querySelector('#copy-btn') as HTMLButtonElement
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(codeContent.textContent || '')
    copyBtn.textContent = 'Copied!'
    setTimeout(() => { copyBtn.textContent = 'Copy' }, 1500)
  }

  function generateOpts(): string {
    const lines: string[] = []
    if (currentPreset !== 'stitch') lines.push(`  preset: '${currentPreset}',`)
    if (!hover) lines.push(`  hover: false,`)
    if (!underlay) lines.push(`  underlay: false,`)
    if (dotSize !== 1.5) lines.push(`  dotSize: ${dotSize},`)
    if (spacing !== 24) lines.push(`  spacing: ${spacing},`)
    if (dotOpacity !== 0.3) lines.push(`  dotOpacity: ${dotOpacity},`)
    if (hoverRadius !== 0.15) lines.push(`  hoverRadius: ${hoverRadius},`)
    if (hoverStrength !== 0.5) lines.push(`  hoverStrength: ${hoverStrength},`)
    if (hoverMomentum !== 0.1) lines.push(`  hoverMomentum: ${hoverMomentum},`)
    if (glowIntensity !== 0.6) lines.push(`  glowIntensity: ${glowIntensity},`)
    if (glowSpeed !== 0.3) lines.push(`  glowSpeed: ${glowSpeed},`)
    return lines.length ? `{\n${lines.join('\n')}\n}` : ''
  }

  function updateCode() {
    const opts = generateOpts()
    let code = ''
    if (codeTab === 'vanilla') {
      code = `import { MeshMaker } from '@rising-company/mesh-maker-core'\n\nconst mesh = new MeshMaker(canvas${opts ? ', ' + opts : ''})`
    } else if (codeTab === 'react') {
      const props = opts ? '\n' + opts.slice(2, -2).replace(/,$/gm, '') : ''
      code = `import { MeshMaker } from '@rising-company/mesh-maker-react'\n\n<MeshMaker${props ? props + '\n' : ' '}style={{ width: '100%', height: '100vh' }} />`
    } else if (codeTab === 'vue') {
      const props = opts ? '\n' + opts.slice(2, -2).replace(/,$/gm, '').replace(/(\w+):/g, ':$1=') : ''
      code = `<script setup>\nimport { MeshMaker } from '@rising-company/mesh-maker-vue'\n</script>\n\n<MeshMaker${props ? props + '\n' : ' '}style="width:100%;height:100vh" />`
    } else if (codeTab === 'svelte') {
      const props = opts ? '\n' + opts.slice(2, -2).replace(/,$/gm, '').replace(/(\w+):/g, '$1=') : ''
      code = `<script>\nimport { MeshMaker } from '@rising-company/mesh-maker-svelte'\n</script>\n\n<MeshMaker${props ? props + '\n' : ' '}style="width:100%;height:100vh" />`
    }
    codeContent.textContent = code
  }

  updateCode()
}
```

- [ ] **Step 9: Install and test dev server**

Run: `pnpm install && pnpm dev`
Expected: Vite dev server starts on localhost:3000, showing the hero, showcase, and playground sections.

- [ ] **Step 10: Visually verify the effect in a browser**

Open `http://localhost:3000` and verify:
- Hero: full-screen dot mesh with stitch colors, hover distortion works
- Showcase: two side-by-side demos
- Playground: sliders update the effect in real-time, code generator works, copy button works
- Test all 6 presets, toggle hover on/off, toggle underlay on/off

- [ ] **Step 11: Commit**

```bash
git add demo/
git commit -m "feat: interactive demo playground with presets, sliders, and code generator"
```

---

### Task 9: Final Verification

- [ ] **Step 1: Run all tests**

Run: `pnpm test`
Expected: All tests pass.

- [ ] **Step 2: Build all packages**

Run: `pnpm build`
Expected: All packages build with no errors.

- [ ] **Step 3: Verify demo runs**

Run: `pnpm dev`
Open browser, test all features.

- [ ] **Step 4: Final commit with LICENSE**

Create `LICENSE` (MIT license) and commit:

```bash
git add LICENSE
git commit -m "chore: add MIT license"
```
