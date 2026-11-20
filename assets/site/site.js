// Doldur sayt — tema açarı + «bu an ən ucuz boş DC» canlı kartı (20.11: məkan · stansiya · soket terminologiyası).
// Səhifə JS-siz də tam mənalıdır: kartın statik variantı HTML-dədir (ölçmə tarixi ilə),
// burada yalnız relay keşindən (doldur-relay, 300 s) təzə məlumatla əvəzlənir.
(function () {
  'use strict';
  var root = document.documentElement;

  // ---------------------------------------------------------------- tema
  // Açar /xerite/ veb tətbiqi ilə EYNİDİR: localStorage 'doldur.theme' = JSON "light" | "dark" | "system".
  var btn = document.getElementById('theme-btn');
  function isDark() { return root.getAttribute('data-theme') === 'dark'; }
  function label() { if (btn) btn.setAttribute('aria-label', isDark() ? 'Açıq rejimə keç' : 'Tünd rejimə keç'); }
  label();
  if (btn) btn.addEventListener('click', function () {
    var t = isDark() ? 'light' : 'dark';
    try { localStorage.setItem('doldur.theme', JSON.stringify(t)); } catch (e) { /* gizli rejim */ }
    root.setAttribute('data-theme', t);
    label();
  });
  try {
    var mq = matchMedia('(prefers-color-scheme: dark)');
    var onSys = function () {
      var t; try { t = JSON.parse(localStorage.getItem('doldur.theme') || '"light"'); } catch (e) { t = 'light'; }
      if (t === 'system') { root.setAttribute('data-theme', mq.matches ? 'dark' : 'light'); label(); }
    };
    if (mq.addEventListener) mq.addEventListener('change', onSys); else if (mq.addListener) mq.addListener(onSys);
  } catch (e) { /* köhnə brauzer */ }

  // ---------------------------------------------------------------- canlı kart
  var card = document.getElementById('live');
  if (!card || !window.fetch) return;
  var API = 'https://doldur-relay.pro-tech.az/doldur/v1/stations';
  var LOGO = { 'ivolt': 'ivolt', 'e-lektra': 'elektra', 'electrify.az': 'electrify_az', 'charge.az': 'charge_az',
    'azərişıq': 'azerisiq', 'tok': 'tok', 'touch station': 'touch_station', 'gofar': 'gofar', 'enrg.az': 'enrg', 'sigma charge': 'sigma' };
  var NAME = { 'e-lektra': 'ELEKTRA AZ' };
  var FRESH_MIN = 15; // «təzə» status həddi: xerite/lib/logic.js FRESH_MIN = tətbiqin staleThreshold-u = server expire_stale_statuses

  function money(v) { return v.toFixed(2).replace('.', ',') + ' ₼'; }
  function opName(n) { var k = (n || '').trim().toLowerCase(); return NAME[k] || n || 'Operator'; }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function initials(n) { var p = (n || '?').replace(/[^\p{L}\p{N} ]/gu, ' ').trim().split(/\s+/); return (p.length > 1 ? p[0][0] + p[1][0] : p[0].slice(0, 2)).toUpperCase(); }

  /** Rəqəmdən sonra 3-cü şəxs mənsubiyyət şəkilçisi: 8-i, 2-si, 3-ü, 6-sı, 9-u, 40-ı (oxunuşa görə). */
  function poss(n) {
    var ONES = ['', 'i', 'si', 'ü', 'ü', 'i', 'sı', 'si', 'i', 'u'];
    var TENS = ['', 'u', 'si', 'u', 'ı', 'si', 'ı', 'i', 'i', 'ı'];
    n = Math.abs(Math.round(n));
    var suf = n % 10 ? ONES[n % 10] : (Math.floor(n / 10) % 10 ? TENS[Math.floor(n / 10) % 10] : (Math.floor(n / 100) % 10 ? 'ü' : 'i'));
    return n + '-' + suf;
  }

  /**
   * Ən ucuz boş DC: təzə tarif, son FRESH_MIN dəqiqədə yenilənmiş status, giriş məhdudiyyəti yoxdur.
   * Terminologiya (20.11): MƏKAN = siyahı sətri · STANSİYA = şarj cihazı · SOKET.
   * Stansiya sayı məlumdursa (`dc_posts`, 0119): DC stansiya YALNIZ bütün DC soketləri boşdursa boş sayılır
   * (`dc_posts_free`) → «DC: 10 stansiyadan 8-i boş». Bilinmirsə → «N boş DC soket». Soketdən stansiya hesablanmır.
   */
  function pick(list, now) {
    var out = [];
    list.forEach(function (s) {
      var t = s.tariff;
      if (!t || t.price_per_kwh == null || t.is_stale || s.access_note) return;
      if (!s.status_updated_at) return;
      var age = (now - Date.parse(s.status_updated_at)) / 60000;
      if (!(age >= 0 && age <= FRESH_MIN)) return;
      var kw = 0, free = 0;
      (s.connectors || []).forEach(function (c) {
        if (c.current_kind === 'dc' && c.count_available > 0) { free += c.count_available; if (c.power_kw > kw) kw = c.power_kw; }
      });
      if (!free) return;
      var posts = typeof s.dc_posts === 'number' && s.dc_posts > 0 && typeof s.dc_posts_free === 'number';
      if (posts && !s.dc_posts_free) return; // boş soket var, amma tam boş stansiya yoxdur
      var freeT = posts ? 'DC: ' + s.dc_posts + ' stansiyadan ' + poss(s.dc_posts_free) + ' boş' : free + ' boş DC soket';
      out.push({ id: s.id, name: s.name, op: s.operator_name, price: t.price_per_kwh, kw: kw, freeT: freeT, age: Math.round(age) });
    });
    out.sort(function (a, b) { return a.price - b.price || b.kw - a.kw || a.name.localeCompare(b.name, 'az'); });
    return out;
  }

  function row(x) {
    var li = el('li');
    var a = el('a', 'st');
    a.href = '/xerite/?s=' + encodeURIComponent(x.id);
    var lg = el('span', 'st-logo');
    var slug = LOGO[(x.op || '').trim().toLowerCase()];
    if (slug) { var img = el('img'); img.src = '/assets/site/operators/' + slug + '.png'; img.alt = ''; img.width = 40; img.height = 40; img.loading = 'lazy'; lg.appendChild(img); }
    else { lg.textContent = initials(opName(x.op)); lg.setAttribute('aria-hidden', 'true'); }
    var main = el('span', 'st-main');
    main.appendChild(el('span', 'st-name', x.name));
    var meta = el('span', 'st-meta');
    meta.appendChild(el('span', null, opName(x.op)));
    meta.appendChild(el('span', 'tag tag-ok', x.freeT));
    meta.appendChild(el('span', 'tag tag-dc', Math.round(x.kw) + ' kW-a qədər'));
    main.appendChild(meta);
    var pr = el('span', 'st-price');
    pr.appendChild(el('b', null, x.price.toFixed(2).replace('.', ',') + ' ₼'));
    pr.appendChild(el('span', null, 'hər kWh · 40 kWh ≈ ' + money(x.price * 40)));
    a.appendChild(lg); a.appendChild(main); a.appendChild(pr);
    li.appendChild(a);
    return li;
  }

  var ctl = window.AbortController ? new AbortController() : null;
  var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 8000);
  fetch(API, { signal: ctl ? ctl.signal : undefined, headers: { Accept: 'application/json' } })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (data) {
      clearTimeout(timer);
      if (!Array.isArray(data)) throw new Error('format');
      var now = Date.now();
      var top = pick(data, now);
      if (!top.length) return; // statik variant qalır — uydurma «canlı» göstərmirik
      var ul = card.querySelector('.live-list');
      var stamp = card.querySelector('.live-stamp');
      var title = card.querySelector('.live-title');
      var foot = card.querySelector('.live-src');
      ul.textContent = '';
      top.slice(0, 3).forEach(function (x) { ul.appendChild(row(x)); });
      var d = new Date(now);
      var hh = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
      title.textContent = 'Bu an ən ucuz boş DC məkanlar';
      stamp.textContent = 'canlı · ' + hh;
      if (foot) foot.textContent = 'Boş DC stansiyası və ya soketi olan ' + top.length + ' məkan içindən. Status son ' + FRESH_MIN + ' dəqiqədə operatordan gəlib; tarif operatorun açıq məlumatıdır. «kW-a qədər» — boş DC soketlərin ən böyük gücü.';
      card.setAttribute('data-state', 'live');
    })
    .catch(function () { clearTimeout(timer); /* statik variant qalır */ });
})();
