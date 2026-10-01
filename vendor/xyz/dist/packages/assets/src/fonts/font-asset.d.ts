import { type AssetLoader } from '../index.js';
export interface FontAssetOptions {
    family: string;
    descriptors?: FontFaceDescriptors;
    signal?: AbortSignal;
    maxBytes?: number;
}
/** Owns exactly one browser FontFace registration, never another family's faces. */
export declare class FontAsset {
    readonly family: string;
    readonly ready: Promise<void>;
    private readonly controller;
    private face?;
    private disposed;
    constructor(loader: AssetLoader, url: string, options: FontAssetOptions);
    static load(loader: AssetLoader, url: string, options: FontAssetOptions): Promise<FontAsset>;
    get destroyed(): boolean;
    private acquire;
    destroy(): void;
}
