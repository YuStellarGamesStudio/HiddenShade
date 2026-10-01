export type EnvironmentColor = readonly [number, number, number];
export interface EnvironmentGradientOptions {
    zenith: EnvironmentColor;
    horizon: EnvironmentColor;
    ground: EnvironmentColor;
    /** Optional sun disc; `direction` points from the origin toward the sun. */
    sun?: {
        direction: EnvironmentColor;
        color: EnvironmentColor;
        /** Angular radius in radians. */
        radius?: number;
    };
    /** Equirect width; height is width / 2. Defaults to 128. */
    width?: number;
}
/** Equirect texel center to a unit direction; u = 0.5 looks toward -Z, v = 0 is +Y. */
export declare function equirectDirection(u: number, v: number, out: [number, number, number]): [number, number, number];
/**
 * Immutable equirectangular (2:1) radiance environment for image-based lighting and
 * backgrounds. Construction does all CPU filtering once: an order-2 SH irradiance for
 * diffuse light and a roughness-blurred mip chain for specular reflections. GPU uploads
 * are renderer-owned caches; `destroy()` only releases the CPU data and stops rendering.
 */
export declare class EnvironmentMap {
    /** Half-float RGBA levels; level 0 is sharp, later levels are progressively blurrier. */
    readonly levels: readonly Uint16Array[];
    readonly levelSizes: ReadonlyArray<{
        width: number;
        height: number;
    }>;
    /** Nine RGB coefficients padded to vec4, ready for the mesh shaders. */
    readonly sh: Float32Array;
    readonly width: number;
    readonly height: number;
    private gone;
    private constructor();
    get destroyed(): boolean;
    /** Number of mip levels; specular LOD is `roughness * (mipCount - 1)`. */
    get mipCount(): number;
    /**
     * @param data Linear-light RGB (channels = 3) or RGBA (channels = 4) floats, row-major,
     * top row first. Width must be twice the height.
     */
    static fromPixels(width: number, height: number, data: ArrayLike<number>, channels?: 3 | 4): EnvironmentMap;
    /** 8-bit sRGB pixels (for example canvas ImageData) decoded to linear light. */
    static fromImageData(image: {
        width: number;
        height: number;
        data: ArrayLike<number>;
    }): EnvironmentMap;
    /** Radiance `.hdr` (RGBE, flat or new-style RLE). Untrusted input is bounds-checked. */
    static fromRGBE(source: ArrayBuffer | Uint8Array): EnvironmentMap;
    /** Procedural sky: vertical gradient with an optional soft-edged sun. */
    static gradient(options: EnvironmentGradientOptions): EnvironmentMap;
    /** Stops rendering with this map; renderers release their GPU copies on the next frame. */
    destroy(): void;
    private static sourceDirections;
    private static projectSH;
    private static convolve;
}
