const assert=require('node:assert/strict'),boot=require('./test-integration.cjs');
function setup(){const app=boot();app.run(`createMatch();globalThis.m=currentMatch();m.setupBoost={home:true,away:false}`);return app}
function completed(app){const {run}=app;assert.equal(run('currentMatch().status'),'FT');assert.equal(run('currentMatch().simulation.phase'),'FT');assert.equal(run('simulationTimer'),null);assert.equal(run("currentMatch().simulation.events.filter(e=>e.type==='fulltime').length"),1);assert.equal(run("currentMatch().simulation.events.filter(e=>e.type==='secondhalf').length"),1);assert.equal(run("['home','away'].every(side=>currentMatch().simulation.events.filter(e=>e.type==='goal'&&e.side===side).length===currentMatch().data[side+'Score'])"),true);assert.equal(run("$('sim-auto').disabled"),true)}
// New match uses the normal start path and persists the same match record.
{
 const app=setup();app.run("$('sim-auto').onclick()");completed(app);assert.equal(app.run('m.simulation.boost.home'),true);assert.equal(app.run('m.simulation.minute'),90);
 const reloaded=boot(app.storage);assert.equal(reloaded.run('currentMatch().status'),'FT');assert.equal(reloaded.run('currentMatch().data.homeScore'),app.run('m.data.homeScore'));
 app.run("globalThis.before=JSON.stringify(currentMatch());$('sim-auto').onclick()");assert.equal(app.run('JSON.stringify(currentMatch())'),app.run('before'));
}
// Running, paused and half-time matches continue existing events instead of restarting.
for(const minute of [12,30,45]){
 const app=setup();app.run(`attachData();MatchSimulator.start(m,library,42);for(let i=0;i<${minute};i++)MatchSimulator.step(m);m.simulation.paused=${minute!==12};globalThis.beforeEvents=JSON.stringify(m.simulation.events);save();scheduleTick();$('sim-auto').onclick()`);completed(app);
 assert.equal(app.run('JSON.stringify(m.simulation.events.slice(0,JSON.parse(beforeEvents).length))'),app.run('beforeEvents'));
}
// Real knockout simulations must continue through extra time and a shootout.
{
 let extra=false,pens=false;
 for(let seed=1;seed<=20&&!pens;seed++){
  const app=setup();app.run(`m.knockout=true;m.setupBoost={home:false,away:false};attachData();MatchSimulator.start(m,library,${seed});m.simulation.ai={home:false,away:false};$('sim-auto').onclick()`);completed(app);
  if(app.run('m.extraTime')){extra=true;assert.equal(app.run('m.simulation.minute'),120)}
  if(app.run('!!m.shootout')){pens=true;assert.equal(app.run('m.shootout.kicks.length>0'),true);assert.equal(app.run('m.data.homeScore===m.data.awayScore'),true);assert.equal(app.run('m.shootout.home!==m.shootout.away'),true)}
 }
 assert.ok(extra&&pens);
}
// Cancellation must not replace completed/manual results.
{
 const app=boot();app.run("confirm=()=>false;globalThis.before=JSON.stringify(currentMatch());$('sim-auto').onclick()");assert.equal(app.run('JSON.stringify(currentMatch())'),app.run('before'));
}
console.log('Passed: Auto Sim starts/continues/finishes the shared match, bypasses HT/pause, preserves events and boosts, stops timers, saves/reloads FT and protects finished matches.');
