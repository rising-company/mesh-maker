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

// src/MeshMaker.tsx
var import_react = require("react");
var import_mesh_maker_core = require("@rising-company/mesh-maker-core");
var import_jsx_runtime = require("react/jsx-runtime");
var wrapperStyle = { position: "relative", overflow: "hidden" };
var canvasStyle = { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "block" };
function MeshMaker({
  preset = "stitch",
  colors,
  dotSize = 1.5,
  spacing = 24,
  dotColor = "#ffffff",
  dotOpacity = 0.3,
  hover = true,
  hoverRadius = 0.15,
  hoverStrength = 0.5,
  hoverMomentum = 0.1,
  underlay = true,
  glowIntensity = 0.6,
  glowSpeed = 0.3,
  fps = 60,
  pixelRatio,
  animate = true,
  className,
  style,
  id
}) {
  const canvasRef = (0, import_react.useRef)(null);
  const instanceRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const instance = new import_mesh_maker_core.MeshMaker(canvas, {
      preset,
      colors,
      dotSize,
      spacing,
      dotColor,
      dotOpacity,
      hover,
      hoverRadius,
      hoverStrength,
      hoverMomentum,
      underlay,
      glowIntensity,
      glowSpeed,
      fps,
      pixelRatio,
      animate
    });
    instanceRef.current = instance;
    return () => {
      instance.destroy();
      instanceRef.current = null;
    };
  }, []);
  (0, import_react.useEffect)(() => {
    if (instanceRef.current && preset) instanceRef.current.setPreset(preset);
  }, [preset]);
  (0, import_react.useEffect)(() => {
    if (instanceRef.current && colors) instanceRef.current.setColors(colors);
  }, [colors]);
  (0, import_react.useEffect)(() => {
    if (instanceRef.current) instanceRef.current.setDotSize(dotSize);
  }, [dotSize]);
  (0, import_react.useEffect)(() => {
    if (instanceRef.current) instanceRef.current.setSpacing(spacing);
  }, [spacing]);
  (0, import_react.useEffect)(() => {
    if (instanceRef.current) instanceRef.current.setHover(hover);
  }, [hover]);
  (0, import_react.useEffect)(() => {
    if (instanceRef.current) instanceRef.current.setUnderlay(underlay);
  }, [underlay]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className, style: { ...wrapperStyle, ...style }, id, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", { ref: canvasRef, style: canvasStyle }) });
}

// src/index.ts
var import_mesh_maker_core2 = require("@rising-company/mesh-maker-core");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MeshMaker,
  getPreset,
  presetNames
});
//# sourceMappingURL=index.cjs.map