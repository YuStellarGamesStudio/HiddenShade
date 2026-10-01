import { Vector2 } from '../../../math/src/index.js';
import type { GameObject } from '../game-object.js';
export interface RigidBodyOptions {
    type?: 'static' | 'dynamic';
    mass?: number;
    restitution?: number;
    friction?: number;
    linearDamping?: number;
    angularDamping?: number;
    gravityScale?: number;
    lockRotation?: boolean;
}
/** Independent state bound by GameObject.body; simulation starts only when its owner has a collider. */
export declare class RigidBody2D {
    readonly velocity: Vector2;
    private readonly accumulatedForce;
    private accumulatedTorque;
    private owningObject;
    private geometry;
    private bodyMass;
    private bounce;
    private surfaceFriction;
    private linearDrag;
    private angularDrag;
    private gravityMultiplier;
    private spin;
    readonly type: 'static' | 'dynamic';
    lockRotation: boolean;
    constructor(options?: RigidBodyOptions);
    get owner(): GameObject | undefined;
    get mass(): number;
    set mass(value: number);
    get restitution(): number;
    set restitution(value: number);
    get friction(): number;
    set friction(value: number);
    get linearDamping(): number;
    set linearDamping(value: number);
    get angularDamping(): number;
    set angularDamping(value: number);
    get gravityScale(): number;
    set gravityScale(value: number);
    get angularVelocity(): number;
    set angularVelocity(value: number);
    get force(): Readonly<Vector2>;
    get torque(): number;
    get inverseMass(): number;
    get inverseInertia(): number;
    /** @internal The facade binds even detached objects, retaining ownership across scene removal. */
    attach(owner: GameObject): void;
    /** @internal Replacing a facade body releases the previous binding. */
    detach(owner: GameObject): void;
    applyForce(force: Vector2, worldPoint?: Vector2): void;
    applyImpulse(impulse: Vector2, worldPoint?: Vector2): void;
    clearForces(): void;
}
