import { type Texture2DSource, type TextureView2D } from '../../../assets/src/index.js';
import { Matrix3 } from '../../../math/src/index.js';
import { GameObject } from '../game-object.js';
import { type ColorRGBA, type Rect2D } from '../gameplay/contracts.js';
/** Fields submitted every active frame; other fields upload only after a setter. */
export declare const ParticleAttribute2D: Readonly<{
    Transform: 1;
    Tint: 2;
    Source: 4;
    Anchor: 8;
    All: 15;
}>;
export interface ParticleTransform2D {
    a: number;
    b: number;
    c: number;
    d: number;
    tx: number;
    ty: number;
    /** World coordinates retain birth axes instead of following the layer. */
    space?: 'local' | 'world';
}
export interface ParticleSource2D {
    texture?: Texture2DSource;
    view?: TextureView2D;
    source?: Readonly<Rect2D>;
}
export interface ParticleOptions2D extends ParticleSource2D {
    transform?: ParticleTransform2D;
    tint?: ColorRGBA;
    anchor?: readonly [number, number];
}
export interface ParticleLayer2DOptions extends ParticleSource2D {
    capacity: number;
    dynamicAttributes?: number;
}
/** Stable borrowed read-only record. No mutable arrays are exposed. */
export interface ParticleSlot2D {
    /** Activation identity; source setters do not change this value. */
    readonly generation: number;
    readonly a: number;
    readonly b: number;
    readonly c: number;
    readonly d: number;
    readonly tx: number;
    readonly ty: number;
    readonly space: 'local' | 'world';
    readonly tintR: number;
    readonly tintG: number;
    readonly tintB: number;
    readonly tintA: number;
    readonly anchorX: number;
    readonly anchorY: number;
    readonly texture: Texture2DSource;
    readonly view: TextureView2D | undefined;
    readonly source: Readonly<Rect2D> | undefined;
    readonly transformVersion: number;
    readonly tintVersion: number;
    readonly sourceVersion: number;
    readonly anchorVersion: number;
}
/** A bounded insertion-ordered draw layer; full capacity refuses new particles. */
export declare class ParticleLayer2D extends GameObject {
    readonly capacity: number;
    readonly dynamicAttributes: number;
    renderEnabled: boolean;
    private readonly slots;
    private readonly active;
    private readonly free;
    private count;
    private freeCount;
    private readonly occupied;
    private readonly defaultSource;
    private topologyVersion;
    private readonly inverse;
    constructor(options: ParticleLayer2DOptions);
    get activeCount(): number;
    get version(): number;
    get availableCount(): number;
    activeSlotAt(index: number): number;
    hasSlot(index: number): boolean;
    getSlot(index: number): ParticleSlot2D;
    addParticle(options?: ParticleOptions2D): number;
    removeSlot(index: number): void;
    clear(): void;
    setTransform(index: number, value: ParticleTransform2D): void;
    setTint(index: number, value: ColorRGBA): void;
    setAnchor(index: number, value: readonly [number, number]): void;
    setSource(index: number, value: ParticleSource2D): void;
    /** Renderer helper: writes final world affine without allocating a matrix. */
    getSlotWorldMatrix(index: number, out: Matrix3): Matrix3;
    private readonly affine;
    private slotMatrix;
    getLocalBounds(out?: Rect2D): Rect2D;
    getWorldBounds(out?: Rect2D): Rect2D;
    private readonly boundsMatrix;
    private collectBounds;
    private readonly worldAffine;
    private assertAlive;
    private requireSlot;
    destroy(): void;
}
