import { Matrix4, Quaternion, Vector3 } from '../../math/src/index.js';
import type { PerspectiveCamera } from './perspective-camera.js';
export type Camera3D = PerspectiveCamera | OrthographicCamera;
/** Centered orthographic camera with vertical size height / zoom and depth in [0, 1]. */
export declare class OrthographicCamera {
    readonly position: Vector3;
    readonly rotation: Quaternion;
    height: number;
    zoom: number;
    near: number;
    far: number;
    readonly matrix: Matrix4;
    private readonly view;
    private readonly unitScale;
    lookAt(target: Vector3): void;
    updateMatrix(aspect: number): Matrix4;
}
