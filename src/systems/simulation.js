import { GAME } from '../data/game.js';
import { generateMaze } from '../maze/generator.js';
import { cellIndex, hasLineOfSight, isWalkable } from '../maze/pathfinding.js';
import { createGuard, guardCanSee, updateGuard, witnessHide } from '../ai/guards.js';

function freshState(maze, floor, serial) {
  return {
    maze, floor, serial,
    player: { ...maze.start, hidden: false, emerging: 0 },
    guards: maze.patrolRoutes.map((route, index) => createGuard(index + 1, route)),
    visible: new Uint8Array(maze.cells.length), explored: new Uint8Array(maze.cells.length),
    elapsed: 0, detections: 0, hideUses: 0, observed: false, status: 'playing', capture: null,
  };
}

function canOccupy(maze, x, y) {
  const radius = GAME.player.radius;
  return isWalkable(maze, Math.floor(x - radius + 0.5), Math.floor(y - radius + 0.5))
    && isWalkable(maze, Math.floor(x + radius + 0.5), Math.floor(y - radius + 0.5))
    && isWalkable(maze, Math.floor(x - radius + 0.5), Math.floor(y + radius + 0.5))
    && isWalkable(maze, Math.floor(x + radius + 0.5), Math.floor(y + radius + 0.5));
}

export function createSimulation(floor = 1, serial = 0, lineOfSight) {
  floor = Math.max(1, Math.floor(Number(floor) || 1));
  const maze = generateMaze(floor, serial);
  const state = freshState(maze, floor, serial);
  let destroyed = false;
  let visibilityClock = 0;
  const sightRange = GAME.guard.sightRange * (floor === 1 ? GAME.guard.firstFloorSightRatio : 1);
  const clearSight = (a, b) => hasLineOfSight(maze, a, b) && (!lineOfSight || lineOfSight(a, b));
  const fogTarget = { x: 0, y: 0 };
  const rayTarget = { x: 0, y: 0 };

  function move(actor, dx, dy) {
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / GAME.player.maximumMoveStep));
    const stepX = dx / steps;
    const stepY = dy / steps;
    for (let step = 0; step < steps; step++) {
      if (canOccupy(maze, actor.x + stepX, actor.y)) actor.x += stepX;
      if (canOccupy(maze, actor.x, actor.y + stepY)) actor.y += stepY;
    }
  }

  function refreshVisibility() {
    state.visible.fill(0);
    const player = state.player;
    const radius = GAME.visibility.radius;
    const minX = Math.max(0, Math.floor(player.x - radius));
    const maxX = Math.min(maze.size - 1, Math.ceil(player.x + radius));
    const minY = Math.max(0, Math.floor(player.y - radius));
    const maxY = Math.min(maze.size - 1, Math.ceil(player.y + radius));
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = x - player.x;
        const dy = y - player.y;
        const distance = Math.hypot(dx, dy);
        if (distance > radius) continue;
        const index = y * maze.size + x;
        fogTarget.x = x;
        fogTarget.y = y;
        const wall = maze.cells[index] === 0;
        if (!hasLineOfSight(maze, player, fogTarget, wall)) continue;
        if (lineOfSight) {
          // Rays reveal the near face of a wall, not its occluded center.
          const faceDistance = wall && distance > 0
            ? 0.5 * distance / Math.max(Math.abs(dx), Math.abs(dy)) + GAME.visibility.wallFaceInset : 0;
          const scale = distance > 0 ? Math.max(0, (distance - faceDistance) / distance) : 1;
          rayTarget.x = player.x + dx * scale;
          rayTarget.y = player.y + dy * scale;
          if (!lineOfSight(player, rayTarget)) continue;
        }
        state.visible[index] = 1;
        state.explored[index] = 1;
      }
    }
    for (const guard of state.guards) {
      guard.visible = Boolean(state.visible[cellIndex(maze, guard)]) && clearSight(player, guard);
    }
    visibilityClock = GAME.visibility.updateInterval;
  }

  function step(dt, inputX, inputY) {
    state.elapsed += dt;
    const player = state.player;
    if (player.emerging > 0) {
      player.emerging = Math.max(0, player.emerging - dt);
      if (player.emerging === 0) player.hidden = false;
    } else if (!player.hidden) {
      const length = Math.hypot(inputX, inputY);
      const scale = GAME.player.speed * dt / Math.max(1, length);
      move(player, inputX * scale, inputY * scale);
    }
    if (!player.hidden && Math.hypot(player.x - maze.exit.x, player.y - maze.exit.y) <= GAME.simulation.exitDistance) {
      state.status = 'escaped';
      refreshVisibility();
      return;
    }
    state.observed = false;
    for (const guard of state.guards) {
      updateGuard(guard, state, dt, sightRange, clearSight, move);
      const seeingPlayer = guardCanSee(guard, player, sightRange, clearSight);
      if (seeingPlayer) state.observed = true;
      if (guard.state === 'chase' && !player.hidden
        && Math.hypot(guard.x - player.x, guard.y - player.y) <= GAME.guard.catchDistance
        && seeingPlayer) {
        state.status = 'caught';
        state.capture = {
          guardId: guard.id, lastSeen: guard.lastSeen ? { ...guard.lastSeen } : null,
          position: { x: player.x, y: player.y },
        };
        refreshVisibility();
        return;
      }
    }
    visibilityClock -= dt;
    if (visibilityClock <= 0) refreshVisibility();
  }

  refreshVisibility();
  return {
    state,
    update(dt, input = { x: 0, y: 0 }) {
      if (destroyed || state.status !== 'playing' || !Number.isFinite(dt) || dt <= 0) return;
      const inputX = Number.isFinite(input.x) ? input.x : 0;
      const inputY = Number.isFinite(input.y) ? input.y : 0;
      let remaining = dt;
      while (remaining > 0 && state.status === 'playing') {
        const duration = Math.min(GAME.simulation.maximumStep, remaining);
        step(duration, inputX, inputY);
        remaining -= duration;
      }
    },
    interact() {
      if (destroyed || state.status !== 'playing' || state.player.emerging > 0) return false;
      const player = state.player;
      if (player.hidden) {
        player.emerging = GAME.hide.emergenceDuration;
        return true;
      }
      let closest = null;
      let distance = GAME.hide.interactionDistance;
      for (const hide of maze.hides) {
        const candidate = Math.hypot(hide.x - player.x, hide.y - player.y);
        if (candidate <= distance && clearSight(player, hide)) {
          closest = hide;
          distance = candidate;
        }
      }
      if (!closest) return false;
      for (const guard of state.guards) {
        if (guardCanSee(guard, player, sightRange, clearSight)) witnessHide(guard, closest);
      }
      player.x = closest.x;
      player.y = closest.y;
      player.hidden = true;
      state.hideUses++;
      refreshVisibility();
      return true;
    },
    retry() {
      if (destroyed) return false;
      Object.assign(state, freshState(maze, floor, serial));
      visibilityClock = 0;
      refreshVisibility();
      return true;
    },
    destroy() { destroyed = true; },
  };
}
