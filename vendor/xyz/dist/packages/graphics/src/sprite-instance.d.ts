import type { Sprite } from '../../core/src/sprite.js';
import type { Texture2DSource, TextureView2D } from '../../assets/src/index.js';
import type { GameObject } from '../../core/src/game-object.js';
import type { Rect2D } from '../../core/src/gameplay/contracts.js';
/** Unpacked local coverage and packed UV basis, shared by every native backend. */
export interface TextureQuad2D {
    x: number;
    y: number;
    width: number;
    height: number;
    naturalWidth: number;
    naturalHeight: number;
    u0: number;
    v0: number;
    ux: number;
    vx: number;
    uy: number;
    vy: number;
    trimX: number;
    trimY: number;
    trimWidth: number;
    trimHeight: number;
    resolution: number;
}
export declare function createTextureQuad2D(): TextureQuad2D;
export declare function getTextureQuad2D(texture: Texture2DSource, view: TextureView2D | undefined, source: Readonly<Rect2D> | undefined, out: TextureQuad2D): TextureQuad2D;
export declare function getSpriteQuad2D(sprite: Sprite, out: TextureQuad2D): TextureQuad2D;
/** Root appearance is applied at composition, never baked into a reusable local cache. */
export declare function getRelativeAppearance2D(object: GameObject, root: GameObject | undefined, out: Float32Array): void;
/** Nine float32x4 attributes shared by every native quad, sprite and particle draw. */
export declare const QUAD_FLOATS = 36;
export declare const QUAD_BYTES: number;
