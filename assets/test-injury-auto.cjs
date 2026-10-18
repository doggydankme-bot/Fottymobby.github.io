const assert=require('node:assert/strict'),boot=require('./test-integration.cjs');
function setup(){const app=boot();app.run(`library.facePack=Array.from({length:40},(_,i)=>({id:'face'+i,photo:'data:image/png;base64,'+i,gender:'male',tier:'gold',kind:'head'}));generateClubBench(currentMatch().homeId);attachData();MatchSimulator.start(currentMatch(),library,91);globalThis.m=currentMatch();globalThis.t=m.data.teams.home;m.simulation.ai={home:false,away:false}`);return app}
for(const severity of ['minor','serious']){
 const {run}=setup();run(`globalThis.off=t.players.find(p=>p.position==='MID');off.injury='${severity}';off.injuredAt=0;MatchSimulator.step(m)`);
 assert.equal(run('t.players.includes(off)'),false);
 assert.equal(run('t.substituted.includes(off)'),true);
 assert.equal(run('m.simulation.events.filter(e=>e.type===\'substitution\'&&e.playerId===off.playerId).length'),1);
 assert.equal(run('off.minutes'),0);
 assert.equal(run('m.simulation.subCount.home'),1);
}
// An incoming substitute may only be removed automatically if injured.
{
 const {run}=setup();run(`globalThis.off=t.players.find(p=>p.position==='FWD');globalThis.on=t.bench.find(p=>p.position==='FWD');MatchSimulator.substitute(m,'home',off.playerId,on.playerId,true);on.injury='minor';MatchSimulator.step(m)`);
 assert.equal(run('t.players.includes(on)'),false);
 assert.equal(run('m.simulation.subCount.home'),2);
 assert.equal(run('m.simulation.events.filter(e=>e.type===\'substitution\'&&e.playerId===on.playerId).length'),1);
}
for(const blocked of ['limit','bench','keeper']){
 const {run}=setup();run(`globalThis.off=t.players.find(p=>p.position==='GK');off.injury='serious';off.injuredAt=0;${blocked==='limit'?"m.simulation.subCount.home=5":blocked==='bench'?"t.bench=[]":"t.bench=t.bench.filter(p=>p.position!=='GK')"};MatchSimulator.step(m)`);
 assert.equal(run('t.players.includes(off)'),true);
 assert.equal(run('off.minutes'),0);
 assert.equal(run("m.simulation.events.filter(e=>e.type==='substitution').length"),0);
}
{
 const {run,document}=setup();run(`state.players[0].injury='minor';refreshSimulation();refreshSimulation()`);
 const badges=document.querySelectorAll('.player .injury-badge');assert.equal(badges.length,1);assert.ok(badges[0].querySelector('svg'));assert.equal(badges[0].textContent,'');
}
console.log('Passed: centred SVG injury cross, automatic minor/serious injury replacement with tactical AI off, injured incoming substitutes, correct events/minutes, substitution limit and keeper coverage.');
