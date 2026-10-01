export function isWalkable(maze, x, y) {
  return x >= 0 && y >= 0 && x < maze.size && y < maze.size
    && maze.cells[y * maze.size + x] !== 0;
}

export function cellPoint(maze, index) {
  return { x: index % maze.size, y: Math.floor(index / maze.size) };
}

export function cellIndex(maze, point) {
  return Math.round(point.y) * maze.size + Math.round(point.x);
}

export function walkDistances(maze, starts) {
  const distances = new Int32Array(maze.cells.length).fill(-1);
  const queue = new Int32Array(maze.cells.length);
  const offsets = [-1, 1, -maze.size, maze.size];
  let first = 0;
  let last = 0;
  for (const point of starts) {
    const x = Math.round(point.x);
    const y = Math.round(point.y);
    if (!isWalkable(maze, x, y)) continue;
    const index = y * maze.size + x;
    if (distances[index] !== -1) continue;
    distances[index] = 0;
    queue[last++] = index;
  }
  while (first < last) {
    const index = queue[first++];
    const x = index % maze.size;
    const y = Math.floor(index / maze.size);
    for (const offset of offsets) {
      const next = index + offset;
      if ((offset === -1 && x === 0) || (offset === 1 && x === maze.size - 1)
        || (offset === -maze.size && y === 0) || (offset === maze.size && y === maze.size - 1)) continue;
      if (maze.cells[next] && distances[next] === -1) {
        distances[next] = distances[index] + 1;
        queue[last++] = next;
      }
    }
  }
  return distances;
}

export function findPath(maze, start, end) {
  const sx = Math.round(start.x);
  const sy = Math.round(start.y);
  const ex = Math.round(end.x);
  const ey = Math.round(end.y);
  if (!isWalkable(maze, sx, sy) || !isWalkable(maze, ex, ey)) return [];
  const origin = sy * maze.size + sx;
  const target = ey * maze.size + ex;
  const previous = new Int32Array(maze.cells.length).fill(-1);
  const queue = new Int32Array(maze.cells.length);
  const offsets = [-1, 1, -maze.size, maze.size];
  let first = 0;
  let last = 1;
  queue[0] = origin;
  previous[origin] = origin;
  while (first < last && previous[target] === -1) {
    const index = queue[first++];
    const x = index % maze.size;
    const y = Math.floor(index / maze.size);
    for (const offset of offsets) {
      if ((offset === -1 && x === 0) || (offset === 1 && x === maze.size - 1)
        || (offset === -maze.size && y === 0) || (offset === maze.size && y === maze.size - 1)) continue;
      const next = index + offset;
      if (maze.cells[next] && previous[next] === -1) {
        previous[next] = index;
        queue[last++] = next;
      }
    }
  }
  if (previous[target] === -1) return [];
  const path = [];
  let current = target;
  while (current !== origin) {
    path.push(cellPoint(maze, current));
    current = previous[current];
  }
  path.push(cellPoint(maze, origin));
  return path.reverse();
}

// Supercover traversal: a ray grazing a blocked corner cannot see through it.
// The final wall itself may be revealed, but never anything beyond that wall.
export function hasLineOfSight(maze, start, end, revealEndWall = false) {
  let x = Math.floor(start.x + 0.5);
  let y = Math.floor(start.y + 0.5);
  const endX = Math.floor(end.x + 0.5);
  const endY = Math.floor(end.y + 0.5);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const stepX = Math.sign(dx);
  const stepY = Math.sign(dy);
  const deltaX = dx === 0 ? Infinity : Math.abs(1 / dx);
  const deltaY = dy === 0 ? Infinity : Math.abs(1 / dy);
  let nextX = dx === 0 ? Infinity : ((x + stepX * 0.5) - start.x) / dx;
  let nextY = dy === 0 ? Infinity : ((y + stepY * 0.5) - start.y) / dy;
  while (true) {
    if (x === endX && y === endY) return revealEndWall || isWalkable(maze, x, y);
    if (!isWalkable(maze, x, y)) return false;
    if (Math.abs(nextX - nextY) < 1e-10) {
      if (!isWalkable(maze, x + stepX, y) || !isWalkable(maze, x, y + stepY)) return false;
      x += stepX;
      y += stepY;
      nextX += deltaX;
      nextY += deltaY;
    } else if (nextX < nextY) {
      x += stepX;
      nextX += deltaX;
    } else {
      y += stepY;
      nextY += deltaY;
    }
  }
}
