import { type Texture2DSource, type TextureView2D } from '../../../assets/src/index.js';
export type FilterKind2D = 'alpha' | 'color-matrix' | 'blur' | 'noise' | 'displacement';
/** Caller-owned validated native filter data. Destroying a layer never destroys its filters. */
export declare abstract class Filter2D extends EventTarget {
    readonly kind: FilterKind2D;
    readonly padding: number;
    private disposed;
    readonly uniforms: readonly number[];
    protected constructor(kind: FilterKind2D, uniforms: readonly number[], padding: number);
    get destroyed(): boolean;
    destroy(): void;
}
export declare class AlphaFilter2D extends Filter2D {
    readonly alpha: number;
    constructor(alpha: number);
}
export declare class ColorMatrixFilter2D extends Filter2D {
    readonly matrix: readonly number[];
    constructor(matrix: ArrayLike<number>);
}
export declare class BlurFilter2D extends Filter2D {
    readonly radius: number;
    readonly quality: number;
    constructor(options: {
        radius: number;
        quality?: number;
    });
}
export declare class NoiseFilter2D extends Filter2D {
    readonly amount: number;
    readonly seed: number;
    constructor(options: {
        amount: number;
        seed?: number;
    });
}
export declare class DisplacementFilter2D extends Filter2D {
    readonly texture: Texture2DSource;
    readonly view: TextureView2D | undefined;
    readonly scale: readonly [number, number];
    constructor(options: {
        texture?: Texture2DSource;
        view?: TextureView2D;
        scale: readonly [number, number];
    });
}
