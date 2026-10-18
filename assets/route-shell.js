/* One mounted route. Parked views are not part of the document or its scroll tree. */
const matchWorkspace=document.querySelector('main'),routeHeader=document.querySelector('.app-header'),routeEditor=document.querySelector('.editor'),clubPage=$('club-screen');
const routeOutlet=document.createElement('div');routeOutlet.id='app-route-outlet';routeOutlet.setAttribute('aria-label','Current page');browseLayout.before(routeOutlet);
const managementPage=document.createElement('section');managementPage.id='management-page';
const managementBack=document.createElement('button');managementBack.className='route-management-back';managementBack.textContent='← Back to matches';managementBack.onclick=()=>openFootballHub('home');
const managementMatch=document.createElement('button');managementMatch.className='route-management-match';managementMatch.textContent='Open current match →';managementMatch.onclick=()=>openExistingMatch(currentMatch().id);
managementPage.append(managementBack,managementMatch,routeHeader,routeEditor);
const clubPageHost=document.createElement('section');clubPageHost.id='club-page-host';clubPageHost.append(clubPage);
for(const root of [matchWorkspace,managementPage,clubPageHost,browseLayout])routeViewRoots.add(root);
matchWorkspace.remove();
// The mobile/desktop hub already owns the single shared navigation.
routeViewRoots.add(centreNav);centreNav.remove();
// Device-preview captions are development furniture, not application content.
matchWorkspace.querySelectorAll('.preview-caption,.preview-bottom').forEach(el=>el.remove());
let mountedAppView=null,requestedAppView='match',routeMounting=false;
const formationView=matchWorkspace.querySelector('.pitch'),tabAnchor=document.createComment('Selected match tab');formationView.before(tabAnchor);
routeViewRoots.add(formationView);routeViewRoots.add(liveScreen);
function mountMatchTab(){const selected=matchView==='Lineup'?formationView:liveScreen,other=matchView==='Lineup'?liveScreen:formationView;other.remove();if(selected.parentElement!==$('phone'))tabAnchor.after(selected)}
function sizeClubPage(){const width=clubPageHost.clientWidth||Math.min(809,Math.max(240,interfaceWidth()-24));clubPageHost.style.setProperty('--club-page-scale',Math.min(1,width/809))}
function mountAppRoute(){if(routeMounting)return;routeMounting=true;
 try{const name=centreRoute?'browse':screen?'club':requestedAppView==='management'?'management':'match',node={browse:browseLayout,club:clubPageHost,management:managementPage,match:matchWorkspace}[name];
  if(mountedAppView!==name){if(name==='match')matchWorkspace.append(routeEditor);else if(name==='management')managementPage.append(routeEditor);routeOutlet.replaceChildren(node);mountedAppView=name;document.body.dataset.appView=name;if(name==='match'){resize();drawMatchView()}if(name==='club')sizeClubPage();window.scrollTo?.({top:0,behavior:'auto'})}
 }finally{routeMounting=false}
}
const leaveBeforeRouteShell=leaveMatchCentre;leaveMatchCentre=function(...args){requestedAppView='match';leaveBeforeRouteShell(...args);mountAppRoute()};
const centreBeforeRouteShell=openMatchCentre;openMatchCentre=function(...args){centreBeforeRouteShell(...args);mountAppRoute()};
const screenBeforeRouteShell=renderScreen;renderScreen=function(...args){screenBeforeRouteShell(...args);mountAppRoute()};
const panelBeforeRouteShell=panel;panel=function(id){for(const p of routeEditor.querySelectorAll('.panel'))p.hidden=p.id!==id;for(const b of routeEditor.querySelectorAll('[data-panel]'))b.classList.toggle('active',b.dataset.panel===id)};
const matchBeforeRouteShell=openExistingMatch;openExistingMatch=function(...args){requestedAppView='match';matchBeforeRouteShell(...args);requestedAppView='match';mountAppRoute()};
const activateBeforeRouteShell=activate;activate=function(...args){requestedAppView='match';activateBeforeRouteShell(...args);requestedAppView='match';mountAppRoute()};
const manageBeforeRouteShell=hubManagement;hubManagement=function(action){manageBeforeRouteShell(action);if(['settings','create-league','create-club'].includes(action)){requestedAppView='management';mountAppRoute()}else mountAppRoute()};
const leagueBeforeRouteShell=manageLeague;manageLeague=function(...args){leagueBeforeRouteShell(...args);requestedAppView='management';mountAppRoute()};
const renderCentreBeforeRouteShell=renderMatchCentre;renderMatchCentre=function(...args){const result=renderCentreBeforeRouteShell(...args);mountAppRoute();return result};
const drawBeforeRouteShell=drawMatchView;drawMatchView=function(...args){drawBeforeRouteShell(...args);mountMatchTab()};
window.addEventListener('resize',sizeClubPage);if(typeof ResizeObserver==='function')new ResizeObserver(sizeClubPage).observe(clubPageHost);
// Back handlers in the original club view update its screen state directly.
document.addEventListener('click',()=>mountAppRoute());
mountAppRoute();
