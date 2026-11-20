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
t('Təzəlik həddi 15 dəq (tətbiq staleThreshold + server expire_stale_statuses ilə eyni, S3)', () => {
  const now = Date.parse('2026-11-18T12:00:00Z');
  assert.equal(L.FRESH_MIN, 15);
  assert.equal(L.freshness('2026-11-18T11:46:00Z', now).stale, false); // 14 dəq
  assert.equal(L.freshness('2026-11-18T11:45:00Z', now).stale, false); // düz 15 dəq — tətbiqdə də `age > 15` deyil
  const f16 = L.freshness('2026-11-18T11:44:00Z', now);               // 16 dəq
  assert.equal(f16.stale, true); assert.equal(f16.text, '16 dəq əvvəl — köhnə ola bilər');
  assert.equal(L.freshness('2026-11-18T11:20:00Z', now).stale, true);  // 40 dəq (köhnə hədd 60 idi → «təzə» görünürdü)
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
t('Canlı status: Charge.az kimi bütün soketləri unknown olan məkan → canlı DEYİL (bilinən status + adapter mənbəyi lazımdır)', () => {
  const unk = (n) => ({ type: 'gbt', current_kind: 'dc', power_kw: 60, count: n, status: 'unknown', count_unknown: n, count_available: 0 });
  // Charge.az: status_source/status_updated_at olsa belə, statuslar unknown-dursa «Bəli» yox
  assert.equal(L.hasLiveStatus({ status_source: 'operator_adapter', status_updated_at: '2026-11-20T12:00:00Z', connectors: [unk(4)] }), false);
  assert.equal(L.hasLiveStatus({ status_source: null, status_updated_at: '2026-11-20T12:00:00Z', connectors: [C('ccs2', 'dc', 60, 'available')] }), false);
  assert.equal(L.hasLiveStatus({ status_source: 'operator_adapter', connectors: [unk(2), C('ccs2', 'dc', 60, 'occupied')] }), true);
  assert.equal(L.hasLiveStatus({ status_source: 'ocpi', connectors: [C('ccs2', 'dc', 60, 'offline')] }), true);
  // operatorStats: Charge.az 2 məkan → live 0; iVolt 1 məkan → live 1
  const st = [
    { operator_id: 'cz', operator_name: 'Charge.az', status_source: 'operator_adapter', status_updated_at: '2026-11-20T12:00:00Z', connectors: [unk(3)], tariff: null },
    { operator_id: 'cz', operator_name: 'Charge.az', status_source: null, status_updated_at: null, connectors: [unk(1)], tariff: null },
    { operator_id: 'iv', operator_name: 'iVolt', status_source: 'operator_adapter', post_count: 10, connectors: [{ ...C('ccs2', 'dc', 180, 'available'), count: 20 }], tariff: null },
  ];
  const s = Object.fromEntries(L.operatorStats(st).map((o) => [o.name, o]));
  assert.equal(s['Charge.az'].live, 0);
  assert.equal(s['Charge.az'].stations, 2); assert.equal(s['Charge.az'].sockets, 4); assert.equal(s['Charge.az'].postsKnown, 0);
  assert.equal(s.iVolt.live, 1); assert.equal(s.iVolt.posts, 10); assert.equal(s.iVolt.sockets, 20);
});
t('Say mətnləri: «S stansiya · K soket» yalnız post_count varsa; qrup «10 soketdən 8-i boş»', () => {
  const g = [{ count: 20 }, { count: 11 }];
  assert.equal(L.stationUnitsText(21, g), '21 stansiya · 31 soket');
  assert.equal(L.stationUnitsText(null, g), '31 soket');
  assert.equal(L.stationUnitsText(undefined, [{}, {}, {}]), '3 soket'); // detal: hər soket ayrıca sətir
  assert.equal(L.groupFreeText(10, 8, 0), '10 soketdən 8-i boş');
  assert.equal(L.groupFreeText(4, 0, 4), '4 soket'); // hamısı unknown → «0-ı boş» YOX
  assert.equal(L.groupFreeText(1, 1, 0), null);
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 17, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(L.possN),
    ['1-i', '2-si', '3-ü', '4-ü', '5-i', '6-sı', '7-si', '8-i', '9-u', '10-u', '17-si', '20-si', '30-u', '40-ı', '50-si', '60-ı', '70-i', '80-i', '90-ı', '100-ü']);
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
