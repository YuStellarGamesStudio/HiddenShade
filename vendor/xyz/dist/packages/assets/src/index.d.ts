import { XYZError } from '../../graphics/src/errors.js';
import type { LoadTask } from './preload/preload-batch.js';
export { PreloadBatch } from './preload/preload-batch.js';
export type { LoadTask, PreloadProgress, PreloadState, } from './preload/preload-batch.js';
export { CanvasTexture2D, TextureView2D } from './texture2d.js';
export type { Texture2DSource, TextureView2DOptions, TextureBorders2D, TextureRect2D, } from './texture2d.js';
export { FontAsset } from './fonts/font-asset.js';
export type { FontAssetOptions } from './fonts/font-asset.js';
export { BitmapFontAsset, BitmapFontLoader } from './fonts/bitmap-font.js';
export type { BitmapGlyph, BitmapKerning, BitmapFontData, } from './fonts/bitmap-font.js';
export { generateBitmapFont } from './fonts/generate-bitmap-font.js';
export type { DynamicBitmapFontOptions } from './fonts/generate-bitmap-font.js';
export { AssetManifest } from './manifest/asset-manifest.js';
export type { ManifestAssetType, ManifestEntry, AssetManifestOptions, ManifestAssetTypes, } from './manifest/asset-manifest.js';
export interface ResourceLoadOptions {
    signal?: AbortSignal;
    maxBytes?: number;
}
export declare class AssetError extends XYZError {
}
/** Owns its decoded bitmap; destroying a Sprite does not destroy its Texture. */
export declare class Texture {
    readonly image: ImageBitmap;
    readonly kind = "image";
    readonly version = 0;
    readonly width: number;
    readonly height: number;
    private disposed;
    constructor(image: ImageBitmap);
    /** Decode into a separately owned bitmap with straight (not premultiplied) alpha. */
    static fromImage(source: ImageBitmapSource): Promise<Texture>;
    get destroyed(): boolean;
    destroy(): void;
}
/** One decoded CPU bitmap and one in-flight request per canonical URL. */
export declare class AssetLoader {
    private readonly baseURL?;
    private readonly cache;
    private disposed;
    private readonly requests;
    constructor(baseURL?: string | undefined);
    /** Subscriber cancellation leaves the loader-owned shared request/cache intact. */
    loadTexture(url: string, options?: {
        signal?: AbortSignal;
    }): Promise<Texture>;
    textureTask(key: string, url: string): LoadTask<Texture>;
    /** Acquires a unique caller-owned image, never a borrowed cache entry. */
    loadTextureOwned(url: string, options?: {
        signal?: AbortSignal;
    }): Promise<Texture>;
    loadBinary(url: string, options?: ResourceLoadOptions): Promise<ArrayBuffer>;
    loadText(url: string, options?: ResourceLoadOptions): Promise<string>;
    loadJSON<T = unknown>(url: string, options?: ResourceLoadOptions): Promise<T>;
    destroy(): void;
    private fetchTexture;
}
