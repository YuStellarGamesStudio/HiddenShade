import { TextureView2D, type Texture2DSource } from '../../assets/src/index.js';
import { Vector2 } from '../../math/src/index.js';
import { GameObject } from './game-object.js';
import { type ColorRGBA, type Rect2D } from './gameplay/contracts.js';
import type { FrameAnimation } from './gameplay/frame-animation.js';
import type { Material2D } from './materials2d/index.js';
export interface SpriteSampler2D {
    minFilter?: 'nearest' | 'linear';
    magFilter?: 'nearest' | 'linear';
}
export interface SpriteOptions {
    texture?: Texture2DSource;
    view?: TextureView2D;
    source?: Rect2D;
    position?: [number, number];
    rotation?: number;
    scale?: [number, number];
    pivot?: [number, number];
    skew?: [number, number];
    /** Normalized origin: (0, 0) is top-left and the default (0.5, 0.5) is center. */
    anchor?: [number, number];
    opacity?: number;
    visible?: boolean;
    zIndex?: number;
    tint?: ColorRGBA;
    space?: 'world' | 'screen';
    material?: Material2D;
    sampler?: SpriteSampler2D;
    roundPixels?: boolean;
}
/** A scene-owned visual; its Texture remains owned by its creator/AssetLoader. */
export declare class Sprite extends GameObject {
    private currentTexture;
    private region;
    private currentView;
    private sampling;
    private rounded;
    private currentAnimation;
    readonly anchor: Vector2;
    /** Internal pool/culling switch; independent of the author's visibility. */
    renderEnabled: boolean;
    material: Material2D | undefined;
    constructor(options: SpriteOptions);
    get texture(): Texture2DSource;
    set texture(value: Texture2DSource);
    get view(): TextureView2D | undefined;
    set view(value: TextureView2D | undefined);
    get sampler(): Readonly<SpriteSampler2D> | undefined;
    set sampler(value: Readonly<SpriteSampler2D> | undefined);
    get roundPixels(): boolean;
    set roundPixels(value: boolean);
    get source(): Readonly<Rect2D> | undefined;
    set source(value: Readonly<Rect2D> | undefined);
    /** @internal FrameAnimation owns already-frozen frame rectangles, avoiding frame allocations. */
    setAnimationSource(value: Readonly<Rect2D>): void;
    /** @internal Animation views are already immutable and keep the Sprite anchor stable. */
    setAnimationView(value: TextureView2D): void;
    get width(): number;
    get height(): number;
    get animation(): FrameAnimation | undefined;
    set animation(value: FrameAnimation | undefined);
    getLocalBounds(out?: Rect2D): Rect2D;
    destroy(): void;
}
