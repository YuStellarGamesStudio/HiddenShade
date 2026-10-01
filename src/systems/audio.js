import { AUDIO } from '../data/audio.js';

export async function createAudio(game, settings) {
  const scores = Object.fromEntries(await Promise.all(Object.entries(AUDIO.scores).map(async ([name, score]) => [name, await game.audio.load('data:application/json,' + encodeURIComponent(JSON.stringify(score)))])));
  let mode = 'ambient';
  let paused = true;
  let music;
  let activeScene;
  let preferences = settings;
  const effects = new Set();
  let disposed = false;
  function apply(next) {
    preferences = next;
    game.audio.master.volume = paused ? 0 : next.masterVolume;
    game.audio.music.volume = next.music ? next.musicVolume : 0;
    game.audio.sfx.volume = next.sfx ? next.sfxVolume : 0;
  }
  function startMusic() {
    if (!disposed && !paused && game.audio.unlocked && preferences.music) music = scores[mode].play({ scene: activeScene, channel:'music',loop:true });
  }
  function stop() {
    music?.stop(); music = undefined;
    for (const effect of effects) effect.stop();
    effects.clear();
  }
  const api = {
    async unlock() { if (!game.audio.unlocked) await game.audio.unlock(); },
    apply(next) {
      const wasMusic = preferences.music;
      apply(next);
      if (wasMusic && !next.music) { music?.stop(); music = undefined; }
      if (!wasMusic && next.music) startMusic();
    },
    resume(scene) { activeScene = scene; paused = false; apply(preferences); if (!music || music.state !== 'playing') startMusic(); },
    pause() { paused = true; apply(preferences); stop(); },
    setMode(next) {
      if (mode === next) return;
      mode = next;
      music?.stop(); music = undefined;
      startMusic();
    },
    effect(name) {
      if (disposed || paused || !game.audio.unlocked || !preferences.sfx) return;
      for (const effect of effects) if (effect.state !== 'playing') effects.delete(effect);
      const asset = scores[name];
      if (asset) effects.add(asset.play({scene:activeScene,channel:'sfx'}));
    },
    destroy() { disposed = true; stop(); }
  };
  apply(settings);
  return api;
}
