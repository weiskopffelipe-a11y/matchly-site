// MATCHLY — service worker: deixa instalar como aplicativo e mostra os avisos.
// Páginas: tenta a internet primeiro; sem internet, mostra a última versão guardada.
const CACHE = "matchly-v1";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/", "/manifest.webmanifest", "/icon-192.png"])).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then((r) => { const copia = r.clone(); caches.open(CACHE).then((c) => c.put("/", copia)); return r; }).catch(() => caches.match("/")));
    return;
  }
  if (url.pathname.startsWith("/assets/")) {
    // arquivos com nome único por versão: podem ficar guardados
    e.respondWith(caches.match(req).then((achou) => achou || fetch(req).then((r) => { const copia = r.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); return r; })));
  }
});

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { title: "Matchly", body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "Matchly", {
    body: d.body || "", icon: "/icon-192.png", badge: "/icon-192.png", lang: "pt-BR",
    data: { url: d.url || "/" }, tag: d.tag || undefined, renotify: !!d.tag,
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const alvo = new URL(e.notification.data?.url || "/", self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((abertas) => {
    for (const w of abertas) { if (new URL(w.url).origin === self.location.origin) { w.navigate(alvo).catch(() => {}); return w.focus(); } }
    return self.clients.openWindow(alvo);
  }));
});
