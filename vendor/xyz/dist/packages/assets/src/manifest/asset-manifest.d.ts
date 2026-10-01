import { type AssetLoader, type Texture } from '../index.js';
import { PreloadBatch } from '../preload/preload-batch.js';
import { type BitmapFontAsset } from '../fonts/bitmap-font.js';
import { FontAsset, type FontAssetOptions } from '../fonts/font-asset.js';
export type ManifestAssetType = 'texture' | 'binary' | 'text' | 'json' | 'font' | 'bitmapFont' | 'custom';
interface ManifestBase {
    readonly aliases: string | readonly string[];
}
export type ManifestEntry = ManifestBase & ({
    readonly type: 'texture';
    readonly url: string;
    readonly owned?: boolean;
} | {
    readonly type: 'binary' | 'text' | 'json';
    readonly url: string;
    readonly maxBytes?: number;
} | {
    readonly type: 'font';
    readonly url: string;
    readonly options: Omit<FontAssetOptions, 'signal'>;
} | {
    readonly type: 'bitmapFont';
    readonly url: string;
    readonly format?: 'text' | 'json';
} | {
    readonly type: 'custom';
    readonly load: (signal: AbortSignal) => Promise<unknown>;
    readonly owned: boolean;
    readonly dispose?: (value: unknown) => void;
});
export interface AssetManifestOptions {
    readonly entries: readonly ManifestEntry[];
    readonly bundles?: Readonly<Record<string, readonly string[]>>;
}
export interface ManifestAssetTypes {
    texture: Texture;
    binary: ArrayBuffer;
    text: string;
    json: unknown;
    font: FontAsset;
    bitmapFont: BitmapFontAsset;
    custom: unknown;
}
/** Aliases compile to the existing Scene-compatible task-count PreloadBatch. */
export declare class AssetManifest {
    private readonly aliases;
    private readonly bundles;
    private readonly values;
    private active?;
    constructor(options: AssetManifestOptions);
    /** A manifest allows one unsettled compiled batch; shared AssetLoader work remains subscriber-safe. */
    compile(loader: AssetLoader, selections: readonly string[]): PreloadBatch;
    get<T extends ManifestAssetType>(alias: string, type: T): ManifestAssetTypes[T];
    /** Explicit caller barrier: detach every borrower before releasing owned acquisitions. */
    unload(selections: readonly string[], options: {
        borrowersRemoved: true;
    }): void;
    private resolve;
    private isOwned;
    private release;
    private acquire;
}
export {};
