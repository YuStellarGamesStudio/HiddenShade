import { Vector2 } from '../../../math/src/index.js';
import type { Pointer } from '../../../input/src/index.js';
import { GameObject } from '../game-object.js';
import type { Scene } from '../scene.js';
import { type InteractionPhase2D } from './interaction-events.js';
export interface PointerTargetEventDetail {
    pointerId: number;
    button: number;
    screen: Vector2;
    world: Vector2;
    readonly target: GameObject;
    readonly path: readonly GameObject[];
    readonly currentTarget: GameObject;
    readonly phase: InteractionPhase2D;
    originalEvent?: PointerEvent | WheelEvent;
    deltaX: number;
    deltaY: number;
    deltaZ: number;
    readonly propagationStopped: boolean;
    readonly immediatePropagationStopped: boolean;
    readonly defaultPrevented: boolean;
    stopPropagation(): void;
    stopImmediatePropagation(): void;
    preventDefault(): void;
}
/** Scene-local native interaction routing; global moves are explicit router observers. */
export declare class PointerRouter extends EventTarget {
    private readonly scene;
    private readonly targets;
    private readonly states;
    private readonly dragging;
    private readonly world;
    private readonly local;
    private readonly inverse;
    private resetVersion;
    private disposed;
    private canContinue;
    private pointer?;
    private globalListeners;
    private epoch;
    private routing;
    constructor(scene: Scene);
    addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void;
    removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions): void;
    dispatchEvent(event: Event): boolean;
    private alive;
    /** Geometric ancestor clips; image masks intentionally use bounds, not pixel alpha. */
    private clipped;
    private pick;
    private dispatch;
    private hover;
    private parentPoint;
    private endDrag;
    private cancel;
    /** @internal Called after membership removal, including synchronous destruction. */
    forget(object: GameObject): void;
    reset(): void;
    destroy(): void;
    update(pointer: Pointer, canContinue: () => boolean): void;
}
