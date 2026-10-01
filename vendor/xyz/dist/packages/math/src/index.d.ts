export declare class Vector2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    set(x: number, y: number): this;
    copy(other: Vector2): this;
    clone(): Vector2;
    add(other: Vector2): this;
    subtract(other: Vector2): this;
    scale(factor: number): this;
    length(): number;
    normalize(): this;
}
/** Column-major affine matrix; transforms column vectors as translation * rotation * scale. */
export declare class Matrix3 {
    readonly elements: Float32Array<ArrayBuffer>;
    constructor();
    identity(): this;
    copy(other: Matrix3): this;
    multiply(other: Matrix3): this;
    compose(position: Vector2, rotation: number, scale: Vector2, pivot?: Vector2, skew?: Vector2): this;
    invert(): this;
    transformPoint(point: Vector2, out?: Vector2): Vector2;
}
export interface Transform2DOptions {
    position?: Vector2;
    rotation?: number;
    scale?: Vector2;
    pivot?: Vector2;
    skew?: Vector2;
}
export declare class Transform2D {
    readonly position: Vector2;
    rotation: number;
    readonly scale: Vector2;
    readonly pivot: Vector2;
    readonly skew: Vector2;
    readonly matrix: Matrix3;
    constructor(options?: Transform2DOptions);
    updateMatrix(): Matrix3;
}
export { Matrix4, Quaternion, Transform3D, Vector3 } from './math3d.js';
export type { Transform3DOptions } from './math3d.js';
