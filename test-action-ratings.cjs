const assert=require('node:assert/strict'),boot=require('./test-integration.cjs');
const app=boot(),{run}=app;
run(`createMatch();attachData();MatchSimulator.start(currentMatch(),library,42);globalThis.realActivity=MatchMovement.activity;globalThis.gains={};MatchMovement.activity=(m,side,r,pick,record)=>{const p=m.data.teams[side].players[0];for(const [label,details] of Object.entries({completed:{action:'pass',passes:1,accurate:1},failed:{action:'pass',passes:1,accurate:0,lost:true},carry:{action:'carry'},dribble:{action:'dribble'},tackle:{action:'tackle'}})){const before=p.rating;record('activity',{side,playerId:p.playerId,name:p.name,touches:1,...details});gains[label]=p.rating-before}return {side}};MatchSimulator.step(currentMatch());MatchMovement.activity=realActivity`);
assert.ok(run('gains.completed')>=.01);
assert.ok(run('gains.failed')<0);
assert.ok(run('gains.dribble>gains.carry&&gains.carry>0'));
assert.ok(run('gains.tackle')>0);
run(`globalThis.m=currentMatch();while(m.simulation.phase!=='FT'){if(m.simulation.phase==='HT')MatchSimulator.resume(m);MatchSimulator.step(m)}globalThis.dribbles=m.simulation.events.filter(e=>e.type==='activity'&&e.action==='dribble');globalThis.total=LivePlayerModel.players(m).reduce((n,r)=>n+LivePlayerModel.stats(m,r.player.playerId).dribbles,0);globalThis.restored=MatchSimulator.validate(m.simulation)`);
assert.ok(run('dribbles.length')>0);assert.equal(run('total'),run('dribbles.length'));
assert.equal(run("restored.events.filter(e=>e.action==='dribble').length"),run('dribbles.length'));
assert.ok(run("MatchEvents.commentary(dribbles[0]).includes('successful dribble')"));
assert.equal(run("['home','away'].every(side=>m.data.teams[side].players.every(p=>p.rating>=0&&p.rating<=10))"),true);
assert.ok(run("liveStatsRows(m.data.teams.home.players[0],LivePlayerModel.stats(m,m.data.teams.home.players[0].playerId)).includes('Successful dribbles')"));
run(`
 globalThis.realPrepare=MatchMovement.prepareShot;globalThis.shotRewards={saved:0,blocked:0};
 MatchMovement.prepareShot=(m,side,shooter,...args)=>{const result=realPrepare(m,side,shooter,...args);globalThis.lastShot={player:shooter,rating:shooter.rating,minute:m.simulation.minute};return result};
 for(let seed=1;seed<=12;seed++){
  const match=structuredClone(m);delete match.simulation;match.status='UPCOMING';match.setupBoost={home:false,away:false};MatchSimulator.start(match,{...library,matches:[]},seed);
  for(let i=0;i<89;i++){
   lastShot=null;if(match.simulation.phase==='HT')MatchSimulator.resume(match);MatchSimulator.step(match);
   if(!lastShot)continue;
   const events=match.simulation.events.filter(e=>e.minute===lastShot.minute),shot=events.find(e=>e.shot&&e.playerId===lastShot.player.playerId);
   if(!shot||shot.penalty||lastShot.rating>9.8||events.some(e=>e.playerId===lastShot.player.playerId&&['yellow','red','second-yellow','injury'].includes(e.type)))continue;
   if(shot.result==='saved'){if(lastShot.player.rating-lastShot.rating<.09)throw Error('On-target shot did not lift rating');shotRewards.saved++}
   if(shot.result==='blocked'){if(lastShot.player.rating-lastShot.rating<.03)throw Error('Blocked shot did not lift rating');shotRewards.blocked++}
  }
 }
 MatchMovement.prepareShot=realPrepare;
`);
assert.ok(run('shotRewards.saved')>0);assert.ok(run('shotRewards.blocked')>0);
console.log('Passed: completed passes raise live ratings, failed passes reduce them, dribbles beat carry rewards, defensive contributions count, and real dribbles share stats/commentary/save data.');
