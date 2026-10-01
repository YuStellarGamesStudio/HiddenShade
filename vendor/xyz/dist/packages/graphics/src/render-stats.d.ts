/**
 * Per-frame 3D counters for the last rendered frame. The object is reused and
 * overwritten every frame: copy the fields you need to keep.
 */
export interface RenderStats {
    /** Frames rendered with a Scene since the renderer started (Canvas2D stays 0). */
    readonly frame: number;
    /** Visible meshes that passed the material/texture filters. */
    readonly meshes: number;
    /** Of those, meshes skipped by frustum culling. */
    readonly culled: number;
    /** Indexed draw calls in the main 3D pass. */
    readonly drawCalls: number;
    /** Triangles submitted by the main 3D pass (instances included). */
    readonly triangles: number;
    /** Indexed draw calls in the shadow pass. */
    readonly shadowDrawCalls: number;
}
/** Mutable implementation owned by a renderer. */
export declare class FrameStats implements RenderStats {
    frame: number;
    meshes: number;
    culled: number;
    drawCalls: number;
    triangles: number;
    shadowDrawCalls: number;
    /** Starts a new frame's counters. */
    begin(): void;
    /** Records one indexed main-pass draw. */
    draw(indexCount: number, instances: number): void;
}
