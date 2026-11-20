// app.test.mjs üçün Node modul qarmağı: brauzer/CDN asılılıqlarını yerli saxta modullarla əvəzləyir.
//  - esm.sh/preact → sinxron setState-li Component + render (App sinfini tutur)
//  - esm.sh/htm    → şablonu düz MƏTNƏ çevirir (views/*.js çıxışında «Yenidən cəhd et» və s. axtarmaq üçün)
//  - lib/api.js    → hər ixrac globalThis.__api[ad]-a yönəlir (test cavabı və gecikməni özü idarə edir)
//  - lib/map.js    → boş DMap
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const PREACT = `
export class Component {
  constructor() { this.state = {}; }
  setState(p, cb) { const x = typeof p === 'function' ? p(this.state, this.props) : p; this.state = Object.assign({}, this.state, x); if (cb) cb(); }
  forceUpdate() {}
}
export const h = (type, props, ...children) => ({ type, props, children });
export function render() {}
`;
const HTM = `
const flat = (v) => {
  if (v == null || v === false || v === true) return '';
  if (Array.isArray(v)) return v.map(flat).join('');
  if (typeof v === 'function') { if (v.prototype && typeof v.prototype.render === 'function') globalThis.__App = v; return ''; }
  if (typeof v === 'object') return '';
  return String(v);
};
export default function htm(strings, ...vals) { return strings.reduce((a, s, i) => a + s + (i < vals.length ? flat(vals[i]) : ''), ''); }
`;
const MAP = `export class DMap { attach() {} init() { return Promise.resolve(); } setTheme() {} setMarkers() {} setUser() {} flyTo() {} zoomIn() {} zoomOut() {} center() { return { lat: 40.37, lng: 49.836, zoom: 11 }; } scale() { return { w: '48px', t: '' }; } }`;

export async function resolve(specifier, context, next) {
  if (specifier.startsWith('https://esm.sh/preact')) return { url: 'stub:preact', shortCircuit: true };
  if (specifier.startsWith('https://esm.sh/htm')) return { url: 'stub:htm', shortCircuit: true };
  if (specifier.startsWith('https://')) return { url: 'stub:empty', shortCircuit: true };
  const r = await next(specifier, context);
  if (r.url.endsWith('/xerite/lib/api.js')) return { url: 'stub:api?src=' + encodeURIComponent(r.url), shortCircuit: true };
  if (r.url.endsWith('/xerite/lib/map.js')) return { url: 'stub:map', shortCircuit: true };
  return r;
}

export async function load(url, context, next) {
  if (url === 'stub:preact') return { format: 'module', source: PREACT, shortCircuit: true };
  if (url === 'stub:htm') return { format: 'module', source: HTM, shortCircuit: true };
  if (url === 'stub:map') return { format: 'module', source: MAP, shortCircuit: true };
  if (url === 'stub:empty') return { format: 'module', source: 'export default {}; export const createClient = () => ({});', shortCircuit: true };
  if (url.startsWith('stub:api?src=')) {
    // Real api.js-in ixrac adları → hamısı globalThis.__api-yə yönəlir (adlar əl ilə köçürülmür, uyğunsuzluq olmasın).
    const src = readFileSync(fileURLToPath(decodeURIComponent(url.slice('stub:api?src='.length))), 'utf8');
    const names = [...src.matchAll(/^export\s+(?:async\s+)?(?:const|function)\s+(\w+)/gm)].map((m) => m[1]).filter((n) => n !== 'sb');
    const body = names.map((n) => `export const ${n} = (...a) => (globalThis.__api[${JSON.stringify(n)}] || (() => Promise.resolve({ data: null })))(...a);`).join('\n');
    const sb = `export const sb = { auth: { getSession: () => Promise.resolve({ data: { session: null } }), onAuthStateChange: () => ({}) } };`;
    return { format: 'module', source: body + '\n' + sb, shortCircuit: true };
  }
  if (url.startsWith('file:') && url.includes('/xerite/') && url.endsWith('.js')) {
    return { format: 'module', source: readFileSync(fileURLToPath(url), 'utf8'), shortCircuit: true };
  }
  return next(url, context);
}
