import { Vector3 } from '../../math/src/index.js';
import { type Camera3D } from './orthographic-camera.js';
/** Canvas-local orbit input: left drag rotates, right/modified-left pans, middle/wheel dollies. */
export declare class OrbitControls {
    readonly camera: Camera3D;
    readonly canvas: HTMLCanvasElement;
    readonly target: Vector3;
    enabled: boolean;
    enableRotate: boolean;
    enablePan: boolean;
    enableZoom: boolean;
    rotateSpeed: number;
    panSpeed: number;
    zoomSpeed: number;
    minDistance: number;
    maxDistance: number;
    minZoom: number;
    maxZoom: number;
    minPolarAngle: number;
    maxPolarAngle: number;
    minAzimuthAngle: number;
    maxAzimuthAngle: number;
    private pointerId;
    private mode;
    private lastX;
    private lastY;
    private destroyed;
    private readonly basis;
    private readonly unitScale;
    private readonly previousTouchAction;
    constructor(camera: Camera3D, canvas: HTMLCanvasElement);
    /** Reconciles externally changed target/position with the orbit limits and orientation. */
    update(): void;
    destroy(): void;
    private orbit;
    private pan;
    private dolly;
    private readonly onPointerDown;
    private readonly onPointerMove;
    private releasePointer;
    private readonly onPointerEnd;
    private readonly onWheel;
    private readonly onContextMenu;
}
