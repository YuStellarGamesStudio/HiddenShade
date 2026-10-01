export declare const MAX_POINT_LIGHTS = 8;
export declare const MAX_SPOT_LIGHTS = 8;
/** Shared vec4-aligned light block used by both graphics backends. Offsets are floats. */
export declare const POINT_LIGHT_OFFSET = 12;
export declare const POINT_LIGHT_STRIDE = 8;
export declare const SPOT_LIGHT_OFFSET: number;
export declare const SPOT_LIGHT_STRIDE = 16;
export declare const LIGHTING_FLOAT_COUNT: number;
/** Environment block: nine SH vec4 followed by intensity/background/mip data. */
export declare const ENVIRONMENT_FLOAT_COUNT = 40;
export declare const environmentLimits: Readonly<{
    /** Equirect width cap; height is width / 2. */
    maxWidth: 2048;
    minHeight: 4;
    maxMips: 7;
    /** Diffuse SH and blurred specular levels are filtered from at most this width. */
    proxyWidth: 64;
}>;
/** A lost WebGL2 context not restored within this window becomes a fatal GraphicsError. */
export declare const graphicsRecoveryLimits: Readonly<{
    restoreTimeoutMs: 10000;
}>;
export declare const renderingLimits: Readonly<{
    pointLights: 8;
    spotLights: 8;
}>;
/** Fog block shared by both graphics backends: color.rgb/mode, near/far/density/0. */
export declare const FOG_FLOAT_COUNT = 8;
