import type { Quaternion, Vector3 } from '../../math/src/index.js';
/** Builds a right-handed camera orientation with world +Y up and local -Z forward. */
export declare function lookAtRotation(position: Vector3, target: Vector3, rotation: Quaternion): void;
