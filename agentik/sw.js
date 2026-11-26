const CACHE='agentik-shell-e51d477bfbf5';
const BASE="/agentik/";
const FILES=["./","./assets/index-B28VFiNZ.js","./assets/AgentSelect-Co__4L0X.js","./assets/Agreement-DURQpkTF.js","./assets/ChatBoard-B6ueqdG6.js","./assets/ChatComposer-B0Lpv7bZ.js","./assets/ChatSuggestions-D0Xb0qLv.js","./assets/CodeGate-Cjc8tJJI.js","./assets/FamilyBudgetDialog-BZWQIXI4.js","./assets/KitPages-C2nQlI_F.js","./assets/LandingShowcase-CgMbBP3R.js","./assets/Modal-2fUb4DWr.js","./assets/PrivateChat-DHqchFmT.js","./assets/Profile-nvLsv3CN.js","./assets/Rooms-ly5_qs8T.js","./assets/TelegramShare-B1l5dCDC.js","./assets/access-contract-DspgfR77.js","./assets/arrow-up-right-CjJ8mWd3.js","./assets/createLucideIcon-CdZcAwMX.js","./assets/download-BFlzBgMT.js","./assets/mini-D8edfcry.js","./assets/shader-BpfCOS0d.js","./assets/table-2-DfFU4VCj.js","./assets/AgentSelect-CL6xn4T0.css","./assets/Agreement--Sbb_YNC.css","./assets/ChatBoard-ui-Wn-9-.css","./assets/ChatSuggestions-Bxlk7KWn.css","./assets/FamilyBudgetDialog-CSQHwz4n.css","./assets/KitPages-DWv_Em0c.css","./assets/TelegramShare-CSWanGVJ.css","./assets/index-CqfLuky6.css","./assets/inter-cyrillic-wght-normal-DqGufNeO.woff2","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/manrope-cyrillic-wght-normal-Dvxsihut.woff2","./assets/manrope-latin-wght-normal-DHIcAJRg.woff2","./index.html","./capture-guard.js","./favicon.svg","./brand/agentik-wordmark-light.svg","./brand/agentik-wordmark-dark.svg","./illustrations/ideas.svg","./illustrations/history.svg","./illustrations/search.svg","./illustrations/together.svg"];
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