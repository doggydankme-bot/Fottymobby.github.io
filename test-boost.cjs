const assert=require('node:assert/strict');
global.FootballStats=require('./analytics.js');
const Sim=require('./simulator-engine.js');
function fixture(side,boosted,rating=7){
 const team=(prefix,strength)=>({formation:'4-4-2',players:['FWD','FWD','MID','MID','MID','MID','DEF','DEF','DEF','DEF','GK'].map((position,i)=>({playerId:prefix+i,name:prefix+i,position,rating:strength,goals:0,assists:0})),bench:[],substituted:[]});
 const m={id:'boost-test',homeId:'h',awayId:'a',date:'2026-10-18',status:'UPCOMING',setupBoost:{home:false,away:false},data:{homeScore:0,awayScore:0,teams:{home:team('h',side==='home'?rating:7),away:team('a',side==='away'?rating:7)}}};
 m.setupBoost[side]=boosted;
 return {m,db:{matches:[m],clubs:[]}};
}
for(const side of ['home','away']){
 const {m,db}=fixture(side,true);Sim.start(m,db,42);
 assert.equal(m.simulation.boost[side],true);
 const boosted=Sim.strength(m,side);m.simulation.boost[side]=false;
 assert.ok(Math.abs(boosted-Sim.strength(m,side)-1.5)<1e-9);
 const normal=Sim.strength(m,side);m.simulation.boost[side]=true;
 m.simulation=Sim.validate(m.simulation);
 assert.equal(m.simulation.boost[side],true);
 assert.equal(Sim.strength(m,side),boosted);
 m.simulation.boost[side]=false;assert.equal(Sim.strength(m,side),normal);
}
const results=[];
for(const side of ['home','away'])for(const rating of [7,6.2]){
 const totals={normal:{wins:0,goals:0,conceded:0,shots:0},boosted:{wins:0,goals:0,conceded:0,shots:0}};
 for(let seed=1;seed<=300;seed++)for(const mode of ['normal','boosted']){
  const {m,db}=fixture(side,mode==='boosted',rating);Sim.start(m,db,seed);
  while(m.simulation.phase!=='FT'){if(m.simulation.phase==='HT')Sim.resume(m);Sim.step(m)}
  const other=side==='home'?'away':'home',own=m.data[side+'Score'],against=m.data[other+'Score'],t=totals[mode];
  t.wins+=own>against;t.goals+=own;t.conceded+=against;
  t.shots+=m.simulation.events.filter(e=>e.type==='shot'&&e.side===side).length;
  for(const s of ['home','away'])assert.equal(m.simulation.events.filter(e=>e.type==='goal'&&e.side===s).length,m.data[s+'Score']);
 }
 assert.ok(totals.boosted.wins>totals.normal.wins+60,JSON.stringify(totals));
 assert.ok(totals.boosted.goals>totals.normal.goals*1.5);
 assert.ok(totals.boosted.shots>totals.normal.shots*1.2);
 assert.ok(totals.boosted.conceded<totals.normal.conceded);
 results.push({side,rating,...totals});
}
console.log('Passed: kickoff boost, both sides, switch off, saved boost, canonical scores; 300 paired seeds per scenario:',JSON.stringify(results));
