import type { Scene } from '../../core/src/scene.js';
import type { Material2D, PostProcessor2D } from '../../core/src/materials2d/material2d.js';
import type { IsolatedGroup2D } from '../../core/src/rendering2d/isolated-group.js';
import type { Texture, Texture2DSource } from '../../assets/src/index.js';
import type { FrameEffects, RenderSnapshot } from './render2d-contract.js';
import type { Renderer, GraphicsBackend, GraphicsCapabilities, RenderToTextureOptions2D, ExtractPixelsOptions2D, GenerateTextureOptions2D } from './index.js';
import type { RenderTexture2D, RenderTextureOptions2D } from './render-texture2d.js';
import type { RenderStats } from './render-stats.js';
export interface ResilientRendererHooks {
    /** Called once when the GPU context/device is lost and recovery begins. */
    onLost?(error: Error): void;
    /** Called after a replacement renderer has taken over. */
    onRecovered?(): void;
}
/**
 * Rebuilds a WebGL2 or WebGPU renderer after context/device loss. Scenes, Textures and
 * geometry are CPU-owned, so they re-upload lazily; prepared 2D materials and
 * post-processors are prepared again on the replacement. Renderer-owned handles
 * (RenderTexture2D targets and snapshots) do not survive a loss.
 */
export declare class ResilientRenderer implements Renderer {
    private readonly create;
    private readonly report;
    private readonly hooks;
    readonly backend: GraphicsBackend;
    private current;
    private canvas;
    private destroyed;
    private ready;
    private recovering;
    private readonly abort;
    private readonly materials;
    private readonly processors;
    private size;
    /** Completed recoveries, for diagnostics. */
    recoveries: number;
    constructor(backend: GraphicsBackend, create: (onError: (error: Error) => void) => Renderer, report: (error: Error) => void, hooks?: ResilientRendererHooks);
    get stats(): RenderStats;
    get capabilities(): GraphicsCapabilities;
    /** True while a lost context is being rebuilt; frames are skipped meanwhile. */
    get isRecovering(): boolean;
    initialize(canvas: HTMLCanvasElement): Promise<void>;
    private readonly handleError;
    private recover;
    private contextRestored;
    private requireReady;
    beginFrame(): void;
    render(scene?: Scene, width?: number, height?: number, effects?: FrameEffects): void;
    endFrame(): void;
    resize(width: number, height: number): void;
    captureScene(scene: Scene, width: number, height: number): Promise<RenderSnapshot>;
    prepareMaterial(material: Material2D): Promise<void>;
    preparePostProcessor(processor: PostProcessor2D): Promise<void>;
    createRenderTexture(options: RenderTextureOptions2D): RenderTexture2D;
    renderToTexture(target: RenderTexture2D, content: Scene | IsolatedGroup2D, options?: RenderToTextureOptions2D): Promise<void>;
    extractPixels(source: RenderTexture2D, options?: ExtractPixelsOptions2D): Promise<Uint8ClampedArray>;
    generateTexture(content: Scene | IsolatedGroup2D, options?: GenerateTextureOptions2D): Promise<Texture>;
    prepareTextures(sources: readonly Texture2DSource[]): Promise<void>;
    unloadTexture(source: Texture2DSource): void;
    destroy(): void;
}
