export interface AudioVec3 {
    x: number;
    y: number;
    z: number;
}
export type SpatialDistanceModel = 'linear' | 'inverse' | 'exponential';
export type SpatialPanningModel = 'equalpower' | 'HRTF';
export interface SpatialAudioOptions {
    /** World-space emitter position; the listener uses the same right-handed units. */
    position: AudioVec3;
    refDistance?: number;
    maxDistance?: number;
    rolloffFactor?: number;
    distanceModel?: SpatialDistanceModel;
    panningModel?: SpatialPanningModel;
}
export declare function checkVec3(value: AudioVec3, name: string): AudioVec3;
/** Validated once so a bad option cannot leave a half-built PannerNode graph. */
export declare function checkSpatialOptions(options: SpatialAudioOptions): Required<SpatialAudioOptions>;
export declare function applyPannerOptions(panner: PannerNode, spatial: Required<SpatialAudioOptions>): void;
/**
 * Manager-wide listener. State is retained before audio unlock and replayed onto the
 * native AudioListener once a context exists.
 */
export declare class AudioListenerState {
    private readonly context;
    private pos;
    private fwd;
    private upward;
    /** Untouched listeners leave the browser's native defaults alone. */
    private touched;
    /** @internal */
    constructor(context: () => AudioContext | undefined);
    get position(): Readonly<AudioVec3>;
    get forward(): Readonly<AudioVec3>;
    get up(): Readonly<AudioVec3>;
    setPosition(x: number, y: number, z: number): void;
    /** Forward and up must be non-zero and not parallel. */
    setOrientation(forward: AudioVec3, up?: AudioVec3): void;
    /** @internal Replays retained state; called after unlock and on each change. */
    apply(): void;
}
