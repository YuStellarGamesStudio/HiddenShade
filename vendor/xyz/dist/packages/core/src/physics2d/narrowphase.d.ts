import { Vector2 } from '../../../math/src/index.js';
import { ShapeGeometry } from './collider.js';
/** Mutable manifold is owned by one contact and never exposed directly in events. */
export declare class Manifold {
    nx: number;
    ny: number;
    penetration: number;
    count: number;
    readonly points: Vector2[];
    readonly normalImpulses: Float64Array<ArrayBuffer>;
    readonly tangentImpulses: Float64Array<ArrayBuffer>;
    readonly bounceVelocities: Float64Array<ArrayBuffer>;
    readonly clip: Float64Array<ArrayBuffer>;
}
export declare function collide(a: ShapeGeometry, b: ShapeGeometry, out: Manifold): boolean;
/** Exact circle/convex ray intersection. Inside starts hit at distance zero. */
export declare function rayDistance(shape: ShapeGeometry, x: number, y: number, dx: number, dy: number, maxDistance: number, normal: Vector2): number | undefined;
