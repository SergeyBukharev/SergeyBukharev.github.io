const CACHE='agentik-shell-03399a9e569b';
const BASE="/agentik/";
const FILES=["./","./assets/index-BuYKciFN.js","./assets/AgentSelect-DdQl99kq.js","./assets/Agreement-CDKkEUFF.js","./assets/ChatBoard-DRAdUF7L.js","./assets/ChatComposer-9BnDThOv.js","./assets/ChatSuggestions-DF0oZXW_.js","./assets/CodeGate-ZXiHXXxX.js","./assets/FamilyBudget-BF3N40xx.js","./assets/KitPages-DT_pKJd5.js","./assets/LandingShowcase-DbxspCWi.js","./assets/PrivateChat-B_psLc2X.js","./assets/Profile-MMMbvjmc.js","./assets/Rooms-BBr8ySvr.js","./assets/TelegramShare-uBazGLNR.js","./assets/access-contract-DspgfR77.js","./assets/arrow-up-right-CjJ8mWd3.js","./assets/createLucideIcon-CdZcAwMX.js","./assets/download-BFlzBgMT.js","./assets/es2015-B6AYukwx.js","./assets/mini-D8edfcry.js","./assets/shader-D4-cUlhA.js","./assets/AgentSelect-C4sLtSuf.css","./assets/Agreement-CzmxkTmt.css","./assets/ChatBoard-CBEY_D09.css","./assets/ChatSuggestions-Bxlk7KWn.css","./assets/FamilyBudget-DNaHkD13.css","./assets/KitPages-Bwnqtc90.css","./assets/TelegramShare-Dzdnm9K6.css","./assets/index-CDSbZ9ou.css","./assets/inter-cyrillic-wght-normal-DqGufNeO.woff2","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/manrope-cyrillic-wght-normal-Dvxsihut.woff2","./assets/manrope-latin-wght-normal-DHIcAJRg.woff2","./index.html","./capture-guard.js","./favicon.svg","./brand/agentik-wordmark-light.svg","./brand/agentik-wordmark-dark.svg","./illustrations/ideas.svg","./illustrations/history.svg","./illustrations/search.svg","./illustrations/together.svg"];
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