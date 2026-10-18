/* Generate real, editable upcoming match records for a saved league. */
const generateButton=document.createElement('button');generateButton.id='generate-fixtures';generateButton.className='full';generateButton.type='button';generateButton.textContent='Generate 10 fixtures';
$('league-form').after(generateButton);
const fixtureHint=document.createElement('p');fixtureHint.className='hint';fixtureHint.textContent='Creates 10 upcoming games in total, using this league’s saved clubs. Matchdays start a week apart; clashes with any other match move to the next free day for both clubs. You can edit each date in Match.';generateButton.after(fixtureHint);
function updateFixtureButton(){const league=library.leagues.find(l=>l.id===$('edit-league').value);generateButton.disabled=!league||league.clubIds.length<2;generateButton.title=!league?'Save or select a league first':league.clubIds.length<2?'Add at least two clubs to this league':'Create 10 upcoming matches'}
const refreshBeforeFixtures=refreshLeagueOptions;refreshLeagueOptions=function(){refreshBeforeFixtures();updateFixtureButton()};
const selectLeagueBeforeFixtures=$('edit-league').onchange;$('edit-league').onchange=()=>{selectLeagueBeforeFixtures();updateFixtureButton()};
const saveLeagueBeforeFixtures=$('league-form').onsubmit;$('league-form').onsubmit=e=>{saveLeagueBeforeFixtures(e);updateFixtureButton()};
const clubStatsBeforeFixtures=clubStats;clubStats=function(club){const html=clubStatsBeforeFixtures(club),league=library.leagues.find(l=>l.id===leagueView);if(!league)return html;const scheduled=library.matches.filter(m=>m.leagueId===league.id&&m.status==='UPCOMING').sort((a,b)=>a.date.localeCompare(b.date));return html+`<button class="screen-new" data-generate-fixtures="${esc(league.id)}" ${league.clubIds.length<2?'disabled':''}>Generate 10 fixtures</button><p class="screen-muted calculation-note">10 upcoming games in total. At least two member clubs are required.</p>${scheduled.length?`<h2>Upcoming fixtures <small>${scheduled.length}</small></h2><div class="fixtures-card">${matchRows(scheduled)}</div>`:''}`};
async function generateFixtures(leagueId){
 if(generateFixtures.running)return;
 const league=library.leagues.find(l=>l.id===leagueId);if(!league){toast('Save or select a league first.');return}
 const members=league.clubIds.filter(id=>clubById(id));if(members.length<2){toast('Add at least two clubs to this league.');return}
 syncCurrent();
 const existing=library.matches.filter(m=>m.leagueId===league.id&&(!league.activeSeasonId||m.seasonId===league.activeSeasonId));
 const plan=FootballStats.fixtures(members,10,existing.length);
 const latest=existing.map(m=>m.date).sort().at(-1);
 const firstDate=new Date(`${latest&&latest>=today()?latest:today()}T12:00:00Z`);
 if(latest&&latest>=today())firstDate.setUTCDate(firstDate.getUTCDate()+7);
 const entries=[];
 for(const f of plan){
  const home=clubById(f.homeId),away=clubById(f.awayId),date=new Date(firstDate);
  date.setUTCDate(date.getUTCDate()+(f.round-plan[0].round)*7);
  const data=structuredClone(initial);
  Object.assign(data,{home:home.name,away:away.name,homeLogo:home.logo,awayLogo:away.logo,homeScore:0,awayScore:0,activeSide:'home',teams:{home:resetEvents(home.squad),away:resetEvents(away.squad)}});
  data.players=data.teams.home.players;data.formation=data.teams.home.formation;
  const entry={id:uid(),homeId:home.id,awayId:away.id,date:date.toISOString().slice(0,10),competition:league.name,status:'UPCOMING',leagueId:league.id,competitionId:league.id,seasonId:league.activeSeasonId||'',matchday:f.round,data};
  const earlier=entries.filter(m=>m.matchday<f.round).map(m=>m.date).sort().at(-1);if(earlier&&entry.date<=earlier){const after=new Date(earlier+'T12:00:00Z');after.setUTCDate(after.getUTCDate()+1);entry.date=after.toISOString().slice(0,10)}
  entry.date=CompetitionWorld.availableDate(library,entry,entries);entries.push(entry);
 }
 const next={...library,matches:[...library.matches,...entries]};
 generateFixtures.running=true;
 appWorkspace.inert=true;
 try{await libraryStore.write(JSON.stringify(next))}catch(error){toast('Could not save fixtures: '+error.message);return}finally{generateFixtures.running=false;appWorkspace.inert=false}
 library=next;leagueView=league.id;refreshMenus();$('save-state').textContent='● Clubs & matches saved locally';
 const clubId=members.includes(screen)?screen:members[0];showScreen(clubId,'Stats');
 toast(`10 upcoming fixtures generated for ${league.name}.`);
}
generateButton.onclick=()=>generateFixtures($('edit-league').value);
const screenClickBeforeFixtures=$('club-screen').onclick;$('club-screen').onclick=e=>{const button=e.target.closest('[data-generate-fixtures]');if(button){generateFixtures(button.dataset.generateFixtures);return}screenClickBeforeFixtures(e)};
updateFixtureButton();
