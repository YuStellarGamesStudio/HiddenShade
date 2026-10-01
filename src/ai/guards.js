import { GAME } from '../data/game.js';
import { cellIndex, cellPoint, findPath, walkDistances } from '../maze/pathfinding.js';

const sightCosine = Math.cos(GAME.guard.sightAngle * Math.PI / 360);

export function createGuard(id, waypoints) {
  const start = waypoints[0];
  const next = waypoints[1];
  return {
    id, x: start.x, y: start.y, angle: Math.atan2(next.y - start.y, next.x - start.x),
    state: 'patrol', alert: 0, lastSeen: null, visible: false,
    waypoints, waypoint: 1, path: [], pathIndex: 0,
    pathTarget: null, pathClock: 0, lost: 0, searchRemaining: 0,
    witnessedHide: false, searchTarget: null, searchIteration: 0,
  };
}

export function guardCanSee(guard, player, range, lineOfSight) {
  if (player.hidden) return false;
  const dx = player.x - guard.x;
  const dy = player.y - guard.y;
  const distance = Math.hypot(dx, dy);
  if (distance > range) return false;
  if (distance > 0 && (Math.cos(guard.angle) * dx + Math.sin(guard.angle) * dy) / distance < sightCosine) return false;
  return lineOfSight(guard, player);
}

function resetPath(guard) {
  guard.pathTarget = null;
  guard.path = [];
  guard.pathIndex = 0;
  guard.pathClock = 0;
}

export function witnessHide(guard, hide) {
  guard.state = 'search';
  guard.alert = 0;
  guard.searchRemaining = GAME.guard.witnessedHideSearchDuration;
  guard.witnessedHide = true;
  guard.lastSeen = { ...hide };
  guard.searchTarget = { ...hide };
  resetPath(guard);
}

function beginChase(guard, state) {
  guard.state = 'chase';
  guard.alert = GAME.guard.alertDuration;
  guard.lost = 0;
  guard.witnessedHide = false;
  state.detections++;
  resetPath(guard);
}

function beginSearch(guard) {
  guard.state = 'search';
  guard.alert = 0;
  guard.searchRemaining = GAME.guard.searchDuration;
  guard.witnessedHide = false;
  guard.searchTarget = { ...guard.lastSeen };
  resetPath(guard);
}

function beginPatrol(guard) {
  guard.state = 'patrol';
  guard.alert = 0;
  guard.witnessedHide = false;
  guard.searchTarget = null;
  resetPath(guard);
}

function followTarget(guard, maze, target, speed, dt, move) {
  guard.pathClock -= dt;
  const changed = !guard.pathTarget
    || Math.round(target.x) !== guard.pathTarget.x || Math.round(target.y) !== guard.pathTarget.y;
  if (!guard.pathTarget || (changed && guard.pathClock <= 0)) {
    guard.pathTarget = { x: Math.round(target.x), y: Math.round(target.y) };
    guard.path = findPath(maze, guard, guard.pathTarget);
    guard.pathIndex = 0;
    guard.pathClock = GAME.guard.pathRecomputeInterval;
  }
  let remaining = speed * dt;
  while (remaining > 0 && guard.pathIndex < guard.path.length) {
    const point = guard.path[guard.pathIndex];
    const dx = point.x - guard.x;
    const dy = point.y - guard.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= GAME.simulation.arrivalDistance) {
      guard.x = point.x;
      guard.y = point.y;
      guard.pathIndex++;
      continue;
    }
    guard.angle = Math.atan2(dy, dx);
    const amount = Math.min(distance, remaining);
    move(guard, dx / distance * amount, dy / distance * amount);
    remaining -= amount;
  }
  return guard.pathIndex >= guard.path.length;
}

function chooseSearchTarget(guard, maze) {
  const distances = walkDistances(maze, [guard.lastSeen]);
  const candidates = [];
  for (let index = 0; index < distances.length; index++) {
    if (distances[index] > 0 && distances[index] <= GAME.guard.searchRadius) candidates.push(index);
  }
  if (!candidates.length) return { ...guard.lastSeen };
  const selection = (guard.id + guard.searchIteration++) % candidates.length;
  return cellPoint(maze, candidates[selection]);
}

export function updateGuard(guard, state, dt, range, lineOfSight, move) {
  const sees = guardCanSee(guard, state.player, range, lineOfSight);
  if (sees && !(guard.state === 'search' && guard.witnessedHide)) {
    if (!guard.lastSeen) guard.lastSeen = { x: state.player.x, y: state.player.y };
    else {
      guard.lastSeen.x = state.player.x;
      guard.lastSeen.y = state.player.y;
    }
    if (guard.state === 'patrol') {
      guard.state = 'alert';
      guard.alert = 0;
    } else if (guard.state === 'search') beginChase(guard, state);
  }
  const patrolSpeed = GAME.player.speed * GAME.guard.patrolSpeedRatio;
  if (guard.state === 'alert') {
    if (!sees) {
      beginPatrol(guard);
    } else {
      guard.angle = Math.atan2(state.player.y - guard.y, state.player.x - guard.x);
      guard.alert += dt;
      if (guard.alert >= GAME.guard.alertDuration) beginChase(guard, state);
    }
  }
  if (guard.state === 'chase') {
    guard.lost = sees ? 0 : guard.lost + dt;
    if (guard.lost >= GAME.guard.lostTargetDuration) beginSearch(guard);
    else followTarget(guard, state.maze, guard.lastSeen,
      GAME.player.speed * GAME.guard.chaseSpeedRatio, dt, move);
  } else if (guard.state === 'search') {
    guard.searchRemaining -= dt;
    if (guard.searchRemaining <= 0) {
      beginPatrol(guard);
    } else {
      const arrived = followTarget(guard, state.maze, guard.searchTarget, patrolSpeed, dt, move);
      if (arrived) {
        guard.angle += GAME.guard.searchTurnSpeed * dt;
        if (!guard.witnessedHide) {
          guard.searchTarget = chooseSearchTarget(guard, state.maze);
          resetPath(guard);
        }
      }
    }
  } else if (guard.state === 'patrol') {
    if (followTarget(guard, state.maze, guard.waypoints[guard.waypoint], patrolSpeed, dt, move)) {
      guard.waypoint = (guard.waypoint + 1) % guard.waypoints.length;
      resetPath(guard);
    }
  }
  guard.visible = Boolean(state.visible[cellIndex(state.maze, guard)]) && lineOfSight(state.player, guard);
}
