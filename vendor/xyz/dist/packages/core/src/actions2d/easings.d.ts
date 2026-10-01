export type Easing = (progress: number) => number;
/** Normalized time and output; durations are always measured in seconds. */
export declare const Easings: Readonly<{
    linear: Easing;
    quadIn: Easing;
    quadOut: Easing;
    quadInOut: Easing;
    cubicIn: Easing;
    cubicOut: Easing;
    cubicInOut: Easing;
    sineIn: Easing;
    sineOut: Easing;
    sineInOut: Easing;
    bounceOut: Easing;
}>;
