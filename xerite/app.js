// Doldur veb — əsas komponent. Dizayn mənbəyi: Claude Design «Doldur Veb.dc.html»
// (`class Component` → bu Preact sinfi; şablon → views/*.js). Nümunə data YOXDUR:
// hər rəqəm canlı Supabase-dən (mobil tətbiqin eyni RPC-ləri) və ya ondan hesablanır.
import { Component, render } from 'https://esm.sh/preact@10.24.3';
import { html } from './lib/h.js';
import * as L from './lib/logic.js';
import * as api from './lib/api.js';
import { DMap } from './lib/map.js';
import { GOOGLE_WEB_CLIENT_ID, APPLE_WEB_SERVICES_ID, APPLE_REDIRECT_URI, BAKU_CENTER, POLL_MS, PLAY_URL, APPSTORE_URL } from './lib/config.js';
import { HeaderView } from './views/header.js';
import { MapView } from './views/map.js';
import { RouteView } from './views/route.js';
import { OpsView } from './views/ops.js';
import { BlogView, PostView } from './views/blog.js';
import { FavsView, HistView } from './views/account.js';
import { ProfileView, LoginView } from './views/profile.js';
import { FooterView, ShareView, CarPickerView, ToastView } from './views/chrome.js';

const LS = {
  get(k, d) { try { const v = localStorage.getItem('doldur.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('doldur.' + k, JSON.stringify(v)); } catch (e) { /* gizli rejim */ } },
};
const PAGES = ['map', 'route', 'ops', 'blog', 'post', 'favs', 'hist', 'profile', 'login'];
const SORT_LABEL = { best: 'qiymət + vaxt balansı', cost: 'ən ucuz əvvəl', dist: 'ən yaxın əvvəl', power: 'ən sürətli əvvəl' };
const REASONS = [['post_broken', 'Post işləmir'], ['price_different', 'Qiymət fərqli idi'], ['spot_occupied', 'Yer tutulub'], ['cable_damaged', 'Kabel zədəli']];
const REASON_LABEL = Object.fromEntries(REASONS);
const ROUTE_PRESETS = ['Qəbələ', 'Şəki', 'Quba', 'Lənkəran', 'Gəncə'];
// Tətbiqin route_screen.dart → routeErrorCopy (AZ mətnləri birə-bir).
const ROUTE_ERR = {
  no_land_route: ['Quru yolla marşrut yoxdur', 'Başlanğıc ilə hədəf arasında Azərbaycan daxilindən keçən quru yol yoxdur (məsələn, Naxçıvan). Hər iki nöqtəni eyni ərazidə seç.'],
  out_of_service_area: ['Yalnız Azərbaycan daxilində', 'Marşrut yalnız Azərbaycan ərazisində qurulur. Başlanğıc və ya hədəf bu ərazidən kənardadır.'],
  snap_too_far: ['Nöqtə yola yaxın deyil', 'Seçilən nöqtə ən yaxın yoldan çox uzaqdır. Yola yaxın bir yer seç.'],
  route_leaves_service_area: ['Yol sərhəddən keçir', 'Bu iki nöqtə arasındakı yol Azərbaycandan kənara çıxır. Başqa nöqtə seç.'],
  battery_unknown: ['Batareya tutumu məlum deyil', 'Seçdiyin maşının batareya tutumu kataloqda yoxdur, ona görə dayanacaqları hesablaya bilmirik. Başqa model seç.'],
  consumption_unknown: ['İstehlak məlumatı yoxdur', 'Bu modelin enerji istehlakı kataloqda yoxdur. Başqa model seç.'],
  vehicle_model_not_found: ['Maşın modeli tapılmadı', 'Seçilmiş model kataloqda tapılmadı. Maşını yenidən seç.'],
  rate_limited: ['Çox sorğu', 'Qısa müddətdə çox marşrut istənildi. Bir az sonra yenidən cəhd et.'],
  routing_failed: ['Yol xidməti cavab vermir', 'Marşrut xidməti hazırda cavab vermir. Bir azdan yenidən cəhd et.'],
  routing_not_configured: ['Yol xidməti cavab vermir', 'Marşrut xidməti hazırda cavab vermir. Bir azdan yenidən cəhd et.'],
  stations_unavailable: ['Stansiya məlumatı yüklənmədi', 'Yol boyu stansiyaları yükləyə bilmədik. Yenidən cəhd et.'],
  no_reachable_stations: ['Bu marşrut mümkün deyil', 'Bu marşrutda maşınına uyğun və çata biləcəyin məsafədə şarj məntəqəsi tapılmadı. Başlanğıc faizini artır və ya başqa hədəf seç.'],
  same_point: ['Başlanğıc və hədəf eynidir', 'Fərqli hədəf seç.'],
  invalid_point: ['Nöqtə qəbul olunmadı', 'Seçilən yerin koordinatı qəbul olunmadı. Yeri yenidən seç.'],
  invalid_soc: ['Batareya faizləri uyğun deyil', 'Başlanğıc faizi minimal gəliş faizindən böyük olmalıdır. Faizləri düzəlt.'],
  offline: ['İnternet yoxdur', 'Marşrutu hesablamaq üçün internet lazımdır. Bağlantını yoxla və yenidən cəhd et.'],
};
const AUTH_ERR = {
  otp_expired: 'Kod yanlışdır və ya vaxtı keçib. Yeni kod istə.',
  over_email_send_rate_limit: 'Çox tez-tez kod istənildi. Bir az gözlə və yenidən cəhd et.',
  over_request_rate_limit: 'Çox sorğu göndərildi. Bir az sonra yenidən cəhd et.',
  email_address_invalid: 'E-poçt ünvanı qəbul olunmadı. Yoxla və yenidən yaz.',
  offline: 'İnternet yoxdur. Bağlantını yoxla.',
};

function baseUrl() { return location.origin + location.pathname.replace(/[^/]*$/, ''); }

class App extends Component {
  constructor() {
    super();
    const theme = LS.get('theme', 'light');
    this.state = {
      page: 'map', sel: null, detail: null, detailLoading: false, detailErr: null, connSel: null, reviews: null,
      q: '', serverHits: null, type: 'all', sock: 'all', onlyFree: false, onlyCompat: true, sort: 'best', opFilter: null, listLimit: 50,
      navOpen: false, share: null, copied: false, toast: null,
      cat: 'Hamısı', postSlug: null, posts: [],
      rFrom: null, rTo: null, rFromQ: 'Bakı', rToQ: '', rSug: { from: [], to: [] }, bat: 80, plan: null, planErr: null, planLoading: false,
      reviewOpen: false, revWorked: null, revReasons: [], revText: '', revBusy: false,
      theme, sysDark: false,
      user: null, profile: null, uvs: [], favIds: [], favs: null, hist: null, monthly: null, accLoading: false,
      loginStep: 0, email: '', code: '', loginBusy: false, loginErr: null,
      carId: LS.get('car', null), socCur: LS.get('socCur', 20), socTgt: LS.get('socTgt', 80),
      stations: [], stationsAt: 0, loadErr: null, loading: true, catalog: null, config: L.DEFAULT_CONFIG, operators: [],
      geo: null, geoBusy: false, scale: { w: '48px', t: '' },
      carPicker: false, carQ: '', opsOpen: null, delOpen: false, delText: '', delBusy: false, googleReady: false,
    };
    this.dmap = new DMap();
    this.dmap.onPick = (id) => this.pick(id);
    this.dmap.onMove = () => { const s = this.dmap.scale(); if (s.w !== this.state.scale.w || s.t !== this.state.scale.t) this.setState({ scale: s }); };
    this.mapRef = (el) => { if (el) { this.dmap.attach(el); this.ensureMap(); } };
    this.gRef = (el) => { this.gHost = el; if (el) this.renderGoogle(); };
    this._rowsKey = null;
    // Yalnız lokal yoxlama bayrağı (URL normallaşdırılmazdan ƏVVƏL oxunur).
    this._debugAutoCalc = location.hostname === '127.0.0.1' && /[?&]debug=1/.test(location.search) && /[?&]autocalc=1/.test(location.search);
    this._rows = [];
  }

  // ------------------------------------------------------------ yaşam dövrü
  componentDidMount() {
    this._key = (e) => { if (e.key === 'Escape') { if (this.state.share) this.setState({ share: null }); else if (this.state.carPicker) this.setState({ carPicker: false }); else if (this.state.sel) this.closeSel(); } };
    window.addEventListener('keydown', this._key);
    try { this._mq = window.matchMedia('(prefers-color-scheme: dark)'); this._mqf = () => this.setState({ sysDark: this._mq.matches }); this._mqf(); this._mq.addEventListener('change', this._mqf); } catch (e) { /* köhnə brauzer */ }
    this._pop = () => this.applyUrl(false);
    window.addEventListener('popstate', this._pop);
    this._vis = () => { if (document.visibilityState === 'visible' && Date.now() - this.state.stationsAt > POLL_MS) this.loadStations(); };
    document.addEventListener('visibilitychange', this._vis);
    this._poll = setInterval(() => { if (document.visibilityState === 'visible' && Date.now() - this.state.stationsAt >= POLL_MS - 2000) this.loadStations(); }, 30000);

    this.applyUrl(true);
    api.track('app_open');
    this.loadStations();
    api.vehicleCatalog().then((r) => { if (r.data) this.setState({ catalog: r.data }); });
    api.costConfig().then((r) => { if (r.data) this.setState({ config: L.configFromJson(r.data) }); });
    api.operators().then((r) => { if (r.data) this.setState({ operators: r.data }); });
    fetch(new URL('./posts.json', import.meta.url)).then((r) => r.json()).then((p) => this.setState({ posts: p.posts || [] })).catch(() => this.setState({ posts: [] }));
    // Məkan icazəsi ARTIQ verilibsə səssizcə al (soruşma pəncərəsi açılmır).
    try { navigator.permissions && navigator.permissions.query({ name: 'geolocation' }).then((p) => { if (p.state === 'granted') this.locate(true); }).catch(() => {}); } catch (e) { /* yoxdur */ }

    api.sb.auth.getSession().then(({ data }) => this.onSession(data && data.session));
    api.sb.auth.onAuthStateChange((_ev, session) => this.onSession(session));
  }
  componentWillUnmount() {
    window.removeEventListener('keydown', this._key);
    window.removeEventListener('popstate', this._pop);
    document.removeEventListener('visibilitychange', this._vis);
    clearInterval(this._poll);
    clearTimeout(this._tt);
  }
  componentDidUpdate(pp, ps) {
    if (this.state.share && !ps.share) { const el = document.getElementById('d-share-close'); el && el.focus(); }
    if (this.state.carPicker && !ps.carPicker) { const el = document.getElementById('d-carq'); el && el.focus(); }
    if (this.dark !== this._lastDark) { this._lastDark = this.dark; this.dmap.setTheme(this.dark, this.c); }
    this.syncMarkers();
    if (ps.page !== this.state.page || ps.sel !== this.state.sel || ps.postSlug !== this.state.postSlug) this.updateTitle();
  }

  ensureMap() {
    if (this._mapInit) return;
    this._mapInit = true;
    this.dmap.init(this.dark, this.c).then(() => { this._lastDark = this.dark; this.dmap.setTheme(this.dark, this.c); this.syncMarkers(true); if (this.state.geo) this.dmap.setUser(this.state.geo.lat, this.state.geo.lng); this.focusSelOnMap(); this.forceUpdate(); });
  }

  // ------------------------------------------------------------- data
  async loadStations() {
    // Keşli relay; 300 s-dən tez və gizli sekmədə yenilənmir (çağıranlar yoxlayır).
    const r = await api.stationsLite();
    if (r.error) { this.setState({ loadErr: r.error, loading: false }); return; }
    this.setState({ stations: r.data || [], stationsAt: Date.now(), loadErr: null, loading: false });
  }

  onSession(session) {
    const user = session ? session.user : null;
    const prev = this.state.user;
    if ((prev && prev.id) === (user && user.id)) return;
    this.setState({ user, profile: null, uvs: [], favIds: [], favs: null, hist: null, monthly: null });
    if (user) {
      api.profile(user.id).then((r) => r.data && this.setState({ profile: r.data }));
      api.userVehicles().then((r) => r.data && this.setState({ uvs: r.data }));
      this.loadFavs();
      if (this.state.page === 'hist') this.loadHist();
      if (this.state.page === 'login') this.go('profile');
    }
  }
  async loadFavs() {
    const r = await api.favoriteStations();
    if (r.data) this.setState({ favs: r.data, favIds: r.data.map((s) => s.id) });
    else this.setState({ favs: [] });
  }
  async loadHist() {
    if (!this.state.user) return;
    this.setState({ accLoading: true });
    const [h, m] = await Promise.all([api.history(0, 50), api.monthlySummary(6)]);
    this.setState({ hist: h.data || [], monthly: m.data || [], accLoading: false, histErr: h.error || null });
  }

  // ------------------------------------------------------------- URL
  urlFor(s) {
    const p = new URLSearchParams();
    if (s.page === 'map') { if (s.sel) p.set('s', s.sel); if (s.opFilter) p.set('op', s.opFilter); }
    else if (s.page === 'post') { p.set('p', 'post'); if (s.postSlug) p.set('slug', s.postSlug); }
    else if (s.page === 'route') {
      p.set('p', 'route');
      if (s.rFrom) { p.set('from', s.rFrom.label); p.set('fll', s.rFrom.lat.toFixed(5) + ',' + s.rFrom.lng.toFixed(5)); }
      if (s.rTo) { p.set('to', s.rTo.label); p.set('tll', s.rTo.lat.toFixed(5) + ',' + s.rTo.lng.toFixed(5)); }
      p.set('bat', String(s.bat));
      if (s.carId) p.set('car', s.carId);
    } else p.set('p', s.page);
    const qs = p.toString();
    return baseUrl() + (qs ? '?' + qs : '');
  }
  pushUrl(replace) {
    const u = this.urlFor(this.state);
    if (u === location.href) return;
    try { history[replace ? 'replaceState' : 'pushState']({}, '', u); } catch (e) { /* file:// */ }
  }
  applyUrl(first) {
    const p = new URLSearchParams(location.search);
    const page = PAGES.includes(p.get('p')) ? p.get('p') : 'map';
    const ll = (v) => { const m = /^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/.exec(v || ''); return m ? { lat: +m[1], lng: +m[2] } : null; };
    const patch = { page, share: null, navOpen: false };
    if (p.get('car')) { patch.carId = p.get('car'); LS.set('car', patch.carId); }
    if (['light', 'dark', 'system'].includes(p.get('theme'))) { patch.theme = p.get('theme'); LS.set('theme', patch.theme); }
    if (page === 'map') {
      patch.opFilter = p.get('op') || null;
      const sid = p.get('s');
      if (sid && sid !== this.state.sel) { this.setState(patch, () => this.pick(sid, { noPush: true })); return; }
      if (!sid) Object.assign(patch, { sel: null, detail: null });
    }
    if (page === 'post') patch.postSlug = p.get('slug');
    if (page === 'route') {
      const f = ll(p.get('fll')), t = ll(p.get('tll'));
      if (f) { patch.rFrom = { label: p.get('from') || 'Başlanğıc', ...f }; patch.rFromQ = patch.rFrom.label; }
      if (t) { patch.rTo = { label: p.get('to') || 'Hədəf', ...t }; patch.rToQ = patch.rTo.label; }
      const b = parseInt(p.get('bat'), 10); if (b >= 10 && b <= 100) patch.bat = b;
      patch.plan = null; patch.planErr = null; // 🔴 marşrut AVTOMATİK hesablanmır (pul xərcləyir)
    }
    // URL-i normallaşdır yalnız state tətbiq olunandan SONRA (əks halda köhnə state ilə yazılır və parametrlər itir).
    this.setState(patch, () => { if (first) this.pushUrl(true); this.afterNav(); });
  }
  afterNav() {
    const pg = this.state.page;
    if (pg === 'hist' && this.state.user && !this.state.hist) this.loadHist();
    if (pg === 'favs' && this.state.user && !this.state.favs) this.loadFavs();
    if (pg === 'route' && !this.state.rFrom && this.state.rFromQ === 'Bakı') {
      // Defolt başlanğıc «Bakı» — koordinatı search_places-dən (keşlənir, səhifəyə bir dəfə).
      this.resolvePlace('Bakı').then((pl) => { if (pl && !this.state.rFrom && this.state.rFromQ === 'Bakı') this.setState({ rFrom: pl }); });
    }
    // Yalnız lokal yoxlama: 127.0.0.1 + ?debug=1&autocalc=1 → «Hesabla» avtomatik (prod domendə İŞLƏMİR).
    if (pg === 'route' && this._debugAutoCalc && !this._autoCalcDone) {
      this._autoCalcDone = true;
      const tryCalc = () => { if (this.car && this.state.rFrom && this.state.rTo) this.calcRoute(); else setTimeout(tryCalc, 300); };
      setTimeout(tryCalc, 300);
    }
  }
  go(page, extra) {
    this.setState(Object.assign({ page, share: null, navOpen: false, carPicker: false }, extra || {}), () => { this.pushUrl(false); this.afterNav(); });
    try { window.scrollTo({ top: 0 }); } catch (e) { /* yoxdur */ }
  }
  updateTitle() {
    const s = this.state;
    const t = { route: 'Marşrut planı', ops: 'Operatorlar', blog: 'Bloq', favs: 'Favoritlər', hist: 'Şarj tarixçəsi', profile: 'Profil', login: 'Daxil ol' }[s.page];
    let title = 'Doldur — EV şarj xəritəsi';
    if (s.page === 'map' && s.sel) { const r = this.rowById(s.sel); if (r) title = r.name + ' — Doldur'; }
    else if (s.page === 'post') { const p = s.posts.find((x) => x.slug === s.postSlug); if (p) title = p.title + ' — Doldur'; }
    else if (t) title = t + ' — Doldur';
    document.title = title;
  }

  // ------------------------------------------------------------- köməkçi
  toast(msg) { clearTimeout(this._tt); this.setState({ toast: msg }); this._tt = setTimeout(() => this.setState({ toast: null }), 2600); }
  get car() {
    const cat = this.state.catalog, id = this.state.carId;
    if (!cat || !id) return null;
    for (const b of cat.brands || []) for (const m of b.models || []) if (m.id === id) return Object.assign({ brand: b.name }, m);
    return null;
  }
  carName(m) { return m ? (m.brand ? m.brand + ' ' : '') + m.name : ''; }

  locate(silent) {
    if (!navigator.geolocation) { if (!silent) this.toast('Brauzer mövqeyi vermir'); return; }
    this.setState({ geoBusy: true });
    navigator.geolocation.getCurrentPosition((pos) => {
      const geo = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      this.setState({ geo, geoBusy: false }); // məsafə brauzerdə hesablanır — yeni sorğu yoxdur
      this.dmap.setUser(geo.lat, geo.lng);
      if (!silent) this.dmap.flyTo(geo.lat, geo.lng, 13);
    }, () => { this.setState({ geoBusy: false }); if (!silent) this.toast('Mövqe alınmadı — məsafə Bakı mərkəzindən sayılır'); }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  }

  rowsCompute() {
    const s = this.state, car = this.car, g = s.geo;
    const key = [s.stationsAt, s.carId, !!car, s.socCur, s.socTgt, g ? g.lat + ',' + g.lng : '', JSON.stringify(s.config)].join('|');
    if (key === this._rowsKey) return this._rows;
    this._rowsKey = key;
    this._rows = s.stations.map((st) => this.rowFor(st, car));
    this._rowIndex = new Map(this._rows.map((r) => [r.id, r]));
    return this._rows;
  }
  rowById(id) { this.rowsCompute(); return this._rowIndex ? this._rowIndex.get(id) : null; }

  distKm(st) {
    // Relay məsafə vermir (keş istifadəçiyə görə deyil) — düz xətt məsafəsi brauzerdə.
    const g = this.state.geo;
    if (g) return L.haversineKm(g.lat, g.lng, st.latitude, st.longitude);
    return L.haversineKm(BAKU_CENTER.lat, BAKU_CENTER.lng, st.latitude, st.longitude);
  }

  rowFor(st, car) {
    const s = this.state, cs = st.connectors || [];
    const status = L.stationStatus(cs), stt = L.statusOf(status);
    const distKm = this.distKm(st);
    const detourKm = s.geo ? distKm : 0; // mövqe yoxdursa yol xərci UYDURULMUR
    const opt = car ? L.bestOption({ station: st, model: car, currentSoc: s.socCur, targetSoc: s.socTgt, detourKm, timeValuePerHour: s.config.defaultTimeValuePerHour, config: s.config }) : null;
    const power = L.maxPowerKw(cs), kind = L.dominantCurrent(cs) === 'dc' ? 'DC' : 'AC';
    const priced = L.tariffShowsNumber(st.tariff);
    return {
      s: st, id: st.id, name: st.name, lat: st.latitude, lng: st.longitude,
      op: L.displayOperator(st.operator_name), opId: st.operator_id,
      status, stLabel: stt.label, stColor: stt.color,
      power, powerT: L.kwText(power), kind, isDc: kind === 'DC',
      hasDc: cs.some((c) => c.current_kind === 'dc'), hasAc: cs.some((c) => c.current_kind === 'ac'),
      types: new Set(cs.map((c) => c.type)),
      distKm, distT: L.distText(distKm),
      restricted: L.accessRestricted(st.access_note), accessNote: st.access_note,
      opt, est: opt ? opt.estimate : null,
      noCompat: !!car && !opt && cs.some((c) => c.status !== 'offline'),
      typeUnknown: !!opt && opt.fit.kind === 'typeUnknown',
      priceT: priced ? L.tariffText(st.tariff.price_per_kwh) : null, price: priced ? st.tariff.price_per_kwh : null,
      fresh: L.freshness(st.status_updated_at),
    };
  }

  // ------------------------------------------------------------- stansiya
  pick(id, opts) {
    const r = this.rowById(id);
    if (id !== this.state.sel) api.track('station_opened', { prefilled: !!r, source: opts && opts.noPush ? 'link' : 'map' });
    this.setState({ sel: id, detail: null, detailErr: null, connSel: null, reviews: null, navOpen: false, reviewOpen: false, revWorked: null, revReasons: [], revText: '', page: 'map' }, () => {
      if (!(opts && opts.noPush)) this.pushUrl(false);
      this.focusSelOnMap();
    });
    if (!r && !this.state.stations.length) { /* hələ yüklənməyib — detal gələndə xəritə fokuslanır */ }
    this.loadDetail(id);
    try { if (window.matchMedia('(max-width: 959px)').matches) { const el = document.getElementById('d-aside'); el && el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } } catch (e) { /* yoxdur */ }
  }
  focusSelOnMap() {
    const s = this.state;
    if (!s.sel) return;
    const r = this.rowById(s.sel), d = s.detail;
    const lat = r ? r.lat : d && d.latitude, lng = r ? r.lng : d && d.longitude;
    if (lat != null) this.dmap.flyTo(lat, lng, 14);
  }
  async loadDetail(id) {
    this.setState({ detailLoading: true });
    const [d, rv] = await Promise.all([api.stationDetail(id), api.reviews(id)]);
    if (this.state.sel !== id) return;
    this.setState({ detail: d.data || null, detailErr: d.error || (d.data ? null : { code: 'station_not_found' }), detailLoading: false, reviews: rv.data || [] }, () => this.focusSelOnMap());
  }
  closeSel() { this.setState({ sel: null, detail: null, navOpen: false, reviewOpen: false }, () => this.pushUrl(false)); }

  async toggleFav(id) {
    if (!this.state.user) { this.toast('Favoritlər üçün daxil ol'); this.go('login'); return; }
    const r = await api.toggleFavorite(id);
    if (r.error) { this.toast('Alınmadı — yenidən cəhd et'); return; }
    const on = r.data === true;
    this.setState({ favIds: on ? [...new Set([...this.state.favIds, id])] : this.state.favIds.filter((x) => x !== id) });
    this.toast(on ? 'Favoritlərə əlavə olundu' : 'Favoritlərdən çıxarıldı');
    this.loadFavs();
  }

  async submitReview(e) {
    e.preventDefault();
    const s = this.state;
    if (!s.user) { this.toast('Rəy üçün giriş lazımdır'); this.go('login'); return; }
    if (s.revWorked == null) { this.toast('Əvvəlcə seç: işlədi, ya yox'); return; }
    this.setState({ revBusy: true });
    const r = await api.insertReview({ stationId: s.sel, worked: s.revWorked, reasons: s.revWorked ? [] : s.revReasons, comment: s.revText });
    this.setState({ revBusy: false });
    if (r.error) {
      const msg = { rate_limited: 'Çox tez-tez rəy yazırsan. Bir az sonra yenidən yoxla.', review_under_moderation: 'Bu rəy yoxlanılır — hələlik dəyişmək olmur.' }[r.error.code] || 'Rəy göndərilmədi — yenidən cəhd et.';
      this.toast(msg); return;
    }
    this.setState({ reviewOpen: false, revWorked: null, revReasons: [], revText: '' });
    this.toast('Rəy göndərildi');
    api.reviews(s.sel).then((x) => x.data && this.setState({ reviews: x.data }));
  }

  // ------------------------------------------------------------- paylaş
  shareFor(kind, obj) {
    const base = baseUrl();
    if (kind === 'st') {
      const r = obj;
      return { head: 'Stansiyanı paylaş', title: r.name, sub: [r.op, r.powerT + ' kW ' + r.kind, r.stLabel].filter(Boolean).join(' · '),
        url: base + '?s=' + encodeURIComponent(r.id), text: r.name + ' — ' + r.powerT + ' kW ' + r.kind + (r.priceT ? ', ' + r.priceT : '') + '. Doldur-da bax:',
        cover: r.isDc ? 'linear-gradient(135deg,#7A3A0C,#FF7A1A)' : 'linear-gradient(135deg,#1B3D7A,#4A8CFF)', glyph: r.powerT };
    }
    if (kind === 'post') return { head: 'Yazını paylaş', title: obj.title, sub: obj.cat + ' · ' + obj.read, url: base + '?p=post&slug=' + encodeURIComponent(obj.slug), text: obj.title, cover: obj.cover, glyph: obj.cat.slice(0, 2).toUpperCase() };
    if (kind === 'route') return { head: 'Marşrutu paylaş', title: obj.title, sub: obj.sub, url: this.urlFor(Object.assign({}, this.state, { page: 'route' })), text: obj.title + ' — ' + obj.sub + '. Doldur marşrut planı:', cover: 'linear-gradient(135deg,#7A4416,#E8963C)', glyph: 'km' };
    return { head: 'Doldur-u paylaş', title: 'Doldur — EV şarj xəritəsi', sub: 'Bütün operatorlar · tam xərc · pulsuz', url: base, text: 'Azərbaycanda ən sərfəli EV şarj stansiyasını tap:', cover: 'linear-gradient(135deg,#0B1518,#12E28C)', glyph: 'D' };
  }
  targets(sh) {
    const u = encodeURIComponent(sh.url), t = encodeURIComponent(sh.text), tu = encodeURIComponent(sh.text + ' ' + sh.url);
    return [
      { label: 'WhatsApp', ab: 'WA', bg: '#25D366', fg: '#0B1518', href: 'https://wa.me/?text=' + tu },
      { label: 'Telegram', ab: 'TG', bg: '#229ED9', fg: '#FFFFFF', href: 'https://t.me/share/url?url=' + u + '&text=' + t },
      { label: 'Facebook', ab: 'f', bg: '#1877F2', fg: '#FFFFFF', href: 'https://www.facebook.com/sharer/sharer.php?u=' + u },
      { label: 'X', ab: 'X', bg: '#0B1518', fg: '#FFFFFF', href: 'https://twitter.com/intent/tweet?text=' + t + '&url=' + u },
      { label: 'LinkedIn', ab: 'in', bg: '#0A66C2', fg: '#FFFFFF', href: 'https://www.linkedin.com/sharing/share-offsite/?url=' + u },
      { label: 'E-poçt', ab: '@', bg: '#E8963C', fg: '#0B1518', href: 'mailto:?subject=' + encodeURIComponent(sh.title) + '&body=' + tu },
    ];
  }
  copy(url) {
    const ok = () => { this.setState({ copied: true }); this.toast('Link kopyalandı'); setTimeout(() => this.setState({ copied: false }), 2000); };
    const fail = () => this.toast('Kopyalamaq alınmadı — linki seçib özün kopyala');
    try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok, fail); else fail(); } catch (e) { fail(); }
  }

  // ------------------------------------------------------------- marşrut
  async placeSearch(which, q) {
    this.setState(which === 'from' ? { rFromQ: q, rFrom: null } : { rToQ: q, rTo: null });
    clearTimeout(this['_ps' + which]);
    if (q.trim().length < 3) { this.setState({ rSug: Object.assign({}, this.state.rSug, { [which]: [] }) }); return; }
    this['_ps' + which] = setTimeout(async () => {
      const r = await this.places(q.trim());
      const seen = new Set();
      const list = (r.data || []).filter((x) => { const k = x.label + '|' + x.latitude + '|' + x.longitude; if (seen.has(k)) return false; seen.add(k); return true; })
        .map((x) => ({ label: x.label, lat: x.latitude, lng: x.longitude, kind: x.kind }));
      this.setState({ rSug: Object.assign({}, this.state.rSug, { [which]: list }) });
    }, 450);
  }
  /** search_places + yaddaş keşi (eyni sorğu təkrar Supabase-ə getmir). */
  places(q) {
    this._placeCache = this._placeCache || new Map();
    const k = q.toLowerCase();
    if (!this._placeCache.has(k)) this._placeCache.set(k, api.searchPlaces(q).then((r) => { if (r.error) this._placeCache.delete(k); return r; }));
    return this._placeCache.get(k);
  }
  choosePlace(which, p) {
    const patch = which === 'from' ? { rFrom: p, rFromQ: p.label } : { rTo: p, rToQ: p.label };
    patch.rSug = Object.assign({}, this.state.rSug, { [which]: [] });
    patch.plan = null; patch.planErr = null;
    this.setState(patch, () => this.pushUrl(true));
  }
  async resolvePlace(label) {
    const r = await this.places(label);
    const x = (r.data || []).find((p) => p.kind === 'city') || (r.data || [])[0];
    return x ? { label: x.label, lat: x.latitude, lng: x.longitude } : null;
  }
  async preset(to) {
    const [a, b] = await Promise.all([this.resolvePlace('Bakı'), this.resolvePlace(to)]);
    if (!a || !b) { this.toast('Yer tapılmadı'); return; }
    this.setState({ rFrom: a, rFromQ: a.label, rTo: b, rToQ: b.label, plan: null, planErr: null }, () => this.pushUrl(true));
  }
  async calcRoute(e) {
    if (e) e.preventDefault();
    const s = this.state, car = this.car;
    if (!car) { this.setState({ carPicker: true }); return; }
    if (!s.rFrom || !s.rTo) { this.toast('Başlanğıc və hədəfi siyahıdan seç'); return; }
    this.setState({ planLoading: true, plan: null, planErr: null });
    const r = await api.routePlan({
      origin: { latitude: s.rFrom.lat, longitude: s.rFrom.lng }, destination: { latitude: s.rTo.lat, longitude: s.rTo.lng },
      vehicle_model_id: car.id, start_soc_percent: s.bat, min_arrival_soc_percent: 20, strategy: 'fastest', adapters: [],
    });
    if (r.error) { this.setState({ planLoading: false, planErr: r.error }); return; }
    const plan = r.data;
    api.track('route_planned', { stops: plan && plan.stops ? plan.stops.filter((x) => x.kind === 'charge').length : 0, feasible: !!(plan && plan.feasible !== false), strategy: 'fastest' });
    this.setState({ planLoading: false, plan, planErr: plan && plan.feasible === false ? { code: plan.reason_code || 'no_reachable_stations', plan } : null });
  }

  // ------------------------------------------------------------- giriş
  async loginSubmit(e) {
    e.preventDefault();
    const s = this.state;
    if (s.loginBusy) return;
    if (s.loginStep === 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.email.trim())) { this.setState({ loginErr: 'E-poçt ünvanını düzgün yaz.' }); return; }
      this.setState({ loginBusy: true, loginErr: null });
      const r = await api.sendEmailCode(s.email);
      if (r.error) { this.setState({ loginBusy: false, loginErr: AUTH_ERR[r.error.code] || 'Kod göndərilmədi — bir az sonra yenidən cəhd et.' }); return; }
      this.setState({ loginBusy: false, loginStep: 1, code: '' });
      this.toast('Kod e-poçtuna göndərildi');
    } else {
      if (s.code.replace(/\D/g, '').length !== 6) return;
      this.setState({ loginBusy: true, loginErr: null });
      const r = await api.verifyEmailCode(s.email, s.code);
      if (r.error) { this.setState({ loginBusy: false, loginErr: AUTH_ERR[r.error.code] || 'Kod qəbul olunmadı. Yoxla və yenidən yaz.' }); return; }
      this.setState({ loginBusy: false, loginStep: 0, code: '' });
      api.track('login', { provider: 'email' });
      this.toast('Xoş gəldin');
      this.go('profile');
    }
  }
  /** Nonce: xamı Supabase-ə, sha256-ı (hex) Google/Apple-a — tətbiqin Apple axını kimi. */
  async newNonce() {
    const raw = Array.from(crypto.getRandomValues(new Uint8Array(32)), (x) => x.toString(16).padStart(2, '0')).join('');
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
    const hashed = Array.from(new Uint8Array(buf), (x) => x.toString(16).padStart(2, '0')).join('');
    return { raw, hashed };
  }
  async socialDone(provider, idToken, rawNonce) {
    this.setState({ loginBusy: true, loginErr: null });
    const r = await api.signInWithIdToken(provider, idToken, rawNonce);
    this.setState({ loginBusy: false });
    if (r.error) {
      this.setState({ loginErr: (provider === 'google' ? 'Google' : 'Apple') + ' ilə giriş alınmadı. E-poçt kodu ilə daxil ola bilərsən.' });
      return;
    }
    api.track('login', { provider });
    this.toast('Xoş gəldin'); this.go('profile');
  }
  loadScript(src) {
    this._scripts = this._scripts || {};
    if (!this._scripts[src]) {
      this._scripts[src] = new Promise((res, rej) => {
        const el = document.createElement('script');
        el.src = src; el.async = true; el.onload = res; el.onerror = rej;
        document.head.appendChild(el);
      });
    }
    return this._scripts[src];
  }
  async renderGoogle() {
    if (!GOOGLE_WEB_CLIENT_ID || !this.gHost) return;
    try { await this.loadScript('https://accounts.google.com/gsi/client'); } catch (e) { this.setState({ googleFailed: true }); return; }
    if (!window.google || !window.google.accounts || !this.gHost) return;
    // Hər render üçün yeni nonce (ID token birdəfəlik istifadə olunur).
    this._gNonce = await this.newNonce();
    window.google.accounts.id.initialize({
      client_id: GOOGLE_WEB_CLIENT_ID,
      nonce: this._gNonce.hashed,
      ux_mode: 'popup',
      callback: (resp) => {
        const raw = this._gNonce && this._gNonce.raw;
        this.socialDone('google', resp.credential, raw).then(() => this.state.page === 'login' && this.renderGoogle());
      },
    });
    this.gHost.innerHTML = '';
    window.google.accounts.id.renderButton(this.gHost, { type: 'standard', theme: this.dark ? 'filled_black' : 'outline', size: 'large', text: 'continue_with', shape: 'rectangular', locale: 'az', width: Math.max(200, Math.min(400, this.gHost.clientWidth || 300)) });
    if (!this.state.googleReady) this.setState({ googleReady: true });
  }
  /** Sign in with Apple JS (popup). Services ID yoxdursa düymə deaktivdir. */
  async appleSignIn() {
    if (!APPLE_WEB_SERVICES_ID) return;
    try {
      await this.loadScript('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js');
      const n = await this.newNonce();
      window.AppleID.auth.init({ clientId: APPLE_WEB_SERVICES_ID, scope: 'name email', redirectURI: APPLE_REDIRECT_URI, usePopup: true, nonce: n.hashed });
      const res = await window.AppleID.auth.signIn();
      const tok = res && res.authorization && res.authorization.id_token;
      if (!tok) throw new Error('no_token');
      await this.socialDone('apple', tok, n.raw);
    } catch (e) {
      if (e && e.error === 'popup_closed_by_user') return;
      this.setState({ loginErr: 'Apple ilə giriş alınmadı. E-poçt kodu ilə daxil ola bilərsən.' });
    }
  }
  async logout() {
    await api.signOut();
    this.setState({ user: null, profile: null, favIds: [], favs: null, hist: null, monthly: null });
    this.toast('Hesabdan çıxdın');
  }
  async deleteAccount() {
    if (this.state.delText.trim().toUpperCase() !== 'SİL') return;
    this.setState({ delBusy: true });
    const r = await api.deleteAccount();
    if (r.error) { this.setState({ delBusy: false }); this.toast('Hesab silinmədi — yenidən cəhd et və ya info@pro-tech.az-a yaz.'); return; }
    await api.signOut();
    this.setState({ delBusy: false, delOpen: false, delText: '', user: null, profile: null });
    this.toast('Hesab silindi');
    this.go('map');
  }

  setCar(id) {
    LS.set('car', id);
    this.setState({ carId: id, carPicker: false, carQ: '', plan: null, planErr: null });
    const m = this.car;
    const u = this.state.user;
    if (u) api.saveUserVehicle(u.id, id).then((r) => { if (!r.error) api.userVehicles().then((x) => x.data && this.setState({ uvs: x.data })); });
    setTimeout(() => { const mm = this.car; this.toast((mm ? this.carName(mm) : 'Maşın') + ' seçildi — xərclər yeniləndi'); }, 0);
    return m;
  }

  syncMarkers(force) {
    if (!this.dmap.map) return;
    const v = this._lastVals;
    if (!v) return;
    const sig = (this.state.page === 'map' ? 'm' : 'x') + '|' + this.state.sel + '|' + this.dark + '|' + v.markSig;
    if (!force && sig === this._markSig) return;
    this._markSig = sig;
    this.dmap.setMarkers(v.marks, this.state.sel);
  }

  // ------------------------------------------------------------- render dəyərləri
  renderVals() {
    const s = this.state;
    const dark = s.theme === 'dark' || (s.theme === 'system' && s.sysDark);
    this.dark = dark;
    const c = dark ? {
      bg: '#0B1518', surface: '#16262A', surface2: '#122024', elev: '#1E3136', text: '#E9EFED', muted: '#8CA0A4', faint: '#8A9A9E', ghost: 'rgba(233,239,237,.25)',
      border: 'rgba(233,239,237,.10)', borderStrong: 'rgba(233,239,237,.20)', accentText: '#12E28C', accentSoft: 'rgba(18,226,140,.12)', accentBorder: 'rgba(18,226,140,.25)',
      header: 'rgba(11,21,24,.85)', footer: '#0E1B1F', land: '#0F1E22', pinBg: '#16262A',
      shadow1: 'none', shadow2: '0 8px 24px rgba(0,0,0,.4)', amberText: '#E8963C', amberBg: 'rgba(232,150,60,.12)', amberBd: 'rgba(232,150,60,.35)', redText: '#F07A75', redBg: 'rgba(226,80,75,.12)',
    } : {
      bg: '#E9EFED', surface: '#FFFFFF', surface2: '#F3F6F5', elev: '#FFFFFF', text: '#0B1518', muted: '#4C5D61', faint: '#5E6E72', ghost: 'rgba(11,21,24,.22)',
      border: 'rgba(11,21,24,.10)', borderStrong: 'rgba(11,21,24,.20)', accentText: '#067A4A', accentSoft: '#E1F8EE', accentBorder: 'rgba(18,226,140,.45)',
      header: 'rgba(233,239,237,.88)', footer: '#E2E9E7', land: '#DDE6E3', pinBg: '#FFFFFF',
      shadow1: '0 2px 8px rgba(11,21,24,.06)', shadow2: '0 8px 24px rgba(11,21,24,.14)', amberText: '#9A5410', amberBg: '#FCEFE0', amberBd: '#F2C894', redText: '#B4302B', redBg: '#FCE7E6',
    };
    this.c = c;
    const chip = (on) => (on ? (dark ? { bg: 'rgba(18,226,140,.14)', color: '#12E28C', bd: 'rgba(18,226,140,.5)' } : { bg: '#0B1518', color: '#FFFFFF', bd: '#0B1518' }) : { bg: c.surface2, color: c.muted, bd: c.border });
    const kindStyle = (isDc) => (isDc ? { kindBg: dark ? 'rgba(255,122,26,.16)' : '#FFE9D9', kindC: dark ? '#FF9A4D' : '#9A4408' } : { kindBg: dark ? 'rgba(74,140,255,.16)' : '#E3EDFF', kindC: dark ? '#7FAEFF' : '#1E4FA8' });
    const car = this.car;
    const P = s.page;
    const opKey = (n) => (n || '').trim().toLowerCase();
    const opsByName = new Map(s.operators.map((o) => [opKey(o.name), o])); // relay `id` vermir
    const iconUrl = (name, slug) => { const k = L.operatorIconSlug(name, slug); return k ? new URL('./assets/operators/' + k + '.png', import.meta.url).href : null; };

    // ---- stansiyalar
    const all = this.rowsCompute();
    const ql = s.q.trim().toLowerCase();
    let list = all.filter((r) =>
      (!ql || (r.name + ' ' + (r.op || '')).toLowerCase().includes(ql)) &&
      (s.type === 'all' || (s.type === 'DC' ? r.hasDc : r.hasAc)) &&
      (s.sock === 'all' || r.types.has(s.sock)) &&
      (!s.onlyFree || r.status === 'available') &&
      (!s.onlyCompat || !car || !!r.opt) &&
      (!s.opFilter || opKey(r.s.operator_name) === opKey(s.opFilter)));
    const inf = (x) => (x == null || Number.isNaN(x) ? Infinity : x);
    const cmp = (x, y) => { x = inf(x); y = inf(y); return x === y ? 0 : (x < y ? -1 : 1); };
    const STATUS_RANK = { available: 0, occupied: 1, unknown: 2, offline: 3 };
    const sr = (r) => STATUS_RANK[r.status] == null ? 2 : STATUS_RANK[r.status];
    const sorters = car ? {
      // Tətbiqin rankStations-ı: xal (₼ + vaxt dəyəri), bərabərdirsə məsafə. Məhdud giriş və uyğunsuz — sona.
      best: (a, b) => (a.restricted - b.restricted) || ((!a.opt) - (!b.opt)) || cmp(L.rankKey(a.est), L.rankKey(b.est)) || (sr(a) - sr(b)) || (a.distKm - b.distKm),
      cost: (a, b) => (a.restricted - b.restricted) || ((!a.opt) - (!b.opt)) || cmp(a.est && a.est.available ? a.est.total : null, b.est && b.est.available ? b.est.total : null) || (a.distKm - b.distKm),
      dist: (a, b) => a.distKm - b.distKm,
      power: (a, b) => (b.power - a.power) || (a.distKm - b.distKm),
    } : {
      // Maşın yoxdur → tam xərc yoxdur: boş olanlar əvvəl, sonra məsafə; «ən ucuz» = tarif.
      best: (a, b) => (a.restricted - b.restricted) || (sr(a) - sr(b)) || (a.distKm - b.distKm),
      cost: (a, b) => (a.restricted - b.restricted) || cmp(a.price, b.price) || (sr(a) - sr(b)) || (a.distKm - b.distKm),
      dist: (a, b) => a.distKm - b.distKm,
      power: (a, b) => (b.power - a.power) || (a.distKm - b.distKm),
    };
    list = list.slice().sort(sorters[s.sort] || sorters.best);
    const listShown = list.slice(0, s.listLimit);
    const rowView = (r) => {
      const est = r.est;
      const totalT = est && est.available ? L.money(est.total) : (r.priceT || 'Qiymət bilinmir');
      return Object.assign({}, r, kindStyle(r.isDc), {
        totalT, hasTotal: !!(est && est.available), durT: est && est.available ? '~' + L.dur(est.durationMinutes) : '',
        metaT: [r.op, r.distT].filter(Boolean).join(' · '),
        pick: () => this.pick(r.id),
      });
    };

    // ---- seçilmiş stansiya
    let sel = null;
    const selRow = s.sel ? this.rowById(s.sel) : null;
    if (s.sel && (selRow || s.detail)) {
      const d = s.detail || (selRow && selRow.s);
      const row = selRow || this.rowFor(d, car);
      const cs = d.connectors || [];
      const status = L.stationStatus(cs), stt = L.statusOf(status);
      const distKm = this.distKm(d);
      const detourKm = s.geo ? distKm : 0;
      const opt = car ? L.bestOption({ station: d, model: car, currentSoc: s.socCur, targetSoc: s.socTgt, detourKm, timeValuePerHour: s.config.defaultTimeValuePerHour, config: s.config }) : null;
      const selConn = (s.connSel && cs.find((k) => k.id === s.connSel)) || (opt && opt.connector) || L.defaultConnector(cs, car);
      const busy = selConn && (selConn.status === 'occupied' || selConn.status === 'reserved');
      const est = car && selConn ? L.estimate({ station: d, connector: selConn, model: car, currentSoc: s.socCur, targetSoc: s.socTgt, detourKm,
        expectedWaitMinutes: busy ? Math.round(s.config.occupiedWaitMinutes) : 0, timeValuePerHour: s.config.defaultTimeValuePerHour, config: s.config }) : null;
      const selTariff = (selConn && selConn.tariff) || d.tariff || null;
      const priced = L.tariffShowsNumber(selTariff);
      const selFit = car && selConn ? L.fitOf(selConn, car) : null;
      const fav = s.favIds.includes(s.sel);
      const ll = d.latitude + ',' + d.longitude;
      const opInfo = opsByName.get(opKey(d.operator ? d.operator.name : d.operator_name)) || (d.operator ? d.operator : null);
      const opName = L.displayOperator(d.operator ? d.operator.name : d.operator_name, d.operator && d.operator.slug);
      const phone = opInfo && opInfo.support_phone;
      const staleDays = priced ? L.tariffStaleDays(selTariff) : null;
      const fresh = L.freshness(d.status_updated_at);
      const rows = [];
      if (est && est.available) {
        for (const l of est.lines) {
          if (l.kind === 'energy') rows.push({ k: 'Enerji · ' + L.num(l.kwh, 1) + ' kWh × ' + L.num(l.price, 2) + ' ₼', v: L.money(l.amount) });
          else if (l.kind === 'sessionFee') rows.push({ k: 'Sessiya haqqı', v: L.money(l.amount) });
          else if (l.kind === 'detour') rows.push({ k: 'Yol · ' + l.detail.replace('.', ',') + ' km əlavə (gediş-dönüş)', v: L.money(l.amount) });
          else if (l.kind === 'parking') rows.push({ k: l.freeMinutes > 0 ? 'Parkinq · ilk ' + l.freeMinutes + ' dəq pulsuz' : 'Parkinq · pulsuz vaxt yoxdur', v: L.money(l.amount) });
        }
      }
      const notes = [];
      if (est && est.available) {
        if (est.expectedWaitMinutes > 0) notes.push('Məşğuldur · təxmini gözləmə ' + est.expectedWaitMinutes + ' dəq (model fərziyyəsi, ölçü deyil)');
        notes.push('Hesablama: real güc ' + Math.round(est.effectivePowerKw) + ' kW · ' + s.socCur + '% → ' + s.socTgt + '%');
        if (est.isDurationApproximate) notes.push('Müddət təxminidir — maşının maksimal ' + (selConn.current_kind === 'dc' ? 'DC' : 'AC') + ' gücü kataloqda yoxdur.');
        if (!s.geo) notes.push('Yol xərci daxil deyil — «Mənim yerim» ilə mövqeyini paylaşsan, hesablanacaq.');
      }
      const dcCount = cs.filter((k) => k.current_kind === 'dc').length;
      const reviews = (s.reviews || []).map((rv) => ({
        n: rv.author_label || 'İstifadəçi', i: (rv.author_label || 'İ').charAt(0).toUpperCase(), d: rv.created_at ? L.dateAz(rv.created_at) : '',
        verdict: rv.worked ? 'İşlədi' : 'İşləmədi', vColor: rv.worked ? c.accentText : c.redText,
        reasons: (rv.reasons || []).map((x) => REASON_LABEL[x] || x).join(' · '), t: rv.comment || '',
      }));
      sel = Object.assign({}, row, kindStyle(L.dominantCurrent(cs) === 'dc'), {
        name: d.name, fav, favLabel: fav ? 'Favoritlərdən çıxar' : 'Favoritlərə əlavə et', heartFill: fav ? '#E2504B' : 'none', heartStroke: fav ? '#E2504B' : c.text,
        op: opName, opIcon: opName ? iconUrl(opName, opInfo && opInfo.slug) : null,
        powerT: L.kwText(L.maxPowerKw(cs)), kind: L.dominantCurrent(cs) === 'dc' ? 'DC' : 'AC',
        hoursT: d.open_24h === true ? '7/24' : (L.cleanText(d.opening_hours) || null),
        addrT: [L.cleanText(d.address), L.cleanText(d.district), L.cleanText(d.city)].filter(Boolean).filter((x, i, a) => a.indexOf(x) === i).join(' · '),
        distLine: s.geo ? L.distText(distKm) + ' səndən' : 'Bakı mərkəzindən ' + L.distText(distKm),
        stLabel: stt.label, stColor: stt.color, isFree: status === 'available', isOff: status === 'offline', updT: fresh ? fresh.text : null, updStale: !!(fresh && fresh.stale),
        restricted: L.accessRestricted(d.access_note), accessNote: L.cleanText(d.access_note),
        loading: s.detailLoading && !s.detail, detailErr: s.detailErr && !s.detail,
        car, carShort: car ? this.carName(car) : null,
        costAvail: !!(est && est.available), totalT: est && est.available ? L.money(est.total) : '', durT: est && est.available ? '~' + L.dur(est.durationMinutes) : '',
        priceOnlyT: priced ? L.tariffText(selTariff.price_per_kwh) : null,
        unavailableT: !selTariff ? 'Qiymət bilinmir' : (selTariff.note || (priced ? null : 'Qiymət təsdiqlənməyib')),
        batteryUnknown: est && est.reason === 'battery_unknown',
        rows, notes, staleT: staleDays != null ? 'Qiymət ' + staleDays + ' gün əvvəl yoxlanılıb — dəyişmiş ola bilər' : null,
        noCompat: !!car && !!selConn && !selFit, compatAny: !!opt,
        socksT: [...new Set(cs.map((k) => L.CONNECTOR_LABEL[k.type] || '—'))].join(' / '), carSocks: car ? L.carSocketsLabel(car) : '',
        conns: cs.map((k) => {
          const f = car ? L.fitOf(k, car) : null, st2 = L.statusOf(k.status);
          const cnt = k.count && k.count > 1 ? k.count : null;
          return { t: L.CONNECTOR_LABEL[k.type] || 'Naməlum soket', cur: k.current_kind === 'dc' ? 'DC' : 'AC', kw: (k.power_estimated ? '≈' : '') + L.kwText(k.power_kw || 0),
            count: cnt ? (k.count_available != null ? k.count_available + ' boş / ' + cnt : '×' + cnt) : null,
            match: !!(f && f.kind === 'native'), unknownType: !!(f && f.kind === 'typeUnknown'), noFit: !!car && !f,
            label: st2.label, color: st2.color, on: selConn && selConn.id === k.id,
            pick: () => this.setState({ connSel: k.id }) };
        }),
        powerEstNote: cs.some((k) => k.power_estimated),
        priceRowT: priced ? L.tariffText(selTariff.price_per_kwh) : (selTariff ? 'təsdiqlənməyib' : 'bilinmir'),
        methodsT: (d.access_methods || []).length ? d.access_methods.join(' · ') : null,
        coordT: (+d.latitude).toFixed(5) + ', ' + (+d.longitude).toFixed(5),
        gmaps: 'https://www.google.com/maps/search/?api=1&query=' + ll,
        phone, phoneHref: phone ? 'tel:' + phone.replace(/[^\d+]/g, '') : null,
        appStore: opInfo && opInfo.app_store_url, playStore: opInfo && opInfo.play_store_url,
        reviews, reviewCount: reviews.length, reviewsLoading: s.reviews == null,
        dcCount,
        navLinks: [
          { label: 'Google Xəritə', ab: 'G', bg: dark ? '#1E3136' : '#E3EDFF', fg: dark ? '#7FAEFF' : '#1E4FA8', href: 'https://www.google.com/maps/dir/?api=1&destination=' + ll + '&travelmode=driving' },
          { label: 'Waze', ab: 'W', bg: dark ? '#1E3136' : '#E1F4FB', fg: dark ? '#6FD3F5' : '#0B6A8A', href: 'https://waze.com/ul?ll=' + ll + '&navigate=yes' },
          { label: 'Apple Xəritələr', ab: 'A', bg: dark ? '#1E3136' : '#F3F6F5', fg: c.text, href: 'https://maps.apple.com/?daddr=' + ll + '&dirflg=d' },
          { label: 'Yandex Naviqator', ab: 'Y', bg: dark ? '#1E3136' : '#FCE7E6', fg: dark ? '#F07A75' : '#B4302B', href: 'https://yandex.com/maps/?rtext=~' + ll + '&rtt=auto' },
        ],
      });
      this._selShareRow = Object.assign({}, row, { name: d.name, op: opName, stLabel: stt.label });
    }

    // ---- markerlər (filtrlənmiş siyahı + seçilmiş)
    const markRows = list.slice();
    if (selRow && !markRows.includes(selRow)) markRows.push(selRow);
    const marks = markRows.map((r) => ({ id: r.id, lat: r.lat, lng: r.lng, power: r.powerT, isDc: r.isDc, color: r.stColor,
      aria: r.name + ', ' + r.powerT + ' kW ' + r.kind + ', ' + r.stLabel + (r.est && r.est.available ? ', ' + L.money(r.est.total) : '') }));
    const markSig = s.stationsAt + ':' + markRows.length + ':' + markRows.map((r) => r.id.slice(0, 8) + r.stColor.slice(1, 3)).join('');

    // ---- nav
    const navDefs = [['map', 'Xəritə'], ['route', 'Marşrut'], ['ops', 'Operatorlar'], ['blog', 'Bloq'], ['favs', 'Favoritlər'], ['hist', 'Tarixçə']];
    const navs = navDefs.map(([k, label]) => { const on = P === k || (k === 'blog' && P === 'post'); return { label, cur: on ? 'page' : 'false', bg: on ? (dark ? 'rgba(18,226,140,.12)' : '#FFFFFF') : 'transparent', color: on ? c.text : c.muted, go: () => this.go(k, k === 'map' ? {} : { sel: null, detail: null }) }; });

    // ---- marşrut
    const plan = s.plan && s.plan.feasible !== false ? s.plan : null;
    let rTiles = [], rSteps = [], rDots = [], routeSub = '', rNote = '';
    if (plan) {
      const stops = plan.stops || [];
      const charges = stops.filter((x) => x.kind === 'charge');
      const total = plan.total_distance_km || 0;
      const chargeMin = plan.total_charge_minutes != null ? plan.total_charge_minutes : charges.reduce((a, x) => a + (x.charge_minutes || 0), 0);
      // RoutePlan.costSummary (tətbiq)
      let costT;
      const missing = plan.stops_without_price != null ? plan.stops_without_price : charges.filter((x) => x.price_known === false || (x.price_known == null && x.charge_cost_azn == null)).length;
      if ('cost_total' in plan) {
        if (plan.cost_total != null && missing === 0) costT = L.money(plan.cost_total);
        else if ((plan.cost_known_partial || 0) > 0) costT = '≥ ' + L.money(plan.cost_known_partial) + ' · ' + missing + ' dayanacaqda qiymət yoxdur';
        else costT = charges.length ? 'Qiymət bilinmir' : L.money(0);
      } else costT = L.money(plan.total_energy_cost_azn || 0);
      rTiles = [
        { k: 'Məsafə', v: Math.round(total) + ' km' },
        { k: 'Yol vaxtı (şarj daxil)', v: L.dur(plan.total_duration_minutes || 0) },
        { k: 'Dayanacaq', v: charges.length ? charges.length + ' · ' + L.dur(chargeMin) : 'Lazım deyil' },
        { k: 'Şarj xərci', v: costT },
      ];
      routeSub = Math.round(total) + ' km · ' + (charges.length ? charges.length + ' dayanacaq' : 'dayanacaqsız') + ' · ~' + L.dur(plan.total_duration_minutes || 0);
      let ci = 0;
      rSteps = stops.map((x, i) => {
        const last = i === stops.length - 1;
        if (x.kind === 'origin') return { n: 'A', title: (s.rFrom && s.rFrom.label) || x.label, km: '0 km', sub: 'Çıxış · batareya ' + Math.round(x.departure_soc_percent != null ? x.departure_soc_percent : s.bat) + '%', isStop: false, r: '999px', bg: '#12E28C', bd: '#12E28C', fg: '#0B1518', line: c.border };
        if (x.kind === 'destination') return { n: 'B', title: (s.rTo && s.rTo.label) || x.label, km: Math.round(x.position_km != null ? x.position_km : total) + ' km', sub: 'Çatanda ~' + Math.max(0, Math.round(x.arrival_soc_percent)) + '% batareya', isStop: false, r: '999px', bg: c.text, bd: c.text, fg: c.bg, line: 'transparent' };
        ci++;
        const st = x.station;
        const isAc = x.current_kind === 'ac';
        const priceMissing = x.price_known === false || (x.price_known == null && x.charge_cost_azn == null);
        return {
          n: String(ci), title: (st && st.name) || x.label, km: x.position_km != null ? Math.round(x.position_km) + ' km' : '',
          sub: 'Çatanda ~' + Math.round(x.arrival_soc_percent) + '%' + (x.departure_soc_percent != null ? ' · ' + Math.round(x.departure_soc_percent) + '%-ə qədər doldur' : ''),
          isStop: true, chg: x.charge_energy_kwh != null ? '+' + L.num(x.charge_energy_kwh, 1) + ' kWh' : null, time: x.charge_minutes != null ? L.dur(x.charge_minutes) : null,
          cost: priceMissing ? 'Qiymət bilinmir' : L.money(x.charge_cost_azn), conn: [x.connector_type ? L.CONNECTOR_LABEL[x.connector_type] || x.connector_type : null, x.charge_power_kw ? Math.round(x.charge_power_kw) + ' kW' : null].filter(Boolean).join(' · '),
          statusUnknown: !!x.status_unknown, r: '7px', bg: c.surface, bd: isAc ? '#4A8CFF' : '#FF7A1A', fg: c.text, line: last ? 'transparent' : c.border,
          open: st && st.id ? () => this.pick(st.id) : null,
        };
      });
      rDots = [{ x: '0%', top: '16px', s: '16px', r: '999px', bg: '#12E28C', bd: '#12E28C' }]
        .concat(charges.map((x) => ({ x: (total ? Math.min(100, Math.max(0, (x.position_km || 0) / total * 100)) : 0) + '%', top: '14px', s: '20px', r: '6px', bg: c.surface, bd: x.current_kind === 'ac' ? '#4A8CFF' : '#FF7A1A' })))
        .concat([{ x: '100%', top: '16px', s: '16px', r: '999px', bg: c.text, bd: c.text }]);
      rNote = 'Hesablama serverdədir (mobil tətbiqlə eyni): yol məsafəsi xəritə xidmətindən, stansiya statusu və tarifi canlı bazadan · çatanda ən az 20% ehtiyat · strategiya: ən sürətli.' + (plan.approximate ? ' Bəzi rəqəmlər təxminidir (maşının şarj gücü kataloqda tam deyil).' : '');
    }
    const errCode = s.planErr && s.planErr.code;
    const rErr = s.planErr ? (ROUTE_ERR[errCode] || ['Marşrut hesablanmadı', 'Server cavab vermədi. Bir azdan yenidən cəhd et.']) : null;
    const presets = ROUTE_PRESETS.map((to) => { const on = !!(s.rTo && s.rTo.label === to && s.rFrom && s.rFrom.label === 'Bakı'); return Object.assign({ label: 'Bakı → ' + to, on, go: () => this.preset(to) }, chip(on)); });
    const rFromL = s.rFrom ? s.rFrom.label : (s.rFromQ || 'Başlanğıc'), rToL = s.rTo ? s.rTo.label : (s.rToQ || 'Hədəf');

    // ---- operatorlar
    const stats = L.operatorStats(s.stations);
    const statsByName = new Map(stats.map((o) => [opKey(o.name), o]));
    const ops = s.operators.filter((o) => !L.isUnknownOperator(o.name, o.slug)).map((o) => {
      const st = statsByName.get(opKey(o.name)) || { stations: 0, dc: 0, ac: 0, live: 0, priced: 0, noPrice: 0 };
      const range = L.priceRangeText(st);
      return {
        id: o.name, n: o.name, ab: L.initials(o.name), icon: iconUrl(o.name, o.slug), count: st.stations + ' stansiya',
        price: range || '—', priceNote: st.stations ? (st.priced ? st.priced + '/' + st.stations + ' stansiyada tarif var' : 'Tarif bazada yoxdur') : '',
        kinds: [st.dc ? 'DC ' + st.dc : null, st.ac ? 'AC ' + st.ac : null].filter(Boolean).join(' · ') || '—',
        live: st.live > 0 ? 'Bəli · ' + st.live + ' stansiya' : 'Xeyr', liveOn: st.live > 0,
        phone: o.support_phone, phoneHref: o.support_phone ? 'tel:' + o.support_phone.replace(/[^\d+]/g, '') : null,
        appStore: o.app_store_url, playStore: o.play_store_url, hasApp: !!(o.app_store_url || o.play_store_url), appOpen: s.opsOpen === o.name,
        toggleApp: () => this.setState({ opsOpen: s.opsOpen === o.name ? null : o.name }),
        show: () => this.go('map', { opFilter: o.name, q: '', sel: null, detail: null, type: 'all', sock: 'all', onlyFree: false, onlyCompat: false }),
        stations: st.stations,
      };
    }).filter((o) => o.stations > 0).sort((a, b) => b.stations - a.stations);
    const unknownOpCount = stats.filter((o) => L.isUnknownOperator(o.name)).reduce((a, o) => a + o.stations, 0);
    const opFilterName = s.opFilter || null;

    // ---- bloq
    const COVERS = { 'Qiymətlər': 'linear-gradient(135deg,#0E6B49 0%,#12E28C 120%)', 'Bələdçi': 'linear-gradient(135deg,#16262A 0%,#2E6E7A 100%)', 'Texnologiya': 'linear-gradient(135deg,#1B3D7A 0%,#4A8CFF 110%)' };
    const liveCtx = { stats, stations: s.stations, ready: s.stations.length > 0 };
    const posts = s.posts.map((p) => {
      const blocks = (p.blocks || []).flatMap((b) => this.expandBlock(b, liveCtx));
      const words = blocks.reduce((a, b) => a + JSON.stringify(b).split(/\s+/).length, 0);
      const pp = Object.assign({}, p, { cover: COVERS[p.cat] || COVERS['Bələdçi'], read: Math.max(1, Math.round(words / 180)) + ' dəq', date: L.dateAz(p.date), blocksX: blocks });
      pp.open = () => this.go('post', { postSlug: p.slug });
      pp.share = () => this.setState({ share: this.shareFor('post', pp), copied: false });
      pp.shareAria = p.title + ' — paylaş';
      return pp;
    });
    const catNames = ['Hamısı'].concat([...new Set(posts.map((p) => p.cat))]);
    const filtered = posts.filter((p) => s.cat === 'Hamısı' || p.cat === s.cat);
    const cur = posts.find((p) => p.slug === s.postSlug) || null;
    let post = null, postShare = [], related = [], curShare = null;
    if (cur) {
      let hIdx = 0;
      const blocks = cur.blocksX.map((b) => {
        const k = b[0];
        const o = { isH: k === 'h', isP: k === 'p', isL: k === 'l', isTip: k === 'tip', isT: k === 't', isNote: k === 'note', text: '', items: [], head: [], rows: [], id: '', caption: '' };
        if (k === 'l') o.items = b[1];
        else if (k === 't') { o.caption = b[1].join(', '); o.head = b[1]; o.rows = b[2]; o.cols = 'repeat(' + b[1].length + ',minmax(0,1fr))'; }
        else o.text = b[1];
        if (k === 'h') o.id = 'bolme-' + (++hIdx);
        return o;
      });
      post = Object.assign({}, cur, { ai: 'D', blocks, toc: blocks.filter((b) => b.isH).map((b) => ({ id: b.id, text: b.text })) });
      curShare = this.shareFor('post', cur);
      postShare = this.targets(curShare).slice(0, 5).map((t) => Object.assign({}, t, { aria: t.label + ' ilə paylaş (yeni pəncərə)' }));
      related = posts.filter((p) => p.slug !== cur.slug).slice(0, 3);
    }

    // ---- favoritlər / tarixçə
    const favList = (s.favs || []).map((fs) => {
      const r = this.rowById(fs.id) || this.rowFor(fs, car);
      const v2 = rowView(r);
      return Object.assign(v2, {
        pick: () => this.pick(fs.id), share: () => this.setState({ share: this.shareFor('st', r), copied: false }),
        remove: () => this.toggleFav(fs.id), removeAria: r.name + ' — favoritlərdən sil',
      });
    });
    const hist = (s.hist || []).map((h) => ({
      d: L.dateTimeShort(h.started_at), s: h.station_name || 'Stansiya', op: L.displayOperator(h.operator_name) || '',
      kwh: L.num(h.energy_kwh || 0, 1), t: h.ended_at ? L.dur((Date.parse(h.ended_at) - Date.parse(h.started_at)) / 60000) : '—', sum: L.money(h.cost_azn || 0),
      state: h.state,
    }));
    const now = new Date();
    const monthRows = (s.hist || []).filter((h) => { const d = new Date(h.started_at); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(); });
    const hk = monthRows.reduce((a, x) => a + (x.energy_kwh || 0), 0), hs = monthRows.reduce((a, x) => a + (x.cost_azn || 0), 0);
    const monthly = (s.monthly || []).slice().sort((a, b) => (a.year - b.year) || (a.month - b.month));
    const mMax = Math.max(1, ...monthly.map((m) => m.total_azn || 0));

    // ---- maşın seçici
    const cq = s.carQ.trim().toLowerCase();
    const carOpts = [];
    if (s.carPicker && s.catalog) {
      const pop = new Set(s.catalog.popular_brands || []);
      const brands = (s.catalog.brands || []).slice().sort((a, b) => (pop.has(b.name) - pop.has(a.name)) || a.name.localeCompare(b.name));
      for (const b of brands) for (const m of b.models || []) {
        const label = b.name + ' ' + m.name;
        if (cq && !label.toLowerCase().includes(cq)) continue;
        const bat = L.batteryKwh(m);
        carOpts.push({ id: m.id, n: label, spec: [bat != null ? L.num(bat, 1) + ' kWh' : 'batareya bilinmir', m.dc_max_kw ? 'DC ' + Math.round(m.dc_max_kw) + ' kW' : null, m.ac_max_kw ? 'AC ' + L.kwText(m.ac_max_kw) + ' kW' : null].filter(Boolean).join(' · '),
          socks: L.carSocketsLabel(m), on: m.id === s.carId, go: () => this.setCar(m.id) });
        if (carOpts.length >= 80) break;
      }
    }

    const share = s.share;
    const u = s.user;
    const dispName = (s.profile && (s.profile.display_name || s.profile.full_name)) || (u && u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name)) || (u && u.email ? u.email.split('@')[0] : '');
    const codeOk = s.code.replace(/\D/g, '').length === 6, emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.email.trim());
    const loginDisabled = s.loginBusy || (s.loginStep === 0 ? !emailOk : !codeOk);
    const carCards = car ? [{ n: this.carName(car), spec: [L.batteryKwh(car) != null ? L.num(L.batteryKwh(car), 1) + ' kWh' : 'batareya bilinmir', car.dc_max_kw ? 'DC ' + Math.round(car.dc_max_kw) + ' kW' : 'DC gücü bilinmir', car.ac_max_kw ? 'AC ' + L.kwText(car.ac_max_kw) + ' kW' : 'AC gücü bilinmir'].join(' · '), socks: L.carSocketsLabel(car), on: true, bg: c.accentSoft, bd: '#12E28C', go: () => this.setState({ carPicker: true }) }] : [];
    const uvCards = (s.uvs || []).filter((x) => x.model_id && x.model_id !== s.carId).map((x) => {
      let m = null; for (const b of (s.catalog && s.catalog.brands) || []) for (const mm of b.models || []) if (mm.id === x.model_id) m = Object.assign({ brand: b.name }, mm);
      return m ? { n: (x.nickname ? x.nickname + ' · ' : '') + this.carName(m), spec: 'Hesabında saxlanıb', socks: L.carSocketsLabel(m), on: false, bg: c.surface, bd: c.border, go: () => this.setCar(m.id) } : null;
    }).filter(Boolean);

    const vals = {
      c, isDark: dark, isLight: !dark, darkLabel: dark ? 'Açıq rejimə keç' : 'Tünd rejimə keç',
      navs, logged: !!u, notLogged: !u, userInitial: (dispName || '?').charAt(0).toUpperCase(), userName: dispName || 'Profil',
      pMap: P === 'map', pRoute: P === 'route', pOps: P === 'ops', pBlog: P === 'blog', pPost: P === 'post', pFavs: P === 'favs', pHist: P === 'hist', pProfile: P === 'profile', pLogin: P === 'login',
      showFooter: P !== 'map',
      goMap: () => this.go('map'), goRoute: () => this.go('route'), goOps: () => this.go('ops'), goBlog: () => this.go('blog'), goHist: () => this.go('hist'), goProfile: () => this.go('profile'), goFavs: () => this.go('favs'),
      goLogin: () => this.go('login', { loginStep: 0, code: '', loginErr: null }),
      openSock: () => this.go('post', { postSlug: 'soket-novleri-ccs2-gbt-type2' }),
      toggleDark: () => { const t = dark ? 'light' : 'dark'; LS.set('theme', t); this.setState({ theme: t }); },
      openCarPicker: () => this.setState({ carPicker: true, carQ: '' }),

      // xəritə
      mapRef: this.mapRef, mapError: this.dmap.error, mapFallback: this.dmap.fallback,
      loading: s.loading, loadErr: s.loadErr, retryLoad: () => { this.setState({ loading: true }); this.loadStations(); },
      asideLabel: sel ? 'Stansiya məlumatı' : 'Stansiya siyahısı və filtrlər',
      noSel: !s.sel, hasSel: !!s.sel, selPending: !!s.sel && !sel, sel: sel || { rows: [], conns: [], reviews: [], navLinks: [], notes: [] },
      q: s.q, onQ: (e) => this.onQuery(e.target.value), onlyFree: s.onlyFree, toggleFree: () => this.setState({ onlyFree: !s.onlyFree, listLimit: 50 }),
      onlyCompat: s.onlyCompat, toggleCompat: () => this.setState({ onlyCompat: !s.onlyCompat, listLimit: 50 }),
      sort: s.sort, onSort: (e) => this.setState({ sort: e.target.value, listLimit: 50 }),
      typeChips: [['all', 'Hamısı'], ['DC', 'DC · sürətli'], ['AC', 'AC']].map(([k, label]) => Object.assign({ label, on: s.type === k, go: () => this.setState({ type: k, listLimit: 50 }) }, chip(s.type === k))),
      sockChips: [['all', 'Hər soket'], ['ccs2', 'CCS2'], ['gbt', 'GB/T'], ['type2', 'Type 2']].map(([k, label]) => Object.assign({ label, on: s.sock === k, go: () => this.setState({ sock: k, listLimit: 50 }) }, chip(s.sock === k))),
      list: listShown.map(rowView), listEmpty: !s.loading && !s.loadErr && !list.length, moreCount: Math.max(0, list.length - listShown.length),
      showMore: () => this.setState({ listLimit: s.listLimit + 50 }),
      countText: list.length + ' stansiya · ' + (car ? SORT_LABEL[s.sort] : ({ best: 'boş olanlar əvvəl', cost: 'tarifi ucuz olan əvvəl' }[s.sort] || SORT_LABEL[s.sort])) + (s.onlyCompat && car ? ' · uyğun soket' : '') + (s.geo ? '' : ' · məsafə Bakı mərkəzindən'),
      opFilterName, clearOp: () => this.setState({ opFilter: null }, () => this.pushUrl(true)),
      resetFilters: () => this.setState({ q: '', type: 'all', sock: 'all', onlyFree: false, onlyCompat: false, opFilter: null }),
      hasCar: !!car, carShort: car ? this.carName(car) : 'Maşın seç', carSocks: car ? L.carSocketsLabel(car) : '',
      closeSel: () => this.closeSel(),
      toggleFavSel: () => s.sel && this.toggleFav(s.sel),
      shareSel: () => { if (this._selShareRow) this.setState({ share: this.shareFor('st', this._selShareRow), copied: false }); },
      navOpen: s.navOpen, toggleNav: () => this.setState({ navOpen: !s.navOpen }),
      navTapped: (ab) => api.track('navigate_tapped', { app: ab }),
      socCur: String(s.socCur), socTgt: String(s.socTgt),
      socCurOpts: [5, 10, 15, 20, 25, 30, 40, 50, 60, 70].map((x) => ({ v: String(x), label: x + '%' })),
      socTgtOpts: [50, 60, 70, 80, 90, 100].map((x) => ({ v: String(x), label: x + '%' })),
      onSocCur: (e) => { const x = +e.target.value; LS.set('socCur', x); this.setState({ socCur: x, socTgt: Math.max(s.socTgt, x + 10) }); },
      onSocTgt: (e) => { const x = +e.target.value; LS.set('socTgt', x); this.setState({ socTgt: x, socCur: Math.min(s.socCur, x - 10) }); },
      reviewOpen: s.reviewOpen, toggleReview: () => { if (!u) { this.toast('Rəy üçün giriş lazımdır'); this.go('login'); return; } this.setState({ reviewOpen: !s.reviewOpen }); },
      verdicts: [[true, 'İşlədi'], [false, 'İşləmədi']].map(([k, label]) => Object.assign({ label, on: s.revWorked === k, go: () => this.setState({ revWorked: k }) }, chip(s.revWorked === k))),
      revFailed: s.revWorked === false,
      revTags: REASONS.map(([k, label]) => { const on = s.revReasons.includes(k); return Object.assign({ label, on, go: () => this.setState({ revReasons: on ? s.revReasons.filter((x) => x !== k) : s.revReasons.concat([k]) }) }, chip(on)); }),
      revText: s.revText, onRevText: (e) => this.setState({ revText: e.target.value }), revBusy: s.revBusy,
      submitReview: (e) => this.submitReview(e),
      marks, markSig,
      legend: [['Boş', '#12E28C'], ['Məşğul', '#F2A93B'], ['Oflayn', '#E2504B'], ['Naməlum', '#6B7B80']].map(([label, color]) => ({ label, color })),
      scaleW: s.scale.w, scaleT: s.scale.t,
      zoomIn: () => this.dmap.zoomIn(), zoomOut: () => this.dmap.zoomOut(), locate: () => this.locate(false), geoBusy: s.geoBusy,
      bigMap: (() => { const m = this.dmap.center(); return 'https://www.google.com/maps/search/EV+charging+station/@' + m.lat.toFixed(4) + ',' + m.lng.toFixed(4) + ',' + Math.round(m.zoom) + 'z'; })(),

      // marşrut
      rFromQ: s.rFromQ, rToQ: s.rToQ, onFrom: (e) => this.placeSearch('from', e.target.value), onTo: (e) => this.placeSearch('to', e.target.value),
      fromSug: s.rSug.from.map((p) => Object.assign({}, p, { go: () => this.choosePlace('from', p) })), toSug: s.rSug.to.map((p) => Object.assign({}, p, { go: () => this.choosePlace('to', p) })),
      rFromOk: !!s.rFrom, rToOk: !!s.rTo, rFromL, rToL,
      bat: s.bat, batW: s.bat + '%', onBat: (e) => this.setState({ bat: Number(e.target.value), plan: null, planErr: null }), presets,
      calc: (e) => this.calcRoute(e), planLoading: s.planLoading, canCalc: !!(s.rFrom && s.rTo && car) && !s.planLoading,
      hasPlan: !!plan, noPlanYet: !plan && !s.planErr && !s.planLoading,
      rTiles, rDots, rSteps, rErr, rNote,
      rGmaps: s.rFrom && s.rTo ? 'https://www.google.com/maps/dir/?api=1&origin=' + s.rFrom.lat + ',' + s.rFrom.lng + '&destination=' + s.rTo.lat + ',' + s.rTo.lng + '&travelmode=driving' : null,
      rWaze: s.rTo ? 'https://waze.com/ul?ll=' + s.rTo.lat + ',' + s.rTo.lng + '&navigate=yes' : null,
      shareRoute: () => this.setState({ share: this.shareFor('route', { title: rFromL + ' → ' + rToL + ' elektromobillə', sub: routeSub || 'Doldur marşrut planı' }), copied: false }),

      // operatorlar
      ops, unknownOpCount, opsLoading: !s.operators.length || !s.stations.length,

      // bloq
      cats: catNames.map((k) => Object.assign({ label: k, on: s.cat === k, go: () => this.setState({ cat: k }) }, chip(s.cat === k))),
      hasFeat: filtered.length > 0, feat: filtered[0] || posts[0] || {}, blogList: filtered.slice(1), postsLoading: !s.posts.length,
      post: post || { blocks: [], toc: [] }, postMissing: !post, postShare,
      copyPost: () => curShare && this.copy(curShare.url), sharePostCur: () => curShare && this.setState({ share: curShare, copied: false }),
      related,

      // favoritlər / tarixçə
      favList, favsEmpty: !!u && s.favs != null && !favList.length, favsLoading: !!u && s.favs == null,
      hist, histEmpty: !!u && s.hist != null && !hist.length, histLoading: !!u && s.accLoading,
      monthLabel: L.monthName(now.getMonth()).replace(/^./, (x) => x.toUpperCase()) + ' ' + now.getFullYear(),
      histTiles: [{ k: 'Sessiya (bu ay)', v: String(monthRows.length) }, { k: 'Enerji', v: L.num(hk, 1) + ' kWh' }, { k: 'Xərc', v: L.money(hs) }, { k: 'Orta tarif', v: hk > 0 ? L.num(hs / hk, 2) + ' ₼/kWh' : '—' }],
      monthBars: monthly.map((m) => ({ k: L.monthName(m.month - 1).slice(0, 3) + ' ' + String(m.year).slice(2), v: m.total_azn ? L.money(m.total_azn) : '—', h: Math.max(4, Math.round((m.total_azn || 0) / mMax * 80)) + 'px' })),
      hasMonthly: monthly.length > 0,

      // profil
      avatarL: u ? (dispName || '?').charAt(0).toUpperCase() : '?', profName: u ? (dispName || 'Sürücü') : 'Qonaq',
      profSub: u ? [u.email, s.favIds.length + ' favorit'].filter(Boolean).join(' · ') : 'Maşın və tema seçimi bu brauzerdə saxlanır',
      logout: () => this.logout(),
      carCards, uvCards, noCarCard: !car,
      themeChips: [['light', 'Açıq'], ['dark', 'Tünd'], ['system', 'Sistem']].map(([k, label]) => Object.assign({ label, on: s.theme === k, go: () => { LS.set('theme', k); this.setState({ theme: k }); } }, chip(s.theme === k))),
      delOpen: s.delOpen, openDel: () => this.setState({ delOpen: !s.delOpen, delText: '' }), delText: s.delText, onDelText: (e) => this.setState({ delText: e.target.value }),
      delReady: s.delText.trim().toUpperCase() === 'SİL' && !s.delBusy, doDelete: () => this.deleteAccount(), delBusy: s.delBusy,

      // giriş
      loginStep0: s.loginStep === 0, loginStep1: s.loginStep === 1,
      loginTitle: s.loginStep === 0 ? 'Doldur-a daxil ol' : 'Kodu daxil et',
      loginSub: s.loginStep === 0 ? 'Favoritlər, tarixçə və maşın ayarların bütün cihazlarda eyni olsun.' : 'E-poçtuna 6 rəqəmli kod göndərdik. Kod 60 dəqiqə etibarlıdır.',
      email: s.email, onEmail: (e) => this.setState({ email: e.target.value.slice(0, 120), loginErr: null }),
      code: s.code, onCode: (e) => this.setState({ code: e.target.value.replace(/\D/g, '').slice(0, 6), loginErr: null }),
      loginDisabled, loginBtnBg: loginDisabled ? c.surface2 : '#12E28C', loginBtnC: loginDisabled ? c.faint : '#0B1518', loginBtn: s.loginBusy ? 'Gözlə…' : (s.loginStep === 0 ? 'Kod göndər' : 'Təsdiqlə'),
      loginSubmit: (e) => this.loginSubmit(e), loginErr: s.loginErr,
      loginBack: () => this.setState({ loginStep: 0, code: '', loginErr: null }),
      gRef: this.gRef, googleFailed: !!s.googleFailed, hasGoogle: !!GOOGLE_WEB_CLIENT_ID,
      appleOn: !!APPLE_WEB_SERVICES_ID, appleSignIn: () => this.appleSignIn(), appleLabel: APPLE_WEB_SERVICES_ID ? 'Apple ilə davam et' : 'Apple ilə · tezliklə',

      // footer / paylaş / maşın
      playUrl: PLAY_URL, appStoreUrl: APPSTORE_URL,
      shareApp: () => this.setState({ share: this.shareFor('app'), copied: false }),
      shareOn: !!share, share: share || { head: '', title: '', sub: '', url: '', cover: '', glyph: '' }, shareTargets: share ? this.targets(share) : [],
      closeShare: () => this.setState({ share: null }), copyShare: () => share && this.copy(share.url), copyLabel: s.copied ? 'Kopyalandı ✓' : 'Kopyala',
      stopProp: (e) => e.stopPropagation(), selectAll: (e) => { try { e.target.select(); } catch (x) { /* yox */ } },
      nativeShare: () => { try { if (navigator.share) navigator.share({ title: share.title, text: share.text, url: share.url }).catch(() => {}); else this.toast('Bu brauzer sistem paylaşmasını dəstəkləmir — linki kopyala'); } catch (e) { this.toast('Linki kopyala'); } },
      carPicker: s.carPicker, closeCarPicker: () => this.setState({ carPicker: false }), carQ: s.carQ, onCarQ: (e) => this.setState({ carQ: e.target.value }),
      carOpts, catalogLoading: !s.catalog, carOptsEmpty: !!s.catalog && !carOpts.length,
      toastOn: !!s.toast, toastMsg: s.toast,
    };
    this._lastVals = vals;
    return vals;
  }

  onQuery(q) {
    // Yalnız müştəri tərəfi axtarış (ad + operator) — Supabase-ə əlavə sorğu yoxdur.
    this.setState({ q, listLimit: 50 });
  }

  /** posts.json-dakı «canlı» blokları yüklənmiş real datadan qurur. */
  expandBlock(b, ctx) {
    const k = b[0];
    if (k === 'live_prices') {
      if (!ctx.ready) return [['note', 'Canlı rəqəmlər yüklənir…']];
      const rows = ctx.stats.filter((o) => !L.isUnknownOperator(o.name) && o.stations > 0).map((o) => [o.name, L.priceRangeText(o) ? L.priceRangeText(o) + '/kWh' : 'bazada yoxdur', o.priced + ' / ' + o.stations]);
      return [['t', ['Operator', 'Tarif (₼/kWh)', 'Tarifli / cəmi stansiya'], rows]];
    }
    if (k === 'live_summary') {
      if (!ctx.ready) return [['note', 'Canlı rəqəmlər yüklənir…']];
      const st = ctx.stations;
      const priced = st.filter((x) => L.tariffShowsNumber(x.tariff)).map((x) => x.tariff.price_per_kwh).sort((a, b) => a - b);
      const med = priced.length ? (priced.length % 2 ? priced[(priced.length - 1) / 2] : (priced[priced.length / 2 - 1] + priced[priced.length / 2]) / 2) : null;
      const txt = 'Bu səhifə açılan anda Doldur bazasında ' + st.length + ' aktiv stansiya var; onlardan ' + priced.length + '-də tarif məlumatı mövcuddur' +
        (priced.length ? ' — ən aşağı ' + L.num(priced[0], 2) + ' ₼, ən yuxarı ' + L.num(priced[priced.length - 1], 2) + ' ₼, median ' + L.num(med, 2) + ' ₼/kWh.' : '.') +
        ' Qalan ' + (st.length - priced.length) + ' stansiyada qiymət bilinmir — tətbiq onlar üçün rəqəm uydurmur.';
      return [['p', txt]];
    }
    if (k === 'live_sockets') {
      if (!ctx.ready) return [['note', 'Canlı rəqəmlər yüklənir…']];
      const keys = [['ccs2', 'dc', 'CCS2'], ['gbt', 'dc', 'GB/T DC'], ['gbt', 'ac', 'GB/T AC'], ['type2', 'ac', 'Type 2'], ['chademo', 'dc', 'CHAdeMO']];
      const rows = keys.map(([t, cur, label]) => [label, cur.toUpperCase(), String(ctx.stations.filter((x) => (x.connectors || []).some((k2) => k2.type === t && k2.current_kind === cur)).length)]);
      const unk = ctx.stations.filter((x) => (x.connectors || []).some((k2) => k2.type === 'unknown')).length;
      return [['t', ['Soket', 'Cərəyan', 'Stansiya sayı'], rows], ['note', 'Cəmi ' + ctx.stations.length + ' aktiv stansiya; bir stansiyada bir neçə soket ola bilər. ' + unk + ' stansiyada ən az bir konnektorun növü mənbədə göstərilməyib.']];
    }
    if (k === 'live_example') {
      if (!ctx.ready) return [];
      const priced = ctx.stations.filter((x) => L.tariffShowsNumber(x.tariff)).map((x) => x.tariff.price_per_kwh);
      if (!priced.length) return [];
      const lo = Math.min(...priced), hi = Math.max(...priced);
      // 60 kWh batareya, 20→80% → 36 kWh batareyaya, şəbəkədən 36/0,9 = 40 kWh (tətbiqin modeli).
      return [['p', 'Nümunə: 60 kWh batareyanı 20%-dən 80%-ə doldurmaq üçün batareyaya 36 kWh, şəbəkədən isə itki ilə təxminən 40 kWh enerji lazımdır (Doldur 90% səmərəlilik fərz edir). Bazadakı ən aşağı tariflə bu ' + L.money(40 * lo) + ', ən yuxarı tariflə ' + L.money(40 * hi) + ' edir.']];
    }
    return [b];
  }

  render() {
    const v = this.renderVals();
    return html`<div style="min-height:100vh;background:${v.c.bg};color:${v.c.text};font-family:'Geist',Inter,system-ui,sans-serif;font-size:15px;line-height:1.45">
      ${HeaderView(v)}
      ${MapView(v)}
      ${RouteView(v)}
      ${OpsView(v)}
      ${BlogView(v)}
      ${PostView(v)}
      ${FavsView(v)}
      ${HistView(v)}
      ${ProfileView(v)}
      ${LoginView(v)}
      ${FooterView(v)}
      ${ShareView(v)}
      ${CarPickerView(v)}
      ${ToastView(v)}
    </div>`;
  }
}

render(html`<${App} />`, document.getElementById('app'));
