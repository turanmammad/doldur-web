// Doldur veb — MapLibre xəritəsi. Stil mobil tətbiqin öz stilidir
// (`app/assets/map/doldur_{light,dark}.json`, MapTiler vektor kaşıları).
// MapTiler rədd edərsə (401/403/429) tətbiq kimi OpenFreeMap-a keçir.
import { MAPTILER_KEY, BAKU_CENTER } from './config.js';

const OFM_TILES = 'https://tiles.openfreemap.org/planet';
const OFM_GLYPHS = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf';
const LOW_ZOOM = 12.5; // bundan aşağı pinlər nöqtəyə çevrilir (563 pin üst-üstə düşməsin)

let probe = null;
async function mapTilerUsable() {
  if (!MAPTILER_KEY) return false;
  probe = probe || fetch('https://api.maptiler.com/tiles/v3/tiles.json?key=' + MAPTILER_KEY)
    .then((r) => !(r.status === 401 || r.status === 403 || r.status === 429))
    .catch(() => true); // oflayn → rədd sayılmır (tətbiqdəki kimi)
  return probe;
}
const styleCache = {};
async function loadStyle(dark) {
  const k = dark ? 'dark' : 'light';
  if (styleCache[k]) return styleCache[k];
  const raw = await (await fetch(new URL('../assets/map/doldur_' + k + '.json', import.meta.url))).text();
  const ok = await mapTilerUsable();
  const json = ok
    ? raw.replaceAll('{MAPTILER_KEY}', MAPTILER_KEY)
    : raw.replace(/"https:\/\/api\.maptiler\.com\/tiles\/[^"]*"/g, JSON.stringify(OFM_TILES)).replace(/"https:\/\/api\.maptiler\.com\/fonts\/[^"]*"/g, JSON.stringify(OFM_GLYPHS));
  styleCache[k] = { style: JSON.parse(json), fallback: !ok };
  return styleCache[k];
}

const BOLT = '<svg width="9" height="11" viewBox="0 0 10 12" aria-hidden="true" style="display:block"><path d="M6 0.5L1 7H4.6L4 11.5L9 5H5.4Z" style="fill:#FF7A1A"></path></svg>';

export class DMap {
  constructor() {
    this.el = document.createElement('div');
    this.el.style.cssText = 'position:absolute;inset:0;z-index:0';
    this.map = null;
    this.markers = new Map();
    this.sel = null;
    this.dark = null;
    this.colors = null;
    this.onPick = () => {};
    this.onMove = () => {};
    this.userMarker = null;
    this.ready = false;
    this.error = null;
    this.fallback = false;
  }

  /** Host div-ə bağla (Preact səhifə dəyişəndə host yenidən yaranır, xəritə qalır). */
  attach(host) {
    if (!host) return;
    if (this.el.parentNode !== host) host.appendChild(this.el);
    if (this.map) requestAnimationFrame(() => this.map && this.map.resize());
  }

  async init(dark, colors) {
    this.colors = colors;
    if (this.map) return this.setTheme(dark, colors);
    if (!window.maplibregl) { this.error = 'maplibre_missing'; return; }
    this.dark = dark;
    let st;
    try { st = await loadStyle(dark); } catch (e) { this.error = 'style'; return; }
    this.fallback = st.fallback;
    this.map = new window.maplibregl.Map({
      container: this.el, style: st.style, center: [BAKU_CENTER.lng, BAKU_CENTER.lat], zoom: 11,
      attributionControl: false, dragRotate: false, pitchWithRotate: false, touchPitch: false, maxZoom: 18, minZoom: 5,
    });
    this.map.touchZoomRotate.disableRotation();
    this.map.on('load', () => { this.ready = true; this.onMove(); });
    this.map.on('move', () => this.onMove());
    this.map.on('zoom', () => this.zoomClass());
    this.map.on('error', (e) => { if (!this.ready) this.error = (e && e.error && e.error.message) || 'map_error'; });
    this.zoomClass();
  }

  async setTheme(dark, colors) {
    this.colors = colors;
    if (!this.map) return;
    if (dark !== this.dark) {
      this.dark = dark;
      const st = await loadStyle(dark);
      this.map.setStyle(st.style);
    }
    for (const [, m] of this.markers) { m.key = null; this.paint(m); }
  }

  zoomClass() {
    const low = this.map ? this.map.getZoom() < LOW_ZOOM : true;
    this.el.classList.toggle('dm-low', low);
  }

  /** Markerləri filtrlənmiş siyahıya uyğunlaşdır. items: [{id,lat,lng,power,isDc,color,aria}] */
  setMarkers(items, selId) {
    if (!this.map) return;
    const keep = new Set();
    for (const it of items) {
      keep.add(it.id);
      let m = this.markers.get(it.id);
      if (!m) {
        // 🔴 Marker elementi = sarğı div (MapLibre onun style.transform-una yazır);
        // stilləri içdəki düyməyə veririk ki, transform silinməsin.
        const wrap = document.createElement('div');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'dm-pin';
        btn.addEventListener('click', (e) => { e.stopPropagation(); this.onPick(m && m.it ? m.it.id : it.id); });
        wrap.appendChild(btn);
        const mk = new window.maplibregl.Marker({ element: wrap, anchor: 'bottom' }).setLngLat([it.lng, it.lat]).addTo(this.map);
        m = { it, btn, mk };
        this.markers.set(it.id, m);
      }
      const on = it.id === selId;
      const key = it.color + '|' + on + '|' + it.power + '|' + it.isDc + '|' + this.dark;
      if (m.it.lat !== it.lat || m.it.lng !== it.lng) m.mk.setLngLat([it.lng, it.lat]);
      m.it = it;
      m.on = on;
      if (m.key !== key) { m.key = key; this.paint(m); }
    }
    for (const [id, m] of this.markers) if (!keep.has(id)) { m.mk.remove(); this.markers.delete(id); }
    this.sel = selId;
  }

  paint(m) {
    const { it, btn } = m, c = this.colors || {}, on = !!m.on;
    const w = on ? '48px' : it.isDc ? '40px' : '32px', h = on ? '44px' : it.isDc ? '36px' : '30px';
    const bw = on || it.isDc ? '3px' : '1.5px', fs = on ? '14px' : '12px';
    const ring = on ? '0 0 0 5px rgba(18,226,140,.28), 0 6px 16px rgba(0,0,0,.25)' : '0 2px 6px rgba(0,0,0,.18)';
    btn.setAttribute('aria-label', it.aria);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.style.cssText = 'cursor:pointer;background:none;border:none;padding:0;display:flex;flex-direction:column;align-items:center;z-index:' + (on ? 5 : 2);
    btn.innerHTML =
      '<span class="dm-head" style="min-width:' + w + ';height:' + h + ';padding:0 6px;border-radius:9px 9px 13px 13px;background:' + c.pinBg + ';border:' + bw + ' solid ' + it.color + ';box-shadow:' + ring + ";display:flex;align-items:center;justify-content:center;gap:3px;font-family:'Geist Mono',monospace;font-weight:600;font-size:" + fs + ';color:' + c.text + '">' +
      (it.isDc ? BOLT : '') + escapeHtml(String(it.power)) + '</span>' +
      '<span class="dm-stem" style="width:2px;height:7px;background:' + it.color + '"></span>' +
      '<span class="dm-dot" style="background:' + it.color + ';border-color:' + c.pinBg + '"></span>';
    m.mk.getElement().style.zIndex = on ? 5 : 2;
    btn.classList.toggle('dm-on', on);
  }

  flyTo(lat, lng, zoom) {
    if (!this.map) return;
    this.map.flyTo({ center: [lng, lat], zoom: Math.max(this.map.getZoom(), zoom || 14), speed: 1.4 });
  }
  zoomIn() { this.map && this.map.zoomIn(); }
  zoomOut() { this.map && this.map.zoomOut(); }
  center() { const c = this.map ? this.map.getCenter() : { lat: BAKU_CENTER.lat, lng: BAKU_CENTER.lng }; return { lat: c.lat, lng: c.lng, zoom: this.map ? this.map.getZoom() : 10.6 }; }

  setUser(lat, lng) {
    if (!this.map) return;
    if (!this.userMarker) {
      const el = document.createElement('span');
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText = 'position:relative;width:0;height:0;display:block';
      el.innerHTML = '<span style="position:absolute;left:-14px;top:-14px;width:28px;height:28px;border-radius:999px;background:rgba(74,140,255,.35);animation:dPulse 1.8s ease-out infinite"></span><span style="position:absolute;left:-8px;top:-8px;width:16px;height:16px;border-radius:999px;background:#4A8CFF;border:3px solid #FFFFFF;box-shadow:0 1px 4px rgba(0,0,0,.3)"></span>';
      this.userMarker = new window.maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([lng, lat]).addTo(this.map);
    } else this.userMarker.setLngLat([lng, lat]);
  }

  /** Miqyas zolağı (dizayndakı kimi): ≤ 80 px-ə sığan «yuvarlaq» məsafə. */
  scale() {
    if (!this.map) return { w: '48px', t: '' };
    const lat = this.map.getCenter().lat, z = this.map.getZoom();
    const mpp = 78271.517 * Math.cos(lat * Math.PI / 180) / Math.pow(2, z);
    const max = mpp * 80;
    const steps = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000];
    let d = steps[0];
    for (const s of steps) if (s <= max) d = s;
    return { w: Math.round(d / mpp) + 'px', t: d >= 1000 ? (d / 1000) + ' km' : d + ' m' };
  }
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
