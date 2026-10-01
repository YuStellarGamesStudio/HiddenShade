import assert from 'node:assert/strict';
import { generateMaze, validateMaze } from '../src/maze/generator.js';
import { findPath, hasLineOfSight, isWalkable } from '../src/maze/pathfinding.js';
import { createSimulation } from '../src/systems/simulation.js';
import { createGuard, guardCanSee, updateGuard, witnessHide } from '../src/ai/guards.js';
import { GAME, evaluateRating } from '../src/data/game.js';

let validated=0;
for (const floor of [1,2,3,5,10,11,30,100]) {
  for (const serial of [1,7,83]) {
    const maze=generateMaze(floor,serial);
    const report=validateMaze(maze);
    assert.equal(report.valid,true,JSON.stringify({floor,serial,...report}));
    assert.equal(maze.size,Math.min(40,20+(floor-1)*2));
    assert.equal(maze.patrolRoutes.length,Math.min(8,floor+1));
    const again=generateMaze(floor,serial);
    assert.deepEqual(again.cells,maze.cells);
    assert.deepEqual(again.patrolRoutes,maze.patrolRoutes);
    const path=findPath(maze,maze.start,maze.exit);
    assert.deepEqual(path[0],maze.start);
    assert.deepEqual(path.at(-1),maze.exit);
    for(let i=1;i<path.length;i++) assert.equal(Math.abs(path[i].x-path[i-1].x)+Math.abs(path[i].y-path[i-1].y),1);
    validated++;
  }
}
const sim=createSimulation(1,7);
const route=findPath(sim.state.maze,sim.state.maze.start,sim.state.maze.exit);
const initial=structuredClone(sim.state.guards);
sim.state.guards=[];
for (const target of route.slice(1)) {
  let iterations=0;
  while(sim.state.status==='playing' && Math.hypot(target.x-sim.state.player.x,target.y-sim.state.player.y)>0.02) {
    const dx=target.x-sim.state.player.x,dy=target.y-sim.state.player.y;
    const length=Math.hypot(dx,dy);
    const dt=Math.min(1/60,length/GAME.player.speed);
    sim.update(dt,{x:dx/length,y:dy/length});
    assert(isWalkable(sim.state.maze,Math.round(sim.state.player.x),Math.round(sim.state.player.y)));
    assert(++iterations<1000,'movement reached waypoint');
  }
}
assert.equal(sim.state.status,'escaped');
assert(sim.state.elapsed>0);
sim.retry();
assert.equal(sim.state.status,'playing');
assert.deepEqual(sim.state.guards,initial);
const hide=sim.state.maze.hides[0];
sim.state.guards=[];
Object.assign(sim.state.player,hide);
assert.equal(sim.interact(),true);
assert.equal(sim.state.player.hidden,true);
const hiddenPosition={x:sim.state.player.x,y:sim.state.player.y};
sim.update(1,{x:1,y:1});
assert.deepEqual({x:sim.state.player.x,y:sim.state.player.y},hiddenPosition);
assert.equal(sim.interact(),true);
sim.update(GAME.hide.emergenceDuration/2,{x:1,y:0});
assert.equal(sim.state.player.hidden,true);
sim.update(GAME.hide.emergenceDuration/2+0.001,{x:0,y:0});
assert.equal(sim.state.player.hidden,false);
assert(sim.state.explored.some(Boolean));
const memory=sim.state.explored.slice();
sim.update(0.2,{x:0,y:0});
for(let i=0;i<memory.length;i++) if(memory[i])assert.equal(sim.state.explored[i],1);

// A controlled straight corridor exercises the full alert/chase/lost/search cycle.
const maze={size:12,cells:new Uint8Array(144).fill(1)};
const guard=createGuard(1,[{x:1,y:5},{x:8,y:5},{x:8,y:6},{x:1,y:6}]);
const state={maze,player:{x:4,y:5,hidden:false},detections:0,visible:new Uint8Array(maze.cells.length).fill(1)};
const move=(actor,x,y)=>{actor.x+=x;actor.y+=y;};
const clear=()=>true;
updateGuard(guard,state,GAME.guard.alertDuration-0.01,8,clear,move);
assert.equal(guard.state,'alert');
assert.equal(state.detections,0);
updateGuard(guard,state,0.02,8,clear,move);
assert.equal(guard.state,'chase');
assert.equal(state.detections,1);
state.player.hidden=true;
assert.equal(guardCanSee(guard,state.player,8,clear),false);
updateGuard(guard,state,GAME.guard.lostTargetDuration-0.1,8,clear,move);
assert.equal(guard.state,'chase');
updateGuard(guard,state,0.11,8,clear,move);
assert.equal(guard.state,'search');
updateGuard(guard,state,GAME.guard.searchDuration,8,clear,move);
assert.equal(guard.state,'patrol');
witnessHide(guard,{x:4,y:5});
state.player.hidden=false;
updateGuard(guard,state,2.9,8,clear,move);
assert.equal(guard.state,'search');
updateGuard(guard,state,0.11,8,clear,move);
assert.equal(guard.state,'patrol');
const blocked={size:3,cells:new Uint8Array([1,0,1,1,0,1,1,0,1])};
assert.equal(hasLineOfSight(blocked,{x:0,y:1},{x:2,y:1}),false);
assert.equal(findPath(blocked,{x:0,y:1},{x:2,y:1}).length,0);
assert.equal(evaluateRating({elapsed:239.9,detections:0,hideUses:2}),3);
assert.equal(evaluateRating({elapsed:240,detections:0,hideUses:2}),2);
assert.equal(evaluateRating({elapsed:100,detections:1,hideUses:3}),1);
sim.destroy();
const stopped=sim.state.elapsed;
sim.update(1,{x:1,y:0});
assert.equal(sim.state.elapsed,stopped);
console.log(`PASS: ${validated} seeded floors, maze guards, real route escape, retry, hiding/emergence, memory, AI transitions, occlusion, rating boundaries and destroy.`);
