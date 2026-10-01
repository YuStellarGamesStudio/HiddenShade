import { Texture, type Texture2DSource } from '../../assets/src/index.js';
import type { Scene } from '../../core/src/scene.js';
import type { Rect2D } from '../../core/src/gameplay/contracts.js';
import { IsolatedGroup2D } from '../../core/src/rendering2d/isolated-group.js';
import { RenderCommandBuffer2D } from './render2d-contract.js';
import { RenderTexture2D, type RenderTextureOptions2D } from './render-texture2d.js';
import { type GPUColorTarget, type WebGPU2DEffects } from './webgpu-2d/effects.js';
export interface WebGPURender2DHooks {
    owner: object;
    /** Uploads or reuses a CPU-backed source; render targets are owned here. */
    upload(source: Exclude<Texture2DSource, RenderTexture2D>): GPUTexture;
    assertIdle(): void;
    assertAlive(): void;
}
/** Native local command execution, independent from 3D and immutable frame capture. */
export declare class WebGPURender2D {
    private readonly device;
    private readonly effects;
    private readonly hooks;
    private readonly quad;
    private readonly sourceQuad;
    private readonly appearance;
    private readonly matrix;
    private readonly mapping;
    private readonly tileMatrix;
    private readonly inverse;
    private readonly layers;
    private readonly targets;
    private readonly meshes;
    private readonly particles;
    private readonly captureCommands;
    private readonly dependencies;
    private readonly groups;
    private readonly samplers;
    private readonly retiredTextures;
    private readonly retiredBuffers;
    private readonly scratch;
    private readonly passLayout;
    private readonly passPipelineLayout;
    private readonly normal;
    private readonly replace;
    private readonly blends;
    private readonly multiply;
    private readonly meshPipeline;
    private readonly passPipeline;
    private readonly dummy;
    private uniformBuffer;
    private drawGroup;
    private instanceBuffer;
    private instanceData;
    private capacity;
    private required;
    private slot;
    private encoder;
    private pass;
    private passTarget;
    private resolution;
    private viewportWidth;
    private viewportHeight;
    private frame;
    private disposed;
    private constructor();
    static create(device: GPUDevice, effects: WebGPU2DEffects, hooks: WebGPURender2DHooks): Promise<WebGPURender2D>;
    private createDrawGroup;
    private createTarget;
    private retire;
    /** Call after the frame's command buffers are submitted; destroying earlier would invalidate them. */
    flushRetired(): void;
    private sampler;
    private textureOf;
    private textureGroup;
    preflight(commands: RenderCommandBuffer2D, scene: Scene, width: number, height: number, resolution: number): void;
    private validateSource;
    private validateGroup;
    private validateCommands;
    private validateBounds;
    /** Upper bound of uniform slots, which also bounds per-frame quad instances. */
    private count;
    private ensure;
    draw(commands: RenderCommandBuffer2D, scene: Scene, encoder: GPUCommandEncoder, target: GPUColorTarget, width: number, height: number): void;
    private begin;
    private finish;
    private open;
    private closePass;
    private allocate;
    private drawUniforms;
    private objectMatrix;
    private writeQuad;
    private drawCommands;
    private drawSprite;
    private drawMesh;
    private drawParticles;
    private layer;
    private drawLayer;
    private compositeLayer;
    private drawMask;
    private filterPass;
    createRenderTexture(options: RenderTextureOptions2D): RenderTexture2D;
    private clearTarget;
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
    source(texture: RenderTexture2D): GPUTexture;
    destroy(): void;
}
