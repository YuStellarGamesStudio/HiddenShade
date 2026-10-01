import { Sprite } from './sprite.js';
export interface Text2DOptions {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    fontStyle?: 'normal' | 'italic' | 'oblique';
    color?: string;
    padding?: number;
    wrapWidth?: number;
    breakWords?: boolean;
    align?: 'left' | 'center' | 'right';
    lineHeight?: number;
    letterSpacing?: number;
    stroke?: Readonly<{
        color: string;
        width: number;
    }>;
    shadow?: Readonly<{
        color: string;
        blur?: number;
        offsetX?: number;
        offsetY?: number;
    }>;
    resolution?: number;
}
export type Text2DStyle = Readonly<Required<Omit<Text2DOptions, 'wrapWidth' | 'stroke' | 'shadow'>> & Pick<Text2DOptions, 'wrapWidth' | 'stroke' | 'shadow'>>;
/** Rasterized browser-shaped full lines, using the ordinary Sprite pipeline. */
export declare class Text2D extends Sprite {
    private content;
    private ownedTexture;
    private revision;
    private requestedText;
    private requestedStyle;
    private displayedStyle;
    private constructor();
    static create(text: string, options?: Text2DOptions): Promise<Text2D>;
    get text(): string;
    get style(): Text2DStyle;
    setText(text: string): Promise<void>;
    /** Merges with the latest requested style and text, not an obsolete display. */
    setStyle(options: Text2DOptions): Promise<void>;
    private refresh;
    protected onDestroy(): void;
    private static validateText;
    private static rasterize;
}
