import { type Action, type ActionOwner, type ActionRuntime } from './actions.js';
export type ActionState = 'queued' | 'running' | 'completed' | 'cancelled';
export interface ActionHandle {
    readonly state: ActionState;
    readonly finished: Promise<'completed' | 'cancelled'>;
    cancel(): void;
}
declare class Entry implements ActionHandle {
    readonly action: Action;
    private readonly queue;
    state: ActionState;
    readonly finished: Promise<'completed' | 'cancelled'>;
    readonly settle: (state: 'completed' | 'cancelled') => void;
    runtime?: ActionRuntime;
    next?: Entry;
    constructor(action: Action, queue: ActionQueue);
    cancel(): void;
}
/** FIFO local actions. Scene executes these before object updates and physics. */
export declare class ActionQueue {
    readonly owner: ActionOwner;
    private head?;
    private tail?;
    private disposed;
    private advancing;
    private steps;
    private generation;
    private current?;
    private frameScene?;
    private frameRegistration?;
    private continuation?;
    private readonly context;
    private readonly onOwnerDestroy;
    constructor(owner: ActionOwner);
    run(action: Action): ActionHandle;
    /** @internal Entry settlement is synchronous before user events. */
    cancel(entry: Entry): void;
    clear(): void;
    update(dt: number, canContinue?: () => boolean): void;
    destroy(): void;
}
export {};
