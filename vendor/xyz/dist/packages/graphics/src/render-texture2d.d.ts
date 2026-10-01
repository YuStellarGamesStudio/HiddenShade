import type { Rect2D } from '../../core/src/gameplay/contracts.js';
export interface RenderTextureOptions2D {
    width: number;
    height: number;
    resolution?: number;
}
export interface RenderTextureSize2D {
    readonly width: number;
    readonly height: number;
    readonly logicalWidth: number;
    readonly logicalHeight: number;
    readonly resolution: number;
}
interface Ownership {
    owner: object;
    resize: (size: RenderTextureSize2D) => void;
    release: () => void;
    dependencies: Set<RenderTexture2D>;
}
export declare function validateRenderTextureSize2D(options: RenderTextureOptions2D, maximum?: number): RenderTextureSize2D;
/** Mutable renderer-owned pixels; unlike Texture, this resource has no CPU image. */
export declare class RenderTexture2D {
    readonly kind: "render";
    private size;
    private disposed;
    private revision;
    constructor(token: symbol, size: RenderTextureSize2D);
    get width(): number;
    get height(): number;
    get logicalWidth(): number;
    get logicalHeight(): number;
    get resolution(): number;
    get version(): number;
    get destroyed(): boolean;
    resize(options: RenderTextureOptions2D): void;
    destroy(): void;
    /** Internal publication occurs only after a successful native render submission. */
    publish(owner: object, dependencies: readonly RenderTexture2D[]): void;
    private requireOwnership;
}
export declare function createOwnedRenderTexture2D(owner: object, size: RenderTextureSize2D, resize: Ownership['resize'], release: Ownership['release']): RenderTexture2D;
export declare function assertRenderTextureOwner2D(texture: RenderTexture2D, owner: object): void;
export declare function validateRenderTextureDependencies2D(target: RenderTexture2D, dependencies: readonly RenderTexture2D[], owner: object): void;
export declare function validateRenderTextureRegion2D(texture: RenderTexture2D, region?: Readonly<Rect2D>): Rect2D;
export {};
