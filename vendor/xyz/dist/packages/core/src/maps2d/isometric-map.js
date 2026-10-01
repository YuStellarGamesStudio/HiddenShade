import{TileMap as e}from"./tile-map.js";export class IsometricMap extends e{constructor(e){let t=e.elevationStep??e.tileHeight/2;if(!Number.isFinite(t)||t<0)throw RangeError(`elevationStep must be finite and nonnegative.`);super(e),this.isometric=!0,this.elevationStep=t}}
//# sourceMappingURL=isometric-map.js.map
