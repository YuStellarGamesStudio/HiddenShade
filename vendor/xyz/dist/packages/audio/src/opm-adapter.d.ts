export interface OPMOperator {
    ratio: number;
    level: number;
    detune: number;
    adsr: {
        a: number;
        d: number;
        s: number;
        r: number;
    };
}
export interface OPMVoice {
    version?: 1;
    name?: string;
    algorithm: number;
    feedback: number;
    ops: [OPMOperator, OPMOperator, OPMOperator, OPMOperator];
    lfo?: {
        rate: number;
        amDepth: number;
        pmDepth: number;
    };
    modIndex?: number;
}
interface OfficialOPM {
    context: AudioContext | null;
    node: AudioWorkletNode | null;
    voices: Map<string, OPMVoice>;
    loadVoice(name: string, voice: unknown): void;
    start(): Promise<void>;
    playNote(options: {
        voice?: string | OPMVoice;
        note: number;
        time?: number;
        duration: number;
    }): number;
    stop(id: number): void;
    close(): Promise<void>;
}
/** Eight live AudioContexts/worklets isolate voice stealing at the cost of idle resources; destroy closes them. */
export declare class OPMAdapter {
    private slots;
    private pendingSlots;
    private unlocking;
    private destroyed;
    static validateVoice(value: unknown): Promise<OPMVoice>;
    get unlocked(): boolean;
    get now(): number;
    get opm(): OfficialOPM | undefined;
    /** @internal Native PCM shares the first existing context; worklet reset leaves it alive. */
    get sampleContext(): AudioContext | undefined;
    unlock(): Promise<void>;
    private initialize;
    play(slot: number, voice: OPMVoice, note: number, delay: number, duration: number, gain: number): void;
    stop(slot: number): void;
    reset(slot: number): void;
    setGain(slot: number, value: number): void;
    destroy(): void;
    private getSlot;
    private dispose;
}
export {};
