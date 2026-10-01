import type { Camera3D } from './orthographic-camera.js';
export interface FirstPersonKeys {
    forward: string;
    back: string;
    left: string;
    right: string;
    up: string;
    down: string;
    sprint: string;
}
/**
 * Mouse-look (Pointer Lock) and WASD movement. Call `lock()` from a user gesture,
 * then `update(dt)` once per frame with the simulation delta. Input is ignored while
 * the pointer is not locked (unless `requireLock` is false) and cleared when it unlocks.
 * Dispatches `lock` and `unlock` events.
 */
export declare class FirstPersonControls extends EventTarget {
    readonly camera: Camera3D;
    readonly canvas: HTMLCanvasElement;
    enabled: boolean;
    /** Only react to input while the canvas owns the pointer lock. */
    requireLock: boolean;
    /** Units per second. */
    moveSpeed: number;
    sprintMultiplier: number;
    /** Radians per pixel of pointer movement. */
    lookSpeed: number;
    /** When true, forward/back follow the view pitch instead of staying horizontal. */
    fly: boolean;
    /** KeyboardEvent.code values; mutate freely to rebind. */
    readonly keys: FirstPersonKeys;
    minPitch: number;
    maxPitch: number;
    private yawAngle;
    private pitchAngle;
    private destroyed;
    private readonly pressed;
    private readonly document;
    constructor(camera: Camera3D, canvas: HTMLCanvasElement);
    get isLocked(): boolean;
    get yaw(): number;
    get pitch(): number;
    /** Points the camera; pitch is clamped to [minPitch, maxPitch]. */
    setRotation(yaw: number, pitch: number): void;
    /** Requests pointer lock. Must run inside a user gesture; rejects if the browser refuses. */
    lock(): Promise<void>;
    unlock(): void;
    /** Applies held movement keys for `deltaTime` seconds (finite, nonnegative). */
    update(deltaTime: number): void;
    destroy(): void;
    private applyRotation;
    private readonly onMouseMove;
    private readonly onKeyDown;
    private readonly onKeyUp;
    private readonly onBlur;
    private readonly onLockChange;
}
