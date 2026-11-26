const CACHE='agentik-shell-7d9d7351f5aa';
const BASE="/agentik/";
const FILES=["./","./assets/index-l0bqUTPw.js","./assets/AgentSelect-DzGRaEMq.js","./assets/Agreement-BadUXqY_.js","./assets/ChatBoard-DBUePkug.js","./assets/ChatComposer-B0shc3fR.js","./assets/ChatSuggestions-D41vMpt1.js","./assets/CodeGate-M-lajIzh.js","./assets/FamilyBudgetDialog-D6Cz_5Li.js","./assets/KitPages-B84-VvD8.js","./assets/LandingShowcase-Bi0sAxKJ.js","./assets/Modal-2fUb4DWr.js","./assets/PrivateChat-Bi5vv1xX.js","./assets/Profile-B6XaBUzw.js","./assets/Rooms-C9EHa8cK.js","./assets/TelegramShare-BJypcuQ5.js","./assets/access-contract-DspgfR77.js","./assets/arrow-up-right-CjJ8mWd3.js","./assets/createLucideIcon-CdZcAwMX.js","./assets/download-BFlzBgMT.js","./assets/mini-D8edfcry.js","./assets/shader-D4-cUlhA.js","./assets/table-2-DfFU4VCj.js","./assets/AgentSelect-C4sLtSuf.css","./assets/Agreement-CzmxkTmt.css","./assets/ChatBoard-ui-Wn-9-.css","./assets/ChatSuggestions-Bxlk7KWn.css","./assets/FamilyBudgetDialog-CSQHwz4n.css","./assets/KitPages-Bwnqtc90.css","./assets/TelegramShare-Dzdnm9K6.css","./assets/index-29WgJzGY.css","./assets/inter-cyrillic-wght-normal-DqGufNeO.woff2","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/manrope-cyrillic-wght-normal-Dvxsihut.woff2","./assets/manrope-latin-wght-normal-DHIcAJRg.woff2","./index.html","./capture-guard.js","./favicon.svg","./brand/agentik-wordmark-light.svg","./brand/agentik-wordmark-dark.svg","./illustrations/ideas.svg","./illustrations/history.svg","./illustrations/search.svg","./illustrations/together.svg"];
const OPTIONAL=["./assets/pdf-YwugTw7Y.js","./assets/pdf.worker.min-DZoZyNqR.js","./assets/pdf.worker.min-CIqJB0yW.mjs"];
const ASSETS=new Set([...FILES.slice(1),...OPTIONAL].map(path=>BASE+path.slice(2)));
const previousCaches=async()=>(await caches.keys()).filter(key=>key.startsWith('agentik-shell-')&&key!==CACHE);
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const existed=await caches.has(CACHE);
  const cache=await caches.open(CACHE);
  try{
    await cache.addAll(FILES.map(path=>new Request(new URL(path,self.location.href),{cache:'reload'})));
  }catch(error){
    if(!existed)await caches.delete(CACHE);
    throw error;
  }
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  // A tab may still be running the preceding build and need its lazy chunks.
  const state=await caches.open('agentik-worker-state');
  const active=await (await state.match(self.location.href))?.text();
  const older=await previousCaches();
  const keep=older.includes(active)?active:older.at(-1);
  await state.put(self.location.href,new Response(CACHE));
  await Promise.all(older.filter(key=>key!==keep).map(key=>caches.delete(key)));
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(BASE)||request.headers.has('Authorization')||url.pathname.includes('/api/')||url.pathname.startsWith(BASE+'share/'))return;
  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      let online;
      try{
        online=await fetch(request,{cache:'no-cache'});
        if(online.status<500)return online;
      }catch{ /* Recover with the installed release while offline. */ }
      const cache=await caches.open(CACHE);
      if(url.pathname===BASE+'widget.html'&&ASSETS.has(url.pathname)){
        const widget=await cache.match(url.pathname);
        if(widget)return widget;
      }
      const shell=await cache.match(BASE);
      if(shell)return url.pathname===BASE?shell:new Response(shell.body,{status:404,headers:shell.headers});
      return online??new Response('Agentik недоступен офлайн',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});
    })());
    return;
  }
  const currentAsset=ASSETS.has(url.pathname);
  const fingerprinted=url.pathname.startsWith(BASE+'assets/');
  if(currentAsset||fingerprinted)event.respondWith(caches.open(CACHE).then(async cache=>{
    const cached=await cache.match(request,{ignoreVary:true});
    if(cached)return cached;
    if(fingerprinted){
      for(const name of (await previousCaches()).reverse()){
        const previous=await caches.open(name);
        const oldAsset=await previous.match(request,{ignoreVary:true});
        if(oldAsset)return oldAsset;
      }
    }
    const response=await fetch(request);
    if(response.ok&&currentAsset)event.waitUntil(cache.put(request,response.clone()));
    return response;
  }));
});