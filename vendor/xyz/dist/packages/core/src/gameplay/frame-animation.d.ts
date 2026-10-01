import { TextureView2D } from '../../../assets/src/index.js';
import type { Sprite } from '../sprite.js';
import { type Rect2D } from './contracts.js';
export type AnimationFrame2D = {
    source: Rect2D;
    view?: never;
    duration: number;
} | {
    view: TextureView2D;
    source?: never;
    duration: number;
};
export interface FrameAnimationOptions {
    strategy?: 'loop' | 'pingpong' | 'freeze' | 'hide';
    speed?: number;
}
/** Sprite atlas playback in simulation seconds; no wall-clock scheduler. */
export declare class FrameAnimation extends EventTarget {
    readonly sprite: Sprite;
    readonly frames: readonly AnimationFrame2D[];
    readonly strategy: NonNullable<FrameAnimationOptions['strategy']>;
    speed: number;
    private readonly order;
    private readonly ends;
    private readonly duration;
    private phase;
    private direction;
    private currentFrame;
    private active;
    constructor(sprite: Sprite, frames: readonly AnimationFrame2D[], options?: FrameAnimationOptions);
    get frame(): number;
    get playing(): boolean;
    play(): this;
    pause(): this;
    reset(): this;
    reverse(): this;
    goToFrame(index: number): this;
    stop(): this;
    /** @internal Scene advances only animations still attached to an owned Sprite. */
    update(deltaTime: number): void;
    private applyFrame;
    private emit;
}
