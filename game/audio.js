// Local audio assets: no network or Web Audio dependencies.
const musicFiles = ['tavern','street','bakehouse','workshop','watchroom','hearth','postroom',
  'ferry','ferry_watch','ferry_window','high_water','harbor','victory','death'];
const sfxFiles = ['card_draw','card_place','card_flip','swipe_left','swipe_right','card_cancel',
  'hover','choice','seal_stamp','interface','page_turn','book_open','book_close','coins',
  'stat_up','stat_down','warning','curse','death_hit','victory_chime','door_open','door_close',
  'knock','ferry_bell','lantern','three_knocks','cup_relay','basin_drip','hoop_roll','bowl_tap','clock_hook'];
const ambienceFiles = ['fire','rain','river','wind','harbor_water','harbor_rigging'];
const guestMusic = {baker:'bakehouse',cooper:'workshop',guard:'watchroom',lida:'hearth',courier:'postroom'};
const effectLevels = {hover:.12,choice:.38,swipe_left:.45,swipe_right:.45,card_draw:.38,
  card_flip:.42,card_cancel:.3,stat_up:.25,stat_down:.25,coins:.35,warning:.45,
  curse:.45,death_hit:.65,victory_chime:.65,ferry_bell:.55};
const ambienceLevels = {fire:.30,rain:.30,river:.32,wind:.14,harbor_water:.32,harbor_rigging:.20};
const audioPlayers = new Map();
let audioUnlocked = false, audioFade = null, endingMusic = 'death';

function masterVolume() {
  return Number(document.getElementById('volume').value) / 100;
}
function audioAllowed() {
  return audioUnlocked && !document.hidden && !document.getElementById('mute').checked;
}
function player(key, loop) {
  if (audioPlayers.has(key)) return audioPlayers.get(key);
  const path = (musicFiles.includes(key) ? 'audio/' : 'audio/sfx/') + key + '.ogg';
  const audio = new Audio();
  audio.preload = 'none';
  audio.loop = loop;
  audio.volume = 0;
  const entry = {audio,loop,gain:0,target:0,failed:false,pending:false};
  audio.addEventListener('error', () => { entry.failed = true; audio.pause(); });
  audio.src = path;
  audioPlayers.set(key,entry);
  return entry;
}
function playAudio(entry) {
  if (entry.failed || entry.pending || !entry.audio.paused) return;
  entry.pending = true;
  entry.audio.play().catch(() => {}).finally(() => { entry.pending = false; });
}
function sound(key) {
  if (!audioAllowed() || !sfxFiles.includes(key)) return;
  const entry = player(key,false);
  if (entry.failed) return;
  entry.audio.volume = masterVolume() * (effectLevels[key] ?? .42);
  try { entry.audio.currentTime = 0; } catch (_) {}
  playAudio(entry);
}
function audioScene(card, stage, isChapter, lastEnding) {
  if (stage === 'cover') return {music:'tavern',ambience:['rain']};
  if (stage === 'journal') return {music:'tavern',ambience:['fire']};
  if (stage === 'victory' || stage === 'death') return {music:stage,ambience:[]};
  if (stage === 'book') return {music:lastEnding,ambience:[]};
  if (card?.story === 'old-gods') return {music:card.guest === 'revenant' ? 'ferry_window' : card.guest === 'dwarf' ? 'workshop' : 'ferry_watch',ambience:card.atDoor ? ['wind'] : ['fire']};
  if (card?.story === 'high-water') {
    if (card.id === 'water-ledger') return {music:'harbor',ambience:['harbor_water','harbor_rigging']};
    return {music:'high_water',ambience:[card.id === 'water-stairs' ? 'river' : 'harbor_water']};
  }
  if (card?.ferry) {
    const music = card.id === 'ferry-watch' ? 'ferry_watch' :
      card.id === 'ferry-window' ? 'ferry_window' : 'ferry';
    return {music,ambience:['river','wind']};
  }
  if (card?.room === 'market') return {music:'street',ambience:['wind']};
  if (card?.room === 'lower-street') return {music:'street',ambience:['river']};
  if (card?.room === 'cold-bakery') return {music:'bakehouse',ambience:[]};
  if (card?.room === 'bakery') return {music:'bakehouse',ambience:['fire']};
  if (card?.atDoor) return {music:'street',ambience:['rain','wind']};
  return {music:isChapter ? (guestMusic[card?.guest] || 'tavern') : 'tavern',ambience:['fire']};
}
function fadeAudio() {
  let moving = false;
  for (const entry of audioPlayers.values()) {
    if (!entry.loop) continue;
    const delta = entry.target - entry.gain;
    entry.gain += Math.sign(delta) * Math.min(Math.abs(delta), .025);
    entry.audio.volume = Math.max(0, Math.min(1, entry.gain * masterVolume()));
    if (entry.target > 0) playAudio(entry);
    if (!entry.target && !entry.gain) entry.audio.pause();
    if (Math.abs(entry.target - entry.gain) > .0001) moving = true;
  }
  if (!moving) { clearInterval(audioFade); audioFade = null; }
}
function syncAudio() {
  if (phase === 'death' || phase === 'victory') endingMusic = phase;
  clearInterval(audioFade); audioFade = null;
  if (!audioAllowed()) {
    for (const entry of audioPlayers.values()) {
      entry.audio.pause();
      entry.target = entry.gain = 0;
      entry.audio.volume = 0;
    }
    return;
  }
  const menu = document.getElementById('inn-menu');
  const scene = audioScene(current,menu.open ? menu.dataset.view : phase,chaptersById.has(current?.id),endingMusic);
  for (const entry of audioPlayers.values()) if (entry.loop) entry.target = 0;
  player(scene.music,true).target = .55;
  for (const key of scene.ambience) player(key,true).target = ambienceLevels[key];
  audioFade = setInterval(fadeAudio,50);
  fadeAudio();
}
function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  syncAudio();
}
document.addEventListener('pointerdown',unlockAudio,{capture:true,once:true});
document.addEventListener('keydown',unlockAudio,{capture:true,once:true});
document.getElementById('mute').onchange = () => {
  unlockAudio();
  syncAudio();
  sound('interface');
};
document.getElementById('volume').oninput = syncAudio;
document.addEventListener('visibilitychange',syncAudio);
