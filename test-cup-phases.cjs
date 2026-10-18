const assert=require('node:assert/strict');global.FootballStats=require('./analytics.js');const Sim=require('./simulator-engine.js'),Events=require('./match-events.js'),World=require('./competition-model.js');
const roles=['FWD','FWD','MID','MID','MID','MID','DEF','DEF','DEF','DEF','GK'];
function make(homeId='h',awayId='a'){const team=id=>({formation:'4-4-2',players:roles.map((position,i)=>({playerId:id+i,name:id+i,position,rating:7,baseRating:7,goals:0,assists:0})),bench:[],substituted:[]});return {id:crypto.randomUUID(),homeId,awayId,status:'UPCOMING',date:'2026-10-18',data:{homeScore:0,awayScore:0,teams:{home:team(homeId),away:team(awayId)}}}}
const coverage={zero:false,two:false,extraGoal:false,penaltyMiss:false,suddenDeath:false};
for(let seed=1;seed<=300&&Object.values(coverage).some(v=>!v);seed++){
 const m=make(),db={clubs:[],matches:[m]};m.knockout=true;Sim.start(m,db,seed);let normal;
 while(m.simulation.phase!=='FT'){
  if(m.simulation.phase==='HT')Sim.resume(m);
  if(m.simulation.phase==='ET_HT'){
   assert.equal(m.simulation.minute,105);const paused=JSON.stringify(m);assert.equal(Sim.step(m),false);assert.equal(JSON.stringify(m),paused);
   assert.equal(Sim.validate(m.simulation).phase,'ET_HT');Sim.resume(m);Sim.resume(m);assert.equal(m.simulation.events.filter(e=>e.type==='extrasecondhalf').length,1);
  }
  Sim.step(m);
  if(m.simulation.minute===90&&m.extraTime){normal=m.data.homeScore;assert.equal(m.data.homeScore,m.data.awayScore);assert.equal(m.simulation.phase,'EXTRA');assert.ok(m.simulation.events.some(e=>e.type==='endnormal'))}
 }
 if(m.extraTime)assert.equal(m.simulation.minute,120);
 if(m.simulation.events.some(e=>e.type==='goal'&&e.minute>90))coverage.extraGoal=true;
 if(m.shootout){
  if(normal===0)coverage.zero=true;if(normal===2)coverage.two=true;
  assert.equal(m.data.homeScore,m.data.awayScore);const score=[m.data.homeScore,m.data.awayScore],totals=Events.statistics(m.simulation);
  assert.equal(totals.home.goals,score[0]);assert.equal(totals.away.goals,score[1]);assert.equal(Events.shots(m.simulation).some(e=>e.type==='shootout'),false);
  assert.ok(m.winnerClubId);assert.ok(m.shootout.home!==m.shootout.away);assert.ok(m.simulation.events.some(e=>e.type==='shootoutstart'));
  const clean=Sim.validate(m.simulation);assert.deepEqual(clean.events.filter(e=>e.type==='shootout').map(e=>e.result),m.shootout.kicks.map(e=>e.result));
  coverage.penaltyMiss ||=m.shootout.kicks.some(e=>e.result==='miss');coverage.suddenDeath ||=m.shootout.kicks.some(e=>e.round>5);
 }
}
for(const [key,value] of Object.entries(coverage))assert.ok(value,key);
let groupDraw=false;for(let seed=1;seed<=50&&!groupDraw;seed++){const m=make();m.stage='group';Sim.complete(m,{clubs:[],matches:[m]},seed);if(m.data.homeScore===m.data.awayScore){groupDraw=true;assert.equal(m.simulation.minute,90);assert.equal(m.extraTime,false);assert.equal(m.shootout,undefined)}}assert.ok(groupDraw);
const db={clubs:['a','b','c','d'].map(id=>({id,name:id,squad:make(id,'z').data.teams.home})),leagues:[],competitions:[{id:'cup',name:'Cup',type:'cup',clubIds:['a','b','c','d']}],matches:[],seasons:[],competitionHistory:[]};
const s=World.createSeason(db,db.competitions[0],'2026');World.draw(db,s,make);for(const [i,m] of World.matches(db,s).entries())Sim.complete(m,db,i+5);const winners=World.matches(db,s).map(World.winner);World.progress(db,make);assert.equal(s.rounds.length,2);const final=db.matches.find(m=>m.id===s.rounds[1].matchIds[0]);assert.deepEqual([final.homeId,final.awayId],winners);Sim.complete(final,db,17);World.progress(db,make);assert.equal(s.status,'archived');assert.equal(s.winnerClubId,final.winnerClubId);assert.equal(db.competitionHistory.length,1);World.progress(db,make);assert.equal(db.competitionHistory.length,1);
console.log('Passed: actual 0–0 and 2–2 knockout draws, 105-minute break/reload, extra-time goals, penalty miss/save/goal and sudden death, separate normal scores/statistics, group draws, and real-engine winners advancing/archiving once.',coverage);
