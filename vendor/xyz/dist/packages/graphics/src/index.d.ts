import type { Scene } from '../../core/src/scene.js';
import type { RenderStats } from './render-stats.js';
import type { Material2D, PostProcessor2D } from '../../core/src/materials2d/index.js';
import type { FrameEffects, RenderSnapshot } from './render2d-contract.js';
import type { Texture, Texture2DSource } from '../../assets/src/index.js';
import type { Rect2D } from '../../core/src/gameplay/contracts.js';
import type { IsolatedGroup2D } from '../../core/src/rendering2d/isolated-group.js';
import type { RenderTexture2D, RenderTextureOptions2D } from './render-texture2d.js';
export { RenderTexture2D } from './render-texture2d.js';
export type { RenderTextureOptions2D } from './render-texture2d.js';
export type { RenderStats } from './render-stats.js';
export interface RenderToTextureOptions2D {
    clear?: boolean;
    bounds?: Rect2D;
}
export interface ExtractPixelsOptions2D {
    region?: Rect2D;
}
export interface GenerateTextureOptions2D {
    bounds?: Rect2D;
    resolution?: number;
}
export type { FrameEffects, RenderSnapshot, TransitionFrame, } from './render2d-contract.js';
export { XYZError, GraphicsError, WebGPUNotSupportedError, WebGPUInitializationError, WebGPUDeviceLostError, GraphicsBackendUnavailableError, UnsupportedGraphicsError, WebGL2InitializationError, WebGL2ContextLostError, Canvas2DInitializationError, } from './errors.js';
export type GraphicsBackend = 'webgpu' | 'webgl2' | 'canvas2d';
export type RendererPreference = GraphicsBackend | 'auto';
export interface GraphicsCapabilities {
    readonly threeD: boolean;
    readonly compute: boolean;
    readonly customShaders: boolean;
    readonly storageBuffers: boolean;
    readonly instancing: boolean;
    readonly maxTextureSize: number;
}
export interface Renderer {
    readonly backend: GraphicsBackend;
    readonly capabilities: GraphicsCapabilities;
    /** Counters for the last rendered frame; the object is reused, so copy values to keep them. */
    readonly stats: RenderStats;
    initialize(canvas: HTMLCanvasElement): Promise<void>;
    beginFrame(): void;
    render(scene?: Scene, width?: number, height?: number, effects?: FrameEffects): void;
    captureScene(scene: Scene, width: number, height: number): Promise<RenderSnapshot>;
    prepareMaterial(material: Material2D): Promise<void>;
    preparePostProcessor(processor: PostProcessor2D): Promise<void>;
    createRenderTexture(options: RenderTextureOptions2D): RenderTexture2D;
    renderToTexture(target: RenderTexture2D, content: Scene | IsolatedGroup2D, options?: RenderToTextureOptions2D): Promise<void>;
    extractPixels(source: RenderTexture2D, options?: ExtractPixelsOptions2D): Promise<Uint8ClampedArray>;
    generateTexture(content: Scene | IsolatedGroup2D, options?: GenerateTextureOptions2D): Promise<Texture>;
    prepareTextures(sources: readonly Texture2DSource[]): Promise<void>;
    unloadTexture(source: Texture2DSource): void;
    endFrame(): void;
    resize(width: number, height: number): void;
    destroy(): void;
}
export declare function createRenderer(canvas: HTMLCanvasElement, preference: RendererPreference, onError: (error: Error) => void, options?: {
    antialias?: boolean;
    /** Rebuild WebGL2/WebGPU after context loss instead of failing. Defaults to true. */
    recover?: boolean;
    onLost?(error: Error): void;
    onRecovered?(): void;
}): Promise<Renderer>;
