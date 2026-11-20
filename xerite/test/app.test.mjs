// node xerite/test/app.test.mjs   (web/ qovluğundan)
//
// 20.11 P2 düzəlişlərinin davranış testləri — real app.js / views/*.js / assets/site/site.js kodu,
// brauzer və CDN asılılıqları test/stub-loader.mjs ilə saxtalanır. Şəbəkəyə və bazaya HEÇ NƏ getmir.
//  S3 — ana səhifə kartı 15 dəq-dən köhnə statusu «bu an boş» kimi göstərmir
//  W1 — kataloq / operator xətasında «yüklənir…» əvəzinə xəta + «Yenidən cəhd et»
//  W2 — hesab dəyişəndə köhnə hesabın gecikmiş cavabı yeni hesaba yazılmır
//  W3 — ünvan təkliflərində köhnə sorğunun gec cavabı yenisini üstələmir
//  S7 — bloq yazısının paylaşma linki kanonik /bloq/<slug>/ səhifəsidir
import { register } from 'node:module';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

register('./stub-loader.mjs', import.meta.url);

// ---- minimal brauzer mühiti (yalnız App konstruktoru + yoxlanan metodlar üçün)
const ORIGIN = 'https://doldur.pro-tech.az';
globalThis.location = { origin: ORIGIN, pathname: '/xerite/', search: '', href: ORIGIN + '/xerite/', hostname: 'doldur.pro-tech.az' };
globalThis.history = { replaceState() {}, pushState() {} };
globalThis.localStorage = { getItem: () => null, setItem() {} };
globalThis.window = globalThis;
globalThis.window.matchMedia = () => ({ matches: false, addEventListener() {} });
globalThis.window.scrollTo = () => {};
globalThis.document = { getElementById: () => null, title: '', addEventListener() {}, removeEventListener() {}, visibilityState: 'visible' };
globalThis.__api = {};

await import('../app.js');
const App = globalThis.__App;
assert.ok(App, 'App sinfi tutulmadı');

let n = 0;
const t = async (name, fn) => { await fn(); n++; console.log('✓', name); };
const tick = () => new Promise((r) => setTimeout(r, 0));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function deferred() { let res; const p = new Promise((r) => { res = r; }); p.resolve = res; return p; }
const mk = () => new App();

// ------------------------------------------------------------------- W1 --
await t('W1: kataloq xətası → «Kataloq yüklənir…» YOX, xəta + «Yenidən cəhd et»; təkrar cəhd uğurlu olanda kataloq gəlir', async () => {
  const a = mk();
  globalThis.__api = { vehicleCatalog: () => Promise.resolve({ error: { code: 'offline' } }) };
  await a.loadCatalog();
  a.setState({ carPicker: true });
  let out = a.render();
  assert.ok(!out.includes('Kataloq yüklənir…'), '«yüklənir» əbədi qalır');
  assert.ok(out.includes('Maşın kataloqu yüklənmədi'));
  assert.ok(out.includes('Yenidən cəhd et'));
  const v = a.renderVals();
  globalThis.__api = { vehicleCatalog: () => Promise.resolve({ data: { brands: [], popular_brands: [] } }) };
  await v.retryCatalog();
  assert.equal(a.state.catalogErr, null);
  assert.deepEqual(a.state.catalog, { brands: [], popular_brands: [] });
  out = a.render();
  assert.ok(!out.includes('Maşın kataloqu yüklənmədi'));
});
await t('W1: kataloq hələ gəlməyibsə (xəta yoxdur) «Kataloq yüklənir…» qalır', async () => {
  const a = mk();
  a.setState({ carPicker: true });
  const out = a.render();
  assert.ok(out.includes('Kataloq yüklənir…'));
  assert.ok(!out.includes('Maşın kataloqu yüklənmədi'));
});
await t('W1 (eyni sinif): operator siyahısı gəlməsə «Operatorlar yüklənir…» YOX, xəta + «Yenidən cəhd et»', async () => {
  const a = mk();
  globalThis.__api = { operators: () => Promise.resolve({ error: { code: 'relay_503' } }) };
  await a.loadOperators();
  a.setState({ page: 'ops', stations: [{ id: 's1', operator_name: 'iVolt', connectors: [] }], loading: false });
  const out = a.render();
  assert.ok(!out.includes('Operatorlar yüklənir…'));
  assert.ok(out.includes('Operator məlumatı yüklənmədi'));
  let called = 0;
  globalThis.__api = { operators: () => { called++; return Promise.resolve({ data: [{ name: 'iVolt' }] }); } };
  await a.renderVals().retryOps();
  await tick();
  assert.equal(called, 1);
  assert.equal(a.state.opsErr, null);
});

// ------------------------------------------------------------------- W2 --
await t('W2: A çıxıb B daxil olur, A-nın gec gələn profil/favorit cavabı B-yə YAZILMIR', async () => {
  const a = mk();
  const D = { profile: {}, favs: {} };
  globalThis.__api = {
    profile: (uid) => (D.profile[uid] = deferred()),
    userVehicles: () => Promise.resolve({ data: [] }),
    favoriteStations: () => { const d = deferred(); D.favs[a._uid] = d; return d; },
  };
  a.onSession({ user: { id: 'A' } });
  a.onSession(null);
  a.onSession({ user: { id: 'B' } });
  D.profile.B.resolve({ data: { id: 'B', name: 'Bəxtiyar' } });
  D.favs.B.resolve({ data: [{ id: 'b1' }] });
  await tick();
  D.profile.A.resolve({ data: { id: 'A', name: 'Aysel' } });
  D.favs.A.resolve({ data: [{ id: 'a1' }, { id: 'a2' }] });
  await tick(); await tick();
  assert.equal(a.state.user.id, 'B');
  assert.equal(a.state.profile.name, 'Bəxtiyar');
  assert.deepEqual(a.state.favIds, ['b1']);
});
await t('W2: çıxışdan sonra köhnə hesabın tarixçə cavabı ekrana YAZILMIR', async () => {
  const a = mk();
  const h = deferred();
  globalThis.__api = { history: () => h, monthlySummary: () => Promise.resolve({ data: [] }), favoriteStations: () => Promise.resolve({ data: [] }) };
  a.onSession({ user: { id: 'A' } });
  a.setState({ page: 'hist' });
  const p = a.loadHist();
  a.onSession(null);
  h.resolve({ data: [{ id: 'sessA' }] });
  await p;
  assert.equal(a.state.user, null);
  assert.equal(a.state.hist, null);
  assert.equal(a.state.accLoading, false);
});

// ------------------------------------------------------------------- W3 --
await t('W3: «Gən» → «Gəncə»: «Gən»in gec gələn cavabı «Gəncə» təkliflərini ÜSTƏLƏMİR', async () => {
  const a = mk();
  const D = {};
  globalThis.__api = { searchPlaces: (q) => (D[q] = deferred()) };
  a.placeSearch('to', 'Gən');
  await sleep(470); // debounce 450 ms → «Gən» sorğusu yola düşür
  assert.ok(D['Gən'], '«Gən» sorğusu getmədi');
  a.placeSearch('to', 'Gəncə');
  await sleep(470);
  D['Gəncə'].resolve({ data: [{ label: 'Gəncə', latitude: 40.68, longitude: 46.36, kind: 'city' }] });
  await tick(); await tick();
  D['Gən'].resolve({ data: [{ label: 'Gənclik m.', latitude: 40.4, longitude: 49.85, kind: 'poi' }] });
  await tick(); await tick();
  assert.deepEqual(a.state.rSug.to.map((x) => x.label), ['Gəncə']);
});
await t('W3: yer seçiləndən sonra gedən axtarışın cavabı təklif siyahısını yenidən AÇMIR', async () => {
  const a = mk();
  const D = {};
  globalThis.__api = { searchPlaces: (q) => (D[q] = deferred()) };
  a.placeSearch('to', 'Şəki');
  await sleep(470);
  a.choosePlace('to', { label: 'Şəki', lat: 41.19, lng: 47.17 });
  D['Şəki'].resolve({ data: [{ label: 'Şəki', latitude: 41.19, longitude: 47.17, kind: 'city' }] });
  await tick(); await tick();
  assert.deepEqual(a.state.rSug.to, []);
});

// ------------------------------------------------------------------- S7 --
await t('S7: bloq yazısının paylaşma linki kanonik /bloq/<slug>/ (statik səhifənin canonical-ı ilə eyni)', async () => {
  const a = mk();
  const posts = JSON.parse(readFileSync(new URL('../posts.json', import.meta.url), 'utf8')).posts;
  assert.ok(posts.length > 0);
  for (const p of posts) {
    const sh = a.shareFor('post', Object.assign({ cat: p.cat || 'Bələdçi', read: '3 dəq', cover: '' }, p));
    assert.equal(sh.url, ORIGIN + p.url, p.slug);
    assert.ok(!sh.url.includes('?p=post'), p.slug);
    const html = readFileSync(new URL('../..' + p.url + 'index.html', import.meta.url), 'utf8');
    const canon = (/<link rel="canonical" href="([^"]+)"/.exec(html) || [])[1];
    assert.equal(sh.url, canon, p.slug + ': canonical fərqlidir');
  }
  // url sahəsi olmayan köhnə yazı → əvvəlki ?p=post linki (sınmır)
  assert.equal(a.shareFor('post', { title: 'x', cat: 'Bələdçi', read: '1 dəq', slug: 'y' }).url, ORIGIN + '/xerite/?p=post&slug=y');
});

// ------------------------------------------------------------------- S3 --
// assets/site/site.js — ana səhifənin «bu an ən ucuz boş DC» kartı (vm-də, saxta DOM + fetch ilə)
function runSiteCard(stations) {
  const mkEl = (tag) => ({ tag, attrs: {}, kids: [], textContent: '', className: '', setAttribute(k, v) { this.attrs[k] = v; }, getAttribute(k) { return this.attrs[k]; }, appendChild(c) { this.kids.push(c); return c; }, addEventListener() {} });
  const parts = { '.live-list': mkEl('ul'), '.live-stamp': mkEl('span'), '.live-title': mkEl('span'), '.live-src': mkEl('p') };
  const card = Object.assign(mkEl('div'), { querySelector: (q) => parts[q] || null });
  card.attrs['data-state'] = 'static';
  let done; const finished = new Promise((r) => { done = r; });
  const ctx = {
    document: { documentElement: mkEl('html'), getElementById: (id) => (id === 'live' ? card : null), createElement: mkEl },
    localStorage: { getItem: () => null, setItem() {} },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    AbortController, setTimeout, clearTimeout: (x) => { clearTimeout(x); },
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve(stations) }).finally(() => setTimeout(done, 5)),
  };
  ctx.window = ctx;
  vm.runInNewContext(readFileSync(new URL('../../assets/site/site.js', import.meta.url), 'utf8'), ctx);
  return finished.then(() => ({ state: card.attrs['data-state'], foot: parts['.live-src'].textContent, rows: parts['.live-list'].kids.length }));
}
const stationAt = (id, minAgo) => ({
  id, name: 'Məkan ' + id, operator_name: 'iVolt', access_note: null,
  status_updated_at: new Date(Date.now() - minAgo * 60000).toISOString(),
  tariff: { price_per_kwh: 0.3, is_stale: false },
  connectors: [{ current_kind: 'dc', count_available: 2, power_kw: 120 }],
});
await t('S3: ana səhifə kartı — 40 dəq əvvəlki status «bu an boş» kimi GÖSTƏRİLMİR (statik variant qalır)', async () => {
  const r = await runSiteCard([stationAt('a', 40)]);
  assert.equal(r.state, 'static');
});
await t('S3: ana səhifə kartı — 10 dəq əvvəlki status canlı göstərilir, alt mətn «son 15 dəqiqədə»', async () => {
  const r = await runSiteCard([stationAt('a', 10), stationAt('b', 40)]);
  assert.equal(r.state, 'live');
  assert.equal(r.rows, 1);
  assert.match(r.foot, /Status son 15 dəqiqədə operatordan gəlib/);
});

console.log(`\n${n} test keçdi`);
