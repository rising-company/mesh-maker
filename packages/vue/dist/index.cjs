"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  MeshMaker: () => MeshMaker,
  getPreset: () => import_mesh_maker_core2.getPreset,
  presetNames: () => import_mesh_maker_core2.presetNames
});
module.exports = __toCommonJS(index_exports);

// src/MeshMaker.ts
var import_vue = require("vue");
var import_mesh_maker_core = require("@rising-company/mesh-maker-core");
var MeshMaker = (0, import_vue.defineComponent)({
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
    const canvasRef = (0, import_vue.ref)(null);
    let instance = null;
    (0, import_vue.onMounted)(() => {
      if (!canvasRef.value) return;
      instance = new import_mesh_maker_core.MeshMaker(canvasRef.value, { ...props });
    });
    (0, import_vue.onBeforeUnmount)(() => {
      instance?.destroy();
      instance = null;
    });
    (0, import_vue.watch)(() => props.preset, (v) => {
      if (instance && v) instance.setPreset(v);
    });
    (0, import_vue.watch)(() => props.colors, (v) => {
      if (instance && v) instance.setColors(v);
    });
    (0, import_vue.watch)(() => props.dotSize, (v) => {
      if (instance) instance.setDotSize(v);
    });
    (0, import_vue.watch)(() => props.spacing, (v) => {
      if (instance) instance.setSpacing(v);
    });
    (0, import_vue.watch)(() => props.hover, (v) => {
      if (instance) instance.setHover(v);
    });
    (0, import_vue.watch)(() => props.underlay, (v) => {
      if (instance) instance.setUnderlay(v);
    });
    const wrapperStyle = { position: "relative", overflow: "hidden" };
    const canvasStyle = { position: "absolute", top: "0", left: "0", width: "100%", height: "100%", display: "block" };
    return () => (0, import_vue.h)(
      "div",
      { class: attrs.class, id: attrs.id, style: { ...wrapperStyle, ...attrs.style } },
      [(0, import_vue.h)("canvas", { ref: canvasRef, style: canvasStyle })]
    );
  }
});

// src/index.ts
var import_mesh_maker_core2 = require("@rising-company/mesh-maker-core");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MeshMaker,
  getPreset,
  presetNames
});
//# sourceMappingURL=index.cjs.map