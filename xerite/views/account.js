// E10 · FAVORİTLƏR, E7 · TARİXÇƏ — yalnız daxil olmuş istifadəçi üçün real data.
import { html } from '../lib/h.js';

export const loginPrompt = (v, title, text) => html`
  <div style="background:${v.c.surface};border:1px dashed ${v.c.borderStrong};border-radius:16px;padding:40px 20px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center">
    <span style="font-family:'Manrope',sans-serif;font-weight:700;font-size:18px">${title}</span>
    <span style="font-size:14px;color:${v.c.muted};max-width:340px">${text}</span>
    <button onClick=${v.goLogin} style="cursor:pointer;min-height:44px;padding:0 18px;border-radius:10px;border:none;background:#12E28C;color:#0B1518;font-size:14px;font-weight:600">Daxil ol</button>
  </div>
`;

export const FavsView = (v) => (v.pFavs ? html`
  <main style="max-width:960px;margin:0 auto;padding:32px 20px 48px;display:flex;flex-direction:column;gap:20px">
    <div style="display:flex;flex-direction:column;gap:6px">
      <h1 class="d-h1" style="margin:0;font-family:'Manrope',sans-serif;font-weight:700;font-size:36px;letter-spacing:-0.02em">Favoritlər</h1>
      <p style="margin:0;color:${v.c.muted}">Tez-tez getdiyin stansiyalar — mobil tətbiqlə eyni hesab, eyni siyahı.</p>
    </div>
    ${v.notLogged ? loginPrompt(v, 'Favoritlər hesabında saxlanır', 'Daxil ol — stansiya kartında ürək işarəsinə toxunduqların burada və telefonda görünəcək.') : null}
    ${v.favsLoading ? html`<div style="color:${v.c.muted};font-size:14px">Yüklənir…</div>` : null}
    ${v.favsEmpty ? html`
      <div style="background:${v.c.surface};border:1px dashed ${v.c.borderStrong};border-radius:16px;padding:40px 20px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center">
        <span style="font-family:'Manrope',sans-serif;font-weight:700;font-size:18px">Hələ favorit yoxdur</span>
        <span style="font-size:14px;color:${v.c.muted};max-width:320px">Stansiya kartında ürək işarəsinə toxun — burada görünəcək.</span>
        <button onClick=${v.goMap} style="cursor:pointer;min-height:44px;padding:0 18px;border-radius:10px;border:none;background:#12E28C;color:#0B1518;font-size:14px;font-weight:600">Xəritəyə keç</button>
      </div>
    ` : null}
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">
      ${v.favList.map((fv) => html`
        <article style="background:${v.c.surface};border:1px solid ${v.c.border};border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:10px">
          <div style="display:flex;gap:10px;align-items:flex-start"><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px"><h2 style="margin:0;font-size:16px;font-weight:600">${fv.name}</h2><span style="font-size:13px;color:${v.c.muted}">${fv.metaT}</span></div><span style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:500"><span aria-hidden="true" style="width:8px;height:8px;border-radius:2px;background:${fv.stColor}"></span>${fv.stLabel}</span></div>
          <div style="display:flex;gap:12px;font-family:'Geist Mono',monospace;font-size:14px;flex-wrap:wrap"><span style="font-weight:600">${fv.totalT}</span>${fv.durT ? html`<span style="color:${v.c.muted}">${fv.durT}</span>` : null}<span style="color:${v.c.muted}">${fv.powerT} kW</span></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button onClick=${fv.pick} style="cursor:pointer;flex:1 1 100px;min-height:40px;border-radius:10px;border:none;background:#12E28C;color:#0B1518;font-size:13px;font-weight:600">Xəritədə aç</button>
            <button onClick=${fv.share} style="cursor:pointer;flex:1 1 80px;min-height:40px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface2};color:${v.c.text};font-size:13px;font-weight:500">Paylaş</button>
            <button onClick=${fv.remove} aria-label=${fv.removeAria} style="cursor:pointer;min-height:40px;padding:0 12px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface2};color:${v.c.redText};font-size:13px;font-weight:500">Sil</button>
          </div>
        </article>
      `)}
    </div>
  </main>
` : null);

export const HistView = (v) => (v.pHist ? html`
  <main style="max-width:1100px;margin:0 auto;padding:32px 20px 48px;display:flex;flex-direction:column;gap:20px">
    <div style="display:flex;gap:16px;align-items:flex-end;flex-wrap:wrap">
      <div style="flex:1 1 300px;display:flex;flex-direction:column;gap:6px"><h1 class="d-h1" style="margin:0;font-family:'Manrope',sans-serif;font-weight:700;font-size:36px;letter-spacing:-0.02em">Şarj tarixçəsi</h1><p style="margin:0;color:${v.c.muted}">${v.monthLabel} · sessiyalar mobil tətbiqdə əl ilə qeyd olunur.</p></div>
    </div>
    ${v.notLogged ? loginPrompt(v, 'Tarixçə hesabında saxlanır', 'Daxil ol — mobil tətbiqdə qeyd etdiyin şarj sessiyaları burada görünəcək.') : null}
    ${v.logged ? html`
      ${v.histLoading ? html`<div style="color:${v.c.muted};font-size:14px">Yüklənir…</div>` : null}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px">
        ${v.histTiles.map((ht) => html`
          <div style="background:${v.c.surface};border:1px solid ${v.c.border};border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:4px"><span style="font-size:12px;color:${v.c.muted}">${ht.k}</span><span style="font-family:'Geist Mono',monospace;font-size:24px;font-weight:600;white-space:nowrap">${ht.v}</span></div>
        `)}
      </div>
      ${v.hasMonthly ? html`
        <div style="background:${v.c.surface};border:1px solid ${v.c.border};border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:12px">
          <h2 style="margin:0;font-family:'Manrope',sans-serif;font-weight:700;font-size:17px">Aylıq xərc</h2>
          <div aria-hidden="true" style="display:flex;align-items:flex-end;gap:10px;height:120px">
            ${v.monthBars.map((wb) => html`
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end"><span style="font-family:'Geist Mono',monospace;font-size:11px;color:${v.c.muted}">${wb.v}</span><span style="width:100%;max-width:64px;height:${wb.h};border-radius:6px 6px 2px 2px;background:#E8963C"></span><span style="font-size:12px;color:${v.c.muted}">${wb.k}</span></div>
            `)}
          </div>
        </div>
      ` : null}
      ${v.histEmpty ? html`<div style="background:${v.c.surface};border:1px dashed ${v.c.borderStrong};border-radius:16px;padding:32px 20px;text-align:center;color:${v.c.muted};font-size:14px">Hələ şarj sessiyası yoxdur. Mobil tətbiqdə şarjı qeyd et — burada görünəcək.</div>` : null}
      ${v.hist.length ? html`
        <div role="table" aria-label="Şarj sessiyaları" style="background:${v.c.surface};border:1px solid ${v.c.border};border-radius:16px;overflow:hidden">
          <div role="row" class="d-th" style="display:flex;gap:12px;padding:12px 18px;font-size:12px;color:${v.c.muted};border-bottom:1px solid ${v.c.border}"><span role="columnheader" style="flex:2 1 260px">Stansiya · tarix</span><span role="columnheader" style="flex:1 1 80px;text-align:right">kWh</span><span role="columnheader" style="flex:1 1 90px;text-align:right">Müddət</span><span role="columnheader" style="flex:1 1 90px;text-align:right">Məbləğ</span></div>
          ${v.hist.map((h) => html`
            <div role="row" style="display:flex;flex-wrap:wrap;align-items:center;gap:4px 12px;padding:14px 18px;border-top:1px solid ${v.c.border}">
              <span role="cell" style="flex:2 1 260px;min-width:0;display:flex;flex-direction:column;gap:2px"><span style="font-weight:500">${h.s}</span><span style="font-size:12px;color:${v.c.faint}"><span style="font-family:'Geist Mono',monospace">${h.d}</span>${h.op ? ' · ' + h.op : ''}</span></span>
              <span role="cell" style="flex:1 1 80px;text-align:right;font-family:'Geist Mono',monospace;font-size:14px">${h.kwh} kWh</span>
              <span role="cell" style="flex:1 1 90px;text-align:right;font-family:'Geist Mono',monospace;font-size:14px;color:${v.c.muted}">${h.t}</span>
              <span role="cell" style="flex:1 1 90px;text-align:right;font-family:'Geist Mono',monospace;font-size:15px;font-weight:600;color:${v.c.amberText}">${h.sum}</span>
            </div>
          `)}
        </div>
      ` : null}
    ` : null}
  </main>
` : null);
