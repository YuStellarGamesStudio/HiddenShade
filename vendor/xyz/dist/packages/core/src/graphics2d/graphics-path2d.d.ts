import type { Texture2DSource, TextureView2D } from '../../../assets/src/index.js';
import type { Rect2D } from '../gameplay/contracts.js';
export type Affine2D = readonly [
    number,
    number,
    number,
    number,
    number,
    number
];
export type PathCommand2D = {
    readonly op: 'moveTo' | 'lineTo';
    readonly x: number;
    readonly y: number;
} | {
    readonly op: 'quadraticCurveTo';
    readonly cpx: number;
    readonly cpy: number;
    readonly x: number;
    readonly y: number;
} | {
    readonly op: 'bezierCurveTo';
    readonly cp1x: number;
    readonly cp1y: number;
    readonly cp2x: number;
    readonly cp2y: number;
    readonly x: number;
    readonly y: number;
} | {
    readonly op: 'arc';
    readonly x: number;
    readonly y: number;
    readonly radius: number;
    readonly startAngle: number;
    readonly endAngle: number;
    readonly counterclockwise?: boolean;
} | {
    readonly op: 'ellipse';
    readonly x: number;
    readonly y: number;
    readonly radiusX: number;
    readonly radiusY: number;
    readonly rotation?: number;
    readonly startAngle?: number;
    readonly endAngle?: number;
    readonly counterclockwise?: boolean;
} | {
    readonly op: 'rect' | 'roundedRect';
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly radius?: number;
} | {
    readonly op: 'circle';
    readonly x: number;
    readonly y: number;
    readonly radius: number;
} | {
    readonly op: 'polygon';
    readonly points: readonly (readonly [number, number])[];
} | {
    readonly op: 'svg';
    readonly data: string;
} | {
    readonly op: 'closePath';
};
export type Paint2D = string | {
    readonly kind: 'linear-gradient';
    readonly from: readonly [number, number];
    readonly to: readonly [number, number];
    readonly stops: readonly {
        readonly offset: number;
        readonly color: string;
    }[];
} | {
    readonly kind: 'radial-gradient';
    readonly from: readonly [number, number, number];
    readonly to: readonly [number, number, number];
    readonly stops: readonly {
        readonly offset: number;
        readonly color: string;
    }[];
} | {
    readonly kind: 'pattern';
    readonly texture?: Texture2DSource;
    readonly view?: TextureView2D;
    readonly repetition?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
    readonly transform?: Affine2D;
};
export interface Stroke2D {
    readonly paint: Paint2D;
    readonly width: number;
    readonly cap?: CanvasLineCap;
    readonly join?: CanvasLineJoin;
    readonly miterLimit?: number;
}
export interface GraphicsInstruction2D {
    readonly path: GraphicsPath2D;
    readonly fill?: Paint2D;
    readonly stroke?: Stroke2D;
    readonly alpha?: number;
}
/** Immutable reusable CPU descriptor, backed only by native Path2D (not GPU tessellation). */
export declare class GraphicsPath2D {
    readonly commands: readonly PathCommand2D[];
    readonly holes: readonly GraphicsPath2D[];
    readonly fillRule: CanvasFillRule;
    readonly bounds: Readonly<Rect2D>;
    private readonly native;
    private readonly svgData;
    readonly commandCount: number;
    private static hitContext;
    constructor(commands: readonly PathCommand2D[], options?: {
        holes?: readonly GraphicsPath2D[];
        fillRule?: CanvasFillRule;
    });
    /** Returns an independent native copy; callers cannot mutate this descriptor. */
    get nativePath2D(): Path2D;
    toSVGPathData(): string;
    containsPoint(x: number, y: number, stroke?: Stroke2D): boolean;
}
