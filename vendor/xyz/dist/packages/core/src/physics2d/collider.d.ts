import { Vector2 } from '../../../math/src/index.js';
import type { GameObject } from '../game-object.js';
export type ColliderKind = 'circle' | 'polygon';
export interface ColliderOptions {
    offset?: [number, number];
}
export declare function finite(value: number, name: string): number;
export declare function positive(value: number, name: string): number;
export declare function unsigned(value: number, name: string): number;
/** Reusable local geometry. Bodies and scene membership belong to the owner, not the shape. */
export declare class Collider2D {
    readonly kind: ColliderKind;
    readonly radius: number;
    readonly offset: Readonly<Vector2>;
    readonly vertices: readonly (readonly [number, number])[];
    sensor: boolean;
    private categoryBits;
    private maskBits;
    private queryGeometry;
    /** Prefer Colliders factories; construction validates and snapshots geometry. */
    constructor(kind: ColliderKind, radius: number, vertices: readonly (readonly [number, number])[], options?: ColliderOptions);
    get category(): number;
    set category(value: number);
    get mask(): number;
    set mask(value: number);
    containsPoint(point: Vector2, owner: GameObject): boolean;
}
export declare const Colliders: Readonly<{
    circle(radius: number, options?: ColliderOptions): Collider2D;
    box(width: number, height: number, options?: ColliderOptions): Collider2D;
    polygon(vertices: readonly [number, number][], options?: ColliderOptions): Collider2D;
}>;
/** Reused world geometry and AABB. Polygon winding stays counterclockwise after reflection. */
export declare class ShapeGeometry {
    readonly collider: Collider2D;
    readonly points: Float64Array;
    x: number;
    y: number;
    radius: number;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    inertiaPerMass: number;
    private readonly matrixSnapshot;
    constructor(collider: Collider2D);
    refresh(owner: GameObject): void;
    contains(x: number, y: number): boolean;
}
