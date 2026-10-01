import { type Texture2DSource } from '../../../assets/src/index.js';
import type { Rect2D } from '../gameplay/contracts.js';
import { Sprite, type SpriteOptions } from '../sprite.js';
export interface SpriteSheetGridOptions {
    frameWidth: number;
    frameHeight: number;
    columns?: number;
    rows?: number;
    origin?: [number, number];
    spacing?: [number, number];
}
export type SpriteSheetSpriteOptions = Omit<SpriteOptions, 'texture' | 'source' | 'view'>;
export declare function validatedRegion(texture: Texture2DSource, frame: Rect2D): Readonly<Rect2D>;
/** Frame snapshots borrow a single atlas; no cropped bitmap is allocated. */
export declare class SpriteSheet {
    readonly texture: Texture2DSource;
    readonly frames: readonly Readonly<Rect2D>[];
    constructor(texture: Texture2DSource, frames: readonly Rect2D[]);
    static grid(texture: Texture2DSource, options: SpriteSheetGridOptions): SpriteSheet;
    getFrame(index: number): Readonly<Rect2D>;
    createSprite(index: number, options?: SpriteSheetSpriteOptions): Sprite;
}
