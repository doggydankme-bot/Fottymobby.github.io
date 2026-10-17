const assert=require('node:assert/strict'),{IDBFactory}=require('./.qa/node_modules/fake-indexeddb'),Store=require('./library-storage.js');
(async()=>{
 const idb=new IDBFactory(),legacy='{"version":2,"old":"keep me"}';
 const old={getItem:()=>legacy,setItem(){throw Error('localStorage quota exceeded')}};
 let store=await Store.open(idb,old);assert.equal(store.read(),legacy);
 const large=JSON.stringify({version:2,photo:'a'.repeat(8*1024*1024)});
 await store.write(large);assert.equal(store.read(),large);store.close();
 store=await Store.open(idb,old);assert.equal(store.read(),large);
 await Promise.all([store.write('first'),store.write('second'),store.write(large)]);assert.equal(store.read(),large);
 const queued=store.write('pending');const backToOriginal=store.write(large);await Promise.all([queued,backToOriginal]);assert.equal(store.read(),large);
 store.close();await assert.rejects(store.write('must not replace'),/closed|closing|InvalidStateError/);assert.equal(store.read(),large);
 store=await Store.open(idb,old);assert.equal(store.read(),large);
 await store.commitWithSnapshot('after reset','Reset league',large);assert.equal(store.read(),'after reset');let snapshots=await store.backups();assert.equal(snapshots[0].json,large);assert.equal(snapshots[0].operation,'Reset league');
 await store.commitWithSnapshot('after restore','Restore last backup','after reset');assert.equal((await store.backups())[0].json,'after reset');
 await store.commitWithSnapshot('third','Third','after restore');await store.commitWithSnapshot('fourth','Fourth','third');assert.equal((await store.backups()).length,3);store.close();
 store=await Store.open(idb,old);assert.equal(store.read(),'fourth');assert.equal((await store.backups())[0].operation,'Fourth');store.close();
 await assert.rejects(store.commitWithSnapshot('must fail','Closed store','fourth'));assert.equal(store.read(),'fourth');
 console.log('Passed: legacy migration, 8 MB save, queued writes, atomic reset + recovery snapshots, three-backup retention/reload and failed-write preservation.');
})().catch(error=>{console.error(error);process.exitCode=1});
