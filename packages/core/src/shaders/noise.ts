export const noiseGLSL = /* glsl */ `
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
`
