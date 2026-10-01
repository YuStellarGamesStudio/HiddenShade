const e=`uniform mat3 transform;
uniform vec2 viewportSize;
uniform vec4 appearance;
uniform vec4 uvBasis;
uniform vec2 uvOrigin;
uniform vec4 sourceBounds;
out vec2 vUV;
out vec2 vLocalUV;
out vec2 vScreen;
out float vOpacity;
out vec4 vSource;
out vec4 vTint;
void emitVertex(vec2 p, vec2 uv) {
  vec2 world = (transform * vec3(p, 1.0)).xy;
  gl_Position = vec4(world.x * 2.0 / viewportSize.x - 1.0, 1.0 - world.y * 2.0 / viewportSize.y, 0.0, 1.0);
  vUV = uvOrigin + uvBasis.xy * uv.x + uvBasis.zw * uv.y;
  vLocalUV = uv; vScreen = world; vOpacity = appearance.a;
  vSource = sourceBounds; vTint = vec4(appearance.rgb, 1.0);
}
`;export const quadVertex2D=`#version 300 es
precision highp float;
uniform vec4 localRect;
${e}
void main() {
  vec2 corners[6] = vec2[6](vec2(0,0),vec2(1,0),vec2(0,1),vec2(0,1),vec2(1,0),vec2(1,1));
  vec2 uv = corners[gl_VertexID]; emitVertex(localRect.xy + uv * localRect.zw, uv);
}`;export const particleVertex2D=`#version 300 es
precision highp float;
layout(location=0) in vec4 axes;
layout(location=1) in vec4 offsetSpace;
layout(location=2) in vec4 particleTint;
layout(location=3) in vec4 particleRect;
layout(location=4) in vec4 particleUV;
layout(location=5) in vec4 particleBasis;
uniform mat3 worldTransform;
${e}
void main() {
  vec2 corners[6] = vec2[6](vec2(0,0),vec2(1,0),vec2(0,1),vec2(0,1),vec2(1,0),vec2(1,1));
  vec2 uv = corners[gl_VertexID], p = particleRect.xy + uv * particleRect.zw;
  p = offsetSpace.xy + axes.xy * p.x + axes.zw * p.y;
  vec2 world = ((offsetSpace.z > 0.5 ? worldTransform : transform) * vec3(p,1.0)).xy;
  gl_Position = vec4(world.x*2.0/viewportSize.x-1.0,1.0-world.y*2.0/viewportSize.y,0,1);
  vUV = particleUV.xy + particleBasis.xy*uv.x + particleBasis.zw*uv.y;
  vLocalUV=uv; vScreen=world; vOpacity=appearance.a*particleTint.a;
  vTint=vec4(appearance.rgb*particleTint.rgb,1); vSource=sourceBounds;
}`;export const meshVertex2D=`#version 300 es
precision highp float;
layout(location=0) in vec2 position;
layout(location=1) in vec3 uvq;
${e}
out vec3 vUVQ;
void main() { emitVertex(position, uvq.xy); vUVQ=vec3(uvq.xy*uvq.z,uvq.z); }
`;const t=`uniform sampler2D image;
uniform bool renderSource;
uniform bool repeatUV;
vec4 sampleSource(vec2 uv) {
  vec2 halfTexel=min(0.5/vec2(textureSize(image,0)),vSource.zw*0.5);
  uv=clamp(uv,vSource.xy+halfTexel,vSource.xy+vSource.zw-halfTexel);
  if(renderSource) uv.y=1.0-uv.y;
  vec4 c=texture(image,uv);
  if(!renderSource) c.rgb*=c.a;
  return c;
}
`,n=`in vec2 vUV;
in vec2 vLocalUV;
in vec2 vScreen;
in float vOpacity;
in vec4 vSource;
in vec4 vTint;
out vec4 color;
`;export function quadFragment2D(e){return`#version 300 es
precision highp float;
${n}${t}
uniform bool tiling;
uniform vec4 tileShape;
uniform vec4 tileTrim;
uniform mat3 tileTransform;
uniform vec2 uvOrigin;
uniform vec4 uvBasis;
uniform vec4 localRect;
uniform vec4 uniforms[4];
vec4 uniformValue(int index){return uniforms[index];}
${e??``}
void main() {
  vec2 uv=vUV;
  if(tiling) {
    vec2 p=(tileTransform*vec3(localRect.xy+vLocalUV*localRect.zw,1)).xy;
    p=mod(p,tileShape.xy);
    vec2 local=(p-tileTrim.xy)/tileTrim.zw;
    if(any(lessThan(local,vec2(0)))||any(greaterThanEqual(local,vec2(1)))) {color=vec4(0);return;}
    uv=uvOrigin+uvBasis.xy*local.x+uvBasis.zw*local.y;
  }
  vec4 c=sampleSource(uv)*vec4(vTint.rgb*vOpacity,vOpacity);
  color=${e?`effect(c,vLocalUV,vScreen)`:`c`};
}`}export const meshFragment2D=`#version 300 es
precision highp float;
${n}${t}
in vec3 vUVQ;
uniform vec2 uvOrigin;
uniform vec4 uvBasis;
void main(){ vec2 uv=vUVQ.xy/vUVQ.z; if(repeatUV)uv=fract(uv);
  color=sampleSource(uvOrigin+uvBasis.xy*uv.x+uvBasis.zw*uv.y)*vec4(vTint.rgb*vOpacity,vOpacity);
}`;export const passVertex2D=`#version 300 es
precision highp float;
out vec2 vUV;
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.0-1.0,0,1);vUV=vec2(p.x,1.0-p.y);}`;export const passFragment2D=`#version 300 es
precision highp float;
in vec2 vUV;
uniform sampler2D image;
uniform sampler2D mapImage;
uniform int mode;
uniform vec2 logicalSize;
uniform vec4 parameters;
uniform vec4 rows[5];
uniform vec2 mapOrigin;
uniform vec4 mapBasis;
uniform vec4 mapBounds;
uniform bool mapRender;
uniform bool mapRed;
uniform bool inverseMask;
out vec4 color;
vec4 inputAt(vec2 uv){if(any(lessThan(uv,vec2(0)))||any(greaterThan(uv,vec2(1))))return vec4(0);return texture(image,vec2(uv.x,1.0-uv.y));}
vec4 mapAt(vec2 uv){uv=mapOrigin+mapBasis.xy*uv.x+mapBasis.zw*uv.y;
vec2 h=min(0.5/vec2(textureSize(mapImage,0)),mapBounds.zw*0.5);uv=clamp(uv,mapBounds.xy+h,mapBounds.xy+mapBounds.zw-h);
if(mapRender)uv.y=1.0-uv.y;vec4 c=texture(mapImage,uv);if(!mapRender)c.rgb*=c.a;return c;}
void main(){vec4 c=inputAt(vUV);
if(mode==1)c*=parameters.x;
else if(mode==2){vec4 s=c.a>0.0?vec4(c.rgb/c.a,c.a):vec4(0);vec4 r=vec4(dot(rows[0],s),dot(rows[1],s),dot(rows[2],s),dot(rows[3],s))+rows[4];r=clamp(r,0.0,1.0);c=vec4(r.rgb*r.a,r.a);}
else if(mode==3){c=vec4(0);float total=0.0;for(int i=-32;i<=32;i++){if(abs(i)>int(parameters.z))continue;float t=float(i)/max(parameters.z,1.0),w=exp(-2.0*t*t);c+=inputAt(vUV+parameters.xy*t/logicalSize)*w;total+=w;}c/=total;}
else if(mode==4){float n=fract(sin(dot(vUV*logicalSize,vec2(12.9898,78.233))+parameters.y)*43758.5453)-0.5;c.rgb=clamp(c.rgb+n*parameters.x*c.a,vec3(0),vec3(c.a));}
else if(mode==5){vec4 m=mapAt(vUV);vec2 d=(m.a>0.0?m.rg/m.a:vec2(0.5))-0.5;c=inputAt(vUV+d*parameters.xy/logicalSize);}
else if(mode==6){vec4 m=mapAt(vUV);float a=mapRed?m.r:m.a;c*=inverseMask?1.0-a:a;}
color=c;}`;export const blendFragment2D=`#version 300 es
precision highp float;
${n}${t}
uniform sampler2D backdrop;
uniform vec2 viewportSize;
void main(){vec4 s=sampleSource(vUV)*vec4(vTint.rgb*vOpacity,vOpacity);vec4 d=texture(backdrop,vec2(vScreen.x/viewportSize.x,1.0-vScreen.y/viewportSize.y));
color=vec4(s.rgb*d.rgb+s.rgb*(1.0-d.a)+d.rgb*(1.0-s.a),s.a+d.a*(1.0-s.a));}`;
//# sourceMappingURL=webgl2-render2d-shaders.js.map
