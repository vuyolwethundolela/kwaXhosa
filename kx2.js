(function(){
"use strict";
const $=i=>document.getElementById(i),GK=(window.KX_CONFIG||{}).gmapsKey||"";
const BR=[["King Korn","food"],["Iwisa","food"],["Ace","food"],["Navada","attire"],["SAB","drink"],["Viceroy","drink"]];
const CH=[["Pick n Pay",/pick\s*n\s*pay|pnp/i],["Shoprite",/shoprite/i],["Checkers",/checkers/i],["Boxer",/boxer/i],["Spar",/\bspar\b|superspar|kwikspar/i]];
let FC=null,gp=null,ai=0;
Object.assign(I18N.en,{popia:"Your location stays on your device. To find nearby stores, the area you search is sent to OpenStreetMap and Google Maps services (POPIA).",l_consent:"I am the host, or have the host’s permission, to show this event and the contact number publicly.",brands_p:"Trusted names Xhosa families buy from for the gathering. Alcohol brands are 18+. Please drink responsibly."});
document.querySelectorAll("[data-t]").forEach(n=>n.textContent=L(n.dataset.t));
const age=()=>{try{return sessionStorage.getItem("kx_18")==="1"}catch(e){return false}};
function chainOf(t){const n=(t.name||"")+" "+(t.brand||""),c=CH.find(x=>x[1].test(n));if(!c)return null;const liq=t.shop==="alcohol"||/liquor|tops/i.test(n);return{chain:liq?(c[0]==="Spar"?"Tops at Spar":c[0]+" Liquor"):c[0],kind:liq?"drink":"food"}}
async function stores(c,km){const key="kxs:"+c[0].toFixed(2)+","+c[1].toFixed(2)+","+km;
 try{const s=sessionStorage.getItem(key);if(s)return JSON.parse(s)}catch(e){}
 const q=`[out:json][timeout:25];nwr(around:${km*1000},${c[0]},${c[1]})["shop"]["name"~"Shoprite|Checkers|Spar|Boxer|Pick n Pay|PnP|Tops|Liquor",i];out center tags 300;`;
 const r=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",body:"data="+encodeURIComponent(q)});if(!r.ok)throw 0;
 const j=await r.json(),out=[];j.elements.forEach(e=>{const t=e.tags||{},k=chainOf(t),la=e.lat!=null?e.lat:e.center&&e.center.lat,lo=e.lon!=null?e.lon:e.center&&e.center.lon;if(!k||la==null)return;
 out.push({...k,name:t.name||k.chain,lat:la,lng:lo,addr:[t["addr:street"],t["addr:suburb"]||t["addr:city"]].filter(Boolean).join(", "),phone:t.phone||t["contact:phone"]||""})});
 try{sessionStorage.setItem(key,JSON.stringify(out))}catch(e){}return out}
async function brandStores(){if(!window.sb)return[];try{const{data}=await sb.from("brand_stores").select("*");return(data||[]).map(s=>({chain:s.brand,kind:"attire",name:s.name,addr:s.address||"",lat:s.lat,lng:s.lng,phone:s.phone||""}))}catch(e){return[]}}
function gm(){if(!GK)return Promise.reject();if(window.google&&google.maps&&google.maps.Map)return Promise.resolve();
 return gp=gp||new Promise((ok,no)=>{window.__kxm=ok;const s=document.createElement("script");s.src="https://maps.googleapis.com/maps/api/js?key="+encodeURIComponent(GK)+"&callback=__kxm";s.onerror=no;document.head.appendChild(s)})}
async function geo(q){q=(q||"").trim();if(!q)return null;
 const p=findPlace(q);if(p&&TOWNS[p])return{n:p,lat:TOWNS[p][0],lng:TOWNS[p][1]};const pc=/^\d{4}$/.test(q);
 if(GK){try{await gm();const r=await new google.maps.Geocoder().geocode({address:q,componentRestrictions:{country:"ZA"}}),x=r.results[0];if(x)return{n:pc?q:x.address_components[0].long_name,lat:x.geometry.location.lat(),lng:x.geometry.location.lng()}}catch(e){}}
 try{const r=await(await fetch("https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=za&"+(pc?"postalcode="+q:"q="+encodeURIComponent(q)))).json();if(r[0])return{n:pc?q:(r[0].display_name||q).split(",")[0],lat:+r[0].lat,lng:+r[0].lon}}catch(e){}
 return null}
function drawMap(id,pts,c){const el=$(id);if(!el)return;
 gm().then(()=>{const m=new google.maps.Map(el,{center:{lat:c[0],lng:c[1]},zoom:6,mapTypeControl:false,streetViewControl:false}),b=new google.maps.LatLngBounds(),iw=new google.maps.InfoWindow(),ic=(f,s)=>({path:google.maps.SymbolPath.CIRCLE,scale:s,fillColor:f,fillOpacity:1,strokeColor:"#fff",strokeWeight:2});
  pts.forEach(p=>{const k=new google.maps.Marker({map:m,position:{lat:p.lat,lng:p.lng},title:p.t,icon:ic(p.c,9)});b.extend(k.getPosition());k.addListener("click",()=>{iw.setContent(p.h);iw.open(m,k)})});
  let n=pts.length;if(st.loc){new google.maps.Marker({map:m,position:{lat:st.loc[0],lng:st.loc[1]},title:"You",icon:ic("#1E4D9B",7)});b.extend({lat:st.loc[0],lng:st.loc[1]});n++}
  if(n>1)m.fitBounds(b,48);else if(n===1){m.setCenter(b.getCenter());m.setZoom(12)}}).catch(()=>{el.innerHTML='<p class="meta" style="padding:16px">The live Google map switches on when a Maps key is added to config.js (gmapsKey).</p>'})}
function finder(o){o=o||{};const sel=st.fb||[];return `<section id="fd" class="finder"><h2>${o.title||L("brands_h")}</h2><p class="meta">${L("brands_p")}</p>
${o.fixed?"":`<form id="fq" class="search"><label class="sr" for="fqi">Town, suburb or postal code</label><input id="fqi" placeholder="Town, suburb or postal code"><button class="btn blue" type="submit">Search</button><button class="btn pri" type="button" id="fgeo">Use my location</button></form>`}
<div class="brands" role="group" aria-label="Brands" style="margin-top:12px"><button class="bchip" data-fb="all" aria-pressed="${!sel.length}">All brands</button>${BR.map(b=>`<button class="bchip" data-fb="${b[0]}" aria-pressed="${sel.includes(b[0])}">${b[0]}</button>`).join("")}</div>
<div class="filters"><div><label for="fr">Distance</label><select id="fr">${[10,25,50,100].map(d=>`<option value="${d}">${d} km</option>`).join("")}</select></div></div>
<div class="tabs"><button data-fv="list" aria-pressed="${st.fv!=="map"}">List</button><button data-fv="map" aria-pressed="${st.fv==="map"}">Map</button></div>
<div id="fres" aria-live="polite"></div><div id="fmap" class="gmap" hidden></div></section>`}
async function refresh(){const box=$("fres"),mp=$("fmap");if(!box)return;
 if(!FC){box.innerHTML='<p class="meta">Set your location or type a town above to see stores near you.</p>';return}
 const sel=st.fb||[],kinds=new Set(sel.length?sel.map(n=>BR.find(b=>b[0]===n)[1]):["food","drink","attire"]),km=+(st.fr||50);
 box.innerHTML='<p class="meta">Finding stores…</p>';let it=[];
 try{it=await stores(FC,km)}catch(e){box.innerHTML='<p class="err">We couldn’t load stores right now. Please try again.</p>';return}
 const ex=kinds.has("attire")?await brandStores():[];if($("fres")!==box)return;
 const nm=k=>BR.filter(b=>b[1]===k&&(!sel.length||sel.includes(b[0]))).map(b=>b[0]).join(", "),lock=!age()&&kinds.has("drink");
 let all=[...it,...ex].filter(s=>kinds.has(s.kind)&&(s.kind!=="drink"||!lock)).map(s=>({...s,d:hav(FC[0],FC[1],s.lat,s.lng)})).filter(s=>s.d<=km).sort((a,b)=>a.d-b.d).slice(0,60);
 const cd=s=>`<article class="card"><div class="bd"><span class="chip">${esc(s.chain)}</span><h3>${esc(s.name)}</h3>${s.addr?`<p class="meta">${esc(s.addr)}</p>`:""}<p class="meta"><span class="dist">${Math.round(s.d)} km</span> · ${s.kind==="attire"?"Confirmed by brand":"Likely stocked: "+esc(nm(s.kind))}</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"><a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}">Get directions</a>${s.phone?`<a class="btn" href="tel:${esc(s.phone.replace(/[^\d+]/g,""))}">Call</a>`:""}</div></div></article>`;
 let h="";
 if(lock)h+=`<div class="notice"><span>Liquor stores are shown to people aged 18 or older. Please drink responsibly.</span><button class="btn pri" id="age">I’m 18 or older</button></div>`;
 if(kinds.has("attire"))h+=`<div class="notice"><span>Navada attire is sold in Navada’s own stores.</span><a class="btn" target="_blank" rel="noopener" href="https://navadaclothing.co.za/store-locator/">Navada store locator</a></div>`;
 h+=all.length?`<p class="meta">${all.length} stores within ${km} km, nearest first. “Likely stocked” means the chain usually carries the brand; ask in store.</p><div class="grid">${all.map(cd).join("")}</div>`:(lock?"":`<p>No stores found within ${km} km. <button class="skip" id="wider">Search wider</button></p>`);
 const map=st.fv==="map";box.innerHTML=h;box.hidden=map;mp.hidden=!map;
 const a=$("age");if(a)a.onclick=()=>{try{sessionStorage.setItem("kx_18","1")}catch(e){}refresh()};
 const w=$("wider");if(w)w.onclick=()=>{st.fr="100";$("fr").value="100";refresh()};
 if(map)drawMap("fmap",all.map(s=>({lat:s.lat,lng:s.lng,t:s.name,c:s.kind==="drink"?"#B3261E":"#1E4D9B",h:`<strong>${esc(s.name)}</strong><br>${esc(s.chain)} · ${Math.round(s.d)} km`})),FC)}
function initFinder(c){FC=c;const fr=$("fr");fr.value=st.fr||"50";fr.onchange=()=>{st.fr=fr.value;refresh()};
 document.querySelectorAll("[data-fb]").forEach(b=>b.onclick=()=>{const n=b.dataset.fb,s=st.fb||[];st.fb=n==="all"?[]:s.includes(n)?s.filter(x=>x!==n):[...s,n];document.querySelectorAll("[data-fb]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.fb==="all"?!st.fb.length:st.fb.includes(x.dataset.fb)));refresh()});
 document.querySelectorAll("[data-fv]").forEach(b=>b.onclick=()=>{st.fv=b.dataset.fv;document.querySelectorAll("[data-fv]").forEach(x=>x.setAttribute("aria-pressed",x===b));refresh()});
 const fq=$("fq");if(fq){fq.onsubmit=async e=>{e.preventDefault();const g=await geo($("fqi").value);if(g)setLoc(g.n,g.lat,g.lng);else toast("We couldn’t find that place. Try a nearby town or a 4-digit postal code.")};$("fgeo").onclick=locate}
 refresh()}
function strip(){const a=BR.map(b=>b[0]).sort(()=>Math.random()-.5),r=[...a,...a];return `<section class="strip" aria-label="Our partners"><p class="meta">Our partners</p><div class="strip-vp"><div class="strip-tk">${r.map(n=>`<a class="strip-i" href="#buy" data-b="${n}">${n}</a>`).join("")}</div></div></section>`}
const oh=home,oe=events,od=detail,ol=list;
window.band=()=>'<div style="height:40px"></div>';
window.list=()=>{let r=ol();if(st.q){const q=st.q.toLowerCase();r=r.filter(e=>(e.title+" "+e.town+" "+(e.host||"")).toLowerCase().includes(q))}return r};
window.home=()=>oh().replace("</section>","</section>"+strip()).replace(/<section><h2>Where to buy near you<\/h2>[\s\S]*?<\/section>/,finder());
window.events=()=>(st.q?`<p class="meta">Showing results for “${esc(st.q)}” <button class="skip" id="clrq">Clear</button></p>`:"")+oe()+finder({title:"Where to buy near you"});
window.mapView=()=>'<div id="gmap" class="gmap" role="region" aria-label="Map of events"></div>';
window.detail=id=>{const h=od(id);return EVENTS.find(x=>x.id===id)?h+`<div id="dmap" class="gmap small" role="region" aria-label="Event location"></div><p><button class="btn" id="rep">Report this event</button></p>`+finder({title:"Get your supplies near this event",fixed:1}):h};
window.adCard=()=>{const n=BR[ai++%BR.length][0];return `<aside class="ad" aria-label="Brand spotlight"><small>Brand spotlight</small><strong style="font:800 20px Fraunces,serif">${n}</strong><span>Find ${n} near your gathering.</span><a class="btn" href="#buy" data-b="${n}">Where to buy</a></aside>`};
window.buy=()=>`<h1 style="margin-top:24px">Where to buy</h1>`+finder({title:"Find your brands near you"});
function after(r,id){
 let fc=st.loc;if(r==="event"){const e=EVENTS.find(x=>x.id===id);fc=e?[e.lat,e.lng]:null}
 if(r==="events"&&st.view==="map")drawMap("gmap",list().map(e=>({lat:e.lat,lng:e.lng,t:e.title,c:"#D9731F",h:`<strong>${esc(e.title)}</strong><br>${esc(e.town)}<br><a href="#event/${e.id}">Open event</a>`})),st.loc||[-30.5,25]);
 if(r==="event"&&fc){const e=EVENTS.find(x=>x.id===id);drawMap("dmap",[{lat:fc[0],lng:fc[1],t:e.title,c:"#D9731F",h:`<strong>${esc(e.title)}</strong>`}],fc);
  const p=$("rep");if(p)p.onclick=async()=>{const w=prompt("What is wrong with this event?");if(!w)return;if(!window.sb)return toast("Reports are saved once Supabase is connected.");const{error}=await sb.from("reports").insert({event_id:id,reason:w.slice(0,300)});toast(error?"We couldn’t send the report.":"Thanks. We will review it.")}}
 if($("fd"))initFinder(fc);
 const sf=$("sf");if(sf)sf.onsubmit=async e=>{e.preventDefault();const q=$("q").value.trim();st.q=q;
  if(q&&!EVENTS.some(x=>(x.title+x.town+(x.host||"")).toLowerCase().includes(q.toLowerCase()))){const g=await geo(q);if(g){st.q="";setLoc(g.n,g.lat,g.lng)}}
  if(location.hash==="#events")render();else location.hash="events"};
 const c=$("clrq");if(c)c.onclick=()=>{st.q="";render()}}
window.render=()=>{const h=location.hash.slice(1)||"home",[r,id]=h.split("/"),app=$("app");
 app.innerHTML=r==="events"?events():r==="post"?post():r==="gallery"?gallery():r==="event"?detail(id):r==="buy"?buy():home();
 document.querySelectorAll("nav a").forEach(a=>a.removeAttribute("aria-current"));
 document.querySelectorAll(`nav a[data-r="${r==="event"?"events":r}"]`).forEach(c=>c.setAttribute("aria-current","page"));
 bind(r);after(r,id)};
document.addEventListener("click",e=>{const a=e.target.closest("[data-b]");if(a){st.fb=[a.dataset.b];if(location.hash==="#buy")setTimeout(render,0)}});
document.querySelector("header nav").insertAdjacentHTML("beforeend",'<a href="#buy" data-r="buy">Where to buy</a>');
document.querySelector("nav.tabbar").insertAdjacentHTML("beforeend",'<a href="#buy" data-r="buy"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14l-1 13H6zM9 7a3 3 0 0 1 6 0"/></svg>Buy</a>');
document.querySelector("footer .wrap").insertAdjacentHTML("beforeend",'<p class="meta">Store locations © OpenStreetMap contributors. Maps by Google.</p>');
render();updLoc();
})();
