// BLOQ + YAZI — dizayn şablonundan. Yazılar `posts.json`-dan; «canlı» bloklar real datadan qurulur.
// 18.11: posts.json tools/build_blog.py ilə qurulur; «url» olan yazının tam versiyası statik /bloq/ səhifəsidir.
import { html } from '../lib/h.js';

const rd = (p) => (p.readMin ? p.readMin + ' dəq' : p.read);

export const BlogView = (v) => (v.pBlog ? html`
  <main style="max-width:1200px;margin:0 auto;padding:32px 20px 48px;display:flex;flex-direction:column;gap:24px">
    <div style="display:flex;flex-direction:column;gap:8px">
      <span style="font-family:'Geist Mono',monospace;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${v.c.accentText}">Doldur bloqu</span>
      <h1 class="d-h1" style="margin:0;font-family:'Manrope',sans-serif;font-weight:700;font-size:40px;letter-spacing:-0.02em;line-height:1.1">EV sürücüləri üçün praktik bələdçilər</h1>
      <p style="margin:0;color:${v.c.muted};font-size:16px;max-width:620px">Soketlər və qiymətlər — qısa, dəqiq, Doldur bazasındakı real rəqəmlərlə.</p>
    </div>
    <div role="group" aria-label="Kateqoriya" class="dn-scroll" style="display:flex;gap:6px;overflow-x:auto">
      ${v.cats.map((ct) => html`
        <button onClick=${ct.go} aria-pressed=${ct.on} style="cursor:pointer;white-space:nowrap;min-height:38px;padding:0 16px;border-radius:999px;font-size:14px;font-weight:500;background:${ct.bg};color:${ct.color};border:1px solid ${ct.bd}">${ct.label}</button>
      `)}
    </div>
    ${v.postsLoading ? html`<div style="color:${v.c.muted};font-size:14px">Yazılar yüklənir…</div>` : null}

    ${v.hasFeat ? html`
      <article style="background:${v.c.surface};border:1px solid ${v.c.border};border-radius:18px;overflow:hidden;display:flex;flex-wrap:wrap">
        <div aria-hidden="true" style="flex:1 1 360px;min-height:240px;position:relative;background:${v.feat.cover};display:flex;align-items:${v.feat.img ? 'center' : 'flex-end'};padding:${v.feat.img ? '0' : '22px'}">
          ${v.feat.img ? html`<img src=${v.feat.img} alt="" width="1600" height="900" loading="lazy" style="display:block;width:100%;height:auto;aspect-ratio:16/9" />` : html`<span style="font-family:'Geist Mono',monospace;font-weight:600;font-size:64px;line-height:1;color:rgba(255,255,255,.92);letter-spacing:-0.03em">${v.feat.glyph}</span>`}
          <span style="position:absolute;right:18px;${v.feat.img ? 'bottom' : 'top'}:18px;font-family:'Geist Mono',monospace;font-size:11px;padding:5px 10px;border-radius:999px;background:rgba(11,21,24,.55);color:#E9EFED">SEÇİLMİŞ</span>
        </div>
        <div style="flex:1 1 380px;min-width:0;padding:26px;display:flex;flex-direction:column;gap:12px">
          <span style="font-family:'Geist Mono',monospace;font-size:12px;color:${v.c.accentText}">${v.feat.cat} · ${rd(v.feat)}</span>
          <h2 style="margin:0;font-family:'Manrope',sans-serif;font-weight:700;font-size:28px;letter-spacing:-0.02em;line-height:1.2;text-wrap:balance">${v.feat.title}</h2>
          <p style="margin:0;color:${v.c.muted};font-size:15px;line-height:1.6">${v.feat.ex}</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:auto;padding-top:6px">
            ${v.feat.url ? html`<a href=${v.feat.url} style="min-height:44px;padding:0 20px;border-radius:10px;background:#12E28C;color:#0B1518;font-size:14px;font-weight:600;display:inline-flex;align-items:center">Oxu</a>` : html`<button onClick=${v.feat.open} style="cursor:pointer;min-height:44px;padding:0 20px;border-radius:10px;border:none;background:#12E28C;color:#0B1518;font-size:14px;font-weight:600">Oxu</button>`}
            <button onClick=${v.feat.share} style="cursor:pointer;min-height:44px;padding:0 16px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface2};color:${v.c.text};font-size:14px;font-weight:500">Paylaş</button>
            <span style="margin-left:auto;align-self:center;font-size:13px;color:${v.c.faint}">${v.feat.date} · ${v.feat.author}</span>
          </div>
        </div>
      </article>
    ` : null}

    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">
      ${v.blogList.map((po) => html`
        <article style="background:${v.c.surface};border:1px solid ${v.c.border};border-radius:16px;overflow:hidden;display:flex;flex-direction:column">
          ${cardBody(v, po)}
          <div style="display:flex;align-items:center;gap:8px;padding:10px 18px 16px">
            <span style="font-size:12px;color:${v.c.faint}">${po.date}</span>
            <button onClick=${po.share} aria-label=${po.shareAria} style="cursor:pointer;margin-left:auto;width:36px;height:36px;border-radius:9px;border:1px solid ${v.c.border};background:${v.c.surface2};display:flex;align-items:center;justify-content:center;padding:0"><svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true" style="display:block"><path d="M10 12.5V2.8 M6.4 6.2L10 2.6L13.6 6.2 M5.5 9H4.5V17.2H15.5V9H14.5" style="fill:none;stroke:${v.c.text};stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round"></path></svg></button>
          </div>
        </article>
      `)}
    </div>
  </main>
` : null);

// Kart: statik versiyası olan yazı adi linkdir (crawler görür, JS-siz də açılır), qalanı tətbiqdaxili.
const cardBody = (v, po) => {
  const inner = html`
    ${po.img ? html`<img aria-hidden="true" src=${po.img} alt="" width="1600" height="900" loading="lazy" style="display:block;width:100%;height:auto;aspect-ratio:16/9;background:${po.cover}" />` : html`<span aria-hidden="true" style="height:140px;width:100%;background:${po.cover};display:flex;align-items:flex-end;padding:16px"><span style="font-family:'Geist Mono',monospace;font-weight:600;font-size:40px;line-height:1;color:rgba(255,255,255,.92)">${po.glyph}</span></span>`}
    <span style="padding:18px 18px 8px;display:flex;flex-direction:column;gap:8px">
      <span style="font-family:'Geist Mono',monospace;font-size:11px;color:${v.c.accentText}">${po.cat} · ${rd(po)}</span>
      <span style="font-family:'Manrope',sans-serif;font-weight:700;font-size:18px;letter-spacing:-0.01em;line-height:1.3">${po.title}</span>
      <span style="font-size:14px;color:${v.c.muted};line-height:1.5">${po.ex}</span>
    </span>`;
  const st = `background:none;border:none;padding:0;text-align:left;color:${v.c.text};display:flex;flex-direction:column;flex:1`;
  return po.url ? html`<a href=${po.url} style=${st}>${inner}</a>` : html`<button onClick=${po.open} style=${'cursor:pointer;' + st}>${inner}</button>`;
};

const block = (v, b) => {
  if (b.isH) return html`<h2 id=${b.id} style="margin:16px 0 0;font-family:'Manrope',sans-serif;font-weight:700;font-size:24px;letter-spacing:-0.015em;line-height:1.3;scroll-margin-top:80px">${b.text}</h2>`;
  if (b.isP) return html`<p style="margin:0;text-wrap:pretty">${b.text}</p>`;
  if (b.isNote) return html`<p style="margin:0;font-size:14px;color:${v.c.faint}">${b.text}</p>`;
  if (b.isL) return html`<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px">${b.items.map((li) => html`<li style="display:flex;gap:12px"><span aria-hidden="true" style="width:7px;height:7px;border-radius:2px;background:#12E28C;flex-shrink:0;margin-top:11px"></span><span>${li}</span></li>`)}</ul>`;
  if (b.isTip) return html`<aside style="padding:16px 18px;border-radius:14px;background:${v.c.accentSoft};border-left:3px solid #12E28C;font-size:16px;line-height:1.6"><strong style="font-weight:600">Məsləhət: </strong>${b.text}</aside>`;
  if (b.isT) return html`
    <div style="overflow-x:auto;border:1px solid ${v.c.border};border-radius:14px">
      <div role="table" aria-label=${b.caption} style="min-width:480px;font-size:15px;line-height:1.45">
        <div role="row" style="display:grid;grid-template-columns:${b.cols};background:${v.c.surface2};font-weight:600">${b.head.map((h) => html`<span role="columnheader" style="padding:12px 14px">${h}</span>`)}</div>
        ${b.rows.map((rw) => html`
          <div role="row" style="display:grid;grid-template-columns:${b.cols};border-top:1px solid ${v.c.border}">${rw.map((cell, i) => html`<span role="cell" style="padding:12px 14px;${i === 0 ? "font-family:'Geist Mono',monospace;font-size:14px;font-weight:600" : i === rw.length - 1 ? 'color:' + v.c.muted : ''}">${cell}</span>`)}</div>
        `)}
      </div>
    </div>`;
  return null;
};

export const PostView = (v) => (v.pPost ? html`
  <main style="max-width:1160px;margin:0 auto;padding:24px 20px 56px;display:flex;flex-direction:column;gap:20px">
    <nav aria-label="Yol" style="display:flex;gap:8px;align-items:center;font-size:14px;color:${v.c.muted};flex-wrap:wrap">
      <button onClick=${v.goBlog} style="cursor:pointer;background:none;border:none;padding:6px 0;color:${v.c.accentText};font-size:14px;font-weight:500">← Bloq</button><span aria-hidden="true">/</span><span>${v.post.cat}</span>
    </nav>
    ${v.postMissing ? html`<div style="background:${v.c.surface};border:1px dashed ${v.c.borderStrong};border-radius:16px;padding:32px;text-align:center;color:${v.c.muted}">${v.postsLoading ? 'Yazı yüklənir…' : 'Bu yazı tapılmadı.'}</div>` : html`
    <div style="display:flex;flex-wrap:wrap;gap:40px;align-items:flex-start">
      <article style="flex:999 1 600px;min-width:0;max-width:760px;display:flex;flex-direction:column;gap:20px">
        <header style="display:flex;flex-direction:column;gap:14px">
          <span style="font-family:'Geist Mono',monospace;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:${v.c.accentText}">${v.post.cat} · ${rd(v.post)}</span>
          <h1 class="d-h1" style="margin:0;font-family:'Manrope',sans-serif;font-weight:800;font-size:42px;letter-spacing:-0.025em;line-height:1.1;text-wrap:balance">${v.post.title}</h1>
          <p style="margin:0;font-size:18px;line-height:1.55;color:${v.c.muted};text-wrap:pretty">${v.post.ex}</p>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <span aria-hidden="true" style="width:36px;height:36px;border-radius:999px;background:#12E28C;color:#0B1518;display:flex;align-items:center;justify-content:center;font-family:'Manrope',sans-serif;font-weight:700;font-size:14px">${v.post.ai}</span>
            <span style="display:flex;flex-direction:column;line-height:1.3"><span style="font-size:14px;font-weight:600">${v.post.author}</span><span style="font-size:13px;color:${v.c.faint}">${v.post.date}</span></span>
          </div>
        </header>
        <div aria-hidden="true" style="height:280px;border-radius:18px;background:${v.post.cover};display:flex;align-items:flex-end;padding:24px"><span style="font-family:'Geist Mono',monospace;font-weight:600;font-size:80px;line-height:1;color:rgba(255,255,255,.92);letter-spacing:-0.03em">${v.post.glyph}</span></div>

        <div role="group" aria-label="Yazını paylaş" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:12px 0;border-top:1px solid ${v.c.border};border-bottom:1px solid ${v.c.border}">
          <span style="font-size:13px;font-weight:500;color:${v.c.muted};margin-right:4px">Paylaş</span>
          ${v.postShare.map((ps) => html`
            <a href=${ps.href} target="_blank" rel="noopener noreferrer" aria-label=${ps.aria} style="width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:'Geist Mono',monospace;font-size:12px;font-weight:600;background:${ps.bg};color:${ps.fg}">${ps.ab}</a>
          `)}
          <button onClick=${v.copyPost} style="cursor:pointer;min-height:40px;padding:0 14px;border-radius:10px;border:1px solid ${v.c.border};background:${v.c.surface};color:${v.c.text};font-size:13px;font-weight:500;display:flex;align-items:center;gap:6px"><svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true" style="display:block"><path d="M8.5 11.5L11.5 8.5 M9.5 5.5L11 4A3.5 3.5 0 0 1 16 9L14.5 10.5 M10.5 14.5L9 16A3.5 3.5 0 0 1 4 11L5.5 9.5" style="fill:none;stroke:${v.c.text};stroke-width:1.8;stroke-linecap:round"></path></svg>Linki kopyala</button>
        </div>

        ${v.post.url ? html`<a href=${v.post.url} style="display:flex;align-items:center;gap:10px;padding:14px 18px;border-radius:14px;background:${v.c.accentSoft};border:1px solid ${v.c.accentBorder};color:${v.c.text};font-size:15px;font-weight:600">Tam versiya — cədvəllər, xəritələr və mənbələrlə <span aria-hidden="true" style="margin-left:auto;color:${v.c.accentText}">→</span></a>` : null}
        <div style="display:flex;flex-direction:column;gap:16px;font-size:17px;line-height:1.7">
          ${v.post.blocks.map((b) => block(v, b))}
        </div>

        <section aria-label="Dostuna göndər" style="background:${v.c.elev};border:1px solid ${v.c.accentBorder};border-radius:18px;padding:22px;display:flex;flex-wrap:wrap;gap:14px;align-items:center">
          <div style="flex:1 1 260px;display:flex;flex-direction:column;gap:4px"><h2 style="margin:0;font-family:'Manrope',sans-serif;font-weight:700;font-size:19px">EV sürən dostun var?</h2><span style="font-size:14px;color:${v.c.muted}">Bu yazını bir toxunuşla göndər — ona da lazım olacaq.</span></div>
          <button onClick=${v.sharePostCur} style="cursor:pointer;min-height:48px;padding:0 22px;border-radius:10px;border:none;background:#12E28C;color:#0B1518;font-size:15px;font-weight:600">Paylaş</button>
        </section>
      </article>

      <aside style="flex:1 1 280px;min-width:0;display:flex;flex-direction:column;gap:14px">
        ${v.post.toc.length ? html`
          <nav aria-label="Mündəricat" class="d-hide-t" style="background:${v.c.surface};border:1px solid ${v.c.border};border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:6px">
            <h2 style="margin:0 0 4px;font-size:12px;font-family:'Geist Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:${v.c.muted};font-weight:500">Bu yazıda</h2>
            ${v.post.toc.map((tc) => html`
              <a href="#${tc.id}" style="font-size:14px;line-height:1.4;color:${v.c.text};padding:6px 0 6px 12px;border-left:2px solid ${v.c.border}">${tc.text}</a>
            `)}
          </nav>
        ` : null}
        <section aria-label="Tətbiqi sına" style="background:#0B1518;color:#E9EFED;border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:10px">
          <span aria-hidden="true" style="width:13px;height:24px;border-radius:4px;border:1.5px solid #12E28C;position:relative;overflow:hidden;display:inline-block"><span style="position:absolute;left:0;right:0;bottom:0;height:62%;background:#12E28C"></span></span>
          <h2 style="margin:0;font-family:'Manrope',sans-serif;font-weight:700;font-size:18px">Ən sərfəli stansiyanı tap</h2>
          <span style="font-size:14px;color:#8CA0A4;line-height:1.5">Bütün operatorlar bir xəritədə — tam xərc, status, soket uyğunluğu.</span>
          <button onClick=${v.goMap} style="cursor:pointer;align-self:flex-start;min-height:44px;padding:0 18px;border-radius:10px;border:none;background:#12E28C;color:#0B1518;font-size:14px;font-weight:600">Xəritəni aç</button>
        </section>
        ${v.related.length ? html`
          <section aria-label="Oxşar yazılar" style="display:flex;flex-direction:column;gap:8px">
            <h2 style="margin:0;font-size:12px;font-family:'Geist Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:${v.c.muted};font-weight:500;padding:0 4px">Digər yazılar</h2>
            ${v.related.map((rl) => html`
              <a href=${rl.url || '#'} onClick=${rl.url ? null : (e) => { e.preventDefault(); rl.open(); }} style="text-align:left;background:${v.c.surface};border:1px solid ${v.c.border};border-radius:12px;padding:12px;display:flex;gap:12px;align-items:center;color:${v.c.text}">
                <span aria-hidden="true" style="width:52px;height:52px;border-radius:10px;flex-shrink:0;background:${rl.cover};display:flex;align-items:flex-end;padding:6px;font-family:'Geist Mono',monospace;font-weight:600;font-size:14px;color:#FFFFFF">${rl.glyph}</span>
                <span style="display:flex;flex-direction:column;gap:2px;min-width:0"><span style="font-size:14px;font-weight:600;line-height:1.3">${rl.title}</span><span style="font-size:12px;color:${v.c.faint}">${rd(rl)}</span></span>
              </a>
            `)}
          </section>
        ` : null}
      </aside>
    </div>`}
  </main>
` : null);
