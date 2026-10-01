import type { LoadTask } from '../../assets/src/index.js';
import { Vector3 } from '../../math/src/index.js';
import { AnimationClip } from './animation.js';
import { PointLight, SpotLight } from './lights.js';
import { Group } from './group.js';
export interface GLTFDirectionalLight {
    /** Unit vector the light travels along (the node's −Z axis in world space). */
    direction: Vector3;
    color: [number, number, number];
    intensity: number;
}
/** KHR_lights_punctual lights baked at the node's world transform when loading. */
export interface GLTFLights {
    point: PointLight[];
    spot: SpotLight[];
    directional: GLTFDirectionalLight[];
}
export interface GLTFAsset {
    readonly scene: Group;
    readonly animations: AnimationClip[];
    /** Raw glTF photometric values; add them to a Scene and scale `intensity` as needed. */
    readonly lights: GLTFLights;
    dispose(): void;
}
export interface GLTFLoadOptions {
    signal?: AbortSignal;
    /** Extra origins from which model-referenced buffers/images may be fetched; the model's own origin is always allowed. */
    allowedOrigins?: readonly string[];
}
/** Dependency-free glTF 2.0 triangle/TRS/skin loader. Unsupported required extensions are rejected. */
export declare class GLTFLoader {
    /** Task results are unique: abort disposes only this acquisition, never a shared asset. */
    task(key: string, uri: string): LoadTask<GLTFAsset>;
    load(uri: string, options?: GLTFLoadOptions): Promise<GLTFAsset>;
    parse(input: ArrayBuffer | string, baseURL?: string, options?: GLTFLoadOptions): Promise<GLTFAsset>;
    /** Bakes KHR_lights_punctual definitions at each referencing node's world transform. */
    private readLights;
    private normals;
    private applyMatrix;
}
