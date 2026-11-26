const assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const dir=path.join(__dirname,'../game');
const read=n=>fs.readFileSync(path.join(dir,n),'utf8');
const scripts=['config.js','cards.js','ferry.js','high-water.js','market.js','seven-minutes.js','first-loaf.js','old-gods.js','folklore.js','chapter.js'];
const d=vm.runInNewContext(scripts.map(read).join('\n')+'\n;({deck,stats,guests,oldGodsWalkIns,folkloreCards})');
assert.equal(d.folkloreCards.length,10);
assert.equal(new Set(d.deck.map(c=>c.id)).size,d.deck.length);
for(const c of d.folkloreCards){
  assert.ok(d.oldGodsWalkIns.includes(c)&&d.guests[c.guest]&&c.once);
  assert.equal(c.choices.length,2);
  for(const o of c.choices){
    for(const stat of Object.keys(o.effects)) assert.ok(stat in d.stats);
    if(o.visitNow){const n=d.folkloreCards.find(x=>x.id===o.visitNow);assert.ok(n);assert.equal(n.requires,o.flag);assert.equal(n.guest,c.guest);}
  }
  if(read('index.html').includes('src="folklore.js"')) assert.ok(fs.existsSync(path.join(dir,'art',c.illustration)),c.illustration);
}
console.log('OK: 5 folklore guests, 10 visits and conditional links');
