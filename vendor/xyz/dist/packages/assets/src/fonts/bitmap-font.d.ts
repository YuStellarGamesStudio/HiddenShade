import { Texture, type AssetLoader } from '../index.js';
export interface BitmapGlyph {
    readonly id: number;
    readonly page: number;
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly xoffset: number;
    readonly yoffset: number;
    readonly xadvance: number;
}
export interface BitmapKerning {
    readonly first: number;
    readonly second: number;
    readonly amount: number;
}
export interface BitmapFontData {
    readonly size: number;
    readonly lineHeight: number;
    readonly base: number;
    readonly glyphs: readonly BitmapGlyph[];
    readonly kernings: readonly BitmapKerning[];
}
/** Caller-owned RGBA pages; destroy only after all SpriteText borrowers detach. */
export declare class BitmapFontAsset implements BitmapFontData {
    readonly size: number;
    readonly lineHeight: number;
    readonly base: number;
    readonly glyphs: readonly BitmapGlyph[];
    readonly kernings: readonly BitmapKerning[];
    readonly pages: readonly Texture[];
    private disposed;
    constructor(pages: readonly Texture[], data: BitmapFontData);
    get destroyed(): boolean;
    destroy(): void;
}
interface FontDescriptor extends BitmapFontData {
    pages: string[];
    width: number;
    height: number;
}
/** AngelCode text and JSON equivalents only; no XML or distance-field fonts. */
export declare class BitmapFontLoader {
    private readonly loader;
    constructor(loader: AssetLoader);
    static parse(source: string, format?: 'text' | 'json'): FontDescriptor;
    load(url: string, options?: {
        format?: 'text' | 'json';
        signal?: AbortSignal;
    }): Promise<BitmapFontAsset>;
}
export {};
