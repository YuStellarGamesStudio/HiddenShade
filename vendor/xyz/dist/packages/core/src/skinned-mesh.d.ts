import { Matrix4 } from '../../math/src/index.js';
import { Mesh, type MeshOptions } from './mesh.js';
import { Object3D } from './object3d.js';
export interface SkinnedMeshOptions extends MeshOptions {
    joints: readonly Object3D[];
    inverseBindMatrices?: readonly Matrix4[];
    jointIndices: ArrayLike<number>;
    weights: ArrayLike<number>;
}
/** Owns deformed geometry; source geometry, joints and material remain borrowed. */
export declare class SkinnedMesh extends Mesh {
    readonly joints: readonly Object3D[];
    readonly inverseBindMatrices: readonly Matrix4[];
    private readonly jointIndices;
    private readonly weights;
    private readonly bindVertices;
    private readonly matrices;
    private readonly previous;
    private readonly inverse;
    private readonly blend;
    private initialized;
    protected get cullable(): boolean;
    constructor(options: SkinnedMeshOptions);
    /** Morphs the bind pose first, then skins it. */
    updateDeformation(): void;
    updateSkin(): void;
}
