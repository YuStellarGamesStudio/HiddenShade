export interface TimerHandle {
    readonly active: boolean;
    cancel(): void;
}
/** Scene-local simulation seconds, never wall time. */
export declare class SceneTimers {
    private readonly tasks;
    private time;
    private nextId;
    private disposed;
    private updating;
    after(delay: number, callback: () => void): TimerHandle;
    /** At most one invocation per frame; skipped periods do not accumulate a burst. */
    every(interval: number, callback: () => void): TimerHandle;
    /** @internal Game advances timers before Scene.update; nested advancement is invalid. */
    update(deltaTime: number): void;
    destroy(): void;
    private schedule;
}
