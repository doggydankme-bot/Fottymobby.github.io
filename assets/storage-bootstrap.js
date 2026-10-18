(async()=>{
 const status=document.getElementById('save-state'),main=document.querySelector('main');
 status.textContent='Loading saved library…';main.inert=true;
 try{
  globalThis.libraryStore=await LibraryStorage.open(globalThis.indexedDB,globalThis.localStorage);
  for(const path of ['app.js','analytics.js','match-events.js','match-detail-model.js','live-pitch-model.js','live-player-model.js','player-ability.js','match-movement.js','simulator-engine.js','futgg-face-model.js','team-generator-model.js','team-management-model.js','club-assets-model.js','football-world-model.js','competition-model.js','football-hub-model.js','player-profile-model.js','clubs.js','club-stats.js','fixtures.js','simulator-ui.js','advanced-match.js','match-centre-model.js','match-centre.js','player-shot-views.js','heat-density.js','live-player-ui.js','team-generator-ui.js','bundled-face-library.js','bundled-face-ui.js','competition-ui.js','futgg-face-library.js','futgg-face-ui.js','external-gold-faces.js','external-gold-ui.js','football-hub-ui.js','player-profile-ui.js','football-world-ui.js','ability-assets-ui.js','live-pitch-ui.js','match-detail-ui.js','team-management-ui.js','responsive-ui.js','route-shell.js'])await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=path;script.onload=resolve;script.onerror=()=>reject(Error(`Could not load ${path}. Refresh the page to retry.`));document.body.append(script)});
  await bundledFaceReady;
  await futggFaceReady;
  await externalGoldReady;
  main.inert=false;
 }catch(error){status.textContent='Could not open saved library';const notice=document.getElementById('toast');notice.textContent=error.message;notice.classList.add('visible');notice.style.pointerEvents='auto';main.inert=true;console.error(error)}
})();



