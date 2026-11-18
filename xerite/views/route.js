// E5 · MARŞRUT — dizayn şablonundan; hesablama serverdə (route-plan), YALNIZ «Hesabla» ilə.
import { html } from '../lib/h.js';

const placeField = (v, id, label, value, onInput, ok, sug) => html`
  <div style="display:flex;flex-direction:column;gap:6px;position:relative">
    <label for=${id} style="font-size:13px;font-weight:500;color:${v.c.muted}">${label}</label>
    <input id=${id} type="text" value=${value} onInput=${onInput} autocomplete="off" placeholder="Şəhər və ya yer adı (ən az 3 hərf)" aria-autocomplete="list" style="min-height:48px;border-radius:10px;border:1px solid ${ok ? v.c.accentBorder : v.c.border};background:${v.c.surface2};color:${v.c.text};font-size:15px;padding:0 12px" />
    ${sug.length ? html`
      <ul role="listbox" style="list-style:none;margin:0;padding:6px;position:absolute;left:0;right:0;top:100%;z-index:20;background:${v.c.surface};border:1px solid ${v.c.border};border-radius:12px;box-shadow:${v.c.shadow2};max-height:260px;overflow:auto">
        ${sug.map((p) => html`<li><button type="button" onClick=${p.go} style="cursor:pointer;width:100%;text-align:left;min-height:40px;padding:0 10px;border-radius:8px;border:none;background:transparent;color:${v.c.text};font-size:14px">${p.label}</button></li>`)}
      </ul>
    ` : null}
  </div>
`;

export const RouteView = (v) => (v.pRoute ? html`
  <main style="max-width:1200px;margin:0 auto;padding:32px 20px 48px;display:flex;flex-direction:column;gap:24px">
    <div style="display:flex;flex-direction:column;gap:8px">
      <span style="font-family:'Geist Mono',monospace;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${v.c.accentText}">Uzun yol planı</span>
      <h1 class="d-h1" style="margin:0;font-family:'Manrope',sans-serif;font-weight:700;font-size:40px;letter-spacing:-0.02em;line-height:1.1">Harada dayanım, nə qədər doldurum?</h1>
      <p style="margin:0;color:${v.c.muted};font-size:16px;max-width:620px;text-wrap:pretty">Maşınını və batareya faizini seç — Doldur yol boyu dayanacaqları, şarj müddətini və xərci hesablayır. Hədəf: təyinat yerinə ən az 20% ilə çatmaq.</p>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start">
      <form onSubmit=${v.calc} style="flex:1 1 320px;min-width:0;background:${v.c.surface};border:1px solid ${v.c.border};border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:14px;box-shadow:${v.c.shadow1}">
        ${placeField(v, 'd-from', 'Haradan', v.rFromQ, v.onFrom, v.rFromOk, v.fromSug)}
        ${placeField(v, 'd-to', 'Haraya', v.rToQ, v.onTo, v.rToOk, v.toSug)}
        <div style="display:flex;flex-direction:column;gap:6px">
          <span style="font-size:13px;font-weight:500;color:${v.c.muted}">Maşın</span>
          <button type="button" onClick=${v.openCarPicker} style="cursor:pointer;text-align:left;min-height:48px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface2};color:${v.hasCar ? v.c.text : v.c.accentText};font-size:15px;padding:0 12px;display:flex;align-items:center;justify-content:space-between;gap:8px"><span>${v.carShort}</span><span aria-hidden="true" style="color:${v.c.faint}">›</span></button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;justify-content:space-between;align-items:baseline"><label for="d-bat" style="font-size:13px;font-weight:500;color:${v.c.muted}">Çıxışda batareya</label><output for="d-bat" style="font-family:'Geist Mono',monospace;font-size:18px;font-weight:600">${v.bat}%</output></div>
          <input id="d-bat" type="range" min="25" max="100" step="5" value=${v.bat} onInput=${v.onBat} style="width:100%;accent-color:#12E28C;min-height:32px" />
          <div style="height:8px;border-radius:999px;background:${v.c.surface2};overflow:hidden"><div style="height:100%;width:${v.batW};background:#12E28C;transition:width .18s"></div></div>
        </div>
        <button type="submit" disabled=${!v.canCalc} style="cursor:${v.canCalc ? 'pointer' : 'default'};min-height:52px;border-radius:10px;border:none;background:${v.canCalc ? '#12E28C' : v.c.surface2};color:${v.canCalc ? '#0B1518' : v.c.faint};font-size:16px;font-weight:600">${v.planLoading ? 'Hesablanır…' : 'Hesabla'}</button>
        <div style="display:flex;flex-direction:column;gap:8px;padding-top:6px;border-top:1px solid ${v.c.border}">
          <span style="font-size:13px;font-weight:500;color:${v.c.muted}">Populyar marşrutlar</span>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${v.presets.map((pr) => html`
              <button type="button" onClick=${pr.go} aria-pressed=${pr.on} style="cursor:pointer;min-height:36px;padding:0 12px;border-radius:999px;font-size:13px;background:${pr.bg};color:${pr.color};border:1px solid ${pr.bd}">${pr.label}</button>
            `)}
          </div>
        </div>
      </form>

      <section aria-label="Marşrut nəticəsi" aria-live="polite" style="flex:999 1 520px;min-width:0;display:flex;flex-direction:column;gap:16px">
        ${v.noPlanYet ? html`
          <div style="background:${v.c.surface};border:1px dashed ${v.c.borderStrong};border-radius:16px;padding:40px 20px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center">
            <span style="font-family:'Manrope',sans-serif;font-weight:700;font-size:18px">${v.rFromL} → ${v.rToL}</span>
            <span style="font-size:14px;color:${v.c.muted};max-width:380px">${v.hasCar ? 'Başlanğıc və hədəfi siyahıdan seç, sonra «Hesabla» düyməsinə bas.' : 'Əvvəlcə maşınını seç — dayanacaqlar batareya tutumuna görə hesablanır.'}</span>
          </div>
        ` : null}
        ${v.planLoading ? html`<div style="background:${v.c.surface};border:1px solid ${v.c.border};border-radius:16px;padding:32px;text-align:center;color:${v.c.muted}">Marşrut hesablanır…</div>` : null}
        ${v.rErr ? html`
          <div role="alert" style="background:${v.c.surface};border:1px solid ${v.c.border};border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:8px">
            <h2 style="margin:0;font-family:'Manrope',sans-serif;font-weight:700;font-size:20px">${v.rErr[0]}</h2>
            <div style="font-size:14px;line-height:1.5;padding:12px 14px;border-radius:10px;background:${v.c.redBg};color:${v.c.redText}">${v.rErr[1]}</div>
          </div>
        ` : null}
        ${v.hasPlan ? html`
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px">
            ${v.rTiles.map((tl) => html`
              <div style="background:${v.c.surface};border:1px solid ${v.c.border};border-radius:14px;padding:14px 16px;display:flex;flex-direction:column;gap:4px">
                <span style="font-size:12px;color:${v.c.muted}">${tl.k}</span>
                <span style="font-family:'Geist Mono',monospace;font-size:20px;font-weight:600;font-variant-numeric:tabular-nums;line-height:1.25">${tl.v}</span>
              </div>
            `)}
          </div>

          <div style="background:${v.c.surface};border:1px solid ${v.c.border};border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:18px">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
              <h2 style="margin:0;font-family:'Manrope',sans-serif;font-weight:700;font-size:20px;letter-spacing:-0.01em">${v.rFromL} → ${v.rToL}</h2>
              <span style="font-family:'Geist Mono',monospace;font-size:13px;color:${v.c.muted}">${v.carShort}</span>
            </div>
            <div aria-hidden="true" style="position:relative;height:48px;margin:0 10px">
              <div style="position:absolute;left:0;right:0;top:22px;height:4px;border-radius:999px;background:${v.c.surface2}"></div>
              <div style="position:absolute;left:0;top:22px;height:4px;border-radius:999px;background:#12E28C;width:100%;opacity:.5"></div>
              ${v.rDots.map((dt) => html`
                <span style="position:absolute;left:${dt.x};top:${dt.top};transform:translateX(-50%);width:${dt.s};height:${dt.s};border-radius:${dt.r};background:${dt.bg};border:2px solid ${dt.bd}"></span>
              `)}
            </div>
            <ol style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column">
              ${v.rSteps.map((sp) => html`
                <li style="display:flex;gap:14px">
                  <span aria-hidden="true" style="display:flex;flex-direction:column;align-items:center;width:24px;flex-shrink:0">
                    <span style="width:24px;height:24px;border-radius:${sp.r};background:${sp.bg};border:2px solid ${sp.bd};display:flex;align-items:center;justify-content:center;font-family:'Geist Mono',monospace;font-size:11px;font-weight:600;color:${sp.fg}">${sp.n}</span>
                    <span style="flex:1;width:2px;min-height:18px;background:${sp.line}"></span>
                  </span>
                  <div style="flex:1;min-width:0;padding-bottom:18px;display:flex;flex-direction:column;gap:4px">
                    <span style="display:flex;gap:8px;align-items:baseline;flex-wrap:wrap">${sp.open ? html`<button onClick=${sp.open} style="cursor:pointer;background:none;border:none;padding:0;text-align:left;font-size:15px;font-weight:600;color:${v.c.text};text-decoration:underline;text-decoration-color:${v.c.border};text-underline-offset:3px">${sp.title}</button>` : html`<span style="font-size:15px;font-weight:600">${sp.title}</span>`}<span style="font-family:'Geist Mono',monospace;font-size:12px;color:${v.c.faint}">${sp.km}</span></span>
                    <span style="font-size:14px;color:${v.c.muted}">${sp.sub}</span>
                    ${sp.isStop ? html`
                      <span style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;font-family:'Geist Mono',monospace;font-size:12px">
                        ${sp.conn ? html`<span style="padding:4px 8px;border-radius:6px;background:${v.c.surface2}">${sp.conn}</span>` : null}
                        ${sp.chg ? html`<span style="padding:4px 8px;border-radius:6px;background:${v.c.surface2}">${sp.chg}</span>` : null}
                        ${sp.time ? html`<span style="padding:4px 8px;border-radius:6px;background:${v.c.surface2}">${sp.time}</span>` : null}
                        <span style="padding:4px 8px;border-radius:6px;background:${v.c.accentSoft};color:${v.c.accentText}">${sp.cost}</span>
                      </span>
                      ${sp.statusUnknown ? html`<span style="font-size:12px;color:${v.c.faint}">Statusu bilinmir — getməzdən əvvəl operatorla yoxla.</span>` : null}
                    ` : null}
                  </div>
                </li>
              `)}
            </ol>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button onClick=${v.shareRoute} style="cursor:pointer;flex:1 1 150px;min-height:48px;border-radius:10px;border:none;background:#12E28C;color:#0B1518;font-size:15px;font-weight:600">Marşrutu paylaş</button>
              ${v.rGmaps ? html`<a href=${v.rGmaps} target="_blank" rel="noopener noreferrer" style="flex:1 1 150px;min-height:48px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface};color:${v.c.text};font-size:15px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:6px">Google Xəritədə aç ↗</a>` : null}
              ${v.rWaze ? html`<a href=${v.rWaze} target="_blank" rel="noopener noreferrer" style="flex:1 1 120px;min-height:48px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface};color:${v.c.text};font-size:15px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:6px">Waze ↗</a>` : null}
            </div>
            <span style="font-size:12px;color:${v.c.faint}">${v.rNote}</span>
          </div>
        ` : null}
      </section>
    </div>
  </main>
` : null);
