import { Sprite } from './sprite.js';
/** A rasterized shape using the same texture and rendering path as every Sprite. */
export declare class Primitive2D extends Sprite {
    private readonly ownedTexture;
    private constructor();
    static rectangle(width: number, height: number, color: string): Promise<Primitive2D>;
    static circle(radius: number, color: string): Promise<Primitive2D>;
    protected onDestroy(): void;
    private static validateDimension;
}
