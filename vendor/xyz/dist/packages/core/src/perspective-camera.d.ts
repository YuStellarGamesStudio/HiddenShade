import { Matrix4, Quaternion, Vector3 } from '../../math/src/index.js';
/** Right-handed camera looking down -Z; WebGPU clip depth is 0..1. */
export declare class PerspectiveCamera {
    readonly position: Vector3;
    readonly rotation: Quaternion;
    fov: number;
    near: number;
    far: number;
    private readonly view;
    private readonly unitScale;
    readonly matrix: Matrix4;
    lookAt(target: Vector3): void;
    /** Recomputes projection * inverse(camera translation * rotation). */
    updateMatrix(aspect: number): Matrix4;
}
