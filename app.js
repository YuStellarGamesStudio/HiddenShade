import { Game, Scene } from './vendor/xyz/dist/src/index.js';
import { GameScene } from './src/scenes/game-scene.js';
import { createAudio } from './src/systems/audio.js';
import { createInput } from './src/systems/input.js';
import { createUI } from './src/ui/ui.js';
import { getLanguage, setLanguage, t } from './src/systems/i18n.js';
import { loadSave, persistSave, exportFile, encodeSave, parseSave, importSave, readBackup } from './src/systems/save.js';
import { evaluateRating } from './src/data/game.js';
import { RUNTIME } from './src/data/runtime.js';
import { RECORD_LIMIT } from './src/data/settings.js';

let save = loadSave();
let game, scene, audio, input, ui;
let screen = 'title';
let busy = false;
let preview;
let menuReturn = 'title';
let disposed = false;
const lifetime = new AbortController();

export function getSession() { return { game, scene, save, screen, input, audio, ui }; }
function persist() {
  save.updatedAt = new Date().toISOString();
  const ok = persistSave(save);
  ui?.update(scene?.state,save);
  return ok;
}
function show(next, extra = {}) {
  screen = next;
  input?.setEnabled(next === 'playing');
  ui.show(next,{save,state:scene?.state,...extra});
}
function freeze() {
  game.pause();
  audio.pause();
  input.reset();
}
async function begin() {
  if (busy) return;
  busy = true;
  try {
    input.setEnabled(false);
    await audio.unlock();
    audio.pause();
    const next = new GameScene({floor:save.floor,serial:save.serial,input,audio,onUpdate:state=>ui.update(state,save),onFinish:finish});
    await game.setScene(next);
    scene = next;
    game.resume();
    audio.resume(scene);
    show('playing');
  } finally { busy = false; }
}
function finish(state) {
  input.setEnabled(false);
  save.stats.playTime += state.elapsed;
  save.stats.detections += state.detections;
  save.stats.hideUses += state.hideUses;
  if (state.status === 'caught') {
    save.stats.catches++;
    persist();
    show('caught');
    return;
  }
  const stars = evaluateRating(state);
  state.stars = stars;
  const record = {floor:save.floor,stars,elapsed:state.elapsed,detections:state.detections,hideUses:state.hideUses,at:new Date().toISOString()};
  save.records.push(record);
  if (save.records.length > RECORD_LIMIT) save.records.splice(0,save.records.length - RECORD_LIMIT);
  save.stats.escapes++;
  save.stats.bestStars = Math.max(save.stats.bestStars,stars);
  save.floor++;
  save.stats.highestFloor = Math.max(save.stats.highestFloor,save.floor);
  persist();
  show('escaped',{record,stars});
}
async function toTitle() {
  freeze();
  await game.setScene(new Scene());
  scene = undefined;
  game.resume();
  show('title');
}
async function share() {
  const canvas = document.createElement('canvas');
  canvas.width=RUNTIME.shareWidth*RUNTIME.shareScale;
  canvas.height=RUNTIME.shareHeight*RUNTIME.shareScale;
  const ctx=canvas.getContext('2d');
  ctx.scale(RUNTIME.shareScale,RUNTIME.shareScale);
  const image=new Image(); image.src='./assets/og.png'; await image.decode();
  ctx.fillStyle='#071119'; ctx.fillRect(0,0,RUNTIME.shareWidth,RUNTIME.shareHeight);
  ctx.drawImage(image,RUNTIME.shareArtStart,0,RUNTIME.shareWidth-RUNTIME.shareArtStart,RUNTIME.shareHeight,RUNTIME.shareArtStart,0,RUNTIME.shareWidth-RUNTIME.shareArtStart,RUNTIME.shareHeight);
  const fade=ctx.createLinearGradient(0,0,RUNTIME.shareWidth,0);
  fade.addColorStop(0,'rgba(7,17,25,.98)'); fade.addColorStop(1,'rgba(7,17,25,.20)');
  ctx.fillStyle=fade; ctx.fillRect(0,0,RUNTIME.shareWidth,RUNTIME.shareHeight);
  ctx.fillStyle='#dae8e5'; ctx.font=`${RUNTIME.shareHeadingSize}px Georgia,serif`;
  ctx.fillText('HiddenShade',RUNTIME.shareTitleX,RUNTIME.shareTitleY);
  ctx.fillStyle='#bce5d7'; ctx.font=`${RUNTIME.shareFloorSize}px sans-serif`;
  ctx.fillText(t('shareFloor',{floor:save.stats.highestFloor}),RUNTIME.shareTitleX,RUNTIME.shareFloorY);
  ctx.fillStyle='#d8b987'; ctx.font=`${RUNTIME.shareBodySize}px sans-serif`;
  const time=`${Math.floor(save.stats.playTime/60)}:${String(Math.floor(save.stats.playTime)%60).padStart(2,'0')}`;
  ctx.fillText(t('shareStats',{time,stars:save.stats.bestStars}),RUNTIME.shareTitleX,RUNTIME.shareStatsY);
  ctx.fillStyle='#9daeb8'; ctx.font=`${RUNTIME.shareFooterSize}px sans-serif`;
  ctx.fillText('hiddenshade.ysgs.app',RUNTIME.shareTitleX,RUNTIME.shareFooterY);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if (!blob) throw new Error(t('error'));
  const url=URL.createObjectURL(blob); const link=document.createElement('a');
  link.href=url; link.download='HiddenShade-share.png'; link.click();
  setTimeout(()=>URL.revokeObjectURL(url));
}
async function action(name,payload) {
  if (disposed || busy) return;
  try {
    switch (name) {
      case 'start': case 'retry': case 'next': await begin(); break;
      case 'pause':
        if (screen!=='playing') break;
        freeze(); show('paused'); break;
      case 'resume':
        if (screen!=='paused') break;
        game.resume(); audio.resume(scene); show('playing'); break;
      case 'title': await toTitle(); break;
      case 'settings':
        menuReturn=screen==='playing'?'paused':screen;
        if (screen==='playing') freeze();
        show('settings'); break;
      case 'language':
        setLanguage(payload); save.settings.language=getLanguage(); persist();
        show(screen,{preview}); break;
      case 'setting':
        if (payload.key==='keys') save.settings.keys=payload.value;
        else if (Object.hasOwn(save.settings,payload.key)) save.settings[payload.key]=payload.value;
        input.setKeys(save.settings.keys); audio.apply(save.settings); persist(); break;
      case 'exportFile': exportFile(save); break;
      case 'exportCode':
        if (screen!=='settings' && screen!=='import') menuReturn=screen;
        show('import',{code:encodeSave(save)}); break;
      case 'importPreview':
        if (screen!=='settings' && screen!=='import') menuReturn=screen;
        preview=undefined;
        if (payload) preview=parseSave(payload);
        show('import',{preview,raw:payload}); break;
      case 'importConfirm':
        if (!preview) break;
        save=importSave(preview,save); preview=undefined;
        setLanguage(save.settings.language); input.setKeys(save.settings.keys); audio.apply(save.settings);
        await toTitle(); break;
      case 'restoreBackup': {
        const restored=readBackup();
        if (restored) { preview=restored; show('import',{preview}); }
        break;
      }
      case 'back': case 'importCancel': preview=undefined; show(menuReturn); break;
      case 'zoom': scene?.zoom(payload); break;
      case 'share': await share(); break;
    }
  } catch (error) {
    console.warn('HiddenShade action failed:',error);
    show(screen,{preview,raw:name==='importPreview'?payload:undefined,error:name.startsWith('import')?t('importError'):error.message});
  }
}
export function destroy() {
  if (disposed) return;
  disposed=true;
  persistSave(save,{force:true});
  lifetime.abort();
  input?.destroy(); ui?.destroy(); audio?.destroy(); game?.destroy();
}
async function boot() {
  // URL takes precedence over saved language; absent a route, use the saved choice.
  const query=new URLSearchParams(location.search);
  setLanguage(query.has('lang') ? getLanguage() : save.settings.language);
  save.settings.language=getLanguage();
  ui=createUI({onAction:(name,payload)=>void action(name,payload)});
  show('title');
  const requested=query.get('renderer') || 'auto';
  const renderer=['auto','webgpu','webgl2','canvas2d'].includes(requested)?requested:'auto';
  game=await Game.create({canvas:document.querySelector('#game'),renderer,maxDeltaTime:RUNTIME.maxDelta});
  audio=await createAudio(game,save.settings);
  input=createInput({keys:save.settings.keys,onInteract:()=>{if(screen==='playing')scene?.interact();},onPause:()=>void action(screen==='playing'?'pause':'resume'),onZoom:delta=>scene?.zoom(delta)});
  input.setEnabled(false);
  game.start(new Scene());
  document.addEventListener('contextmenu',event=>event.preventDefault(),{signal:lifetime.signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden && screen==='playing')void action('pause');},{signal:lifetime.signal});
  window.addEventListener('pagehide',event=>{
    if (event.persisted) { persistSave(save,{force:true}); freeze(); }
    else destroy();
  },{signal:lifetime.signal});
  window.addEventListener('popstate',()=>{
    setLanguage(new URLSearchParams(location.search).get('lang') || save.settings.language);
    save.settings.language=getLanguage(); show(screen,{preview});
  },{signal:lifetime.signal});
  if ('serviceWorker' in navigator) {
    try { await navigator.serviceWorker.register('./sw.js'); }
    catch(error) { console.warn('Offline installation unavailable:',error); }
  }
}
await boot().catch(error=>{
  console.error('HiddenShade initialization failed:',error);
  if (ui) ui.show('title',{save,error:error.message});
});
