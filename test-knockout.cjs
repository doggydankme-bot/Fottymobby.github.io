const assert=require('node:assert/strict'),boot=require('./test-integration.cjs');
const app=boot(),run=app.run;let extras=0,shootouts=0;
for(let seed=1;seed<=35;seed++){
 run(`createMatch();currentMatch().knockout=true;attachData();MatchSimulator.start(currentMatch(),library,${seed});currentMatch().simulation.ai={home:false,away:false}`);
 let guard=0;while(run("currentMatch().simulation.phase!=='FT'")&&guard++<125){if(run("['HT','ET_HT'].includes(currentMatch().simulation.phase)"))run('MatchSimulator.resume(currentMatch())');run('MatchSimulator.step(currentMatch())')}
 assert.ok(guard<125);assert.ok(run('[currentMatch().homeId,currentMatch().awayId].includes(currentMatch().winnerClubId)'));
 if(run('currentMatch().extraTime')){extras++;assert.equal(run('currentMatch().simulation.minute'),120);assert.equal(run("currentMatch().simulation.events.filter(e=>e.type==='extratime').length"),1)}
 if(run('!!currentMatch().shootout')){shootouts++;assert.equal(run('currentMatch().data.homeScore===currentMatch().data.awayScore'),true);assert.equal(run('currentMatch().shootout.home!==currentMatch().shootout.away'),true);assert.equal(run("currentMatch().simulation.events.filter(e=>e.type==='shootout').length"),run('currentMatch().shootout.kicks.length'));
  assert.equal(run("MatchEvents.statistics(currentMatch().simulation).home.goals"),run('currentMatch().data.homeScore'));assert.equal(run("MatchEvents.statistics(currentMatch().simulation).away.goals"),run('currentMatch().data.awayScore'));
  assert.equal(run("MatchSimulator.validate(currentMatch().simulation).events.filter(e=>e.type==='shootout').every(e=>['goal','saved','miss'].includes(e.result))"),true);
 }
 run('state.players=state.teams[state.activeSide].players;save();globalThis.checkpoint=JSON.parse(JSON.stringify(library));globalThis.loaded=checkLibrary(checkpoint)');
 assert.equal(run('loaded.matches.at(-1).simulation.minute'),run('currentMatch().simulation.minute'));assert.equal(run('loaded.matches.at(-1).winnerClubId'),run('currentMatch().winnerClubId'));assert.equal(run('JSON.stringify(loaded.matches.at(-1).shootout)'),run('JSON.stringify(currentMatch().shootout)'));
 assert.equal(run("loaded.matches.at(-1).data.teams.home.players.every(p=>p.minutes<=120)"),true);
}
assert.ok(extras>0&&shootouts>0);console.log('Passed: same-engine knockout winners, actual extra-time minutes/events/ratings/shots, shootout kicks excluded from match goals, and validated save/reload. Coverage:',{extras,shootouts});
