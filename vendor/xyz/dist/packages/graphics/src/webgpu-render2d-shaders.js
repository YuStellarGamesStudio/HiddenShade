const e=`
struct DrawUniforms { values: array<vec4f, 16>, };
@group(0) @binding(0) var<uniform> draw: DrawUniforms;
@group(1) @binding(0) var spriteTexture: texture_2d<f32>;
@group(1) @binding(1) var spriteSampler: sampler;
struct EffectUniforms { values: array<vec4f, 4>, };
@group(2) @binding(0) var<uniform> uniforms: EffectUniforms;
fn uniformValue(index: u32) -> vec4f { return uniforms.values[index]; }
struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uvQ: vec3f,
  @location(1) tint: vec4f,
  @location(2) screen: vec2f,
  @location(3) uvx: vec4f,
  @location(4) uvy: vec4f,
  @location(5) tile: vec4f,
};
fn project(local: vec2f, world: bool, roundPixels: bool) -> vec4f {
  var axes = draw.values[1]; var offset = draw.values[2].xy;
  if (world) { axes = draw.values[3]; offset = draw.values[4].xy; }
  var screen = axes.xy * local.x + axes.zw * local.y + offset;
  if (roundPixels) { screen = floor(screen * draw.values[0].zw + vec2f(0.5)) / draw.values[0].zw; }
  return vec4f(screen.x * 2.0 / draw.values[0].x - 1.0, 1.0 - screen.y * 2.0 / draw.values[0].y, 0.0, 1.0);
}
fn sampleFrame(unit: vec2f, uvx: vec4f, uvy: vec4f) -> vec4f {
  let origin = uvx.xy; let x = uvx.zw; let y = uvy.xy;
  let end = origin + x + y;
  let inset = min(vec2f(0.5) / vec2f(textureDimensions(spriteTexture)), abs(end - origin) * 0.5);
  let uv = clamp(origin + x * unit.x + y * unit.y, min(origin, end) + inset, max(origin, end) - inset);
  return textureSampleLevel(spriteTexture, spriteSampler, uv, 0.0);
}
`;export function quadWGSL(t,n=!1){return`${e}
${n?`@group(3) @binding(0) var destinationTexture: texture_2d<f32>; @group(3) @binding(1) var destinationSampler: sampler;`:``}
struct QuadInput {
  @location(0) axes: vec4f, @location(1) rect: vec4f,
  @location(2) size: vec4f, @location(3) uvx: vec4f,
  @location(4) uvy: vec4f, @location(5) tint: vec4f,
  @location(6) tile: vec4f, @location(7) flags: vec4f,
  @location(8) trimAnchor: vec4f,
};
@vertex fn vertexMain(input: QuadInput, @builtin(vertex_index) index: u32) -> VertexOutput {
  let corners = array<vec2f,6>(vec2f(0,0),vec2f(1,0),vec2f(0,1),vec2f(0,1),vec2f(1,0),vec2f(1,1));
  let corner = corners[index];
  let local = input.rect.zw + corner * input.size.xy - input.trimAnchor.zw * input.size.zw;
  let transformed = input.rect.xy + input.axes.xy * local.x + input.axes.zw * local.y;
  var output: VertexOutput;
  output.position = project(transformed, input.flags.z != 0.0, input.flags.w != 0.0);
  output.screen = vec2f((output.position.x + 1.0) * 0.5, (1.0 - output.position.y) * 0.5) * draw.values[0].xy;
  output.uvQ = vec3f(corner, 1.0);
  output.tint = input.tint * draw.values[5];
  output.uvx = input.uvx; output.uvy = input.uvy;
  output.tile = vec4f(0.0);
  if (input.flags.y != 0.0) {
    let p = corner * input.size.xy - input.tile.xy;
    let c = cos(input.flags.x); let s = sin(input.flags.x);
    let tilePoint = vec2f(c*p.x+s*p.y, -s*p.x+c*p.y) / input.tile.zw;
    output.uvQ = vec3f(tilePoint / input.size.zw, 1.0);
    output.tile = vec4f(input.trimAnchor.xy / input.size.zw, input.uvy.zw / input.size.zw);
  }
  return output;
}
${t??`fn effect(color: vec4f, uv: vec2f, screen: vec2f) -> vec4f { return color; }`}
@fragment fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  var unit = input.uvQ.xy;
  if (input.tile.z > 0.0 && input.tile.w > 0.0) {
    unit = fract(unit);
    if (any(unit < input.tile.xy) || any(unit >= input.tile.xy + input.tile.zw)) { discard; }
    unit = (unit - input.tile.xy) / input.tile.zw;
  }
  let texel = sampleFrame(unit, input.uvx, input.uvy);
  let color = vec4f(texel.rgb * input.tint.rgb * input.tint.a, texel.a * input.tint.a);
  ${n?`let destination = textureSampleLevel(destinationTexture,destinationSampler,input.screen / draw.values[0].xy,0.0);
  return vec4f(color.rgb*destination.rgb+color.rgb*(1.0-destination.a)+destination.rgb*(1.0-color.a),color.a+destination.a*(1.0-color.a));`:`return effect(color, unit, input.screen);`}
}`}export const meshWGSL=`${e}
struct MeshInput { @location(0) position: vec2f, @location(1) uvQ: vec3f, };
@vertex fn vertexMain(input: MeshInput) -> VertexOutput {
  var output: VertexOutput;
  output.position = project(input.position, false, false);
  output.screen = vec2f(0.0); output.uvQ = input.uvQ;
  output.tint = draw.values[5]; output.uvx = draw.values[6]; output.uvy = draw.values[7];
  output.tile = vec4f(0.0); return output;
}
@fragment fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  var unit = input.uvQ.xy / input.uvQ.z;
  if (draw.values[7].z != 0.0) { unit.x = fract(unit.x); }
  let texel = sampleFrame(unit, input.uvx, input.uvy);
  return vec4f(texel.rgb * input.tint.rgb * input.tint.a, texel.a * input.tint.a);
}`;export const localPassWGSL=`
struct Settings { values: array<vec4f,16>, };
@group(0) @binding(0) var<uniform> settings: Settings;
@group(1) @binding(0) var inputTexture: texture_2d<f32>;
@group(1) @binding(1) var inputSampler: sampler;
@group(1) @binding(2) var auxiliary: texture_2d<f32>;
struct Output { @builtin(position) position: vec4f, @location(0) uv: vec2f, };
@vertex fn vertexMain(@builtin(vertex_index) index: u32) -> Output {
  let p = array<vec2f,3>(vec2f(0,0),vec2f(2,0),vec2f(0,2))[index];
  var output: Output; output.position = vec4f(p.x*2.0-1.0,1.0-p.y*2.0,0,1); output.uv = p; return output;
}
fn sampleInput(uv: vec2f) -> vec4f {
  if (any(uv < vec2f(0.0)) || any(uv > vec2f(1.0))) { return vec4f(0.0); }
  return textureSampleLevel(inputTexture,inputSampler,uv,0.0);
}
fn straight(color: vec4f) -> vec4f { return vec4f(color.rgb / max(color.a, 0.000001), color.a); }
@fragment fn fragmentMain(input: Output) -> @location(0) vec4f {
  let p = settings.values[0]; let mode = u32(p.x); let color = sampleInput(input.uv);
  if (mode == 0u) { return color * p.y; }
  if (mode == 1u) {
    let c = straight(color);
    var result: vec4f;
    result.x = dot(c,settings.values[1]) + settings.values[5].x;
    result.y = dot(c,settings.values[2]) + settings.values[5].y;
    result.z = dot(c,settings.values[3]) + settings.values[5].z;
    result.w = dot(c,settings.values[4]) + settings.values[5].w;
    result = clamp(result,vec4f(0.0),vec4f(1.0)); return vec4f(result.rgb * result.a,result.a);
  }
  if (mode == 2u) {
    var sum = vec4f(0.0); var weight = 0.0;
    let quality = i32(p.z); let direction = settings.values[1].xy;
    for (var i = -quality; i <= quality; i++) {
      let t = f32(i) / f32(max(quality,1)); let w = exp(-t*t*2.0);
      sum += sampleInput(input.uv + direction * t * p.y) * w; weight += w;
    }
    return sum / weight;
  }
  if (mode == 3u) {
    let noise = fract(sin(dot(input.uv * settings.values[1].xy,vec2f(12.9898,78.233)) + p.z) * 43758.5453) - 0.5;
    return vec4f(clamp(color.rgb + vec3f(noise * p.y * color.a),vec3f(0.0),vec3f(color.a)),color.a);
  }
  if (mode == 4u) {
    let basis = settings.values[2]; let yAxis = settings.values[3].xy;
    let mapUV = basis.xy + basis.zw * input.uv.x + yAxis * input.uv.y;
    let map = straight(textureSampleLevel(auxiliary,inputSampler,mapUV,0.0));
    return sampleInput(input.uv + (map.rg-vec2f(0.5)) * settings.values[1].xy);
  }
  if (mode == 5u) {
    let mask = textureSampleLevel(auxiliary,inputSampler,input.uv,0.0);
    var coverage = select(mask.a,mask.r,p.z != 0.0);
    coverage = select(coverage,1.0-coverage,p.y != 0.0); return color * coverage;
  }
  return color;
}`;
//# sourceMappingURL=webgpu-render2d-shaders.js.map
