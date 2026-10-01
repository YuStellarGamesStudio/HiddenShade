/** A variable-step clock. Times are seconds; tick timestamps are milliseconds. */
export declare class Clock {
    readonly maxDeltaTime: number;
    private previous;
    private delta;
    private frameInterval;
    private elapsed;
    private frames;
    constructor(maxDeltaTime?: number);
    get deltaTime(): number;
    get elapsedTime(): number;
    get frame(): number;
    get fps(): number;
    tick(timestamp: number): void;
    /** Suspend time accumulation without discarding elapsed gameplay time. */
    suspend(): void;
    reset(): void;
}
