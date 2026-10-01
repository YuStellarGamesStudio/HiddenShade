import { BitmapFontAsset } from './bitmap-font.js';
import { FontAsset } from './font-asset.js';
export interface DynamicBitmapFontOptions {
    alphabet: string;
    fontSize: number;
    fontWeight?: string | number;
    fontStyle?: 'normal' | 'italic' | 'oblique';
    pageSize?: number;
    padding?: number;
    color?: string;
    kerning?: boolean;
    signal?: AbortSignal;
}
/** Native measured code-point RGBA atlas, not shaping, SDF or MSDF. Pages belong to caller. */
export declare function generateBitmapFont(font: FontAsset, options: DynamicBitmapFontOptions): Promise<BitmapFontAsset>;
