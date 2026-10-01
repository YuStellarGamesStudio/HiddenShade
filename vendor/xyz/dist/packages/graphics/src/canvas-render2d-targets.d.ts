import { Texture } from '../../assets/src/index.js';
import { Scene } from '../../core/src/scene.js';
import { IsolatedGroup2D } from '../../core/src/rendering2d/isolated-group.js';
import type { Rect2D } from '../../core/src/gameplay/contracts.js';
import { RenderTexture2D, type RenderTextureOptions2D } from './render-texture2d.js';
import type { CanvasRender2D } from './canvas-render2d.js';
export declare class CanvasRender2DTargets {
    private readonly owner;
    private readonly idle;
    private readonly engine;
    private readonly alive;
    readonly canvases: Map<RenderTexture2D, HTMLCanvasElement>;
    private readonly detachedScene;
    constructor(owner: object, idle: () => void, engine: CanvasRender2D, alive: () => boolean);
    create(options: RenderTextureOptions2D): RenderTexture2D;
    render(target: RenderTexture2D, content: Scene | IsolatedGroup2D, options?: {
        clear?: boolean;
        bounds?: Rect2D;
    }): Promise<void>;
    extract(target: RenderTexture2D, options?: {
        region?: Rect2D;
    }): Promise<Uint8ClampedArray>;
    generate(content: Scene | IsolatedGroup2D, options?: {
        bounds?: Rect2D;
        resolution?: number;
    }): Promise<Texture>;
    destroy(): void;
}
