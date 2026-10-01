import { type Easing } from '../actions2d/easings.js';
import type { ColorRGBA } from '../gameplay/contracts.js';
import type { RenderSnapshot, TransitionFrame } from '../../../graphics/src/render2d-contract.js';
export interface TransitionOptions {
    kind: 'fade' | 'crossfade' | 'slide';
    duration: number;
    easing?: Easing;
    color?: ColorRGBA;
    direction?: 'left' | 'right' | 'up' | 'down';
    blockInput?: boolean;
}
/** One visual handoff, owning only its immutable outgoing capture, never either Scene. */
export declare class TransitionController {
    readonly duration: number;
    readonly blockInput: boolean;
    private readonly easing;
    private readonly frame;
    private elapsed;
    private disposed;
    constructor(options: TransitionOptions);
    get kind(): TransitionFrame['kind'];
    get progress(): number;
    get complete(): boolean;
    /** @internal Captures are assigned only after version/cancellation checks succeed. */
    attachSnapshot(snapshot: RenderSnapshot): void;
    advance(dt: number): TransitionFrame;
    destroy(): void;
}
