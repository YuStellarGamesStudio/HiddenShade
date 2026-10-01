import { Vector3 } from '../../math/src/index.js';
export interface PointLightOptions {
    position?: Vector3 | [number, number, number];
    color?: [number, number, number];
    intensity?: number;
    /** Zero means no finite range cutoff. */
    range?: number;
}
export interface SpotLightOptions extends PointLightOptions {
    /** Points from the light toward the illuminated surface, unlike directionalLight. */
    direction?: Vector3 | [number, number, number];
    innerAngle?: number;
    outerAngle?: number;
}
/** World-space inverse-square light. Mutated inputs are revalidated when rendering. */
export declare class PointLight {
    position: Vector3;
    color: [number, number, number];
    intensity: number;
    range: number;
    constructor(options?: PointLightOptions);
    validate(): void;
}
/** Cone angles are radians: 0 <= innerAngle < outerAngle <= PI / 2. */
export declare class SpotLight extends PointLight {
    direction: Vector3;
    innerAngle: number;
    outerAngle: number;
    constructor(options?: SpotLightOptions);
    validate(): void;
}
