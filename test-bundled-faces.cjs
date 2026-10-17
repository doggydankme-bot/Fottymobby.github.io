const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),boot=require('./test-integration.cjs'),bundle=require('./bundled-face-library.js');
const manifest=JSON.parse(fs.readFileSync('public/player-faces/gold/manifest.json'));
assert.equal(bundle.faces.length,85);assert.equal(new Set(bundle.faces.map(f=>f.id)).size,85);assert.equal(new Set(bundle.faces.map(f=>f.sha256)).size,85);
for(const face of bundle.faces){
 const row=manifest.faces.find(f=>f.id===face.id),png=fs.readFileSync('.'+face.image);
 assert.equal(face.gender,'male');assert.equal(face.tier,'gold');assert.equal(face.kind,'head');assert.ok(face.overallRating>=75);assert.equal(row.genderSource.ea.id,0);assert.match(row.genderSource.wikidata,/^Q\d+$/);
 assert.match(face.licenseUrl,/creativecommons.org/);assert.ok(face.author);assert.match(face.sourceUrl,/commons.wikimedia.org\/wiki\/File:/);assert.match(face.ratingSource,/drop-api.ea.com/);
 assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),256);assert.equal(png.readUInt32BE(20),256);assert.equal(crypto.createHash('sha256').update(png).digest('hex'),face.sha256);assert.equal(face.photo,'data:image/png;base64,'+png.toString('base64'));
}
async function test(){
 const app=boot(new Map(),{bundled:true}),run=app.run;await run('bundledFaceReady');assert.equal(run('library.facePack.length'),85);
 assert.match(app.document.querySelector('#face-pool-status').textContent,/85 bundled/);assert.equal(app.document.querySelector('#grab-face')?.textContent||run('grabFace.textContent'),'Random Real Face');
 run("globalThis.beforeExisting=JSON.stringify(library.clubs.map(c=>c.squad));");await run('installBundledFaces()');assert.equal(run('JSON.stringify(library.clubs.map(c=>c.squad))'),run('beforeExisting'));
 run("$('club-name').value='Bundled FC';$('club-country').value='Ireland'");await run("$('club-form').onsubmit({preventDefault(){},submitter:$('generate-team')})");
 run('globalThis.generated=library.clubs.at(-1);globalThis.generatedId=generated.id;globalThis.roster=[...generated.squad.players,...generated.squad.bench]');
 assert.equal(run('roster.length'),18);assert.equal(run('new Set(roster.map(p=>p.faceId)).size'),18);assert.equal(run('roster.every(p=>p.generated&&p.faceOrigin===\'real-pool\'&&library.facePack.some(f=>f.id===p.faceId&&f.photo===p.photo))'),true);
 assert.equal(run('roster.some(p=>library.facePack.find(f=>f.id===p.faceId).sourceNationality!==p.country)'),true);
 run("globalThis.savedRoster=JSON.stringify(generated.squad);$('managed-club').value=generated.id;refreshSquadManager()");await run('repairFaces.onclick()');assert.equal(run('JSON.stringify(generated.squad)'),run('savedRoster'));
 const reload=boot(new Map(app.storage),{bundled:true});await reload.run('bundledFaceReady');assert.deepEqual(JSON.parse(reload.run(`JSON.stringify(clubById('${run('generatedId')}').squad)`)),JSON.parse(run('savedRoster')));assert.equal(reload.run('library.facePack.length'),85);
 // Explicit migration changes only generated placeholders; protect uploaded/manual and valid real images.
 run("roster[0].photo='';roster[0].faceId='';roster[0].placeholder=true;roster[1].photo='data:image/png;base64,manual';roster[1].faceId='';roster[1].faceOrigin='uploaded';roster[2].generated=false;roster[2].photo='';roster[2].faceId='';globalThis.beforeMigration=JSON.stringify(roster.map(p=>[p.playerId,p.name,p.country,p.position,p.rating,p.goals,p.assists]));globalThis.kept=JSON.stringify(roster.slice(1));");
 run("createMatch();$('home-club').value=generatedId;$('home-club').onchange({target:$('home-club')});state.teams.home.players[0].goals=2;state.teams.home.players[0].rating=8.1;save();globalThis.historyBefore=JSON.stringify(currentMatch().data.teams.home.players.map(p=>[p.playerId,p.name,p.rating,p.goals,p.assists]));$('managed-club').value=generatedId;refreshSquadManager()");
 await run('repairFaces.onclick()');assert.equal(run('roster[0].placeholder'),false);assert.ok(run('roster[0].faceId'));assert.equal(run('JSON.stringify(roster.slice(1))'),run('kept'));assert.equal(run('JSON.stringify(roster.map(p=>[p.playerId,p.name,p.country,p.position,p.rating,p.goals,p.assists]))'),run('beforeMigration'));
 assert.equal(run('state.teams.home.players[0].photo'),run('roster[0].photo'));assert.equal(run('currentMatch().data.teams.home.players[0].faceId'),run('roster[0].faceId'));assert.equal(run('JSON.stringify(currentMatch().data.teams.home.players.map(p=>[p.playerId,p.name,p.rating,p.goals,p.assists]))'),run('historyBefore'));
 run("globalThis.fullSave=JSON.stringify(library);globalThis.importSave=structuredClone(library);importSave.facePack=[];$('import').files=[{size:fullSave.length,text:async()=>JSON.stringify(importSave)}]");await run("$('import').onchange()");assert.equal(run('library.facePack.length'),85);assert.equal(run('JSON.stringify(library.clubs.map(c=>[...c.squad.players,...c.squad.bench].map(p=>[p.playerId,p.photo,p.faceId])))'),run('JSON.stringify(importSave.clubs.map(c=>[...c.squad.players,...c.squad.bench].map(p=>[p.playerId,p.photo,p.faceId])))'));
 const failure=boot(),fail=failure.run;fail("libraryStore.write=async()=>{throw Error('Full disk')}"); // Load only the installer after configuring the failure.
 const vm=require('node:vm');for(const name of ['bundled-face-library.js','bundled-face-ui.js'])vm.runInContext(fs.readFileSync(name,'utf8'),failure.context);await fail('bundledFaceReady');assert.equal(fail('library.facePack.length'),0);assert.match(failure.document.querySelector('#toast').textContent,/Existing cached faces are intact/);
 console.log('Passed: 85 distinct licensed 256px local heads, provenance/hash validation, automatic offline installation, XI/bench assignment, independent nationality, permanent reload/import, guarded placeholder migration and failed-write rollback.');
}
test().catch(error=>{console.error(error);process.exitCode=1});
