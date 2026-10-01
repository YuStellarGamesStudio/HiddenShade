import type { AudioPlayOptions } from '../audio-manager.js';
import { type AudioVec3, type SpatialAudioOptions } from './spatial.js';
export interface SamplePlayOptions extends AudioPlayOptions {
    volume?: number;
    playbackRate?: number;
    offset?: number;
    /** Routes the playback through a PannerNode positioned in world space. */
    spatial?: SpatialAudioOptions;
    /** Absolute AudioContext time, independent of the Game clock. */
    scheduledStartTime?: number;
}
export type SamplePlaybackState = 'playing' | 'paused' | 'stopped' | 'ended';
/** BufferSources are one-shot; pause/seek replace them without re-decoding the asset. */
export declare class SamplePlayback {
    private readonly context;
    private readonly buffer;
    private readonly release;
    private status;
    private source?;
    private readonly gain;
    private readonly panner?;
    private offset;
    private startsAt;
    private speed;
    private level;
    readonly loop: boolean;
    /** @internal */
    constructor(context: AudioContext, buffer: AudioBuffer, bus: GainNode, options: SamplePlayOptions, release: (playback: SamplePlayback) => void);
    get state(): SamplePlaybackState;
    get position(): number;
    get volume(): number;
    set volume(value: number);
    /** World-space emitter position, or undefined for non-spatial playbacks. */
    get position3D(): Readonly<AudioVec3> | undefined;
    set position3D(value: Readonly<AudioVec3>);
    get playbackRate(): number;
    set playbackRate(value: number);
    pause(): void;
    resume(): void;
    seek(seconds: number): void;
    stop(): void;
    private startSource;
    private clearSource;
    private checkPosition;
    private checkRate;
    private checkVolume;
}
