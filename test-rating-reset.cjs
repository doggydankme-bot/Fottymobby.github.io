const assert=require('node:assert/strict'),boot=require('./test-integration.cjs');
const app=boot(),{run}=app;
run(`
 
 for(const side of ['home','away'])for(const p of state.teams[side].players){p.baseRating=8.2;p.rating=9.1}
 save();globalThis.finishedBefore=JSON.stringify(currentMatch());createMatch();
`);
assert.equal(run("['home','away'].every(side=>state.teams[side].players.every(p=>p.rating===6&&p.baseRating===8.2))"),true);
assert.equal(run('JSON.stringify(library.matches[0])'),run('finishedBefore'));
run(`
 globalThis.newId=currentMatch().id;
 // Existing scheduled saves may still contain the old displayed ratings.
 for(const side of ['home','away'])for(const p of state.teams[side].players)p.rating=8.8;
 save();
`);
const reload=boot(app.storage);
assert.equal(reload.run("['home','away'].every(side=>currentMatch().data.teams[side].players.every(p=>p.rating===6&&p.baseRating===8.2))"),true);
assert.equal(reload.run("['home','away'].every(side=>library.matches[0].data.teams[side].players.every(p=>p.rating===9.1))"),true);
reload.run(`
 activate(library.activeId);attachData();MatchSimulator.start(currentMatch(),library,42);
 globalThis.prior=currentMatch().simulation.priors.home[state.teams.home.players[0].playerId];
`);
assert.equal(reload.run("['home','away'].every(side=>state.teams[side].players.every(p=>p.rating===6))"),true);
assert.ok(reload.run('prior.rating')>6);
reload.run(`
 globalThis.m=currentMatch(),id=state.teams.home.players[0].playerId;
 m.simulation.priors.home[id]={rating:7,recent:9,goals:0,assists:0};
 globalThis.inForm=MatchSimulator.strength(m,'home');
 m.simulation.priors.home[id].recent=5;
`);
assert.ok(reload.run("inForm>MatchSimulator.strength(m,'home')"));
reload.run(`for(let i=0;i<20;i++)MatchSimulator.step(m);globalThis.liveRatings=JSON.stringify(['home','away'].map(side=>m.data.teams[side].players.map(p=>[p.playerId,p.rating])));save()`);
const liveReload=boot(reload.storage);
assert.equal(liveReload.run("JSON.stringify(['home','away'].map(side=>currentMatch().data.teams[side].players.map(p=>[p.playerId,p.rating])))"),reload.run('liveRatings'));
console.log('Passed: new fixtures and old upcoming saves start at 6.0, base ability and form retained, finished history and live ratings unchanged.');
