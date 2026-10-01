import { Vector3 } from '../../math/src/index.js';
import { Mesh } from './mesh.js';
import { type Camera3D } from './orthographic-camera.js';
import type { SceneObject } from './scene-object.js';
export interface RaycastHit {
    object: Mesh;
    distance: number;
    point: Vector3;
    faceIndex: number;
    instanceId?: number;
}
/** Exact, two-sided indexed-triangle picking in world units, including hierarchy and instances. */
export declare class Raycaster {
    readonly origin: Vector3;
    readonly direction: Vector3;
    near: number;
    far: number;
    private readonly inverse;
    private readonly instance;
    private readonly world;
    private readonly localOrigin;
    private readonly localDirection;
    private readonly visited;
    setFromCamera(x: number, y: number, camera: Camera3D, aspect: number): this;
    /** Replaces out's contents; flat scene registration and recursive roots never duplicate a mesh. */
    intersectObjects(objects: Iterable<SceneObject>, recursive?: boolean, out?: RaycastHit[]): RaycastHit[];
    private intersectObject;
    private intersectMesh;
}
