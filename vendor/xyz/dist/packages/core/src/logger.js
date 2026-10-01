const e={debug:0,info:1,warn:2,error:3,silent:4};export const logger={level:`warn`,debug(...t){e[this.level]<=e.debug&&console.debug(`[XYZ]`,...t)},info(...t){e[this.level]<=e.info&&console.info(`[XYZ]`,...t)},warn(...t){e[this.level]<=e.warn&&console.warn(`[XYZ]`,...t)},error(...t){e[this.level]<=e.error&&console.error(`[XYZ]`,...t)}};
//# sourceMappingURL=logger.js.map
