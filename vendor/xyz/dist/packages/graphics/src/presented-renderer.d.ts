import type { Scene } from '../../core/src/scene.js';
import type { Material2D, PostProcessor2D } from '../../core/src/materials2d/material2d.js';
import type { FrameEffects, RenderSnapshot } from './render2d-contract.js';
import type { Renderer, GraphicsBackend, GraphicsCapabilities, RenderToTextureOptions2D, ExtractPixelsOptions2D, GenerateTextureOptions2D } from './index.js';
import type { RenderStats } from './render-stats.js';
import type { Texture, Texture2DSource } from '../../assets/src/index.js';
import type { IsolatedGroup2D } from '../../core/src/rendering2d/isolated-group.js';
import type { RenderTexture2D, RenderTextureOptions2D } from './render-texture2d.js';
/** Auto selection keeps backend context binding away from the caller's canvas. */
export declare class PresentedRenderer implements Renderer {
    private readonly renderer;
    private readonly target;
    private canvas;
    private context;
    private destroyed;
    constructor(renderer: Renderer, target: HTMLCanvasElement);
    get backend(): GraphicsBackend;
    get stats(): RenderStats;
    get capabilities(): GraphicsCapabilities;
    initialize(canvas: HTMLCanvasElement): Promise<void>;
    beginFrame(): void;
    prepareMaterial(material: Material2D): Promise<void>;
    preparePostProcessor(effect: PostProcessor2D): Promise<void>;
    captureScene(scene: Scene, width: number, height: number): Promise<RenderSnapshot>;
    createRenderTexture(options: RenderTextureOptions2D): RenderTexture2D;
    renderToTexture(target: RenderTexture2D, content: Scene | IsolatedGroup2D, options?: RenderToTextureOptions2D): Promise<void>;
    extractPixels(source: RenderTexture2D, options?: ExtractPixelsOptions2D): Promise<Uint8ClampedArray>;
    generateTexture(content: Scene | IsolatedGroup2D, options?: GenerateTextureOptions2D): Promise<Texture>;
    prepareTextures(sources: readonly Texture2DSource[]): Promise<void>;
    unloadTexture(source: Texture2DSource): void;
    render(scene?: Scene, width?: number, height?: number, effects?: FrameEffects): void;
    endFrame(): void;
    resize(width: number, height: number): void;
    destroy(): void;
    private requireContext;
}
