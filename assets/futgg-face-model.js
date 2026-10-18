/* Adapted from D:/fc26/scripts/import-promos.mjs's FUT.GG item mapping.
   Reads permitted LOCAL exports only. No site/API/image requests. */
const FutggFaces=(()=>{
 const text=v=>String(v??'').normalize('NFKC').replace(/\s+/g,' ').trim();
 function normalCard(p){return p&&p.gender===1&&(p.club||p.uniqueClub)?.isWomen===false&&[0,1].includes(p.rarityEaId)&&p.isSpecial===false&&!p.isEvolutionPlayerItem&&!(p.club||p.uniqueClub)?.isIconClub&&Number(p.overall)>=75&&Number(p.overall)<=99&&Number(p.basePlayerEaId)>0&&Number(p.eaId)===Number(p.basePlayerEaId)}
 function eligibleFace(f){return f?.source==='FUT.GG'&&f.gender==='male'&&f.tier==='gold'&&f.kind==='head'&&f.headOnly===true&&f.sourceGender===1&&f.isSpecial===false&&[0,1].includes(f.cardRarityId)&&f.rarity===(f.cardRarityId===1?'gold-rare':'gold-common')&&Number(f.overallRating)>=75&&Number(f.overallRating)<=99&&/^\d+$/.test(String(f.sourcePlayerId))}
 function fromExport(input){
  const data=Array.isArray(input?.data)?input.data:input?.players,heads=input?.heads;
  if(!Array.isArray(data)||!Array.isArray(heads))throw Error('FUT.GG local export needs data (player records) and heads (embedded local head images).');
  const faces=[],used=new Set(),photos=new Set();let rejected=0;
  for(const p of data){if(!normalCard(p)){rejected++;continue}const sourcePlayerId=String(p.basePlayerEaId),head=heads.find(h=>String(h.sourcePlayerId)===sourcePlayerId);if(!head||head.kind!=='head'||head.headOnly!==true||typeof head.photo!=='string'||!/^data:image\/(png|webp|jpeg);base64,/.test(head.photo)){rejected++;continue}if(used.has(sourcePlayerId)||photos.has(head.photo))continue;used.add(sourcePlayerId);photos.add(head.photo);
   faces.push({id:'futgg-gold-'+sourcePlayerId,name:text(p.cardName||[p.firstName,p.lastName].filter(Boolean).join(' ')||p.slug),sourceName:text(p.cardName||[p.firstName,p.lastName].filter(Boolean).join(' ')),photo:head.photo,source:'FUT.GG',sourcePlayerId,sourceNationality:text(p.nation?.name),gender:'male',sourceGender:1,tier:'gold',rarity:p.rarityEaId===1?'gold-rare':'gold-common',cardRarityId:p.rarityEaId,isSpecial:false,kind:'head',headOnly:true,overallRating:Number(p.overall),sourceUrl:'https://www.fut.gg/players/'+encodeURIComponent(p.slug||p.game+'-'+p.eaId)+'/',image:typeof head.image==='string'&&/^\/(?:public\/)?player-faces\/[a-zA-Z0-9/_-]+\.(?:png|webp|jpe?g)$/.test(head.image)?head.image:'',sha256:head.sha256||''});
  }
  return {faces,rejected};
 }
 function pool(pack){return (pack||[]).filter(eligibleFace)}
 return {normalCard,eligibleFace,fromExport,pool};
})();
if(typeof module!=='undefined')module.exports=FutggFaces;
