/** Per-resource bounds, not a browser-wide memory guarantee. */
export declare const rendering2dLimits: Readonly<{
    targetDimension: 8192;
    targetPixels: number;
    layerDepth: 32;
    commands: 65536;
    pathCommands: 16384;
    coordinate: 1000000;
    meshVertices: 1000000;
    meshIndices: 3000000;
    particleCapacity: 65536;
    atlasPages: 64;
    atlasFrames: 16384;
    fontGlyphs: 4096;
    fontPages: 64;
    fontBytes: number;
    manifestEntries: 4096;
    manifestBundles: 256;
    filterRadius: 128;
    filterQuality: 8;
    resolution: 8;
}>;
