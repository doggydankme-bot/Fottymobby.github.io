const $ = id => document.getElementById(id);
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
 out.teamNames=!!data.teamNames;out.formation=['4-4-2','4-3-3','4-2-3-1','3-5-2'].includes(data.formation)?data.formation:'4-4-2';
 for(const k of ['homeLogo','awayLogo'])out[k]=safeImage(data[k]);
 out.players=data.players.map((p,i)=>({...initial.players[i],name:String(p.name??'Player').slice(0,26),number:bound(p.number,0,99),rating:bound(p.rating,0,10),goals:bound(p.goals,0,9),assists:bound(p.assists,0,9),missed:bound(p.missed,0,9),sub:p.sub===''?'':bound(p.sub,1,130),card:['red','yellow','second-yellow'].includes(p.card)?p.card:'',captain:!!p.captain,star:!!p.star,photo:safeImage(p.photo),placeholder:!!p.placeholder}));
 out.activeSide=data.activeSide==='home'?'home':'away';
 if(data.teams){out.teams={};for(const side of ['home','away']){const team=data.teams[side];if(!team)throw Error('Both team lineups are required.');const checked=validate({players:team.players,formation:team.formation});out.teams[side]={players:checked.players,formation:checked.formation};}}
 return out;
}
function bound(v,min,max){return Math.max(min,Math.min(max,Number(v)||0))}
function safeImage(v){return typeof v==='string'&&/^data:image\/(png|jpeg|webp|gif);base64,/.test(v)?v:''}
function save(){try{localStorage.setItem('lineup-studio-v1',JSON.stringify(state));$('save-state').textContent='● Saved on this device'}catch{$('save-state').textContent='Storage full — download a backup';toast('Browser storage is full. Download your project to save it.')}}
function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.remove('visible'),3500)}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function positions(){
 if(state.formation==='4-4-2')return initial.players.map(p=>[p.x,p.y-390]);
 const rows={'4-3-3':[3,3,4],'4-2-3-1':[1,3,2,4],'3-5-2':[2,5,3]}[state.formation];let pos=[];
 rows.forEach((n,row)=>{for(let i=0;i<n;i++)pos.push([(i+.5)*809/n,50+row*486/(rows.length-1)])});pos.push([405,778]);return pos;
}
function render(){
 $('score').textContent=`${state.homeScore} - ${state.awayScore}`;$('phone-clock').textContent=state.clock;$('phone-battery').textContent=state.battery;$('team-label').textContent=state.teamNames?`${state.home}  ·  ${state.away}`:'';
 for(const side of ['home','away']){const badge=$(side+'-badge');badge.style.backgroundImage=state[side+'Logo']?`url("${state[side+'Logo']}")`:'';badge.style.backgroundSize=state[side+'Logo']?'contain':'';badge.style.backgroundPosition=state[side+'Logo']?'center':'';badge.title=state[side]}
 const pos=positions();$('players').innerHTML=state.players.map((p,i)=>{
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
 }).join('')+(p.missed?`<span class="event match-event missed" style="left:${166-missedWidth}px;width:${missedWidth}px" title="${p.missed} missed ${p.missed===1?'penalty':'penalties'}" aria-label="${p.missed} missed ${p.missed===1?'penalty':'penalties'}">${stackIcons('missed',p.missed,missedStep)}</span>`:'');
 return `<button class="player" data-player="${i}" style="left:${pos[i][0]}px;top:${pos[i][1]}px" aria-label="Edit ${esc(p.name)}, rating ${p.rating.toFixed(1)}"><span class="portrait ${p.placeholder&&!p.photo?'placeholder':''}" style="${p.photo?`background-image:url('${p.photo}');background-size:cover;background-position:center`:`background-position:-${p.x-52}px -${p.y-52}px`}"></span><span class="rating ${p.rating<5?'rating-red':p.star?'blue':p.rating<7?'orange':''}">${p.rating.toFixed(1)}${p.star?' ★':''}</span>${p.sub?`<span class="sub-minute">${p.sub}'</span><span class="sub-event" title="Substituted off at ${p.sub} minutes"><i class="event-icon icon-sub" aria-hidden="true"></i></span>`:''}${badges}${p.card?`<span class="event card" title="${p.card === 'second-yellow' ? 'Sent off: second yellow card' : p.card + ' card'}" aria-label="${p.card === 'second-yellow' ? 'Sent off: second yellow card' : p.card + ' card'}"><i class="card-block ${p.card}"></i></span>`:''}<span class="player-name">${p.captain?'<span class="captain">C</span>':''}<span class="number">${p.number}</span> ${esc(p.name)}</span></button>`
 }).join('');
 $('player-select').innerHTML=state.players.map((p,i)=>`<option value="${i}" ${selected===i?'selected':''}>${p.number} · ${esc(p.name)}</option>`).join('');$('formation-caption').textContent=state.formation.replaceAll('-','–');
}
function fillPlayer(){const p=state.players[selected];for(const key of ['name','number','rating','goals','assists','missed','card','sub'])$(key).value=p[key];for(const key of ['captain','star'])$(key).checked=p[key];$('rating-range').value=p.rating;$('rating-label').textContent=p.rating.toFixed(1)}
function fillMatch(){for(const [id,key] of Object.entries(matchFields))$(id).value=state[key];$('team-names').checked=state.teamNames}
function panel(id){document.querySelectorAll('.panel').forEach(p=>p.hidden=p.id!==id);document.querySelectorAll('[data-panel]').forEach(b=>b.classList.toggle('active',b.dataset.panel===id))}
document.querySelectorAll('[data-panel]').forEach(b=>b.onclick=()=>panel(b.dataset.panel));
const matchFields={home:'home',away:'away','home-score':'homeScore','away-score':'awayScore',clock:'clock',battery:'battery',formation:'formation'};
for(const [id,key] of Object.entries(matchFields))$(id).addEventListener('input',()=>{state[key]=$(id).type==='number'?bound($(id).value,0,id==='battery'?100:99):$(id).value;render();save()});
for(const key of ['name','number','rating','goals','assists','missed','card','sub','captain','star'])$(key).addEventListener('input',()=>{const el=$(key);let value=el.type==='checkbox'?el.checked:el.value;if(el.type==='number'&&!(key==='sub'&&value===''))value=bound(value,Number(el.min),Number(el.max));if(key==='star'&&value)state.players.forEach(p=>p.star=false);if(key==='captain'&&value)state.players.forEach(p=>p.captain=false);state.players[selected][key]=value;$('rating-range').value=state.players[selected].rating;$('rating-label').textContent=state.players[selected].rating.toFixed(1);render();save()});
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


