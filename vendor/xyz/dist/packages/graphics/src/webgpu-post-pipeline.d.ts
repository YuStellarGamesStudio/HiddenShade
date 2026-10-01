import type { PostProcessingSettings } from '../../core/src/render-settings.js';
/** A linear rgba16float scene target, resolved before the 2D overlay. */
export declare class WebGPUPostPipeline {
    private readonly device;
    private readonly pipeline;
    private texture;
    private view;
    private bindGroup;
    private buffer;
    private width;
    private height;
    private readonly data;
    private readonly attachment;
    private readonly descriptor;
    private constructor();
    static initialize(device: GPUDevice, format: GPUTextureFormat, isDestroyed: () => boolean): Promise<WebGPUPostPipeline>;
    target(width: number, height: number): GPUTextureView;
    render(encoder: GPUCommandEncoder, view: GPUTextureView, settings: PostProcessingSettings): void;
    resize(width: number, height: number): void;
    releaseTarget(): void;
    destroy(): void;
}
