import type { Geometry } from './geometry.js';
/**
 * Morph target weights. One instance is shared by every primitive of a glTF mesh node,
 * so animating it deforms all of them; `version` advances only when a value changes.
 */
export declare class MorphWeights {
    private readonly data;
    version: number;
    constructor(initial: ArrayLike<number>);
    get count(): number;
    get(index: number): number;
    set(index: number, value: number): void;
    /** @internal Read-only view for the deformation loop. */
    get values(): Readonly<Float32Array>;
    private check;
}
export interface MorphTargetData {
    /** Per-target xyz deltas, length vertexCount * 3. Omitted entries are zero. */
    positions: ReadonlyArray<ArrayLike<number> | undefined>;
    /** Per-target normal deltas. Omitted entries leave the base normal unchanged. */
    normals?: ReadonlyArray<ArrayLike<number> | undefined>;
    weights: MorphWeights;
}
/**
 * Additive morph targets for one Geometry: `position = base + sum(weight_i * delta_i)`.
 * A Mesh takes ownership of the geometry it morphs, so a Geometry can be claimed once.
 */
export declare class MorphTargets {
    readonly weights: MorphWeights;
    private readonly positions;
    private readonly normals;
    private base?;
    private applied;
    constructor(data: MorphTargetData);
    get targetCount(): number;
    /** @internal Captures the undeformed vertices; called once by the owning Mesh. */
    bind(geometry: Geometry): void;
    /**
     * @internal Rewrites position and normal of `out` (interleaved stride 8) from the
     * base when weights changed since the last call. Returns whether `out` changed.
     */
    apply(out: Float32Array): boolean;
}
