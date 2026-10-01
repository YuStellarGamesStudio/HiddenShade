export declare class XYZError extends Error {
    constructor(message: string, options?: ErrorOptions);
}
export declare class GraphicsError extends XYZError {
}
export declare class WebGPUNotSupportedError extends GraphicsError {
}
export declare class WebGPUInitializationError extends GraphicsError {
}
export declare class WebGPUDeviceLostError extends GraphicsError {
}
export declare class GraphicsBackendUnavailableError extends GraphicsError {
}
export declare class UnsupportedGraphicsError extends GraphicsError {
}
export declare class WebGL2InitializationError extends GraphicsError {
}
export declare class WebGL2ContextLostError extends GraphicsError {
}
export declare class Canvas2DInitializationError extends GraphicsError {
}
