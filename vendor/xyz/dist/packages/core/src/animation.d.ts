import type { Object3D } from './object3d.js';
import { MorphWeights } from './morph.js';
export type AnimationPath = 'translation' | 'rotation' | 'scale' | 'weights';
export type Interpolation = 'STEP' | 'LINEAR' | 'CUBICSPLINE';
/** Cubic values are glTF triplets: incoming tangent, value, outgoing tangent. */
export declare class KeyframeTrack {
    readonly target: Object3D | MorphWeights;
    readonly path: AnimationPath;
    readonly interpolation: Interpolation;
    readonly times: Float32Array;
    readonly values: Float32Array;
    readonly size: number;
    private readonly scratch;
    constructor(target: Object3D | MorphWeights, path: AnimationPath, times: ArrayLike<number>, values: ArrayLike<number>, interpolation?: Interpolation);
    sample(time: number): void;
}
export declare class AnimationClip {
    readonly name: string;
    readonly tracks: readonly KeyframeTrack[];
    readonly duration: number;
    constructor(name: string, tracks: readonly KeyframeTrack[]);
}
export declare class AnimationAction {
    readonly clip: AnimationClip;
    loop: boolean;
    timeScale: number;
    time: number;
    playing: boolean;
    constructor(clip: AnimationClip);
    play(): this;
    stop(): this;
    update(delta: number): void;
}
/** Concurrent actions apply in insertion order; the last action targeting a property wins. */
export declare class AnimationMixer {
    private readonly actions;
    private destroyed;
    clipAction(clip: AnimationClip): AnimationAction;
    update(delta: number): void;
    stopAll(): void;
    destroy(): void;
}
