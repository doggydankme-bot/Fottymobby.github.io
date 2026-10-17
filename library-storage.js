/* Transactional library storage, without localStorage's small per-key quota. */
const LibraryStorage=(()=>{
 const databaseName='lineup-studio',storeName='saves',recordKey='library-v2';
 async function open(indexedDB,legacyStorage){
  if(!indexedDB)throw Error('This browser does not support IndexedDB. Open the app in a current browser.');
  const db=await new Promise((resolve,reject)=>{const request=indexedDB.open(databaseName,1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(storeName))request.result.createObjectStore(storeName)};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error||Error('Could not open browser storage.'));request.onblocked=()=>reject(Error('Close other tabs of this app and reload to finish opening storage.'))});
  db.onversionchange=()=>db.close();
  let cached=await new Promise((resolve,reject)=>{const tx=db.transaction(storeName,'readonly'),request=tx.objectStore(storeName).get(recordKey);request.onsuccess=()=>resolve(request.result??null);request.onerror=()=>reject(request.error)});
  let queue=Promise.resolve();
  const api={read:()=>cached,write(json){const operation=queue.catch(()=>{}).then(()=>{if(json===cached)return;return new Promise((resolve,reject)=>{const tx=db.transaction(storeName,'readwrite');tx.oncomplete=()=>{cached=json;resolve()};tx.onerror=()=>reject(tx.error||Error('Could not save the library.'));tx.onabort=()=>reject(tx.error||Error('Saving was cancelled.'));tx.objectStore(storeName).put(json,recordKey)})});queue=operation;return operation},flush:()=>queue,close:()=>db.close()};
  api.backups=async()=>{await queue;return new Promise((resolve,reject)=>{const tx=db.transaction(storeName,'readonly'),r=tx.objectStore(storeName).get('recovery-v1');r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error)})};
  api.commitWithSnapshot=(json,operation,before=cached)=>{const task=queue.catch(()=>{}).then(()=>new Promise((resolve,reject)=>{const tx=db.transaction(storeName,'readwrite'),store=tx.objectStore(storeName),r=store.get('recovery-v1');r.onsuccess=()=>{const recent=r.result||[];if(before)recent.unshift({id:crypto.randomUUID(),createdAt:new Date().toISOString(),operation:String(operation).slice(0,160),json:before});store.put(recent.slice(0,3),'recovery-v1');store.put(json,recordKey)};tx.oncomplete=()=>{cached=json;resolve()};tx.onerror=()=>reject(tx.error||Error('Recovery snapshot could not be saved. Nothing was reset.'));tx.onabort=()=>reject(tx.error||Error('Operation cancelled. Nothing was reset.'))}));queue=task;return task};
  // Preserve the old copy. It is only a migration source, never a write target.
  if(cached===null){let legacy=null;try{legacy=legacyStorage?.getItem('lineup-studio-library-v2')}catch{}if(legacy)await api.write(legacy)}
  return api;
 }
 return {open};
})();
if(typeof module!=='undefined')module.exports=LibraryStorage;
