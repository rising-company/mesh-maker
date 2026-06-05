# @rising-company/mesh-maker-svelte

Svelte 5 component for [mesh-maker](https://github.com/rising-company/mesh-maker) — interactive WebGL dot-mesh grid with mouse distortion and animated glow.

## Installation

```bash
npm install @rising-company/mesh-maker-svelte @rising-company/mesh-maker-core
```

Requires Svelte 5. For security, use **Svelte >= 5.55.7**, which patches the
SSR XSS, DOM-clobbering XSS (GHSA-rcqx-6q8c-2c42), and `<svelte:element>` ReDoS
(GHSA-9rmh-mm8f-r9h6) advisories affecting earlier 5.x releases.

## Quick Start

```svelte
<script>
  import { MeshMaker } from '@rising-company/mesh-maker-svelte'
</script>

<div style="position: relative; height: 100vh">
  <MeshMaker preset="stitch" class="absolute inset-0" />
  <div style="position: relative; z-index: 1">
    <h1>Your content</h1>
  </div>
</div>
```

## Presets

`stitch` · `midnight` · `neon` · `aurora` · `ember` · `ocean`

## Documentation

Full props, API, and examples: [github.com/rising-company/mesh-maker](https://github.com/rising-company/mesh-maker#readme)

## License

MIT
