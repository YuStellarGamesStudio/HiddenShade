export declare const world2dLimits: Readonly<{
    polygonVertices: 32;
    geometryExtent: 1000000;
    mapCells: 65536;
    particles: 16384;
    physicsBodies: 16384;
    maxSubSteps: 120;
    solverIterations: 64;
}>;
export declare const physicsDefaults: Readonly<{
    fixedDelta: number;
    maxSubSteps: 12;
    velocityIterations: 8;
    positionIterations: 3;
    gravityY: 980;
    penetrationSlop: 0.005;
    positionCorrection: 0.6;
    restitutionThreshold: 1;
    geometryEpsilon: 1e-8;
}>;
