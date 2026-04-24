<script lang="ts">
  import { MeshMaker as MeshMakerCore, type MeshMakerOptions, type PresetName } from '@rising-company/mesh-maker-core'

  let {
    preset = 'stitch', colors, dotSize = 1.5, spacing = 24,
    dotColor = '#ffffff', dotOpacity = 0.3, hover = true,
    hoverRadius = 0.15, hoverStrength = 0.5, hoverMomentum = 0.1,
    underlay = true, glowIntensity = 0.6, glowSpeed = 0.3,
    fps = 60, pixelRatio, animate = true,
    class: className = '', ...restProps
  }: MeshMakerOptions & { class?: string; [key: string]: any } = $props()

  let canvasEl: HTMLCanvasElement
  let instance: MeshMakerCore | null = null

  $effect(() => {
    instance = new MeshMakerCore(canvasEl, {
      preset: preset as PresetName, colors, dotSize, spacing, dotColor, dotOpacity,
      hover, hoverRadius, hoverStrength, hoverMomentum,
      underlay, glowIntensity, glowSpeed, fps, pixelRatio, animate,
    })
    return () => { instance?.destroy(); instance = null }
  })

  $effect(() => { if (instance && preset) instance.setPreset(preset as PresetName) })
  $effect(() => { if (instance && colors) instance.setColors(colors) })
  $effect(() => { if (instance) instance.setDotSize(dotSize) })
  $effect(() => { if (instance) instance.setSpacing(spacing) })
  $effect(() => { if (instance) instance.setHover(hover) })
  $effect(() => { if (instance) instance.setUnderlay(underlay) })
</script>

<div class={className} style="position: relative; overflow: hidden;" {...restProps}>
  <canvas bind:this={canvasEl} style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: block;" />
</div>
