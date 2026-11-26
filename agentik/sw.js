const CACHE='agentik-shell-8e32a906a199';
const BASE="/agentik/";
const FILES=["./","./assets/index-BYjYEbd2.js","./assets/AgentSelect-BtwHDtIP.js","./assets/Agreement-7YDRnM_9.js","./assets/ChatBoard-EC9nPPyL.js","./assets/ChatComposer-B9OxUuT7.js","./assets/ChatSuggestions-CSZRRZXS.js","./assets/CodeGate-I2dUtYll.js","./assets/FamilyBudget-B5IAgYnR.js","./assets/KitPages-DSsPSJFr.js","./assets/LandingShowcase-CuVokpPu.js","./assets/PrivateChat-BjXyRJq9.js","./assets/Profile-iJorg8kg.js","./assets/Rooms-D7r4BDyy.js","./assets/TelegramShare-pbaPN3ml.js","./assets/access-contract-DspgfR77.js","./assets/arrow-up-right-CjJ8mWd3.js","./assets/createLucideIcon-CdZcAwMX.js","./assets/download-BFlzBgMT.js","./assets/es2015-B6AYukwx.js","./assets/mini-D8edfcry.js","./assets/shader-D4-cUlhA.js","./assets/AgentSelect-C4sLtSuf.css","./assets/Agreement-CzmxkTmt.css","./assets/ChatBoard-CBEY_D09.css","./assets/ChatSuggestions-Bxlk7KWn.css","./assets/FamilyBudget-DNaHkD13.css","./assets/KitPages-Bwnqtc90.css","./assets/TelegramShare-Cuq7WQ9D.css","./assets/index-B_kNJAtn.css","./assets/inter-cyrillic-wght-normal-DqGufNeO.woff2","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/manrope-cyrillic-wght-normal-Dvxsihut.woff2","./assets/manrope-latin-wght-normal-DHIcAJRg.woff2","./index.html","./capture-guard.js","./favicon.svg","./brand/agentik-wordmark-light.svg","./brand/agentik-wordmark-dark.svg","./illustrations/ideas.svg","./illustrations/history.svg","./illustrations/search.svg","./illustrations/together.svg"];
const OPTIONAL=["./assets/pdf-YwugTw7Y.js","./assets/pdf.worker.min-DZoZyNqR.js","./assets/pdf.worker.min-CIqJB0yW.mjs"];
const ASSETS=new Set([...FILES.slice(1),...OPTIONAL].map(path=>BASE+path.slice(2)));
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('agentik-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(BASE)||request.headers.has('Authorization')||url.pathname.includes('/api/'))return;
  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      if(url.pathname===BASE+'widget.html'&&ASSETS.has(url.pathname)){
        const widget=await cache.match(url.pathname);
        if(widget)return widget;
        return fetch(request);
      }
      const shell=await cache.match(BASE);
      if(shell) return url.pathname===BASE ? shell : new Response(shell.body,{status:404,headers:shell.headers});
      try{return await fetch(request);}
      catch{return new Response('Agentik недоступен офлайн',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});}
    })());
    return;
  }
  if(ASSETS.has(url.pathname))event.respondWith(caches.open(CACHE).then(async cache=>{
    const cached=await cache.match(request,{ignoreVary:true});
    if(cached)return cached;
    const response=await fetch(request);
    if(response.ok)event.waitUntil(cache.put(request,response.clone()));
    return response;
  }));
});