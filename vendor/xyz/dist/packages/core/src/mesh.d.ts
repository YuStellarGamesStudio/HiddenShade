import { Texture } from '../../assets/src/index.js';
import { Quaternion } from '../../math/src/index.js';
import { Geometry } from './geometry.js';
import type { Frustum } from './frustum.js';
import { MorphTargets } from './morph.js';
import { Object3D } from './object3d.js';
export interface TextureMaterialOptions {
    texture: Texture;
    color?: [number, number, number];
    opacity?: number;
}
/** References a shared Texture; destroying a Mesh never destroys its material or texture. */
export declare class TextureMaterial {
    readonly texture: Texture;
    readonly color: [number, number, number];
    readonly opacity: number;
    constructor(options: TextureMaterialOptions);
}
export interface MeshOptions {
    geometry: Geometry;
    material: TextureMaterial;
    position?: [number, number, number];
    rotation?: Quaternion | [number, number, number];
    scale?: [number, number, number];
    visible?: boolean;
    castShadow?: boolean;
    receiveShadow?: boolean;
    /** Takes ownership of `geometry`'s vertex data; the geometry must not be shared. */
    morph?: MorphTargets;
}
/** 3D scene facade; Geometry and TextureMaterial remain owned by their creators. */
export declare class Mesh extends Object3D {
    readonly geometry: Geometry;
    readonly material: TextureMaterial;
    castShadow: boolean;
    receiveShadow: boolean;
    readonly morph?: MorphTargets;
    constructor(options: MeshOptions);
    /** Set false to always submit this mesh even when it lies outside the camera frustum. */
    frustumCulled: boolean;
    /** Deformed and instanced meshes keep bind-pose or per-instance bounds unreliable. */
    protected get cullable(): boolean;
    /** Squared distance from a world-space point to this mesh's bounding-sphere center. */
    distanceSquaredTo(x: number, y: number, z: number): number;
    /**
     * Conservative sphere test against the camera frustum. Refreshes the world matrix
     * so callers may use it before drawing. Non-finite bounds are treated as visible.
     */
    isInFrustum(frustum: Frustum): boolean;
    /**
     * Applies pending morph weights to the geometry. Renderers and raycasts call this
     * before reading vertices; unchanged weights cost one integer comparison.
     */
    updateDeformation(): void;
}
