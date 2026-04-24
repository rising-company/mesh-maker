import { MeshMaker, presetNames, type PresetName } from '@rising-company/mesh-maker-core'

export function createPlayground(container: HTMLElement) {
  let currentPreset: PresetName = 'stitch'
  let hover = true
  let underlay = true
  let dotSize = 1.5
  let spacing = 24
  let dotOpacity = 0.3
  let hoverRadius = 0.15
  let hoverStrength = 0.5
  let hoverMomentum = 0.1
  let glowIntensity = 0.6
  let glowSpeed = 0.3
  let codeTab = 'vanilla'

  container.innerHTML = `
    <div class="section section--playground">
      <h2>Playground</h2>
      <div class="playground-canvas">
        <canvas id="playground-canvas" style="position:absolute;inset:0;width:100%;height:100%;display:block;"></canvas>
      </div>
      <div class="controls">
        <div class="control-group">
          <label>Preset</label>
          <div id="preset-buttons" style="display:flex;gap:6px;flex-wrap:wrap;"></div>
        </div>
        <div class="control-group">
          <label>Hover</label>
          <button id="toggle-hover" class="toggle-btn active">On</button>
        </div>
        <div class="control-group">
          <label>Underlay</label>
          <button id="toggle-underlay" class="toggle-btn active">On</button>
        </div>
      </div>
      <div class="controls">
        <div class="control-group"><label>Dot Size</label><input type="range" id="s-dotSize" min="0.5" max="4" step="0.1" value="1.5"><span id="v-dotSize">1.5</span></div>
        <div class="control-group"><label>Spacing</label><input type="range" id="s-spacing" min="8" max="64" step="1" value="24"><span id="v-spacing">24</span></div>
        <div class="control-group"><label>Dot Opacity</label><input type="range" id="s-dotOpacity" min="0" max="1" step="0.05" value="0.3"><span id="v-dotOpacity">0.3</span></div>
        <div class="control-group"><label>Hover Radius</label><input type="range" id="s-hoverRadius" min="0.05" max="0.5" step="0.01" value="0.15"><span id="v-hoverRadius">0.15</span></div>
        <div class="control-group"><label>Hover Strength</label><input type="range" id="s-hoverStrength" min="0" max="1" step="0.05" value="0.5"><span id="v-hoverStrength">0.5</span></div>
        <div class="control-group"><label>Hover Momentum</label><input type="range" id="s-hoverMomentum" min="0" max="0.95" step="0.05" value="0.1"><span id="v-hoverMomentum">0.1</span></div>
        <div class="control-group"><label>Glow Intensity</label><input type="range" id="s-glowIntensity" min="0" max="1" step="0.05" value="0.6"><span id="v-glowIntensity">0.6</span></div>
        <div class="control-group"><label>Glow Speed</label><input type="range" id="s-glowSpeed" min="0" max="1" step="0.05" value="0.3"><span id="v-glowSpeed">0.3</span></div>
      </div>
      <div class="code-tabs" id="code-tabs"></div>
      <div class="code-output" id="code-output"><button class="copy-btn" id="copy-btn">Copy</button><code id="code-content"></code></div>
    </div>
  `

  const canvas = container.querySelector('#playground-canvas') as HTMLCanvasElement
  const mesh = new MeshMaker(canvas, { preset: currentPreset })

  // Preset buttons
  const presetContainer = container.querySelector('#preset-buttons')!
  for (const name of presetNames) {
    const btn = document.createElement('button')
    btn.className = `preset-btn${name === currentPreset ? ' active' : ''}`
    btn.textContent = name
    btn.onclick = () => {
      currentPreset = name
      mesh.setPreset(name)
      presetContainer.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      updateCode()
    }
    presetContainer.appendChild(btn)
  }

  // Toggles
  const hoverBtn = container.querySelector('#toggle-hover') as HTMLButtonElement
  hoverBtn.onclick = () => {
    hover = !hover
    mesh.setHover(hover)
    hoverBtn.textContent = hover ? 'On' : 'Off'
    hoverBtn.classList.toggle('active', hover)
    updateCode()
  }

  const underlayBtn = container.querySelector('#toggle-underlay') as HTMLButtonElement
  underlayBtn.onclick = () => {
    underlay = !underlay
    mesh.setUnderlay(underlay)
    underlayBtn.textContent = underlay ? 'On' : 'Off'
    underlayBtn.classList.toggle('active', underlay)
    updateCode()
  }

  // Sliders
  const sliders: [string, (v: number) => void][] = [
    ['dotSize', (v) => { dotSize = v; mesh.setDotSize(v) }],
    ['spacing', (v) => { spacing = v; mesh.setSpacing(v) }],
    ['dotOpacity', (v) => { dotOpacity = v }],
    ['hoverRadius', (v) => { hoverRadius = v }],
    ['hoverStrength', (v) => { hoverStrength = v }],
    ['hoverMomentum', (v) => { hoverMomentum = v }],
    ['glowIntensity', (v) => { glowIntensity = v }],
    ['glowSpeed', (v) => { glowSpeed = v }],
  ]

  for (const [name, setter] of sliders) {
    const input = container.querySelector(`#s-${name}`) as HTMLInputElement
    const display = container.querySelector(`#v-${name}`) as HTMLSpanElement
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
    btn.className = `code-tab${tab === codeTab ? ' active' : ''}`
    btn.textContent = tab.charAt(0).toUpperCase() + tab.slice(1)
    btn.onclick = () => {
      codeTab = tab
      tabContainer.querySelectorAll('.code-tab').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      updateCode()
    }
    tabContainer.appendChild(btn)
  }

  // Copy button
  const copyBtn = container.querySelector('#copy-btn') as HTMLButtonElement
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(codeContent.textContent || '')
    copyBtn.textContent = 'Copied!'
    setTimeout(() => { copyBtn.textContent = 'Copy' }, 1500)
  }

  function generateOpts(): string {
    const lines: string[] = []
    if (currentPreset !== 'stitch') lines.push(`  preset: '${currentPreset}',`)
    if (!hover) lines.push(`  hover: false,`)
    if (!underlay) lines.push(`  underlay: false,`)
    if (dotSize !== 1.5) lines.push(`  dotSize: ${dotSize},`)
    if (spacing !== 24) lines.push(`  spacing: ${spacing},`)
    if (dotOpacity !== 0.3) lines.push(`  dotOpacity: ${dotOpacity},`)
    if (hoverRadius !== 0.15) lines.push(`  hoverRadius: ${hoverRadius},`)
    if (hoverStrength !== 0.5) lines.push(`  hoverStrength: ${hoverStrength},`)
    if (hoverMomentum !== 0.1) lines.push(`  hoverMomentum: ${hoverMomentum},`)
    if (glowIntensity !== 0.6) lines.push(`  glowIntensity: ${glowIntensity},`)
    if (glowSpeed !== 0.3) lines.push(`  glowSpeed: ${glowSpeed},`)
    return lines.length ? `{\n${lines.join('\n')}\n}` : ''
  }

  function updateCode() {
    const opts = generateOpts()
    let code = ''
    if (codeTab === 'vanilla') {
      code = `import { MeshMaker } from '@rising-company/mesh-maker-core'\n\nconst mesh = new MeshMaker(canvas${opts ? ', ' + opts : ''})`
    } else if (codeTab === 'react') {
      const props = opts ? '\n' + opts.slice(2, -2).replace(/,$/gm, '') : ''
      code = `import { MeshMaker } from '@rising-company/mesh-maker-react'\n\n<MeshMaker${props ? props + '\n' : ' '}style={{ width: '100%', height: '100vh' }} />`
    } else if (codeTab === 'vue') {
      const props = opts ? '\n' + opts.slice(2, -2).replace(/,$/gm, '').replace(/(\w+):/g, ':$1=') : ''
      code = `<script setup>\nimport { MeshMaker } from '@rising-company/mesh-maker-vue'\n</script>\n\n<MeshMaker${props ? props + '\n' : ' '}style="width:100%;height:100vh" />`
    } else if (codeTab === 'svelte') {
      const props = opts ? '\n' + opts.slice(2, -2).replace(/,$/gm, '').replace(/(\w+):/g, '$1=') : ''
      code = `<script>\nimport { MeshMaker } from '@rising-company/mesh-maker-svelte'\n</script>\n\n<MeshMaker${props ? props + '\n' : ' '}style="width:100%;height:100vh" />`
    }
    codeContent.textContent = code
  }

  updateCode()
}
