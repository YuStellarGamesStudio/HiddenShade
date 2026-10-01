import type { Mesh } from './mesh.js';
import type { Vector3 } from '../../math/src/index.js';
/**
 * True when the mesh blends with what is behind it and therefore depends on draw order:
 * a BLEND PBRMaterial or any material with opacity below one.
 */
export declare function isBlended(mesh: Mesh): boolean;
/** Reusable state so sorting does not allocate once the pool has grown. */
export declare class DrawSorter {
    private readonly pool;
    private readonly active;
    /**
     * Reorders `draws` in place: opaque meshes keep their relative order first, then
     * blended meshes follow farthest-to-nearest (distance from the camera to each
     * bounding-sphere center; equal distances keep insertion order).
     */
    sort(draws: Mesh[], camera: Vector3): void;
}
