import { GAME } from '../data/game.js';
import { cellIndex, cellPoint, findPath, walkDistances } from './pathfinding.js';

function seedFor(floor, serial) {
  let hash = 2166136261;
  for (const character of `HiddenShade:${floor}:${serial}`) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  return hash >>> 0;
}

function randomSource(seed) {
  let value = seed || 0x9e3779b9;
  return () => {
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    return (value >>> 0) / 4294967296;
  };
}

function shuffle(values, random) {
  for (let index = values.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [values[index], values[other]] = [values[other], values[index]];
  }
  return values;
}

function diameterOf(maze) {
  let diameter = 0;
  let start = null;
  let exit = null;
  for (let index = 0; index < maze.cells.length; index++) {
    if (!maze.cells[index]) continue;
    const origin = cellPoint(maze, index);
    const distances = walkDistances(maze, [origin]);
    for (let target = index + 1; target < distances.length; target++) {
      if (distances[target] > diameter) {
        diameter = distances[target];
        start = origin;
        exit = cellPoint(maze, target);
      }
    }
  }
  return { diameter, start, exit };
}

function placeHides(maze, mainPath) {
  const tuning = GAME.maze;
  const first = mainPath[Math.min(tuning.tutorialHideDistance, mainPath.length - 2)];
  maze.hides.push({ ...first });
  const traversable = maze.cells.reduce((count, value) => count + Number(value !== 0), 0);
  const minimumCount = Math.ceil(traversable / tuning.hideDensity);
  while (true) {
    const distances = walkDistances(maze, maze.hides);
    let farthest = -1;
    let farthestDistance = -1;
    for (let index = 0; index < distances.length; index++) {
      if (index === cellIndex(maze, maze.exit) || index === cellIndex(maze, maze.start)) continue;
      if (distances[index] > farthestDistance) {
        farthest = index;
        farthestDistance = distances[index];
      }
    }
    if (farthestDistance <= tuning.maximumHideDistance && maze.hides.length >= minimumCount) break;
    maze.hides.push(cellPoint(maze, farthest));
  }
  for (const hide of maze.hides) maze.cells[cellIndex(maze, hide)] = 2;
}

function patrolRoutes(maze, mainPath, floor) {
  const count = Math.min(GAME.guard.maximumCount,
    GAME.guard.initialCount + (floor - 1) * GAME.guard.additionalPerFloor);
  const minimumSpawn = floor === 1 ? GAME.guard.firstFloorSafeWalkDistance : GAME.guard.safeWalkDistance;
  const last = mainPath.length - 1;
  const routes = [];
  for (let guard = 0; guard < count; guard++) {
    const lower = Math.floor(last * guard / count);
    const upper = Math.min(last, Math.max(minimumSpawn, Math.ceil(last * (guard + 1) / count)));
    const waypointCount = Math.min(GAME.guard.maximumWaypoints,
      Math.max(GAME.guard.minimumWaypoints, Math.ceil((upper - lower) / GAME.maze.maximumHideDistance)));
    const route = [];
    // Start far from the entrance. Adjacent route bands overlap, and their
    // actual shortest paths cover the entire entrance-to-exit spine.
    for (let waypoint = 0; waypoint < waypointCount; waypoint++) {
      const index = Math.round(upper - (upper - lower) * waypoint / (waypointCount - 1));
      route.push({ ...mainPath[index] });
    }
    routes.push(route);
  }
  return routes;
}

function buildMaze(floor, serial, attempt) {
  const tuning = GAME.maze;
  const size = Math.min(tuning.maximumSize, tuning.initialSize + (floor - 1) * tuning.sizePerFloor);
  const seed = seedFor(floor, attempt === 0 ? serial : `${serial}:regenerate:${attempt}`);
  const random = randomSource(seed);
  const maze = { size, seed, cells: new Uint8Array(size * size), start: null, exit: null, hides: [], patrolRoutes: [] };
  const stack = [{ x: 1, y: 1 }];
  maze.cells[size + 1] = 1;
  const directions = [{ x: 0, y: -2 }, { x: 2, y: 0 }, { x: 0, y: 2 }, { x: -2, y: 0 }];
  // An explicit recursion stack keeps recursive backtracking safe at the size cap.
  while (stack.length) {
    const current = stack[stack.length - 1];
    const candidates = directions.filter(direction => {
      const x = current.x + direction.x;
      const y = current.y + direction.y;
      return x > 0 && y > 0 && x < size - 1 && y < size - 1 && !maze.cells[y * size + x];
    });
    if (!candidates.length) {
      stack.pop();
      continue;
    }
    const direction = candidates[Math.floor(random() * candidates.length)];
    const next = { x: current.x + direction.x, y: current.y + direction.y };
    maze.cells[(current.y + direction.y / 2) * size + current.x + direction.x / 2] = 1;
    maze.cells[next.y * size + next.x] = 1;
    stack.push(next);
  }
  const connectors = [];
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const index = y * size + x;
      if (maze.cells[index]) continue;
      const horizontal = maze.cells[index - 1] && maze.cells[index + 1];
      const vertical = maze.cells[index - size] && maze.cells[index + size];
      if ((horizontal && !maze.cells[index - size] && !maze.cells[index + size])
        || (vertical && !maze.cells[index - 1] && !maze.cells[index + 1])) connectors.push(index);
    }
  }
  shuffle(connectors, random);
  const stage = Math.floor((floor - 1) / tuning.difficultyStageFloors);
  const loopFraction = Math.min(tuning.maximumLoopFraction, tuning.loopFraction + stage * tuning.loopFractionPerStage);
  const loopCount = Math.min(connectors.length, Math.max(tuning.minimumLoops, Math.ceil(connectors.length * loopFraction)));
  let carvedLoops = 0;
  for (const index of connectors) {
    const horizontal = maze.cells[index - 1] && maze.cells[index + 1];
    const vertical = maze.cells[index - size] && maze.cells[index + size];
    if (!((horizontal && !maze.cells[index - size] && !maze.cells[index + size])
      || (vertical && !maze.cells[index - 1] && !maze.cells[index + 1]))) continue;
    maze.cells[index] = 1;
    if (++carvedLoops >= loopCount) break;
  }
  const endpoints = diameterOf(maze);
  const reversed = random() < 0.5;
  maze.start = reversed ? endpoints.exit : endpoints.start;
  maze.exit = reversed ? endpoints.start : endpoints.exit;
  maze.diameter = endpoints.diameter;
  const mainPath = findPath(maze, maze.start, maze.exit);
  placeHides(maze, mainPath);
  maze.cells[cellIndex(maze, maze.exit)] = 3;
  maze.patrolRoutes = patrolRoutes(maze, mainPath, floor);
  return maze;
}

function validationEvidence(maze, verifiedDiameter) {
  const errors = [];
  if (!maze || !Number.isInteger(maze.size) || maze.size < 3
    || !(maze.cells instanceof Uint8Array) || maze.cells.length !== maze.size * maze.size
    || !maze.start || !maze.exit || !Array.isArray(maze.hides) || !Array.isArray(maze.patrolRoutes)) {
    return { valid: false, errors: ['malformed-maze'] };
  }
  const fromStart = walkDistances(maze, [maze.start]);
  const hideDistances = walkDistances(maze, maze.hides);
  const fromHides = hideDistances[cellIndex(maze, maze.start)];
  let traversable = 0;
  let connected = 0;
  let edges = 0;
  let maximumHideDistance = 0;
  for (let index = 0; index < maze.cells.length; index++) {
    if (!maze.cells[index]) continue;
    traversable++;
    if (fromStart[index] >= 0) connected++;
    if (hideDistances[index] < 0) maximumHideDistance = Infinity;
    else maximumHideDistance = Math.max(maximumHideDistance, hideDistances[index]);
    if (index % maze.size < maze.size - 1 && maze.cells[index + 1]) edges++;
    if (index + maze.size < maze.cells.length && maze.cells[index + maze.size]) edges++;
  }
  const diameter = verifiedDiameter ?? diameterOf(maze).diameter;
  const exitDistance = fromStart[cellIndex(maze, maze.exit)];
  const mainPath = findPath(maze, maze.start, maze.exit);
  const covered = new Uint8Array(maze.cells.length);
  let routesValid = true;
  for (const route of maze.patrolRoutes) {
    if (route.length < GAME.guard.minimumWaypoints || route.length > GAME.guard.maximumWaypoints) routesValid = false;
    for (let index = 0; index < route.length; index++) {
      const path = findPath(maze, route[index], route[(index + 1) % route.length]);
      if (!path.length) routesValid = false;
      for (const point of path) covered[cellIndex(maze, point)] = 1;
    }
  }
  const mainRouteCovered = mainPath.length > 0 && mainPath.every(point => covered[cellIndex(maze, point)]);
  const loops = edges - traversable + (connected === traversable ? 1 : 0);
  if (!traversable || connected !== traversable) errors.push('disconnected');
  if (exitDistance < diameter * GAME.maze.minimumExitDiameterRatio || exitDistance <= 0) errors.push('exit-distance');
  if (maze.cells[cellIndex(maze, maze.exit)] !== 3) errors.push('exit-cell');
  if (maze.hides.some(point => maze.cells[cellIndex(maze, point)] !== 2)) errors.push('hide-cell');
  if (maze.hides.length < Math.ceil(traversable / GAME.maze.hideDensity)) errors.push('hide-density');
  if (maximumHideDistance > GAME.maze.maximumHideDistance) errors.push('hide-coverage');
  if (fromHides < 0 || fromHides > GAME.maze.startingHideDistance) errors.push('starting-hide');
  if (loops < 1) errors.push('no-escape-loops');
  if (!routesValid || !mainRouteCovered) errors.push('patrol-coverage');
  return {
    valid: errors.length === 0, errors, traversable, connected, diameter, exitDistance,
    exitDiameterRatio: exitDistance / diameter, hideCount: maze.hides.length,
    maximumHideDistance, startingHideDistance: fromHides, loops,
    patrolCount: maze.patrolRoutes.length, mainRouteCovered,
  };
}

export function validateMaze(maze) {
  return validationEvidence(maze);
}

export function generateMaze(floor = 1, serial = 0) {
  floor = Math.max(1, Math.floor(Number(floor) || 1));
  let evidence;
  for (let attempt = 0; attempt < GAME.maze.maximumGenerationAttempts; attempt++) {
    const maze = buildMaze(floor, serial, attempt);
    // Only hide/exit markers changed after the exact diameter computation.
    // Public validation recomputes it, so callers can validate mutated maps.
    evidence = validationEvidence(maze, maze.diameter);
    if (evidence.valid) {
      maze.validation = evidence;
      return maze;
    }
  }
  throw new Error(`Maze generation guardrails failed: ${evidence.errors.join(', ')}`);
}
