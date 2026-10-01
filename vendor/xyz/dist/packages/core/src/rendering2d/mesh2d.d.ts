import { type Texture2DSource, type TextureView2D } from '../../../assets/src/index.js';
import { Vector2 } from '../../../math/src/index.js';
import { GameObject } from '../game-object.js';
import type { ColorRGBA, Rect2D } from '../gameplay/contracts.js';
import { Geometry2D } from './geometry2d.js';
export interface Mesh2DOptions {
    geometry: Geometry2D;
    texture?: Texture2DSource;
    view?: TextureView2D;
    position?: [number, number];
    rotation?: number;
    scale?: [number, number];
    opacity?: number;
    visible?: boolean;
    zIndex?: number;
    tint?: ColorRGBA;
    space?: 'world' | 'screen';
}
/** Unlit indexed 2D mesh; geometry and texture are borrowed, never destroyed here. */
export declare class Mesh2D extends GameObject {
    readonly geometry: Geometry2D;
    private image;
    private frame;
    private readonly hitPoint;
    renderEnabled: boolean;
    constructor(options: Mesh2DOptions);
    get texture(): Texture2DSource;
    set texture(value: Texture2DSource);
    get view(): TextureView2D | undefined;
    set view(value: TextureView2D | undefined);
    getLocalBounds(out?: Rect2D): Rect2D;
    containsPoint(point: Vector2): boolean;
}
export interface Plane2DOptions extends Omit<Mesh2DOptions, 'geometry'> {
    width: number;
    height: number;
    columns?: number;
    rows?: number;
}
export declare class Plane2D extends Mesh2D {
    constructor(options: Plane2DOptions);
}
export interface Rope2DOptions extends Omit<Mesh2DOptions, 'geometry'> {
    points: readonly (readonly [number, number])[];
    width: number;
    textureMode?: 'stretch' | 'repeat';
    repeatLength?: number;
}
/** Averaged-normal joins; consecutive duplicate points are rejected rather than inventing a tangent. */
export declare class Rope2D extends Mesh2D {
    readonly width: number;
    readonly textureMode: 'stretch' | 'repeat';
    readonly repeatLength: number;
    constructor(options: Rope2DOptions);
    setPoints(points: readonly (readonly [number, number])[]): void;
    private static makeGeometry;
}
export interface PerspectiveQuad2DOptions extends Omit<Mesh2DOptions, 'geometry'> {
    corners: readonly (readonly [number, number])[];
}
/** True projective interpolation: native backends interpolate (uv*q,q) and divide. */
export declare class PerspectiveQuad2D extends Mesh2D {
    constructor(options: PerspectiveQuad2DOptions);
    setCorners(corners: readonly (readonly [number, number])[]): void;
    private static makeGeometry;
}
