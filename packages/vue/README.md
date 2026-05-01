# @rising-company/mesh-maker-vue

Vue 3 component for [mesh-maker](https://github.com/rising-company/mesh-maker) — interactive WebGL dot-mesh grid with mouse distortion and animated glow.

## Installation

```bash
npm install @rising-company/mesh-maker-vue @rising-company/mesh-maker-core
```

Requires Vue 3.3+.

## Quick Start

```vue
<script setup>
import { MeshMaker } from '@rising-company/mesh-maker-vue'
</script>

<template>
  <div style="position: relative; height: 100vh">
    <MeshMaker preset="stitch" class="absolute inset-0" />
    <div style="position: relative; z-index: 1">
      <h1>Your content</h1>
    </div>
  </div>
</template>
```

## Presets

`stitch` · `midnight` · `neon` · `aurora` · `ember` · `ocean`

## Documentation

Full props, API, and examples: [github.com/rising-company/mesh-maker](https://github.com/rising-company/mesh-maker#readme)

## License

MIT
