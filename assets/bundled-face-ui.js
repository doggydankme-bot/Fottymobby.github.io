/* Installs the already-local library without changing any player assignment. */
const refreshBeforeBundledFaces=refreshFacePool;
refreshFacePool=function(){
 refreshBeforeBundledFaces();
 const bundled=new Set(BundledFaceLibrary.faces.map(f=>f.id)),count=(library.facePack||[]).filter(f=>bundled.has(f.id)).length;
 $('face-pool-status').textContent=library.facePack.length?`${library.facePack.length} real male Gold heads saved locally (${count} bundled). No external requests when generating. Faces stay unique within a club until the pool is exhausted.`:'Real face library needs images. Import Face Pack below; no generated-face fallback is used.';
};
async function installBundledFaces(){
 const previous=library.facePack||[],photos=new Set(previous.map(f=>f.photo)),ids=new Set(previous.map(f=>f.id)),added=[];
 for(const face of SquadGenerator.cleanPack(BundledFaceLibrary.faces)){
  if(photos.has(face.photo)||ids.has(face.id)||previous.length+added.length>=500)continue;
  added.push(face);photos.add(face.photo);ids.add(face.id);
 }
 if(added.length){
  library.facePack=[...previous,...added];
  if(!await persist()){library.facePack=previous;refreshFacePool();toast('Could not save the bundled face library. Existing cached faces are intact. Free storage and refresh, or import a local face pack.');return false}
 }
 refreshFacePool();return true;
}
const faceCredits=document.createElement('p');faceCredits.className='hint';faceCredits.innerHTML='<a href="/public/player-faces/gold/credits.html" target="_blank" rel="noopener">85 local real player heads · image sources, creators and licences</a>';packBox.querySelector('h2').after(faceCredits);
packBox.querySelectorAll('p.hint')[1].textContent='85 real male Gold-level player heads are included locally. You can also import your own licensed head images. JSON packs must declare male / gold / head; ordinary image imports use your selection as their label. Existing player faces are preserved.';
$('club-face-source').querySelector('option').textContent='Local real male Gold head library';
grabFace.textContent='Random Real Face';reserveFace.textContent='Random Real Face';$('managed-random-face').textContent='Random Real Face';
const importBeforeBundledFaces=$('import').onchange;
$('import').onchange=async()=>{await importBeforeBundledFaces();await installBundledFaces()};
const bundledFaceReady=installBundledFaces();
