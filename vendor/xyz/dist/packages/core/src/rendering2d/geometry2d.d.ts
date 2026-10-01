import type { Rect2D } from '../gameplay/contracts.js';
export interface Geometry2DOptions {
    positions: ArrayLike<number>;
    uvs: ArrayLike<number>;
    indices: ArrayLike<number>;
    /** Positive homogeneous UV denominator weights; ordinary geometry uses one. */
    uvQ?: ArrayLike<number>;
}
/** Caller-owned, copied geometry. Mutable arrays require explicit markUpdated(). */
export declare class Geometry2D {
    readonly positions: Float32Array;
    readonly uvs: Float32Array;
    readonly indices: Uint32Array;
    readonly uvQ: Float32Array;
    private revision;
    constructor(options: Geometry2DOptions);
    get version(): number;
    validate(): void;
    markUpdated(): void;
    getBounds(out?: Rect2D): Rect2D;
    containsPoint(x: number, y: number): boolean;
}
