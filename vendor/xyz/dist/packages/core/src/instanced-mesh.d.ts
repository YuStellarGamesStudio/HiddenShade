import { Matrix4 } from '../../math/src/index.js';
import { Mesh, type MeshOptions } from './mesh.js';
export interface InstancedMeshOptions extends MeshOptions {
    count: number;
}
/** One geometry/material draw with mesh.worldMatrix * each local instance matrix. */
export declare class InstancedMesh extends Mesh {
    readonly count: number;
    /** Column-major matrices; use setMatrixAt to notify renderer upload caches. */
    readonly matrices: Float32Array;
    version: number;
    protected get cullable(): boolean;
    constructor(options: InstancedMeshOptions);
    setMatrixAt(index: number, matrix: Matrix4): void;
    getMatrixAt(index: number, out: Matrix4): Matrix4;
    private validateIndex;
}
