import { Texture } from '../../assets/src/index.js';
import { TextureMaterial, type TextureMaterialOptions } from './mesh.js';
export type MaterialAlphaMode = 'OPAQUE' | 'MASK' | 'BLEND';
export interface TextureSamplerOptions {
    minFilter?: 'nearest' | 'linear';
    magFilter?: 'nearest' | 'linear';
    addressModeU?: 'clamp-to-edge' | 'repeat' | 'mirror-repeat';
    addressModeV?: 'clamp-to-edge' | 'repeat' | 'mirror-repeat';
}
export interface PBRMaterialOptions extends TextureMaterialOptions {
    metallic?: number;
    roughness?: number;
    emissive?: [number, number, number];
    metallicRoughnessTexture?: Texture;
    normalTexture?: Texture;
    normalScale?: number;
    occlusionTexture?: Texture;
    occlusionStrength?: number;
    emissiveTexture?: Texture;
    textureSampler?: TextureSamplerOptions;
    metallicRoughnessSampler?: TextureSamplerOptions;
    normalSampler?: TextureSamplerOptions;
    occlusionSampler?: TextureSamplerOptions;
    emissiveSampler?: TextureSamplerOptions;
    alphaCutoff?: number;
    alphaMode?: MaterialAlphaMode;
    doubleSided?: boolean;
}
/** Metallic-roughness material; all texture slots borrow, never own, their Texture. */
export declare class PBRMaterial extends TextureMaterial {
    readonly metallic: number;
    readonly roughness: number;
    readonly emissive: [number, number, number];
    /** Linear texture: roughness in G, metallic in B. */
    readonly metallicRoughnessTexture: Texture | undefined;
    /** Linear tangent-space normal texture, using UV0. */
    readonly normalTexture: Texture | undefined;
    readonly normalScale: number;
    /** Linear occlusion in R; affects indirect illumination only. */
    readonly occlusionTexture: Texture | undefined;
    readonly occlusionStrength: number;
    /** Emissive RGB is decoded from sRGB before applying the linear emissive factor. */
    readonly emissiveTexture: Texture | undefined;
    readonly alphaCutoff: number;
    readonly alphaMode: MaterialAlphaMode;
    readonly doubleSided: boolean;
    readonly textureSampler: Readonly<TextureSamplerOptions> | undefined;
    readonly metallicRoughnessSampler: Readonly<TextureSamplerOptions> | undefined;
    readonly normalSampler: Readonly<TextureSamplerOptions> | undefined;
    readonly occlusionSampler: Readonly<TextureSamplerOptions> | undefined;
    readonly emissiveSampler: Readonly<TextureSamplerOptions> | undefined;
    constructor(options: PBRMaterialOptions);
}
