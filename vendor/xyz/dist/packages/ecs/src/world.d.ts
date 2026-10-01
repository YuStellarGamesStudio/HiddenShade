export type Entity = number;
export type ComponentType<T> = abstract new (...args: never[]) => T;
export interface System {
    initialize?(world: World): void;
    update(world: World, deltaTime: number): void;
    destroy?(world: World): void;
}
/** Scene-local entities and components; iteration follows entity and system insertion order. */
export declare class World {
    private nextEntity;
    private readonly entities;
    private readonly components;
    private readonly systems;
    private updating;
    private systemsNeedCompaction;
    private disposed;
    createEntity(): Entity;
    hasEntity(entity: Entity): boolean;
    removeEntity(entity: Entity): boolean;
    addComponent<T>(entity: Entity, type: ComponentType<T>, value: T): T;
    getComponent<T>(entity: Entity, type: ComponentType<T>): T | undefined;
    query(...types: readonly ComponentType<unknown>[]): IterableIterator<Entity>;
    hasComponent<T>(entity: Entity, type: ComponentType<T>): boolean;
    removeComponent<T>(entity: Entity, type: ComponentType<T>): boolean;
    addSystem(system: System): void;
    removeSystem(system: System): boolean;
    update(deltaTime: number): void;
    destroy(): void;
    private compactSystems;
    private assertAlive;
}
