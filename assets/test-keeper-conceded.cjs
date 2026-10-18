const assert=require('node:assert/strict'),boot=require('./test-integration.cjs');const app=boot(),{run}=app;
run(`createMatch();attachData();MatchSimulator.start(currentMatch(),library,42);globalThis.m=currentMatch(),k=m.data.teams.away.players.find(p=>p.position==='GK');k.minutes=90;k.appeared=true;m.simulation.events=[];m.simulation.phase='FT';m.simulation.minute=90;m.status='FT';m.data.homeScore=3;m.data.awayScore=0;
for(let i=0;i<6;i++)m.simulation.events.push({id:'shot'+i,type:i<3?'goal':'shot',shot:true,minute:10+i,side:'home',playerId:m.data.teams.home.players[0].playerId,result:i<3?'goal':'saved',keeperId:i<3?'':k.playerId,target:{x:.2+i*.1,y:.5},xG:.2,xGOT:.3});
`);
function totals(goals=3,saves=3){assert.equal(run('LivePlayerModel.goalkeeper(m,k.playerId).goalsConceded'),goals);assert.equal(run('LivePlayerModel.goalkeeper(m,k.playerId).saves'),saves);assert.equal(run('LivePlayerModel.goalkeeper(m,k.playerId).savePercentage'),saves/(saves+goals)*100)}
totals();assert.equal(run('LivePlayerModel.faced(m,k.playerId).length'),6);
run(`globalThis.html=goalkeeperMap(m,k)`);assert.equal(run("(html.match(/player-goal-marker conceded/g)||[]).length"),3);
// Goals saved without shot flags still belong to the same goal/shot projections.
run(`for(const e of m.simulation.events)if(e.type==='goal'){delete e.shot;delete e.result}globalThis.before=JSON.stringify(m)`);totals();assert.equal(run('MatchEvents.shots(m.simulation).length'),6);assert.equal(run('JSON.stringify(m)'),run('before'));
run('m.simulation=MatchSimulator.validate(m.simulation)');totals();assert.equal(run('LivePlayerModel.faced(m,k.playerId).filter(e=>e.result===\'goal\'&&e.target).length'),3);
// Score-only history: correct total/percentage, no fabricated goal markers.
run(`m.simulation.events=m.simulation.events.filter(e=>e.result==='saved')`);totals();assert.equal(run('LivePlayerModel.goalkeeper(m,k.playerId).unrecordedGoals'),3);assert.equal(run("goalkeeperMap(m,k).includes('3 conceded goals have no recorded shot details')"),true);
// Ordered substitutions correctly partition legacy goals at the same minute.
run(`globalThis.next={...structuredClone(k),playerId:'replacement',minutes:30,onAt:60};k.minutes=60;k.offAt=60;k.sub=60;m.data.teams.away.substituted=[k];m.data.teams.away.players=m.data.teams.away.players.map(p=>p===k?next:p);m.simulation.events=[{id:'before',type:'goal',side:'home',minute:60},{id:'sub',type:'substitution',side:'away',minute:60,playerId:k.playerId,onId:next.playerId},{id:'after',type:'goal',side:'home',minute:60}];m.data.homeScore=2`);
assert.equal(run('LivePlayerModel.goalkeeper(m,k.playerId).goalsConceded'),1);assert.equal(run('LivePlayerModel.goalkeeper(m,next.playerId).goalsConceded'),1);
console.log('Passed: three conceded goals plus three saves display 50%, legacy goal flags/keeper links and targets survive validation, score-only results have honest unmapped totals, and substitute keepers stay isolated.');
