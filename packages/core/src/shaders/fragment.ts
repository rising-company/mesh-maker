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

// --- Stage 1: Animated glow underlay ---
vec3 computeGlow(vec2 uv) {
  float t = u_time * u_glow_speed;
  float n1 = snoise(vec3(uv * 1.5, t * 0.5)) * 0.5 + 0.5;
  float n2 = snoise(vec3(uv * 2.5 + 10.0, t * 0.3)) * 0.5 + 0.5;
  float n3 = snoise(vec3(uv * 0.8 + 20.0, t * 0.7)) * 0.5 + 0.5;

  // Blend between glow colors using noise
  vec3 color = u_glow_color_0;
  float count = u_glow_color_count;
  if (count > 1.0) color = mix(color, u_glow_color_1, smoothstep(0.2, 0.8, n1));
  if (count > 2.0) color = mix(color, u_glow_color_2, smoothstep(0.3, 0.7, n2) * 0.6);
  if (count > 3.0) color = mix(color, u_glow_color_3, smoothstep(0.4, 0.9, n3) * 0.4);

  // Position-based fade: glow concentrated toward bottom-left
  float positionFade = smoothstep(1.4, 0.0, length(uv - vec2(0.2, 1.2)));
  return color * u_glow_intensity * positionFade;
}

// --- Stage 2: Noise warp UV distortion ---
vec2 warpUV(vec2 uv) {
  float aspectRatio = u_resolution.x / u_resolution.y;
  vec2 aspect = vec2(aspectRatio, 1.0);
  vec2 mouse = u_mouse;

  float dist = distance(uv * aspect, mouse * aspect);
  float radius = u_hover_radius;
  float influence = smoothstep(radius, 0.0, dist);

  if (influence <= 0.001) return uv;

  // BCC noise-based warp
  vec2 st = (uv - mouse) * aspect * 12.0 * 0.46;
  vec4 noise = bcc_noise(vec3(st * 0.7, u_time * 0.02));
  vec2 offset = noise.xy / 7.0 + 0.5;

  return mix(uv, offset, influence * u_hover_strength);
}

// --- Stage 3: Dot grid ---
float dotGrid(vec2 uv) {
  // Convert to pixel-space grid
  vec2 cellSize = vec2(u_spacing) / u_resolution;
  vec2 cell = fract(uv / cellSize);
  vec2 center = cell - 0.5;

  // Circle SDF
  float dotRadius = u_dot_size / u_spacing;
  float d = length(center) - dotRadius;

  // Anti-aliased edge (1 pixel smoothing)
  float pixelSize = 1.0 / min(u_resolution.x, u_resolution.y) / cellSize.x;
  return 1.0 - smoothstep(-pixelSize, pixelSize, d);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y; // flip Y so (0,0) is top-left

  // Stage 1: Glow underlay
  vec3 glow = u_underlay * computeGlow(uv);

  // Stage 2: Warp UV for dot grid (only when hover is on and mouse is on-screen)
  vec2 dotUV = uv;
  if (u_hover > 0.5 && u_mouse.x >= 0.0) {
    dotUV = warpUV(uv);
  }

  // Stage 3: Dot grid
  float dot = dotGrid(dotUV);

  // Stage 4: Composite
  vec3 dotCol = u_dot_color * u_dot_opacity * dot;
  vec3 finalColor = glow + dotCol;

  ${fragOut} = vec4(finalColor, 1.0);
}
`
}
