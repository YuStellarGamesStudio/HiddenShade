import { Vector3 } from '../../math/src/index.js';
export interface ShadowSettingsOptions {
    enabled?: boolean;
    mapSize?: number;
    /** Full width and height of the directional-light orthographic frustum. */
    extent?: number;
    near?: number;
    far?: number;
    bias?: number;
    target?: Vector3;
}
export type ToneMapping = 'none' | 'aces';
export interface PostProcessingSettingsOptions {
    enabled?: boolean;
    exposure?: number;
    toneMapping?: ToneMapping;
    bloomStrength?: number;
    bloomThreshold?: number;
    /** Neighbor sampling radius in output pixels. */
    bloomRadius?: number;
}
/** Directional shadows only; settings remain mutable and are validated each render. */
export declare class ShadowSettings {
    enabled: boolean;
    mapSize: number;
    extent: number;
    near: number;
    far: number;
    bias: number;
    target: Vector3;
    constructor(options?: ShadowSettingsOptions);
    validate(): void;
}
/** Fullscreen HDR processing after 3D and before the unaffected 2D overlay. */
export declare class PostProcessingSettings {
    enabled: boolean;
    exposure: number;
    toneMapping: ToneMapping;
    bloomStrength: number;
    bloomThreshold: number;
    bloomRadius: number;
    constructor(options?: PostProcessingSettingsOptions);
    validate(): void;
}
export type FogMode = 'linear' | 'exp2';
export interface FogSettingsOptions {
    enabled?: boolean;
    mode?: FogMode;
    /** Display (sRGB) color the scene fades toward, components in 0..1. */
    color?: [number, number, number];
    /** Linear mode: distance where fog begins. */
    near?: number;
    /** Linear mode: distance of full fog. */
    far?: number;
    /** Exp2 mode: coverage is 1 - exp(-(density * distance)^2). */
    density?: number;
}
/** Distance fog for 3D meshes; the skybox and 2D overlay are not fogged. */
export declare class FogSettings {
    enabled: boolean;
    mode: FogMode;
    color: [number, number, number];
    near: number;
    far: number;
    density: number;
    constructor(options?: FogSettingsOptions);
    validate(): void;
}
