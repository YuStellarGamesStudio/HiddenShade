export declare class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    copy(other: Vector3): this;
    clone(): Vector3;
    add(other: Vector3): this;
    subtract(other: Vector3): this;
    scale(factor: number): this;
    length(): number;
    dot(other: Vector3): number;
    cross(other: Vector3): this;
    normalize(): this;
}
export declare class Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
    set(x: number, y: number, z: number, w: number): this;
    copy(other: Quaternion): this;
    clone(): Quaternion;
    normalize(): this;
    /** Intrinsic XYZ Euler angles in radians (rotation matrix Rx * Ry * Rz). */
    setFromEuler(x: number, y: number, z: number): this;
}
/** Column-major 4x4 matrix transforming column vectors; composition is translation * rotation * scale. */
export declare class Matrix4 {
    readonly elements: Float32Array<ArrayBuffer>;
    constructor();
    identity(): this;
    copy(other: Matrix4): this;
    /** Post-multiply in place: this = this * right. Supports self-multiplication. */
    multiply(right: Matrix4): this;
    compose(position: Vector3, rotation: Quaternion, scale: Vector3): this;
    invert(): this;
    /** Right-handed perspective looking along -Z, with WebGPU depth in [0, 1]. */
    perspective(fov: number, aspect: number, near: number, far: number): this;
    /** Projects homogeneous coordinates and divides by w; out may alias point. */
    transformPoint(point: Vector3, out?: Vector3): Vector3;
}
export interface Transform3DOptions {
    position?: Vector3;
    rotation?: Quaternion;
    scale?: Vector3;
}
export declare class Transform3D {
    readonly position: Vector3;
    readonly rotation: Quaternion;
    readonly scale: Vector3;
    readonly matrix: Matrix4;
    constructor(options?: Transform3DOptions);
    updateMatrix(): Matrix4;
}
