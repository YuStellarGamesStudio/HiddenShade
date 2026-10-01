import type { GameObject } from '../game-object.js';
import { type Easing } from './easings.js';
export interface ActionOwner extends EventTarget, Pick<GameObject, 'position' | 'scale' | 'rotation' | 'opacity' | 'destroyed'> {
    readonly scene?: unknown;
    readonly registrationGeneration?: number;
}
export interface ActionContext {
    readonly owner: ActionOwner;
    active(): boolean;
    step(): void;
}
export interface ActionRuntime {
    done: boolean;
    advance(dt: number, context: ActionContext): number;
}
declare const instantiate: unique symbol;
export interface Action {
    /** Minimum elapsed time per run, used to reject non-progressing infinite repeats. */
    readonly duration: number;
    readonly [instantiate]: () => ActionRuntime;
}
export declare function createRuntime(action: Action): ActionRuntime;
export declare function validateTime(value: number, name?: string): void;
declare function sequence(...actions: Action[]): Action;
export declare const Actions: Readonly<{
    moveTo(x: number, y: number, duration: number, easing?: Easing): Action;
    moveBy(x: number, y: number, duration: number, easing?: Easing): Action;
    rotateTo(angle: number, duration: number, easing?: Easing): Action;
    scaleTo(x: number, y: number, duration: number, easing?: Easing): Action;
    fadeTo(opacity: number, duration: number, easing?: Easing): Action;
    tween(target: object, values: Record<string, number>, duration: number, easing?: Easing): Action;
    delay(duration: number): Action;
    call(callback: (owner: ActionOwner) => void): Action;
    sequence: typeof sequence;
    parallel(...actions: Action[]): Action;
    repeat(action: Action, count: number): Action;
    repeatForever(action: Action): Action;
}>;
export {};
