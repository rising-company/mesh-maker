// src/MeshMaker.tsx
import { useEffect, useRef } from "react";
import {
  MeshMaker as MeshMakerCore
} from "@rising-company/mesh-maker-core";
import { jsx } from "react/jsx-runtime";
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
  const canvasRef = useRef(null);
  const instanceRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const instance = new MeshMakerCore(canvas, {
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
  useEffect(() => {
    if (instanceRef.current && preset) instanceRef.current.setPreset(preset);
  }, [preset]);
  useEffect(() => {
    if (instanceRef.current && colors) instanceRef.current.setColors(colors);
  }, [colors]);
  useEffect(() => {
    if (instanceRef.current) instanceRef.current.setDotSize(dotSize);
  }, [dotSize]);
  useEffect(() => {
    if (instanceRef.current) instanceRef.current.setSpacing(spacing);
  }, [spacing]);
  useEffect(() => {
    if (instanceRef.current) instanceRef.current.setHover(hover);
  }, [hover]);
  useEffect(() => {
    if (instanceRef.current) instanceRef.current.setUnderlay(underlay);
  }, [underlay]);
  return /* @__PURE__ */ jsx("div", { className, style: { ...wrapperStyle, ...style }, id, children: /* @__PURE__ */ jsx("canvas", { ref: canvasRef, style: canvasStyle }) });
}

// src/index.ts
import { getPreset, presetNames } from "@rising-company/mesh-maker-core";
export {
  MeshMaker,
  getPreset,
  presetNames
};
//# sourceMappingURL=index.js.map