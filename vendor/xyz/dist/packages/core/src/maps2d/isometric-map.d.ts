import { TileMap, type TileMapOptions } from './tile-map.js';
export interface IsometricMapOptions extends TileMapOptions {
    elevationStep?: number;
}
/** Isometric atlas rectangles use anchor (0.5, 0), with their origin at the diamond's top vertex. */
export declare class IsometricMap extends TileMap {
    constructor(options: IsometricMapOptions);
}
