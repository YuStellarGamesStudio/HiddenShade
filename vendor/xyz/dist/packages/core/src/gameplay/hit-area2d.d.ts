import { Vector2 } from '../../../math/src/index.js';
import type { Rect2D } from './contracts.js';
export type HitAreaKind2D = 'rectangle' | 'circle' | 'polygon';
/** Immutable local-space picking geometry. Polygon edges are included. */
export declare class HitArea2D {
    readonly kind: HitAreaKind2D;
    readonly bounds: Readonly<Rect2D>;
    readonly points: readonly (readonly [number, number])[];
    private readonly radius;
    private constructor();
    static rectangle(rect: Rect2D): HitArea2D;
    static circle(x: number, y: number, radius: number): HitArea2D;
    static polygon(points: readonly (readonly [number, number])[]): HitArea2D;
    containsPoint(point: Vector2): boolean;
}
