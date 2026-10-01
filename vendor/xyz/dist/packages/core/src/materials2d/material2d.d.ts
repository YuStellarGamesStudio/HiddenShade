export interface NativeEffect2DOptions {
    wgsl: string;
    glsl: string;
    uniforms?: readonly number[];
}
declare class NativeEffect2D extends EventTarget {
    private readonly wgslSource;
    private readonly glslSource;
    private disposed;
    readonly uniforms: Float32Array<ArrayBuffer>;
    constructor(options: NativeEffect2DOptions);
    get wgsl(): string;
    get glsl(): string;
    get destroyed(): boolean;
    setUniforms(values: readonly number[]): void;
    destroy(): void;
}
/** Native fragment effect on one Sprite's premultiplied sampled color. */
export declare class Material2D extends NativeEffect2D {
}
/** Native fragment effect on the transparent world-2D plus HUD layer. */
export declare class PostProcessor2D extends NativeEffect2D {
}
export declare function validateEffect2D(effect: Material2D | PostProcessor2D): void;
export {};
