export const meshVertex=`#version 300 es
precision highp float;
layout(location=0) in vec3 position;
layout(location=1) in vec3 normal;
layout(location=2) in vec2 uv;
layout(location=3) in mat4 instanceMatrix;
uniform mat4 viewProjection;
uniform mat4 model;
uniform bool instanced;
out vec3 vPosition;
out vec3 vNormal;
out vec2 vUV;
flat out float vOrientation;
void main() {
  mat4 world = model;
  if (instanced) world = model * instanceMatrix;
  vec4 p = world * vec4(position, 1.0);
  vec4 clip = viewProjection * p;
  gl_Position = vec4(clip.xy, clip.z * 2.0 - clip.w, clip.w);
  mat3 m = mat3(world);
  vec3 a = cross(m[1], m[2]);
  float determinant = dot(m[0], a);
  vOrientation = determinant < 0.0 ? -1.0 : 1.0;
  mat3 cofactor = mat3(a, cross(m[2], m[0]), cross(m[0], m[1]));
  vNormal = determinant == 0.0 ? vec3(0.0) : cofactor * normal / determinant;
  vPosition = p.xyz;
  vUV = uv;
}`;export const meshFragment=`#version 300 es
precision highp float;
in vec3 vPosition;
in vec3 vNormal;
in vec2 vUV;
flat in float vOrientation;
uniform sampler2D image;
uniform sampler2D metallicRoughnessMap;
uniform sampler2D normalMap;
uniform sampler2D occlusionMap;
uniform sampler2D emissiveMap;
uniform sampler2D shadowMap;
uniform vec4 lighting[51];
uniform vec4 environment[10]; // SH0..8, then intensity, enabled, maxLod, unused
uniform sampler2D environmentMap;
uniform vec4 fog[2]; // color.rgb/mode(0 off,1 linear,2 exp2), near/far/density/0
uniform vec4 tint;
uniform vec4 surface; // metallic, roughness, normalScale, occlusionStrength
uniform vec4 emission; // emissive RGB, alphaCutoff
uniform ivec4 maps; // metallicRoughness, normal, occlusion, emissive
uniform bool pbr;
uniform int alphaMode;
uniform bool doubleSided;
uniform bool linearOutput;
uniform vec3 cameraPosition;
uniform mat4 shadowMatrix;
uniform vec4 shadowSettings; // enabled, receive, bias, texel size
out vec4 color;
const float PI = 3.141592653589793;
vec3 decodeSRGB(vec3 c) {
  return mix(c / 12.92, pow((max(c, vec3(0.0)) + .055) / 1.055, vec3(2.4)), step(vec3(.04045), c));
}
vec3 encodeSRGB(vec3 c) {
  c = max(c, vec3(0.0));
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - .055, step(vec3(.0031308), c));
}
vec2 equirectUV(vec3 d) {
  d = normalize(d);
  return vec2(atan(d.x, -d.z) * 0.15915494309 + 0.5, acos(clamp(d.y, -1.0, 1.0)) * 0.31830988618);
}
vec3 shIrradiance(vec3 n) {
  vec3 c = environment[0].rgb * 0.282095;
  c += environment[1].rgb * (0.488603 * n.y);
  c += environment[2].rgb * (0.488603 * n.z);
  c += environment[3].rgb * (0.488603 * n.x);
  c += environment[4].rgb * (1.092548 * n.x * n.y);
  c += environment[5].rgb * (1.092548 * n.y * n.z);
  c += environment[6].rgb * (0.315392 * (3.0 * n.z * n.z - 1.0));
  c += environment[7].rgb * (1.092548 * n.x * n.z);
  c += environment[8].rgb * (0.546274 * (n.x * n.x - n.y * n.y));
  return max(c, vec3(0.0));
}
// Karis' analytic split-sum approximation; avoids a BRDF lookup texture.
vec2 environmentBRDF(float nv, float rough) {
  vec4 c0 = vec4(-1.0, -0.0275, -0.572, 0.022);
  vec4 c1 = vec4(1.0, 0.0425, 1.04, -0.04);
  vec4 r = rough * c0 + c1;
  float a004 = min(r.x * r.x, exp2(-9.28 * nv)) * r.x + r.y;
  return vec2(-1.04, 1.04) * a004 + r.zw;
}
float shadowVisibility() {
  if (shadowSettings.x == 0.0 || shadowSettings.y == 0.0) return 1.0;
  vec4 p = shadowMatrix * vec4(vPosition, 1.0);
  vec3 projected = p.xyz / p.w;
  vec2 uv = projected.xy * .5 + .5;
  if (projected.z <= 0.0 || projected.z >= 1.0 || any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return 1.0;
  float result = 0.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    float depth = texture(shadowMap, uv + vec2(float(x), float(y)) * shadowSettings.w).r;
    result += projected.z - shadowSettings.z <= depth ? 1.0 : 0.0;
  }
  return result / 9.0;
}
vec3 brdf(vec3 base, float metallic, float roughness, vec3 n, vec3 v, vec3 l) {
  float nl = max(dot(n, l), 0.0);
  float nv = max(dot(n, v), .0001);
  vec3 h = (v + l) / max(length(v + l), .000001);
  float nh = max(dot(n, h), 0.0);
  float vh = max(dot(v, h), 0.0);
  float alpha = roughness * roughness;
  float a2 = alpha * alpha;
  float denominator = nh * nh * (a2 - 1.0) + 1.0;
  float d = a2 / max(PI * denominator * denominator, .000001);
  float k = (roughness + 1.0) * (roughness + 1.0) / 8.0;
  float g = nv / (nv * (1.0 - k) + k) * nl / (nl * (1.0 - k) + k);
  vec3 f0 = mix(vec3(.04), base, metallic);
  vec3 f = f0 + (1.0 - f0) * pow(1.0 - vh, 5.0);
  return ((1.0 - f) * (1.0 - metallic) * base / PI + d * g * f / max(4.0 * nv * nl, .0001)) * nl;
}
float attenuation(float distanceSquared, float range) {
  float factor = 1.0;
  if (range > 0.0) factor = pow(clamp(1.0 - pow(sqrt(distanceSquared) / range, 4.0), 0.0, 1.0), 2.0);
  return factor / max(distanceSquared, .01);
}
// rgb is premultiplied by opacity, so fog fades toward the fog color * opacity.
vec3 applyFog(vec3 rgb, float opacity) {
  float mode = fog[0].w;
  if (mode < 0.5) return rgb;
  float dist = length(vPosition - cameraPosition);
  float amount = clamp((dist - fog[1].x) / max(fog[1].y - fog[1].x, .000001), 0.0, 1.0);
  if (mode > 1.5) {
    float d = fog[1].z * dist;
    amount = 1.0 - exp(-d * d);
  }
  return mix(rgb, fog[0].rgb * opacity, amount);
}
void main() {
  vec4 texel = texture(image, vUV);
  float opacity = texel.a * tint.a;
  if (pbr) {
    if (alphaMode == 1 && opacity < emission.w) discard;
    if (alphaMode != 2) opacity = 1.0;
  }
  bool front = gl_FrontFacing == (vOrientation > 0.0);
  if (pbr && !doubleSided && !front) discard;
  vec3 n = vNormal / max(length(vNormal), .000001);
  if (pbr && !front) n = -n;
  if (pbr && maps.y != 0) {
    vec3 dp1 = dFdx(vPosition), dp2 = dFdy(vPosition);
    vec2 duv1 = dFdx(vUV), duv2 = dFdy(vUV);
    vec3 dp2perp = cross(dp2, n), dp1perp = cross(n, dp1);
    vec3 t = dp2perp * duv1.x + dp1perp * duv2.x;
    vec3 b = dp2perp * duv1.y + dp1perp * duv2.y;
    float inverseScale = inversesqrt(max(max(dot(t,t), dot(b,b)), .000001));
    vec3 sampled = texture(normalMap, vUV).xyz * 2.0 - 1.0;
    sampled.xy *= surface.z;
    n = normalize(mat3(t * inverseScale, b * inverseScale, n) * sampled);
  }
  float visibility = shadowVisibility();
  vec3 direction = lighting[0].xyz;
  vec3 l = direction / max(length(direction), .000001);
  vec3 result;
  vec3 base = texel.rgb * tint.rgb;
  if (pbr) {
    base = decodeSRGB(texel.rgb) * tint.rgb;
    vec4 mr = maps.x != 0 ? texture(metallicRoughnessMap, vUV) : vec4(1.0);
    float metallic = clamp(surface.x * mr.b, 0.0, 1.0);
    float roughness = clamp(surface.y * mr.g, .04, 1.0);
    float ao = maps.z != 0 ? mix(1.0, texture(occlusionMap, vUV).r, surface.w) : 1.0;
    vec3 view = cameraPosition - vPosition;
    vec3 v = view / max(length(view), .000001);
    result = max(lighting[1].w, 0.0) * base * (1.0 - metallic) * ao * (environment[9].y > 0.5 ? 0.0 : 1.0);
    if (environment[9].y > 0.5) {
      float nv = max(dot(n, v), .0001);
      vec2 ab = environmentBRDF(nv, roughness);
      vec3 specularColor = mix(vec3(.04), base, metallic) * ab.x + vec3(ab.y);
      vec3 radiance = textureLod(environmentMap, equirectUV(reflect(-v, n)), roughness * environment[9].z).rgb;
      vec3 diffuseLight = shIrradiance(n) * base * (1.0 - metallic) * max(vec3(1.0) - specularColor, vec3(0.0));
      result += (diffuseLight + radiance * specularColor) * ao * environment[9].x;
    }
    result += brdf(base, metallic, roughness, n, v, l) * lighting[1].rgb * max(lighting[0].w, 0.0) * visibility;
    for (int i = 0; i < 8; i++) {
      if (i >= int(lighting[2].x)) break;
      vec4 p = lighting[3 + i * 2], c = lighting[4 + i * 2];
      vec3 delta = p.xyz - vPosition;
      float d2 = dot(delta, delta);
      result += brdf(base, metallic, roughness, n, v, delta / max(sqrt(d2), .000001)) * c.rgb * c.w * attenuation(d2, p.w);
    }
    for (int i = 0; i < 8; i++) {
      if (i >= int(lighting[2].y)) break;
      vec4 p = lighting[19 + i * 4], c = lighting[20 + i * 4], d = lighting[21 + i * 4];
      vec3 delta = p.xyz - vPosition;
      float d2 = dot(delta, delta);
      vec3 sl = delta / max(sqrt(d2), .000001);
      float cone = smoothstep(d.w, lighting[22 + i * 4].x, dot(-sl, d.xyz));
      result += brdf(base, metallic, roughness, n, v, sl) * c.rgb * c.w * attenuation(d2, p.w) * cone;
    }
    result += emission.rgb * (maps.w != 0 ? decodeSRGB(texture(emissiveMap, vUV).rgb) : vec3(1.0));
    if (!linearOutput) result = encodeSRGB(result);
  } else {
    float directional = max(dot(vNormal, direction), 0.0) / max(length(vNormal) * length(direction), .000001);
    vec3 illumination = vec3(max(lighting[1].w, 0.0)) + lighting[1].rgb * (directional * max(lighting[0].w, 0.0) * visibility);
    for (int i = 0; i < 8; i++) {
      if (i >= int(lighting[2].x)) break;
      vec4 p = lighting[3 + i * 2], c = lighting[4 + i * 2];
      vec3 delta = p.xyz - vPosition;
      float d2 = dot(delta, delta);
      illumination += c.rgb * c.w * attenuation(d2,p.w) * max(dot(n, delta / max(sqrt(d2), .000001)),0.0);
    }
    for (int i = 0; i < 8; i++) {
      if (i >= int(lighting[2].y)) break;
      vec4 p = lighting[19 + i * 4], c = lighting[20 + i * 4], d = lighting[21 + i * 4];
      vec3 delta = p.xyz - vPosition;
      float d2 = dot(delta, delta);
      vec3 sl = delta / max(sqrt(d2), .000001);
      illumination += c.rgb * c.w * attenuation(d2,p.w) * smoothstep(d.w,lighting[22 + i * 4].x,dot(-sl,d.xyz)) * max(dot(n,sl),0.0);
    }
    result = base * illumination;
    if (linearOutput) result = decodeSRGB(result);
  }
  color = vec4(applyFog(result * opacity, opacity), opacity);
}`;export const shadowFragment=`#version 300 es
precision highp float;
in vec2 vUV;
flat in float vOrientation;
uniform bool doubleSided;
uniform sampler2D image;
uniform float alphaCutoff;
uniform float opacity;
uniform int alphaMode;
void main() {
  if (!doubleSided && gl_FrontFacing != (vOrientation > 0.0)) discard;
  float alpha = texture(image, vUV).a * opacity;
  if (alphaMode == 1 && alpha < alphaCutoff) discard;
  if (alphaMode == 2 && alpha <= 0.0) discard;
}`;export const postVertex=`#version 300 es
precision highp float;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;export const postFragment=`#version 300 es
precision highp float;
uniform sampler2D image;
uniform vec4 settings; // exposure, strength, threshold, radius
uniform bool aces;
out vec4 color;
vec3 sampleAt(ivec2 p) {
  return texelFetch(image, clamp(p, ivec2(0), textureSize(image, 0) - 1), 0).rgb;
}
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  vec3 result = sampleAt(p);
  if (settings.y > 0.0) {
    vec3 bloom = vec3(0.0);
    ivec2 size = textureSize(image, 0);
    int radius = int(floor(min(settings.w, float(max(size.x, size.y))) + .5));
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++)
      bloom += max(sampleAt(p + ivec2(x, y) * radius) - settings.z, vec3(0.0));
    result += bloom * (settings.y / 9.0);
  }
  result *= settings.x;
  if (aces) result = clamp((result * (2.51 * result + .03)) / (result * (2.43 * result + .59) + .14), 0.0, 1.0);
  result = max(result, vec3(0.0));
  result = mix(result * 12.92, 1.055 * pow(result, vec3(1.0 / 2.4)) - .055, step(vec3(.0031308), result));
  color = vec4(result, 1.0);
}`;export const skyVertex=`#version 300 es
precision highp float;
out vec2 vNdc;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)) * 2.0 - 1.0;
  vNdc = p;
  gl_Position = vec4(p, 1.0, 1.0);
}`;export const skyFragment=`#version 300 es
precision highp float;
in vec2 vNdc;
uniform mat4 invViewProjection;
uniform sampler2D backgroundMap;
uniform vec2 sky; // intensity, linearOutput
out vec4 color;
vec3 encodeSRGB(vec3 c) {
  c = max(c, vec3(0.0));
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - .055, step(vec3(.0031308), c));
}
vec2 equirectUV(vec3 d) {
  d = normalize(d);
  return vec2(atan(d.x, -d.z) * 0.15915494309 + 0.5, acos(clamp(d.y, -1.0, 1.0)) * 0.31830988618);
}
void main() {
  vec4 nearPoint = invViewProjection * vec4(vNdc, 0.0, 1.0);
  vec4 farPoint = invViewProjection * vec4(vNdc, 1.0, 1.0);
  vec3 direction = normalize(farPoint.xyz / farPoint.w - nearPoint.xyz / nearPoint.w);
  vec3 c = textureLod(backgroundMap, equirectUV(direction), 0.0).rgb * sky.x;
  if (sky.y < 0.5) c = encodeSRGB(c);
  color = vec4(c, 1.0);
}`;
//# sourceMappingURL=webgl-feature-shaders.js.map
