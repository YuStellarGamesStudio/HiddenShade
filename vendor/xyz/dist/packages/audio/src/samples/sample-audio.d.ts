import type { Scene } from '../../../core/src/scene.js';
import type { AudioChannelName } from '../audio-manager.js';
import { SamplePlayback, type SamplePlayOptions } from './sample-playback.js';
import { AudioListenerState } from './spatial.js';
interface SampleHost {
    context(): AudioContext | undefined;
    scene(): Scene | undefined;
    volume(channel: AudioChannelName | 'master'): number;
}
/** Encoded bytes are loader-owned; decoded metadata stays unavailable before unlock/decode. */
export declare class SampleAudioAsset {
    private readonly engine;
    private encoded;
    private buffer?;
    private decoding?;
    loop: boolean;
    persistent: boolean;
    /** @internal */
    constructor(engine: SampleAudioEngine, encoded: ArrayBuffer);
    get decoded(): boolean;
    get duration(): number | undefined;
    get sampleRate(): number | undefined;
    get channels(): number | undefined;
    decode(): Promise<void>;
    play(options?: SamplePlayOptions): Promise<SamplePlayback>;
    /** @internal */
    dispose(): void;
}
/** Owns sampled buses and sources on the first OPM context, independent of the eight OPM slots. */
export declare class SampleAudioEngine {
    private readonly host;
    private readonly lifetime;
    private readonly cache;
    private readonly assets;
    private readonly playbacks;
    private master?;
    private buses?;
    private disposed;
    readonly listener: AudioListenerState;
    constructor(host: SampleHost);
    get signal(): AbortSignal;
    get currentScene(): Scene | undefined;
    requireContext(): AudioContext;
    /** Subscriber abort rejects only that acquisition, never another caller's shared cache. */
    load(url: string, options?: {
        signal?: AbortSignal;
    }): Promise<SampleAudioAsset>;
    play(buffer: AudioBuffer, options: SamplePlayOptions): SamplePlayback;
    refreshGains(): void;
    stopScene(scene: Scene): void;
    destroy(): void;
    private ensureBuses;
}
export {};
