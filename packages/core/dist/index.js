// src/renderer/webgl-context.ts
function createWebGLContext(canvas) {
  let gl = null;
  let isWebGL2 = false;
  gl = canvas.getContext("webgl2");
  if (gl) {
    isWebGL2 = true;
    return { gl, isWebGL2 };
  }
  gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (!gl) {
    throw new Error(
      "WebGL is not supported in this browser. MeshMaker requires WebGL to render."
    );
  }
  return { gl, isWebGL2 };
}

// src/renderer/shader-compiler.ts
function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("Failed to create shader object");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compilation failed:
${info}`);
  }
  return shader;
}
function createProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    throw new Error("Failed to create program object");
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    throw new Error(`Program linking failed:
${info}`);
  }
  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  return program;
}

// src/renderer/animation-loop.ts
var AnimationLoop = class {
  constructor(onFrame, fps) {
    this._rafId = null;
    this._lastFrameTime = 0;
    this._startTime = 0;
    this._playing = false;
    this._tick = () => {
      if (!this._playing) return;
      this._rafId = requestAnimationFrame(this._loop);
    };
    this._loop = (now) => {
      if (!this._playing) return;
      const elapsed = now - this._lastFrameTime;
      if (elapsed >= this._interval) {
        this._lastFrameTime = now - elapsed % this._interval;
        const timeInSeconds = (now - this._startTime) / 1e3;
        this._onFrame(timeInSeconds);
      }
      this._tick();
    };
    this._onFrame = onFrame;
    this._fps = fps;
    this._interval = 1e3 / fps;
  }
  get isPlaying() {
    return this._playing;
  }
  setFps(fps) {
    this._fps = fps;
    this._interval = 1e3 / fps;
  }
  play() {
    if (this._playing) return;
    this._playing = true;
    this._lastFrameTime = performance.now();
    if (this._startTime === 0) {
      this._startTime = this._lastFrameTime;
    }
    this._tick();
  }
  pause() {
    this._playing = false;
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }
  stop() {
    this.pause();
    this._startTime = 0;
  }
};

// src/shaders/vertex.ts
function buildVertexShader(isWebGL2) {
  if (isWebGL2) {
    return (
      /* glsl */
      `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`
    );
  }
  return (
    /* glsl */
    `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`
  );
}

// src/shaders/noise.ts
var noiseGLSL = (
  /* glsl */
  `
  //
  // 3D Simplex noise \u2014 Ashima Arts / stegu (MIT)
  //
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  //
  // BCC noise with derivatives \u2014 for UV warping
  // Adapted from OpenSimplex2 by KdotJPG
  //
  vec4 bcc_permute(vec4 t) { return t * (t * 34.0 + 133.0); }

  vec3 bcc_grad(float hash) {
    vec3 cube = mod(floor(hash / vec3(1.0, 2.0, 4.0)), 2.0) * 2.0 - 1.0;
    vec3 cuboct = cube;
    cuboct.x *= 1.0 - step(0.0, floor(hash / 16.0));
    cuboct.y *= 1.0 - step(0.0, floor(hash / 16.0) - 1.0);
    cuboct.z *= 1.0 - (1.0 - step(0.0, floor(hash / 16.0)) - step(0.0, floor(hash / 16.0) - 1.0));
    float type = mod(floor(hash / 8.0), 2.0);
    vec3 rhomb = (1.0 - type) * cube + type * (cuboct + cross(cube, cuboct));
    return (cuboct * 1.22474487139 + rhomb) * (1.0 - 0.042942436724648037 * type) * 3.5946317686139184;
  }

  vec4 bcc_noise_part(vec3 X) {
    vec3 b = floor(X);
    vec4 i4 = vec4(X - b, 2.5);
    vec3 v1 = b + floor(dot(i4, vec4(.25)));
    vec3 v2 = b + vec3(1,0,0) + vec3(-1,1,1) * floor(dot(i4, vec4(-.25,.25,.25,.35)));
    vec3 v3 = b + vec3(0,1,0) + vec3(1,-1,1) * floor(dot(i4, vec4(.25,-.25,.25,.35)));
    vec3 v4 = b + vec3(0,0,1) + vec3(1,1,-1) * floor(dot(i4, vec4(.25,.25,-.25,.35)));
    vec4 hashes = bcc_permute(mod(vec4(v1.x, v2.x, v3.x, v4.x), 289.0));
    hashes = bcc_permute(mod(hashes + vec4(v1.y, v2.y, v3.y, v4.y), 289.0));
    hashes = mod(bcc_permute(mod(hashes + vec4(v1.z, v2.z, v3.z, v4.z), 289.0)), 48.0);
    vec3 d1 = X - v1; vec3 d2 = X - v2; vec3 d3 = X - v3; vec3 d4 = X - v4;
    vec4 a = max(0.75 - vec4(dot(d1,d1), dot(d2,d2), dot(d3,d3), dot(d4,d4)), 0.0);
    vec4 aa = a * a; vec4 aaaa = aa * aa;
    vec3 g1 = bcc_grad(hashes.x); vec3 g2 = bcc_grad(hashes.y);
    vec3 g3 = bcc_grad(hashes.z); vec3 g4 = bcc_grad(hashes.w);
    vec4 extrapolations = vec4(dot(d1,g1), dot(d2,g2), dot(d3,g3), dot(d4,g4));
    vec3 derivative = -8.0 * mat4x3(d1,d2,d3,d4) * (aa * a * extrapolations)
      + mat4x3(g1,g2,g3,g4) * aaaa;
    return vec4(derivative, dot(aaaa, extrapolations));
  }

  vec4 bcc_noise(vec3 X) {
    mat3 orthonormalMap = mat3(
      0.788675134594813, -0.211324865405187, -0.577350269189626,
      -0.211324865405187, 0.788675134594813, -0.577350269189626,
      0.577350269189626, 0.577350269189626, 0.577350269189626);
    X = orthonormalMap * X;
    vec4 result = bcc_noise_part(X) + bcc_noise_part(X + 144.5);
    return vec4(result.xyz * orthonormalMap, result.w);
  }
`
);

// src/shaders/fragment.ts
function buildFragmentShader(isWebGL2) {
  const prefix = isWebGL2 ? `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
` : `
precision highp float;
varying vec2 v_uv;
`;
  const fragOut = isWebGL2 ? "fragColor" : "gl_FragColor";
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

// --- Noise warp UV distortion (wide spread) ---
vec2 warpUV(vec2 uv) {
  float aspectRatio = u_resolution.x / u_resolution.y;
  vec2 aspect = vec2(aspectRatio, 1.0);
  vec2 mouse = u_mouse;

  float dist = distance(uv * aspect, mouse * aspect);

  // Two-zone influence: strong near cursor, subtle far out
  float innerRadius = u_hover_radius;
  float outerRadius = u_hover_radius * 4.0; // spread extends much further
  float innerInfluence = smoothstep(innerRadius, 0.0, dist);
  float outerInfluence = smoothstep(outerRadius, innerRadius * 0.5, dist) * 0.15;
  float influence = innerInfluence + outerInfluence;

  if (influence <= 0.001) return uv;

  // BCC noise-based warp
  vec2 st = (uv - mouse) * aspect * 12.0 * 0.46;
  vec4 noise = bcc_noise(vec3(st * 0.7, u_time * 0.02));
  vec2 offset = noise.xy / 7.0 + 0.5;

  return mix(uv, offset, influence * u_hover_strength);
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
`;
}

// src/types.ts
var DEFAULT_OPTIONS = {
  dotSize: 1.5,
  spacing: 20,
  dotColor: "#ffffff",
  dotOpacity: 0.15,
  hover: true,
  hoverRadius: 0.2,
  hoverStrength: 0.5,
  hoverMomentum: 0.12,
  underlay: true,
  glowIntensity: 0.8,
  glowSpeed: 0.25,
  fps: 60,
  pixelRatio: typeof window !== "undefined" ? window.devicePixelRatio : 1,
  animate: true
};

// src/presets/stitch.ts
var stitch = {
  name: "stitch",
  colors: ["#6056e0", "#8855dd", "#4090f4", "#40d9c8"],
  defaults: { glowIntensity: 0.9, glowSpeed: 0.2 }
};

// src/presets/midnight.ts
var midnight = {
  name: "midnight",
  colors: ["#1a1a4e", "#2d2d7f", "#4a4a8a", "#8888b0"],
  defaults: { glowIntensity: 0.4, dotOpacity: 0.2 }
};

// src/presets/neon.ts
var neon = {
  name: "neon",
  colors: ["#ff1493", "#00bfff", "#39ff14", "#ff6ec7"],
  defaults: { glowIntensity: 0.8, dotOpacity: 0.4 }
};

// src/presets/aurora.ts
var aurora = {
  name: "aurora",
  colors: ["#00ff87", "#00d4ff", "#b400ff", "#60efff"]
};

// src/presets/ember.ts
var ember = {
  name: "ember",
  colors: ["#ff4500", "#ff8c00", "#ffd700", "#cc3300"],
  defaults: { glowIntensity: 0.7 }
};

// src/presets/ocean.ts
var ocean = {
  name: "ocean",
  colors: ["#003366", "#006994", "#00a4a6", "#66cccc"],
  defaults: { glowIntensity: 0.5 }
};

// src/presets/index.ts
var presets = {
  stitch,
  midnight,
  neon,
  aurora,
  ember,
  ocean
};
var presetNames = ["stitch", "midnight", "neon", "aurora", "ember", "ocean"];
function getPreset(name) {
  const preset = presets[name];
  if (!preset) {
    throw new Error(`Unknown preset: "${name}". Available: ${presetNames.join(", ")}`);
  }
  return preset;
}

// src/mesh-maker.ts
function resolveOptions(opts) {
  const presetName = opts.preset ?? "stitch";
  const preset = getPreset(presetName);
  const pd = preset.defaults ?? {};
  return {
    preset: presetName,
    colors: opts.colors ?? preset.colors,
    dotSize: opts.dotSize ?? pd.dotSize ?? DEFAULT_OPTIONS.dotSize,
    spacing: opts.spacing ?? pd.spacing ?? DEFAULT_OPTIONS.spacing,
    dotColor: opts.dotColor ?? pd.dotColor ?? DEFAULT_OPTIONS.dotColor,
    dotOpacity: opts.dotOpacity ?? pd.dotOpacity ?? DEFAULT_OPTIONS.dotOpacity,
    hover: opts.hover ?? pd.hover ?? DEFAULT_OPTIONS.hover,
    hoverRadius: opts.hoverRadius ?? pd.hoverRadius ?? DEFAULT_OPTIONS.hoverRadius,
    hoverStrength: opts.hoverStrength ?? pd.hoverStrength ?? DEFAULT_OPTIONS.hoverStrength,
    hoverMomentum: opts.hoverMomentum ?? pd.hoverMomentum ?? DEFAULT_OPTIONS.hoverMomentum,
    underlay: opts.underlay ?? pd.underlay ?? DEFAULT_OPTIONS.underlay,
    glowIntensity: opts.glowIntensity ?? pd.glowIntensity ?? DEFAULT_OPTIONS.glowIntensity,
    glowSpeed: opts.glowSpeed ?? pd.glowSpeed ?? DEFAULT_OPTIONS.glowSpeed,
    fps: opts.fps ?? pd.fps ?? DEFAULT_OPTIONS.fps,
    pixelRatio: opts.pixelRatio ?? pd.pixelRatio ?? DEFAULT_OPTIONS.pixelRatio,
    animate: opts.animate ?? pd.animate ?? DEFAULT_OPTIONS.animate
  };
}
function hexToRGB(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}
var MeshMaker = class {
  constructor(canvas, options = {}) {
    this._resizeObserver = null;
    this._uniforms = {};
    this._positionBuffer = null;
    this._mouseTarget = [-1, -1];
    this._mouseCurrent = [-1, -1];
    this._onMouseMove = null;
    this._onTouchMove = null;
    this._onMouseLeave = null;
    this._canvas = canvas;
    this._options = resolveOptions(options);
    const { gl, isWebGL2 } = createWebGLContext(canvas);
    this._gl = gl;
    this._isWebGL2 = isWebGL2;
    const vertexSource = buildVertexShader(isWebGL2);
    const fragmentSource = buildFragmentShader(isWebGL2);
    this._program = createProgram(gl, vertexSource, fragmentSource);
    gl.useProgram(this._program);
    this._setupQuad();
    this._cacheUniforms();
    this._uploadStaticUniforms();
    if (this._options.hover) {
      this._attachMouseListeners();
    }
    this._resizeObserver = new ResizeObserver(() => this._handleResize());
    this._resizeObserver.observe(canvas);
    this._handleResize();
    this._loop = new AnimationLoop(
      (time) => this._render(time),
      this._options.fps
    );
    if (this._options.animate) {
      this.play();
    } else {
      this._render(0);
    }
  }
  get isPlaying() {
    return this._loop.isPlaying;
  }
  get currentPreset() {
    return this._options.preset;
  }
  play() {
    this._loop.play();
  }
  pause() {
    this._loop.pause();
  }
  destroy() {
    this._loop.stop();
    this._detachMouseListeners();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    const gl = this._gl;
    if (this._positionBuffer) {
      gl.deleteBuffer(this._positionBuffer);
      this._positionBuffer = null;
    }
    gl.deleteProgram(this._program);
  }
  resize() {
    this._handleResize();
  }
  setPreset(name) {
    this._options = resolveOptions({ ...this._options, preset: name, colors: void 0 });
    this._uploadStaticUniforms();
  }
  setColors(colors) {
    this._options.colors = colors;
    this._uploadColorUniforms();
  }
  setDotSize(size) {
    this._options.dotSize = size;
  }
  setSpacing(spacing) {
    this._options.spacing = spacing;
  }
  setHover(enabled) {
    this._options.hover = enabled;
    if (enabled) {
      this._attachMouseListeners();
    } else {
      this._detachMouseListeners();
      this._mouseTarget = [-1, -1];
      this._mouseCurrent = [-1, -1];
    }
  }
  setUnderlay(enabled) {
    this._options.underlay = enabled;
  }
  _setupQuad() {
    const gl = this._gl;
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    this._positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const posAttr = gl.getAttribLocation(this._program, "a_position");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);
  }
  _cacheUniforms() {
    const gl = this._gl;
    const names = [
      "u_time",
      "u_resolution",
      "u_mouse",
      "u_dot_size",
      "u_spacing",
      "u_dot_color",
      "u_dot_opacity",
      "u_hover",
      "u_hover_radius",
      "u_hover_strength",
      "u_underlay",
      "u_glow_intensity",
      "u_glow_speed",
      "u_glow_color_0",
      "u_glow_color_1",
      "u_glow_color_2",
      "u_glow_color_3",
      "u_glow_color_count"
    ];
    for (const name of names) {
      this._uniforms[name] = gl.getUniformLocation(this._program, name);
    }
  }
  _uploadStaticUniforms() {
    const gl = this._gl;
    const u = this._uniforms;
    const o = this._options;
    const [dr, dg, db] = hexToRGB(o.dotColor);
    gl.uniform3f(u.u_dot_color, dr, dg, db);
    gl.uniform1f(u.u_dot_opacity, o.dotOpacity);
    gl.uniform1f(u.u_hover_radius, o.hoverRadius);
    gl.uniform1f(u.u_hover_strength, o.hoverStrength);
    gl.uniform1f(u.u_glow_intensity, o.glowIntensity);
    gl.uniform1f(u.u_glow_speed, o.glowSpeed);
    this._uploadColorUniforms();
  }
  _uploadColorUniforms() {
    const gl = this._gl;
    const u = this._uniforms;
    const colors = this._options.colors;
    const padded = [...colors];
    while (padded.length < 4) padded.push(padded[padded.length - 1]);
    gl.uniform3f(u.u_glow_color_0, ...hexToRGB(padded[0]));
    gl.uniform3f(u.u_glow_color_1, ...hexToRGB(padded[1]));
    gl.uniform3f(u.u_glow_color_2, ...hexToRGB(padded[2]));
    gl.uniform3f(u.u_glow_color_3, ...hexToRGB(padded[3]));
    gl.uniform1f(u.u_glow_color_count, Math.min(colors.length, 4));
  }
  _attachMouseListeners() {
    if (this._onMouseMove) return;
    this._onMouseMove = (e) => {
      const rect = this._canvas.getBoundingClientRect();
      this._mouseTarget = [
        (e.clientX - rect.left) / rect.width,
        (e.clientY - rect.top) / rect.height
      ];
    };
    this._onTouchMove = (e) => {
      const rect = this._canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this._mouseTarget = [
        (touch.clientX - rect.left) / rect.width,
        (touch.clientY - rect.top) / rect.height
      ];
    };
    this._onMouseLeave = () => {
      this._mouseTarget = [-1, -1];
    };
    this._canvas.addEventListener("mousemove", this._onMouseMove);
    this._canvas.addEventListener("touchmove", this._onTouchMove);
    this._canvas.addEventListener("mouseleave", this._onMouseLeave);
  }
  _detachMouseListeners() {
    if (this._onMouseMove) {
      this._canvas.removeEventListener("mousemove", this._onMouseMove);
      this._onMouseMove = null;
    }
    if (this._onTouchMove) {
      this._canvas.removeEventListener("touchmove", this._onTouchMove);
      this._onTouchMove = null;
    }
    if (this._onMouseLeave) {
      this._canvas.removeEventListener("mouseleave", this._onMouseLeave);
      this._onMouseLeave = null;
    }
  }
  _handleResize() {
    const dpr = this._options.pixelRatio;
    const displayWidth = Math.round(this._canvas.clientWidth * dpr);
    const displayHeight = Math.round(this._canvas.clientHeight * dpr);
    if (this._canvas.width !== displayWidth || this._canvas.height !== displayHeight) {
      this._canvas.width = displayWidth;
      this._canvas.height = displayHeight;
      this._gl.viewport(0, 0, displayWidth, displayHeight);
    }
  }
  _render(time) {
    const gl = this._gl;
    const u = this._uniforms;
    const o = this._options;
    const momentum = 1 - o.hoverMomentum;
    if (this._mouseTarget[0] >= 0) {
      this._mouseCurrent[0] += (this._mouseTarget[0] - this._mouseCurrent[0]) * momentum;
      this._mouseCurrent[1] += (this._mouseTarget[1] - this._mouseCurrent[1]) * momentum;
    } else if (this._mouseCurrent[0] >= 0) {
      this._mouseCurrent[0] += (-1 - this._mouseCurrent[0]) * 0.05;
      this._mouseCurrent[1] += (-1 - this._mouseCurrent[1]) * 0.05;
      if (this._mouseCurrent[0] < -0.5) {
        this._mouseCurrent = [-1, -1];
      }
    }
    gl.uniform1f(u.u_time, time);
    gl.uniform2f(u.u_resolution, this._canvas.width, this._canvas.height);
    gl.uniform2f(u.u_mouse, this._mouseCurrent[0], this._mouseCurrent[1]);
    gl.uniform1f(u.u_dot_size, o.dotSize);
    gl.uniform1f(u.u_spacing, o.spacing);
    gl.uniform1f(u.u_hover, o.hover ? 1 : 0);
    gl.uniform1f(u.u_underlay, o.underlay ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
};
export {
  MeshMaker,
  getPreset,
  presetNames,
  resolveOptions
};
//# sourceMappingURL=index.js.map