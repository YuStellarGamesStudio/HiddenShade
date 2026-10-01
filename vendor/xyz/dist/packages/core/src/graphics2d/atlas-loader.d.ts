import { TextureView2D } from '../../../assets/src/index.js';
export interface AtlasAnimationFrame2D {
    readonly view: TextureView2D;
    readonly duration: number;
}
export interface AtlasAsset {
    readonly views: ReadonlyMap<string, TextureView2D>;
    readonly animations: ReadonlyMap<string, readonly AtlasAnimationFrame2D[]>;
    destroy(): void;
}
export interface AtlasLoadOptions {
    signal?: AbortSignal;
}
/** TexturePacker JSON hash/array and bounded multipage acquisition; pages are uniquely owned. */
export declare class AtlasLoader {
    private readonly baseURL?;
    constructor(baseURL?: string | undefined);
    load(address: string, options?: AtlasLoadOptions): Promise<AtlasAsset>;
}
