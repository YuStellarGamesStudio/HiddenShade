import { Vector2 } from '../../../math/src/index.js';
import type { Rect2D } from '../gameplay/contracts.js';
import { Sprite, type SpriteOptions } from '../sprite.js';
import { type GraphicsInstruction2D } from './graphics-path2d.js';
export interface Graphics2DOptions extends Omit<SpriteOptions, 'texture' | 'view' | 'source'> {
    resolution?: number;
}
/** Retained immutable CPU paths rasterized into an owned bitmap, not GPU vector geometry. */
export declare class Graphics2D extends Sprite {
    private revision;
    private requestedInstructions;
    private requestedResolution;
    private displayedInstructions;
    private displayedResolution;
    private rasterOrigin;
    private ownedTexture;
    private readonly hitPoint;
    private constructor();
    static create(instructions: readonly GraphicsInstruction2D[], options?: Graphics2DOptions): Promise<Graphics2D>;
    get instructions(): readonly GraphicsInstruction2D[];
    get resolution(): number;
    setInstructions(instructions: readonly GraphicsInstruction2D[]): Promise<void>;
    setResolution(resolution: number): Promise<void>;
    private refresh;
    getLocalBounds(out?: Rect2D): Rect2D;
    containsPoint(point: Vector2): boolean;
    protected onDestroy(): void;
    private static rasterize;
}
