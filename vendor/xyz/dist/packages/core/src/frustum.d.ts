import type { Matrix4 } from '../../math/src/index.js';
/**
 * Six clip planes extracted from a column-major view-projection matrix whose
 * clip depth is 0..1 (the engine convention for both perspective and orthographic).
 * Reused across frames; `setFromMatrix` and the tests never allocate.
 */
export declare class Frustum {
    /** left, right, bottom, top, near, far as normalized (nx, ny, nz, d) quadruples. */
    private readonly planes;
    setFromMatrix(viewProjection: Matrix4): this;
    /** True unless the sphere lies completely outside one plane. */
    intersectsSphere(x: number, y: number, z: number, radius: number): boolean;
}
