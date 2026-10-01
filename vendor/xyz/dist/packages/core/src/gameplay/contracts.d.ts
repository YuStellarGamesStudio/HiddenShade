import type { GameObject } from '../game-object.js';
/** @internal Rendering and picking share the same stable layer/z ordering. */
export declare function compareObjects2D(a: GameObject, b: GameObject): number;
export interface Rect2D {
    x: number;
    y: number;
    width: number;
    height: number;
}
export type ColorRGBA = readonly [number, number, number, number];
export declare function assertFinite(value: number, name: string): void;
export declare function validateSource(source: Rect2D, width: number, height: number): void;
