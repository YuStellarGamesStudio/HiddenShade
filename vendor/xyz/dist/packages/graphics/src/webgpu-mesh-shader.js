export const webgpuMeshShader=`
struct PointLight { positionRange: vec4f, colorIntensity: vec4f };
struct SpotLight {
  positionRange: vec4f, colorIntensity: vec4f, directionOuter: vec4f, inner: vec4f,
};
struct SceneUniforms {
  viewProjection: mat4x4f,
  camera: vec4f,
  shadowMatrix: mat4x4f,
  shadowParams: vec4f,
  lightDirection: vec4f,
  lightColorAmbient: vec4f,
  counts: vec4f,
  points: array<PointLight, 8>,
  spots: array<SpotLight, 8>,
  invViewProjection: mat4x4f,
  envSH: array<vec4f, 9>,
  envParams: vec4f,
  fogColor: vec4f,
  fogParams: vec4f,
};
struct MeshUniforms {
  model: mat4x4f,
  tint: vec4f,
  material: vec4f,
  emissiveOcclusion: vec4f,
  maps: vec4f,
  settings: vec4f,
};
@group(0) @binding(0) var<uniform> scene: SceneUniforms;
@group(0) @binding(1) var shadowMap: texture_depth_2d;
@group(0) @binding(2) var environmentMap: texture_2d<f32>;
@group(0) @binding(3) var environmentSampler: sampler;
@group(0) @binding(4) var backgroundMap: texture_2d<f32>;
@group(1) @binding(0) var<uniform> mesh: MeshUniforms;
@group(2) @binding(0) var baseMap: texture_2d<f32>;
@group(2) @binding(1) var materialSampler: sampler;
@group(2) @binding(2) var metallicRoughnessMap: texture_2d<f32>;
@group(2) @binding(3) var normalMap: texture_2d<f32>;
@group(2) @binding(4) var occlusionMap: texture_2d<f32>;
@group(2) @binding(5) var emissiveMap: texture_2d<f32>;
@group(2) @binding(6) var metallicRoughnessSampler: sampler;
@group(2) @binding(7) var normalSampler: sampler;
@group(2) @binding(8) var occlusionSampler: sampler;
@group(2) @binding(9) var emissiveSampler: sampler;
struct VertexInput {
  @location(0) position: vec3f,
  @location(1) normal: vec3f,
  @location(2) uv: vec2f,
  @location(3) instance0: vec4f,
  @location(4) instance1: vec4f,
  @location(5) instance2: vec4f,
  @location(6) instance3: vec4f,
};
struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) normal: vec3f,
  @location(1) uv: vec2f,
  @location(2) world: vec3f,
  @location(3) @interpolate(flat) orientation: f32,
};
fn transformVertex(input: VertexInput, projection: mat4x4f) -> VertexOutput {
  let model = mesh.model * mat4x4f(input.instance0, input.instance1, input.instance2, input.instance3);
  let a = model[0].xyz;
  let b = model[1].xyz;
  let c = model[2].xyz;
  let determinant = dot(a, cross(b, c));
  let inverseDet = select(0.0, 1.0 / determinant, determinant != 0.0);
  let normalMatrix = mat3x3f(cross(b,c), cross(c,a), cross(a,b)) * inverseDet;
  let world = model * vec4f(input.position, 1.0);
  var output: VertexOutput;
  output.position = projection * world;
  output.normal = normalMatrix * input.normal;
  output.uv = input.uv;
  output.world = world.xyz;
  output.orientation = select(-1.0,1.0,determinant >= 0.0);
  return output;
}
@vertex fn vertexMain(input: VertexInput) -> VertexOutput {
  return transformVertex(input, scene.viewProjection);
}
@vertex fn shadowVertex(input: VertexInput) -> VertexOutput {
  return transformVertex(input, scene.shadowMatrix);
}
fn decodeSRGB(c: vec3f) -> vec3f {
  return select(pow(max((c + 0.055) / 1.055, vec3f(0.0)), vec3f(2.4)), c / 12.92, c <= vec3f(0.04045));
}
fn encodeSRGB(c: vec3f) -> vec3f {
  let v = max(c, vec3f(0.0));
  return select(1.055 * pow(v, vec3f(1.0 / 2.4)) - 0.055, v * 12.92, v <= vec3f(0.0031308));
}
fn safeNormal(v: vec3f) -> vec3f {
  return v / max(length(v), 0.000001);
}
fn equirectUV(direction: vec3f) -> vec2f {
  let d = safeNormal(direction);
  return vec2f(atan2(d.x, -d.z) * 0.15915494309 + 0.5, acos(clamp(d.y, -1.0, 1.0)) * 0.31830988618);
}
fn shIrradiance(n: vec3f) -> vec3f {
  var c = scene.envSH[0].rgb * 0.282095;
  c += scene.envSH[1].rgb * (0.488603 * n.y);
  c += scene.envSH[2].rgb * (0.488603 * n.z);
  c += scene.envSH[3].rgb * (0.488603 * n.x);
  c += scene.envSH[4].rgb * (1.092548 * n.x * n.y);
  c += scene.envSH[5].rgb * (1.092548 * n.y * n.z);
  c += scene.envSH[6].rgb * (0.315392 * (3.0 * n.z * n.z - 1.0));
  c += scene.envSH[7].rgb * (1.092548 * n.x * n.z);
  c += scene.envSH[8].rgb * (0.546274 * (n.x * n.x - n.y * n.y));
  return max(c, vec3f(0.0));
}
// Karis' analytic split-sum approximation; avoids a BRDF lookup texture.
fn environmentBRDF(nv: f32, rough: f32) -> vec2f {
  let c0 = vec4f(-1.0, -0.0275, -0.572, 0.022);
  let c1 = vec4f(1.0, 0.0425, 1.04, -0.04);
  let r = rough * c0 + c1;
  let a004 = min(r.x * r.x, exp2(-9.28 * nv)) * r.x + r.y;
  return vec2f(-1.04, 1.04) * a004 + r.zw;
}
fn shadowVisibility(world: vec3f) -> f32 {
  if (scene.shadowParams.x < 0.5 || mesh.settings.z < 0.5) { return 1.0; }
  let clip = scene.shadowMatrix * vec4f(world, 1.0);
  let ndc = clip.xyz / clip.w;
  let uv = vec2f(ndc.x * 0.5 + 0.5, 0.5 - ndc.y * 0.5);
  if (any(uv < vec2f(0.0)) || any(uv > vec2f(1.0)) || ndc.z < 0.0 || ndc.z > 1.0) { return 1.0; }
  let size = vec2i(textureDimensions(shadowMap));
  let pixel = vec2i(uv * vec2f(size));
  var visibility = 0.0;
  for (var y = -1; y <= 1; y++) {
    for (var x = -1; x <= 1; x++) {
      let depth = textureLoad(shadowMap, clamp(pixel + vec2i(x,y), vec2i(0), size - vec2i(1)), 0);
      visibility += select(0.0, 1.0, ndc.z - scene.shadowParams.y <= depth);
    }
  }
  return visibility / 9.0;
}
fn attenuation(distance: f32, range: f32) -> f32 {
  var falloff = 1.0;
  if (range > 0.0) { falloff = pow(max(1.0 - pow(distance / range, 4.0), 0.0), 2.0); }
  return falloff / max(distance * distance, 0.01);
}
fn brdf(n: vec3f, v: vec3f, l: vec3f, base: vec3f, metal: f32, rough: f32) -> vec3f {
  let h = safeNormal(v+l);
  let nl = max(dot(n,l),0.0);
  let nv = max(dot(n,v),0.000001);
  let nh = max(dot(n,h),0.0);
  let vh = max(dot(v,h),0.0);
  let alpha = rough*rough;
  let alpha2 = alpha*alpha;
  let denominator = nh*nh*(alpha2-1.0)+1.0;
  let distribution = alpha2 / max(3.14159265359*denominator*denominator,0.000001);
  let k = (rough+1.0)*(rough+1.0)/8.0;
  let geometry = (nv/(nv*(1.0-k)+k))*(nl/(nl*(1.0-k)+k));
  let f0 = mix(vec3f(0.04),base,metal);
  let fresnel = f0 + (vec3f(1.0)-f0)*pow(1.0-vh,5.0);
  let specular = distribution*geometry*fresnel/max(4.0*nv*nl,0.000001);
  let diffuse = (vec3f(1.0)-fresnel)*(1.0-metal)*base/3.14159265359;
  return (diffuse+specular)*nl;
}
@fragment fn shadowFragment(input: VertexOutput, @builtin(front_facing) front: bool) {
  let texel = textureSample(baseMap, materialSampler, input.uv);
  let effectiveFront = front == (input.orientation > 0.0);
  let alpha = texel.a * mesh.tint.a;
  let masked = mesh.settings.w > 0.5 && mesh.settings.w < 1.5;
  let blended = mesh.settings.w > 1.5;
  if (mesh.material.x > 0.5 && ((!effectiveFront && mesh.settings.y < 0.5) || (masked && alpha < mesh.settings.x) || (blended && alpha <= 0.0))) { discard; }
}
// rgb is premultiplied by opacity, so fog fades toward fogColor * opacity and keeps transparency.
fn applyFog(rgb: vec3f, opacity: f32, world: vec3f) -> vec3f {
  let mode = scene.fogColor.w;
  if (mode < 0.5) { return rgb; }
  let distance = length(world - scene.camera.xyz);
  var amount = clamp((distance - scene.fogParams.x) / max(scene.fogParams.y - scene.fogParams.x, 0.000001), 0.0, 1.0);
  if (mode > 1.5) {
    let d = scene.fogParams.z * distance;
    amount = 1.0 - exp(-d * d);
  }
  return mix(rgb, scene.fogColor.rgb * opacity, amount);
}
@fragment fn fragmentMain(input: VertexOutput, @builtin(front_facing) front: bool) -> @location(0) vec4f {
  let texel = textureSample(baseMap, materialSampler, input.uv);
  let visibility = shadowVisibility(input.world);
  let sampledAlpha = texel.a * mesh.tint.a;
  let opacity = select(1.0,sampledAlpha,mesh.material.x < 0.5 || mesh.settings.w > 1.5);
  let direction = safeNormal(scene.lightDirection.xyz);
  if (mesh.material.x < 0.5) {
    let normal = input.normal;
    let light = max(dot(normal,scene.lightDirection.xyz),0.0) / max(length(normal)*length(scene.lightDirection.xyz),0.000001);
    var illumination = vec3f(max(scene.lightColorAmbient.w,0.0)) + scene.lightColorAmbient.rgb*(light*max(scene.lightDirection.w,0.0)*visibility);
    for (var i = 0u; i < u32(scene.counts.x); i++) {
      let lightData = scene.points[i];
      let delta = lightData.positionRange.xyz-input.world;
      illumination += lightData.colorIntensity.rgb*lightData.colorIntensity.w*attenuation(length(delta),lightData.positionRange.w)*max(dot(safeNormal(normal),safeNormal(delta)),0.0);
    }
    for (var i = 0u; i < u32(scene.counts.y); i++) {
      let lightData = scene.spots[i];
      let delta = lightData.positionRange.xyz-input.world;
      let l = safeNormal(delta);
      let cone = smoothstep(lightData.directionOuter.w,lightData.inner.x,dot(-l,lightData.directionOuter.xyz));
      illumination += lightData.colorIntensity.rgb*lightData.colorIntensity.w*attenuation(length(delta),lightData.positionRange.w)*cone*max(dot(safeNormal(normal),l),0.0);
    }
    // Legacy base map remains premultiplied to retain filtered translucent edges.
    let rgb = texel.rgb*mesh.tint.rgb*illumination*mesh.tint.a;
    if (scene.counts.z > 0.5) { return vec4f(applyFog(decodeSRGB(rgb/max(opacity,0.000001))*opacity,opacity,input.world),opacity); }
    return vec4f(applyFog(rgb,opacity,input.world),opacity);
  }
  var mr = vec4f(1.0);
  if (mesh.maps.x > 0.5) { mr = textureSample(metallicRoughnessMap, metallicRoughnessSampler, input.uv); }
  var mappedNormal = vec3f(0.0,0.0,1.0);
  var dx = vec3f(0.0); var dy = vec3f(0.0);
  var du = vec2f(0.0); var dv = vec2f(0.0);
  if (mesh.maps.y > 0.5) {
    mappedNormal = textureSample(normalMap, normalSampler, input.uv).xyz * 2.0 - 1.0;
    dx = dpdx(input.world); dy = -dpdy(input.world);
    du = dpdx(input.uv); dv = -dpdy(input.uv);
  }
  var ao = 1.0;
  if (mesh.maps.z > 0.5) { ao = textureSample(occlusionMap, occlusionSampler, input.uv).r; }
  var emission = vec3f(1.0);
  if (mesh.maps.w > 0.5) { emission = textureSample(emissiveMap, emissiveSampler, input.uv).rgb; }
  let effectiveFront = front == (input.orientation > 0.0);
  let masked = mesh.settings.w > 0.5 && mesh.settings.w < 1.5;
  if ((!effectiveFront && mesh.settings.y < 0.5) || (masked && sampledAlpha < mesh.settings.x)) { discard; }
  let base = decodeSRGB(texel.rgb)*mesh.tint.rgb;
  let metal = clamp(mesh.material.y*select(1.0,mr.b,mesh.maps.x > 0.5),0.0,1.0);
  let rough = clamp(mesh.material.z*select(1.0,mr.g,mesh.maps.x > 0.5),0.04,1.0);
  var n = safeNormal(input.normal)*select(-1.0,1.0,effectiveFront);
  if (mesh.maps.y > 0.5) {
    let perpendicularY = cross(dy,n);
    let perpendicularX = cross(n,dx);
    let tangent = perpendicularY*du.x + perpendicularX*dv.x;
    let bitangent = perpendicularY*du.y + perpendicularX*dv.y;
    let scale = inverseSqrt(max(max(dot(tangent,tangent),dot(bitangent,bitangent)),0.000001));
    n = safeNormal(mat3x3f(tangent*scale,bitangent*scale,n)*vec3f(mappedNormal.xy*mesh.material.w,mappedNormal.z));
  }
  let v = safeNormal(scene.camera.xyz-input.world);
  let occlusion = select(1.0,mix(1.0,ao,mesh.emissiveOcclusion.w),mesh.maps.z > 0.5);
  let useEnvironment = scene.envParams.y > 0.5;
  var color = base*(1.0-metal)*select(max(scene.lightColorAmbient.w,0.0),0.0,useEnvironment)*occlusion;
  if (useEnvironment) {
    let nv = max(dot(n,v),0.0001);
    let ab = environmentBRDF(nv,rough);
    let specularColor = mix(vec3f(0.04),base,metal)*ab.x + vec3f(ab.y);
    let radiance = textureSampleLevel(environmentMap,environmentSampler,equirectUV(reflect(-v,n)),rough*scene.envParams.z).rgb;
    let diffuseLight = shIrradiance(n)*base*(1.0-metal)*max(vec3f(1.0)-specularColor,vec3f(0.0));
    color += (diffuseLight + radiance*specularColor)*occlusion*scene.envParams.x;
  }
  color += brdf(n,v,direction,base,metal,rough)*scene.lightColorAmbient.rgb*max(scene.lightDirection.w,0.0)*visibility;
  for (var i = 0u; i < u32(scene.counts.x); i++) {
    let lightData = scene.points[i];
    let delta = lightData.positionRange.xyz-input.world;
    color += brdf(n,v,safeNormal(delta),base,metal,rough)*lightData.colorIntensity.rgb*lightData.colorIntensity.w*attenuation(length(delta),lightData.positionRange.w);
  }
  for (var i = 0u; i < u32(scene.counts.y); i++) {
    let lightData = scene.spots[i];
    let delta = lightData.positionRange.xyz-input.world;
    let l = safeNormal(delta);
    let cone = smoothstep(lightData.directionOuter.w,lightData.inner.x,dot(-l,lightData.directionOuter.xyz));
    color += brdf(n,v,l,base,metal,rough)*lightData.colorIntensity.rgb*lightData.colorIntensity.w*attenuation(length(delta),lightData.positionRange.w)*cone;
  }
  color += mesh.emissiveOcclusion.rgb*select(vec3f(1.0),decodeSRGB(emission),mesh.maps.w > 0.5);
  if (scene.counts.z < 0.5) { color = encodeSRGB(color); }
  return vec4f(applyFog(color*opacity,opacity,input.world),opacity);
}
struct SkyOutput {
  @builtin(position) position: vec4f,
  @location(0) ndc: vec2f,
};
@vertex fn skyVertex(@builtin(vertex_index) index: u32) -> SkyOutput {
  var corners = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  var output: SkyOutput;
  output.position = vec4f(corners[index], 1.0, 1.0);
  output.ndc = corners[index];
  return output;
}
@fragment fn skyFragment(input: SkyOutput) -> @location(0) vec4f {
  // Two points on the pixel's ray work for perspective and orthographic cameras alike.
  let nearPoint = scene.invViewProjection * vec4f(input.ndc, 0.0, 1.0);
  let farPoint = scene.invViewProjection * vec4f(input.ndc, 1.0, 1.0);
  let direction = safeNormal(farPoint.xyz / farPoint.w - nearPoint.xyz / nearPoint.w);
  var color = textureSampleLevel(backgroundMap, environmentSampler, equirectUV(direction), 0.0).rgb * scene.envParams.w;
  if (scene.counts.z < 0.5) { color = encodeSRGB(color); }
  return vec4f(color, 1.0);
}
`;
//# sourceMappingURL=webgpu-mesh-shader.js.map
