import{GraphicsError as e,WebGPUInitializationError as t}from"./errors.js";export class WebGPUPostPipeline{device;pipeline;texture;view;bindGroup;buffer;width=0;height=0;data=new Float32Array(8);attachment={loadOp:`clear`,storeOp:`store`};descriptor={colorAttachments:[this.attachment]};constructor(e,t){this.device=e,this.pipeline=t}static async initialize(n,r,i){let a=n.createShaderModule({code:`
struct Settings { values: vec4f, viewport: vec4f };
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var<uniform> settings: Settings;
@vertex fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
  let positions = array<vec2f,3>(vec2f(-1.0,-1.0),vec2f(3.0,-1.0),vec2f(-1.0,3.0));
  return vec4f(positions[index],0.0,1.0);
}
@fragment fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
  let size = vec2i(textureDimensions(source));
  let pixel = clamp(vec2i(position.xy),vec2i(0),size-vec2i(1));
  let radius = i32(min(floor(settings.viewport.z+0.5),f32(max(size.x,size.y))));
  let sample = textureLoad(source,pixel,0);
  var color = sample.rgb/max(sample.a,0.000001);
  var bloom = vec3f(0.0);
  if (settings.values.z > 0.0) {
    for (var y = -1; y <= 1; y++) {
      for (var x = -1; x <= 1; x++) {
        let offset = vec2i(x,y)*radius;
        let neighbor = textureLoad(source,clamp(pixel+offset,vec2i(0),size-vec2i(1)),0);
        bloom += max(neighbor.rgb/max(neighbor.a,0.000001)-vec3f(settings.values.w),vec3f(0.0));
      }
    }
  }
  color = max((color+bloom*(settings.values.z/9.0))*settings.values.x,vec3f(0.0));
  if (settings.values.y > 0.5) {
    color = clamp((color*(2.51*color+0.03))/(color*(2.43*color+0.59)+0.14),vec3f(0.0),vec3f(1.0));
  }
  color = select(1.055*pow(color,vec3f(1.0/2.4))-0.055,color*12.92,color <= vec3f(0.0031308));
  return vec4f(color*sample.a,sample.a);
}
`}),o=await a.getCompilationInfo();if(i())throw new e(`WebGPU renderer was destroyed during initialization.`);let s=o.messages.filter(e=>e.type===`error`);if(s.length)throw new t(`WebGPU post shader compilation failed: ${s.map(e=>`${e.lineNum}:${e.linePos} ${e.message}`).join(`; `)}`);let c=n.createRenderPipeline({layout:`auto`,vertex:{module:a,entryPoint:`vertexMain`},fragment:{module:a,entryPoint:`fragmentMain`,targets:[{format:r}]},primitive:{topology:`triangle-list`}});return new WebGPUPostPipeline(n,c)}target(e,t){if(this.texture&&this.width===e&&this.height===t)return this.view;this.releaseTarget(),this.buffer||=this.device.createBuffer({size:32,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});let n=this.device.createTexture({size:[e,t],format:`rgba16float`,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING});try{let r=n.createView();return this.bindGroup=this.device.createBindGroup({layout:this.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:r},{binding:1,resource:{buffer:this.buffer}}]}),this.texture=n,this.view=r,this.width=e,this.height=t,r}catch(e){throw n.destroy(),e}}render(e,t,n){this.data[0]=n.exposure,this.data[1]=+(n.toneMapping===`aces`),this.data[2]=n.bloomStrength,this.data[3]=n.bloomThreshold,this.data[4]=this.width,this.data[5]=this.height,this.data[6]=n.bloomRadius,this.device.queue.writeBuffer(this.buffer,0,this.data),this.attachment.view=t;try{let t=e.beginRenderPass(this.descriptor);t.setPipeline(this.pipeline),t.setBindGroup(0,this.bindGroup),t.draw(3),t.end()}finally{this.attachment.view=void 0}}resize(e,t){(this.width!==e||this.height!==t)&&this.releaseTarget()}releaseTarget(){this.texture?.destroy(),this.texture=void 0,this.view=void 0,this.bindGroup=void 0}destroy(){this.releaseTarget(),this.buffer?.destroy(),this.buffer=void 0}}
//# sourceMappingURL=webgpu-post-pipeline.js.map
