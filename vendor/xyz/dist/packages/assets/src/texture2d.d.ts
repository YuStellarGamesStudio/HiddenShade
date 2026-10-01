import { Texture } from './index.js';
import type { RenderTexture2D } from '../../graphics/src/render-texture2d.js';
export type Texture2DSource = Texture | CanvasTexture2D | RenderTexture2D;
export interface TextureRect2D {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface TextureBorders2D {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
export interface TextureView2DOptions {
    frame: TextureRect2D;
    originalSize?: readonly [number, number];
    trim?: TextureRect2D;
    rotation?: 0 | 90;
    resolution?: number;
    defaultAnchor?: readonly [number, number];
    defaultBorders?: TextureBorders2D;
}
/** Immutable physical atlas metadata; the source remains borrowed. */
export declare class TextureView2D {
    readonly source: Texture2DSource;
    readonly frame: Readonly<TextureRect2D>;
    readonly originalSize: readonly [number, number];
    readonly trim: Readonly<TextureRect2D>;
    readonly rotation: 0 | 90;
    readonly resolution: number;
    readonly defaultAnchor: readonly [number, number] | undefined;
    readonly defaultBorders: Readonly<TextureBorders2D> | undefined;
    readonly width: number;
    readonly height: number;
    constructor(source: Texture2DSource, options: TextureView2DOptions);
    validate(): void;
}
/** Explicit snapshots, never a live canvas or an automatic per-frame copy. */
export declare class CanvasTexture2D {
    readonly kind = "canvas";
    private canvas;
    private disposed;
    private revision;
    constructor(source: CanvasImageSource);
    get image(): HTMLCanvasElement | OffscreenCanvas;
    get width(): number;
    get height(): number;
    get version(): number;
    get destroyed(): boolean;
    update(source: CanvasImageSource): void;
    destroy(): void;
}
