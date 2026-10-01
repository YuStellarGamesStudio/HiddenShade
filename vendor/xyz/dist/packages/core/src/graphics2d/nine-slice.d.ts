import { TextureView2D, type Texture2DSource } from '../../../assets/src/index.js';
import { type Rect2D } from '../gameplay/contracts.js';
import { Group2D } from '../gameplay/group2d.js';
export type NineSliceMode = 'stretch' | 'tile' | 'tile-fit';
export interface NineSliceOptions {
    source?: Rect2D;
    view?: TextureView2D;
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
    mode?: NineSliceMode;
    drawCenter?: boolean;
}
/** Nine ordinary atlas cells, expanded into bounded reusable Sprite tiles. */
export declare class NineSlice extends Group2D {
    readonly texture: Texture2DSource;
    private readonly source;
    private readonly atlasView;
    private readonly margins;
    readonly mode: NineSliceMode;
    readonly drawCenter: boolean;
    private readonly pool;
    private destinationWidth;
    private destinationHeight;
    constructor(texture: Texture2DSource, options: NineSliceOptions);
    static fromView(view: TextureView2D, options: Omit<NineSliceOptions, 'source' | 'view' | 'left' | 'right' | 'top' | 'bottom'>): NineSlice;
    get width(): number;
    get height(): number;
    resize(width: number, height: number): void;
}
