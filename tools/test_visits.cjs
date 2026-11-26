// Play linked visits through the local game in an isolated Chromium profile.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { spawnSync } = require('node:child_process');

async function testVisits() {
  const check = (condition, message) => {
    if (!condition) throw Error(message + ' (' + current.id + ', visit ' + turn + ')');
  };
  const ready = async () => {
    while (locked) await new Promise(resolve => setTimeout(resolve, 10));
  };
  const pick = async (side, advanceLabel) => {
    const hasPassage = Boolean(current.choices[side].passage);
    const visit = turn;
    buttons[side].click();
    await ready();
    if (!hasPassage) {
      check(!advanceLabel && phase === 'guest' && turn === visit + 1, 'Expected the next guest immediately');
      return;
    }
    check(phase === 'paper', 'Expected a consequence');
    if (advanceLabel) check(el('advance').textContent === advanceLabel, 'Wrong destination on the consequence');
    el('advance').click();
    await ready();
  };
  const risk = forecast => forecast.cause ? Infinity :
    Object.values(forecast.after).reduce((sum, value) => sum + (value - 50) ** 2, 0);
  async function morningAfterFlood(flour) {
    const signalTurn = turn;
    await pick(Number(risk(forecasts[1]) < risk(forecasts[0])));
    check(returnVisits.some(v => v.id === 'first-loaf'), 'The morning bake was not promised');
    const saved = localStorage.getItem(runKey);
    const olderRun = JSON.parse(saved);
    olderRun.flags = olderRun.flags.filter(id => id !== flour);
    olderRun.returnVisits = olderRun.returnVisits.filter(v => v.id !== 'first-loaf');
    localStorage.setItem(runKey, JSON.stringify(olderRun));
    const migrated = savedVisit();
    localStorage.setItem(runKey, saved);
    check(migrated.flags.includes(flour) && migrated.returnVisits.filter(v => v.id === 'first-loaf').length === 1,
      'A continuing run from the previous edition missed the morning bake');
    for (let i = 0; current.id !== 'first-loaf' && i < 12; i++) {
      await pick(Number(risk(forecasts[1]) < risk(forecasts[0])));
    }
    check(current.id === 'first-loaf' && turn >= signalTurn + 2, 'Wrong morning after the alarm');
    check(flags.has(flour) && el('line').textContent === current.variants[flour], 'The loaf forgot where its flour came from');
  }

  el('mute').checked = true;
  // Keep the first free visits deterministic so the cooper is invited via Lida's scoop.
  Math.random = () => .35;
  for (const [repair, barrel] of ['beer-basin', 'spare-hoop'].entries()) {
    for (const [signal, alarm] of ['three-knocks', 'cup-relay'].entries()) {
      restart();
      await ready();
      const visits = [];
      while (current.id !== alarm && visits.length < 32) {
        visits.push(current.id);
        const side = {payroll:0, haft:1, hoops:repair, 'water-mark':signal, 'ferry-bell':1,
          'beer-basin':signal, 'spare-hoop':1 - signal}[current.id];
        await pick(side ?? Number(risk(forecasts[1]) < risk(forecasts[0])));
      }
      check(current.id === alarm, 'The promised alarm was lost');
      if (alarm === 'three-knocks') {
        const floodLine = repair ? current.variants['bucket-mended'] : current.line;
        check(el('line').textContent === floodLine, 'Flood dialogue ignored the bucket repair');
      }
      check(visits.includes('haft') && visits.filter(id => id === 'hoops').length === 1, 'Wrong barrel invitation');
      check(visits.includes('water-mark') && visits.indexOf(barrel) > visits.indexOf('water-mark'), 'The earlier promise was lost');
      check(!visits.includes(repair ? 'beer-basin' : 'spare-hoop'), 'Both barrel outcomes appeared');
      check(visits[visits.indexOf('haft') + 1] === 'receipt', 'A return preempted the main chapter');
      await morningAfterFlood(signal ? 'street-flour' : 'cellar-flour');
    }
  }
  restart();
  await ready();
  Math.random = () => .055;
  for (let i = 0; current.id !== 'hoops' && i < 5; i++) await pick(Number(risk(forecasts[1]) < risk(forecasts[0])));
  check(current.id === 'hoops' && !seen.has('haft'), 'Missing ordinary cellar visit');
  await pick(0);
  check(returnVisits.length === 1, 'Repair did not schedule a return');
  restart();
  check(returnVisits.length === 0, 'Return leaked into a new run');

  async function enterMarket() {
    await startStory('market-kindling');
    check(current.id === 'market-kindling' && turn === 1 && !settings.open, 'Market shortcut did not start a fresh run');
  }
  async function startStory(entry) {
    await ready();
    el('desk-journal').click();
    el('story-index').querySelector('[data-entry="' + entry + '"]').click();
    el('story-start').click();
    await ready();
  }
  for (const [purchase, oven] of ['market-hot-oven','market-last-embers'].entries()) {
    for (const meal of [0, 1]) {
      await enterMarket();
      await pick(0, 'Идти на рынок');
      check(current.id === 'market-scales' && document.body.dataset.room === 'market', 'Missing market');
      const street = audioScene(current, phase, true);
      check(street.music === 'street' && street.ambience.join() === 'wind', 'Wrong market sound');
      await pick(purchase, 'Вернуться к печи');
      check(current.id === oven && document.body.dataset.room === (purchase ? 'cold-bakery' : 'bakery'), 'Wrong bakery outcome');
      check(el('scene').src.endsWith('/' + oven + '.webp') && el('portrait').hidden, 'Wrong outcome illustration');
      const bakery = audioScene(current, phase, true);
      check(bakery.music === 'bakehouse' && bakery.ambience.includes('fire') === !purchase, 'Wrong oven sound');
      await pick(meal);
      check(current.id === 'rent', 'The inn did not reopen after the market');
    }
  }
  await enterMarket();
  await pick(0);
  await pick(0);
  await pick(1);
  Math.random = () => .35;
  for (let i = 0; current.id !== 'wash-cart' && i < 45; i++) {
    const side = {'water-mark':0, 'ferry-bell':1}[current.id];
    await pick(side ?? Number(risk(forecasts[1]) < risk(forecasts[0])));
  }
  check(current.id === 'wash-cart' && flags.has('washer-fed'), 'The laundress forgot her place by the oven');
  const atDoor = localStorage.getItem(runKey);
  el('desk-journal').click();
  check(el('story-notes').textContent.includes('тележку'), 'The journal missed the market favour at the flood');
  el('journal-back').click();
  check(localStorage.getItem(runKey) === atDoor && current.id === 'wash-cart', 'Reading the journal moved the visit');
  await morningAfterFlood('linen-flour');
  for (const [place, destination] of ['loaf-hall','loaf-street'].entries()) {
    for (const side of [0,1]) {
      await startStory('first-loaf');
      check(el('line').textContent === current.line, 'Standalone bake inherited an earlier flood');
      await pick(place);
      check(current.id === destination, 'Bread delivered to the wrong place');
      if (place) {
        const scene = audioScene(current,phase,false);
        check(document.body.dataset.room === 'lower-street' && scene.ambience.join() === 'river', 'Wrong morning street');
      }
      const note = current.choices[side].flag;
      await pick(side);
      check(current.id === 'rent' && flags.has(note) && storyMarks.has(note), 'Missing outcome for the loaf');
    }
  }
  await enterMarket();
  await pick(1, 'Следующий гость');
  check(current.id === 'rent', 'Declining the errand still opened the market');
  Math.random = () => .999999;
  await pick(0);
  await pick(0);
  check(!current.id.startsWith('market-'), 'The market invitation repeated');

  // Accept the market errand while both payroll and the cooper's repair are outstanding.
  restart();
  await ready();
  Math.random = () => .055;
  await pick(1);
  await pick(0);
  check(current.id === 'hoops', 'Missing cooper before the market');
  Math.random = () => .999999;
  await pick(0);
  check(current.id === 'market-kindling', 'The invitation is missing from ordinary play');
  await pick(0);
  await pick(1);
  await pick(1);
  check(current.id === 'payroll' && returnVisits[0]?.id === 'beer-basin', 'Market lost an earlier appointment');
  for (let i = 0; current.id !== 'beer-basin' && i < 12; i++) {
    await pick(Number(risk(forecasts[1]) < risk(forecasts[0])));
  }
  check(current.id === 'beer-basin', 'The promised repair never returned after the market');

  // A fresh run must also discard a destination chosen on a still-open consequence.
  await enterMarket();
  buttons[0].click();
  await ready();
  check(phase === 'paper', 'Missing travel consequence');
  el('reset').click();
  await ready();
  await pick(0);
  check(current.id === 'curtains', 'A market transition leaked into a new run');

  async function payForSupper(side) {
    const visit = turn;
    const gold = values.gold, reputation = values.reputation;
    buttons[side].click();
    await ready();
    check(phase === 'guest' && turn === visit + 1 && el('paper').hidden, 'Supper took an extra page');
    const fee = side ? balance.step : -balance.step;
    check(values.gold === gold + fee && values.reputation === reputation - fee, 'Wrong supper price');
  }

  for (const [bill, echo] of ['bell-bowls','bell-receipt'].entries()) {
    restart();
    await ready();
    Math.random = () => .94;
    await pick(1);
    await pick(0);
    check(current.id === 'late-bell', 'Supper dispute is missing from ordinary play');
    Math.random = () => 0;
    await payForSupper(bill);
    check(current.id === 'bread' && el('line').textContent === current.line, 'Bread mentioned the clock too soon');
    await pick(0);
    check(current.id === 'payroll', 'Supper displaced the payroll appointment');
    for (let i = 0; current.id !== echo && i < 16; i++) {
      await pick(Number(risk(forecasts[1]) < risk(forecasts[0])));
    }
    check(current.id === echo, 'The promised supper guest never came');
  }

  const sounds = [];
  const playSound = sound;
  sound = key => { sounds.push(key); playSound(key); };
  for (const [bill, echo] of ['bell-bowls','bell-receipt'].entries()) {
    for (const outcome of [0, 1]) {
      await startStory('late-bell');
      check(!settings.open && turn === 1 && current.id === 'late-bell', 'Supper shortcut did not restart');
      sounds.length = 0;
      await payForSupper(bill);
      check(current.id === 'rent' && returnVisits[0]?.id === echo, 'Wrong supper promise');
      await pick(1);
      check(current.id === 'quarters', 'Supper interrupted an appointment');
      await pick(0);
      check(current.id === echo && returnVisits.length === 0, 'Supper echo missed its free slot');
      check(el('portrait').hidden && el('scene').src.endsWith('/' + echo + '.webp'), 'Wrong supper illustration');
      const kitchen = audioScene(current,phase,chaptersById.has(current.id));
      check(kitchen.music === 'bakehouse' && kitchen.ambience.includes('fire'), 'Wrong supper room audio');
      const expected = current.choices[outcome].passage;
      buttons[outcome].click();
      await ready();
      check(phase === 'paper' && el('passage').textContent === expected, 'Wrong supper consequence');
      check(sounds.filter(key => key === 'bowl_tap').length === Number(bill === 0), 'Misplaced bowl tap');
      check(sounds.filter(key => key === 'clock_hook').length === Number(bill === 1 && outcome === 0), 'Misplaced hook sound');
      Math.random = () => 0;
      el('advance').click();
      await ready();
      check(current.id === 'bread', 'Expected an ordinary visit from the baker');
      const clockGone = bill === 1 && outcome === 0;
      check(flags.has('clock-at-treasury') === clockGone, 'Wrong kitchen clock state');
      const breadLine = clockGone ? current.variants['clock-at-treasury'] : pressureLine(current) ?? current.line;
      check(el('line').textContent === breadLine, 'Bread ignored the fate of the clock');
    }
  }
  sound = playSound;

  for (const [side, landing] of ['ferry-watch','ferry-window'].entries()) {
    restart(ferryCards[0]);
    await ready();
    await pick(0, 'Дальше');
    check(current.id === 'ferry-oars', 'Missing ferry crossing');
    await pick(side, 'Дальше');
    check(current.id === landing, 'Wrong ferry landing');
    await pick(1 - side, 'Вернуться в таверну');
    check(current.id === 'rent', 'Ferry did not return to the inn');
  }
}

const game = path.resolve(__dirname, '../game');
const browser = process.argv[2] || [
  path.join(process.env['ProgramFiles(x86)'] || '', 'Microsoft/Edge/Application/msedge.exe'),
  path.join(process.env.ProgramFiles || '', 'Google/Chrome/Application/chrome.exe'),
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/chromium', '/usr/bin/google-chrome'
].find(file => fs.existsSync(file));
if (!browser) throw Error('Pass the path to Edge or Chrome as the first argument.');

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'inn-visits-'));
try {
  const test = 'const output = document.getElementById("result"); (' + testVisits.toString() +
    ')().then(() => output.textContent = "PASS", e => output.textContent = e.message)';
  const page = fs.readFileSync(path.join(game, 'index.html'), 'utf8')
    .replace('<head>', '<head><base href="' + pathToFileURL(game + path.sep).href + '">')
    .replace('</body>', '<pre id="result">PENDING</pre><script>' + test + '</script></body>');
  const file = path.join(temp, 'visits.html');
  fs.writeFileSync(file, page);
  const run = spawnSync(browser, ['--headless', '--disable-gpu', '--no-first-run', '--force-prefers-reduced-motion',
    '--disable-background-networking', '--user-data-dir=' + path.join(temp, 'profile'),
    '--virtual-time-budget=120000', '--dump-dom', pathToFileURL(file).href], {encoding:'utf8', timeout:60000});
  if (run.error) throw run.error;
  assert.equal(run.status, 0, run.stderr);
  assert.equal(run.stdout.match(/<pre id="result">([^<]*)<\/pre>/)?.[1], 'PASS');
  console.log('OK: cooper, flood, market, ferry, supper, morning bread, journal, sound, appointments and restart');
} finally {
  fs.rmSync(temp, {recursive:true, force:true, maxRetries:5, retryDelay:200});
}
