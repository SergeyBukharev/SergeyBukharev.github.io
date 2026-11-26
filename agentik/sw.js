const CACHE='agentik-shell-56801f59d924';
const BASE="/agentik/";
const FILES=["./","./assets/index-COdcejGd.js","./assets/AgentSelect-CT1lG7Bj.js","./assets/Agreement-DiqVWGlf.js","./assets/ChatBoard-Tdutx1Jf.js","./assets/ChatComposer-m6Y-PgJk.js","./assets/ChatSuggestions-BormlkI7.js","./assets/CodeGate-DLumLeL3.js","./assets/FamilyBudget-DSdjUgFG.js","./assets/KitPages-Cd94BJmA.js","./assets/LandingShowcase-CL1lfkLO.js","./assets/PrivateChat-SiH5aRRB.js","./assets/Profile-CEK5vJTb.js","./assets/RoomAccess-CNZbRiO6.js","./assets/Rooms-YRTkWo3K.js","./assets/access-contract-Bs-KpIjI.js","./assets/arrow-up-right-CjJ8mWd3.js","./assets/createLucideIcon-CdZcAwMX.js","./assets/dist-DlA5j6mP.js","./assets/download-BFlzBgMT.js","./assets/es2015-B6AYukwx.js","./assets/mini-D8edfcry.js","./assets/shader-FjX_-bd4.js","./assets/AgentSelect-C4sLtSuf.css","./assets/Agreement-CzmxkTmt.css","./assets/ChatBoard-CBEY_D09.css","./assets/ChatSuggestions-Bxlk7KWn.css","./assets/FamilyBudget-DNaHkD13.css","./assets/KitPages-Cv6bLdqc.css","./assets/RoomAccess-BxnENrSe.css","./assets/index-DjtJAk2w.css","./assets/inter-cyrillic-wght-normal-DqGufNeO.woff2","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/manrope-cyrillic-wght-normal-Dvxsihut.woff2","./assets/manrope-latin-wght-normal-DHIcAJRg.woff2","./index.html","./capture-guard.js","./favicon.svg","./brand/agentik-wordmark-light.svg","./brand/agentik-wordmark-dark.svg","./illustrations/ideas.svg","./illustrations/history.svg","./illustrations/search.svg","./illustrations/together.svg"];
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