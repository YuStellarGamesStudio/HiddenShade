import { GameObject } from '../game-object.js';
import type { Rect2D } from './contracts.js';
/** Non-drawing container whose bounds are composed from its children. */
export declare class Group2D extends GameObject {
    private readonly childBounds;
    getLocalBounds(out?: Rect2D): Rect2D;
}
