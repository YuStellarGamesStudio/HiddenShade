import { type Texture2DSource, type TextureView2D } from '../../../assets/src/index.js';
import type { Vector2 } from '../../../math/src/index.js';
import type { Rect2D } from '../gameplay/contracts.js';
import { GraphicsPath2D, type Affine2D } from '../graphics2d/graphics-path2d.js';
export interface Mask2DOptions {
    inverse?: boolean;
    transform?: Affine2D;
}
/** Immutable borrowed mask. Image hit testing intentionally uses bounds, never sampled pixels. */
export declare class Mask2D {
    readonly kind: 'rect' | 'path' | 'image';
    readonly rect: Readonly<Rect2D> | undefined;
    readonly path: GraphicsPath2D | undefined;
    readonly texture: Texture2DSource | undefined;
    readonly view: TextureView2D | undefined;
    readonly channel: 'alpha' | 'red';
    readonly inverse: boolean;
    readonly transform: Affine2D;
    private constructor();
    static rectangle(rect: Readonly<Rect2D>, options?: Mask2DOptions): Mask2D;
    static path(path: GraphicsPath2D, options?: Mask2DOptions): Mask2D;
    static image(options: Mask2DOptions & {
        texture?: Texture2DSource;
        view?: TextureView2D;
        channel?: 'alpha' | 'red';
    }): Mask2D;
    containsPoint(point: Vector2): boolean;
    getBounds(out?: Rect2D): Rect2D;
}
