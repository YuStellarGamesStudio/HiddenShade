export const RENDER = Object.freeze({
  tileWidth: 64, tileHeight: 32, halfWidth: 32, halfHeight: 16,
  artScale: 1 / 3, characterAnchor: 80 / 96,
  windowRadius: 8, terrainBudget: 450, spriteBudget: 500,
  maskWidth: 1024, maskHeight: 512, fogInterval: 0.08,
  memoryOpacity: 0.22, wallMemoryOpacity: 0.19, hideMemoryOpacity: 0.6,
  wallFadeOpacity: 0.25, wallFadeWidth: 38, wallFadeHeight: 84,
  hiddenOpacity: 0.24, emergenceOpacity: 0.58, hiddenFootOpacity: 0.45,
  zoomDefault: 1.22, zoomMin: 0.7, zoomMax: 2.2,
  cameraResponse: 9, cameraVerticalOffset: 28,
  groundDepth: -1000, lightDepth: -900, coneDepth: 100,
  actorDepthBias: 0.2, markerDepth: 1000,
  coneRays: 40, coneStep: 0.075, coneOpacity: 0.13,
  coneColor: '#d59b77', chaseConeColor: '#de7869',
  glowOpacity: 0.55, glowPulse: 0.12, glowFrequency: 1.4,
  footprintOpacity: 0.75, markerLift: 42,
  floorFrame: 0, wallFrame: 1, playerFrame: 2, guardFrame: 3,
  hideFrame: 4, exitFrame: 5, glowFrame: 6, footFrame: 7,
  alertFrame: 8, chaseFrame: 9,
  atlasFrames: Object.freeze(Array.from({ length: 10 }, (_, i) => Object.freeze(
    i === 0 ? { x: 0, y: 192, width: 192, height: 96 }
      : { x: i * 192, y: 0, width: 192, height: 288 },
  ))),
});
