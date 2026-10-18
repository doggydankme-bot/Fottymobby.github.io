const assert=require('node:assert/strict'),boot=require('./test-integration.cjs');
async function main(){const app=boot(new Map(),{hub:true}),{run,document}=app;
const routes=['home','matches','news','leagues','favourites','search','clubs','competitions'];
function browseOnly(){assert.equal(document.querySelector('#app-route-outlet').children.length,1);for(const selector of ['main','#phone','.pitch','#players','.match-header','.mobile-tabs','#sim-live-screen','#simulator-dock','.preview-caption','.preview-bottom'])assert.ok(!document.querySelector(selector),selector+' must be unmounted');assert.equal(document.querySelectorAll('#hub-bottom-nav').length,1)}
for(const mode of ['mobile','desktop'])for(const width of [390,809,1366,1920]){run(`interfaceMode='${mode}';window.innerWidth=${width};applyInterfaceMode()`);for(const route of routes){run(`openFootballHub('${route}')`);browseOnly();assert.equal(document.body.dataset.appView,'browse')}}
// Every tab mounts exactly one content branch, using the same existing components.
run(`openExistingMatch(currentMatch().id)`);const workspace=document.querySelector('main');
for(const mode of ['mobile','desktop']){run(`interfaceMode='${mode}';applyInterfaceMode()`);for(const tab of ['Facts','Commentary','Lineup','Table','Stats','H2H']){
 run(`matchView='${tab}';drawMatchView()`);assert.ok(document.querySelector('main')===workspace);assert.equal(document.querySelectorAll('.match-header').length,1);assert.equal(document.querySelectorAll('.mobile-tabs').length,1);assert.equal(document.querySelectorAll('.pitch').length,tab==='Lineup'?1:0);assert.equal(document.querySelectorAll('#sim-live-screen').length,tab==='Lineup'?0:1);
}run(`openFootballHub('news')`);browseOnly();run(`openExistingMatch(currentMatch().id)`)}
// Use the actual scheduled simulator callback while the match route is unmounted.
run(`currentMatch().status='UPCOMING';$('sim-start').onclick();globalThis.runningId=currentMatch().id;globalThis.beforeMinute=currentMatch().simulation.minute;globalThis.runningSim=currentMatch().simulation;globalThis.timerBefore=simulationTimer;openFootballHub('home')`);browseOnly();assert.equal(run('simulationTimer'),run('timerBefore'));
const timerId=run('simulationTimer'),timer=app.timers.get(timerId);assert.ok(timer);app.timers.delete(timerId);timer.fn();browseOnly();assert.equal(run('currentMatch().simulation===runningSim'),true);assert.equal(run('currentMatch().simulation.minute'),run('beforeMinute+1'));
run(`openExistingMatch(runningId)`);assert.equal(document.body.dataset.appView,'match');assert.equal(run('currentMatch().simulation.minute'),run('beforeMinute+1'));assert.equal(run('currentMatch().simulation.paused'),false);
// The match back button opens the catalogue and actually removes its workspace.
document.querySelector('.back').click();browseOnly();assert.equal(run('centreRoute'),'home');
run(`showScreen(currentMatch().homeId)`);assert.equal(document.body.dataset.appView,'club');assert.ok(!document.querySelector('#phone'));assert.ok(!document.querySelector('main'));assert.ok(document.querySelector('#club-screen'));run(`openFootballHub('favourites')`);browseOnly();
run(`hubManagement('settings')`);assert.equal(document.body.dataset.appView,'management');assert.ok(!document.querySelector('#phone'));assert.ok(!document.querySelector('main'));assert.ok(document.querySelector('#project-panel'));run(`openFootballHub('home')`);browseOnly();
// Save transactions no longer require a mounted <main>.
assert.equal(await run(`worldCommit('Route isolation check',async next=>{next.routeIsolationChecked=true})`),true);assert.equal(run('library.routeIsolationChecked'),true);assert.ok(!document.querySelector('#phone'));
run(`openFootballHub('search');openExistingMatch(currentMatch().id);matchView='Lineup';drawMatchView()`);assert.equal(document.querySelectorAll('.player').length,11);assert.equal(document.querySelectorAll('.preview-caption,.preview-bottom').length,0);
console.log('Passed: all eight browsing routes × mobile/desktop × 390/809/1366/1920; no match nodes in document; one route/navigation; exclusive six match tabs; real simulation timer continues while unmounted; match Back; independent clubs/settings; transactions from browsing; restored lineup and removed preview furniture.');}
main().catch(e=>{console.error(e);process.exitCode=1});
