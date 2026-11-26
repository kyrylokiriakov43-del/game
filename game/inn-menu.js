// An entry is the playable opening. Notes are written only after the associated visit or decision.
const stories = [
  {entry:'rent', title:'Шесть грошей', art:'morwen-coins.webp', cards:chapterCards,
    hook:'Морвен предлагает двойную плату за комнату, которую вы уже обещали караулу.',
    notes:{curtains:'Морвен нашла за кроватью ведомость.', quarters:'Рутгер вынес из каморки простыню в саже.',
      'proof-tool':'Элиас узнал руку Лиды по рукояти совка.', 'proof-morwen':'Морвен помнит, кто сушил её перчатки.',
      heard:'У печи Лида сама рассказала о жалованье.'},
    endings:['watch-mark','hearth-book','winter-boots','beechwood']},
  {entry:'market-kindling', title:'Ночной рынок', art:'market-room.svg', cards:marketCards,
    hook:'К утру Агате нужен жар для печи. На рынке сворачивают последние навесы.',
    notes:{'market-hot-oven':'Купленная у Саввы вязанка разгорелась в печи.',
      'market-last-embers':'Пока проверяли гирю, вязанку купил возчик.',
      'washer-fed':'Прачке уступили место у горячей печи.'}},
  {entry:'late-bell', title:'Семь минут', art:'faces/late-bell.webp', cards:sevenMinutesCards,
    hook:'Караул поужинал за семь минут до звона. Рутгер положил счёт на стойку.',
    notes:{'bell-bowls':'После бесплатного ужина к кухне протянули восемь мисок.',
      'bell-receipt':'Казначей попросил показать часы, по которым наливали суп.',
      'clock-at-treasury':'Феня унесла кухонные часы в наволочке.'}},
  {entry:'water-notch', title:'Высокая вода', art:'water-notch.svg', cards:highWaterCards,
    hook:'Вода дошла до гвоздя на столбе. На мели машут фонарём, а в нижних домах ещё спят.',
    notes:{'water-stairs':'Феня успела к затопленной лестнице.', 'water-ledger':'С баржи сняли юнгу.',
      'three-knocks':'Элиас подал условный сигнал. У Агаты залило подвал.',
      'wash-cart':'Прачка привезла тележку к подвалу Агаты. Она запомнила, кто уступил ей печь.',
      'cup-relay':'Цепочка звенящих кружек оборвалась у пустого двора.'}},
  {entry:'first-loaf', title:'Первый хлеб', art:'lower-street-dawn.webp', cards:firstLoafCards,
    hook:'Утром после паводка Агата вынула из печи одну буханку. В зале ждут к супу, а на нижней улице ещё сушат печи.',
    notes:{'loaf-gift':'Караул ел на счёт таверны. Рутгер стёр долг с доски.',
      'loaf-tally':'Каждый сам отметил мелом свой ломоть.',
      'loaf-neighbours':'Бабушка разделила хлеб и отложила мягкую середину для соседа.',
      'loaf-door':'Вы с Феней дошли с хлебом до последней ставни.'}},
  {entry:'ferry-bell', title:'Последний паром', art:'ferry-reach.svg', cards:ferryCards, discover:true,
    hook:'Говорят, из погреба этой таверны слышно колокол с другого берега.',
    notes:{'ferry-watch':'Устина довезла вас до будки смотрителя.', 'ferry-window':'В белом окне показалась мама.'},
    endings:['beacon','undertow']},
  {entry:'hoops', title:'Бочка Элиаса', art:'faces/hoops.webp', discover:true, incidental:true,
    hook:'Элиас зажимает пальцем щель. До утра проволока ещё продержится.',
    notes:{'beer-basin':'Проволока разошлась. Под бочку подставили таз.',
      'spare-hoop':'Новый обруч держит. Элиас принёс старый из мастерской.', 'bucket-mended':'Из обруча вышла дужка для ведра.'}},
  {entry:'pie', title:'Свадебный пирог', art:'faces/pie.webp', discover:true, incidental:true,
    hook:'Свадьбу отменили, а на кухне уже готов пирог с сахарными голубями.',
    notes:{birds:'Могильщик со скрипачом вернулись за сахарными голубями.', dish:'Невеста вернула Агате блюдо со сколом.'}}
];

const innMenu = el('inn-menu');
const storyMarks = new Set();
const trackedMarks = new Set(stories.flatMap(story => [story.entry, ...Object.keys(story.notes)]));
const runKey = 'inn-between.run.v1';
let selectedStory = stories[0];
let journalFromCover = true;

function recordStoryVisit(id) {
  if (!trackedMarks.has(id) || storyMarks.has(id)) return;
  storyMarks.add(id);
  try { localStorage.setItem('inn-between.story.' + id,'1'); } catch {}
}

function readMemories() {
  try {
    for (const id of trackedMarks) {
      if (localStorage.getItem('inn-between.story.' + id) === '1') storyMarks.add(id);
    }
    for (const id of Object.keys(bookClues)) {
      if (localStorage.getItem(bookKey(id)) === '1') rememberedEndings.add(id);
    }
  } catch {}
}

function saveVisit(side = null) {
  const snapshot = {card:current.id, side, values, flags:[...flags], seen:[...seen], recent,
    turn, pendingVisit, returnVisits, immediateVisit};
  try { localStorage.setItem(runKey,JSON.stringify(snapshot)); } catch {}
}

function forgetVisit() {
  try { localStorage.removeItem(runKey); } catch {}
}

function savedVisit() {
  try {
    const s = JSON.parse(localStorage.getItem(runKey));
    if (!s) return null;
    const card = cardsById.get(s.card);
    const validDue = v => v && Number.isSafeInteger(v.due) && v.due > 0;
    const validCards = list => Array.isArray(list) && list.every(id => cardsById.has(id));
    if (card && Number.isSafeInteger(s.turn) && s.turn > 0 &&
        (s.side === null || ([0,1].includes(s.side) && card.choices[s.side].passage)) &&
        statIds.every(id => Number.isInteger(s.values?.[id]) && s.values[id] > 0 && s.values[id] < balance.max) &&
        validCards(s.seen) && s.seen.includes(s.card) && validCards(s.recent) &&
        Array.isArray(s.flags) && s.flags.every(flag => typeof flag === 'string') &&
        (s.pendingVisit === null || (validDue(s.pendingVisit) && chaptersById.has(s.pendingVisit.id))) &&
        (!s.immediateVisit || cardsById.has(s.immediateVisit)) && Array.isArray(s.returnVisits) &&
        s.returnVisits.every(v => validDue(v) && cardsById.has(v.id))) {
      // A run saved in the previous edition can already have lived through the second flood.
      const alarm = highWaterCards.find(c => c.returnVisit === 'first-loaf' && s.seen.includes(c.id) &&
        (s.card !== c.id || s.side !== null));
      if (alarm && !s.flags.includes(alarm.mark) && !s.seen.includes('first-loaf')) {
        s.flags.push(alarm.mark);
        if (!s.returnVisits.some(v => v.id === 'first-loaf')) {
          s.returnVisits.push({id:'first-loaf', due:s.turn + (s.card === alarm.id ? 2 : 1)});
        }
      }
      return s;
    }
  } catch {}
  return null;
}

function enterInn() {
  if (current && (phase === 'guest' || phase === 'paper')) { leaveMenu(); return; }
  const s = savedVisit();
  if (!s) { restart(); return; }
  innMenu.close();
  values = s.values; flags = new Set(s.flags); seen = new Set(s.seen); recent = s.recent;
  turn = s.turn; pendingVisit = s.pendingVisit; returnVisits = s.returnVisits;
  immediateVisit = s.immediateVisit; ferryEnding = null;
  updateMeters();
  show(cardsById.get(s.card),true);
  if (s.side === null) dealFace();
  else showPassage(current.choices[s.side],s.side,true);
}

function showMenuPage(view) {
  settings.open = false;
  if (drag) { clearDrag(); cardNode.style.transform = ''; setPreview(null); }
  innMenu.dataset.view = view;
  el('cover').hidden = view !== 'cover';
  el('journal').hidden = view !== 'journal';
  innMenu.setAttribute('aria-labelledby',view === 'cover' ? 'cover-title' : 'journal-title');
  if (!innMenu.open) innMenu.showModal();
  syncAudio();
}

function openCover() {
  if (current && locked && !innMenu.open) return;
  const visit = phase === 'guest' || phase === 'paper' ? turn : savedVisit()?.turn;
  el('enter-inn').textContent = visit ? 'Продолжить · визит ' + visit : 'Открыть таверну';
  el('cover-sound').textContent = el('mute').checked ? 'Звук выключен' : 'Звук включён';
  showMenuPage('cover');
  el('enter-inn').focus({preventScroll:true});
}

function leaveMenu() {
  innMenu.close();
  syncAudio();
  if (phase === 'book') el('end-journal').focus({preventScroll:true});
  else if (phase === 'paper' || atEnding()) el('advance').focus({preventScroll:true});
  else el('desk-journal').focus({preventScroll:true});
}

function hasStory(story) {
  return storyMarks.has(story.entry) || story.endings?.some(id => rememberedEndings.has(id));
}

function storyForCard(id) {
  return stories.find(s => s.entry === id || id in s.notes || s.cards?.includes(cardsById.get(id)));
}

function lastStoryOfRun() {
  for (const id of [current.id, ...[...seen].reverse()]) {
    const story = storyForCard(id);
    if (story) return story;
  }
}

const appointmentNotes = {
  payroll:'Агата хочет поговорить о старой ведомости.',
  haft:'Элиаса попросили взглянуть на совок.',
  witness:'Морвен позвали засвидетельствовать ночные смены.',
  receipt:'Предстоит разговор с Рутгером о трёх подписях.',
  'bell-bowls':'Вы взяли караульный ужин на свой счёт.',
  'bell-receipt':'Караул заплатил и попросил счёт для казначея.',
  hoops:'Элиас обещал вернуть Агате совок.',
  'beer-basin':'Бочку временно стянули проволокой.',
  'spare-hoop':'Вы согласились сходить за новым обручем.',
  'three-knocks':'Договорились будить хозяина тремя ударами.',
  'cup-relay':'На нижней улице приготовили кружки для сигнала.',
  'first-loaf':'К утру Агата обещала испечь хлеб.'
};

function paintStory() {
  const s = selectedStory;
  for (const button of el('story-index').children) button.setAttribute('aria-current',String(button.dataset.entry === s.entry));
  el('story-picture').src = 'art/' + s.art;
  el('story-name').textContent = s.title;
  el('story-hook').textContent = s.hook;
  const notes = Object.entries(s.notes).filter(([id]) => storyMarks.has(id)).map(([,line]) => line);
  for (const id of s.endings ?? []) {
    if (rememberedEndings.has(id)) notes.push((keepsakes[id] || ferryEndings[id]).title + ' — ' +
      (keepsakes[id]?.text || ferryEndings[id].note));
  }
  el('story-notes').replaceChildren(...notes.map(line => {
    const li = document.createElement('li'); li.textContent = line; return li;
  }));
  const active = phase === 'guest' || phase === 'paper' ? {returnVisits,pendingVisit} : savedVisit();
  const due = [active?.pendingVisit, ...(active?.returnVisits ?? [])].find(v =>
    v && appointmentNotes[v.id] && (v.id === s.entry || v.id in s.notes || s.cards?.includes(cardsById.get(v.id))));
  const promise = due && appointmentNotes[due.id];
  const canStart = !s.discover || hasStory(s);
  const note = promise ? 'В этой партии: ' + promise :
    canStart ? '' : 'Когда услышите паромный колокол в таверне, отсюда можно будет начать новую партию.';
  el('story-promise').textContent = note;
  el('story-promise').hidden = !note;
  const start = el('story-start');
  start.hidden = !canStart;
  start.textContent = active ? 'Начать новую партию отсюда' : 'Начать с этой истории';
}

function openJournal(fromCover) {
  if (current && locked && !innMenu.open) return;
  journalFromCover = fromCover;
  readMemories();
  const card = current || cardsById.get(savedVisit()?.card);
  selectedStory = (card && storyForCard(card.id)) || stories[0];
  const index = el('story-index');
  index.replaceChildren();
  for (const story of stories.filter(s => !s.incidental || hasStory(s))) {
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.entry = story.entry; button.textContent = story.title;
    button.onclick = () => { selectedStory = story; sound('page_turn'); paintStory(); };
    index.append(button);
  }
  el('journal-back').textContent = fromCover ? 'На обложку' : phase === 'book' ? 'К итогам' : 'К стойке';
  paintStory(); showMenuPage('journal'); sound('book_open');
  index.querySelector('[aria-current="true"]').focus({preventScroll:true});
}

el('enter-inn').onclick = enterInn;
el('cover-journal').onclick = () => openJournal(true);
el('desk-journal').onclick = el('end-journal').onclick = () => openJournal(false);
el('desk-home').onclick = el('end-home').onclick = openCover;
el('journal-back').onclick = () => { sound('book_close'); if (journalFromCover) openCover(); else leaveMenu(); };
el('story-start').onclick = () => restart(cardsById.get(selectedStory.entry));
el('cover-sound').onclick = () => {
  el('mute').checked = !el('mute').checked;
  el('mute').dispatchEvent(new Event('change'));
  el('cover-sound').textContent = el('mute').checked ? 'Звук выключен' : 'Звук включён';
};
innMenu.oncancel = event => {
  event.preventDefault();
  if (innMenu.dataset.view === 'journal') el('journal-back').click();
  else if (current) leaveMenu();
};
function handleInnBack() {
  if (innMenu.open) {
    if (innMenu.dataset.view === 'cover') return false;
    el('journal-back').click();
  } else if (settings.open) settings.open = false;
  else openCover();
  return true;
}
openCover();
