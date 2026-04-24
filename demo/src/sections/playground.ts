import { MeshMaker, presetNames, type PresetName } from '@rising-company/mesh-maker-core'

export function createPlayground(container: HTMLElement) {
  let currentPreset: PresetName = 'stitch'
  let hover = true
  let underlay = true
  let dotSize = 1.2
  let spacing = 28
  let dotOpacity = 0.25
  let hoverRadius = 0.15
  let hoverStrength = 0.5
  let hoverMomentum = 0.92
  let voidRadius = 0.1
  let glowIntensity = 0.8
  let glowSpeed = 0.25
  let codeTab = 'vanilla'

  container.innerHTML = `
    <hr class="section-divider" />
    <section class="section">
      <div class="section-eyebrow">// Interactive</div>
      <h2 class="section-title">Playground</h2>
      <p class="section-desc">Tweak every parameter in real time &mdash; copy the code when you're happy</p>

      <div class="pg-layout">
        <div class="pg-preview">
          <div class="showcase-canvas-wrapper" style="height:500px;">
            <canvas id="pg-canvas"></canvas>
          </div>
        </div>
        <div class="pg-controls">
          <div class="pg-group">
            <div class="pg-label">PRESET</div>
            <div class="pg-btn-group" id="preset-buttons"></div>
          </div>
          <div class="pg-group">
            <div class="pg-label">FEATURES</div>
            <div class="pg-btn-group">
              <button class="pg-btn pg-btn--active" id="toggle-hover">HOVER ON</button>
              <button class="pg-btn pg-btn--active" id="toggle-underlay">GLOW ON</button>
            </div>
          </div>
          <div class="pg-group">
            <div class="pg-label">DOT SIZE <span id="v-dotSize">1.2</span></div>
            <input class="pg-slider" type="range" id="s-dotSize" min="0.5" max="4" step="0.1" value="1.2">
          </div>
          <div class="pg-group">
            <div class="pg-label">SPACING <span id="v-spacing">28</span></div>
            <input class="pg-slider" type="range" id="s-spacing" min="8" max="64" step="1" value="28">
          </div>
          <div class="pg-group">
            <div class="pg-label">DOT OPACITY <span id="v-dotOpacity">0.25</span></div>
            <input class="pg-slider" type="range" id="s-dotOpacity" min="0" max="1" step="0.05" value="0.25">
          </div>
          <div class="pg-group">
            <div class="pg-label">HOVER RADIUS <span id="v-hoverRadius">0.15</span></div>
            <input class="pg-slider" type="range" id="s-hoverRadius" min="0.05" max="0.35" step="0.01" value="0.15">
          </div>
          <div class="pg-group">
            <div class="pg-label">HOVER STRENGTH <span id="v-hoverStrength">0.5</span></div>
            <input class="pg-slider" type="range" id="s-hoverStrength" min="0" max="1" step="0.05" value="0.5">
          </div>
          <div class="pg-group">
            <div class="pg-label">HOVER MOMENTUM <span id="v-hoverMomentum">0.92</span></div>
            <input class="pg-slider" type="range" id="s-hoverMomentum" min="0" max="0.99" step="0.01" value="0.92">
          </div>
          <div class="pg-group">
            <div class="pg-label">VOID RADIUS <span id="v-voidRadius">0.1</span></div>
            <input class="pg-slider" type="range" id="s-voidRadius" min="0" max="0.5" step="0.01" value="0.1">
          </div>
          <div class="pg-group">
            <div class="pg-label">GLOW INTENSITY <span id="v-glowIntensity">0.8</span></div>
            <input class="pg-slider" type="range" id="s-glowIntensity" min="0" max="1" step="0.05" value="0.8">
          </div>
          <div class="pg-group">
            <div class="pg-label">GLOW SPEED <span id="v-glowSpeed">0.25</span></div>
            <input class="pg-slider" type="range" id="s-glowSpeed" min="0" max="1" step="0.05" value="0.25">
          </div>
        </div>
      </div>

      <div class="pg-code-section">
        <div class="pg-tabs" id="code-tabs"></div>
        <div class="pg-code-wrapper">
          <button class="pg-copy-btn" id="copy-btn">COPY</button>
          <pre class="pg-code" id="code-content"></pre>
        </div>
      </div>
    </section>
  `

  const canvas = container.querySelector('#pg-canvas') as HTMLCanvasElement
  const mesh = new MeshMaker(canvas, { preset: currentPreset })

  // Preset buttons
  const presetContainer = container.querySelector('#preset-buttons')!
  for (const name of presetNames) {
    const btn = document.createElement('button')
    btn.className = 'pg-btn' + (name === currentPreset ? ' pg-btn--active' : '')
    btn.textContent = name.toUpperCase()
    btn.onclick = () => {
      currentPreset = name
      mesh.setPreset(name)
      presetContainer.querySelectorAll('.pg-btn').forEach(b => b.classList.remove('pg-btn--active'))
      btn.classList.add('pg-btn--active')
      updateCode()
    }
    presetContainer.appendChild(btn)
  }

  // Toggles
  const hoverBtn = container.querySelector('#toggle-hover') as HTMLButtonElement
  hoverBtn.onclick = () => {
    hover = !hover
    mesh.setHover(hover)
    hoverBtn.textContent = hover ? 'HOVER ON' : 'HOVER OFF'
    hoverBtn.classList.toggle('pg-btn--active', hover)
    updateCode()
  }

  const underlayBtn = container.querySelector('#toggle-underlay') as HTMLButtonElement
  underlayBtn.onclick = () => {
    underlay = !underlay
    mesh.setUnderlay(underlay)
    underlayBtn.textContent = underlay ? 'GLOW ON' : 'GLOW OFF'
    underlayBtn.classList.toggle('pg-btn--active', underlay)
    updateCode()
  }

  // Sliders
  const sliders: [string, (v: number) => void][] = [
    ['dotSize', (v) => { dotSize = v; mesh.setDotSize(v) }],
    ['spacing', (v) => { spacing = v; mesh.setSpacing(v) }],
    ['dotOpacity', (v) => { dotOpacity = v; mesh.setDotOpacity(v) }],
    ['hoverRadius', (v) => { hoverRadius = v; mesh.setHoverRadius(v) }],
    ['hoverStrength', (v) => { hoverStrength = v; mesh.setHoverStrength(v) }],
    ['hoverMomentum', (v) => { hoverMomentum = v; mesh.setHoverMomentum(v) }],
    ['voidRadius', (v) => { voidRadius = v; mesh.setVoidRadius(v) }],
    ['glowIntensity', (v) => { glowIntensity = v; mesh.setGlowIntensity(v) }],
    ['glowSpeed', (v) => { glowSpeed = v; mesh.setGlowSpeed(v) }],
  ]

  for (const [name, setter] of sliders) {
    const input = container.querySelector('#s-' + name) as HTMLInputElement
    const display = container.querySelector('#v-' + name) as HTMLSpanElement
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
    btn.className = 'pg-tab' + (tab === codeTab ? ' pg-tab--active' : '')
    btn.textContent = tab.charAt(0).toUpperCase() + tab.slice(1)
    btn.onclick = () => {
      codeTab = tab
      tabContainer.querySelectorAll('.pg-tab').forEach(b => b.classList.remove('pg-tab--active'))
      btn.classList.add('pg-tab--active')
      updateCode()
    }
    tabContainer.appendChild(btn)
  }

  // Copy button
  const copyBtn = container.querySelector('#copy-btn') as HTMLButtonElement
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(codeContent.textContent || '')
    copyBtn.textContent = 'COPIED'
    setTimeout(() => { copyBtn.textContent = 'COPY' }, 1500)
  }

  function generateOpts(): string {
    const lines: string[] = []
    if (currentPreset !== 'stitch') lines.push("  preset: '" + currentPreset + "',")
    if (!hover) lines.push('  hover: false,')
    if (!underlay) lines.push('  underlay: false,')
    if (dotSize !== 1.2) lines.push('  dotSize: ' + dotSize + ',')
    if (spacing !== 28) lines.push('  spacing: ' + spacing + ',')
    if (dotOpacity !== 0.25) lines.push('  dotOpacity: ' + dotOpacity + ',')
    if (hoverRadius !== 0.15) lines.push('  hoverRadius: ' + hoverRadius + ',')
    if (hoverStrength !== 0.5) lines.push('  hoverStrength: ' + hoverStrength + ',')
    if (hoverMomentum !== 0.92) lines.push('  hoverMomentum: ' + hoverMomentum + ',')
    if (voidRadius !== 0.1) lines.push('  voidRadius: ' + voidRadius + ',')
    if (glowIntensity !== 0.8) lines.push('  glowIntensity: ' + glowIntensity + ',')
    if (glowSpeed !== 0.25) lines.push('  glowSpeed: ' + glowSpeed + ',')
    return lines.length ? '{\n' + lines.join('\n') + '\n}' : ''
  }

  function updateCode() {
    const opts = generateOpts()
    let code = ''
    if (codeTab === 'vanilla') {
      code = "import { MeshMaker } from '@rising-company/mesh-maker-core'\n\nconst mesh = new MeshMaker(canvas" + (opts ? ', ' + opts : '') + ')'
    } else if (codeTab === 'react') {
      const props = opts ? '\n' + opts.slice(2, -2).replace(/,$/gm, '') : ''
      code = "import { MeshMaker } from '@rising-company/mesh-maker-react'\n\n<MeshMaker" + (props ? props + '\n' : ' ') + "style={{ width: '100%', height: '100vh' }} />"
    } else if (codeTab === 'vue') {
      const props = opts ? '\n' + opts.slice(2, -2).replace(/,$/gm, '').replace(/(\w+):/g, ':$1=') : ''
      code = "<script setup>\nimport { MeshMaker } from '@rising-company/mesh-maker-vue'\n</script>\n\n<MeshMaker" + (props ? props + '\n' : ' ') + 'style="width:100%;height:100vh" />'
    } else if (codeTab === 'svelte') {
      const props = opts ? '\n' + opts.slice(2, -2).replace(/,$/gm, '').replace(/(\w+):/g, '$1=') : ''
      code = "<script>\nimport { MeshMaker } from '@rising-company/mesh-maker-svelte'\n</script>\n\n<MeshMaker" + (props ? props + '\n' : ' ') + 'style="width:100%;height:100vh" />'
    }
    codeContent.textContent = code
  }

  updateCode()
}
