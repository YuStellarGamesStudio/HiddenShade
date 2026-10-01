// Composes assets/atlas.svg from the ten standalone sprite SVGs.
// Every sprite is authored on a 64x96 logical canvas (the floor occupies y 64..96)
// and rendered at ART_SCALE px per unit. Rasterise atlas.svg to atlas.png with Chromium
// (see README "Artwork") whenever a sprite changes, then run `npm run cache`.
import { readFile, writeFile } from 'node:fs/promises';

export const FRAMES = ['floor', 'wall', 'player', 'guard', 'hide', 'exit', 'glow', 'footprint', 'alert', 'chase'];
const ART_SCALE = 3;
const UNIT_WIDTH = 64;
const UNIT_HEIGHT = 96;

function inner(name, source) {
  const match = /^\s*<svg\b[^>]*viewBox="0 0 64 96"[^>]*>([\s\S]*)<\/svg>\s*$/.exec(source);
  if (!match) throw new Error(`${name}.svg must be one root <svg> with viewBox="0 0 64 96"`);
  const body = match[1];
  if (/<svg\b/.test(body)) throw new Error(`${name}.svg must not nest <svg>`);
  if (/\b(?:href|src)\s*=\s*"(?!#)/.test(body)) throw new Error(`${name}.svg must not reference external resources`);
  // Defs share one document in the atlas, so ids must be unique per sprite.
  for (const [, id] of body.matchAll(/\bid="([^"]+)"/g)) {
    if (!id.startsWith(`${name}-`)) throw new Error(`${name}.svg id "${id}" must start with "${name}-"`);
  }
  return body;
}

const groups = [];
for (const [index, name] of FRAMES.entries()) {
  const body = inner(name, await readFile(`assets/${name}.svg`, 'utf8'));
  groups.push(`<g transform="translate(${index * UNIT_WIDTH} 0)">${body}</g>`);
}
const width = FRAMES.length * UNIT_WIDTH;
await writeFile('assets/atlas.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="${width * ART_SCALE}" height="${UNIT_HEIGHT * ART_SCALE}" viewBox="0 0 ${width} ${UNIT_HEIGHT}">${groups.join('')}</svg>\n`);
console.log(`atlas.svg: ${FRAMES.length} frames, ${width * ART_SCALE}x${UNIT_HEIGHT * ART_SCALE}px`);
