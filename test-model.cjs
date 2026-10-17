const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const sandbox={structuredClone,crypto,localStorage:{getItem:()=>null},document:{getElementById:()=>null}};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('app.js','utf8').split("\ndocument.querySelectorAll('[data-panel]')")[0],sandbox);
vm.runInContext(fs.readFileSync('futgg-face-model.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('team-generator-model.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('clubs.js','utf8').split('try{const stored=')[0],sandbox);
const result=vm.runInContext(`(()=>{
 const migrated=seedLibrary(validate({...initial,homeScore:4,players:initial.players.map(p=>({...p,card:'second-yellow'}))}));
 const roundtrip=checkLibrary(JSON.parse(JSON.stringify(migrated)));
 const match=roundtrip.matches[0];
 const homeBefore=match.data.teams.home.players[0].rating;
 match.data.teams.away.players[0].rating=9.9;
 const fresh=resetEvents(match.data.teams.away);
 let invalidRejected=false;try{checkLibrary({...roundtrip,matches:[{...match,awayId:match.homeId}]})}catch{invalidRejected=true}
 return {homeUnchanged:homeBefore===match.data.teams.home.players[0].rating,score:match.data.homeScore,card:match.data.teams.away.players[0].card,placeholder:match.data.teams.home.players[0].placeholder,resetRating:fresh.players[0].rating,resetCard:fresh.players[0].card,originalRating:match.data.teams.away.players[0].rating,invalidRejected};
})()`,sandbox);
assert.equal(result.homeUnchanged,true);assert.equal(result.score,4);assert.equal(result.card,'second-yellow');assert.equal(result.placeholder,true);assert.equal(result.resetRating,6);assert.equal(result.resetCard,'');assert.equal(result.originalRating,9.9);assert.equal(result.invalidRejected,true);
console.log('Passed: legacy migration, library round trip, independent squads, new-match reset, card preservation and invalid-club rejection.');
