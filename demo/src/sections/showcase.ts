import { MeshMaker } from '@rising-company/mesh-maker-core'

export function createShowcases(container: HTMLElement): void {
  container.innerHTML = `
    <hr class="section-divider" />
    <section class="section">
      <div class="section-eyebrow">// Preset &middot; Stitch</div>
      <h2 class="section-title">Halftone Aurora</h2>
      <p class="section-desc">Animated gradient rendered through a dot grid mask &mdash; mouse distortion enabled</p>
      <div class="showcase-canvas-wrapper">
        <canvas id="showcase-stitch"></canvas>
      </div>
    </section>

    <hr class="section-divider" />
    <section class="section">
      <div class="section-eyebrow">// Preset &middot; Neon</div>
      <h2 class="section-title">Static Grid</h2>
      <p class="section-desc">Vibrant neon colors with hover disabled &mdash; pure dot pattern</p>
      <div class="showcase-canvas-wrapper">
        <canvas id="showcase-neon"></canvas>
      </div>
    </section>
  `

  new MeshMaker(container.querySelector('#showcase-stitch') as HTMLCanvasElement, {
    preset: 'stitch',
  })

  new MeshMaker(container.querySelector('#showcase-neon') as HTMLCanvasElement, {
    preset: 'neon',
    hover: false,
  })
}
