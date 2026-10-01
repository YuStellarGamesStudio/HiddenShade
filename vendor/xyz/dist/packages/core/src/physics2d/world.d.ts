import { Vector2 } from '../../../math/src/index.js';
import type { GameObject } from '../game-object.js';
import { Collider2D } from './collider.js';
export interface CollisionDetail {
    readonly self: GameObject;
    readonly other: GameObject;
    readonly normal: Vector2;
    readonly points: readonly Vector2[];
    readonly penetration: number;
    readonly sensor: boolean;
    cancelResponse(): void;
}
export interface ContactQuery {
    readonly owner: GameObject;
    readonly collider: Collider2D;
    readonly normal: Vector2;
    readonly points: readonly Vector2[];
    readonly penetration: number;
    readonly sensor: boolean;
}
export interface PhysicsRayHit {
    readonly owner: GameObject;
    readonly collider: Collider2D;
    readonly distance: number;
    readonly point: Vector2;
    readonly normal: Vector2;
}
export interface PhysicsWorldOptions {
    gravity?: [number, number];
    fixedDelta?: number;
    maxSubSteps?: number;
    velocityIterations?: number;
    positionIterations?: number;
}
/** Discrete bounded 2D impulse solver. It does not implement CCD, joints or sleeping. */
export declare class PhysicsWorld2D {
    readonly gravity: Vector2;
    private readonly owners;
    private readonly sorted;
    private readonly activeContacts;
    private readonly solveContacts;
    private readonly forceBodies;
    private readonly queryManifold;
    private readonly positionManifold;
    private readonly queryNormal;
    private readonly queryGeometries;
    private continuation;
    private accumulator;
    private stepToken;
    private stepping;
    private disposed;
    private timeStep;
    private stepLimit;
    private velocityPasses;
    private positionPasses;
    droppedTime: number;
    constructor(options?: PhysicsWorldOptions);
    get destroyed(): boolean;
    get fixedDelta(): number;
    set fixedDelta(value: number);
    get maxSubSteps(): number;
    set maxSubSteps(value: number);
    get velocityIterations(): number;
    set velocityIterations(value: number);
    get positionIterations(): number;
    set positionIterations(value: number);
    /** @internal Called transactionally by Scene and facade body/collider setters. */
    register(owner: GameObject): void;
    unregister(owner: GameObject): void;
    private alive;
    private emit;
    private end;
    update(deltaTime: number, canContinue?: () => boolean): void;
    private simulate;
    private prepareBounce;
    private solveVelocity;
    private impulse;
    private solvePosition;
    overlap(collider: Collider2D, owner: GameObject): readonly ContactQuery[];
    raycast(origin: Vector2, direction: Vector2, maxDistance: number, mask?: number): readonly PhysicsRayHit[];
    clear(): void;
    destroy(): void;
}
