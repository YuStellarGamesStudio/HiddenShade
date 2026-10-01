import { GameObject } from '../game-object.js';
import { Collider2D } from './collider.js';
export interface TriggerOptions {
    filter?: (other: GameObject) => boolean;
    /** Accepted enters; default one. Use Infinity explicitly for unlimited enters. */
    repeat?: number;
    onEnter?: (other: GameObject) => void;
}
/** Static sensor facade using the same geometry and contact lifecycle as rigid bodies. */
export declare class Trigger2D extends GameObject {
    private remaining;
    private readonly accepted;
    constructor(collider: Collider2D, options?: TriggerOptions);
    get remainingRepeats(): number;
    protected onDestroy(): void;
}
