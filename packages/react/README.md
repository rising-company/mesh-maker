# @rising-company/mesh-maker-react

React component for [mesh-maker](https://github.com/rising-company/mesh-maker) — interactive WebGL dot-mesh grid with mouse distortion and animated glow.

## Installation

```bash
npm install @rising-company/mesh-maker-react @rising-company/mesh-maker-core
```

Requires React 18 or 19.

## Quick Start

```jsx
import { MeshMaker } from '@rising-company/mesh-maker-react'

export default function Hero() {
  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <MeshMaker preset="stitch" className="absolute inset-0" />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1>Your content</h1>
      </div>
    </div>
  )
}
```

## Presets

`stitch` · `midnight` · `neon` · `aurora` · `ember` · `ocean`

## Documentation

Full props, API, and examples: [github.com/rising-company/mesh-maker](https://github.com/rising-company/mesh-maker#readme)

## License

MIT
