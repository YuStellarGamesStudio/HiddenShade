import type { Camera2D } from '../camera2d.js';
import type { GameObject } from '../game-object.js';
import type { Rect2D } from '../gameplay/contracts.js';
export interface CameraBehavior2D {
    update(camera: Camera2D, dt: number): void;
    destroy?(): void;
}
export interface CameraFollowOptions {
    axis?: 'both' | 'x' | 'y';
    smoothTime?: number;
    /** Viewport-relative logical screen pixels, unaffected by shake. */
    deadZone?: Rect2D;
}
export declare const CameraStrategies: Readonly<{
    follow(target: GameObject, options?: CameraFollowOptions): CameraBehavior2D;
    bounds(rect: Rect2D): CameraBehavior2D;
}>;
