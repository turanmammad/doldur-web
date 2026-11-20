// OPERATORLAR — real `operators` cədvəli + yüklənmiş stansiyalardan sayılmış rəqəmlər.
import { html } from '../lib/h.js';

export const OpsView = (v) => (v.pOps ? html`
  <main style="max-width:1200px;margin:0 auto;padding:32px 20px 48px;display:flex;flex-direction:column;gap:24px">
    <div style="display:flex;flex-direction:column;gap:8px">
      <span style="font-family:'Geist Mono',monospace;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${v.c.accentText}">Tərəfsiz müqayisə</span>
      <h1 class="d-h1" style="margin:0;font-family:'Manrope',sans-serif;font-weight:700;font-size:40px;letter-spacing:-0.02em;line-height:1.1">Bütün operatorlar, tək xəritə</h1>
      <p style="margin:0;color:${v.c.muted};font-size:16px;max-width:620px;text-wrap:pretty">Doldur şarj satmır — məlumat verir və səni operatorun öz tətbiqinə yönləndirir. Rəqəmlər bu an Doldur bazasındakı şarj məkanlarından sayılır; tarifi operatorun tətbiqində yoxla.</p>
    </div>
    ${v.opsLoading ? html`<div style="color:${v.c.muted};font-size:14px">Operatorlar yüklənir…</div>` : null}
    ${v.opsErr ? html`
      <div role="alert" style="background:${v.c.redBg};color:${v.c.redText};border-radius:14px;padding:16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:14px">
        <span style="flex:1 1 200px">Operator məlumatı yüklənmədi. İnternet bağlantısını yoxla.</span>
        <button onClick=${v.retryOps} style="cursor:pointer;min-height:40px;padding:0 14px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface};color:${v.c.text};font-size:14px">Yenidən cəhd et</button>
      </div>
    ` : null}
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:14px">
      ${v.ops.map((op) => html`
        <article key=${op.id} style="background:${v.c.surface};border:1px solid ${v.c.border};border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:12px">
          <div style="display:flex;align-items:center;gap:12px">
            ${op.icon
              ? html`<img src=${op.icon} alt="" width="44" height="44" style="width:44px;height:44px;border-radius:12px;border:1px solid ${v.c.border};display:block;flex-shrink:0" />`
              : html`<span aria-hidden="true" style="width:44px;height:44px;flex-shrink:0;border-radius:12px;background:${v.c.surface2};border:1px solid ${v.c.border};display:flex;align-items:center;justify-content:center;font-family:'Manrope',sans-serif;font-weight:800;font-size:16px">${op.ab}</span>`}
            <div style="display:flex;flex-direction:column;gap:2px;min-width:0"><h2 style="margin:0;font-family:'Manrope',sans-serif;font-weight:700;font-size:18px">${op.n}</h2>
              ${op.phone ? html`<a href=${op.phoneHref} style="font-size:13px;color:${v.c.muted};font-family:'Geist Mono',monospace">${op.phone}</a>` : html`<span style="font-size:13px;color:${v.c.faint}">Telefon bazada yoxdur</span>`}</div>
          </div>
          <dl style="margin:0;display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div style="display:flex;flex-direction:column;gap:2px"><dt style="font-size:12px;color:${v.c.muted}">Tarif, /kWh</dt><dd style="margin:0;font-family:'Geist Mono',monospace;font-size:15px;font-weight:600">${op.price}</dd>${op.priceNote ? html`<dd style="margin:0;font-size:11px;color:${v.c.faint}">${op.priceNote}</dd>` : null}</div>
            <div style="display:flex;flex-direction:column;gap:2px"><dt style="font-size:12px;color:${v.c.muted}">Xəritədə</dt><dd style="margin:0;font-family:'Geist Mono',monospace;font-size:15px;font-weight:600">${op.count}</dd></div>
            <div style="display:flex;flex-direction:column;gap:2px"><dt style="font-size:12px;color:${v.c.muted}">Növ (məkan)</dt><dd style="margin:0;font-size:14px">${op.kinds}</dd></div>
            <div style="display:flex;flex-direction:column;gap:2px"><dt style="font-size:12px;color:${v.c.muted}">Canlı status</dt><dd style="margin:0;font-size:14px;color:${op.liveOn ? v.c.accentText : v.c.text}">${op.live}</dd></div>
          </dl>
          <div style="display:flex;gap:8px;margin-top:auto">
            <button onClick=${op.show} style="cursor:pointer;flex:1;min-height:44px;border-radius:10px;border:none;background:#12E28C;color:#0B1518;font-size:14px;font-weight:600">Xəritədə göstər</button>
            ${op.hasApp ? html`<button onClick=${op.toggleApp} aria-expanded=${op.appOpen} style="cursor:pointer;flex:1;min-height:44px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface2};color:${v.c.text};font-size:14px;font-weight:500">Operator tətbiqi</button>` : null}
          </div>
          ${op.appOpen ? html`
            <div style="display:flex;gap:14px;flex-wrap:wrap;font-size:14px;animation:dIn .16s ease-out">
              ${op.playStore ? html`<a href=${op.playStore} target="_blank" rel="noopener noreferrer" style="color:${v.c.accentText};font-weight:500">Google Play ↗</a>` : null}
              ${op.appStore ? html`<a href=${op.appStore} target="_blank" rel="noopener noreferrer" style="color:${v.c.accentText};font-weight:500">App Store ↗</a>` : null}
            </div>
          ` : null}
        </article>
      `)}
    </div>
    ${v.unknownOpCount ? html`<p style="margin:0;font-size:13px;color:${v.c.faint}">Daha ${v.unknownOpCount} məkanın operatoru mənbədə göstərilməyib — onlar xəritədə var, bu siyahıda yoxdur.</p>` : null}
  </main>
` : null);
