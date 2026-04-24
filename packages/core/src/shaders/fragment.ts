import { noiseGLSL } from './noise'

export function buildFragmentShader(isWebGL2: boolean): string {
  const prefix = isWebGL2
    ? `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
`
    : `
precision highp float;
varying vec2 v_uv;
`

  const fragOut = isWebGL2 ? 'fragColor' : 'gl_FragColor'

  return `${prefix}

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

// Dot grid
uniform float u_dot_size;
uniform float u_spacing;
uniform vec3 u_dot_color;
uniform float u_dot_opacity;

// Hover
uniform float u_hover;
uniform float u_hover_radius;
uniform float u_hover_strength;

// Underlay
uniform float u_underlay;
uniform float u_glow_intensity;
uniform float u_glow_speed;
uniform vec3 u_glow_color_0;
uniform vec3 u_glow_color_1;
uniform vec3 u_glow_color_2;
uniform vec3 u_glow_color_3;
uniform float u_glow_color_count;

${noiseGLSL}

// --- Animated gradient (aurora) ---
vec3 computeGradient(vec2 uv) {
  float t = u_time * u_glow_speed;

  // Multiple noise layers for organic color blending
  float n1 = snoise(vec3(uv * 1.2 + 3.0, t * 0.4)) * 0.5 + 0.5;
  float n2 = snoise(vec3(uv * 2.0 + 10.0, t * 0.25)) * 0.5 + 0.5;
  float n3 = snoise(vec3(uv * 0.7 + 20.0, t * 0.6)) * 0.5 + 0.5;

  // Blend colors using noise
  vec3 color = u_glow_color_0;
  float count = u_glow_color_count;
  if (count > 1.0) color = mix(color, u_glow_color_1, smoothstep(0.15, 0.85, n1));
  if (count > 2.0) color = mix(color, u_glow_color_2, smoothstep(0.2, 0.8, n2) * 0.7);
  if (count > 3.0) color = mix(color, u_glow_color_3, smoothstep(0.3, 0.9, n3) * 0.5);

  // Shape the gradient: concentrated in bottom half with organic edges
  // Use noise to create flowing, aurora-like boundary
  float boundary = snoise(vec3(uv.x * 3.0, uv.x * 0.5 + t * 0.3, t * 0.2)) * 0.15;
  float gradientMask = smoothstep(0.15 + boundary, 0.65 + boundary, uv.y);

  // Additional horizontal variation
  float hVariation = snoise(vec3(uv.x * 2.0, t * 0.15, 0.0)) * 0.1;
  gradientMask *= smoothstep(-0.2 + hVariation, 0.8 + hVariation, 1.0 - abs(uv.x - 0.4) * 1.2);

  return color * u_glow_intensity * gradientMask;
}

// --- Noise warp UV distortion ---
vec2 warpUV(vec2 uv) {
  float aspectRatio = u_resolution.x / u_resolution.y;
  vec2 aspect = vec2(aspectRatio, 1.0);
  vec2 mouse = u_mouse;

  float dist = distance(uv * aspect, mouse * aspect);

  // Two-zone influence: focused near cursor, gentle ripple further out
  float innerRadius = u_hover_radius;
  float outerRadius = u_hover_radius * 2.5;
  float innerInfluence = smoothstep(innerRadius, 0.0, dist);
  float outerInfluence = smoothstep(outerRadius, innerRadius * 0.8, dist) * 0.06;
  float influence = innerInfluence + outerInfluence;

  if (influence <= 0.001) return uv;

  // BCC noise produces smooth directional offset (not random scattering)
  vec2 st = (uv - mouse) * aspect * 5.5;
  vec4 noise = bcc_noise(vec3(st, u_time * 0.03));

  // Use noise derivatives as a gentle displacement from original position
  vec2 displacement = noise.xy * 0.035 * u_hover_strength;

  return uv + displacement * influence;
}

// --- Dot grid mask ---
float dotGrid(vec2 uv) {
  vec2 cellSize = vec2(u_spacing) / u_resolution;
  vec2 cell = fract(uv / cellSize);
  vec2 center = cell - 0.5;

  float dotRadius = u_dot_size / u_spacing;
  float d = length(center) - dotRadius;

  // Anti-aliased edge
  float pixelSize = 1.0 / min(u_resolution.x, u_resolution.y) / cellSize.x;
  return 1.0 - smoothstep(-pixelSize, pixelSize, d);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y; // flip Y so (0,0) is top-left

  // Apply mouse warp to UV
  vec2 warpedUV = uv;
  if (u_hover > 0.5 && u_mouse.x >= 0.0) {
    warpedUV = warpUV(uv);
  }

  // Compute dot grid mask at warped position
  float dotMask = dotGrid(warpedUV);

  // Compute gradient color (at original UV for stable color, warped for pattern)
  vec3 gradientColor = u_underlay * computeGradient(uv);

  // The gradient is visible THROUGH the dots (halftone effect)
  // Dots that overlap bright gradient areas are colorful
  // Dots in dark areas show the base dot color at low opacity
  vec3 baseDot = u_dot_color * u_dot_opacity;
  vec3 coloredDot = gradientColor + baseDot;

  vec3 finalColor = coloredDot * dotMask;

  ${fragOut} = vec4(finalColor, 1.0);
}
`
}
