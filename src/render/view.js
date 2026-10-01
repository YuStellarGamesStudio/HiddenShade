import { IsometricMap, SpriteSheet, Sprite, Group2D, IsolatedGroup2D, Mask2D, CanvasTexture2D } from '../../vendor/xyz/dist/src/index.js';
import { RENDER as R } from '../data/render.js';
import { GAME } from '../data/game.js';

const projectX = (x, y) => (x - y) * R.halfWidth;
const projectY = (x, y) => (x + y) * R.halfHeight;

function canvas(width, height) {
  const result = document.createElement('canvas');
  result.width = width;
  result.height = height;
  return result;
}

function floorNodes(map, size) {
  const nodes = new Array(size * size);
  for (const sprite of map.children) {
    const x = Math.round(sprite.position.x / R.tileWidth + sprite.position.y / R.tileHeight);
    const y = Math.round(sprite.position.y / R.tileHeight - sprite.position.x / R.tileWidth);
    nodes[y * size + x] = sprite;
    sprite.visible = false;
  }
  return nodes;
}

/** Scene-owned visuals borrow the loader's atlas; only fog snapshots are view-owned. */
export async function createView(game, scene, initialState) {
  const texture = await game.assets.loadTexture(new URL('../../assets/atlas.png', import.meta.url).href);
  if (scene.destroyed) throw new Error('Scene disposed while loading artwork');
  const sheet = new SpriteSheet(texture, R.atlasFrames);
  const { maze } = initialState;
  const size = maze.size;
  const roots = [];
  const addRoot = object => { scene.add(object); roots.push(object); return object; };
  const memory = addRoot(new IsometricMap({ columns: size, rows: size, tileWidth: R.tileWidth, tileHeight: R.tileHeight, sheet }));
  memory.position.y = -R.halfHeight;
  memory.zIndex = R.groundDepth;
  memory.opacity = R.memoryOpacity;
  const light = addRoot(new IsolatedGroup2D());
  light.zIndex = R.lightDepth;
  const illuminated = light.add(new IsometricMap({ columns: size, rows: size, tileWidth: R.tileWidth, tileHeight: R.tileHeight, sheet }));
  illuminated.position.y = -R.halfHeight;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (!maze.cells[y * size + x]) continue;
    // Physics uses a separate GRID-space wall layer. Visual maps never create colliders.
    memory.setTile(x, y, { frame: R.floorFrame, solid: false });
    illuminated.setTile(x, y, { frame: R.floorFrame, solid: false });
  }
  const memoryNodes = floorNodes(memory, size);
  const lightNodes = floorNodes(illuminated, size);
  const terrain = addRoot(new Group2D());
  const walls = new Array(size * size);
  const details = new Array(size * size);
  const glows = new Array(size * size);
  const make = (frame, parent, anchor = [0.5, R.characterAnchor]) => parent.add(sheet.createSprite(frame, {
    scale: [R.artScale, R.artScale], anchor, sampler: { minFilter: 'linear', magFilter: 'linear' }, visible: false,
  }));
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const index = y * size + x;
    const cell = maze.cells[index];
    if (!cell) {
      const wall = make(R.wallFrame, terrain, [0.5, 1]);
      wall.position.set(projectX(x, y), projectY(x, y) + R.halfHeight);
      wall.zIndex = x + y;
      walls[index] = wall;
    } else if (cell === 2 || cell === 3) {
      const detail = make(cell === 2 ? R.hideFrame : R.exitFrame, terrain);
      detail.position.set(projectX(x, y), projectY(x, y));
      detail.zIndex = x + y;
      details[index] = detail;
      if (cell === 3) {
        const glow = make(R.glowFrame, terrain);
        glow.position.copy(detail.position);
        glow.zIndex = x + y - R.actorDepthBias;
        glows[index] = glow;
      }
    }
  }
  const actors = addRoot(new Group2D());
  const player = make(R.playerFrame, actors);
  const foot = make(R.footFrame, actors);
  foot.zIndex = R.markerDepth;
  const guards = initialState.guards.map(() => ({
    body: make(R.guardFrame, actors), mark: make(R.alertFrame, actors),
  }));
  const maskCanvas = canvas(R.maskWidth, R.maskHeight);
  const coneCanvas = canvas(R.maskWidth, R.maskHeight);
  const maskContext = maskCanvas.getContext('2d');
  const coneContext = coneCanvas.getContext('2d');
  const maskTexture = new CanvasTexture2D(maskCanvas);
  const coneTexture = new CanvasTexture2D(coneCanvas);
  const cones = light.add(new Sprite({ texture: coneTexture, anchor: [0, 0], zIndex: R.coneDepth }));
  const gpu = game.graphics.backend !== 'canvas2d';
  light.isolate = gpu;
  let centerX = -1;
  let centerY = -1;
  let selected = [];
  let fogAge = R.fogInterval;
  let alive = true;
  let cameraInitialized = false;
  let zoom = R.zoomDefault;
  const seen = new Uint8Array(size * size);
  const remembered = new Uint8Array(size * size);
  const spanX = (R.windowRadius * 2 + 1) * R.tileWidth;
  const spanY = (R.windowRadius * 2 + 1) * R.tileHeight;
  const scaleX = R.maskWidth / spanX;
  const scaleY = R.maskHeight / spanY;
  let originX = 0;
  let originY = 0;

  function selectCells(state, x, y) {
    for (const index of selected) {
      if (memoryNodes[index]) memoryNodes[index].visible = lightNodes[index].visible = false;
      if (walls[index]) walls[index].visible = false;
      if (details[index]) details[index].visible = false;
      if (glows[index]) glows[index].visible = false;
    }
    selected = [];
    const candidates = [];
    for (let gy = Math.max(0, y - R.windowRadius); gy <= Math.min(size - 1, y + R.windowRadius); gy++) {
      for (let gx = Math.max(0, x - R.windowRadius); gx <= Math.min(size - 1, x + R.windowRadius); gx++) {
        const index = gy * size + gx;
        if (!state.explored[index] && !state.visible[index]) continue;
        candidates.push({ index, distance: (gx - x) ** 2 + (gy - y) ** 2 });
      }
    }
    candidates.sort((a, b) => a.distance - b.distance);
    let cost = 0;
    for (const { index } of candidates) {
      const nextCost = (maze.cells[index] ? 2 : 1) + Number(Boolean(details[index])) + Number(Boolean(glows[index]));
      if (cost + nextCost > R.terrainBudget) continue;
      cost += nextCost;
      selected.push(index);
    }
    centerX = x;
    centerY = y;
    originX = projectX(x, y) - spanX / 2;
    originY = projectY(x, y) - spanY / 2;
    cones.position.set(originX, originY);
    cones.scale.set(1 / scaleX, 1 / scaleY);
    if (gpu) light.mask = Mask2D.image({ texture: maskTexture, transform: [1 / scaleX, 0, 0, 1 / scaleY, originX, originY] });
  }

  function updateFog(state) {
    const px = Math.round(state.player.x);
    const py = Math.round(state.player.y);
    let changed = px !== centerX || py !== centerY;
    for (let i = 0; i < seen.length; i++) {
      if (seen[i] !== state.visible[i] || remembered[i] !== state.explored[i]) changed = true;
    }
    if (!changed) return;
    seen.set(state.visible);
    remembered.set(state.explored);
    selectCells(state, px, py);
    maskContext.setTransform(1, 0, 0, 1, 0, 0);
    maskContext.clearRect(0, 0, R.maskWidth, R.maskHeight);
    maskContext.setTransform(scaleX, 0, 0, scaleY, -originX * scaleX, -originY * scaleY);
    maskContext.fillStyle = '#fff';
    maskContext.beginPath();
    for (const index of selected) {
      const visible = Boolean(state.visible[index]);
      const explored = Boolean(state.explored[index]) || visible;
      if (memoryNodes[index]) {
        memoryNodes[index].visible = explored;
        lightNodes[index].visible = visible;
      }
      if (walls[index]) {
        walls[index].visible = explored;
        walls[index].opacity = visible ? 1 : R.wallMemoryOpacity;
      }
      if (details[index]) {
        details[index].visible = explored;
        details[index].opacity = visible ? 1 : maze.cells[index] === 2 ? R.hideMemoryOpacity : R.memoryOpacity;
      }
      if (glows[index]) glows[index].visible = visible;
      if (!visible || !maze.cells[index]) continue;
      const x = projectX(index % size, Math.floor(index / size));
      const y = projectY(index % size, Math.floor(index / size));
      maskContext.moveTo(x, y - R.halfHeight);
      maskContext.lineTo(x + R.halfWidth, y);
      maskContext.lineTo(x, y + R.halfHeight);
      maskContext.lineTo(x - R.halfWidth, y);
      maskContext.closePath();
    }
    maskContext.fill();
    maskTexture.update(maskCanvas);
  }

  function guardVisible(state, guard) {
    const x = Math.round(guard.x);
    const y = Math.round(guard.y);
    return x >= 0 && y >= 0 && x < size && y < size && Boolean(state.visible[y * size + x]) && guard.visible === true;
  }

  function updateCones(state) {
    coneContext.setTransform(1, 0, 0, 1, 0, 0);
    coneContext.clearRect(0, 0, R.maskWidth, R.maskHeight);
    coneContext.setTransform(scaleX, 0, 0, scaleY, -originX * scaleX, -originY * scaleY);
    coneContext.globalAlpha = R.coneOpacity;
    const range = GAME.guard.sightRange * (state.floor === 1 ? GAME.guard.firstFloorSightRatio : 1);
    const halfAngle = GAME.guard.sightAngle * Math.PI / 360;
    for (const guard of state.guards) {
      if (!guardVisible(state, guard)) continue;
      coneContext.fillStyle = guard.state === 'chase' ? R.chaseConeColor : R.coneColor;
      coneContext.beginPath();
      coneContext.moveTo(projectX(guard.x, guard.y), projectY(guard.x, guard.y));
      for (let ray = 0; ray <= R.coneRays; ray++) {
        const angle = guard.angle - halfAngle + ray / R.coneRays * halfAngle * 2;
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        let endX = guard.x;
        let endY = guard.y;
        for (let distance = R.coneStep; distance <= range; distance += R.coneStep) {
          const x = guard.x + dx * distance;
          const y = guard.y + dy * distance;
          const gx = Math.round(x);
          const gy = Math.round(y);
          if (gx < 0 || gy < 0 || gx >= size || gy >= size || !maze.cells[gy * size + gx]) break;
          endX = x;
          endY = y;
        }
        coneContext.lineTo(projectX(endX, endY), projectY(endX, endY));
      }
      coneContext.closePath();
      coneContext.fill();
    }
    // Canvas fallback uses the same cell geometry, not a radial visibility approximation.
    coneContext.setTransform(1, 0, 0, 1, 0, 0);
    coneContext.globalAlpha = 1;
    coneContext.globalCompositeOperation = 'destination-in';
    coneContext.drawImage(maskCanvas, 0, 0);
    coneContext.globalCompositeOperation = 'source-over';
    coneTexture.update(coneCanvas);
  }

  function update(state, dt) {
    if (!alive) return;
    const x = projectX(state.player.x, state.player.y);
    const y = projectY(state.player.x, state.player.y);
    const camera = scene.camera2D;
    camera.zoom = zoom;
    const targetX = x - game.width / (2 * zoom);
    const targetY = y - game.height / (2 * zoom) - R.cameraVerticalOffset;
    const follow = cameraInitialized ? 1 - Math.exp(-R.cameraResponse * dt) : 1;
    camera.position.set(camera.position.x + (targetX - camera.position.x) * follow, camera.position.y + (targetY - camera.position.y) * follow);
    cameraInitialized = true;
    updateFog(state);
    fogAge += dt;
    if (fogAge >= R.fogInterval) { updateCones(state); fogAge = 0; }
    player.visible = true;
    player.position.set(x, y);
    player.zIndex = state.player.x + state.player.y + R.actorDepthBias;
    player.opacity = state.player.emerging > 0 ? R.emergenceOpacity : state.player.hidden ? R.hiddenOpacity : 1;
    foot.visible = true;
    foot.position.set(x, y);
    foot.opacity = state.player.hidden ? R.hiddenFootOpacity : R.footprintOpacity;
    for (const index of selected) {
      const wall = walls[index];
      if (wall) {
        const coversPlayer = Math.abs(wall.position.x - x) < R.wallFadeWidth
          && wall.position.y > y && wall.position.y - y < R.wallFadeHeight;
        wall.opacity = state.visible[index] ? coversPlayer ? R.wallFadeOpacity : 1 : R.wallMemoryOpacity;
      }
      const glow = glows[index];
      if (glow) glow.opacity = R.glowOpacity + Math.sin(state.elapsed * R.glowFrequency) * R.glowPulse;
    }
    for (let i = 0; i < guards.length; i++) {
      const visual = guards[i];
      const guard = state.guards[i];
      const visible = Boolean(guard) && guardVisible(state, guard)
        && Math.abs(guard.x - centerX) <= R.windowRadius && Math.abs(guard.y - centerY) <= R.windowRadius;
      visual.body.visible = visible;
      visual.mark.visible = visible && (guard.state === 'alert' || guard.state === 'chase' || guard.state === 'search');
      if (!visible) continue;
      const gx = projectX(guard.x, guard.y);
      const gy = projectY(guard.x, guard.y);
      visual.body.position.set(gx, gy);
      visual.body.zIndex = guard.x + guard.y + R.actorDepthBias;
      visual.mark.position.set(gx, gy - R.markerLift);
      visual.mark.zIndex = R.markerDepth;
      visual.mark.source = sheet.getFrame(guard.state === 'chase' ? R.chaseFrame : R.alertFrame);
    }
  }

  update(initialState, 0);
  return {
    update,
    setZoom(value) { if (Number.isFinite(value)) zoom = Math.max(R.zoomMin, Math.min(R.zoomMax, value)); },
    get zoom() { return zoom; },
    destroy() {
      if (!alive) return;
      alive = false;
      for (const root of roots) root.destroy();
      game.graphics.unloadTexture(maskTexture);
      game.graphics.unloadTexture(coneTexture);
      maskTexture.destroy();
      coneTexture.destroy();
      selected.length = 0;
    },
  };
}
