/* Doldur — sayt izləməsi (19.11.2026, miqrasiya 0114).
 *
 * Nə sayılır: səhifə baxışı (səhifə növü, yol, haradan gəldi, utm_*) və mağaza
 * düymələrinə klik (Google Play / App Store). Hara gedir: öz bazamız —
 * Supabase `log_events` RPC, platform = 'web' (tətbiqlə eyni cədvəl, 180 gün).
 *
 * Nə YOXDUR: cookie, üçüncü tərəf skripti, ad/e-poçt/telefon/məkan, IP saxlanması.
 * Cihaz nömrəsi təsadüfi UUID-dir (localStorage `doldur_did`) — veb xəritə də
 * eyni nömrəni işlədir ki, saytdan xəritəyə keçən adam bir cihaz sayılsın.
 *
 * Göndərilmir: Do Not Track / Global Privacy Control açıqdırsa, botlar,
 * avtomatlaşdırılmış brauzerlər, canlı domendən başqa yerdə (lokal yoxlama
 * yalnız ?track=1 ilə).
 *
 * API: window.doldurTrack(name, props) — veb xəritə də işlədə bilər.
 */
(function () {
  'use strict';
  var SB = 'https://cruqwpypobvoifcoaqxh.supabase.co';
  var KEY = 'sb_publishable_Vzh9aNRxkjjq8kElijd_Zg_jJIH8YfS';
  var HOST = 'doldur.pro-tech.az';

  function off() {
    try {
      var n = navigator;
      if (n.doNotTrack === '1' || window.doNotTrack === '1' || n.globalPrivacyControl === true) return 'dnt';
      if (n.webdriver) return 'bot';
      if (/bot|crawl|spider|slurp|lighthouse|headless|preview|facebookexternalhit|whatsapp|telegrambot/i.test(n.userAgent || '')) return 'bot';
      if (location.hostname !== HOST && !/[?&]track=1\b/.test(location.search)) return 'host';
    } catch (e) { return 'err'; }
    return '';
  }

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var b = new Uint8Array(16);
    crypto.getRandomValues(b);
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = Array.prototype.map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }

  function deviceId() {
    try {
      var d = localStorage.getItem('doldur_did');
      if (!d || !/^[0-9a-f-]{36}$/i.test(d)) { d = uuid(); localStorage.setItem('doldur_did', d); }
      return d;
    } catch (e) {
      // Safari gizli rejim və s.: səhifə ömrü üçün müvəqqəti nömrə
      return window.__doldurDid || (window.__doldurDid = uuid());
    }
  }

  function clip(v, n) { return String(v == null ? '' : v).slice(0, n || 80); }

  function send(name, props) {
    if (off()) return;
    var body = JSON.stringify({
      p_device_id: deviceId(),
      p_events: [{ name: name, ts: new Date().toISOString(), props: props || {} }],
      p_platform: 'web',
      p_app_version: null
    });
    try {
      fetch(SB + '/rest/v1/rpc/log_events', {
        method: 'POST', keepalive: true, credentials: 'omit',
        headers: { 'Content-Type': 'application/json', apikey: KEY },
        body: body
      }).catch(function () {});
    } catch (e) { /* köhnə brauzer — sayılmır */ }
  }

  function pageType(p) {
    if (p === '/' || p === '/index.html') return 'ana';
    if (p === '/bloq/') return 'bloq';
    if (p.indexOf('/bloq/') === 0) return 'bloq_yazi';
    if (p.indexOf('/stansiya/') === 0) return 'stansiya';
    if (p.indexOf('/seher/') === 0) return 'seher';
    if (p.indexOf('/operator/') === 0) return 'operator';
    if (p.indexOf('/xerite/') === 0) return 'xerite';
    if (p.indexOf('/mexfilik/') === 0 || p.indexOf('/sertler/') === 0) return 'huquqi';
    return 'diger';
  }

  // Referer → qısa mənbə adı (yalnız host; tam URL saxlanmır)
  function refName() {
    var r = document.referrer;
    if (!r) return '';
    var h;
    try { h = new URL(r).hostname.toLowerCase().replace(/^www\./, ''); } catch (e) { return ''; }
    if (h === HOST || h === location.hostname) return '';
    var map = [
      [/(^|\.)google\./, 'google'], [/(^|\.)bing\.com$/, 'bing'], [/(^|\.)yandex\./, 'yandex'],
      [/(^|\.)duckduckgo\.com$/, 'duckduckgo'], [/instagram\.com$/, 'instagram'],
      [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, 'facebook'], [/^t\.co$|(^|\.)x\.com$|twitter\.com$/, 'x'],
      [/^t\.me$|telegram\.org$/, 'telegram'], [/whatsapp\.(com|net)$/, 'whatsapp'],
      [/linkedin\.com$|lnkd\.in$/, 'linkedin'], [/tiktok\.com$/, 'tiktok'], [/youtube\.com$|youtu\.be$/, 'youtube'],
      [/chatgpt\.com$|openai\.com$/, 'chatgpt'], [/perplexity\.ai$/, 'perplexity'], [/claude\.ai$/, 'claude'],
      [/gemini\.google\.com$/, 'gemini'], [/ucuztap\.az$/, 'ucuztap']
    ];
    for (var i = 0; i < map.length; i++) if (map[i][0].test(h)) return map[i][1];
    return clip(h, 40);
  }

  function pageView() {
    var p = location.pathname;
    var props = { page: pageType(p), path: clip(p, 100) };
    var ref = refName();
    if (ref) props.ref = ref;
    try {
      var q = new URLSearchParams(location.search);
      ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) {
        var v = q.get(k);
        if (v) props[k] = clip(v.replace(/[^\w.\-]/g, '_'), 40);
      });
      if (!props.ref && props.utm_source) props.ref = 'utm:' + props.utm_source;
    } catch (e) { /* yoxdur */ }
    send('web_page_view', props);
  }

  // Mağaza klikləri: data-store və ya link ünvanı ilə (bütün səhifələr, xəritə daxil)
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var store = a.getAttribute('data-store') ||
      (href.indexOf('play.google.com/store/apps/details?id=az.doldur') >= 0 ? 'play' :
        (href.indexOf('apps.apple.com') >= 0 && href.indexOf('6804632387') >= 0 ? 'ios' : ''));
    if (store !== 'play' && store !== 'ios') return;
    send('store_click', { store: store, page: pageType(location.pathname) });
  }, true);

  window.doldurDeviceId = deviceId;
  window.doldurTrackOff = off;
  window.doldurTrack = function (name, props) {
    if (!/^[a-z][a-z0-9_]{1,47}$/.test(name || '')) return;
    send(name, props);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pageView);
  else pageView();
})();
