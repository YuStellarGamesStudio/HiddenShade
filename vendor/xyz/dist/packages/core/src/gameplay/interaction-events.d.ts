export type InteractionPhase2D = 'capture' | 'target' | 'bubble';
export interface InteractionDispatchDetail2D {
    readonly target: EventTarget;
    readonly currentTarget: EventTarget;
    readonly immediatePropagationStopped: boolean;
}
export declare function isInteractionEvent2D(type: string): boolean;
/** Native dispatch retains listener mutation, once, signal, and exception semantics. */
export declare class InteractionListeners2D {
    private readonly capture;
    private readonly bubble;
    private readonly records;
    private guard;
    has(type: string): boolean;
    add(type: string, callback: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void;
    remove(type: string, callback: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions): void;
    private deliver;
    dispatch(event: CustomEvent<InteractionDispatchDetail2D>, phase: InteractionPhase2D, guard: () => boolean): boolean;
    /** Existing consumers may dispatch ordinary native Events, without router detail. */
    dispatchNative(event: Event, owner: EventTarget, guard?: () => boolean): boolean;
    destroy(): void;
}
