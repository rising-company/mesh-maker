// src/MeshMaker.ts
import { defineComponent, h, ref, onMounted, onBeforeUnmount, watch } from "vue";
import { MeshMaker as MeshMakerCore } from "@rising-company/mesh-maker-core";
var MeshMaker = defineComponent({
  name: "MeshMaker",
  inheritAttrs: false,
  props: {
    preset: { type: String, default: "stitch" },
    colors: { type: Array, default: void 0 },
    dotSize: { type: Number, default: 1.5 },
    spacing: { type: Number, default: 24 },
    dotColor: { type: String, default: "#ffffff" },
    dotOpacity: { type: Number, default: 0.3 },
    hover: { type: Boolean, default: true },
    hoverRadius: { type: Number, default: 0.15 },
    hoverStrength: { type: Number, default: 0.5 },
    hoverMomentum: { type: Number, default: 0.1 },
    underlay: { type: Boolean, default: true },
    glowIntensity: { type: Number, default: 0.6 },
    glowSpeed: { type: Number, default: 0.3 },
    fps: { type: Number, default: 60 },
    pixelRatio: { type: Number, default: void 0 },
    animate: { type: Boolean, default: true }
  },
  setup(props, { attrs }) {
    const canvasRef = ref(null);
    let instance = null;
    onMounted(() => {
      if (!canvasRef.value) return;
      instance = new MeshMakerCore(canvasRef.value, { ...props });
    });
    onBeforeUnmount(() => {
      instance?.destroy();
      instance = null;
    });
    watch(() => props.preset, (v) => {
      if (instance && v) instance.setPreset(v);
    });
    watch(() => props.colors, (v) => {
      if (instance && v) instance.setColors(v);
    });
    watch(() => props.dotSize, (v) => {
      if (instance) instance.setDotSize(v);
    });
    watch(() => props.spacing, (v) => {
      if (instance) instance.setSpacing(v);
    });
    watch(() => props.hover, (v) => {
      if (instance) instance.setHover(v);
    });
    watch(() => props.underlay, (v) => {
      if (instance) instance.setUnderlay(v);
    });
    const wrapperStyle = { position: "relative", overflow: "hidden" };
    const canvasStyle = { position: "absolute", top: "0", left: "0", width: "100%", height: "100%", display: "block" };
    return () => h(
      "div",
      { class: attrs.class, id: attrs.id, style: { ...wrapperStyle, ...attrs.style } },
      [h("canvas", { ref: canvasRef, style: canvasStyle })]
    );
  }
});

// src/index.ts
import { getPreset, presetNames } from "@rising-company/mesh-maker-core";
export {
  MeshMaker,
  getPreset,
  presetNames
};
//# sourceMappingURL=index.js.map