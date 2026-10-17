/* Read-only projections of recorded match actions. No randomness in these views. */
const LivePlayerModel=(()=>{
 const Events=typeof MatchEvents!=='undefined'?MatchEvents:require('./match-events.js');
 function players(m){return ['home','away'].flatMap(side=>{const t=m.data.teams[side];return [...t.players,...(t.substituted||[]),...(t.bench||[])].map(player=>({side,player}))})}
 function stats(m,id){const row=players(m).find(r=>r.player.playerId===id);if(!row)return null;const p=row.player,s={minutes:p.minutes||0,goals:0,assists:0,shots:0,onTarget:0,chances:0,passes:0,accurate:0,touches:0,tackles:0,interceptions:0,clearances:0,recoveries:0,receptions:0,carries:0,dribbles:0,blocks:0,saves:0,penaltySaves:0,fouls:0,foulsWon:0,yellows:0,reds:0,penaltiesWon:0,penaltiesConceded:0,errorShot:0,errorGoal:0,errorPenalty:0,missed:0,lost:0,points:[],activityTracked:m.simulation?.eventSchema>=3};
 for(const e of m.simulation?.events||[]){if(e.playerId===id){if(e.type==='activity'){s.touches+=e.touches||0;s.passes+=e.passes||0;s.accurate+=e.accurate||0;s.lost+=e.lost?1:0;s.points.push({x:e.x,y:e.y,weight:e.touches||1,minute:e.minute});if(e.action==='tackle')s.tackles++;if(e.action==='interception')s.interceptions++;if(e.action==='clearance')s.clearances++;if(e.action==='recovery')s.recoveries++;if(e.action==='reception')s.receptions++;if(e.action==='carry')s.carries++;if(e.action==='dribble')s.dribbles++}if(e.shot){s.touches++;s.points.push({x:e.shotOriginX??e.x,y:e.shotOriginY??e.y,weight:1,minute:e.minute});s.shots++;if(['goal','saved'].includes(e.result))s.onTarget++;if(e.result==='goal')s.goals++;if(e.penalty&&e.result!=='goal')s.missed++}if(e.foul||e.type==='foul')s.fouls++;if(['yellow','second-yellow'].includes(e.type))s.yellows++;if(['red','second-yellow'].includes(e.type))s.reds++;if(e.penaltyAwarded)s.penaltiesConceded++;if(e.type==='error')s[{shot:'errorShot',goal:'errorGoal',penalty:'errorPenalty'}[e.consequence]]++}if(e.assistId===id)s.assists++;if(e.shot&&e.passerId===id)s.chances++;if(e.shot&&e.blockedById===id&&e.result==='blocked'){s.blocks++;if(e.blockedAtX!=null&&e.blockedAtY!=null){s.touches++;s.points.push({x:e.blockedAtX,y:e.blockedAtY,weight:1,minute:e.minute})}}if(e.shot&&shotKeeper(m,e)===id&&e.result==='saved'){s.saves++;const end=Events.trajectory(e)?.end;if(end){s.touches++;s.points.push({x:end.x,y:end.y,weight:1,minute:e.minute})}if(e.penalty)s.penaltySaves++}if(e.type==='foul'&&e.onId===id){s.foulsWon++;if(e.penaltyAwarded)s.penaltiesWon++}}
 s.accuracy=s.passes?s.accurate/s.passes*100:null;return s}
 function highlights(m,id){const all=players(m).filter(r=>r.player.appeared),row=all.find(r=>r.player.playerId===id);if(!row)return [];const s=stats(m,id),rows=all.map(r=>({p:r.player,s:stats(m,r.player.playerId)})),out=[];const add=(text,negative=false)=>out.push({text,negative});for(const [key,name] of [['accurate','passes completed'],['chances','chances created'],['shots','shots'],['tackles','tackles won']]){const maximum=Math.max(...rows.map(r=>r.s[key]));if(maximum>0&&s[key]===maximum)add(`${rows.filter(r=>r.s[key]===maximum).length>1?'Joint-most':'Most'} ${name} (${maximum})`)}if(s.goals>=2)add(`Scored ${s.goals} goals`);if(s.goals&&s.assists)add('Goal and assist');if(s.penaltySaves)add('Saved a penalty');const best=Math.max(...rows.map(r=>Number(r.p.rating.toFixed(1))));if(presentRating(row.player)===best&&s.minutes>0)add(rows.filter(r=>presentRating(r.p)===best).length>1?'Joint highest-rated player':'Highest-rated player');for(const [key,text] of [['errorGoal','Error led to a goal'],['errorPenalty','Error led to a penalty'],['errorShot','Error led to a shot'],['penaltiesConceded','Conceded a penalty'],['missed','Missed a penalty'],['reds','Received a red card']])if(s[key])add(text,true);return out}
 function presentRating(p){return Number(p.rating.toFixed(1))}
 function isMajor(e){return ['goal','yellow','red','second-yellow','injury','substitution','halftime','fulltime'].includes(e.type)||e.penaltyAwarded||e.penalty||(e.type==='error'&&['goal','penalty'].includes(e.consequence))||(e.shot&&(e.xG>=.35||e.xGOT>=.5))}
 function commentary(sim,major=false){return (sim?.events||[]).filter(e=>!major||isMajor(e)).slice().reverse()}
 function shots(m,id){return Events.shots(m.simulation).filter(e=>e.playerId===id)}
 // Older goals may omit keeperId/shot flags. Resolve only from the actual lineup
 // and ordered substitutions, so a replacement keeper never inherits prior goals.
 function shotKeeper(m,e){
  const side=e.side==='home'?'away':'home',rows=players(m).filter(r=>r.side===side&&r.player.position==='GK'),ids=new Set(rows.map(r=>r.player.playerId));
  if(e.keeperId&&ids.has(e.keeperId))return e.keeperId;
  const events=m.simulation?.events||[],incoming=new Set(events.filter(x=>x.type==='substitution'&&x.side===side).map(x=>x.onId)),starting=m.simulation?.starting?.[side];
  const starters=rows.filter(r=>starting?.length?starting.includes(r.player.playerId):!incoming.has(r.player.playerId)&&r.player.appeared!==false&&(r.player.onAt==null||r.player.onAt===0));
  if(starters.length!==1)return '';
  let keeper=starters[0].player.playerId;
  for(const action of events){
   if(action===e||action.id===e.id)return keeper;
   if(action.side!==side)continue;
   if(action.type==='substitution'){
    if(ids.has(action.onId))keeper=action.onId;
    else if(action.playerId===keeper)keeper='';
   }else if(action.playerId===keeper&&(['red','second-yellow'].includes(action.type)||(action.type==='injury'&&action.severity==='serious')))keeper='';
  }
  return '';
 }
 function faced(m,id){return Events.shots(m.simulation).filter(e=>shotKeeper(m,e)===id)}
 function goalkeeper(m,id){
  const row=players(m).find(r=>r.player.playerId===id),list=faced(m,id),onTarget=list.filter(e=>['goal','saved'].includes(e.result)),saves=onTarget.filter(e=>e.result==='saved').length;
  let goals=onTarget.length-saves,unrecordedGoals=0;
  // Score-only older results can supply a total, but never invented shot markers.
  if(row&&m.status==='FT'&&row.player.minutes>0){
   const side=row.side,other=side==='home'?'away':'home',keepers=players(m).filter(r=>r.side===side&&r.player.position==='GK'&&r.player.appeared!==false&&(r.player.minutes>0||m.simulation?.starting?.[side]?.includes(r.player.playerId)));
   const interrupted=(m.simulation?.events||[]).some(e=>e.side===side&&e.playerId===id&&(e.type==='substitution'||['red','second-yellow'].includes(e.type)||(e.type==='injury'&&e.severity==='serious')));
   if(keepers.length===1&&keepers[0].player.playerId===id&&!interrupted){const recorded=Events.shots(m.simulation).filter(e=>e.side===other&&e.result==='goal').length;unrecordedGoals=Math.max(0,(Number(m.data[other+'Score'])||0)-recorded);goals+=unrecordedGoals}
  }
  const facedOnTarget=saves+goals;
  return {shotsFaced:list.length+unrecordedGoals,onTargetFaced:facedOnTarget,saves,goalsConceded:goals,unrecordedGoals,savePercentage:facedOnTarget?saves/facedOnTarget*100:0,penaltiesFaced:list.filter(e=>e.penalty).length,penaltiesSaved:onTarget.filter(e=>e.penalty&&e.result==='saved').length,cleanSheet:m.simulation?.phase==='FT'&&!!row?.player.appeared&&row.player.minutes>0&&goals===0}
 }
 const baseHighlights=highlights;
 function playerHighlights(m,id){const out=baseHighlights(m,id),row=players(m).find(r=>r.player.playerId===id);if(row?.player.position!=='GK')return out;const s=goalkeeper(m,id),list=faced(m,id),keepers=players(m).filter(r=>r.player.position==='GK'&&r.player.appeared&&r.player.minutes>0);if(s.saves)out.push({text:`Made ${s.saves} ${s.saves===1?'save':'saves'}`,negative:false});if(s.cleanSheet)out.push({text:'Kept a clean sheet',negative:false});const best=Math.max(0,...keepers.map(r=>goalkeeper(m,r.player.playerId).saves));if(s.saves&&s.saves===best)out.push({text:keepers.filter(r=>goalkeeper(m,r.player.playerId).saves===best).length>1?'Joint-most saves':'Made the most saves',negative:false});if(list.some(e=>e.result==='saved'&&(e.xG>=.35||e.xGOT>=.5)))out.push({text:'Excellent save from a big chance',negative:false});if(list.some(e=>e.result==='goal'&&e.xG<.1))out.push({text:'Conceded from a low-xG attempt',negative:true});return out}
 return {players,stats,highlights:playerHighlights,isMajor,commentary,shots,faced,goalkeeper};
})();
if(typeof module!=='undefined')module.exports=LivePlayerModel;
