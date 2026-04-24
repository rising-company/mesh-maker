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
uniform float u_void_radius;

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

// --- Gravitational attraction (black hole) ---
vec2 warpUV(vec2 uv) {
  float aspectRatio = u_resolution.x / u_resolution.y;
  vec2 aspect = vec2(aspectRatio, 1.0);

  // Vector from mouse to pixel (outward)
  vec2 delta = (uv - u_mouse) * aspect;
  float dist = length(delta);

  float influence = smoothstep(u_hover_radius, 0.0, dist);
  if (influence <= 0.001) return uv;

  vec2 dir = delta / max(dist, 0.001);

  // Hermite smoothstep — strong center pull, gentle edges
  float pull = influence * influence * (3.0 - 2.0 * influence);

  // Warp UV outward — dots appear attracted toward mouse
  vec2 attraction = (dir / aspect) * pull * u_hover_strength * 0.02;

  // Rotating ellipse distortion — small ellipse orbits near the void
  float angle = u_time * 0.6;
  float ca = cos(angle);
  float sa = sin(angle);
  vec2 rd = vec2(ca * delta.x - sa * delta.y, sa * delta.x + ca * delta.y);
  rd *= vec2(1.0, 2.5); // flatten into ellipse
  float eDist = length(rd);
  float ellipseInfluence = smoothstep(u_void_radius * 5.0, 0.0, eDist);
  vec2 ellipseDisp = (dir / aspect) * ellipseInfluence * u_hover_strength * 0.012;

  // Subtle organic noise for liveliness
  float t = u_time * 0.03;
  float nx = snoise(vec3(uv * 2.5, t));
  float ny = snoise(vec3(uv * 2.5 + 50.0, t));
  vec2 noise = vec2(nx, ny) * 0.003 * influence;

  return uv + attraction + noise + ellipseDisp;
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
  float voidMask = 1.0;
  float mouseProximity = 0.0;
  if (u_hover > 0.5 && u_mouse.x >= 0.0) {
    warpedUV = warpUV(uv);

    float ar = u_resolution.x / u_resolution.y;
    vec2 d = (uv - u_mouse) * vec2(ar, 1.0);
    float md = length(d);

    // Black hole void — circular clear zone at cursor
    voidMask = smoothstep(u_void_radius * 0.6, u_void_radius, md);

    // Color intensifies near mouse (like Stitch)
    mouseProximity = smoothstep(u_hover_radius, 0.0, md);
  }

  // Compute dot grid mask at warped position
  float dotMask = dotGrid(warpedUV);

  // Gradient color — intensified near mouse cursor
  vec3 gradientColor = u_underlay * computeGradient(uv) * (1.0 + mouseProximity * 3.0);

  // Base dot + gradient coloring
  vec3 baseDot = u_dot_color * u_dot_opacity;
  vec3 coloredDot = gradientColor + baseDot;

  vec3 finalColor = coloredDot * dotMask * voidMask;

  ${fragOut} = vec4(finalColor, 1.0);
}
`
}
