const CACHE='agentik-shell-23e3195d95de';
const BASE="/agentik/";
const FILES=["./","./assets/index-Bo2ABrIM.js","./assets/AgentSelect-sR62hujN.js","./assets/Agreement-BEGsQe2n.js","./assets/ChatBoard-BurihDLZ.js","./assets/ChatComposer-BiUOgKLW.js","./assets/ChatSuggestions-COCm3BIi.js","./assets/CodeGate-D_ZARDaj.js","./assets/FamilyBudgetDialog-DVmpmwoe.js","./assets/KitPages-BWkACr6v.js","./assets/LandingShowcase-D7nzNazk.js","./assets/Modal-2fUb4DWr.js","./assets/PrivateChat-CluELA0J.js","./assets/Profile-32tRQfNR.js","./assets/Rooms-sY2Y_ezs.js","./assets/TelegramShare-CmvJcRA4.js","./assets/access-contract-DspgfR77.js","./assets/arrow-up-right-CjJ8mWd3.js","./assets/createLucideIcon-CdZcAwMX.js","./assets/download-BFlzBgMT.js","./assets/mini-D8edfcry.js","./assets/shader-D4-cUlhA.js","./assets/table-2-DfFU4VCj.js","./assets/AgentSelect-C4sLtSuf.css","./assets/Agreement-CzmxkTmt.css","./assets/ChatBoard-ui-Wn-9-.css","./assets/ChatSuggestions-Bxlk7KWn.css","./assets/FamilyBudgetDialog-CSQHwz4n.css","./assets/KitPages-Bwnqtc90.css","./assets/TelegramShare-Dzdnm9K6.css","./assets/index-BnqPVD-p.css","./assets/inter-cyrillic-wght-normal-DqGufNeO.woff2","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/manrope-cyrillic-wght-normal-Dvxsihut.woff2","./assets/manrope-latin-wght-normal-DHIcAJRg.woff2","./index.html","./capture-guard.js","./favicon.svg","./brand/agentik-wordmark-light.svg","./brand/agentik-wordmark-dark.svg","./illustrations/ideas.svg","./illustrations/history.svg","./illustrations/search.svg","./illustrations/together.svg"];
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