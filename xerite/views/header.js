import { html } from '../lib/h.js';

export const HeaderView = (v) => html`

  <header style="position:sticky;top:0;z-index:40;background:${v.c.header};backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid ${v.c.border}">
    <div style="max-width:1320px;margin:0 auto;padding:10px 20px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
      <a href="/" aria-label="Doldur — ana səhifə" style="padding:4px 2px;display:flex;align-items:center;gap:9px;flex-shrink:0;text-decoration:none">
        <span aria-hidden="true" style="width:13px;height:24px;border-radius:4px;border:1.5px solid #12E28C;position:relative;overflow:hidden;display:inline-block"><span style="position:absolute;left:0;right:0;bottom:0;height:62%;background:#12E28C"></span></span>
        <span aria-hidden="true" style="position:relative;font-family:'Manrope',sans-serif;font-weight:700;font-size:22px;letter-spacing:-0.02em;line-height:1"><span style="color:${v.c.ghost}">Doldur</span><span style="position:absolute;inset:0;color:${v.c.text};clip-path:inset(50% 0 0 0)">Doldur</span></span>
      </a>
      <nav aria-label="Əsas menyu" class="dn-scroll d-nav" style="display:flex;gap:2px;overflow-x:auto;flex:1 1 420px;min-width:0">
        <a href="/" style="white-space:nowrap;min-height:40px;padding:0 14px;border-radius:10px;font-size:14px;font-weight:500;color:${v.c.muted};display:flex;align-items:center;gap:6px;text-decoration:none"><span aria-hidden="true">←</span>Ana səhifə</a>
        ${(v.navs || []).map((n) => html`
          <button onClick=${n.go} aria-current=${n.cur} style="cursor:pointer;white-space:nowrap;min-height:40px;padding:0 14px;border-radius:10px;border:none;font-size:14px;font-weight:500;background:${n.bg};color:${n.color}">${n.label}</button>
        `)}
      </nav>
      <div style="display:flex;gap:8px;align-items:center;margin-left:auto;flex-shrink:0">
        <button onClick=${v.toggleDark} aria-label=${v.darkLabel} style="cursor:pointer;width:40px;height:40px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface};display:flex;align-items:center;justify-content:center;padding:0">
          ${(v.isDark) ? html`
            <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" style="display:block"><circle cx="10" cy="10" r="3.6" style="fill:none;stroke:${v.c.text};stroke-width:1.7"></circle><path d="M10 1.8V4 M10 16V18.2 M1.8 10H4 M16 10H18.2 M4.2 4.2L5.8 5.8 M14.2 14.2L15.8 15.8 M4.2 15.8L5.8 14.2 M14.2 5.8L15.8 4.2" style="fill:none;stroke:${v.c.text};stroke-width:1.7;stroke-linecap:round"></path></svg>
          ` : null}
          ${(v.isLight) ? html`
            <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" style="display:block"><path d="M16.5 12.2A7 7 0 0 1 7.8 3.5A7 7 0 1 0 16.5 12.2Z" style="fill:none;stroke:${v.c.text};stroke-width:1.7;stroke-linejoin:round"></path></svg>
          ` : null}
        </button>
        ${(v.logged) ? html`
          <button onClick=${v.goProfile} aria-label="Profil" style="cursor:pointer;display:flex;align-items:center;gap:8px;min-height:40px;padding:0 12px 0 4px;border-radius:999px;border:1px solid ${v.c.border};background:${v.c.surface};color:${v.c.text};font-size:14px;font-weight:500">
            <span aria-hidden="true" style="width:32px;height:32px;border-radius:999px;background:#12E28C;color:#0B1518;display:flex;align-items:center;justify-content:center;font-family:'Manrope',sans-serif;font-weight:700;font-size:13px">${v.userInitial}</span><span class="d-hide-m" style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${v.userName}</span>
          </button>
        ` : null}
        ${(v.notLogged) ? html`
          <button onClick=${v.goLogin} style="cursor:pointer;min-height:40px;padding:0 16px;border-radius:10px;border:none;background:#12E28C;color:#0B1518;font-size:14px;font-weight:600">Daxil ol</button>
        ` : null}
      </div>
    </div>
  </header>

  `;
