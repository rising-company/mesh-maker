(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const n of r)if(n.type==="childList")for(const u of n.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&o(u)}).observe(document,{childList:!0,subtree:!0});function s(r){const n={};return r.integrity&&(n.integrity=r.integrity),r.referrerPolicy&&(n.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?n.credentials="include":r.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function o(r){if(r.ep)return;r.ep=!0;const n=s(r);fetch(r.href,n)}})();function q(e){let t=null,s=!1;if(t=e.getContext("webgl2"),t)return s=!0,{gl:t,isWebGL2:s};if(t=e.getContext("webgl")||e.getContext("experimental-webgl"),!t)throw new Error("WebGL is not supported in this browser. MeshMaker requires WebGL to render.");return{gl:t,isWebGL2:s}}function R(e,t,s){const o=e.createShader(t);if(!o)throw new Error("Failed to create shader object");if(e.shaderSource(o,s),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS)){const r=e.getShaderInfoLog(o);throw e.deleteShader(o),new Error(`Shader compilation failed:
${r}`)}return o}function D(e,t,s){const o=R(e,e.VERTEX_SHADER,t),r=R(e,e.FRAGMENT_SHADER,s),n=e.createProgram();if(!n)throw e.deleteShader(o),e.deleteShader(r),new Error("Failed to create program object");if(e.attachShader(n,o),e.attachShader(n,r),e.linkProgram(n),!e.getProgramParameter(n,e.LINK_STATUS)){const u=e.getProgramInfoLog(n);throw e.deleteProgram(n),e.deleteShader(o),e.deleteShader(r),new Error(`Program linking failed:
${u}`)}return e.detachShader(n,o),e.detachShader(n,r),e.deleteShader(o),e.deleteShader(r),n}var G=class{constructor(e,t){this._rafId=null,this._lastFrameTime=0,this._startTime=0,this._playing=!1,this._tick=()=>{this._playing&&(this._rafId=requestAnimationFrame(this._loop))},this._loop=s=>{if(!this._playing)return;const o=s-this._lastFrameTime;if(o>=this._interval){this._lastFrameTime=s-o%this._interval;const r=(s-this._startTime)/1e3;this._onFrame(r)}this._tick()},this._onFrame=e,this._fps=t,this._interval=1e3/t}get isPlaying(){return this._playing}setFps(e){this._fps=e,this._interval=1e3/e}play(){this._playing||(this._playing=!0,this._lastFrameTime=performance.now(),this._startTime===0&&(this._startTime=this._lastFrameTime),this._tick())}pause(){this._playing=!1,this._rafId!==null&&(cancelAnimationFrame(this._rafId),this._rafId=null)}stop(){this.pause(),this._startTime=0}};function H(e){return e?`#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`:`
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`}var X=`
  //
  // 3D Simplex noise — Ashima Arts / stegu (MIT)
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
  // BCC noise with derivatives — for UV warping
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
`;function N(e){return`${e?`#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
`:`
precision highp float;
varying vec2 v_uv;
`}

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

${X}

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

  ${e?"fragColor":"gl_FragColor"} = vec4(finalColor, 1.0);
}
`}var l={dotSize:1.5,spacing:24,dotColor:"#ffffff",dotOpacity:.3,hover:!0,hoverRadius:.15,hoverStrength:.5,hoverMomentum:.1,underlay:!0,glowIntensity:.6,glowSpeed:.3,fps:60,pixelRatio:typeof window<"u"?window.devicePixelRatio:1,animate:!0},V={name:"stitch",colors:["#6040f0","#5856d6","#40c8c4","#42d9c8"]},W={name:"midnight",colors:["#1a1a4e","#2d2d7f","#4a4a8a","#8888b0"],defaults:{glowIntensity:.4,dotOpacity:.2}},j={name:"neon",colors:["#ff1493","#00bfff","#39ff14","#ff6ec7"],defaults:{glowIntensity:.8,dotOpacity:.4}},Y={name:"aurora",colors:["#00ff87","#00d4ff","#b400ff","#60efff"]},K={name:"ember",colors:["#ff4500","#ff8c00","#ffd700","#cc3300"],defaults:{glowIntensity:.7}},Q={name:"ocean",colors:["#003366","#006994","#00a4a6","#66cccc"],defaults:{glowIntensity:.5}},J={stitch:V,midnight:W,neon:j,aurora:Y,ember:K,ocean:Q},I=["stitch","midnight","neon","aurora","ember","ocean"];function Z(e){const t=J[e];if(!t)throw new Error(`Unknown preset: "${e}". Available: ${I.join(", ")}`);return t}function O(e){const t=e.preset??"stitch",s=Z(t),o=s.defaults??{};return{preset:t,colors:e.colors??s.colors,dotSize:e.dotSize??o.dotSize??l.dotSize,spacing:e.spacing??o.spacing??l.spacing,dotColor:e.dotColor??o.dotColor??l.dotColor,dotOpacity:e.dotOpacity??o.dotOpacity??l.dotOpacity,hover:e.hover??o.hover??l.hover,hoverRadius:e.hoverRadius??o.hoverRadius??l.hoverRadius,hoverStrength:e.hoverStrength??o.hoverStrength??l.hoverStrength,hoverMomentum:e.hoverMomentum??o.hoverMomentum??l.hoverMomentum,underlay:e.underlay??o.underlay??l.underlay,glowIntensity:e.glowIntensity??o.glowIntensity??l.glowIntensity,glowSpeed:e.glowSpeed??o.glowSpeed??l.glowSpeed,fps:e.fps??o.fps??l.fps,pixelRatio:e.pixelRatio??o.pixelRatio??l.pixelRatio,animate:e.animate??o.animate??l.animate}}function p(e){const t=parseInt(e.slice(1,3),16)/255,s=parseInt(e.slice(3,5),16)/255,o=parseInt(e.slice(5,7),16)/255;return[t,s,o]}var _=class{constructor(e,t={}){this._resizeObserver=null,this._uniforms={},this._positionBuffer=null,this._mouseTarget=[-1,-1],this._mouseCurrent=[-1,-1],this._onMouseMove=null,this._onTouchMove=null,this._onMouseLeave=null,this._canvas=e,this._options=O(t);const{gl:s,isWebGL2:o}=q(e);this._gl=s,this._isWebGL2=o;const r=H(o),n=N(o);this._program=D(s,r,n),s.useProgram(this._program),this._setupQuad(),this._cacheUniforms(),this._uploadStaticUniforms(),this._options.hover&&this._attachMouseListeners(),this._resizeObserver=new ResizeObserver(()=>this._handleResize()),this._resizeObserver.observe(e),this._handleResize(),this._loop=new G(u=>this._render(u),this._options.fps),this._options.animate?this.play():this._render(0)}get isPlaying(){return this._loop.isPlaying}get currentPreset(){return this._options.preset}play(){this._loop.play()}pause(){this._loop.pause()}destroy(){this._loop.stop(),this._detachMouseListeners(),this._resizeObserver&&(this._resizeObserver.disconnect(),this._resizeObserver=null);const e=this._gl;this._positionBuffer&&(e.deleteBuffer(this._positionBuffer),this._positionBuffer=null),e.deleteProgram(this._program)}resize(){this._handleResize()}setPreset(e){this._options=O({...this._options,preset:e,colors:void 0}),this._uploadStaticUniforms()}setColors(e){this._options.colors=e,this._uploadColorUniforms()}setDotSize(e){this._options.dotSize=e}setSpacing(e){this._options.spacing=e}setHover(e){this._options.hover=e,e?this._attachMouseListeners():(this._detachMouseListeners(),this._mouseTarget=[-1,-1],this._mouseCurrent=[-1,-1])}setUnderlay(e){this._options.underlay=e}_setupQuad(){const e=this._gl,t=new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]);this._positionBuffer=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,this._positionBuffer),e.bufferData(e.ARRAY_BUFFER,t,e.STATIC_DRAW);const s=e.getAttribLocation(this._program,"a_position");e.enableVertexAttribArray(s),e.vertexAttribPointer(s,2,e.FLOAT,!1,0,0)}_cacheUniforms(){const e=this._gl,t=["u_time","u_resolution","u_mouse","u_dot_size","u_spacing","u_dot_color","u_dot_opacity","u_hover","u_hover_radius","u_hover_strength","u_underlay","u_glow_intensity","u_glow_speed","u_glow_color_0","u_glow_color_1","u_glow_color_2","u_glow_color_3","u_glow_color_count"];for(const s of t)this._uniforms[s]=e.getUniformLocation(this._program,s)}_uploadStaticUniforms(){const e=this._gl,t=this._uniforms,s=this._options,[o,r,n]=p(s.dotColor);e.uniform3f(t.u_dot_color,o,r,n),e.uniform1f(t.u_dot_opacity,s.dotOpacity),e.uniform1f(t.u_hover_radius,s.hoverRadius),e.uniform1f(t.u_hover_strength,s.hoverStrength),e.uniform1f(t.u_glow_intensity,s.glowIntensity),e.uniform1f(t.u_glow_speed,s.glowSpeed),this._uploadColorUniforms()}_uploadColorUniforms(){const e=this._gl,t=this._uniforms,s=this._options.colors,o=[...s];for(;o.length<4;)o.push(o[o.length-1]);e.uniform3f(t.u_glow_color_0,...p(o[0])),e.uniform3f(t.u_glow_color_1,...p(o[1])),e.uniform3f(t.u_glow_color_2,...p(o[2])),e.uniform3f(t.u_glow_color_3,...p(o[3])),e.uniform1f(t.u_glow_color_count,Math.min(s.length,4))}_attachMouseListeners(){this._onMouseMove||(this._onMouseMove=e=>{const t=this._canvas.getBoundingClientRect();this._mouseTarget=[(e.clientX-t.left)/t.width,(e.clientY-t.top)/t.height]},this._onTouchMove=e=>{const t=this._canvas.getBoundingClientRect(),s=e.touches[0];this._mouseTarget=[(s.clientX-t.left)/t.width,(s.clientY-t.top)/t.height]},this._onMouseLeave=()=>{this._mouseTarget=[-1,-1]},this._canvas.addEventListener("mousemove",this._onMouseMove),this._canvas.addEventListener("touchmove",this._onTouchMove),this._canvas.addEventListener("mouseleave",this._onMouseLeave))}_detachMouseListeners(){this._onMouseMove&&(this._canvas.removeEventListener("mousemove",this._onMouseMove),this._onMouseMove=null),this._onTouchMove&&(this._canvas.removeEventListener("touchmove",this._onTouchMove),this._onTouchMove=null),this._onMouseLeave&&(this._canvas.removeEventListener("mouseleave",this._onMouseLeave),this._onMouseLeave=null)}_handleResize(){const e=this._options.pixelRatio,t=Math.round(this._canvas.clientWidth*e),s=Math.round(this._canvas.clientHeight*e);(this._canvas.width!==t||this._canvas.height!==s)&&(this._canvas.width=t,this._canvas.height=s,this._gl.viewport(0,0,t,s))}_render(e){const t=this._gl,s=this._uniforms,o=this._options,r=1-o.hoverMomentum;this._mouseTarget[0]>=0?(this._mouseCurrent[0]+=(this._mouseTarget[0]-this._mouseCurrent[0])*r,this._mouseCurrent[1]+=(this._mouseTarget[1]-this._mouseCurrent[1])*r):this._mouseCurrent[0]>=0&&(this._mouseCurrent[0]+=(-1-this._mouseCurrent[0])*.05,this._mouseCurrent[1]+=(-1-this._mouseCurrent[1])*.05,this._mouseCurrent[0]<-.5&&(this._mouseCurrent=[-1,-1])),t.uniform1f(s.u_time,e),t.uniform2f(s.u_resolution,this._canvas.width,this._canvas.height),t.uniform2f(s.u_mouse,this._mouseCurrent[0],this._mouseCurrent[1]),t.uniform1f(s.u_dot_size,o.dotSize),t.uniform1f(s.u_spacing,o.spacing),t.uniform1f(s.u_hover,o.hover?1:0),t.uniform1f(s.u_underlay,o.underlay?1:0),t.drawArrays(t.TRIANGLES,0,6)}};function ee(e){e.innerHTML=`
    <div class="section section--hero">
      <canvas id="hero-canvas" style="position:absolute;inset:0;width:100%;height:100%;display:block;"></canvas>
      <div class="overlay">
        <h1>mesh-maker</h1>
        <p>Interactive WebGL dot mesh for the web</p>
      </div>
    </div>
  `;const t=e.querySelector("#hero-canvas");new _(t,{preset:"stitch"})}function te(e){e.innerHTML=`
    <div class="section section--showcase">
      <div class="showcase-grid">
        <div class="showcase-item">
          <canvas id="showcase-1" style="position:absolute;inset:0;width:100%;height:100%;display:block;"></canvas>
          <div class="showcase-label">stitch preset — hover enabled</div>
        </div>
        <div class="showcase-item">
          <canvas id="showcase-2" style="position:absolute;inset:0;width:100%;height:100%;display:block;"></canvas>
          <div class="showcase-label">ember preset — dots only</div>
        </div>
      </div>
    </div>
  `,new _(e.querySelector("#showcase-1"),{preset:"stitch"}),new _(e.querySelector("#showcase-2"),{preset:"ember",hover:!1})}function oe(e){let t="stitch",s=!0,o=!0,r=1.5,n=24,u=.3,m=.15,f=.5,g=.1,y=.6,b=.3,d="vanilla";e.innerHTML=`
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
  `;const $=e.querySelector("#playground-canvas"),v=new _($,{preset:t}),M=e.querySelector("#preset-buttons");for(const i of I){const a=document.createElement("button");a.className=`preset-btn${i===t?" active":""}`,a.textContent=i,a.onclick=()=>{t=i,v.setPreset(i),M.querySelectorAll(".preset-btn").forEach(c=>c.classList.remove("active")),a.classList.add("active"),h()},M.appendChild(a)}const w=e.querySelector("#toggle-hover");w.onclick=()=>{s=!s,v.setHover(s),w.textContent=s?"On":"Off",w.classList.toggle("active",s),h()};const x=e.querySelector("#toggle-underlay");x.onclick=()=>{o=!o,v.setUnderlay(o),x.textContent=o?"On":"Off",x.classList.toggle("active",o),h()};const F=[["dotSize",i=>{r=i,v.setDotSize(i)}],["spacing",i=>{n=i,v.setSpacing(i)}],["dotOpacity",i=>{u=i}],["hoverRadius",i=>{m=i}],["hoverStrength",i=>{f=i}],["hoverMomentum",i=>{g=i}],["glowIntensity",i=>{y=i}],["glowSpeed",i=>{b=i}]];for(const[i,a]of F){const c=e.querySelector(`#s-${i}`),B=e.querySelector(`#v-${i}`);c.oninput=()=>{const T=parseFloat(c.value);a(T),B.textContent=String(T),h()}}const z=e.querySelector("#code-tabs"),L=e.querySelector("#code-content"),U=["vanilla","react","vue","svelte"];for(const i of U){const a=document.createElement("button");a.className=`code-tab${i===d?" active":""}`,a.textContent=i.charAt(0).toUpperCase()+i.slice(1),a.onclick=()=>{d=i,z.querySelectorAll(".code-tab").forEach(c=>c.classList.remove("active")),a.classList.add("active"),h()},z.appendChild(a)}const S=e.querySelector("#copy-btn");S.onclick=()=>{navigator.clipboard.writeText(L.textContent||""),S.textContent="Copied!",setTimeout(()=>{S.textContent="Copy"},1500)};function k(){const i=[];return t!=="stitch"&&i.push(`  preset: '${t}',`),s||i.push("  hover: false,"),o||i.push("  underlay: false,"),r!==1.5&&i.push(`  dotSize: ${r},`),n!==24&&i.push(`  spacing: ${n},`),u!==.3&&i.push(`  dotOpacity: ${u},`),m!==.15&&i.push(`  hoverRadius: ${m},`),f!==.5&&i.push(`  hoverStrength: ${f},`),g!==.1&&i.push(`  hoverMomentum: ${g},`),y!==.6&&i.push(`  glowIntensity: ${y},`),b!==.3&&i.push(`  glowSpeed: ${b},`),i.length?`{
${i.join(`
`)}
}`:""}function h(){const i=k();let a="";if(d==="vanilla")a=`import { MeshMaker } from '@rising-company/mesh-maker-core'

const mesh = new MeshMaker(canvas${i?", "+i:""})`;else if(d==="react"){const c=i?`
`+i.slice(2,-2).replace(/,$/gm,""):"";a=`import { MeshMaker } from '@rising-company/mesh-maker-react'

<MeshMaker${c?c+`
`:" "}style={{ width: '100%', height: '100vh' }} />`}else if(d==="vue"){const c=i?`
`+i.slice(2,-2).replace(/,$/gm,"").replace(/(\w+):/g,":$1="):"";a=`<script setup>
import { MeshMaker } from '@rising-company/mesh-maker-vue'
<\/script>

<MeshMaker${c?c+`
`:" "}style="width:100%;height:100vh" />`}else if(d==="svelte"){const c=i?`
`+i.slice(2,-2).replace(/,$/gm,"").replace(/(\w+):/g,"$1="):"";a=`<script>
import { MeshMaker } from '@rising-company/mesh-maker-svelte'
<\/script>

<MeshMaker${c?c+`
`:" "}style="width:100%;height:100vh" />`}L.textContent=a}h()}const C=document.getElementById("app"),A=document.createElement("div"),P=document.createElement("div"),E=document.createElement("div");C.appendChild(A);C.appendChild(P);C.appendChild(E);ee(A);te(P);oe(E);
