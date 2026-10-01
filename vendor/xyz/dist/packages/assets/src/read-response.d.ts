/** Counts decoded response bytes, not the potentially missing/compressed Content-Length. */
export declare function readResponse(response: Response, limit: number, signal: AbortSignal): Promise<Blob>;
