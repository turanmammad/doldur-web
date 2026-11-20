// E1/E2 · XƏRİTƏ + STANSİYA — dizayn şablonundan çevrilib (views/README yox: bax app.js başlığı).
import { html } from '../lib/h.js';

const listPanel = (v) => html`
  <div style="display:flex;flex-direction:column;gap:12px">
    <div style="background:${v.c.surface};border:1px solid ${v.c.border};border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:12px;box-shadow:${v.c.shadow1}">
      <label for="d-q" class="sr">Stansiya və ya operator axtar</label>
      <div style="position:relative">
        <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true" style="position:absolute;left:14px;top:14px;display:block"><path d="M13.5 8.5A5 5 0 1 1 3.5 8.5A5 5 0 1 1 13.5 8.5Z M12.2 12.2L17 17" style="fill:none;stroke:${v.c.muted};stroke-width:1.8;stroke-linecap:round"></path></svg>
        <input id="d-q" type="search" value=${v.q} onInput=${v.onQ} placeholder="Stansiya, operator…" autocomplete="off" style="width:100%;min-height:44px;padding:0 14px 0 40px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface2};color:${v.c.text};font-size:15px;outline-offset:0" />
      </div>
      <div role="group" aria-label="Şarj növü" style="display:flex;gap:6px;flex-wrap:wrap">
        ${v.typeChips.map((ch) => html`
          <button onClick=${ch.go} aria-pressed=${ch.on} style="cursor:pointer;min-height:36px;padding:0 14px;border-radius:999px;font-size:13px;font-weight:500;background:${ch.bg};color:${ch.color};border:1px solid ${ch.bd}">${ch.label}</button>
        `)}
        <span aria-hidden="true" style="width:1px;background:${v.c.border};margin:4px 2px"></span>
        ${v.sockChips.map((ch) => html`
          <button onClick=${ch.go} aria-pressed=${ch.on} style="cursor:pointer;min-height:36px;padding:0 12px;border-radius:999px;font-family:'Geist Mono',monospace;font-size:12px;font-weight:500;background:${ch.bg};color:${ch.color};border:1px solid ${ch.bd}">${ch.label}</button>
        `)}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
        <div style="display:flex;flex-direction:column;gap:2px">
          <label style="display:flex;gap:8px;align-items:center;font-size:14px;cursor:pointer;min-height:32px"><input type="checkbox" checked=${v.onlyFree} onChange=${v.toggleFree} style="accent-color:#12E28C;width:18px;height:18px;margin:0" />Yalnız boş</label>
          <label style="display:flex;gap:8px;align-items:center;font-size:14px;cursor:pointer;min-height:32px;opacity:${v.hasCar ? 1 : 0.55}"><input type="checkbox" checked=${v.onlyCompat && v.hasCar} disabled=${!v.hasCar} onChange=${v.toggleCompat} style="accent-color:#12E28C;width:18px;height:18px;margin:0" />Maşınıma uyğun soket</label>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <label for="d-sort" style="font-size:13px;color:${v.c.muted}">Sırala</label>
          <select id="d-sort" value=${v.sort} onChange=${v.onSort} style="min-height:36px;border-radius:8px;border:1px solid ${v.c.border};background:${v.c.surface2};color:${v.c.text};font-size:13px;padding:0 8px">
            <option value="best">Tövsiyə olunan</option>
            <option value="cost">Ən ucuz</option>
            <option value="dist">Ən yaxın</option>
            <option value="power">Ən sürətli</option>
          </select>
        </div>
      </div>
    </div>

    ${!v.hasCar ? html`
      <div style="background:${v.c.elev};border:1px solid ${v.c.accentBorder};border-radius:14px;padding:14px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">
        <span style="flex:1 1 200px;font-size:14px;line-height:1.45"><strong style="font-weight:600">Maşınını seç</strong> — tam xərc, şarj müddəti və soket uyğunluğu maşına görə hesablanır.</span>
        <button onClick=${v.openCarPicker} style="cursor:pointer;min-height:40px;padding:0 16px;border-radius:10px;border:none;background:#12E28C;color:#0B1518;font-size:14px;font-weight:600">Maşın seç</button>
      </div>
    ` : null}

    ${v.opFilterName ? html`
      <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:10px;background:${v.c.surface};border:1px solid ${v.c.border};font-size:13px">
        <span style="flex:1">Operator: <strong style="font-weight:600">${v.opFilterName}</strong></span>
        <button onClick=${v.clearOp} style="cursor:pointer;background:none;border:none;color:${v.c.accentText};font-size:13px;font-weight:500;padding:4px 0">Hamısını göstər</button>
      </div>
    ` : null}

    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:0 4px;font-size:13px;color:${v.c.muted}">
      <span aria-live="polite" style="flex:1;min-width:0">${v.loading ? 'Stansiyalar yüklənir…' : v.countText}</span>
      <button onClick=${v.openCarPicker} aria-label="Maşını dəyiş: ${v.carShort}" style="cursor:pointer;white-space:nowrap;background:none;border:none;padding:6px 0;color:${v.c.accentText};font-size:13px;font-weight:500">${v.carShort} ›</button>
    </div>

    ${v.loadErr ? html`
      <div role="alert" style="background:${v.c.redBg};color:${v.c.redText};border-radius:14px;padding:16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:14px">
        <span style="flex:1 1 200px">Stansiyalar yüklənmədi. İnternet bağlantısını yoxla.</span>
        <button onClick=${v.retryLoad} style="cursor:pointer;min-height:40px;padding:0 14px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface};color:${v.c.text};font-size:14px">Yenidən cəhd et</button>
      </div>
    ` : null}

    ${v.listEmpty ? html`
      <div style="background:${v.c.surface};border:1px dashed ${v.c.borderStrong};border-radius:14px;padding:28px 20px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center">
        <svg width="36" height="36" viewBox="0 0 20 20" aria-hidden="true" style="display:block"><path d="M10 2C6.7 2 4 4.6 4 7.9C4 12.3 10 18 10 18C10 18 16 12.3 16 7.9C16 4.6 13.3 2 10 2Z" style="fill:none;stroke:${v.c.faint};stroke-width:1.5"></path><path d="M7.5 6L12.5 11 M12.5 6L7.5 11" style="fill:none;stroke:${v.c.faint};stroke-width:1.5;stroke-linecap:round"></path></svg>
        <span style="font-family:'Manrope',sans-serif;font-weight:700;font-size:17px">Bu filtrlərlə stansiya yoxdur</span>
        <span style="font-size:14px;color:${v.c.muted};max-width:280px">Soket və ya status filtrini boşalt — ya da axtarış sözünü dəyiş.</span>
        <button onClick=${v.resetFilters} style="cursor:pointer;margin-top:4px;min-height:40px;padding:0 16px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface2};color:${v.c.text};font-size:14px;font-weight:500">Filtrləri sıfırla</button>
      </div>
    ` : null}

    <ul aria-label="Stansiyalar" style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px">
      ${v.list.map((st) => html`
        <li key=${st.id}>
          <button onClick=${st.pick} style="cursor:pointer;text-align:left;width:100%;background:${v.c.surface};border:1px solid ${v.c.border};border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:8px;color:${v.c.text}">
            <span style="display:flex;align-items:flex-start;gap:10px;width:100%">
              <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px">
                <span style="font-size:15px;font-weight:600;line-height:1.3">${st.name}</span>
                <span style="font-size:13px;color:${v.c.muted}">${st.metaT}</span>
              </span>
              <span style="font-family:'Geist Mono',monospace;font-size:11px;font-weight:600;padding:4px 8px;border-radius:6px;white-space:nowrap;background:${st.kindBg};color:${st.kindC}">${st.powerT} kW ${st.kind}</span>
            </span>
            <span style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-family:'Geist Mono',monospace;font-variant-numeric:tabular-nums">
              <span style="font-size:${st.hasTotal ? '18px' : '14px'};font-weight:600;color:${st.hasTotal || st.priceT ? v.c.text : v.c.faint};white-space:nowrap">${st.totalT}</span>
              ${st.durT ? html`<span style="font-size:13px;color:${v.c.muted}">${st.durT}</span>` : null}
              <span style="margin-left:auto;display:flex;align-items:center;gap:6px;font-family:'Geist',sans-serif;font-size:13px;font-weight:500"><span aria-hidden="true" style="width:8px;height:8px;border-radius:2px;background:${st.stColor}"></span>${st.stLabel}</span>
            </span>
            ${st.restricted ? html`<span style="align-self:flex-start;font-size:12px;font-weight:600;padding:3px 8px;border-radius:999px;border:1px solid #E8963C;color:${v.c.amberText}">${st.accessNote}</span>` : null}
            ${st.noCompat ? html`
              <span style="font-size:12px;color:${v.c.amberText};display:flex;gap:6px;align-items:center"><span aria-hidden="true">⚠</span>Sənin maşınının soketinə uyğun deyil</span>
            ` : null}
            ${st.typeUnknown ? html`<span style="font-size:12px;color:${v.c.faint}">Soket növü bazada yoxdur — getməzdən əvvəl yoxla</span>` : null}
          </button>
        </li>
      `)}
    </ul>
    ${v.moreCount ? html`<button onClick=${v.showMore} style="cursor:pointer;min-height:44px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface};color:${v.c.text};font-size:14px;font-weight:500">Daha çox göstər (${v.moreCount} qalıb)</button>` : null}
  </div>
`;

const detailPanel = (v) => {
  const sel = v.sel;
  return html`
  <div style="display:flex;flex-direction:column;gap:12px;animation:dIn .18s ease-out">
    <div style="display:flex;gap:8px;align-items:center">
      <button onClick=${v.closeSel} style="cursor:pointer;min-height:40px;padding:0 14px 0 10px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface};color:${v.c.text};font-size:14px;font-weight:500;display:flex;align-items:center;gap:6px"><svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true" style="display:block"><path d="M12.5 4L6.5 10L12.5 16" style="fill:none;stroke:${v.c.text};stroke-width:2;stroke-linecap:round;stroke-linejoin:round"></path></svg>Siyahı</button>
      <span style="flex:1"></span>
      <button onClick=${v.toggleFavSel} aria-pressed=${sel.fav} aria-label=${sel.favLabel} style="cursor:pointer;width:40px;height:40px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface};display:flex;align-items:center;justify-content:center;padding:0"><svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" style="display:block"><path d="M10 16.8L3.6 10.6C1.9 8.9 1.9 6.2 3.6 4.6C5.2 3 7.8 3 9.4 4.6L10 5.2L10.6 4.6C12.2 3 14.8 3 16.4 4.6C18.1 6.2 18.1 8.9 16.4 10.6Z" style="fill:${sel.heartFill};stroke:${sel.heartStroke};stroke-width:1.6;stroke-linejoin:round"></path></svg></button>
      <button onClick=${v.shareSel} aria-label="Stansiyanı paylaş" style="cursor:pointer;width:40px;height:40px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface};display:flex;align-items:center;justify-content:center;padding:0"><svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" style="display:block"><path d="M10 12.5V2.8 M6.4 6.2L10 2.6L13.6 6.2 M5.5 9H4.5V17.2H15.5V9H14.5" style="fill:none;stroke:${v.c.text};stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round"></path></svg></button>
    </div>

    <section aria-label="Stansiya məlumatı" style="background:${v.c.surface};border:1px solid ${v.c.border};border-radius:14px;padding:18px;display:flex;flex-direction:column;gap:10px;box-shadow:${v.c.shadow1}">
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
        ${sel.op ? html`<span style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;padding:4px 10px 4px ${sel.opIcon ? '4px' : '10px'};border-radius:999px;background:${v.c.surface2};border:1px solid ${v.c.border}">${sel.opIcon ? html`<img src=${sel.opIcon} alt="" width="18" height="18" style="border-radius:5px;display:block" />` : null}${sel.op}</span>` : null}
        <span style="font-family:'Geist Mono',monospace;font-size:11px;font-weight:600;padding:4px 10px;border-radius:999px;background:${sel.kindBg};color:${sel.kindC}">${sel.powerT} kW ${sel.kind}</span>
        ${sel.hoursT ? html`<span style="font-size:12px;padding:4px 10px;border-radius:999px;background:${v.c.surface2};color:${v.c.muted}">${sel.hoursT}</span>` : null}
        ${sel.restricted ? html`<span style="font-size:12px;font-weight:600;padding:3px 10px;border-radius:999px;border:1px solid #E8963C;color:${v.c.amberText}">${sel.accessNote}</span>` : null}
      </div>
      <h2 style="margin:0;font-family:'Manrope',sans-serif;font-weight:700;font-size:24px;letter-spacing:-0.02em;line-height:1.2">${sel.name}</h2>
      <div style="font-size:14px;color:${v.c.muted}">${sel.addrT ? sel.addrT + ' · ' : ''}${sel.distLine}</div>
      <div style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:500;flex-wrap:wrap"><span aria-hidden="true" style="position:relative;width:10px;height:10px;display:inline-block"><span style="position:absolute;inset:0;border-radius:3px;background:${sel.stColor}"></span>${sel.isFree ? html`<span style="position:absolute;inset:0;border-radius:3px;background:${sel.stColor};animation:dPulse 1.4s ease-out infinite"></span>` : null}</span>${sel.stLabel}${sel.updT ? html`<span style="color:${sel.updStale ? v.c.amberText : v.c.faint};font-weight:400">· ${sel.updT}</span>` : null}</div>
      ${sel.loading ? html`<span style="font-size:12px;color:${v.c.faint}">Ətraflı məlumat yüklənir…</span>` : null}
      ${sel.detailErr ? html`<span style="font-size:12px;color:${v.c.amberText}">Ətraflı məlumat yüklənmədi — xəritə məlumatı göstərilir.</span>` : null}
    </section>

    <section aria-label="Tam xərc" style="background:${v.c.elev};border:1px solid ${v.c.accentBorder};border-radius:14px;padding:18px;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
        <span style="font-size:12px;font-family:'Geist Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:${v.c.muted}">Tam xərc</span>
        ${sel.car ? html`<button onClick=${v.openCarPicker} style="cursor:pointer;background:none;border:none;padding:0;font-size:12px;color:${v.c.muted}">${sel.carShort} ›</button>` : null}
      </div>
      ${sel.car ? html`
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:13px;color:${v.c.muted}">
          <label for="d-soc0">Batareya</label>
          <select id="d-soc0" value=${v.socCur} onChange=${v.onSocCur} style="min-height:32px;border-radius:8px;border:1px solid ${v.c.border};background:${v.c.surface2};color:${v.c.text};font-family:'Geist Mono',monospace;font-size:13px;padding:0 6px">${v.socCurOpts.map((o) => html`<option value=${o.v}>${o.label}</option>`)}</select>
          <span aria-hidden="true">→</span>
          <label for="d-soc1" class="sr">Hədəf faiz</label>
          <select id="d-soc1" value=${v.socTgt} onChange=${v.onSocTgt} style="min-height:32px;border-radius:8px;border:1px solid ${v.c.border};background:${v.c.surface2};color:${v.c.text};font-family:'Geist Mono',monospace;font-size:13px;padding:0 6px">${v.socTgtOpts.map((o) => html`<option value=${o.v}>${o.label}</option>`)}</select>
        </div>
      ` : null}
      ${sel.costAvail ? html`
        <div style="display:flex;align-items:baseline;gap:14px;font-family:'Geist Mono',monospace;font-variant-numeric:tabular-nums;flex-wrap:wrap"><span style="font-size:34px;font-weight:600;white-space:nowrap">${sel.totalT}</span><span style="font-size:17px;color:${v.c.muted}">${sel.durT}</span></div>
        <div style="display:flex;flex-direction:column;gap:8px;font-family:'Geist Mono',monospace;font-size:13px;font-variant-numeric:tabular-nums;border-top:1px solid ${v.c.border};padding-top:12px">
          ${sel.rows.map((r) => html`
            <div style="display:flex;justify-content:space-between;gap:12px"><span style="color:${v.c.muted}">${r.k}</span><span style="white-space:nowrap">${r.v}</span></div>
          `)}
          <div style="display:flex;justify-content:space-between;font-weight:600;border-top:1px solid ${v.c.borderStrong};padding-top:8px;font-size:14px"><span>Cəmi</span><span>${sel.totalT}</span></div>
        </div>
        ${sel.notes.map((n) => html`<span style="font-size:12px;color:${v.c.faint};line-height:1.45">${n}</span>`)}
      ` : html`
        <div style="display:flex;flex-direction:column;gap:6px">
          ${sel.priceOnlyT ? html`<span style="font-family:'Geist Mono',monospace;font-size:24px;font-weight:600">${sel.priceOnlyT}</span>` : html`<span style="font-size:15px;color:${v.c.faint}">${sel.unavailableT || 'Qiymət bilinmir'}</span>`}
          ${!sel.car ? html`<button onClick=${v.openCarPicker} style="cursor:pointer;align-self:flex-start;background:none;border:none;padding:4px 0;color:${v.c.accentText};font-size:14px;font-weight:500">Maşınını seç — dəqiq hesablama üçün ›</button>` : null}
          ${sel.batteryUnknown ? html`<span style="font-size:12px;color:${v.c.faint}">Bu modelin batareya tutumu kataloqda yoxdur — tam xərc hesablanmır.</span>` : null}
        </div>
      `}
      ${sel.staleT ? html`<span style="font-size:12px;color:${v.c.amberText}">${sel.staleT}</span>` : null}
      ${sel.noCompat ? html`
        <div style="font-size:13px;line-height:1.5;padding:10px 12px;border-radius:10px;background:${v.c.amberBg};color:${v.c.amberText}">Seçilmiş konnektor sənin maşınına uyğun deyil. Stansiyada ${sel.socksT} var, sənin maşının ${sel.carSocks} qəbul edir.${sel.compatAny ? ' Aşağıda «Sənə uyğun» işarəli konnektoru seç.' : ''}</div>
      ` : null}
      ${sel.isOff ? html`
        <div style="font-size:13px;line-height:1.5;padding:10px 12px;border-radius:10px;background:${v.c.redBg};color:${v.c.redText}">Stansiya hazırda oflayndır. Yaxınlıqdakı alternativə bax.</div>
      ` : null}
    </section>

    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button onClick=${v.toggleNav} aria-expanded=${v.navOpen} style="cursor:pointer;flex:1 1 160px;min-height:48px;border-radius:10px;border:none;background:#12E28C;color:#0B1518;font-size:15px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px"><svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" style="display:block"><path d="M3 9.2L17 3L10.8 17L9.2 10.8Z" style="fill:#0B1518;stroke:#0B1518;stroke-width:1.2;stroke-linejoin:round"></path></svg>Naviqasiya</button>
      ${sel.phoneHref ? html`<a href=${sel.phoneHref} style="flex:1 1 120px;min-height:48px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface};color:${v.c.text};font-size:15px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:6px">Zəng et</a>` : null}
      <button onClick=${v.shareSel} style="cursor:pointer;flex:1 1 120px;min-height:48px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface};color:${v.c.text};font-size:15px;font-weight:500">Paylaş</button>
    </div>
    ${v.navOpen ? html`
      <div style="background:${v.c.surface};border:1px solid ${v.c.border};border-radius:14px;padding:8px;display:flex;flex-direction:column;animation:dIn .16s ease-out">
        <span style="font-size:12px;color:${v.c.muted};padding:6px 10px">Hansı tətbiqdə açılsın? Yeni pəncərədə açılır.</span>
        ${sel.navLinks.map((nl) => html`
          <a href=${nl.href} onClick=${() => v.navTapped(nl.ab)} target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;gap:12px;min-height:48px;padding:0 10px;border-radius:10px;color:${v.c.text};font-size:15px;font-weight:500">
            <span aria-hidden="true" style="width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-family:'Geist Mono',monospace;font-size:11px;font-weight:600;background:${nl.bg};color:${nl.fg}">${nl.ab}</span>
            <span style="flex:1">${nl.label}</span>
            <span aria-hidden="true" style="color:${v.c.faint}">↗</span>
          </a>
        `)}
      </div>
    ` : null}
    ${sel.op && (sel.appStore || sel.playStore) ? html`
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:13px;color:${v.c.muted};padding:0 4px">
        <span>Şarjı ${sel.op} tətbiqində başlat:</span>
        ${sel.playStore ? html`<a href=${sel.playStore} target="_blank" rel="noopener noreferrer" style="color:${v.c.accentText};font-weight:500">Google Play ↗</a>` : null}
        ${sel.appStore ? html`<a href=${sel.appStore} target="_blank" rel="noopener noreferrer" style="color:${v.c.accentText};font-weight:500">App Store ↗</a>` : null}
      </div>
    ` : null}

    <section aria-label="Soketlər" style="background:${v.c.surface};border:1px solid ${v.c.border};border-radius:14px;padding:18px;display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px;flex-wrap:wrap"><h3 style="margin:0;font-family:'Manrope',sans-serif;font-weight:700;font-size:17px">Soketlər</h3>${sel.unitsT ? html`<span style="font-family:'Geist Mono',monospace;font-size:12px;color:${v.c.muted}">${sel.unitsT}</span>` : null}</div>
      ${sel.car && sel.conns.length > 1 ? html`<span style="font-size:12px;color:${v.c.faint};margin-top:-4px">Xərci başqa konnektor üçün görmək istəsən, ona toxun.</span>` : null}
      ${!sel.conns.length ? html`<span style="font-size:14px;color:${v.c.faint}">Soket məlumatı yoxdur.</span>` : null}
      ${sel.conns.map((cn) => html`
        <button onClick=${cn.pick} aria-pressed=${cn.on} style="cursor:pointer;text-align:left;display:flex;align-items:center;gap:12px;flex-wrap:wrap;min-height:52px;padding:8px 12px;border-radius:10px;background:${v.c.surface2};border:1.5px solid ${cn.on && sel.car ? '#12E28C' : 'transparent'};color:${v.c.text}">
          <span style="font-family:'Geist Mono',monospace;font-size:13px;font-weight:600;min-width:64px">${cn.t}</span>
          <span style="font-family:'Geist Mono',monospace;font-size:13px;color:${v.c.muted}">${cn.kw} kW ${cn.cur}</span>
          ${cn.count ? html`<span style="font-family:'Geist Mono',monospace;font-size:12px;color:${v.c.faint}">${cn.count}</span>` : null}
          ${cn.match ? html`<span style="font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px;background:${v.c.accentSoft};color:${v.c.accentText}">Sənə uyğun</span>` : null}
          ${cn.noFit ? html`<span style="font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px;background:${v.c.amberBg};color:${v.c.amberText}">Uyğun deyil</span>` : null}
          ${cn.unknownType ? html`<span style="font-size:11px;padding:3px 8px;border-radius:6px;color:${v.c.faint};border:1px solid ${v.c.border}">Növ bilinmir</span>` : null}
          <span style="margin-left:auto;display:flex;align-items:center;gap:6px;font-size:13px;font-weight:500"><span aria-hidden="true" style="width:8px;height:8px;border-radius:2px;background:${cn.color}"></span>${cn.label}</span>
        </button>
      `)}
      ${sel.powerEstNote ? html`<span style="font-size:12px;color:${v.c.faint}">≈ — mənbə gücü vermir, fişin standart həddi göstərilir.</span>` : null}
    </section>

    <section aria-label="Ətraflı" style="background:${v.c.surface};border:1px solid ${v.c.border};border-radius:14px;padding:18px;display:flex;flex-direction:column;gap:12px">
      <h3 style="margin:0;font-family:'Manrope',sans-serif;font-weight:700;font-size:17px">Ətraflı</h3>
      <dl style="margin:0;display:grid;grid-template-columns:auto 1fr;gap:8px 16px;font-size:14px">
        <dt style="color:${v.c.muted}">Tarif</dt><dd style="margin:0;font-family:'Geist Mono',monospace">${sel.priceRowT}</dd>
        ${sel.hoursT ? html`<dt style="color:${v.c.muted}">İş saatı</dt><dd style="margin:0">${sel.hoursT}</dd>` : null}
        ${sel.accessNote && !sel.restricted ? html`<dt style="color:${v.c.muted}">Qeyd</dt><dd style="margin:0">${sel.accessNote}</dd>` : null}
        ${sel.methodsT ? html`<dt style="color:${v.c.muted}">Ödəniş</dt><dd style="margin:0">${sel.methodsT}</dd>` : null}
        ${sel.phone ? html`<dt style="color:${v.c.muted}">Operator</dt><dd style="margin:0"><a href=${sel.phoneHref} style="color:${v.c.text};font-family:'Geist Mono',monospace;font-size:13px">${sel.phone}</a></dd>` : null}
        <dt style="color:${v.c.muted}">Koordinat</dt><dd style="margin:0;font-family:'Geist Mono',monospace;font-size:13px">${sel.coordT}</dd>
      </dl>
      <a href=${sel.gmaps} target="_blank" rel="noopener noreferrer" style="font-size:14px;font-weight:500;color:${v.c.accentText}">Google Xəritədə aç ↗</a>
    </section>

    <section aria-label="Rəylər" style="background:${v.c.surface};border:1px solid ${v.c.border};border-radius:14px;padding:18px;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;align-items:center;gap:10px">
        <h3 style="margin:0;font-family:'Manrope',sans-serif;font-weight:700;font-size:17px">Rəylər</h3>
        <span style="font-family:'Geist Mono',monospace;font-size:13px;color:${v.c.muted}">${sel.reviewsLoading ? '…' : sel.reviewCount + ' rəy'}</span>
        <button onClick=${v.toggleReview} aria-expanded=${v.reviewOpen} style="cursor:pointer;margin-left:auto;min-height:36px;padding:0 12px;border-radius:8px;border:1px solid ${v.c.border};background:${v.c.surface2};color:${v.c.text};font-size:13px;font-weight:500">Rəy yaz</button>
      </div>
      ${v.reviewOpen ? html`
        <form onSubmit=${v.submitReview} style="display:flex;flex-direction:column;gap:10px;padding:12px;border-radius:12px;background:${v.c.surface2};border:1px solid ${v.c.border}">
          <span style="font-size:14px;font-weight:500">Stansiya işlədi?</span>
          <div role="group" aria-label="Stansiya işlədi?" style="display:flex;gap:6px;flex-wrap:wrap">
            ${v.verdicts.map((tg) => html`
              <button type="button" onClick=${tg.go} aria-pressed=${tg.on} style="cursor:pointer;min-height:38px;padding:0 16px;border-radius:999px;font-size:14px;background:${tg.bg};color:${tg.color};border:1px solid ${tg.bd}">${tg.label}</button>
            `)}
          </div>
          ${v.revFailed ? html`
            <div role="group" aria-label="Problem" style="display:flex;gap:6px;flex-wrap:wrap">
              ${v.revTags.map((tg) => html`
                <button type="button" onClick=${tg.go} aria-pressed=${tg.on} style="cursor:pointer;min-height:34px;padding:0 12px;border-radius:999px;font-size:13px;background:${tg.bg};color:${tg.color};border:1px solid ${tg.bd}">${tg.label}</button>
              `)}
            </div>
          ` : null}
          <label for="d-rev" class="sr">Şərh (istəyə bağlı)</label>
          <textarea id="d-rev" value=${v.revText} onInput=${v.onRevText} rows="3" maxlength="500" placeholder="Şərh (istəyə bağlı): növbə var idi? Kabel işləyirdi?" style="width:100%;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface};color:${v.c.text};font-size:14px;padding:10px 12px;resize:vertical"></textarea>
          <button type="submit" disabled=${v.revBusy} style="cursor:pointer;align-self:flex-start;min-height:40px;padding:0 18px;border-radius:10px;border:none;background:#12E28C;color:#0B1518;font-size:14px;font-weight:600">${v.revBusy ? 'Göndərilir…' : 'Göndər'}</button>
        </form>
      ` : null}
      ${!sel.reviewsLoading && !sel.reviewCount ? html`<span style="font-size:14px;color:${v.c.faint}">Hələ rəy yoxdur. Bu stansiyada şarj etmisənsə, ilk rəyi sən yaz.</span>` : null}
      ${sel.reviews.map((rv) => html`
        <div style="display:flex;gap:10px;padding-top:10px;border-top:1px solid ${v.c.border}">
          <span aria-hidden="true" style="width:32px;height:32px;border-radius:999px;flex-shrink:0;background:${v.c.surface2};border:1px solid ${v.c.border};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600">${rv.i}</span>
          <div style="display:flex;flex-direction:column;gap:3px;min-width:0">
            <span style="font-size:13px;font-weight:600">${rv.n} <span style="font-weight:400;color:${v.c.faint}">· ${rv.d} · </span><span style="font-weight:600;color:${rv.vColor}">${rv.verdict}</span></span>
            ${rv.reasons ? html`<span style="font-size:12px;color:${v.c.amberText}">${rv.reasons}</span>` : null}
            ${rv.t ? html`<span style="font-size:14px;color:${v.c.muted};line-height:1.5">${rv.t}</span>` : null}
          </div>
        </div>
      `)}
    </section>
  </div>
`;
};

export const MapView = (v) => (v.pMap ? html`
  <main style="max-width:1320px;margin:0 auto;padding:16px 20px 24px;display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start">
    <h1 class="sr">Doldur — EV şarj xəritəsi</h1>
    <aside id="d-aside" class="d-aside" aria-label=${v.asideLabel} style="scroll-margin-top:124px;flex:1 1 360px;min-width:0;display:flex;flex-direction:column;gap:12px">
      ${v.noSel ? listPanel(v) : null}
      ${v.hasSel && !v.selPending ? detailPanel(v) : null}
      ${v.selPending ? html`<div style="background:${v.c.surface};border:1px solid ${v.c.border};border-radius:14px;padding:24px;font-size:14px;color:${v.c.muted}">Stansiya yüklənir…</div>` : null}
    </aside>

    <section class="d-map" aria-label="Xəritə" style="flex:999 1 560px;min-width:0;position:relative;height:calc(100vh - 104px);min-height:560px;max-height:860px;border-radius:16px;overflow:hidden;border:1px solid ${v.c.border};background:${v.c.land}">
      <div ref=${v.mapRef} style="position:absolute;inset:0;z-index:0"></div>
      ${v.mapError ? html`<div role="alert" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:${v.c.surface};border:1px solid ${v.c.border};border-radius:12px;padding:14px 18px;font-size:14px;max-width:80%;text-align:center">Xəritə yüklənmədi. Siyahı işləyir; səhifəni yeniləməyi sına.</div>` : null}

      <div class="dn-scroll d-hide-m" style="position:absolute;z-index:2;left:12px;right:12px;top:12px;display:flex;gap:6px;flex-wrap:nowrap;overflow:hidden;pointer-events:none">
        ${v.legend.map((lg) => html`
          <span style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:500;padding:5px 9px;white-space:nowrap;border-radius:999px;background:${v.c.surface};border:1px solid ${v.c.border};box-shadow:${v.c.shadow1}"><span aria-hidden="true" style="width:8px;height:8px;border-radius:2px;background:${lg.color}"></span>${lg.label}</span>
        `)}
      </div>

      <div role="group" aria-label="Xəritə idarəsi" style="position:absolute;z-index:2;right:12px;bottom:12px;display:flex;flex-direction:column;gap:6px">
        <button onClick=${v.zoomIn} aria-label="Yaxınlaşdır" style="cursor:pointer;width:44px;height:44px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface};color:${v.c.text};font-size:22px;line-height:1;box-shadow:${v.c.shadow1}">+</button>
        <button onClick=${v.zoomOut} aria-label="Uzaqlaşdır" style="cursor:pointer;width:44px;height:44px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface};color:${v.c.text};font-size:22px;line-height:1;box-shadow:${v.c.shadow1}">−</button>
        <button onClick=${v.locate} aria-label="Mənim yerim" aria-busy=${v.geoBusy} style="cursor:pointer;width:44px;height:44px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface};display:flex;align-items:center;justify-content:center;padding:0;box-shadow:${v.c.shadow1};opacity:${v.geoBusy ? 0.6 : 1}"><svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" style="display:block"><circle cx="10" cy="10" r="5" style="fill:none;stroke:#4A8CFF;stroke-width:1.8"></circle><circle cx="10" cy="10" r="1.8" style="fill:#4A8CFF"></circle><path d="M10 1.5V4 M10 16V18.5 M1.5 10H4 M16 10H18.5" style="fill:none;stroke:#4A8CFF;stroke-width:1.8;stroke-linecap:round"></path></svg></button>
        <a href=${v.bigMap} target="_blank" rel="noopener noreferrer" aria-label="Böyük xəritədə aç (yeni pəncərə)" style="width:44px;height:44px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface};display:flex;align-items:center;justify-content:center;box-shadow:${v.c.shadow1}"><svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true" style="display:block"><path d="M12 3H17V8 M17 3L10.5 9.5 M8 4H4V16H16V12" style="fill:none;stroke:${v.c.text};stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round"></path></svg></a>
      </div>

      <div style="position:absolute;z-index:2;left:12px;bottom:10px;right:68px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:11px;color:${v.c.muted}">
        ${v.scaleT ? html`<span style="display:flex;flex-direction:column;gap:2px;font-family:'Geist Mono',monospace;pointer-events:none"><span style="width:${v.scaleW};height:4px;border:1.5px solid ${v.c.muted};border-top:none"></span>${v.scaleT}</span>` : null}
        <span style="padding:3px 8px;border-radius:6px;background:${v.c.surface}">${v.mapFallback
          ? html`<a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer" style="color:${v.c.muted}">© OpenFreeMap</a> <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" style="color:${v.c.muted}">© OpenStreetMap</a>`
          : html`<a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener noreferrer" style="color:${v.c.muted}">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" style="color:${v.c.muted}">© OpenStreetMap</a>`}</span>
      </div>
    </section>
  </main>
` : null);
