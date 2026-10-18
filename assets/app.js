// Detached route views retain their controls while the shared simulator keeps running.
const routeViewRoots=new Set();
const appWorkspace=document.querySelector('main');
const $ = id => document.getElementById(id)||[...routeViewRoots].map(root=>root.id===id?root:root.querySelector('#'+id)).find(Boolean)||null;
const FORMATIONS=['4-4-2','4-3-3','4-2-3-1','4-1-4-1','4-3-2-1','4-5-1','3-5-2','3-4-3','3-4-2-1','5-3-2','5-4-1'];
const initial = {
 home:'Huracán',away:'Gimnasia',homeScore:1,awayScore:2,teamNames:false,clock:'8:47',battery:67,formation:'4-4-2',homeLogo:'',awayLogo:'',
 players:[['Torres',32,6.8,243,440,87],['Auzmendi',29,7,566,440],['Janson',17,7.3,101,682,61],['Seoane',18,7.2,303,682],['Miramón',5,8.2,506,682],['Fernández',8,8.9,708,682],['Torrejón',24,8.3,101,926],['Martínez',21,7.7,303,926],['Conti',13,8.6,506,926],['Steimbach',25,7.6,708,926],['Castillo',15,6.5,405,1168]].map(([name,number,rating,x,y,sub],i)=>({name,number,rating,x,y,sub:sub||'',missed:0,goals:[5,8].includes(i)?1:0,assists:[5,6].includes(i)?1:0,card:i===10?'yellow':'',captain:i===5,star:i===5,photo:''}))
};
let state=structuredClone(initial),selected=0;
try{const saved=JSON.parse(localStorage.getItem('lineup-studio-v1'));if(saved)state=validate(saved)}catch{}
function validate(data){
 if(!data||!Array.isArray(data.players)||data.players.length!==11)throw Error('The project must contain eleven players.');
 const out={...initial};
 for(const k of ['home','away','clock'])out[k]=String(data[k]??initial[k]).slice(0,30);
 for(const k of ['homeScore','awayScore','battery'])out[k]=Math.max(0,Math.min(k==='battery'?100:99,Number(data[k])||0));
 out.teamNames=!!data.teamNames;out.formation=FORMATIONS.includes(data.formation)?data.formation:'4-4-2';
 for(const k of ['homeLogo','awayLogo'])out[k]=safeImage(data[k]);
 out.players=data.players.map(cleanPlayer);
 out.activeSide=data.activeSide==='home'?'home':'away';
 if(data.teams){out.teams={};for(const side of ['home','away']){const team=data.teams[side];if(!team)throw Error('Both team lineups are required.');out.teams[side]=cleanTeam(team);}}
 return out;
}
function cleanPlayer(p,i){const base=initial.players[i%11];return {...base,overallRating:p.overallRating==null?null:Math.round(bound(p.overallRating,1,99)),developmentProgress:bound(p.developmentProgress??0,-.999,.999),ratingHistory:(Array.isArray(p.ratingHistory)?p.ratingHistory:[]).filter(h=>h&&Number.isFinite(Number(h.overallRating))).map(h=>({date:String(h.date||'').slice(0,10),overallRating:Math.round(bound(h.overallRating,1,99)),type:['initial','manual','development'].includes(h.type)?h.type:'initial',...(h.matchId?{matchId:String(h.matchId).slice(0,200)}:{}),...(h.from!=null?{from:Math.round(bound(h.from,1,99))}:{})})),form:p.form&&typeof p.form==='object'?{ratings:(p.form.ratings||[]).slice(0,5).map(n=>bound(n,0,10)),average:p.form.average==null?null:bound(p.form.average,0,10),modifier:bound(p.form.modifier||0,-4,4),label:String(p.form.label||'').slice(0,30)}:null,vacant:!!p.vacant,currentClubId:typeof p.currentClubId==='string'?p.currentClubId.slice(0,200):'',name:String(p.name??'Player').slice(0,26),number:bound(p.number,0,99),rating:bound(p.rating,0,10),goals:bound(p.goals,0,99),assists:bound(p.assists,0,99),missed:bound(p.missed,0,99),sub:p.sub===''||p.sub==null?'':bound(p.sub,0,130),card:['red','yellow','second-yellow'].includes(p.card)?p.card:'',captain:!!p.captain,star:!!p.star,photo:safeImage(p.photo),placeholder:!!p.placeholder,generated:p.generated==null?null:!!p.generated,faceOrigin:['real-pool','uploaded','generated'].includes(p.faceOrigin)?p.faceOrigin:'',faceId:typeof p.faceId==='string'?p.faceId.slice(0,200):'',roleDetail:String(p.roleDetail||'').slice(0,10),baseRating:p.baseRating==null?null:bound(p.baseRating,0,10),playerId:typeof p.playerId==='string'?p.playerId.slice(0,200):'',country:String(p.country||'').slice(0,60),age:p.age==null?null:bound(p.age,10,80),dateOfBirth:typeof p.dateOfBirth==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(p.dateOfBirth)&&Number.isFinite(Date.parse(p.dateOfBirth))?p.dateOfBirth:'',height:p.height==null?null:bound(p.height,140,220),preferredFoot:['Left','Right','Both'].includes(p.preferredFoot)?p.preferredFoot:'',position:['GK','DEF','MID','FWD'].includes(p.position)?p.position:(i===10?'GK':i<2?'FWD':i<6?'MID':'DEF'),x:bound(p.x??base.x,0,809),y:bound(p.y??base.y,0,1280),minutes:p.minutes==null?null:bound(p.minutes,0,120),appeared:p.appeared==null?null:!!p.appeared,sentOff:!!p.sentOff,onAt:p.onAt==null?null:bound(p.onAt,0,120),offAt:p.offAt==null?null:bound(p.offAt,0,120),penaltyGoals:bound(p.penaltyGoals||0,0,99),penaltyAttempts:bound(p.penaltyAttempts||0,0,99),saves:bound(p.saves||0,0,99),injury:['minor','serious'].includes(p.injury)?p.injury:'',injuredAt:p.injuredAt==null?null:bound(p.injuredAt,0,120)}}
function cleanTeam(team){if(!Array.isArray(team.players)||team.players.length!==11)throw Error('Each team needs eleven starters.');return {players:team.players.map(cleanPlayer),formation:FORMATIONS.includes(team.formation)?team.formation:'4-4-2',bench:(Array.isArray(team.bench)?team.bench:[]).slice(0,30).map(cleanPlayer),substituted:(Array.isArray(team.substituted)?team.substituted:[]).slice(0,30).map(cleanPlayer)}}
function bound(v,min,max){return Math.max(min,Math.min(max,Number(v)||0))}
function safeImage(v){return typeof v==='string'&&(/^data:image\/(png|jpeg|webp|gif);base64,/.test(v)||/^https:\/\/static\.wefut\.com\/assets\/images\/fut26\/playeravatars\/\d+\.png(?:\?\d+)?$/.test(v))?v:''}
function save(){try{localStorage.setItem('lineup-studio-v1',JSON.stringify(state));$('save-state').textContent='● Saved on this device'}catch{$('save-state').textContent='Storage full — download a backup';toast('Browser storage is full. Download your project to save it.')}}
function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.remove('visible'),3500)}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function positions(){
 if(state.formation==='4-4-2')return initial.players.map(p=>[p.x,p.y-390]);
 const rows=state.formation.split('-').map(Number).reverse();let pos=[];
 rows.forEach((n,row)=>{for(let i=0;i<n;i++)pos.push([(i+.5)*809/n,50+row*486/(rows.length-1)])});pos.push([405,778]);return pos;
}
function render(){
 $('score').textContent=`${state.homeScore} - ${state.awayScore}`;$('phone-clock').textContent=state.clock;$('phone-battery').textContent=state.battery;$('team-label').textContent=state.teamNames?`${state.home}  ·  ${state.away}`:'';
 for(const side of ['home','away']){const badge=$(side+'-badge');badge.style.backgroundImage=state[side+'Logo']?`url("${state[side+'Logo']}")`:'';badge.style.backgroundSize=state[side+'Logo']?'contain':'';badge.style.backgroundPosition=state[side+'Logo']?'center':'';badge.title=state[side]}
 const historical=typeof displayedMatchLineup==='function'?displayedMatchLineup():null,pos=historical?.slots.map(p=>[p.x,p.y])||positions();$('players').innerHTML=(historical?.players||state.players).map((p,i)=>{
 const nameWidth=Math.max(110,Math.min(188,...pos.filter((point,n)=>n!==i&&point[1]===pos[i][1]).map(point=>Math.abs(point[0]-pos[i][0])-12)));
 const displayedRating=Number(p.rating.toFixed(1));
 const events=[['assist',p.assists,'assist'],['goal',p.goals,'goal']].filter(([,count])=>count>0);
 const stackStep=18;
 const widths=events.map(([,count])=>34+(count-1)*stackStep);
 const stackIcons=(kind,count,step)=>Array.from({length:count},(_,n)=>`<i class="event-icon icon-${kind}" style="left:${n*step}px;z-index:${n}" aria-hidden="true"></i>`).join('');
 const missedStep=p.missed>1?Math.min(18,84/(p.missed-1)):0;
 const missedWidth=34+Math.max(0,p.missed-1)*missedStep;
 const badges=events.map(([kind,count,label],j)=>{
  const left=kind==='assist'?49:119;
  const icons=stackIcons(kind,count,kind==='assist'?-stackStep:stackStep);
  return `<span class="event match-event ${kind}" style="left:${left}px;width:${widths[j]}px" title="${count} ${label}${count>1?'s':''}" aria-label="${count} ${label}${count>1?'s':''}">${icons}</span>`;
 }).join('')+(p.missed?`<span class="event match-event missed" style="left:151px;width:${missedWidth}px" title="${p.missed} missed ${p.missed===1?'penalty':'penalties'}" aria-label="${p.missed} missed ${p.missed===1?'penalty':'penalties'}">${stackIcons('missed',p.missed,missedStep)}</span>`:'');
 return `<button class="player" data-player="${i}" data-match-player-id="${esc(p.playerId||'')}" style="left:${pos[i][0]}px;top:${pos[i][1]}px;--player-name-width:${nameWidth}px" aria-label="Edit ${esc(p.name)}, rating ${p.rating.toFixed(1)}"><span class="portrait ${p.placeholder&&!p.photo?'placeholder':''}" style="${p.photo?`background-image:url('${p.photo}');background-size:cover;background-position:center`:`background-position:-${p.x-52}px -${p.y-52}px`}"></span><span class="rating ${displayedRating<5?'rating-red':p.star?'blue':displayedRating<7?'orange':''}">${p.rating.toFixed(1)}${p.star?' ★':''}</span>${p.sub?`<span class="sub-minute">${p.sub}'</span><span class="sub-event" title="Substituted off at ${p.sub} minutes"><i class="event-icon icon-sub" aria-hidden="true"></i></span>`:''}${badges}${p.card?`<span class="event card" title="${p.card === 'second-yellow' ? 'Sent off: second yellow card' : p.card + ' card'}" aria-label="${p.card === 'second-yellow' ? 'Sent off: second yellow card' : p.card + ' card'}"><i class="card-block ${p.card}"></i></span>`:''}<span class="player-name">${p.captain?'<span class="captain">C</span>':''}<span class="number">${p.number}</span> ${esc(p.name)}</span></button>`
 }).join('');
 $('player-select').innerHTML=state.players.map((p,i)=>`<option value="${i}" ${selected===i?'selected':''}>${p.number} · ${esc(p.name)}</option>`).join('');
}
function fillPlayer(){const p=state.players[selected];for(const key of ['name','number','rating','goals','assists','missed','card','sub'])$(key).value=p[key];for(const key of ['captain','star'])$(key).checked=p[key];$('rating-range').value=p.rating;$('rating-label').textContent=p.rating.toFixed(1)}
function fillMatch(){for(const [id,key] of Object.entries(matchFields))$(id).value=state[key];$('team-names').checked=state.teamNames}
function panel(id){document.querySelectorAll('.panel').forEach(p=>p.hidden=p.id!==id);document.querySelectorAll('[data-panel]').forEach(b=>b.classList.toggle('active',b.dataset.panel===id))}
document.querySelectorAll('[data-panel]').forEach(b=>b.onclick=()=>panel(b.dataset.panel));
const matchFields={home:'home',away:'away','home-score':'homeScore','away-score':'awayScore',clock:'clock',battery:'battery',formation:'formation'};
for(const [id,key] of Object.entries(matchFields))$(id).addEventListener('input',()=>{state[key]=$(id).type==='number'?bound($(id).value,0,id==='battery'?100:99):$(id).value;render();save()});
for(const key of ['name','number','rating','goals','assists','missed','card','sub','captain','star'])$(key).addEventListener('input',()=>{const el=$(key);let value=el.type==='checkbox'?el.checked:el.value;if(el.type==='number'&&!(key==='sub'&&value===''))value=bound(value,Number(el.min),Number(el.max));if(key==='star'&&value)state.players.forEach(p=>p.star=false);if(key==='captain'&&value)state.players.forEach(p=>p.captain=false);state.players[selected][key]=value;if(key==='rating'&&state.players[selected].baseRating!=null)state.players[selected].baseRating=value;$('rating-range').value=state.players[selected].rating;$('rating-label').textContent=state.players[selected].rating.toFixed(1);render();save()});
 $('rating-range').oninput=()=>{$('rating').value=$('rating-range').value;$('rating').dispatchEvent(new Event('input'))};
 $('team-names').onchange=()=>{state.teamNames=$('team-names').checked;render();save()};
 $('player-select').onchange=()=>{selected=Number($('player-select').value);fillPlayer()};
 $('players').onclick=e=>{const p=e.target.closest('[data-player]');if(!p||document.body.classList.contains('clean'))return;selected=Number(p.dataset.player);fillPlayer();$('player-select').value=selected;panel('player-panel');if(innerWidth<681)document.querySelector('.editor').scrollIntoView({behavior:'smooth',block:'start'})};
async function readImage(file){if(!file||!file.type.startsWith('image/'))throw Error('Choose an image file.');if(file.size>15000000)throw Error('Choose an image smaller than 15 MB.');const bitmap=await createImageBitmap(file);const canvas=document.createElement('canvas');const ratio=Math.min(1,400/Math.max(bitmap.width,bitmap.height));canvas.width=Math.round(bitmap.width*ratio);canvas.height=Math.round(bitmap.height*ratio);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();return canvas.toDataURL('image/png')}
for(const id of ['photo','home-logo','away-logo'])$(id).onchange=async()=>{const file=$(id).files[0];if(!file)return;const player=state.players[selected],targetState=state;try{const data=await readImage(file);if(id==='photo')player.photo=data;else targetState[id==='home-logo'?'homeLogo':'awayLogo']=data;render();save();toast('Image updated')}catch(e){toast(e.message)}$(id).value=''};
 $('reset-photo').onclick=()=>{state.players[selected].photo='';render();save();toast('Original photo restored')};
 function resize(){ $('phone').style.transform=`scale(${$('frame').clientWidth/809})` }new ResizeObserver(resize).observe($('frame'));
 function clean(on){document.body.classList.toggle('clean',on);resize()}$('clean').onclick=()=>clean(true);$('exit-clean').onclick=()=>clean(false);document.addEventListener('keydown',e=>{if(e.key==='Escape')clean(false)});
 $('export').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='my-lineup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Project downloaded')};
 $('import').onchange=async()=>{const file=$('import').files[0];if(!file)return;try{if(file.size>20000000)throw Error('This project is too large.');state=validate(JSON.parse(await file.text()));selected=0;render();fillPlayer();fillMatch();save();toast('Project imported')}catch(e){toast('Could not import: '+e.message)}$('import').value=''};
 $('reset').onclick=()=>{if(!confirm('Reset all edits to the original screenshot? Download your project first if you want to keep it.'))return;state=structuredClone(initial);selected=0;render();fillPlayer();fillMatch();save();toast('Original lineup restored')};
render();fillPlayer();fillMatch();resize();




