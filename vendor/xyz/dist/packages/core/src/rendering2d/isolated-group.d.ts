import { Group2D } from '../gameplay/group2d.js';
import type { Rect2D } from '../gameplay/contracts.js';
import { Filter2D } from './filters2d.js';
import { Mask2D } from './mask2d.js';
export type BlendMode2D = 'normal' | 'add' | 'multiply' | 'screen' | 'erase';
/** One compositing slot only when explicitly enabled; all descriptors remain borrowed. */
export declare class IsolatedGroup2D extends Group2D {
    private cached;
    private isolated;
    private dirtyVersion;
    private clip;
    private stack;
    private blend;
    get isolate(): boolean;
    set isolate(value: boolean);
    get cacheAsTexture(): boolean;
    set cacheAsTexture(value: boolean);
    get cacheVersion(): number;
    updateCache(): void;
    get mask(): Mask2D | undefined;
    set mask(value: Mask2D | undefined);
    get filters(): readonly Filter2D[];
    set filters(value: readonly Filter2D[]);
    get blendMode(): BlendMode2D;
    set blendMode(value: BlendMode2D);
    get isolationEnabled(): boolean;
    get filterPadding(): number;
    getLocalBounds(out?: Rect2D): Rect2D;
}
