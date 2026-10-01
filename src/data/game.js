export const GAME = Object.freeze({
  maze: Object.freeze({
    initialSize: 20, sizePerFloor: 2, maximumSize: 40,
    minimumExitDiameterRatio: 0.6, hideDensity: 50, maximumHideDistance: 15,
    startingHideDistance: 8, tutorialHideDistance: 6,
    loopFraction: 0.055, loopFractionPerStage: 0.005, maximumLoopFraction: 0.09,
    difficultyStageFloors: 5, minimumLoops: 2, maximumGenerationAttempts: 8,
  }),
  player: Object.freeze({ speed: 2.7, radius: 0.18, maximumMoveStep: 0.12 }),
  guard: Object.freeze({
    initialCount: 2, additionalPerFloor: 1, maximumCount: 8,
    patrolSpeedRatio: 0.85, chaseSpeedRatio: 1.25,
    sightAngle: 120, sightRange: 8, firstFloorSightRatio: 0.8,
    alertDuration: 1.2, lostTargetDuration: 8, searchDuration: 5,
    witnessedHideSearchDuration: 3, catchDistance: 1,
    minimumWaypoints: 4, maximumWaypoints: 8, pathRecomputeInterval: 0.5,
    firstFloorSafeWalkDistance: 24, safeWalkDistance: 16,
    searchRadius: 4, searchTurnSpeed: 1.7,
  }),
  hide: Object.freeze({ interactionDistance: 0.8, emergenceDuration: 0.5 }),
  visibility: Object.freeze({ radius: 8, updateInterval: 0.08, wallFaceInset: 0.001 }),
  simulation: Object.freeze({ maximumStep: 1 / 60, exitDistance: 0.42, arrivalDistance: 0.025 }),
});

export const RATING_THRESHOLDS = Object.freeze({
  elapsed: 240, detections: 0, hideUses: 2, twoStarCriteria: 2,
});

export function evaluateRating({ elapsed, detections, hideUses }) {
  const met = Number(elapsed < RATING_THRESHOLDS.elapsed)
    + Number(detections <= RATING_THRESHOLDS.detections)
    + Number(hideUses <= RATING_THRESHOLDS.hideUses);
  return met === 3 ? 3 : met >= RATING_THRESHOLDS.twoStarCriteria ? 2 : 1;
}
