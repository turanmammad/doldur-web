// node xerite/test/logic.test.mjs [cases.json dart_out.json]
//
// 1) Əl ilə yazılmış hallar (uyğunluq qaydası, status, təzəlik).
// 2) İstəyə bağlı: tətbiqin ÖZ Dart CostEstimator-u ilə eyni girişlərin
//    müqayisəsi (cases.json + dart_out.json — scratch skripti ref.dart yaradır).
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import * as L from '../lib/logic.js';

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('✓', name); };

const ccs2Car = { id: 'byd-atto-3', socket: 'ccs2', ac_socket: 'type2', dc_max_kw: 88, ac_max_kw: 11, battery_kwh_min: 60.5, battery_kwh_max: 60.5, range_km_min: 420, range_km_max: 420 };
const gbtCarNoDc = { id: 'byd-e2', socket: 'gbt', ac_socket: 'gbt', dc_max_kw: null, ac_max_kw: null, battery_kwh_min: 47.3, battery_kwh_max: 47.3, range_km_min: 405, range_km_max: 405 };
const C = (type, current_kind, power_kw = 60, status = 'available') => ({ id: type + current_kind + power_kw, type, current_kind, power_kw, status });

t('CCS2 maşın + GB/T DC → uyğun DEYİL (adapter təklifi yoxdur)', () => {
  assert.equal(L.fitOf(C('gbt', 'dc'), ccs2Car), null);
});
t('CCS2 maşın + GB/T AC → uyğun deyil (Type 2 yuvası)', () => {
  assert.equal(L.fitOf(C('gbt', 'ac', 7), ccs2Car), null);
});
t('CCS2 maşın + CCS2 DC və Type 2 AC → uyğun', () => {
  assert.equal(L.fitOf(C('ccs2', 'dc'), ccs2Car).kind, 'native');
  assert.equal(L.fitOf(C('type2', 'ac', 22), ccs2Car).kind, 'native');
});
t('GB/T maşın, dc_max_kw yoxdur → DC uyğun, güc bilinmir (müddət təxmini)', () => {
  const f = L.fitOf(C('gbt', 'dc'), gbtCarNoDc);
  assert.equal(f.kind, 'native'); assert.equal(f.dcPowerUnknown, true);
  assert.equal(L.fitOf(C('ccs2', 'dc'), gbtCarNoDc), null);
});
t('DC-siz model (Smart EQ fortwo) → CCS2 DC uyğun DEYİL, Type 2 AC uyğun', () => {
  const smart = { id: 'smart-eq-fortwo', socket: 'ccs2', ac_socket: 'type2', dc_max_kw: null, ac_max_kw: 22 };
  assert.equal(L.fitOf(C('ccs2', 'dc'), smart), null);
  assert.equal(L.fitOf(C('type2', 'ac', 22), smart).kind, 'native');
  assert.equal(L.fitOf(C('ccs2', 'dc'), { ...smart, dc_supported: true }).kind, 'native');
});
t('Tipi bilinməyən konnektor → typeUnknown («uyğun deyil» demirik)', () => {
  assert.equal(L.fitOf(C('unknown', 'dc'), ccs2Car).kind, 'typeUnknown');
});
t('Stansiya statusu aqreqatı (tətbiq qaydası)', () => {
  assert.equal(L.stationStatus([C('ccs2', 'dc', 60, 'offline'), C('ccs2', 'dc', 60, 'available')]), 'available');
  assert.equal(L.stationStatus([C('ccs2', 'dc', 60, 'reserved'), C('ccs2', 'dc', 60, 'unknown')]), 'occupied');
  assert.equal(L.stationStatus([C('ccs2', 'dc', 60, 'offline')]), 'offline');
  assert.equal(L.stationStatus([C('ccs2', 'dc', 60, 'offline'), C('ccs2', 'dc', 60, 'unknown')]), 'unknown');
  assert.equal(L.stationStatus([]), 'unknown');
});
t('Təzəlik: null → mətn yoxdur; 61 dəq → köhnə ola bilər', () => {
  const now = Date.parse('2026-11-18T12:00:00Z');
  assert.equal(L.freshness(null, now), null);
  assert.equal(L.freshness('2026-11-18T11:55:00Z', now).text, '5 dəq əvvəl yeniləndi');
  const f = L.freshness('2026-11-18T10:59:00Z', now);
  assert.equal(f.stale, true); assert.match(f.text, /köhnə ola bilər/);
});
t('Məhdud giriş: yalnız «Yalnız…» ilə başlayan qeyd', () => {
  assert.equal(L.accessRestricted('Yalnız sakinlər üçün'), true);
  assert.equal(L.accessRestricted('Kafe var · WC var'), false);
  assert.equal(L.accessRestricted(null), false);
});
t('Tarif yoxdursa və ya unverified-dirsə hesablama YOXDUR', () => {
  const st = { tariff: null, connectors: [] };
  assert.equal(L.estimate({ station: st, connector: C('ccs2', 'dc'), model: ccs2Car }).available, false);
  const st2 = { tariff: { confidence: 'unverified', price_per_kwh: 0.3 } };
  assert.equal(L.estimate({ station: st2, connector: C('ccs2', 'dc'), model: ccs2Car }).available, false);
});
t('Əl ilə hesablama: 60,5 kWh, 20→80%, 0,30 ₼ → 60,5×0,6/0,9×0,30 = 12,10 ₼', () => {
  const st = { tariff: { confidence: 'reported', price_per_kwh: 0.3 } };
  const e = L.estimate({ station: st, connector: C('ccs2', 'dc', 120), model: ccs2Car });
  assert.equal(L.money(e.total), '12,10 ₼');
  assert.equal(e.lines.length, 1);
});
t('Format', () => {
  assert.equal(L.money(9.316), '9,32 ₼');
  assert.equal(L.dur(42), '42 dəq');
  assert.equal(L.dur(65), '1 s 05 dəq');
  assert.equal(L.distText(2.345), '2,3 km');
});

// ---- Dart referansı ilə müqayisə ----
const [casesPath, dartPath] = process.argv.slice(2);
if (casesPath && dartPath) {
  const cases = JSON.parse(readFileSync(casesPath, 'utf8'));
  const ref = JSON.parse(readFileSync(dartPath, 'utf8'));
  let checked = 0, mism = 0;
  cases.forEach((c, i) => {
    const r = ref[i];
    const station = Object.assign({}, c.station);
    const best = L.bestOption({ station, model: c.model, currentSoc: c.cur, targetSoc: c.tgt, detourKm: c.detour, timeValuePerHour: c.tv });
    const bJs = best ? { conn: best.connector.id, total: best.estimate.available ? best.estimate.total.toFixed(2) : null, score: best.estimate.available ? best.estimate.score.toFixed(4) : null } : null;
    try { assert.deepEqual(bJs, r.best); } catch (e) { mism++; if (mism < 6) console.log('✗ best', i, c.station.name, c.model.id, bJs, r.best); }
    (c.station.connectors || []).forEach((k, j) => {
      const e = L.estimate({ station: c.station, connector: k, model: c.model, currentSoc: c.cur, targetSoc: c.tgt, detourKm: c.detour,
        expectedWaitMinutes: (k.status === 'occupied' || k.status === 'reserved') ? 20 : 0, timeValuePerHour: c.tv });
      const f = L.fitOf(k, c.model);
      const js = { available: e.available, total: e.available ? e.total.toFixed(2) : null, dur: e.available ? e.durationMinutes : 0,
        score: e.available ? e.score.toFixed(4) : null, lines: e.lines.map((l) => l.kind + ':' + l.amount.toFixed(4)), fit: f ? f.kind : null };
      const d = r.per[j];
      try { assert.deepEqual(js, d); checked++; } catch (err) { mism++; if (mism < 6) console.log('✗', i, j, c.station.name, c.model.id, JSON.stringify(js), JSON.stringify(d)); }
    });
  });
  console.log(`Dart müqayisəsi: ${checked} konnektor hesablaması + ${cases.length} bestOption, uyğunsuzluq: ${mism}`);
  assert.equal(mism, 0);
  n++;
}
console.log(`\n${n} test keçdi`);
