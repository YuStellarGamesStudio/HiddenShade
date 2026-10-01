import { AssetLoader, type PreloadBatch } from '../../assets/src/index.js';
import { InputManager } from '../../input/src/index.js';
import { AudioManager } from '../../audio/src/audio-manager.js';
import { type Renderer, type RendererPreference } from '../../graphics/src/index.js';
import { Scene } from './scene.js';
import { Clock } from './clock.js';
import { type TransitionOptions } from './transitions2d/index.js';
export interface GameOptions {
    canvas: string | HTMLCanvasElement;
    renderer?: RendererPreference;
    width?: number;
    height?: number;
    maxDeltaTime?: number;
    /** Defaults to devicePixelRatio capped at the engine's configured maximum. */
    pixelRatio?: number;
    /** Follow the canvas CSS content size. Enabled by default. */
    autoResize?: boolean;
    /**
     * 4× multisampling for the 3D pass (WebGPU) and the default WebGL2 framebuffer.
     * Enabled by default; the WebGL2 post-processing path and Canvas2D do not multisample.
     */
    antialias?: boolean;
    /**
     * Rebuild a lost WebGL2 context or WebGPU device and keep running, emitting
     * `graphicslost` and `graphicsrecovered`. Enabled by default; when false a loss is fatal.
     */
    recoverGraphics?: boolean;
}
export type GameState = 'idle' | 'running' | 'paused' | 'destroyed';
export interface SetSceneOptions {
    transition?: TransitionOptions;
}
export interface SceneTransitionEventDetail {
    readonly from: Scene;
    readonly to: Scene;
    readonly kind: TransitionOptions['kind'];
}
/** Browser runtime controller. GPU handles remain private to the renderer. */
export declare class Game extends EventTarget {
    readonly canvas: HTMLCanvasElement;
    readonly graphics: Renderer;
    readonly clock: Clock;
    readonly assets: AssetLoader;
    readonly input: InputManager;
    readonly audio: AudioManager;
    private currentState;
    private currentScene;
    private updatingScene;
    private readonly canUpdateScene;
    private pendingScene;
    private pendingCompletion;
    private loadingBatch;
    private loadingScene;
    private activeTransition;
    private readonly frameEffects;
    private sceneVersion;
    private switchingScene;
    private requestId;
    private observer;
    private logicalWidth;
    private logicalHeight;
    private readonly fixedPixelRatio;
    private appliedPixelRatio;
    private fatalError;
    private appliedContain;
    private appliedIntrinsicSize;
    private readonly previousContain;
    private readonly previousIntrinsicSize;
    private readonly autoResize;
    private readonly accessibilityManager;
    private readonly accessibilitySize;
    private constructor();
    static create(options: GameOptions): Promise<Game>;
    get state(): GameState;
    get width(): number;
    get height(): number;
    get scene(): Scene | undefined;
    get loading(): PreloadBatch | undefined;
    /** @internal Older async candidates cannot overwrite or clear a newer loading barrier. */
    setLoading(scene: Scene, batch: PreloadBatch | undefined): void;
    get transitioning(): boolean;
    private cancelTransition;
    private completeTransition;
    private beginTransition;
    start(scene?: Scene): void;
    /** Prepare/capture before publication; only the published Scene participates in simulation. */
    setScene(next: Scene, options?: SetSceneOptions): Promise<void>;
    /** @internal Called when a Scene is explicitly disposed by its owner. */
    onSceneDisposed(scene: Scene): void;
    pause(): void;
    resume(): void;
    resize(width: number, height: number): void;
    destroy(): void;
    private installLayout;
    private setIntrinsicSize;
    private validateSize;
    private contentSize;
    private resizeBacking;
    private cleanup;
    private readonly onVisibilityChange;
    private readonly onFrame;
    private fail;
}
