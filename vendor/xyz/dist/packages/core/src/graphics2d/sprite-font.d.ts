import { BitmapFontAsset, type Texture2DSource } from '../../../assets/src/index.js';
import { Group2D } from '../gameplay/group2d.js';
import type { Rect2D } from '../gameplay/contracts.js';
import { SpriteSheet } from './sprite-sheet.js';
export interface SpriteFontOptions {
    alphabet: string;
    glyphWidth?: number;
    advance?: number;
    lineHeight: number;
    caseInsensitive?: boolean;
    fallback?: string;
}
export interface SpriteTextOptions {
    letterSpacing?: number;
    lineSpacing?: number;
    align?: 'left' | 'center' | 'right';
    wrapWidth?: number;
    breakWords?: boolean;
}
interface FontGlyph {
    readonly id: number;
    readonly texture: Texture2DSource;
    readonly source: Readonly<Rect2D>;
    readonly width: number;
    readonly xoffset: number;
    readonly yoffset: number;
    readonly advance: number;
}
/** A metrics snapshot borrowing either a manual sheet or caller-owned bitmap pages. */
export declare class SpriteFont {
    readonly sheet: SpriteSheet | undefined;
    readonly glyphWidth: number | undefined;
    readonly advance: number;
    readonly lineHeight: number;
    readonly caseInsensitive: boolean;
    private readonly indices;
    private readonly metrics;
    private readonly kernings;
    private readonly fallbackIndex;
    private readonly asset;
    constructor(source: SpriteSheet, options: SpriteFontOptions);
    constructor(source: BitmapFontAsset, options?: Pick<SpriteFontOptions, 'caseInsensitive' | 'fallback'>);
    private key;
    private map;
    getGlyphIndex(character: string): number;
    getGlyph(index: number): FontGlyph;
    getKerning(first: number | undefined, second: number): number;
    assertAvailable(): void;
}
/** Owns ordinary Sprite glyph objects, never the font or its atlas pages. Unicode code points, not shaping. */
export declare class SpriteText extends Group2D {
    readonly font: SpriteFont;
    private content;
    private glyphs;
    private readonly letterSpacing;
    private readonly lineSpacing;
    private readonly align;
    private readonly wrapWidth;
    private readonly breakWords;
    constructor(font: SpriteFont, text: string, options?: SpriteTextOptions);
    get text(): string;
    private measure;
    private lines;
    setText(text: string): void;
}
export {};
