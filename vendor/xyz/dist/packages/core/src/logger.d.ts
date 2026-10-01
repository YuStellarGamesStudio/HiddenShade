export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';
/** Shared diagnostics; production applications can set level to 'silent'. */
export declare const logger: {
    level: LogLevel;
    debug(...args: unknown[]): void;
    info(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    error(...args: unknown[]): void;
};
