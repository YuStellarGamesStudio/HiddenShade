import { Vector2 } from '../../math/src/index.js';
import { type CameraBehavior2D, type CameraShakeOptions } from './camera2d-behaviors/index.js';
import type { ActionHandle, Easing } from './actions2d/index.js';
/** Top-left-origin world-to-screen camera in logical pixels. */
export declare class Camera2D {
    readonly position: Vector2;
    /** Logical screen-pixel displacement; effects do not mutate the camera's focus. */
    readonly renderOffset: Vector2;
    private currentZoom;
    private width;
    private height;
    private behaviorController;
    private disposed;
    private get controller();
    addBehavior<T extends CameraBehavior2D>(behavior: T): T;
    removeBehavior(behavior: CameraBehavior2D): boolean;
    clearBehaviors(): void;
    moveTo(x: number, y: number, duration: number, easing?: Easing): ActionHandle;
    zoomTo(zoom: number, duration: number, easing?: Easing): ActionHandle;
    shake(options: CameraShakeOptions): ActionHandle;
    /** @internal Applied after scene simulation, before final culling and rendering. */
    updateBehaviors(dt: number): void;
    destroy(): void;
    get zoom(): number;
    set zoom(value: number);
    get viewportWidth(): number;
    get viewportHeight(): number;
    resize(width: number, height: number): void;
    worldToScreen(point: Vector2, out?: Vector2): Vector2;
    screenToWorld(point: Vector2, out?: Vector2): Vector2;
}
