export function spriteWGSL(e){return`
struct Viewport { size: vec2f, };
@group(0) @binding(0) var<uniform> viewport: Viewport;
@group(1) @binding(0) var spriteTexture: texture_2d<f32>;
@group(1) @binding(1) var spriteSampler: sampler;
struct EffectUniforms { values: array<vec4f, 4>, };
@group(2) @binding(0) var<uniform> uniforms: EffectUniforms;
fn uniformValue(index: u32) -> vec4f { return uniforms.values[index]; }
struct VertexInput {
  @location(0) axes: vec4f,
  @location(1) offsetSize: vec4f,
  @location(2) anchorOpacity: vec4f,
  @location(3) source: vec4f,
  @location(4) tint: vec4f,
};
struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
  @location(1) opacity: f32,
  @location(2) source: vec4f,
  @location(3) tint: vec4f,
  @location(4) screen: vec2f,
};
@vertex
fn vertexMain(input: VertexInput, @builtin(vertex_index) index: u32) -> VertexOutput {
  let corners = array<vec2f, 6>(
    vec2f(0.0, 0.0), vec2f(1.0, 0.0), vec2f(0.0, 1.0),
    vec2f(0.0, 1.0), vec2f(1.0, 0.0), vec2f(1.0, 1.0));
  let corner = corners[index];
  let local = (corner - input.anchorOpacity.xy) * input.offsetSize.zw;
  let screen = input.offsetSize.xy + input.axes.xy * local.x + input.axes.zw * local.y;
  var output: VertexOutput;
  output.position = vec4f(screen.x * 2.0 / viewport.size.x - 1.0,
                         1.0 - screen.y * 2.0 / viewport.size.y, 0.0, 1.0);
  output.uv = input.source.xy + corner * input.source.zw;
  output.opacity = input.anchorOpacity.z;
  output.source = input.source;
  output.tint = input.tint;
  output.screen = screen;
  return output;
}
${e??`fn effect(color: vec4f, uv: vec2f, screen: vec2f) -> vec4f { return color; }`}
@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  let inset = min(0.5 / vec2f(textureDimensions(spriteTexture)), input.source.zw * 0.5);
  // Clamp samples without shrinking the source mapping or reversing sub-texel frame bounds.
  let uv = clamp(input.uv, input.source.xy + inset, input.source.xy + input.source.zw - inset);
  let texel = textureSample(spriteTexture, spriteSampler, uv);
  let alpha = input.opacity * input.tint.a;
  let color = vec4f(texel.rgb * input.tint.rgb * alpha, texel.a * alpha);
  return effect(color, (input.uv - input.source.xy) / input.source.zw, input.screen);
}`}const e=`
struct FrameSettings { viewport: vec4f, direction: vec4f, color: vec4f, spare: vec4f, };
@group(2) @binding(0) var<uniform> settings: FrameSettings;
struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
  @location(1) screen: vec2f,
};
@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> VertexOutput {
  let corners = array<vec2f, 3>(vec2f(0.0, 0.0), vec2f(2.0, 0.0), vec2f(0.0, 2.0));
  let uv = corners[index];
  var output: VertexOutput;
  output.position = vec4f(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, 0.0, 1.0);
  output.uv = uv;
  output.screen = uv * settings.viewport.xy;
  return output;
}`;export function postWGSL(t){return`${e}
@group(0) @binding(0) var inputTexture: texture_2d<f32>;
@group(0) @binding(1) var inputSampler: sampler;
struct EffectUniforms { values: array<vec4f, 4>, };
@group(1) @binding(0) var<uniform> uniforms: EffectUniforms;
fn uniformValue(index: u32) -> vec4f { return uniforms.values[index]; }
fn sampleInput(uv: vec2f) -> vec4f { return textureSampleLevel(inputTexture, inputSampler, uv, 0.0); }
${t??`fn effect(color: vec4f, uv: vec2f, screen: vec2f) -> vec4f { return color; }`}
@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  return effect(sampleInput(input.uv), input.uv, input.screen);
}`}export const transitionWGSL=`${e}
@group(0) @binding(0) var incoming: texture_2d<f32>;
@group(0) @binding(1) var frameSampler: sampler;
@group(0) @binding(2) var outgoing: texture_2d<f32>;
fn oldColor(uv: vec2f) -> vec4f {
  if (settings.direction.z == 0.0) { return settings.color; }
  return textureSampleLevel(outgoing, frameSampler, uv, 0.0);
}
@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  let progress = settings.viewport.z;
  let mode = settings.viewport.w;
  let current = textureSampleLevel(incoming, frameSampler, input.uv, 0.0);
  if (mode == 0.0) { return mix(oldColor(input.uv), current, progress); }
  if (mode == 1.0) {
    if (progress < 0.5) { return mix(oldColor(input.uv), settings.color, progress * 2.0); }
    return mix(settings.color, current, progress * 2.0 - 1.0);
  }
  let direction = settings.direction.xy;
  let newUV = input.uv + direction * (1.0 - progress);
  let oldUV = input.uv - direction * progress;
  // Select the incoming footprint, not clamped outside texels stretched across the screen.
  if (all(newUV >= vec2f(0.0)) && all(newUV <= vec2f(1.0))) {
    return textureSampleLevel(incoming, frameSampler, newUV, 0.0);
  }
  return oldColor(oldUV);
}`;
//# sourceMappingURL=shaders.js.map
