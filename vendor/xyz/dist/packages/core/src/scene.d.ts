import { Vector3 } from '../../math/src/index.js';
import { World } from '../../ecs/src/world.js';
import { Camera2D } from './camera2d.js';
import { PerspectiveCamera } from './perspective-camera.js';
import type { OrthographicCamera } from './orthographic-camera.js';
import { AnimationMixer } from './animation.js';
import type { EnvironmentMap } from './environment.js';
import type { PointLight, SpotLight } from './lights.js';
import { FogSettings, PostProcessingSettings, ShadowSettings } from './render-settings.js';
import type { Game } from './game.js';
import { SceneObject } from './scene-object.js';
import { SceneTimers } from './scene-timers.js';
import { PhysicsWorld2D } from './physics2d/world.js';
import type { PostProcessor2D } from './materials2d/index.js';
import type { Pointer } from '../../input/src/index.js';
import { PointerRouter } from './gameplay/pointer-router.js';
import { PreloadBatch } from '../../assets/src/index.js';
/** Owns objects and their scene-local ECS registrations until synchronous disposal. */
export declare class Scene {
    readonly world: World;
    readonly camera2D: Camera2D;
    camera3D: PerspectiveCamera | OrthographicCamera;
    readonly timers: SceneTimers;
    readonly animations: AnimationMixer;
    readonly physics: PhysicsWorld2D;
    readonly effects2D: PostProcessor2D[];
    /**
     * Full-frame native effects over the finished 3D image (WebGPU and WebGL2), applied in order
     * before the 2D layer. Same descriptors and shader ABI as `effects2D`.
     */
    readonly effects3D: PostProcessor2D[];
    readonly pointLights: PointLight[];
    readonly spotLights: SpotLight[];
    readonly shadows: ShadowSettings;
    readonly postProcessing: PostProcessingSettings;
    ambientLight: number;
    /** Distance fog for 3D meshes (WebGPU and WebGL2). */
    readonly fog: FogSettings;
    /** Image-based lighting for PBRMaterial; replaces `ambientLight` for those materials. */
    environment: EnvironmentMap | undefined;
    environmentIntensity: number;
    /** Skybox drawn behind 3D objects. May be the same map as `environment`. */
    background: EnvironmentMap | undefined;
    backgroundIntensity: number;
    /** Direction points from a surface toward the light. */
    directionalLight: {
        direction: Vector3;
        color: [number, number, number];
        intensity: number;
    };
    private readonly registrations;
    private readonly registeredObjects;
    private readonly objectUpdates;
    private nextObjectUpdate;
    private frameObjectUpdate;
    private pointerRouter;
    /** Explicit global-pointer observers; passive scene objects allocate no listener hub. */
    get pointerEvents(): PointerRouter;
    /** @internal Input routing is independent of subclass Scene.update. */
    routePointers(pointer: Pointer, canContinue: () => boolean): void;
    /** @internal Pause/blur/scene disposal cancels captured drags synchronously. */
    resetPointerRouting(): void;
    private owner;
    private controller;
    private disposed;
    get objects(): ReadonlySet<SceneObject>;
    get destroyed(): boolean;
    has(object: SceneObject): boolean;
    add<T extends SceneObject>(object: T): T;
    private register;
    remove(object: SceneObject): boolean;
    private unregister;
    /** @internal A Scene belongs to one Game for its lifetime, including failed preparation. */
    claim(game: Game): AbortSignal;
    /** @internal Abort signals are cooperative; disposal itself is always synchronous. */
    cancel(): void;
    /** @internal Runs once before Game atomically publishes the prepared Scene. */
    prepare(game: Game, signal: AbortSignal): void | Promise<void>;
    private prepareBatch;
    protected preload(game: Game, signal: AbortSignal): PreloadBatch | void | Promise<PreloadBatch | void>;
    protected initialize(game: Game, signal: AbortSignal): void | Promise<void>;
    /** @internal Freeze membership before callbacks; new/re-added objects wait one frame. */
    beginObjectFrame(): void;
    /** @internal Re-entrant lifecycle callbacks cannot revive an object in the same tick. */
    beginObjectUpdates(deltaTime: number, canContinue: () => boolean): void;
    /** @internal Invoked independently of subclass Scene.update. */
    advanceFrameAnimations(deltaTime: number, canContinue: () => boolean): void;
    /** @internal Only queues explicitly accessed by consumers are advanced. */
    advanceActions(deltaTime: number, canContinue: () => boolean): void;
    /** @internal Object updates are never dependent on a subclass calling super. */
    advanceObjects(deltaTime: number, canContinue: () => boolean): void;
    /** @internal Systems/actions run first, physics then particles, final camera last. */
    advanceAfterUpdate(deltaTime: number, canContinue: () => boolean): void;
    /** Called before scene systems, once per visible frame. */
    update(deltaTime: number): void;
    destroy(): void;
    /** Release scene-owned resources synchronously; called exactly once. */
    protected onDestroy(): void;
}
