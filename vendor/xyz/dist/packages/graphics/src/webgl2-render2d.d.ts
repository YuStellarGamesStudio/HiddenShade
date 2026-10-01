import { Texture, type Texture2DSource } from '../../assets/src/index.js';
import type { Scene } from '../../core/src/scene.js';
import type { Rect2D } from '../../core/src/gameplay/contracts.js';
import { IsolatedGroup2D } from '../../core/src/rendering2d/isolated-group.js';
import type { Material2D, PostProcessor2D } from '../../core/src/materials2d/material2d.js';
import { RenderCommandBuffer2D } from './render2d-contract.js';
import { RenderTexture2D, type RenderTextureOptions2D } from './render-texture2d.js';
export interface GLTarget2D {
    framebuffer: WebGLFramebuffer;
    texture: WebGLTexture;
    width: number;
    height: number;
}
export interface GLRender2DHooks {
    owner: object;
    createTarget(width: number, height: number): GLTarget2D;
    deleteTarget(target: GLTarget2D): void;
    createProgram(vertex: string, fragment: string, label: string): WebGLProgram;
    source(source: Texture2DSource): WebGLTexture;
    material(effect: Material2D): WebGLProgram;
    processor(effect: PostProcessor2D): WebGLProgram;
    assertIdle(): void;
    assertAlive(): void;
}
/** Native local command execution, independent from 3D and immutable frame capture. */
export declare class WebGLRender2D {
    private readonly gl;
    private readonly hooks;
    private readonly quad;
    private readonly sourceQuad;
    private readonly appearance;
    private readonly matrix;
    private readonly mapping;
    private readonly tileMatrix;
    private readonly inverse;
    private readonly programs;
    private readonly layers;
    private readonly targets;
    private readonly meshes;
    private readonly particles;
    private readonly captureCommands;
    private readonly emptyVAO;
    private readonly quadProgram;
    private readonly meshProgram;
    private readonly particleProgram;
    private readonly passProgram;
    private readonly blendProgram;
    private readonly matrixRows;
    private readonly dependencies;
    private readonly samplers;
    private resolution;
    private viewportWidth;
    private viewportHeight;
    private disposed;
    constructor(gl: WebGL2RenderingContext, hooks: GLRender2DHooks);
    private register;
    private uniform;
    preflight(commands: RenderCommandBuffer2D, scene: Scene, width: number, height: number, resolution: number): void;
    private validateSource;
    private validateCommands;
    private validateBounds;
    draw(commands: RenderCommandBuffer2D, scene: Scene, target: GLTarget2D, width: number, height: number): void;
    private bindTarget;
    private objectMatrix;
    private useQuad;
    private sampler;
    private drawCommands;
    private drawSprite;
    private drawMesh;
    private drawParticles;
    private layer;
    private clear;
    private drawLayer;
    private compositeLayer;
    private drawMask;
    private pass;
    createRenderTexture(options: RenderTextureOptions2D): RenderTexture2D;
    source(texture: RenderTexture2D): WebGLTexture;
    renderToTexture(target: RenderTexture2D, content: Scene | IsolatedGroup2D, options?: {
        clear?: boolean;
        bounds?: Rect2D;
    }): Promise<void>;
    private drawSceneEffects;
    extractPixels(target: RenderTexture2D, options?: {
        region?: Rect2D;
    }): Promise<Uint8ClampedArray>;
    generateTexture(content: Scene | IsolatedGroup2D, options?: {
        bounds?: Rect2D;
        resolution?: number;
    }): Promise<Texture>;
    destroy(): void;
}
