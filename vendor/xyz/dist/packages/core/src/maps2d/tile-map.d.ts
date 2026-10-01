import { Vector2 } from '../../../math/src/index.js';
import type { Camera2D } from '../camera2d.js';
import { Group2D } from '../gameplay/group2d.js';
import { SpriteSheet } from '../graphics2d/sprite-sheet.js';
import { Collider2D } from '../physics2d/index.js';
export interface TileMapOptions {
    columns: number;
    rows: number;
    tileWidth: number;
    tileHeight: number;
    sheet: SpriteSheet;
}
export interface Tile {
    readonly frame: number | undefined;
    readonly solid: boolean;
    readonly elevation: number;
    readonly collider?: Collider2D;
    readonly metadata?: unknown;
}
/** Orthogonal atlas tiles use a top-left anchor. Children borrow the sheet Texture. */
export declare class TileMap extends Group2D {
    readonly columns: number;
    readonly rows: number;
    readonly tileWidth: number;
    readonly tileHeight: number;
    readonly sheet: SpriteSheet;
    protected isometric: boolean;
    protected elevationStep: number;
    private readonly slots;
    private readonly configuredSlots;
    private readonly local;
    private readonly corner;
    private readonly cullMatrix;
    private nextInsertion;
    constructor(options: TileMapOptions);
    private index;
    getTile(column: number, row: number): Tile;
    /** Validates the entire edit before publishing a new immutable cell snapshot. */
    setTile(column: number, row: number, partial: Partial<Tile>): void;
    clearTile(column: number, row: number): void;
    protected defaultCollider(): Collider2D;
    private origin;
    private depth;
    tileToLocal(column: number, row: number, out?: Vector2): Vector2;
    tileToWorld(column: number, row: number, out?: Vector2): Vector2;
    private inversePoint;
    /** Returns integer grid coordinates, possibly outside the grid. Isometric inverse uses elevation zero. */
    worldToTile(point: Vector2, out?: Vector2): Vector2;
    /** Picks the topmost rendered graphic rectangle, including elevated tiles; x/y are column/row. */
    pickTile(point: Vector2, out?: Vector2): Vector2 | undefined;
    /** Render-time hook: conservative viewport inverse keeps affine/elevated graphics intact. */
    updateCulling(camera: Camera2D, width?: number, height?: number): void;
    update(deltaTime: number): void;
    destroy(): void;
}
