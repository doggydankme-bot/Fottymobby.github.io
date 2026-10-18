/* One-time LOCAL cache builder. Reuses the prior project's FUT.GG schema.
   Usage: node import-futgg-gold.cjs permitted-export.json local-head-folder
   No network, authentication, scraping, or generated-image fallback. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),Faces=require('./futgg-face-model.js');
function build(exportFile,headFolder,root=__dirname){
 if(!exportFile||!headFolder)throw Error('Gold player face library unavailable. Supply a permitted local FUT.GG player export and its head-image folder.');
 const data=JSON.parse(fs.readFileSync(exportFile,'utf8')),headRoot=fs.realpathSync(headFolder);
 if(!Array.isArray(data.heads))throw Error('Export needs a heads array: sourcePlayerId, file, kind: head, headOnly: true.');
 const heads=data.heads.map(h=>{
  if(h.kind!=='head'||h.headOnly!==true)return h;
  if(h.photo)return h;
  const filename=h.file||h.imagePath||'';
  if(!filename||/https?:|player-item-card|simple-card|social-small/i.test(filename))throw Error('Use local head PNG files, not full-card artwork or remote links.');
  const target=fs.realpathSync(path.resolve(headRoot,filename));if(!target.startsWith(headRoot+path.sep))throw Error('Head file must stay inside the selected folder.');
  const bytes=fs.readFileSync(target);validatePNG(bytes);return {...h,photo:'data:image/png;base64,'+bytes.toString('base64')};
 });
 const result=Faces.fromExport({...data,heads});if(result.faces.length<100)throw Error(`Gold player face library unavailable: ${result.faces.length}/100 eligible distinct male normal-Gold heads. Existing cache was kept.`);
 const faces=result.faces.slice(0,100),photos=new Set();for(const f of faces){const bytes=Buffer.from(f.photo.split(',')[1],'base64');validatePNG(bytes);const hash=crypto.createHash('sha256').update(bytes).digest('hex');if(photos.has(hash))throw Error('Duplicate head bytes. Existing cache was kept.');photos.add(hash);f.sha256=hash;f.image='/public/player-faces/futgg-gold/'+f.id+'-'+hash.slice(0,16)+'.png'}
 // Validate the complete batch before writing or replacing any manifest/bundle.
 const folder=path.join(root,'public','player-faces','futgg-gold');fs.mkdirSync(folder,{recursive:true});for(const f of faces)fs.writeFileSync(path.join(folder,path.basename(f.image)),Buffer.from(f.photo.split(',')[1],'base64'));
 const manifest={source:'FUT.GG',status:'ready',count:100,importedAt:new Date().toISOString(),previousImporter:'D:/fc26/scripts/import-promos.mjs',faces:faces.map(({photo,...f})=>f)};
 fs.writeFileSync(path.join(folder,'manifest.json'),JSON.stringify(manifest,null,2));fs.writeFileSync(path.join(folder,'face-pack.json'),JSON.stringify({faces}));
 const temporary=path.join(root,'futgg-face-library.js.tmp');fs.writeFileSync(temporary,'/* Local FUT.GG normal-Gold head cache; no runtime network calls. */\nconst FutggFaceLibrary='+JSON.stringify({...manifest,faces})+';\nif(typeof module!=="undefined")module.exports=FutggFaceLibrary;\n');fs.renameSync(temporary,path.join(root,'futgg-face-library.js'));
 return manifest;
}
function validatePNG(bytes){if(bytes.length<33||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('A head is not a PNG. Convert the actual head layer to PNG first.');const w=bytes.readUInt32BE(16),h=bytes.readUInt32BE(20);if(w<24||h<24||w>4096||h>4096||w/h<.4||w/h>2.5)throw Error('Invalid head image dimensions.');}
if(require.main===module){try{const result=build(process.argv[2],process.argv[3]);console.log('Cached',result.count,'male normal-Gold FUT.GG heads locally. Refresh the app.')}catch(e){console.error(e.message);process.exitCode=1}}
module.exports={build,validatePNG};
