/* Presentation only: no match, roster or simulation state is copied or mutated. */
let interfaceMode='auto';
try{const saved=localStorage.getItem('fotmob-interface-mode');if(['auto','mobile','desktop'].includes(saved))interfaceMode=saved}catch{}
const interfaceControl=document.createElement('label');interfaceControl.className='interface-mode-control';interfaceControl.innerHTML='Interface Mode <select aria-label="Interface Mode" id="interface-mode"><option value="auto">Auto</option><option value="mobile">Mobile</option><option value="desktop">Desktop</option></select>';
hubMenu.querySelector('section').append(interfaceControl);
const desktopEvents=document.createElement('aside');desktopEvents.id='desktop-match-events';desktopEvents.setAttribute('aria-label','Match information and major events');document.querySelector('main').prepend(desktopEvents);
const browseLayout=document.createElement('div');browseLayout.id='browse-layout';centre.before(browseLayout);
const browseLeft=document.createElement('aside'),browseRight=document.createElement('aside');browseLeft.className='desktop-browse-rail';browseRight.className='desktop-browse-rail';browseLayout.append(browseLeft,centre,browseRight);
const desktopBrand=document.createElement('button');desktopBrand.className='desktop-brand';desktopBrand.textContent='FOTMOB LOCAL';desktopBrand.onclick=()=>openFootballHub('home');hubNav.prepend(desktopBrand);
const desktopManage=document.createElement('button');desktopManage.className='desktop-manage';desktopManage.textContent='Manage';desktopManage.onclick=()=>openHubMenu();hubNav.append(desktopManage);
const benchHome=document.createComment('Saved bench position');$('sim-benches').before(benchHome);
const lineupBench=document.createElement('section');lineupBench.id='desktop-lineup-bench';lineupBench.setAttribute('aria-label','Match bench');document.querySelector('.preview-area').append(lineupBench);
function interfaceWidth(){return Number(window.innerWidth)||Number(document.documentElement.clientWidth)||1024}
function applyInterfaceMode(){const width=interfaceWidth(),mode=interfaceMode==='auto'?(width>=1180?'desktop':width>=720?'tablet':'mobile'):interfaceMode;
 document.body.dataset.interface=mode;document.body.dataset.interfacePreference=interfaceMode;$('interface-mode').value=interfaceMode;
 updateDesktopGeometry();updateDesktopPresentation();
}
function updateDesktopGeometry(){if(document.body.dataset.interface!=='desktop')return;const width=$('frame').clientWidth||720;document.body.style.setProperty('--formation-scale',Math.min(1.1,width/809));}
function desktopPlayerSpace(){document.body.classList.toggle('desktop-player-open',!playerSheet.hidden&&!playerSheet.classList.contains('sheet-closing'));playerSheet.firstElementChild?.setAttribute('aria-modal',document.body.dataset.interface==='desktop'?'false':'true')}
function desktopSidebar(){const m=currentMatch();if(!m)return;const events=LivePlayerModel.commentary(m.simulation,true);
 const summary=`<h2>Match centre</h2><p>${esc(m.competition||'Friendly')}</p><p>${esc(dateLabel(m.date))} ${esc(m.kickoff||m.time||'')}</p><div class="desktop-score">${esc(state.home)} <b>${state.homeScore} – ${state.awayScore}</b> ${esc(state.away)}</div><h3>Major events</h3><div class="desktop-major-list">${events.map(eventHTML).join('')||'<p>No major events recorded.</p>'}</div>`;
 if(desktopEvents.innerHTML!==summary){const scroll=desktopEvents.scrollTop;desktopEvents.innerHTML=summary;desktopEvents.scrollTop=scroll}
}
function desktopBrowse(){const leagues=library.leagues||[],clubs=library.clubs||[],favourites=clubs.filter(c=>library.favourites?.clubs?.includes(c.id));
 const left=`<h2>Match calendar</h2><label>Jump to date<input type="date" id="desktop-calendar" value="${esc(centreDate)}"></label><h3>Competitions</h3>${leagues.map(l=>`<button data-desktop-league="${esc(l.id)}">${esc(l.name)}</button>`).join('')||'<p>Create a league from Manage.</p>'}`;
 const games=centreRoute==='competitions'?library.matches.filter(m=>m.leagueId===competitionRoute||m.competitionId===competitionRoute):[];
 const gameLinks=(list,title)=>list.length?`<h3>${title}</h3>${list.map(m=>`<button data-desktop-match="${esc(m.id)}"><span>${esc(clubById(m.homeId).name)}<br>${esc(clubById(m.awayId).name)}<small>${esc(dateLabel(m.date))} · ${m.status==='FT'?m.data.homeScore+' – '+m.data.awayScore:esc(m.kickoff||'Upcoming')}</small></span></button>`).join('')}`:'';
 const right=`<h2>Following</h2>${favourites.map(c=>`<button data-desktop-club="${esc(c.id)}">${badgeHTML(c)}<span>${esc(c.name)}</span></button>`).join('')||'<p>Favourite clubs to keep them here.</p>'}${gameLinks(games.filter(m=>m.status==='FT').sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3),'Recent results')}${gameLinks(games.filter(m=>m.status==='UPCOMING').sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3),'Upcoming fixtures')}<h3>Your football world</h3><p>${clubs.length} clubs · ${leagues.length} leagues</p><button data-desktop-route="leagues">Browse leagues</button><button data-desktop-route="news">Latest match reports</button>`;
 if(browseLeft.innerHTML!==left&&document.activeElement?.id!=='desktop-calendar')browseLeft.innerHTML=left;if(browseRight.innerHTML!==right)browseRight.innerHTML=right;
}
browseLeft.addEventListener('change',e=>{if(e.target.id==='desktop-calendar'&&/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)){centreDate=e.target.value;openFootballHub('home')}});
browseLayout.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.desktopRoute)openFootballHub(b.dataset.desktopRoute);if(b.dataset.desktopClub)showScreen(b.dataset.desktopClub);if(b.dataset.desktopLeague)openCompetition(b.dataset.desktopLeague);if(b.dataset.desktopMatch)openExistingMatch(b.dataset.desktopMatch)});
function updateDesktopPresentation(){document.body.dataset.matchTab=matchView;document.body.classList.toggle('viewing-club',!$('club-screen').hidden);desktopPlayerSpace();const desktop=document.body.dataset.interface==='desktop',bench=$('sim-benches');if(desktop&&matchView==='Lineup'&&$('club-screen').hidden){if(bench.parentElement!==lineupBench)lineupBench.append(bench)}else if(bench.parentElement===lineupBench)benchHome.after(bench);if(desktop){desktopSidebar();desktopBrowse()}}
const refreshBeforeResponsive=refreshSimulation;refreshSimulation=function(){const scroll=commentarySidebar.querySelector('.commentary-scroll')?.scrollTop||0;refreshBeforeResponsive();updateDesktopPresentation();const feed=commentarySidebar.querySelector('.commentary-scroll');if(feed)feed.scrollTop=scroll};
const drawBeforeResponsive=drawMatchView;drawMatchView=function(){drawBeforeResponsive();updateDesktopPresentation()};
const screenBeforeResponsive=renderScreen;renderScreen=function(){screenBeforeResponsive();updateDesktopPresentation()};
const centreBeforeResponsive=renderMatchCentre;renderMatchCentre=function(...args){const result=centreBeforeResponsive(...args);updateDesktopPresentation();return result};
const openBeforeResponsive=openLivePlayer;openLivePlayer=function(...args){openBeforeResponsive(...args);desktopPlayerSpace()};
const closeBeforeResponsive=closeLivePlayer;closeLivePlayer=function(...args){closeBeforeResponsive(...args);desktopPlayerSpace()};
// The existing form and controls remain the only editors; these are roster projections.
const modalBeforeResponsive=teamModal;teamModal=function(...args){modalBeforeResponsive(...args);const c=clubById(teamEditorId);if(!c)return;const card=teamDialog.firstElementChild,main=document.createElement('div');main.className='desktop-team-editor-main';for(const child of [...card.children].slice(1))main.append(child);card.append(main);card.classList.add('desktop-team-layout');
 const list=document.createElement('aside');list.className='desktop-team-list';list.innerHTML='<h3>Squad</h3>'+TeamManager.roster(c).map(p=>`<button type="button" data-team-player="${esc(p.playerId)}">${face(p,32)}<span>${esc(p.name)}<small>${esc(p.roleDetail||p.position)} · ${PlayerAbility.overall(p)}</small></span></button>`).join('');card.append(list);
 const formation=document.createElement('section');formation.className='desktop-team-formation';formation.innerHTML=`<h3>${esc(c.squad.formation)}</h3>`;const counts=c.squad.formation.split('-').map(Number).reverse().concat(1);let index=0;formation.innerHTML+=counts.map(count=>`<div>${c.squad.players.slice(index,index+=count).map(p=>`<button type="button" data-team-player="${esc(p.playerId)}">${face(p,42)}<span>${esc(p.name)}</span><small>${PlayerAbility.overall(p)}</small></button>`).join('')}</div>`).join('');card.append(formation);
};
document.addEventListener('click',()=>{updateDesktopPresentation()});
interfaceControl.onchange=()=>{interfaceMode=$('interface-mode').value;try{localStorage.setItem('fotmob-interface-mode',interfaceMode)}catch{toast('Interface changed for this session. Local preferences are unavailable.')}applyInterfaceMode()};
window.addEventListener('resize',applyInterfaceMode);if(typeof ResizeObserver==='function')new ResizeObserver(updateDesktopGeometry).observe($('frame'));
applyInterfaceMode();

