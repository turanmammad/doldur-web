// FOOTER, PAYLAŞ PƏNCƏRƏSİ, MAŞIN SEÇİCİ, TOAST — dizayn şablonundan.
import { html } from '../lib/h.js';

const logoMark = (w, h, r) => html`<span aria-hidden="true" style="width:${w}px;height:${h}px;border-radius:${r}px;border:1.5px solid #12E28C;position:relative;overflow:hidden;display:inline-block"><span style="position:absolute;left:0;right:0;bottom:0;height:62%;background:#12E28C"></span></span>`;
const linkBtn = (v, onClick, label) => html`<button onClick=${onClick} style="cursor:pointer;background:none;border:none;padding:4px 0;text-align:left;color:${v.c.text};font-size:14px">${label}</button>`;

export const FooterView = (v) => (v.showFooter ? html`
  <footer style="border-top:1px solid ${v.c.border};background:${v.c.footer}">
    <div style="max-width:1200px;margin:0 auto;padding:40px 20px 28px;display:flex;flex-direction:column;gap:28px">
      <div style="display:flex;flex-wrap:wrap;gap:32px">
        <div style="flex:2 1 280px;display:flex;flex-direction:column;gap:12px">
          <span style="display:flex;align-items:center;gap:8px">${logoMark(11, 20, 3)}<span style="font-family:'Manrope',sans-serif;font-weight:700;font-size:19px">Doldur</span></span>
          <p style="margin:0;font-size:14px;color:${v.c.muted};max-width:320px;line-height:1.55">Azərbaycanda EV şarj xəritəsi. Ən yaxın deyil — ən sərfəli.</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <a href=${v.playUrl} target="_blank" rel="noopener noreferrer" style="min-height:44px;padding:0 16px;border-radius:10px;border:none;background:#12E28C;color:#0B1518;font-size:14px;font-weight:600;display:flex;align-items:center">Google Play</a>
            <a href=${v.appStoreUrl} target="_blank" rel="noopener noreferrer" style="min-height:44px;padding:0 16px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface};color:${v.c.text};font-size:14px;font-weight:500;display:flex;align-items:center">App Store</a>
          </div>
        </div>
        <nav aria-label="Məhsul" style="flex:1 1 140px;display:flex;flex-direction:column;gap:8px;font-size:14px">
          <span style="font-family:'Geist Mono',monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:${v.c.faint}">Məhsul</span>
          ${linkBtn(v, v.goMap, 'Xəritə')}${linkBtn(v, v.goRoute, 'Marşrut planı')}${linkBtn(v, v.goOps, 'Operatorlar')}
        </nav>
        <nav aria-label="Resurslar" style="flex:1 1 140px;display:flex;flex-direction:column;gap:8px;font-size:14px">
          <span style="font-family:'Geist Mono',monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:${v.c.faint}">Resurslar</span>
          ${linkBtn(v, v.goBlog, 'Bloq')}${linkBtn(v, v.openSock, 'Soket bələdçisi')}${linkBtn(v, v.goHist, 'Tarixçə')}
          <a href="/mexfilik/" style="color:${v.c.text};padding:4px 0">Məxfilik siyasəti</a>
          <a href="/sertler/" style="color:${v.c.text};padding:4px 0">İstifadə şərtləri</a>
        </nav>
        <div style="flex:1 1 180px;display:flex;flex-direction:column;gap:8px;font-size:14px">
          <span style="font-family:'Geist Mono',monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:${v.c.faint}">Əlaqə</span>
          <a href="mailto:info@pro-tech.az" style="color:${v.c.text};padding:4px 0">info@pro-tech.az</a>
          <a href="tel:+994993695333" style="color:${v.c.text};padding:4px 0;font-family:'Geist Mono',monospace">+994 99 369 53 33</a>
          <button onClick=${v.shareApp} style="cursor:pointer;background:none;border:none;padding:4px 0;text-align:left;color:${v.c.accentText};font-size:14px;font-weight:500">Doldur-u dostuna göndər</button>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding-top:18px;border-top:1px solid ${v.c.border};font-size:13px;color:${v.c.faint}">
        <span>© 2026 · doldur.pro-tech.az</span>
        <span style="display:inline-flex;align-items:center;gap:10px"><span aria-hidden="true" style="width:24px;height:24px;border-radius:4px;background:#F6F5F2;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="14" height="14" viewBox="0 0 20 20" style="display:block"><path d="M7.5 3L5.5 17 M14.5 3L12.5 17 M3.5 7.5H17 M3 12.5H16.5" style="fill:none;stroke:#0D1117;stroke-width:2.2;stroke-linecap:round"></path></svg></span><span style="display:flex;flex-direction:column;gap:1px;line-height:1.3"><span style="font-family:'Manrope',sans-serif;font-weight:700;font-size:13px;letter-spacing:.02em;color:${v.c.text}">PROTECH</span><span style="font-size:11px;color:${v.c.muted}">Doldur — Protech LLC məhsuludur</span></span></span>
        <span style="margin-left:auto">Doldur şarj satmır — məlumat verir.</span>
      </div>
    </div>
  </footer>
` : null);

export const ShareView = (v) => (v.shareOn ? html`
  <div onClick=${v.closeShare} style="position:fixed;inset:0;z-index:80;background:rgba(11,21,24,.55);display:flex;align-items:center;justify-content:center;padding:20px">
    <div role="dialog" aria-modal="true" aria-labelledby="d-share-t" onClick=${v.stopProp} style="width:100%;max-width:440px;background:${v.c.surface};color:${v.c.text};border:1px solid ${v.c.border};border-radius:20px;padding:22px;display:flex;flex-direction:column;gap:16px;box-shadow:0 24px 64px rgba(0,0,0,.35);animation:dIn .2s ease-out">
      <div style="display:flex;align-items:center;gap:10px">
        <h2 id="d-share-t" style="margin:0;font-family:'Manrope',sans-serif;font-weight:700;font-size:20px;flex:1">${v.share.head}</h2>
        <button id="d-share-close" onClick=${v.closeShare} aria-label="Bağla" style="cursor:pointer;width:40px;height:40px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface2};display:flex;align-items:center;justify-content:center;padding:0"><svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true" style="display:block"><path d="M5 5L15 15 M15 5L5 15" style="fill:none;stroke:${v.c.text};stroke-width:2;stroke-linecap:round"></path></svg></button>
      </div>
      <div style="display:flex;gap:12px;align-items:center;padding:12px;border-radius:14px;background:${v.c.surface2};border:1px solid ${v.c.border}">
        <span aria-hidden="true" style="width:48px;height:48px;border-radius:12px;flex-shrink:0;background:${v.share.cover};display:flex;align-items:center;justify-content:center;font-family:'Geist Mono',monospace;font-weight:600;font-size:14px;color:#FFFFFF">${v.share.glyph}</span>
        <span style="display:flex;flex-direction:column;gap:2px;min-width:0"><span style="font-size:15px;font-weight:600;line-height:1.3">${v.share.title}</span><span style="font-size:13px;color:${v.c.muted}">${v.share.sub}</span></span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">
        ${v.shareTargets.map((tg) => html`
          <a href=${tg.href} target="_blank" rel="noopener noreferrer" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 4px;border-radius:12px;color:${v.c.text};font-size:12px;font-weight:500;background:${v.c.surface2}">
            <span aria-hidden="true" style="width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-family:'Geist Mono',monospace;font-size:13px;font-weight:600;background:${tg.bg};color:${tg.fg}">${tg.ab}</span>${tg.label}
          </a>
        `)}
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <label for="d-link" style="font-size:13px;font-weight:500;color:${v.c.muted}">Link</label>
        <div style="display:flex;gap:8px">
          <input id="d-link" readonly value=${v.share.url} onFocus=${v.selectAll} style="flex:1;min-width:0;min-height:46px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface2};color:${v.c.text};font-family:'Geist Mono',monospace;font-size:13px;padding:0 12px" />
          <button onClick=${v.copyShare} style="cursor:pointer;min-height:46px;padding:0 16px;border-radius:10px;border:none;background:#12E28C;color:#0B1518;font-size:14px;font-weight:600;white-space:nowrap">${v.copyLabel}</button>
        </div>
      </div>
      <button onClick=${v.nativeShare} style="cursor:pointer;min-height:46px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface};color:${v.c.text};font-size:14px;font-weight:500">Digər tətbiqlər…</button>
    </div>
  </div>
` : null);

export const CarPickerView = (v) => (v.carPicker ? html`
  <div onClick=${v.closeCarPicker} style="position:fixed;inset:0;z-index:80;background:rgba(11,21,24,.55);display:flex;align-items:center;justify-content:center;padding:20px">
    <div role="dialog" aria-modal="true" aria-labelledby="d-car-t" onClick=${v.stopProp} style="width:100%;max-width:520px;max-height:min(720px,calc(100vh - 40px));background:${v.c.surface};color:${v.c.text};border:1px solid ${v.c.border};border-radius:20px;padding:22px;display:flex;flex-direction:column;gap:14px;box-shadow:0 24px 64px rgba(0,0,0,.35);animation:dIn .2s ease-out">
      <div style="display:flex;align-items:center;gap:10px">
        <h2 id="d-car-t" style="margin:0;font-family:'Manrope',sans-serif;font-weight:700;font-size:20px;flex:1">Maşınını seç</h2>
        <button onClick=${v.closeCarPicker} aria-label="Bağla" style="cursor:pointer;width:40px;height:40px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface2};display:flex;align-items:center;justify-content:center;padding:0"><svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true" style="display:block"><path d="M5 5L15 15 M15 5L5 15" style="fill:none;stroke:${v.c.text};stroke-width:2;stroke-linecap:round"></path></svg></button>
      </div>
      <label for="d-carq" class="sr">Marka və ya model axtar</label>
      <input id="d-carq" type="search" value=${v.carQ} onInput=${v.onCarQ} placeholder="Marka və ya model: BYD, Zeekr 001…" autocomplete="off" style="width:100%;min-height:46px;padding:0 14px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface2};color:${v.c.text};font-size:15px" />
      <div style="overflow:auto;display:flex;flex-direction:column;gap:6px;min-height:120px">
        ${v.catalogLoading ? html`<span style="color:${v.c.muted};font-size:14px">Kataloq yüklənir…</span>` : null}
        ${v.carOptsEmpty ? html`<span style="color:${v.c.muted};font-size:14px">Bu adla model tapılmadı.</span>` : null}
        ${v.carOpts.map((cc) => html`
          <button onClick=${cc.go} aria-pressed=${cc.on} style="cursor:pointer;text-align:left;display:flex;align-items:center;gap:12px;min-height:56px;padding:8px 12px;border-radius:12px;background:${cc.on ? v.c.accentSoft : v.c.surface};border:1.5px solid ${cc.on ? '#12E28C' : v.c.border};color:${v.c.text}">
            <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px"><span style="font-size:15px;font-weight:600">${cc.n}</span><span style="font-family:'Geist Mono',monospace;font-size:12px;color:${v.c.muted}">${cc.spec}</span></span>
            <span style="font-family:'Geist Mono',monospace;font-size:11px;padding:4px 8px;border-radius:6px;background:${v.c.surface2};white-space:nowrap">${cc.socks}</span>
          </button>
        `)}
      </div>
      <span style="font-size:12px;color:${v.c.faint}">Rəqəmlər Doldur kataloqundandır; bilinməyən rəqəm uydurulmur. Seçim bu brauzerdə saxlanır.</span>
    </div>
  </div>
` : null);

export const ToastView = (v) => (v.toastOn ? html`
  <div role="status" aria-live="polite" style="position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:90;background:#0B1518;color:#E9EFED;border:1px solid rgba(233,239,237,.14);border-radius:12px;padding:12px 18px;font-size:14px;max-width:calc(100% - 40px);box-shadow:0 8px 24px rgba(0,0,0,.3);animation:dIn .18s ease-out">${v.toastMsg}</div>
` : null);
