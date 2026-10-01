import type { Scene } from '../../core/src/scene.js';
import type { Material2D, PostProcessor2D } from '../../core/src/materials2d/material2d.js';
import type { GraphicsCapabilities, Renderer } from './index.js';
import { type FrameEffects, type RenderSnapshot } from './render2d-contract.js';
import type { Texture, Texture2DSource } from '../../assets/src/index.js';
import { IsolatedGroup2D } from '../../core/src/rendering2d/isolated-group.js';
import type { Rect2D } from '../../core/src/gameplay/contracts.js';
import { type RenderStats } from './render-stats.js';
import { RenderTexture2D, type RenderTextureOptions2D } from './render-texture2d.js';
/** Sprite-only fallback; visible 3D meshes are deliberately unsupported. */
export declare class Canvas2DRenderer implements Renderer {
    private readonly onError;
    readonly backend: "canvas2d";
    /** Canvas2D has no 3D pass, so every counter stays zero. */
    readonly stats: RenderStats;
    readonly capabilities: GraphicsCapabilities;
    private canvas;
    private context;
    private readonly commands;
    private readonly spriteSource;
    private readonly render2D;
    private readonly targetOperations;
    private layerCanvas;
    private readonly snapshots;
    private transitionCanvas;
    private transitionContext;
    private frameActive;
    private frameRendered;
    private destroyed;
    private readonly onContextLost;
    constructor(onError: (error: Error) => void);
    initialize(canvas: HTMLCanvasElement): Promise<void>;
    beginFrame(): void;
    prepareMaterial(_material: Material2D): Promise<void>;
    preparePostProcessor(_effect: PostProcessor2D): Promise<void>;
    createRenderTexture(options: RenderTextureOptions2D): RenderTexture2D;
    renderToTexture(target: RenderTexture2D, content: Scene | IsolatedGroup2D, options?: {
        clear?: boolean;
        bounds?: Rect2D;
    }): Promise<void>;
    extractPixels(target: RenderTexture2D, options?: {
        region?: Rect2D;
    }): Promise<Uint8ClampedArray>;
    generateTexture(content: Scene | IsolatedGroup2D, options?: {
        bounds?: Rect2D;
        resolution?: number;
    }): Promise<Texture>;
    prepareTextures(sources: readonly Texture2DSource[]): Promise<void>;
    unloadTexture(source: Texture2DSource): void;
    private requireIdle;
    captureScene(scene: Scene, width: number, height: number): Promise<RenderSnapshot>;
    render(scene?: Scene, width?: number, height?: number, effects?: FrameEffects): void;
    private prepareScene;
    private drawFrame;
    private validateTransition;
    private requireTransitionContext;
    private composeTransition;
    private drawOutgoing;
    private releaseTransitionTarget;
    endFrame(): void;
    resize(width: number, height: number): void;
    destroy(): void;
    private requireContext;
}
