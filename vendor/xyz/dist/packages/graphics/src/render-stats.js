export class FrameStats{frame=0;meshes=0;culled=0;drawCalls=0;triangles=0;shadowDrawCalls=0;begin(){this.frame++,this.meshes=0,this.culled=0,this.drawCalls=0,this.triangles=0,this.shadowDrawCalls=0}draw(e,t){this.drawCalls++,this.triangles+=e/3*t}}
//# sourceMappingURL=render-stats.js.map
