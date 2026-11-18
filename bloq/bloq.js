// Doldur bloqu — yalnız tema, paylaşma/kopyalama və kateqoriya süzgəci. Səhifə JS-siz də tam işləyir.
(function () {
  var d = document, root = d.documentElement, KEY = 'doldur.theme';
  root.classList.add('js');
  var get = function () { try { return JSON.parse(localStorage.getItem(KEY) || '"light"'); } catch (e) { return 'light'; } };
  var mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  var apply = function () { var t = get(); var dark = t === 'dark' || (t === 'system' && mq && mq.matches); root.setAttribute('data-theme', dark ? 'dark' : 'light'); };
  apply();
  if (mq && mq.addEventListener) mq.addEventListener('change', apply);
  var toast = function (m) { var el = d.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = m; d.body.appendChild(el); setTimeout(function () { el.remove(); }, 2200); };
  d.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!t) return;
    var act = t.getAttribute('data-act');
    if (act === 'theme') {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (x) { /* yox */ }
      apply();
      t.setAttribute('aria-label', next === 'dark' ? 'Açıq rejimə keç' : 'Tünd rejimə keç');
    } else if (act === 'copy') {
      var url = t.getAttribute('data-url');
      var ok = function () { toast('Link kopyalandı'); };
      var fail = function () { toast('Kopyalamaq alınmadı — linki ünvan sətrindən kopyala'); };
      try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok, fail); else fail(); } catch (x) { fail(); }
    } else if (act === 'native') {
      var u = t.getAttribute('data-url'), ti = t.getAttribute('data-title');
      if (navigator.share) navigator.share({ title: ti, url: u }).catch(function () {});
      else { try { navigator.clipboard.writeText(u).then(function () { toast('Link kopyalandı'); }); } catch (x) { toast('Linki ünvan sətrindən kopyala'); } }
    } else if (act === 'cat') {
      var c = t.getAttribute('data-cat');
      d.querySelectorAll('[data-act=cat]').forEach(function (b) { b.setAttribute('aria-pressed', b === t ? 'true' : 'false'); });
      d.querySelectorAll('[data-cats]').forEach(function (card) { card.hidden = !(c === 'Hamısı' || card.getAttribute('data-cats') === c); });
    }
  });
  var tb = d.querySelector('[data-act=theme]');
  if (tb) tb.setAttribute('aria-label', root.getAttribute('data-theme') === 'dark' ? 'Açıq rejimə keç' : 'Tünd rejimə keç');
})();
