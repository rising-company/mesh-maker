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
