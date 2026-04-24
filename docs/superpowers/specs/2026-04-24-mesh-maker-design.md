# mesh-maker Design Spec

A WebGL library that renders an interactive dot mesh grid with mouse-driven noise distortion and an optional animated gradient underlay. Sibling project to [wave-maker](../../../wave-maker/).

## Overview

mesh-maker helps frontend developers add a dot mesh background effect to their websites -- a regular grid of small dots on a dark background that distorts organically near the cursor, with an optional animated color glow underneath. The effect is inspired by the landing page of [stitch.withgoogle.com](https://stitch.withgoogle.com/).

## Architecture

### Monorepo Structure

pnpm workspace matching wave-maker's layout:

```
mesh-maker/
  packages/
    core/           @rising-company/mesh-maker-core
    react/          @rising-company/mesh-maker-react
    vue/            @rising-company/mesh-maker-vue
    svelte/         @rising-company/mesh-maker-svelte
  demo/             Vite-based interactive playground
```

### Rendering Approach

Single-pass procedural WebGL. One fragment shader handles everything:

1. **Glow underlay** -- animated simplex noise gradient. Configurable colors, speed, intensity. Disabled when `underlay: false` (glow terms multiply by 0, no GPU branching).
2. **Noise warp** -- BCC noise-based UV distortion near the mouse cursor. Radius and strength are configurable. Disabled when `hover: false`.
3. **Dot grid** -- `fract(warpedUV * gridScale)` produces repeating cells. Circle SDF within each cell renders the dot. Size, spacing, color, and opacity are configurable.
4. **Composite** -- dot blended over glow → `fragColor`.

Single draw call, zero framebuffers, fullscreen quad geometry (6 vertices, two triangles).

### Shader Files

- `vertex.ts` -- fullscreen quad vertex shader (WebGL 2 with WebGL 1 fallback)
- `fragment.ts` -- main fragment shader containing all four stages
- `noise.ts` -- GLSL noise functions:
  - BCC noise with derivatives (for UV warping, adapted from OpenSimplex2)
  - 2D/3D simplex noise (for animated glow)

### Renderer Internals

Reusable modules matching wave-maker's `renderer/` directory:

- `webgl-context.ts` -- WebGL 2/1 context creation with fallback
- `animation-loop.ts` -- `requestAnimationFrame` wrapper with FPS capping
- `shader-compiler.ts` -- GLSL compilation, linking, and error reporting

### Mouse Tracking

1. `mousemove` / `touchmove` listener on the canvas
2. Raw coordinates normalized to 0..1 UV space
3. Smoothed via lerp in the animation loop (controlled by `hoverMomentum`)
4. Passed to shader as `u_mouse` vec2 uniform each frame

When `hover: false`, the mouse listener is not attached and `u_mouse` is set to `vec2(-1.0)` (off-screen, so the warp radius check naturally produces zero distortion).

## Public API

### Core Package: `@rising-company/mesh-maker-core`

#### Constructor

```typescript
new MeshMaker(canvas: HTMLCanvasElement, options?: MeshMakerOptions)
```

#### Options

All optional. Defaults produce a fully working effect (dots + hover + underlay with 'stitch' preset).

| Option | Type | Default | Description |
|---|---|---|---|
| `preset` | `PresetName` | `'stitch'` | Named color preset |
| `dotSize` | `number` | `1.5` | Dot radius in pixels |
| `spacing` | `number` | `24` | Grid spacing in pixels |
| `dotColor` | `string` | `'#ffffff'` | Dot color (hex) |
| `dotOpacity` | `number` | `0.3` | Base dot opacity (0-1) |
| `hover` | `boolean` | `true` | Enable mouse interaction |
| `hoverRadius` | `number` | `0.15` | Distortion radius (0-1, fraction of canvas) |
| `hoverStrength` | `number` | `0.5` | Warp intensity (0-1) |
| `hoverMomentum` | `number` | `0.1` | Mouse smoothing (0=instant, 1=very laggy) |
| `underlay` | `boolean` | `true` | Enable animated glow |
| `colors` | `string[]` | from preset | 2-6 hex colors for the glow gradient |
| `glowIntensity` | `number` | `0.6` | Glow brightness (0-1) |
| `glowSpeed` | `number` | `0.3` | Glow animation speed multiplier |
| `fps` | `number` | `60` | Frame rate cap |
| `pixelRatio` | `number` | `devicePixelRatio` | Pixel ratio |
| `animate` | `boolean` | `true` | Auto-start animation |

#### Methods

```typescript
mesh.play()                  // resume animation
mesh.pause()                 // pause animation
mesh.destroy()               // clean up all resources
mesh.resize()                // manual resize trigger

mesh.setPreset(name)         // switch preset (updates colors + defaults)
mesh.setColors(colors)       // update underlay colors
mesh.setDotSize(size)        // update dot size
mesh.setSpacing(spacing)     // update grid spacing
mesh.setHover(enabled)       // toggle hover on/off
mesh.setUnderlay(enabled)    // toggle underlay on/off
```

#### Properties

```typescript
mesh.isPlaying: boolean
mesh.currentPreset: PresetName
```

#### Exports

```typescript
export { MeshMaker } from './mesh-maker'
export { resolveOptions } from './mesh-maker'
export type { MeshMakerOptions, Preset, PresetName, ResolvedOptions } from './types'
export { getPreset, presetNames } from './presets'
```

### Option Resolution

Same layered resolution as wave-maker:

1. User-provided options (highest priority)
2. Preset defaults (e.g., 'stitch' might default `glowIntensity: 0.7`)
3. Global defaults (the table above)

Pure function `resolveOptions()` handles this, exported for testing and framework wrappers.

### Presets

Six named presets, each defining 2-6 colors and optional default overrides:

| Preset | Colors | Character |
|---|---|---|
| `stitch` | Purple, indigo, teal, cyan | The Stitch landing page look |
| `midnight` | Deep blue, navy, silver | Dark and subtle |
| `neon` | Hot pink, electric blue, lime | Vibrant, high contrast |
| `aurora` | Green, cyan, magenta | Northern lights |
| `ember` | Red, orange, gold | Warm and fiery |
| `ocean` | Deep blue, teal, seafoam | Cool and calm |

Preset interface:

```typescript
interface Preset {
  name: string
  colors: string[]
  defaults?: Partial<Omit<MeshMakerOptions, 'preset' | 'colors'>>
}
```

## Framework Wrappers

Thin wrappers following wave-maker's exact patterns.

### React: `@rising-company/mesh-maker-react`

```tsx
<MeshMaker preset="stitch" hover={true} underlay={true} />
```

- Functional component with `useRef` + `useEffect`
- Props extend `MeshMakerOptions` with `className`, `style`, `id`
- Separate effects for reactive prop updates (preset, colors, dotSize, etc.)
- Cleanup on unmount

### Vue: `@rising-company/mesh-maker-vue`

```vue
<MeshMaker preset="stitch" :hover="true" :underlay="true" />
```

- `defineComponent` with Composition API
- `onMounted` / `onBeforeUnmount` lifecycle
- Individual watchers for each prop

### Svelte: `@rising-company/mesh-maker-svelte`

```svelte
<MeshMaker preset="stitch" hover={true} underlay={true} />
```

- Svelte 5 with `$props()` and `$effect()` runes
- Cleanup via effect return

All wrappers re-export types and helper functions from core.

## Demo / Playground

Vite-based demo app matching wave-maker's structure:

### Sections

1. **Hero** -- full-screen mesh effect with title overlay ("mesh-maker" branding)
2. **Showcase** -- two side-by-side demos (e.g., stitch preset with hover vs. ember preset static)
3. **Playground** -- interactive editor:
   - 6 preset buttons
   - Color swatches (editable, add/remove up to 6)
   - Toggle switches for hover and underlay
   - Sliders for: dotSize, spacing, dotOpacity, hoverRadius, hoverStrength, hoverMomentum, glowIntensity, glowSpeed
   - Framework code generator (React, Vue, Svelte, Vanilla)
   - Copy button with feedback

## Build System

- **tsup** for all packages (ESM + CJS + DTS)
- **vitest** with jsdom for unit tests
- **pnpm workspace** for monorepo management

Core tsup config:
```typescript
{
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false
}
```

Framework wrapper configs externalize their framework dependency + core.

## Testing Strategy

### Core Tests

- `options.test.ts` -- `resolveOptions()` layered defaults, preset application, user overrides
- `presets.test.ts` -- all presets valid, color counts, preset lookup errors
- `mesh-maker.test.ts` -- constructor, lifecycle methods, WebGL context creation (mocked)

### What We Don't Test

- Visual correctness of shaders (manual verification via demo)
- Framework wrapper rendering (trivial pass-through to core)
