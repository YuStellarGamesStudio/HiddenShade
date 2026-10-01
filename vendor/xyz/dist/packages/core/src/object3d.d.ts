import { Matrix4, Transform3D, type Quaternion, type Vector3 } from '../../math/src/index.js';
import { SceneObject } from './scene-object.js';
/** A local transform and its scene-owned descendant hierarchy. */
export declare class Object3D extends SceneObject {
    readonly transform: Transform3D;
    readonly worldMatrix: Matrix4;
    visible: boolean;
    private ancestor;
    private readonly descendants;
    get position(): Vector3;
    get rotation(): Quaternion;
    get scale(): Vector3;
    get parent(): Object3D | undefined;
    get children(): ReadonlySet<Object3D>;
    get worldVisible(): boolean;
    add<T extends Object3D>(child: T): T;
    remove(child: Object3D): boolean;
    /** @internal Unlinks the hierarchy without changing scene registrations. */
    detachParent(): void;
    /** Recompose mutable local transforms, including every ancestor, without allocations. */
    updateWorldMatrix(): Matrix4;
    destroy(): void;
}
