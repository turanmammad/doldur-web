// Doldur veb — saf məntiq (I/O yoxdur, Node-da test olunur: test/logic.test.mjs).
//
// 🔴 Xərc modeli mobil tətbiqin `app/lib/domain/models/cost.dart` faylının
// birə-bir köçürməsidir (CostEstimator.estimate / bestOption / rankKey).
// Orada dəyişiklik olsa, burada da dəyiş — eyni maşın + eyni stansiya üçün
// veb və tətbiq EYNİ «Cəmi» göstərməlidir.
//
// 🔴 Soket uyğunluğu tətbiqdən FƏRQLİDİR (bilərəkdən): vebdə adapter təklif
// olunmur. Tətbiqin P0 baqı — CCS2 maşına GB/T DC postu «adapterlə» təklif
// etməsi (Type2→GB/T adapteri yalnız AC-dir) — burada təkrarlanmır.

export const CONNECTOR_LABEL = {
  ccs2: 'CCS2', type2: 'Type 2', gbt: 'GB/T', chademo: 'CHAdeMO', type1: 'Type 1', nacs: 'NACS', unknown: '—',
};
export const DC_CAPABLE = new Set(['ccs2', 'gbt', 'chademo', 'nacs']);

// Dizayn rəngləri (tokens.json → functional).
export const STATUS = {
  available: { label: 'Boş', color: '#12E28C' },
  occupied: { label: 'Məşğul', color: '#F2A93B' },
  reserved: { label: 'Rezerv', color: '#F2A93B' },
  offline: { label: 'Oflayn', color: '#E2504B' },
  unknown: { label: 'Naməlum', color: '#6B7B80' },
};
export const statusOf = (s) => STATUS[s] || STATUS.unknown;

export const DEFAULT_CONFIG = Object.freeze({
  detourRoundTrip: true,
  chargingEfficiency: 0.9,
  averageDetourSpeedKmh: 24,
  defaultTimeValuePerHour: 8,
  dcPowerDerating: 0.78,
  acPowerDerating: 0.95,
  occupiedWaitMinutes: 20,
});

/** `cost_model_config()` cavabı → konfiq (tətbiqin CostModelConfig.fromJson-u). */
export function configFromJson(j) {
  j = j || {};
  const n = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
  return {
    detourRoundTrip: typeof j.detour_round_trip === 'boolean' ? j.detour_round_trip : true,
    chargingEfficiency: n(j.charging_efficiency, 0.9),
    averageDetourSpeedKmh: n(j.average_detour_speed_kmh, 24),
    defaultTimeValuePerHour: n(j.default_time_value_per_hour, 8),
    dcPowerDerating: n(j.dc_power_derating, 0.78),
    acPowerDerating: n(j.ac_power_derating, 0.95),
    occupiedWaitMinutes: n(j.occupied_wait_minutes, 20),
  };
}

// ---------------------------------------------------------------- stansiya --

/** Tətbiqin `Station.status` aqreqatı. */
export function stationStatus(connectors) {
  const cs = connectors || [];
  if (!cs.length) return 'unknown';
  if (cs.some((c) => c.status === 'available')) return 'available';
  if (cs.some((c) => c.status === 'occupied' || c.status === 'reserved')) return 'occupied';
  if (cs.every((c) => c.status === 'offline')) return 'offline';
  return 'unknown';
}

export function strongest(connectors) {
  const cs = connectors || [];
  if (!cs.length) return null;
  return cs.reduce((a, b) => ((a.power_kw || 0) >= (b.power_kw || 0) ? a : b));
}
export const maxPowerKw = (connectors) => { const s = strongest(connectors); return s ? (s.power_kw || 0) : 0; };
export const dominantCurrent = (connectors) => { const s = strongest(connectors); return s && s.current_kind === 'dc' ? 'dc' : 'ac'; };

/** Tətbiqin `Station.accessRestricted`-i: «Yalnız …» ilə başlayan qeyd. */
export const accessRestricted = (note) => (note || '').trimStart().startsWith('Yalnız');

/** Bazadakı «Bilinmir» kimi yer tutucu ünvanlar göstərilmir. */
export function cleanText(s) {
  const t = (s || '').trim();
  if (!t || /^(bilinmir|naməlum|unknown|-|—)$/i.test(t)) return null;
  return t;
}

/** Operator olmayan «operatorlar» (tətbiqin isUnknownOperator-u). */
const NON_OPERATOR_SLUGS = new Set(['unknown_operator', 'plugshare']);
const NON_OPERATOR_NAMES = new Set(['operator göstərilməyib', 'plugshare']);
export function isUnknownOperator(name, slug) {
  const s = (slug || '').trim().toLowerCase();
  const n = (name || '').trim().toLowerCase();
  if (!s && !n) return true;
  return NON_OPERATOR_SLUGS.has(s) || NON_OPERATOR_NAMES.has(n);
}
export const displayOperator = (name, slug) => (isUnknownOperator(name, slug) ? null : (name || '').trim());

/** Operator tətbiq ikonu (tətbiqin operator_logo.dart xəritəsi). */
const ICON_SLUGS = new Set(['azerisiq', 'charge_az', 'electrify_az', 'elektra', 'enrg', 'gofar', 'ivolt', 'sigma', 'tok', 'touch_station']);
const ICON_BY_NAME = {
  'azərişıq': 'azerisiq', azerisiq: 'azerisiq', 'charge.az': 'charge_az', 'electrify.az': 'electrify_az', 'e-lektra': 'elektra',
  'elektra az': 'elektra', 'enrg.az': 'enrg', enrg: 'enrg', gofar: 'gofar', ivolt: 'ivolt', 'sigma charge': 'sigma', tok: 'tok', 'touch station': 'touch_station',
};
export function operatorIconSlug(name, slug) {
  const s = (slug || '').trim().toLowerCase();
  if (ICON_SLUGS.has(s)) return s;
  return ICON_BY_NAME[(name || '').trim().toLowerCase()] || null;
}
export function initials(name) {
  const parts = (name || '').replace(/[^\p{L}\p{N} ]/gu, ' ').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// ------------------------------------------------------------- təzəlik ----

/** Status «təzə» həddi (dəq): tətbiqin Station.staleThreshold-u (15 dəq) və serverin expire_stale_statuses-i ilə eyni. */
export const FRESH_MIN = 15;

/** status_updated_at → { text, stale } ; null → null (mətn göstərilmir). FRESH_MIN-dən köhnə → stale. */
export function freshness(iso, nowMs) {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const ageMs = (nowMs == null ? Date.now() : nowMs) - t;
  const min = Math.max(0, Math.floor(ageMs / 60000));
  if (min < 1) return { text: 'indicə yeniləndi', stale: false, min };
  if (min < 60) return ageMs > FRESH_MIN * 60000
    ? { text: min + ' dəq əvvəl — köhnə ola bilər', stale: true, min }
    : { text: min + ' dəq əvvəl yeniləndi', stale: false, min };
  const h = Math.floor(min / 60);
  if (h < 24) return { text: h + ' saat əvvəl — köhnə ola bilər', stale: true, min };
  return { text: Math.floor(h / 24) + ' gün əvvəl — köhnə ola bilər', stale: true, min };
}

/** Tarifin köhnəlmə günü (tətbiqin Tariff.staleDays-i) — yalnız is_stale olanda. */
export function tariffStaleDays(tariff, nowMs) {
  if (!tariff || !tariff.is_stale || !tariff.updated_at) return null;
  const t = Date.parse(tariff.updated_at);
  if (!Number.isFinite(t)) return null;
  return Math.floor(((nowMs == null ? Date.now() : nowMs) - t) / 86400000);
}

// ------------------------------------------------------------------ maşın --

export const batteryKwh = (m) => (m && m.battery_kwh_min != null && m.battery_kwh_max != null ? (m.battery_kwh_min + m.battery_kwh_max) / 2 : null);
export const rangeKm = (m) => (m && m.range_km_min != null && m.range_km_max != null ? Math.round((m.range_km_min + m.range_km_max) / 2) : null);
export function consumptionWhPerKm(m) {
  const b = batteryKwh(m), r = rangeKm(m);
  if (b == null || r == null || r === 0) return null;
  return b * 1000 / r;
}
/** Tətbiqin VehicleModel.acPlug-u. */
export const acPlug = (m) => m.ac_socket || (m.socket === 'gbt' ? 'gbt' : 'type2');
export const carSocketsLabel = (m) => {
  if (!m) return '';
  const a = [CONNECTOR_LABEL[m.socket] || m.socket];
  const ac = acPlug(m);
  if (ac !== m.socket) a.push(CONNECTOR_LABEL[ac] || ac);
  return a.join(' / ');
};

/**
 * DC-si OLMAYAN modellər — tətbiqin VehicleModel.knownDcLessIds-i (bazada
 * `vehicle_models.dc_supported = false`; `vehicle_catalog` RPC bu sahəni hələ
 * qaytarmır). Sıra tətbiqdəki kimi: açıq sahə → DC gücü varsa bəli → siyahı.
 */
export const KNOWN_DC_LESS_IDS = new Set(['smart-eq-fortwo', 'smart-eq-forfour', 'jeep-wrangler-4xe', 'jeep-grand-cherokee-4xe']);
export function supportsDc(m) {
  if (!m) return false;
  if (typeof m.dc_supported === 'boolean') return m.dc_supported;
  if (m.dc_max_kw != null && m.dc_max_kw > 0) return true;
  return !KNOWN_DC_LESS_IDS.has(m.id);
}

/**
 * Konnektorun maşına uyğunluğu (veb qaydası — ADAPTERSİZ):
 *   DC → konnektor tipi maşının DC yuvası ilə EYNİ, yuva DC-yə qadirdir və
 *        model DC-ni dəstəkləyir (supportsDc);
 *   AC → konnektor tipi maşının AC yuvası (ac_socket / acPlug) ilə eyni.
 * Qaytarır: { kind: 'native' | 'typeUnknown', dcPowerUnknown } və ya null (uyğun deyil).
 * dcPowerUnknown: kataloqda dc_max_kw yoxdur → müddət təxminidir (tətbiqdəki kimi 50 kW fərz).
 */
export function fitOf(connector, model) {
  if (!model) return null;
  const type = connector.type || 'unknown';
  if (type === 'unknown' || !CONNECTOR_LABEL[type]) return { kind: 'typeUnknown', dcPowerUnknown: false };
  if (connector.current_kind === 'dc') {
    if (DC_CAPABLE.has(model.socket) && type === model.socket && supportsDc(model)) {
      return { kind: 'native', dcPowerUnknown: model.dc_max_kw == null };
    }
    return null;
  }
  return type === acPlug(model) ? { kind: 'native', dcPowerUnknown: false } : null;
}
const FIT_INDEX = { native: 0, typeUnknown: 3 };

// --------------------------------------------------------- xərc (cost.dart) --

export const ASSUMED_DC_MAX_KW = 50;
export const ASSUMED_AC_MAX_KW = 7.4;
const DC_DELIVERY = 0.9, AC_DELIVERY = 0.9;

export function dcCurve(soc) {
  if (soc < 50) return 1;
  if (soc < 80) return 1 - 0.5 * (soc - 50) / 30;
  const v = 0.5 - 0.35 * (soc - 80) / 20;
  return v < 0.15 ? 0.15 : v;
}

export function chargeMinutes({ fromSoc, toSoc, batteryKwh: bat, kind, connectorKw, vehicleMaxKw }) {
  if (toSoc <= fromSoc || connectorKw <= 0 || vehicleMaxKw <= 0) return 0;
  const step = 0.5;
  let hours = 0;
  for (let soc = fromSoc; soc < toSoc; soc += step) {
    const ds = (toSoc - soc) < step ? (toSoc - soc) : step;
    const mid = soc + ds / 2;
    const power = kind === 'ac'
      ? Math.min(connectorKw, vehicleMaxKw) * AC_DELIVERY
      : Math.min(connectorKw, vehicleMaxKw * dcCurve(mid)) * DC_DELIVERY;
    if (power <= 0) return Infinity;
    hours += ds / 100 * bat / power;
  }
  return hours * 60;
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const UNAVAILABLE = Object.freeze({ available: false, lines: [], reason: 'price_unverified' });

export function tariffShowsNumber(t) {
  return !!t && (t.confidence === 'verified' || t.confidence === 'reported') && t.price_per_kwh != null;
}

/**
 * CostEstimator.estimate — tam xərc. YALNIZ ödənilən pul `lines`-a düşür
 * (enerji, sessiya haqqı, yol enerjisi, parkinq). Vaxtın dəyəri yalnız `score`-da.
 */
export function estimate({ station, connector, model, currentSoc = 20, targetSoc = 80, detourKm = 0,
  expectedWaitMinutes = 0, timeValuePerHour, config = DEFAULT_CONFIG }) {
  const tariff = connector.tariff || station.tariff || null;
  if (!tariffShowsNumber(tariff)) return { ...UNAVAILABLE, reason: tariff ? 'price_unverified' : 'price_unknown' };
  const price = tariff.price_per_kwh;
  const bat = batteryKwh(model);
  if (bat == null) return { ...UNAVAILABLE, reason: 'battery_unknown' };
  const rate = timeValuePerHour == null ? config.defaultTimeValuePerHour : timeValuePerHour;

  const fromSoc = clamp(currentSoc, 0, 100), toSoc = clamp(targetSoc, 0, 100);
  const socDelta = clamp(toSoc - fromSoc, 0, 100);
  const energyToBattery = bat * socDelta / 100;
  const meteredKwh = energyToBattery / config.chargingEfficiency;

  const dc = connector.current_kind === 'dc';
  const vehicleMax = dc ? model.dc_max_kw : model.ac_max_kw;
  const approximate = vehicleMax == null;
  const vehicleLimit = vehicleMax == null ? (dc ? ASSUMED_DC_MAX_KW : ASSUMED_AC_MAX_KW) : vehicleMax;
  const connectorKw = connector.power_kw || 0;
  const effectiveKw = Math.min(connectorKw, vehicleLimit);
  const raw = chargeMinutes({ fromSoc, toSoc: fromSoc + socDelta, batteryKwh: bat, kind: dc ? 'dc' : 'ac', connectorKw, vehicleMaxKw: vehicleLimit });
  const chargeMins = Number.isFinite(raw) ? Math.round(raw) : 0;

  const lines = [{ kind: 'energy', amount: meteredKwh * price, kwh: meteredKwh, price }];
  const sessionFee = tariff.session_fee || 0;
  if (sessionFee > 0) lines.push({ kind: 'sessionFee', amount: sessionFee });

  let detourMins = 0;
  if (detourKm > 0) {
    const km = config.detourRoundTrip ? detourKm * 2 : detourKm;
    if (config.averageDetourSpeedKmh > 0) detourMins = Math.round(km / config.averageDetourSpeedKmh * 60);
    const cons = consumptionWhPerKm(model);
    if (cons != null) {
      const detourKwh = km * cons / 1000;
      lines.push({ kind: 'detour', amount: detourKwh * price, km, detail: km.toFixed(1) });
    }
  }
  const parkingPerHour = tariff.parking_per_hour || 0;
  if (parkingPerHour > 0) {
    const free = tariff.free_parking_minutes || 0;
    const billable = clamp(chargeMins - free, 0, 100000);
    lines.push({ kind: 'parking', amount: billable > 0 ? billable / 60 * parkingPerHour : 0, freeMinutes: free });
  }
  const total = lines.reduce((s, l) => s + l.amount, 0);
  const wait = expectedWaitMinutes < 0 ? 0 : expectedWaitMinutes;
  const totalMinutes = chargeMins + detourMins + wait;
  const timeCost = totalMinutes / 60 * rate;
  return {
    available: true, lines, total, energyKwh: meteredKwh, durationMinutes: chargeMins, expectedWaitMinutes: wait,
    detourMinutes: detourMins, timeValuePerHour: rate, isDurationApproximate: approximate, effectivePowerKw: effectiveKw,
    totalMinutes, timeCost, score: total + timeCost, price, tariff,
  };
}

export const rankKey = (e) => (e && e.available ? e.score : Infinity);
const isBusy = (c) => c.status === 'occupied' || c.status === 'reserved';

/**
 * CostEstimator.bestOption — stansiyanın maşın üçün ən yaxşı konnektoru.
 * offline çıxarılır; uyğun olmayan çıxarılır; məşğul gözləmə cəzası alır.
 * Heç biri qalmırsa null.
 */
export function bestOption({ station, model, currentSoc = 20, targetSoc = 80, detourKm = 0, timeValuePerHour, config = DEFAULT_CONFIG }) {
  let best = null;
  for (const c of station.connectors || []) {
    if (c.status === 'offline') continue;
    const fit = fitOf(c, model);
    if (!fit) continue;
    const e = estimate({ station, connector: c, model, currentSoc, targetSoc, detourKm,
      expectedWaitMinutes: isBusy(c) ? Math.round(config.occupiedWaitMinutes) : 0, timeValuePerHour, config });
    const o = { connector: c, estimate: e, fit };
    if (!best || better(o, best)) best = o;
  }
  return best;
}
function better(a, b) {
  const ka = rankKey(a.estimate), kb = rankKey(b.estimate);
  if (ka !== kb) return ka < kb;
  if (FIT_INDEX[a.fit.kind] !== FIT_INDEX[b.fit.kind]) return FIT_INDEX[a.fit.kind] < FIT_INDEX[b.fit.kind];
  return (a.connector.power_kw || 0) > (b.connector.power_kw || 0);
}

/** Stansiya ekranında defolt konnektor: tətbiqin qaydası (boş olan ən güclü),
 *  amma vebdə əvvəl maşına UYĞUN konnektorlar arasından seçilir. */
export function defaultConnector(connectors, model) {
  const cs = connectors || [];
  if (!cs.length) return null;
  const pickFrom = (pool) => {
    const avail = pool.filter((c) => c.status === 'available');
    const p = avail.length ? avail : pool;
    return p.reduce((a, b) => ((a.power_kw || 0) >= (b.power_kw || 0) ? a : b));
  };
  if (model) {
    const compat = cs.filter((c) => { const f = fitOf(c, model); return f && f.kind === 'native' && c.status !== 'offline'; });
    if (compat.length) return pickFrom(compat);
  }
  return pickFrom(cs);
}

// --------------------------------------------------------------- məsafə ----

export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371.0088, rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad, dLng = (lng2 - lng1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

// --------------------------------------------------------------- format ----

const NNBSP = ' ';
export const num = (n, d = 1) => Number(n).toFixed(d).replace('.', ',');
export const money = (n) => num(n, 2) + ' ₼';
export const tariffText = (p) => num(p, 2) + ' ₼/kWh';
export function dur(min) {
  min = Math.round(min);
  if (min < 60) return min + ' dəq';
  const h = Math.floor(min / 60), r = min % 60;
  return r ? h + ' s ' + String(r).padStart(2, '0') + ' dəq' : h + ' s';
}
export function distText(km) {
  if (km == null || !Number.isFinite(km)) return '';
  return (km < 10 ? num(km, 1) : String(Math.round(km))) + ' km';
}
export const kwText = (kw) => (Math.round(kw * 10) / 10).toString().replace('.', ',');
export { NNBSP };

const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
export const monthName = (i) => MONTHS[i];
export function dateAz(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
}
export function dateTimeShort(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (x) => String(x).padStart(2, '0');
  return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear() + ' · ' + p(d.getHours()) + ':' + p(d.getMinutes());
}

// ------------------------------------------------- say və terminologiya ----
//
// 20.11 (Turanın qərarı): MƏKAN = bazadakı `stations` sətri (xəritədəki marker/siyahı sətri)
// · STANSİYA = şarj cihazı (post) · SOKET = fiziki çıxış. Rəqəmin yanında yalnız bu üç söz.
// Stansiya sayı yalnız mənbə verəndə (`post_count`, 0119); soketdən HESABLANMIR.

/** Canlı status: mənbə operator adapteri/OCPI-dir VƏ ən azı bir soketin statusu `unknown` deyil.
 *  (Əvvəl `status_source || status_updated_at` idi → Charge.az «Bəli» görünürdü, 136/136 soket unknown.) */
export const LIVE_SOURCES = new Set(['operator_adapter', 'ocpi']);
export function hasLiveStatus(s) {
  if (!s || !LIVE_SOURCES.has(s.status_source)) return false;
  return (s.connectors || []).some((c) => (c.status || 'unknown') !== 'unknown');
}

/** Rəqəm + 3-cü şəxs mənsubiyyət şəkilçisi oxunuşa görə: 8-i, 2-si, 3-ü, 6-sı, 9-u, 40-ı, 100-ü. */
export function possN(n) {
  const ONES = ['', 'i', 'si', 'ü', 'ü', 'i', 'sı', 'si', 'i', 'u'];
  const TENS = ['', 'u', 'si', 'u', 'ı', 'si', 'ı', 'i', 'i', 'ı'];
  n = Math.abs(Math.round(n));
  const o = n % 10, t = Math.floor(n / 10) % 10, h = Math.floor(n / 100) % 10;
  return n + '-' + (o ? ONES[o] : t ? TENS[t] : h ? 'ü' : 'i');
}

/** Soket sayı (qruplaşdırılmış konnektorların `count` cəmi). */
export const socketCount = (connectors) => (connectors || []).reduce((a, c) => a + (c.count > 0 ? c.count : 1), 0);

/** Məkan kartı: «21 stansiya · 31 soket» (post_count məlumdursa) və ya «31 soket». */
export function stationUnitsText(postCount, connectors) {
  const k = socketCount(connectors);
  return (typeof postCount === 'number' && postCount > 0 ? postCount + ' stansiya · ' : '') + k + ' soket';
}

/** Qrup sətri (eyni fiş + cərəyan + güc): «10 soketdən 8-i boş». Tək soketdə null (status etiketi kifayətdir);
 *  status bilinmirsə (hamısı `unknown`) yalnız «10 soket» — «0-ı boş» yazılmır. */
export function groupFreeText(count, available, unknown) {
  if (!(count > 1)) return null;
  if (available == null || unknown >= count) return count + ' soket';
  return count + ' soketdən ' + possN(available) + ' boş';
}

// ---------------------------------------------------- operator statistikası --

/**
 * Yüklənmiş stansiyalardan operator-operator real rəqəmlər (bloq yazısı və
 * Operatorlar səhifəsi üçün). Heç bir rəqəm uydurulmur — yalnız sayılır.
 */
export function operatorStats(stations) {
  const by = new Map();
  for (const s of stations || []) {
    const name = s.operator_name || '';
    // `stations` = MƏKAN sayıdır (sahə adı geriyə uyğunluq üçün saxlanıb)
    if (!by.has(s.operator_id)) by.set(s.operator_id, { id: s.operator_id, name, stations: 0, sockets: 0, postsKnown: 0, posts: 0, dc: 0, ac: 0, live: 0, prices: [], noPrice: 0, available: 0 });
    const o = by.get(s.operator_id);
    o.stations++;
    const cs = s.connectors || [];
    o.sockets += socketCount(cs);
    if (typeof s.post_count === 'number' && s.post_count > 0) { o.postsKnown++; o.posts += s.post_count; }
    if (cs.some((c) => c.current_kind === 'dc')) o.dc++;
    if (cs.some((c) => c.current_kind === 'ac')) o.ac++;
    if (hasLiveStatus(s)) o.live++;
    if (stationStatus(cs) === 'available') o.available++;
    if (tariffShowsNumber(s.tariff)) o.prices.push(s.tariff.price_per_kwh); else o.noPrice++;
  }
  return [...by.values()].map((o) => {
    const ps = o.prices.slice().sort((a, b) => a - b);
    return Object.assign(o, {
      minPrice: ps.length ? ps[0] : null,
      maxPrice: ps.length ? ps[ps.length - 1] : null,
      medianPrice: ps.length ? (ps.length % 2 ? ps[(ps.length - 1) / 2] : (ps[ps.length / 2 - 1] + ps[ps.length / 2]) / 2) : null,
      priced: ps.length,
    });
  }).sort((a, b) => b.stations - a.stations);
}

export function priceRangeText(o) {
  if (o.minPrice == null) return null;
  return o.minPrice === o.maxPrice ? num(o.minPrice, 2) + ' ₼' : num(o.minPrice, 2) + '–' + num(o.maxPrice, 2) + ' ₼';
}
