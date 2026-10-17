const assert=require('node:assert/strict'),S=require('./analytics.js');
const player=(id,rating,position='FWD',goals=0)=>({playerId:id,name:id,number:id==='p1'?9:10,rating,position,goals,assists:1,missed:2,sub:'',card:'second-yellow',star:false});
const team=players=>({formation:'4-4-2',players});
const p=player('p1',8),q=player('p2',9,'MID');
const db={clubs:['a','b','c'].map(id=>({id,name:id,squad:team(id==='a'?[p,q]:[player(id+'p',6)])})),leagues:[],matches:[]};
function match(id,h,a,hg,ag,status='FT',leagueId=''){return {id,homeId:h,awayId:a,status,date:'2026-10-17',leagueId,competition:'League',data:{homeScore:hg,awayScore:ag,teams:{home:team([player(h==='a'?'p1':h+'p',8,'FWD',1),...(h==='a'?[q]:[])]),away:team([player(a==='a'?'p1':a+'p',6,'FWD',2)])}}}}
db.matches=[match('1','a','b',3,1),match('2','c','a',0,0),match('3','a','b',9,0,'UPCOMING'),match('4','a','b',4,0,'LIVE')];
const a=S.summarize(S.appearances(db,'a','p1'));assert.equal(a.matches,3);assert.equal(a.rating,22/3);assert.equal(a.goals,4);assert.equal(a.missed,6);assert.equal(a.yellows,6);assert.equal(a.reds,3);
const league={id:'l1',name:'League',clubIds:['a','b','c']};let table=S.table(db,league);assert.equal(table[0].id,'a');assert.equal(table[0].played,2);assert.equal(table[0].points,4);assert.equal(table[0].gd,2);assert.equal(table[0].gf,3);
db.matches.push(match('5','b','c',10,0,'FT','other'));assert.equal(S.table(db,league).find(r=>r.id==='b').played,1);
assert.equal(S.table(db,{...league,clubIds:['a','b']}).find(r=>r.id==='a').played,1);
const xi=S.bestXI(db,'a');assert.equal(xi.rows.find(r=>r.position==='MID').players[0].player.playerId,'p2');assert.equal(xi.rows.find(r=>r.position==='FWD').players[0].stats.rating,22/3);
db.clubs[0].squad.formation='4-2-3-1';assert.deepEqual(S.bestXI(db,'a').rows.map(r=>r.count),[1,3,2,4,1]);
const tieDb={...db,matches:[match('t1','a','c',2,0),match('t2','b','c',3,1)]};assert.equal(S.table(tieDb,league)[0].id,'b');
const renamed={...p,name:'Renamed striker'};db.clubs[0].squad.players[0]=renamed;assert.equal(S.players(db,'a').find(p=>p.player.playerId==='p1').stats.matches,3);
const oldDb=structuredClone(db);for(const c of oldDb.clubs)for(const p of c.squad.players)delete p.playerId;for(const m of oldDb.matches)for(const t of Object.values(m.data.teams))for(const p of t.players)delete p.playerId;S.migrate(oldDb);assert.ok(oldDb.matches[0].data.teams.home.players[0].playerId);assert.equal(oldDb.matches[0].data.teams.home.players[0].playerId,oldDb.matches[1].data.teams.away.players[0].playerId);
for(const size of [2,3,4,5,8]){const ids=Array.from({length:size},(_,i)=>String(i)),fixtures=S.fixtures(ids,10);assert.equal(fixtures.length,10);assert.ok(fixtures.every(f=>f.homeId!==f.awayId&&ids.includes(f.homeId)&&ids.includes(f.awayId)));for(const round of new Set(fixtures.map(f=>f.round))){const clubs=fixtures.filter(f=>f.round===round).flatMap(f=>[f.homeId,f.awayId]);assert.equal(new Set(clubs).size,clubs.length)}assert.deepEqual(S.fixtures(ids,20).slice(10),S.fixtures(ids,10,10))}assert.throws(()=>S.fixtures(['only'],10));
console.log('Passed: match analytics, table filters/tie-breaks, migration and 10-fixture scheduling for even/odd leagues, no self-matches, no matchday conflicts and continuation.');
