# @rising-company/mesh-maker-core

Interactive WebGL dot-mesh grid with mouse distortion and animated glow. Vanilla JS core — no framework dependencies.

> Looking for a framework wrapper? See [`@rising-company/mesh-maker-react`](https://www.npmjs.com/package/@rising-company/mesh-maker-react), [`@rising-company/mesh-maker-vue`](https://www.npmjs.com/package/@rising-company/mesh-maker-vue), or [`@rising-company/mesh-maker-svelte`](https://www.npmjs.com/package/@rising-company/mesh-maker-svelte).

## Installation

```bash
npm install @rising-company/mesh-maker-core
```

## Quick Start

```js
import { MeshMaker } from '@rising-company/mesh-maker-core'

const canvas = document.querySelector('canvas')
const mesh = new MeshMaker(canvas, { preset: 'stitch' })

// Later
mesh.pause()
mesh.setPreset('aurora')
mesh.destroy()
```

## Presets

`stitch` · `midnight` · `neon` · `aurora` · `ember` · `ocean`

## Documentation

Full options, API, and examples: [github.com/rising-company/mesh-maker](https://github.com/rising-company/mesh-maker#readme)

## License

MIT
