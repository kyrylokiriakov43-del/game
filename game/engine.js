const el = id => document.getElementById(id);
const table = document.querySelector('.table');
const cardNode = el('card');
const buttons = [...el('choices').children];
const settings = document.querySelector('details');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const seals = ['key','boots','hammer','loaf','coins','lantern','quill','hourglass','shield','cup','branch','bench'];
const statIds = Object.keys(stats);
const chaptersById = new Map(chapterCards.map(card => [card.id, card]));
const ferryById = new Map(ferryCards.map(card => [card.id, card]));

let values, flags, seen, recent, current, turn, pendingVisit;
let pendingFerry, ferryEnding;
let phase, locked = true;
let timer, feedbackTimer;
let drag = null;

for (const [index, id] of statIds.entries()) {
  const meter = document.createElement('div');
  meter.id = 'meter-' + id;
  meter.className = 'meter';
  meter.tabIndex = 0;
  meter.setAttribute('role', 'meter');
  meter.setAttribute('aria-label', stats[id].label);
  meter.setAttribute('aria-valuemin', 0);
  meter.setAttribute('aria-valuemax', balance.max);
  meter.style.setProperty('--icon-position', index * 100 / (statIds.length - 1) + '%');
  meter.innerHTML = '<span class="sigil" aria-hidden="true"></span><small></small>' +
    '<span class="value" aria-hidden="true"></span><span class="change" aria-hidden="true"></span>';
  meter.querySelector('small').textContent = stats[id].label;
  meter.onclick = () => meter.focus();
  el('meters').append(meter);
}

function updateMeters(previous) {
  clearTimeout(feedbackTimer);
  for (const id of statIds) {
    const value = values[id], stat = stats[id], meter = el('meter-' + id);
    const change = previous ? value - previous[id] : 0;
    const nearLow = value <= 2 * balance.step;
    const nearHigh = value >= balance.max - 2 * balance.step;
    const hint = nearLow ? stat.low.hint : nearHigh ? stat.high.hint : '';
    const reading = value + ' из ' + balance.max + (hint ? '. ' + hint : '');
    meter.setAttribute('aria-valuenow', value);
    meter.setAttribute('aria-valuetext', reading);
    meter.style.setProperty('--empty', (100 - value * 100 / balance.max) + '%');
    meter.querySelector('.value').textContent = value;
    meter.querySelector('.change').textContent = change > 0 ? '+' + change : String(change);
    meter.classList.toggle('changed', change !== 0);
    meter.classList.toggle('low', nearLow);
    meter.classList.toggle('high', nearHigh);
    meter.classList.remove('fatal');
    meter.title = stat.label + ' · ' + reading;
  }
  if (previous) feedbackTimer = setTimeout(() => {
    document.querySelectorAll('.meter.changed').forEach(m => m.classList.remove('changed'));
  }, 850);
}

function shifted(value, steps) {
  return Math.min(balance.max, Math.max(0, value + steps * balance.step));
}

// In a tie the closest boundary wins. Equal distances follow the visible order of meters.
function fatalStat(before, after) {
  let cause = null, nearest = Infinity;
  for (const id of statIds) {
    const value = after[id];
    if (value !== 0 && value !== balance.max) continue;
    const distance = Math.abs(value - before[id]);
    if (distance < nearest) { cause = id; nearest = distance; }
  }
  return cause;
}

function nextCard() {
  if (pendingFerry) {
    const next = ferryById.get(pendingFerry);
    pendingFerry = null;
    return next;
  }
  if (turn === ferryVisit) return ferryCards[0];
  if (pendingVisit && turn >= pendingVisit.due) {
    const next = chaptersById.get(pendingVisit.id);
    pendingVisit = null;
    return next;
  }
  const available = houseCards.filter(card => (!card.requires || flags.has(card.requires))
    && (!card.once || !seen.has(card.id)));
  let pool = available.filter(card => !recent.includes(card.id));
  if (!pool.length) pool = available;
  const echo = pool.find(card => card.requires);
  if (echo) return echo;
  let roll = Math.random() * pool.reduce((total, card) => total + (card.weight ?? 1), 0);
  return pool.find(card => (roll -= card.weight ?? 1) < 0) || pool[pool.length - 1];
}

function setPreview(side) {
  const option = phase === 'guest' ? current?.choices[side] : null;
  const label = el('preview');
  label.hidden = !option;
  if (option) {
    label.firstElementChild.textContent = option.text;
    label.lastElementChild.hidden = !option.ending;
    label.dataset.side = side;
  }
  buttons.forEach((button, index) => button.classList.toggle('selected', !!option && index === side));
  for (const id of statIds) {
    const meter = el('meter-' + id);
    const steps = option?.effects[id] ?? 0;
    meter.classList.toggle('affected', Boolean(steps));
    const predicted = steps ? shifted(values[id], steps) : null;
    meter.classList.toggle('ominous', predicted === 0 || predicted === balance.max);
  }
}

function atEnding() { return phase === 'victory' || phase === 'death'; }

function setPhase(nextPhase) {
  phase = document.body.dataset.phase = nextPhase;
  const book = phase === 'book', ending = atEnding(), story = phase === 'paper';
  document.body.classList.toggle('ended', ending);
  table.hidden = book;
  el('chronicle').hidden = !book;
  el('choices').hidden = phase !== 'guest';
  el('page-controls').hidden = !(story || ending);
  el('again').hidden = !ending;
  el('paper').hidden = !story;
  el('last-scene').hidden = !ending || Boolean(ferryEnding);
  el('ferry-face').hidden = !current.ferry || story || book;
  el('scene').hidden = el('portrait').hidden = story || ending || Boolean(current.ferry);
  let advanceLabel = 'Следующий гость';
  if (current.ferry) advanceLabel = pendingFerry ? 'Дальше' : 'Вернуться в таверну';
  el('advance').textContent = ending ? 'Открыть гостевую книгу' : advanceLabel;
  syncAudio();
}

function lockFace(frozen) {
  locked = frozen;
  buttons.forEach(button => { button.disabled = frozen || phase !== 'guest'; });
  el('advance').disabled = frozen;
  el('again').disabled = frozen;
}

function dealFace() {
  clearTimeout(timer);
  lockFace(true);
  cardNode.style.transition = 'none';
  cardNode.classList.remove('leaving', 'deal', 'dragging');
  cardNode.style.transform = '';
  void cardNode.offsetWidth;
  cardNode.style.transition = '';
  cardNode.classList.add('deal');
  if (phase === 'guest') sound('card_draw');
  else if (phase === 'paper') sound('card_flip');
  timer = setTimeout(() => {
    cardNode.classList.remove('deal');
    lockFace(false);
    if (!settings.open && (phase === 'paper' || atEnding())) el('advance').focus({preventScroll:true});
  }, reducedMotion.matches ? 0 : 510);
}

function paintFerry(node, panel) {
  node.style.backgroundPosition = (panel % 3 * 50) + '% ' + (Math.floor(panel / 3) * 100) + '%';
}

function show(card) {
  const wasAtDoor = Boolean(current?.atDoor);
  const wasAtFerry = Boolean(current?.ferry);
  current = card;
  if (card.atDoor && !wasAtDoor) sound('door_open');
  if (!card.atDoor && wasAtDoor) sound('door_close');
  if (card.ferry && !wasAtFerry) sound('ferry_bell');
  seen.add(card.id);
  recent.push(card.id);
  if (recent.length > balance.cooldown) recent.shift();
  setPhase('guest');
  document.body.classList.toggle('at-door', Boolean(card.atDoor));
  document.body.classList.toggle('at-ferry', Boolean(card.ferry));
  if (card.ferry) {
    paintFerry(el('ferry-face'), card.ferry.panel);
    el('ferry-face').setAttribute('aria-label', card.ferry.name);
    el('name').textContent = card.ferry.name;
    el('role').textContent = card === ferryCards[0] ? 'Событие' : 'Событие · Последний паром';
  } else {
    const [name, role, portrait, scene = 'card-scene.svg'] = guests[card.guest];
    el('portrait').src = 'art/' + portrait;
    el('scene').src = 'art/' + scene;
    el('name').textContent = name;
    el('role').textContent = role;
  }
  const version = Object.keys(card.variants ?? {}).find(flag => flags.has(flag));
  el('line').textContent = version ? card.variants[version] : card.line;
  el('night').textContent = 'Визит ' + String(turn).padStart(2, '0');
  buttons.forEach((button, index) => {
    button.querySelector('.reply-text').textContent = card.choices[index].text;
    button.querySelector('small').hidden = !card.choices[index].ending;
    const column = Math.max(0, seals.indexOf(card.seals?.[index] ?? 'quill'));
    button.style.setProperty('--seal-position', column * 100 / (seals.length - 1) + '%');
  });
  dealFace();
}

function showPassage(option, side) {
  setPhase('paper');
  cardNode.style.setProperty('--paper-x', side ? '4%' : '-4%');
  cardNode.style.setProperty('--paper-angle', side ? '2.3deg' : '-2.3deg');
  el('passage').textContent = option.passage;
  dealFace();
}

function clearDrag() {
  const pointer = drag?.id;
  drag = null;
  if (pointer !== undefined && cardNode.hasPointerCapture(pointer)) cardNode.releasePointerCapture(pointer);
  cardNode.classList.remove('dragging');
}

function restart() {
  if (phase === 'book') sound('book_close');
  clearTimeout(timer);
  clearDrag();
  setPreview(null);
  values = Object.fromEntries(statIds.map(id => [id, stats[id].start]));
  flags = new Set();
  seen = new Set();
  recent = [];
  pendingVisit = null;
  pendingFerry = null;
  ferryEnding = null;
  turn = 1;
  settings.open = false;
  updateMeters();
  show(chapterCards[0]);
}

function closeInn(cause) {
  const value = values[cause];
  const ending = value === 0 ? stats[cause].low : stats[cause].high;
  setPhase('death');
  sound('death_hit');
  const meter = el('meter-' + cause);
  meter.classList.add('fatal');
  meter.setAttribute('aria-valuetext', value + ' из ' + balance.max + '. Причина смерти.');
  el('last-scene').style.backgroundPosition = ending.panel % 4 * 100 / 3 + '% ' + Math.floor(ending.panel / 4) * 100 + '%';
  el('last-scene').setAttribute('aria-label', ending.title);
  el('line').textContent = ending.line;
  el('name').textContent = ending.title;
  el('role').textContent = 'Хозяин погиб · ' + stats[cause].label + ' ' + value + '/' + balance.max;
  dealFace();
}

function finishFerry(id) {
  ferryEnding = ferryEndings[id];
  pendingVisit = pendingFerry = null;
  setPhase(ferryEnding.phase);
  sound(ferryEnding.phase === 'victory' ? 'victory_chime' : 'death_hit');
  paintFerry(el('ferry-face'), ferryEnding.panel);
  el('ferry-face').setAttribute('aria-label', ferryEnding.title);
  el('line').textContent = ferryEnding.line;
  el('name').textContent = ferryEnding.title;
  el('role').textContent = ferryEnding.label + ' · Последний паром';
  dealFace();
}

function openBook() {
  const proof = flags.has('proof-tool') || flags.has('proof-morwen');
  const heard = flags.has('heard');
  const resolution = Object.keys(keepsakes).find(id => keepsakes[id].resolution && flags.has(id));
  const stars = ferryEnding?.stars ?? (Number(proof) + Number(heard) + Number(Boolean(resolution)));
  const token = ferryEnding || keepsakes[resolution || (heard ? 'heard' : proof ? 'proof' : 'key')];
  setPhase('book');
  sound('book_open');
  el('token-title').textContent = token.title;
  el('token-note').textContent = ferryEnding ? ferryEnding.note : token.text;
  const art = el('token-art');
  art.classList.toggle('ferry-art', Boolean(ferryEnding));
  if (ferryEnding) paintFerry(art, token.panel);
  else art.style.backgroundPosition = token.panel * 100 / (Object.keys(keepsakes).length - 1) + '% center';
  el('stars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  el('stars').setAttribute('aria-label', 'Звёзд за ' + (ferryEnding ? 'переправу' : 'главу «Шесть грошей»') + ' — ' + stars + ' из 3');
  el('score').textContent = turn * 10 + stars * 30;
  el('visit-count').textContent = 'Визитов — ' + turn;
  el('new-life').focus({preventScroll:true});
}

function dismiss(side, then) {
  lockFace(true);
  const sign = side === 0 ? -1 : 1;
  cardNode.classList.add('leaving');
  cardNode.style.transform = 'translate3d(' + sign * 108 + '%,-5%,0) rotate(' + sign * 19 + 'deg)';
  timer = setTimeout(then, reducedMotion.matches ? 0 : 275);
}

function nextGuest() { turn++; show(nextCard()); }

function choose(side) {
  if (locked || phase !== 'guest') return;
  clearDrag();
  setPreview(null);
  sound(side === 0 ? 'swipe_left' : 'swipe_right');
  sound('choice');
  const option = current.choices[side];
  if (option.ending) { finishFerry(option.ending); return; }
  const previous = {...values};
  for (const [id, steps] of Object.entries(option.effects)) values[id] = shifted(values[id], steps);
  updateMeters(previous);
  const cause = fatalStat(previous, values);
  if (!cause) {
    const near = value => value <= 2 * balance.step || value >= balance.max - 2 * balance.step;
    if (statIds.some(id => near(values[id]) && !near(previous[id]))) sound('warning');
    else if (values.curse !== previous.curse) sound('curse');
    else if (values.gold !== previous.gold) sound('coins');
    else {
      const delta = statIds.reduce((total, id) => total + values[id] - previous[id], 0);
      if (delta) sound(delta > 0 ? 'stat_up' : 'stat_down');
    }
  }
  dismiss(side, () => {
    if (cause) { closeInn(cause); return; }
    if (option.flag) flags.add(option.flag);
    if (current.mark) flags.add(current.mark);
    pendingFerry = option.ferryNext ?? null;
    const next = option.next ?? current.next;
    if (next) pendingVisit = {id:next, due:turn + (current.interlude ? 2 : 1)};
    if (option.passage) showPassage(option, side);
    else nextGuest();
  });
}

function advance(side = 1) {
  if (locked || (phase !== 'paper' && !atEnding())) return;
  sound('page_turn');
  if (atEnding()) openBook();
  else dismiss(side, nextGuest);
}

cardNode.onpointerdown = event => {
  if (locked || (phase !== 'guest' && phase !== 'paper') || !event.isPrimary || event.button !== 0) return;
  const width = cardNode.offsetWidth;
  drag = {id:event.pointerId, x:event.clientX, y:event.clientY, width,
    threshold:Math.max(40, Math.min(84, width * .22))};
  cardNode.setPointerCapture(event.pointerId);
  cardNode.classList.add('dragging');
};

cardNode.onpointermove = event => {
  if (drag?.id !== event.pointerId) return;
  const dx = event.clientX - drag.x;
  const gutter = (document.documentElement.clientWidth - drag.width) / 2;
  const limit = Math.min(drag.width * .83, gutter + drag.width * .22);
  const x = Math.max(-limit, Math.min(limit, dx * .94));
  const y = Math.max(-18, Math.min(12, (event.clientY - drag.y) * .18)) - Math.abs(x) * .045;
  const angle = x / drag.width * 19;
  cardNode.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) rotate(' + angle + 'deg)';
  if (phase === 'guest') setPreview(Math.abs(dx) > 18 ? Number(dx > 0) : null);
};

function release(event) {
  if (drag?.id !== event.pointerId) return;
  const dx = event.clientX - drag.x;
  const tap = Math.abs(dx) < 8 && Math.abs(event.clientY - drag.y) < 8;
  const commit = event.type === 'pointerup' && (Math.abs(dx) >= drag.threshold || (phase === 'paper' && tap));
  clearDrag();
  if (commit) {
    const side = Number(tap || dx > 0);
    if (phase === 'paper') advance(side);
    else choose(side);
  } else {
    if (!tap) sound('card_cancel');
    setPreview(null);
    cardNode.style.transform = '';
  }
}
cardNode.onpointerup = cardNode.onpointercancel = cardNode.onlostpointercapture = release;

buttons.forEach((button, side) => {
  button.onclick = () => choose(side);
  const previewReply = () => {
    if (locked || drag || phase !== 'guest') return;
    sound('hover');
    setPreview(side);
    const sign = side === 0 ? -1 : 1;
    cardNode.style.transform = 'translate3d(' + sign * 3 + '%,-1%,0) rotate(' + sign * 2 + 'deg)';
  };
  const clearReply = () => {
    if (locked || drag || phase !== 'guest') return;
    setPreview(null);
    cardNode.style.transform = '';
  };
  button.onpointerenter = event => { if (event.pointerType === 'mouse') previewReply(); };
  button.onpointerleave = clearReply;
  button.onfocus = () => { if (button.matches(':focus-visible')) previewReply(); };
  button.onblur = clearReply;
});

el('advance').onclick = () => advance();
el('again').onclick = el('new-life').onclick = el('reset').onclick = restart;
document.onkeydown = event => {
  if (event.key === 'Escape') {
    if (drag) { clearDrag(); setPreview(null); cardNode.style.transform = ''; }
    settings.open = false;
    return;
  }
  if (event.altKey || event.ctrlKey || event.metaKey || settings.open) return;
  if (event.repeat) {
    if (['ArrowLeft','ArrowRight',' ','Enter'].includes(event.key)) event.preventDefault();
    return;
  }
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    const side = Number(event.key === 'ArrowRight');
    if (phase === 'guest') choose(side);
    else advance(side);
  } else if ((phase === 'paper' || atEnding()) && (event.key === ' ' || event.key === 'Enter')
      && !event.target.closest('button,input,summary,[role="meter"]')) {
    event.preventDefault();
    advance();
  }
};

restart();
