const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const dir = path.join(__dirname,'../game');
const read = name => fs.readFileSync(path.join(dir,name),'utf8');
const scripts = [...read('index.html').matchAll(/<script\s+src="([^"]+)"/g)].map(m=>m[1]);
const data = scripts.filter(n=>!['audio.js','engine.js','inn-menu.js'].includes(n)).map(read).join('\n');
const ctx = vm.createContext({});
vm.runInContext(data,ctx);
const result = vm.runInContext(`({deck,oldGodsChapter,oldGodsWalkIns,oldGodsEndings,guests,stats,chapterCards,houseCards,sevenMinutesCards,marketCards})`,ctx);
const {deck,oldGodsChapter,oldGodsWalkIns,oldGodsEndings,guests,stats}=result;
const all = [...oldGodsChapter,...oldGodsWalkIns], byId = new Map(all.map(c=>[c.id,c]));
assert.equal(new Set(deck.map(c=>c.id)).size,deck.length);
for(const c of all){
  assert.ok(guests[c.guest]);
  assert.ok(c.illustration && fs.existsSync(path.join(dir,'art',c.illustration)));
  assert.equal(c.choices.length,2);
  for(const o of c.choices){
    for(const k of Object.keys(o.effects)) assert.ok(k in stats);
    for(const k of ['visitNow','next','returnVisit']) if(o[k]) assert.ok(byId.has(o[k]),o[k]);
    if(o.ending) assert.ok(oldGodsEndings[o.ending]);
  }
}
const endings = new Set(), visited = new Set();
function visit(id, route=[]){
  assert.ok(!route.includes(id),'cycle in main story');
  visited.add(id);
  for(const o of byId.get(id).choices){
    if(o.ending) endings.add(o.ending);
    else visit(o.visitNow || o.next || byId.get(id).next,[...route,id]);
  }
}
visit(oldGodsChapter[0].id);
assert.equal(visited.size,oldGodsChapter.length);
assert.equal(endings.size,Object.keys(oldGodsEndings).length);
for(const e of Object.values(oldGodsEndings)) assert.ok(fs.existsSync(path.join(dir,'art',e.art)));
// Execute the actual selector from engine.js, not a reimplementation.
const engine = read('engine.js');
const selector = engine.slice(engine.indexOf('function oldGodsRun()'),engine.indexOf('function setPreview('));
vm.runInContext(`
const cardsById=new Map(deck.map(c=>[c.id,c]));
const chaptersById=new Map([...chapterCards,...highWaterCards,...barrelReturns,...marketCards,...oldGodsChapter].map(c=>[c.id,c]));
const walkIns=[...houseCards,sevenMinutesCards[0],marketCards[0]];
let seen=new Set(),flags=new Set(),recent=[],returnVisits=[],pendingVisit=null,immediateVisit=null,turn=1;
function drawWeight(){return 1;}
`+selector+`
function checkRoutes(){
  if(nextCard()!==chapterCards[0]) throw Error('Classic opening changed');
  seen.add(oldGodsChapter[0].id);
  for(let i=0;i<100;i++) if(!oldGodsWalkIns.includes(nextCard())) throw Error('Classic card leaked into fantasy');
  pendingVisit={id:oldGodsChapter[3].id,due:1};
  if(nextCard()!==oldGodsChapter[3]) throw Error('Appointment lost');
  immediateVisit=oldGodsChapter[4].id;
  if(nextCard()!==oldGodsChapter[4]) throw Error('Immediate visit lost');
  seen=new Set(JSON.parse(JSON.stringify([...seen])));
  if(!oldGodsRun()) throw Error('Mode lost after save restoration');
  seen=new Set([chapterCards[0].id]);
  if(oldGodsRun()) throw Error('Fantasy mode leaked into classic');
  for(let i=0;i<100;i++) if(oldGodsWalkIns.includes(nextCard())) throw Error('Fantasy card leaked into classic');
  return true;
}
`,ctx);
assert.equal(vm.runInContext('checkRoutes()',ctx),true);
console.log('OK:',all.length,'fantasy cards,',endings.size,'endings; separate selector, links and assets');
