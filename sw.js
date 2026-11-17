const C="kx-v2",A=["./","index.html","kx2.js","kx2.css","config.js","manifest.webmanifest","icon.svg","icon-192.png","img/ceremony.webp","img/ceremony-480.webp","img/cooking.webp","img/cooking-480.webp","img/blankets.webp","img/blankets-480.webp","img/decor.webp","img/decor-480.webp"];
self.addEventListener("install",e=>e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(e.request.method!=="GET"||u.origin!==location.origin)return;
e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request).then(m=>m||caches.match("index.html"))))});
