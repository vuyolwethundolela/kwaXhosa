const C="kx-v5",A=["./","index.html","manifest.webmanifest","icon-192.png","cooking.webp","blankets.webp","ceremony.webp","decor.webp"];
self.addEventListener("install",e=>e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET"||/config\.js|supabase\.co|openstreetmap\.org|jsdelivr/.test(e.request.url))return;
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{const c2=n.clone();caches.open(C).then(c=>c.put(e.request,c2));return n}).catch(()=>caches.match("index.html"))))
});
