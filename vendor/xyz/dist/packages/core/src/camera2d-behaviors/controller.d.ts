import type { Camera2D } from '../camera2d.js';
import { Vector2 } from '../../../math/src/index.js';
import { type ActionHandle, type ActionOwner, type Easing } from '../actions2d/index.js';
import type { CameraBehavior2D } from './strategies.js';
export interface CameraShakeOptions {
    duration: number;
    amplitude: readonly [number, number];
    frequency?: number;
    seed?: number;
}
/** Camera2D delegates lazily; motion, zoom and shake have independent FIFO channels. */
export declare class CameraController2D extends EventTarget implements ActionOwner {
    readonly camera: Camera2D;
    readonly scale: Vector2;
    rotation: number;
    opacity: number;
    private disposed;
    private motion?;
    private zooming?;
    private shaking?;
    private readonly behaviors;
    private serial;
    private updating;
    private shakeTime;
    private shakeOptions?;
    private shakeHandle?;
    constructor(camera: Camera2D);
    get position(): Vector2;
    get destroyed(): boolean;
    addBehavior<T extends CameraBehavior2D>(behavior: T): T;
    removeBehavior(behavior: CameraBehavior2D): boolean;
    clearBehaviors(): void;
    moveTo(x: number, y: number, duration: number, easing?: Easing): ActionHandle;
    zoomTo(zoom: number, duration: number, easing?: Easing): ActionHandle;
    shake(options: CameraShakeOptions): ActionHandle;
    update(dt: number): void;
    destroy(): void;
}
