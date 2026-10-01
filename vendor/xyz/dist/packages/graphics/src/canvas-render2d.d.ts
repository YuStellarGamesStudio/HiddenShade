import type { Scene } from '../../core/src/scene.js';
import type { IsolatedGroup2D } from '../../core/src/rendering2d/isolated-group.js';
import { RenderCommandBuffer2D } from './render2d-contract.js';
import { CanvasSpriteSource } from './canvas-sprite-source.js';
import type { Rect2D } from '../../core/src/gameplay/contracts.js';
export declare class CanvasRender2D {
    readonly sources: CanvasSpriteSource;
    private readonly caches;
    private readonly quad;
    private readonly appearance;
    private readonly matrix;
    private readonly inverses;
    private readonly product;
    private readonly tile;
    private readonly tinted;
    private readonly maskCanvas;
    private tileMatrix;
    private readonly paths;
    constructor(sources: CanvasSpriteSource);
    preflight(commands: RenderCommandBuffer2D, depth?: number): void;
    private validateBounds;
    draw(context: CanvasRenderingContext2D, commands: RenderCommandBuffer2D, scene: Scene, scaleX: number, scaleY: number, root?: IsolatedGroup2D, bounds?: Rect2D): void;
    private transform;
    private mask;
    destroy(): void;
}
