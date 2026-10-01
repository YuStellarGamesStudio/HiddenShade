import { Vector2 } from '../../../math/src/index.js';
import { Sprite, type SpriteOptions } from '../sprite.js';
export interface TilingSprite2DOptions extends SpriteOptions {
    width: number;
    height: number;
    tilePosition?: [number, number];
    tileScale?: [number, number];
    tileRotation?: number;
}
/** One bounded coverage quad with an independently transformed repeating source. */
export declare class TilingSprite2D extends Sprite {
    readonly tilePosition: Vector2;
    readonly tileScale: Vector2;
    private coverageWidth;
    private coverageHeight;
    private patternRotation;
    constructor(options: TilingSprite2DOptions);
    get width(): number;
    get height(): number;
    get tileWidth(): number;
    get tileHeight(): number;
    get tileRotation(): number;
    set tileRotation(value: number);
    resize(width: number, height: number): void;
    /** Mutable vectors are validated at submission, not cached behind setters. */
    validateTileTransform(): void;
}
