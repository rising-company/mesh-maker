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
