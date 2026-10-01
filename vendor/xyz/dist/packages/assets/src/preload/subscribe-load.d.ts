/** Cancels this acquisition only; the loader owns and completes its shared cache request. */
export declare function subscribeLoad<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T>;
