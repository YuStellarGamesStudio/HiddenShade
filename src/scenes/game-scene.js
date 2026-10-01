import { Scene, GameObject, Colliders, Trigger2D, RigidBody2D, Vector2 } from '../../vendor/xyz/dist/src/index.js';
import { createSimulation } from '../systems/simulation.js';
import { createView } from '../render/view.js';
import { AUDIO } from '../data/audio.js';
import { RUNTIME } from '../data/runtime.js';

export class GameScene extends Scene {
  constructor({ floor, serial, input, audio, onUpdate, onFinish }) {
    super();
    this.input = input;
    this.audioSystem = audio;
    this.onUpdate = onUpdate;
    this.onFinish = onFinish;
    this.origin = new Vector2();
    this.direction = new Vector2();
    this.simulation = createSimulation(floor, serial, (a,b) => this.lineOfSight(a,b));
    this.footstep = 0;
    this.finished = false;
    this.previousGuards = new Map();
    this.buildPhysics();
  }
  get state() { return this.simulation.state; }
  lineOfSight(a,b) {
    const dx = b.x-a.x, dy = b.y-a.y;
    const length = Math.hypot(dx,dy);
    if (length < RUNTIME.rayEpsilon) return true;
    this.origin.x=a.x; this.origin.y=a.y;
    this.direction.x=dx/length; this.direction.y=dy/length;
    return this.physics.raycast(this.origin,this.direction,length,RUNTIME.wallCategory).length === 0;
  }
  buildPhysics() {
    const {maze} = this.state;
    for (let y=0;y<maze.size;y++) {
      for (let x=0;x<maze.size;) {
        if (maze.cells[y*maze.size+x] !== 0) { x++; continue; }
        const first=x;
        while (x<maze.size && maze.cells[y*maze.size+x]===0) x++;
        const wall = new GameObject();
        wall.position.x=(first+x-1)/2;
        wall.position.y=y;
        wall.collider=Colliders.box(x-first,RUNTIME.wallWidth);
        wall.collider.category=RUNTIME.wallCategory;
        wall.collider.mask=0;
        this.add(wall);
      }
    }
    this.physicsPlayer = new GameObject();
    this.physicsPlayer.collider=Colliders.circle(RUNTIME.playerRadius);
    this.physicsPlayer.collider.sensor=true;
    this.physicsPlayer.collider.category=RUNTIME.playerCategory;
    this.physicsPlayer.collider.mask=RUNTIME.exitCategory;
    this.physicsPlayer.body=new RigidBody2D({type:'dynamic',gravityScale:0});
    this.physicsPlayer.position.x=this.state.player.x;
    this.physicsPlayer.position.y=this.state.player.y;
    this.add(this.physicsPlayer);
    this.exitTrigger=new Trigger2D(Colliders.box(RUNTIME.exitTriggerSize,RUNTIME.exitTriggerSize), {
      filter:other=>other===this.physicsPlayer,
      onEnter:()=> { if (this.state.status==='playing' && !this.state.player.hidden) this.state.status='escaped'; }
    });
    this.exitTrigger.position.x=maze.exit.x;
    this.exitTrigger.position.y=maze.exit.y;
    this.exitTrigger.collider.category=RUNTIME.exitCategory;
    this.exitTrigger.collider.mask=RUNTIME.playerCategory;
    this.add(this.exitTrigger);
  }
  async initialize(game) {
    this.view = await createView(game,this,this.state);
    this.simulation.update(0,{x:0,y:0});
    this.view.update(this.state,0);
  }
  interact() {
    if (this.state.status!=='playing') return;
    const hidden=this.state.player.hidden;
    if (this.simulation.interact()) this.audioSystem.effect(hidden?'emerge':'hide');
  }
  update(dt) {
    if (!this.view) return;
    if (this.state.status==='playing') {
      const oldX=this.state.player.x, oldY=this.state.player.y;
      this.simulation.update(dt,this.input.vector());
      this.physicsPlayer.position.x=this.state.player.x;
      this.physicsPlayer.position.y=this.state.player.y;
      if (Math.hypot(this.state.player.x-oldX,this.state.player.y-oldY)>RUNTIME.rayEpsilon) {
        this.footstep+=dt;
        if (this.footstep>=AUDIO.footstepInterval) { this.footstep=0; this.audioSystem.effect('step'); }
      }
      let chasing=false;
      for (const guard of this.state.guards) {
        const previous=this.previousGuards.get(guard.id);
        if (guard.state==='alert' && previous!=='alert') this.audioSystem.effect('alert');
        if (guard.state==='chase') {
          chasing=true;
          if (previous!=='chase') {
            this.audioSystem.effect('alarm');
            this.camera2D.shake({amplitude:[RUNTIME.shakeAmplitude,RUNTIME.shakeAmplitude],duration:RUNTIME.shakeDuration});
          }
        }
        this.previousGuards.set(guard.id,guard.state);
      }
      this.audioSystem.setMode(chasing?'chase':'ambient');
    }
    this.view.update(this.state,dt);
    this.onUpdate(this.state);
    if (this.state.status!=='playing' && !this.finished) {
      this.finished=true;
      this.audioSystem.setMode('ambient');
      this.audioSystem.effect(this.state.status==='escaped'?'escape':'caught');
      this.onFinish(this.state);
    }
  }
  zoom(delta) { if (this.view) this.view.setZoom(this.view.zoom+delta*RUNTIME.zoomStep); }
  onDestroy() {
    this.view?.destroy();
    this.simulation.destroy();
    this.previousGuards.clear();
  }
}
