import { MeshMaker } from '@rising-company/mesh-maker-core'

export function createHero(container: HTMLElement): void {
  container.innerHTML = `
    <section class="hero">
      <canvas id="hero-canvas"></canvas>
      <div class="hero-content">
        <div class="hero-eyebrow">// Interactive Dot Mesh</div>
        <h1 class="hero-title">Mesh-Maker</h1>
        <p class="hero-subtitle">Halftone dot mesh with mouse distortion &mdash; zero dependencies</p>
        <code class="hero-install">npm i @rising-company/mesh-maker-core</code>
      </div>
      <div class="hero-stats">
        <div class="stat-row">
          <div class="stat-label">Renderer</div>
          <div class="stat-value">WEBGL 2.0</div>
        </div>
        <div class="stat-row">
          <div class="stat-label">Dependencies</div>
          <div class="stat-value">ZERO</div>
        </div>
        <div class="stat-row">
          <div class="stat-label">Frameworks</div>
          <div class="stat-value">REACT &middot; VUE &middot; SVELTE</div>
        </div>
      </div>
      <div class="hero-controls-hint">
        <p><span>HOVER</span> &mdash; Distort</p>
        <p><span>SCROLL</span> &mdash; Explore</p>
      </div>
    </section>
  `
  const canvas = document.getElementById('hero-canvas') as HTMLCanvasElement
  new MeshMaker(canvas, { preset: 'stitch' })
}
