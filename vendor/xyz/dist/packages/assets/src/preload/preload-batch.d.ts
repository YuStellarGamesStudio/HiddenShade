export interface LoadTask<T = unknown> {
    readonly key: string;
    load(signal: AbortSignal): Promise<T>;
}
export interface PreloadProgress {
    readonly completed: number;
    readonly total: number;
    readonly ratio: number;
    readonly currentKey?: string;
}
export type PreloadState = 'idle' | 'loading' | 'ready' | 'failed' | 'cancelled';
/** A batch owns task cancellation, never the resources returned by a shared loader. */
export declare class PreloadBatch extends EventTarget {
    private readonly tasks;
    private readonly controller;
    private readonly results;
    private status;
    private snapshot;
    private pending?;
    constructor(tasks: readonly LoadTask[]);
    get state(): PreloadState;
    get progress(): PreloadProgress;
    load(options?: {
        signal?: AbortSignal;
    }): Promise<ReadonlyMap<string, unknown>>;
    cancel(reason?: unknown): void;
    private run;
}
