import type { Scene } from './scene.js';
/** Base facade for scene-owned objects, independent of 2D or 3D transforms. */
export declare abstract class SceneObject extends EventTarget {
    private owningScene;
    private disposed;
    private observedEventTypes;
    private ownershipGeneration;
    /** @internal Invalidates callback continuations on remove/re-add within the same Scene. */
    get registrationGeneration(): number;
    addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void;
    /** @internal Untouched pooled sprites need no lifecycle Event allocations. */
    dispatchObjectEvent(type: string, detail?: unknown): void;
    /** @internal Update payloads are allocated only for objects observing lifecycle events. */
    emitUpdate(type: 'preupdate' | 'postupdate', dt: number): void;
    get scene(): Scene | undefined;
    get destroyed(): boolean;
    /** @internal Called only by Scene during registration. */
    attach(scene: Scene): void;
    /** @internal Called only by Scene during removal. */
    detach(scene: Scene): void;
    destroy(): void;
    protected onDestroy(): void;
}
