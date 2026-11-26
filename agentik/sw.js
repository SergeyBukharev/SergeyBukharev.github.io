const CACHE='agentik-shell-32efa25797c9';
const BASE="/agentik/";
const FILES=["./","./assets/index-DMjkvtjH.js","./assets/AgentSelect-UQ3cLSMB.js","./assets/Agreement-Cd_NEyWA.js","./assets/ChatBoard-BTD6a7o0.js","./assets/ChatComposer-D6hdRDCr.js","./assets/ChatSuggestions-CPgBAi2V.js","./assets/CodeGate-B7bphcKY.js","./assets/FamilyBudget-CmV0Ja4u.js","./assets/KitPages-CzSZjFAj.js","./assets/LandingShowcase-CSlaCMbo.js","./assets/PrivateChat-BxSbOlnq.js","./assets/Profile-DobDFnrj.js","./assets/Rooms-KESgkALY.js","./assets/TelegramShare-BRJ0iLWT.js","./assets/access-contract-Bs-KpIjI.js","./assets/arrow-up-right-CjJ8mWd3.js","./assets/createLucideIcon-CdZcAwMX.js","./assets/dist-DlA5j6mP.js","./assets/download-BFlzBgMT.js","./assets/es2015-B6AYukwx.js","./assets/mini-D8edfcry.js","./assets/shader-FjX_-bd4.js","./assets/AgentSelect-C4sLtSuf.css","./assets/Agreement-CzmxkTmt.css","./assets/ChatBoard-CBEY_D09.css","./assets/ChatSuggestions-Bxlk7KWn.css","./assets/FamilyBudget-DNaHkD13.css","./assets/KitPages-Bwnqtc90.css","./assets/TelegramShare-Cuq7WQ9D.css","./assets/index-BXKdENtA.css","./assets/inter-cyrillic-wght-normal-DqGufNeO.woff2","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/manrope-cyrillic-wght-normal-Dvxsihut.woff2","./assets/manrope-latin-wght-normal-DHIcAJRg.woff2","./index.html","./capture-guard.js","./favicon.svg","./brand/agentik-wordmark-light.svg","./brand/agentik-wordmark-dark.svg","./illustrations/ideas.svg","./illustrations/history.svg","./illustrations/search.svg","./illustrations/together.svg"];
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