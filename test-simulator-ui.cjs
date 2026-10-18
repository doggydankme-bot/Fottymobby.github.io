const assert=require('node:assert/strict'),boot=require('./test-integration.cjs');
(async()=>{
 const app=boot(),run=app.run;
 // Reproducible clock/manual-sub coverage; real injury replacements remain enabled.
 run('globalThis.startForUiTest=MatchSimulator.start;MatchSimulator.start=(m,db)=>startForUiTest(m,db,193)');
 for(const side of ['home','away']){run(`editReserve('${side}');$('reserve-name').value='${side} substitute';$('reserve-position').value='FWD';$('reserve-rating').value='7.4';$('reserve-photo').files=[]`);await run("reserveForm.onsubmit({preventDefault(){}})")}
 assert.equal(run('state.teams.home.bench.length'),1);assert.equal(run('state.teams.away.bench.length'),1);
 run("currentMatch().status='UPCOMING';$('sim-speed').value='10';$('sim-ai-home').checked=false;$('sim-ai-away').checked=false;$('sim-start').onclick()");
 assert.equal(run('currentMatch().simulation.speed'),10);assert.equal(run('currentMatch().simulation.ai.home'),false);assert.equal(run('currentMatch().simulation.minute'),0);
 const tick=()=>{const id=run('simulationTimer'),timer=app.timers.get(id);assert.ok(timer);app.timers.delete(id);timer.fn()};
 tick();assert.equal(run('currentMatch().simulation.minute'),1);
 for(const speed of [1,2,3,5,10,3])run(`$('sim-speed').value='${speed}';$('sim-speed').onchange()`);
 assert.equal([...app.timers.values()].filter(t=>t.delay<=1000).length,1);assert.equal(run('currentMatch().simulation.minute'),1);
 run("$('sim-pause').onclick()");assert.equal(run('simulationTimer'),null);assert.equal(run('currentMatch().simulation.paused'),true);
 run("$('sim-resume').onclick()");for(let i=1;i<20;i++)tick();assert.equal(run('currentMatch().simulation.minute'),20);
 run("switchSide('home');globalThis.offId=state.players.find(p=>!p.sentOff).playerId;openManual(offId);$('manual-bench').value=state.teams.home.bench[0].playerId;$('confirm-sub').onclick()");
 assert.equal(run('currentMatch().simulation.subCount.home'),1);assert.equal(run('state.teams.home.substituted.length'),1);assert.equal(run('state.teams.home.bench.length'),0);assert.equal(run('currentMatch().simulation.events.at(-1).type'),'substitution');assert.equal(run('manualTarget'),null);
 while(run('currentMatch().simulation.minute')<45)tick();assert.equal(run('currentMatch().simulation.phase'),'HT');assert.equal(run('simulationTimer'),null);
 const reloaded=boot(new Map(app.storage));assert.equal(reloaded.run('currentMatch().simulation.minute'),45);assert.equal(reloaded.run('currentMatch().simulation.paused'),true);assert.equal(reloaded.run('simulationTimer'),null);assert.equal(reloaded.run('state.teams.home.substituted.length'),1);
 run("$('sim-resume').onclick()");while(run('currentMatch().simulation.phase')!=='FT')tick();assert.equal(run('simulationTimer'),null);assert.equal(run('currentMatch().status'),'FT');assert.equal(run("currentMatch().simulation.events.filter(e=>e.type==='fulltime').length"),1);assert.equal(run("FootballStats.appearances(library,currentMatch().homeId).length"),12);assert.equal(run("FootballStats.appearances(library,currentMatch().awayId).length"),run("11+currentMatch().simulation.events.filter(e=>e.type==='substitution'&&e.side==='away'&&e.minute<90).length"));
 assert.equal(run('state.teams.home.substituted[0].minutes'),20);assert.equal(run("state.teams.home.players.find(p=>p.name==='home substitute').minutes"),70);assert.equal(run("clubById(currentMatch().homeId).squad.players.some(p=>p.name==='home substitute')"),false);assert.equal(run("clubById(currentMatch().homeId).squad.bench.length"),1);
 const finished=boot(new Map(app.storage));assert.equal(finished.run('currentMatch().simulation.phase'),'FT');assert.equal(finished.run('state.teams.home.substituted.length'),1);assert.equal(finished.run('FootballStats.appearances(library,currentMatch().homeId).length'),12);
 run('createMatch()');assert.equal(run('state.teams.home.bench.length'),1);assert.equal(run('state.teams.home.substituted.length'),0);assert.equal(run('state.teams.home.players.every(p=>p.minutes===null)'),true);
 console.log('Passed: bench editing, selected speed/AI, single timer under speed changes, pause/resume, manual substitution, halftime reload, 90-minute finish, saved timeline/participants, shared profiles and original squad templates for new matches.');
})().catch(error=>{console.error(error);process.exitCode=1});
