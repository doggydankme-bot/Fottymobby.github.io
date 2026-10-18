const assert=require('node:assert/strict'),fs=require('node:fs'),boot=require('./test-integration.cjs'),CSSOM=require('./.qa/node_modules/cssom');
const app=boot(new Map(),{hub:true}),{run,document}=app;
const css=CSSOM.parse(fs.readFileSync('responsive.css','utf8'));assert.ok(css.cssRules.length>100);
run(`leaveMatchCentre();createMatch();attachData();MatchSimulator.start(currentMatch(),library,193);globalThis.m=currentMatch();matchView='Commentary';drawMatchView();globalThis.beforeResize=JSON.stringify(m);globalThis.beforeLibrary=JSON.stringify(library);globalThis.simIdentity=m.simulation`);
const pitch=document.querySelector('#event-pitch-svg'),navigation=document.querySelector('#hub-bottom-nav'),centre=document.querySelector('#match-centre');
for(const [width,expected] of [[390,'mobile'],[719,'mobile'],[720,'tablet'],[1024,'tablet'],[1179,'tablet'],[1180,'desktop'],[1366,'desktop'],[1440,'desktop'],[1920,'desktop'],[2560,'desktop'],[430,'mobile']]){
 run(`window.innerWidth=${width};applyInterfaceMode()`);
 assert.equal(document.body.dataset.interface,expected,`${width}px mode`);
 assert.equal(run('JSON.stringify(m)'),run('beforeResize'));
 assert.equal(run('JSON.stringify(library)'),run('beforeLibrary'));
 assert.equal(run('m.simulation===simIdentity'),true);assert.equal(run('matchView'),'Commentary');
 assert.ok(document.querySelector('#event-pitch-svg')===pitch,'Resizing retains live pitch');
 assert.ok(document.querySelector('#hub-bottom-nav')===navigation,'Same navigation node');
 assert.ok(document.querySelector('#match-centre')===centre,'Same routed content');
}
// Persisted overrides never alter the save file or create alternative routes.
run(`$('interface-mode').value='desktop';interfaceControl.onchange()`);assert.equal(document.body.dataset.interface,'desktop');assert.equal(app.storage.get('fotmob-interface-mode'),'desktop');
const restored=boot(new Map(app.storage),{hub:true});assert.equal(restored.document.body.dataset.interface,'desktop');
run(`$('interface-mode').value='mobile';interfaceControl.onchange()`);assert.equal(document.body.dataset.interface,'mobile');
run(`$('interface-mode').value='auto';interfaceControl.onchange();window.innerWidth=1920;applyInterfaceMode();matchView='Lineup';drawMatchView()`);
const bench=document.querySelector('#sim-benches');assert.equal(bench.parentElement.id,'desktop-lineup-bench');
run(`window.innerWidth=390;applyInterfaceMode()`);assert.ok(bench===document.querySelector('#sim-benches'));assert.equal(bench.parentElement.id,'simulator-dock');
// A player stays open and the simulator continues when crossing breakpoints.
run(`window.innerWidth=1920;applyInterfaceMode();openLivePlayer('home',m.data.teams.home.players[0].playerId);globalThis.openId=livePlayerSelection.id`);
const sheet=document.querySelector('.fotmob-player-sheet');sheet.scrollTop=480;
run(`globalThis.minuteBefore=m.simulation.minute;window.innerWidth=390;applyInterfaceMode();for(let i=0;i<3;i++)MatchSimulator.step(m);render();save()`);
assert.equal(run('livePlayerSelection.id'),run('openId'));assert.equal(run('m.simulation.minute'),run('minuteBefore+3'));assert.ok(document.querySelector('.fotmob-player-sheet')===sheet);assert.equal(sheet.scrollTop,480);
run(`window.innerWidth=1920;applyInterfaceMode()`);assert.equal(sheet.scrollTop,480);assert.equal(run('livePlayerSelection.id'),run('openId'));assert.ok(document.body.classList.contains('desktop-player-open'));
// Map origins and selected trajectories are invariant under responsive changes.
run(`closeLivePlayer(true);MatchSimulator.complete(m,library);render();save();matchView='Stats';drawMatchView();globalThis.matchSnapshot=JSON.stringify(m)`);
const positions=()=>[...document.querySelectorAll('.detail-shot-pitch [data-shot-id]')].map(n=>[n.dataset.shotId,n.getAttribute('style')]);const original=positions();assert.ok(original.length>0);
for(const width of [1366,1440,1920,2560,768,390]){run(`window.innerWidth=${width};applyInterfaceMode()`);assert.deepEqual(positions(),original);assert.equal(run('JSON.stringify(m)'),run('matchSnapshot'))}
run(`window.innerWidth=1920;applyInterfaceMode();refreshSimulation()`);assert.equal(document.querySelectorAll('#desktop-commentary .commentary-filter').length,1);
document.querySelector('#desktop-commentary .commentary-scroll').scrollTop=240;
run(`refreshSimulation()`);assert.equal(document.querySelector('#desktop-commentary .commentary-scroll').scrollTop,240);
// Existing management form stays mounted, including unsaved input, during resize.
run(`openTeamEditor(m.homeId,true);teamPlayerForm(clubById(m.homeId).squad.players[0].playerId);$('team-player-name').value='Unsaved desktop edit'`);
const input=document.querySelector('#team-player-name');assert.equal(document.querySelectorAll('.desktop-team-formation button').length,11);
run(`window.innerWidth=390;applyInterfaceMode();window.innerWidth=1920;applyInterfaceMode()`);assert.ok(document.querySelector('#team-player-name')===input);assert.equal(input.value,'Unsaved desktop edit');assert.equal(run('JSON.stringify(m)'),run('matchSnapshot'));
// Existing club and competition navigation is reused by desktop shortcuts.
run(`closeTeamEditor();openFootballHub('home');desktopBrowse()`);const league=document.querySelector('[data-desktop-league]');if(league){league.dispatchEvent(new document.defaultView.Event('click',{bubbles:true}));assert.equal(run('centreRoute'),'competitions')}
run(`showScreen(m.homeId)`);assert.ok(document.body.classList.contains('viewing-club'));assert.ok(!document.querySelector('#club-screen').hidden);
console.log('Passed: 390–2560px mode matrix; saved overrides; same routes, data, timer identity and pitch; unchanged shot coordinates; live sheet scroll/update across resize; original bench reparenting; commentary scroll; unsaved team form; existing league/club links; CSS parsing.');
