// E11 · PROFİL, E16 · GİRİŞ (e-poçt kodu + Google + Apple) — dizayn şablonundan.
import { html } from '../lib/h.js';

export const ProfileView = (v) => (v.pProfile ? html`
  <main style="max-width:960px;margin:0 auto;padding:32px 20px 48px;display:flex;flex-direction:column;gap:16px">
    <h1 class="d-h1" style="margin:0;font-family:'Manrope',sans-serif;font-weight:700;font-size:36px;letter-spacing:-0.02em">Profil və ayarlar</h1>
    <section aria-label="Hesab" style="background:${v.c.surface};border:1px solid ${v.c.border};border-radius:16px;padding:20px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
      <span aria-hidden="true" style="width:56px;height:56px;border-radius:999px;background:#12E28C;color:#0B1518;display:flex;align-items:center;justify-content:center;font-family:'Manrope',sans-serif;font-weight:800;font-size:22px">${v.avatarL}</span>
      <div style="flex:1 1 200px;display:flex;flex-direction:column;gap:2px;min-width:0"><span style="font-size:18px;font-weight:600">${v.profName}</span><span style="font-size:14px;color:${v.c.muted};overflow-wrap:anywhere">${v.profSub}</span></div>
      ${v.logged ? html`<button onClick=${v.logout} style="cursor:pointer;min-height:40px;padding:0 16px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface2};color:${v.c.text};font-size:14px">Çıxış</button>` : null}
      ${v.notLogged ? html`<button onClick=${v.goLogin} style="cursor:pointer;min-height:44px;padding:0 18px;border-radius:10px;border:none;background:#12E28C;color:#0B1518;font-size:14px;font-weight:600">Daxil ol — favoritlər sinxron olsun</button>` : null}
    </section>
    <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start">
      <section aria-label="Maşınım" style="flex:1 1 380px;min-width:0;background:${v.c.surface};border:1px solid ${v.c.border};border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:12px">
        <h2 style="margin:0;font-family:'Manrope',sans-serif;font-weight:700;font-size:18px">Maşınım</h2>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${v.carCards.concat(v.uvCards).map((cc) => html`
            <button onClick=${cc.go} aria-pressed=${cc.on} style="cursor:pointer;text-align:left;display:flex;align-items:center;gap:12px;min-height:60px;padding:10px 14px;border-radius:12px;background:${cc.bg};border:1.5px solid ${cc.bd};color:${v.c.text}">
              <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px"><span style="font-size:15px;font-weight:600">${cc.n}</span><span style="font-family:'Geist Mono',monospace;font-size:12px;color:${v.c.muted}">${cc.spec}</span></span>
              <span style="font-family:'Geist Mono',monospace;font-size:11px;padding:4px 8px;border-radius:6px;background:${v.c.surface2};white-space:nowrap">${cc.socks}</span>
            </button>
          `)}
          ${v.noCarCard ? html`<span style="font-size:14px;color:${v.c.muted}">Maşın seçilməyib — xərc və soket uyğunluğu üçün lazımdır.</span>` : null}
          <button onClick=${v.openCarPicker} style="cursor:pointer;align-self:flex-start;min-height:40px;padding:0 16px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface2};color:${v.c.text};font-size:14px;font-weight:500">${v.noCarCard ? 'Maşın seç' : 'Maşını dəyiş'}</button>
        </div>
      </section>
      <section aria-label="Görünüş" style="flex:1 1 320px;min-width:0;background:${v.c.surface};border:1px solid ${v.c.border};border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:16px">
        <h2 style="margin:0;font-family:'Manrope',sans-serif;font-weight:700;font-size:18px">Görünüş</h2>
        <fieldset style="border:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px"><legend style="font-size:13px;font-weight:500;color:${v.c.muted};padding:0;margin-bottom:8px">Tema</legend>
          <div style="display:flex;gap:6px;flex-wrap:wrap">${v.themeChips.map((tc) => html`<button onClick=${tc.go} aria-pressed=${tc.on} style="cursor:pointer;flex:1 1 80px;min-height:40px;border-radius:10px;font-size:14px;font-weight:500;background:${tc.bg};color:${tc.color};border:1px solid ${tc.bd}">${tc.label}</button>`)}</div>
        </fieldset>
        <span style="font-size:13px;color:${v.c.faint}">Bildiriş ayarları mobil tətbiqdədir.</span>
      </section>
    </div>
    ${v.logged ? html`
      <section aria-label="Hesabı sil" style="background:${v.c.surface};border:1px solid ${v.c.border};border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <div style="flex:1 1 260px;display:flex;flex-direction:column;gap:2px"><h2 style="margin:0;font-family:'Manrope',sans-serif;font-weight:700;font-size:18px">Hesabı sil</h2><span style="font-size:14px;color:${v.c.muted}">Hesab, favoritlər, maşınlar və tarixçə birdəfəlik silinir. Geri qaytarmaq olmur.</span></div>
          <button onClick=${v.openDel} aria-expanded=${v.delOpen} style="cursor:pointer;min-height:40px;padding:0 16px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface2};color:${v.c.redText};font-size:14px;font-weight:500">${v.delOpen ? 'İmtina' : 'Hesabı sil'}</button>
        </div>
        ${v.delOpen ? html`
          <div style="display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:12px;background:${v.c.redBg}">
            <label for="d-del" style="font-size:14px;color:${v.c.redText}">Təsdiq üçün böyük hərflə <strong>SİL</strong> yaz:</label>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <input id="d-del" type="text" value=${v.delText} onInput=${v.onDelText} autocomplete="off" style="flex:1 1 160px;min-height:44px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface};color:${v.c.text};font-size:15px;padding:0 12px" />
              <button onClick=${v.doDelete} disabled=${!v.delReady} style="cursor:${v.delReady ? 'pointer' : 'default'};min-height:44px;padding:0 16px;border-radius:10px;border:none;background:${v.delReady ? '#E2504B' : v.c.surface2};color:${v.delReady ? '#FFFFFF' : v.c.faint};font-size:14px;font-weight:600">${v.delBusy ? 'Silinir…' : 'Birdəfəlik sil'}</button>
            </div>
          </div>
        ` : null}
      </section>
    ` : null}
  </main>
` : null);

export const LoginView = (v) => (v.pLogin ? html`
  <main style="max-width:460px;margin:0 auto;padding:48px 20px 64px;display:flex;flex-direction:column;gap:20px">
    <div style="display:flex;flex-direction:column;gap:8px;text-align:center;align-items:center">
      <span aria-hidden="true" style="width:18px;height:32px;border-radius:5px;border:1.5px solid #12E28C;position:relative;overflow:hidden;display:inline-block"><span style="position:absolute;left:0;right:0;bottom:0;height:62%;background:#12E28C"></span></span>
      <h1 style="margin:0;font-family:'Manrope',sans-serif;font-weight:700;font-size:30px;letter-spacing:-0.02em">${v.loginTitle}</h1>
      <p style="margin:0;color:${v.c.muted};font-size:15px;max-width:340px">${v.loginSub}</p>
    </div>
    <form onSubmit=${v.loginSubmit} style="background:${v.c.surface};border:1px solid ${v.c.border};border-radius:18px;padding:24px;display:flex;flex-direction:column;gap:14px;box-shadow:${v.c.shadow1}">
      ${v.loginStep0 ? html`
        <div style="display:flex;flex-direction:column;gap:6px">
          <label for="d-email" style="font-size:13px;font-weight:500;color:${v.c.muted}">E-poçt</label>
          <div style="display:flex;align-items:center;min-height:52px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface2};overflow:hidden"><span aria-hidden="true" style="padding:0 12px;font-family:'Geist Mono',monospace;font-size:15px;color:${v.c.muted};border-right:1px solid ${v.c.border};align-self:stretch;display:flex;align-items:center">@</span><input id="d-email" type="email" inputmode="email" autocomplete="email" value=${v.email} onInput=${v.onEmail} placeholder="ad@nümunə.az" style="flex:1;min-width:0;border:none;background:transparent;color:${v.c.text};font-size:16px;padding:0 12px;min-height:50px" /></div>
        </div>
      ` : null}
      ${v.loginStep1 ? html`
        <div style="display:flex;flex-direction:column;gap:6px">
          <label for="d-code" style="font-size:13px;font-weight:500;color:${v.c.muted}">E-poçt kodu (${v.email})</label>
          <input id="d-code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" value=${v.code} onInput=${v.onCode} placeholder="••••••" style="min-height:56px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface2};color:${v.c.text};font-family:'Geist Mono',monospace;font-size:26px;letter-spacing:.5em;text-align:center;padding:0 12px" />
          <span style="font-size:12px;color:${v.c.faint}">Məktub gəlməyibsə «Spam» qovluğuna bax.</span>
        </div>
      ` : null}
      ${v.loginErr ? html`<div role="alert" style="font-size:13px;line-height:1.5;padding:10px 12px;border-radius:10px;background:${v.c.redBg};color:${v.c.redText}">${v.loginErr}</div>` : null}
      <button type="submit" disabled=${v.loginDisabled} style="cursor:pointer;min-height:52px;border-radius:10px;border:none;background:${v.loginBtnBg};color:${v.loginBtnC};font-size:16px;font-weight:600">${v.loginBtn}</button>
      ${v.loginStep1 ? html`<button type="button" onClick=${v.loginBack} style="cursor:pointer;background:none;border:none;color:${v.c.accentText};font-size:14px;font-weight:500;min-height:40px">E-poçtu dəyiş</button>` : null}
      ${v.loginStep0 ? html`
        <div style="display:flex;align-items:center;gap:10px;color:${v.c.faint};font-size:12px"><span style="flex:1;height:1px;background:${v.c.border}"></span>və ya<span style="flex:1;height:1px;background:${v.c.border}"></span></div>
        <div style="display:flex;flex-direction:column;gap:8px;align-items:stretch">
          ${v.hasGoogle && !v.googleFailed ? html`<div ref=${v.gRef} style="min-height:44px;display:flex;justify-content:center"></div>` : null}
          ${v.googleFailed ? html`<span style="font-size:12px;color:${v.c.faint};text-align:center">Google girişi yüklənmədi — e-poçt kodu ilə davam et.</span>` : null}
          <button type="button" onClick=${v.appleSignIn} disabled=${!v.appleOn} title=${v.appleOn ? '' : 'Apple ilə veb girişi hələ qoşulmayıb'} style="cursor:${v.appleOn ? 'pointer' : 'not-allowed'};min-height:44px;border-radius:4px;border:1px solid ${v.c.border};background:${v.appleOn ? (v.isDark ? '#FFFFFF' : '#000000') : v.c.surface2};color:${v.appleOn ? (v.isDark ? '#000000' : '#FFFFFF') : v.c.faint};font-size:14px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:8px"><svg width="14" height="16" viewBox="0 0 14 17" aria-hidden="true" style="display:block"><path d="M11.6 9c0-2 1.6-2.9 1.7-3-.9-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7s-1.6-.7-2.6-.7C3.5 4.4 2.2 5.2 1.5 6.5c-1.5 2.5-.4 6.3 1 8.4.7 1 1.5 2.1 2.6 2.1 1 0 1.4-.7 2.7-.7s1.6.7 2.7.7c1.1 0 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3 0 0-2.4-.9-2.5-3.7zM9.6 3c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2z" style="fill:currentColor"></path></svg>${v.appleLabel}</button>
        </div>
      ` : null}
    </form>
    <button onClick=${v.goMap} style="cursor:pointer;background:none;border:none;color:${v.c.muted};font-size:14px;min-height:40px">Qeydiyyatsız davam et →</button>
  </main>
` : null);
