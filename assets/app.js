/* MamboLab 站点渲染逻辑 */
(function () {
  var D = window.ML_DATA || {};

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function q(s, r) { return (r || document).querySelector(s); }

  /* ---------- 主题 ---------- */
  function prefersDark() {
    try {
      return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    } catch (e) { return false; }
  }
  function curTheme() {
    return document.documentElement.getAttribute('data-theme') || (prefersDark() ? 'dark' : 'light');
  }
  function themeIcon() {
    return curTheme() === 'dark'
      ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>'
      : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>';
  }
  function bindTheme() {
    var btn = q('#theme-toggle');
    if (!btn) return;
    btn.innerHTML = themeIcon();
    btn.addEventListener('click', function () {
      var next = curTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('ml-theme', next); } catch (e) {}
      btn.innerHTML = themeIcon();
    });
  }

  /* ---------- 导航 ---------- */
  function initNav() {
    var menu = q('#dd-special-menu');
    if (menu && D.special_days && D.special_days.years) {
      var sd = D.special_days;
      var html = '';
      sd.years.forEach(function (y) {
        (y.terms || []).forEach(function (t) {
          var dated = (t.items || []).filter(function (it) { return it.date; }).length;
          if (!dated) return;
          html += '<a class="dd-sub" href="special-days.html#term-' + y.year + '-' + t.id + '">' +
            y.year + ' · ' + esc(t.name) + '</a>';
        });
      });
      if (!html) html = '<a class="dd-sub" href="special-days.html">查看全部</a>';
      menu.innerHTML = html;
    }
    var path = location.pathname.split('/').pop() || 'index.html';
    Array.prototype.forEach.call(document.querySelectorAll('.nav-links > a[href]'), function (a) {
      if (a.getAttribute('href') === path) a.classList.add('active');
    });
    var dd = q('.dd');
    if (dd) {
      var trigger = dd.querySelector('button');
      if (trigger) {
        trigger.addEventListener('click', function (e) {
          e.stopPropagation();
          dd.classList.toggle('open');
        });
        document.addEventListener('click', function () { dd.classList.remove('open'); });
      }
    }
  }

  /* ---------- 新闻 ---------- */
  function fmtDate(s) {
    if (!s) return '';
    return String(s).replace(/-/g, '.');
  }
  function renderNews(el, limit) {
    if (!el || !D.news) return;
    var items = (D.news.items || []).slice().sort(function (a, b) {
      return (b.date || '').localeCompare(a.date || '');
    });
    if (limit) items = items.slice(0, limit);
    if (!items.length) { el.innerHTML = '<li><span class="text">暂无动态</span></li>'; return; }
    el.innerHTML = items.map(function (n) {
      var text = esc(n.text);
      if (n.link) text = '<a href="' + esc(n.link) + '" target="_blank" rel="noopener">' + text + '</a>';
      return '<li><span class="date">' + fmtDate(n.date) + '</span><span class="text">' + text + '</span></li>';
    }).join('');
  }

  /* ---------- 成员 ---------- */
  function initials(m) {
    if (m.name_zh) return m.name_zh.slice(-2);
    var p = String(m.name || '').trim().split(/\s+/);
    return ((p[0] || '?')[0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
  }
  function renderMembers(el) {
    if (!el || !D.members) return;
    var groups = (D.site && D.site.member_groups) || [];
    var all = D.members.items || [];
    var html = '';
    groups.forEach(function (g) {
      var list = all.filter(function (m) { return m.group === g.id; });
      if (!list.length) return;
      html += '<h2 class="group-title">' + esc(g.name) + '</h2><div class="people">';
      html += list.map(function (m) {
        var av = m.avatar
          ? '<div class="avatar"><img src="' + esc(m.avatar) + '" alt="' + esc(m.name) + '"></div>'
          : '<div class="avatar">' + esc(initials(m)) + '</div>';
        var links = '';
        if (m.homepage) links += '<a href="' + esc(m.homepage) + '" target="_blank" rel="noopener">主页</a>';
        if (m.email) links += '<a href="mailto:' + esc(m.email) + '">邮箱</a>';
        return '<div class="person">' + av +
          '<div><h3>' + esc(m.name_zh || m.name) +
          (m.name_zh && m.name ? ' <span style="font-weight:400;color:var(--muted)">' + esc(m.name) + '</span>' : '') +
          '</h3>' +
          '<p class="role">' + esc(m.role || '') + '</p>' +
          '<p class="meta">' + esc(m.research || '') + '</p>' +
          (links ? '<div class="links">' + links + '</div>' : '') +
          '</div></div>';
      }).join('');
      html += '</div>';
    });
    el.innerHTML = html || '<p class="empty">成员信息整理中。</p>';
  }

  /* ---------- 论文 ---------- */
  var MINE = /Shangshang Yang/;

  function pubLinks(p) {
    var L = p.links || {}, out = '';
    if (L.html) out += '<a href="' + esc(L.html) + '" target="_blank" rel="noopener">论文</a>';
    if (L.pdf) out += '<a href="' + esc(L.pdf) + '" target="_blank" rel="noopener">PDF</a>';
    if (L.arxiv) out += '<a href="' + esc(L.arxiv) + '" target="_blank" rel="noopener">arXiv</a>';
    if (L.code) out += '<a href="' + esc(L.code) + '" target="_blank" rel="noopener">代码</a>';
    return out ? '<div class="pub-links">' + out + '</div>' : '';
  }

  function pubHTML(p) {
    var authors = esc(p.authors).replace(MINE, '<b>Shangshang Yang</b>');
    return '<div class="pub"><div class="pub-abbr">' + esc(p.abbr || '') + '</div><div>' +
      '<p class="pub-title">' + esc(p.title) +
      (p.award ? '<span class="award">' + esc(p.award) + '</span>' : '') + '</p>' +
      '<p class="pub-authors">' + authors + '</p>' +
      '<p class="pub-venue">' + esc(p.venue || '') + '</p>' +
      pubLinks(p) + '</div></div>';
  }

  function renderSelected(el, limit) {
    if (!el || !D.publications) return;
    var all = D.publications.items || [];
    var sel = all.filter(function (p) { return p.selected; });
    if (!sel.length) sel = all;
    el.innerHTML = sel.slice(0, limit || 4).map(pubHTML).join('') ||
      '<p class="empty">成果整理中。</p>';
  }

  function renderPubs(el, chipsEl) {
    if (!el || !D.publications) return;
    var all = D.publications.items || [];
    var filter = 'all';

    function draw() {
      var list = all.filter(function (p) {
        return filter === 'all' || p.type === filter;
      });
      var byYear = {};
      list.forEach(function (p) { (byYear[p.year] = byYear[p.year] || []).push(p); });
      var years = Object.keys(byYear).sort(function (a, b) { return b - a; });
      if (!years.length) { el.innerHTML = '<p class="empty">暂无成果记录。</p>'; return; }
      el.innerHTML = years.map(function (y) {
        return '<div class="year-label">' + y + '</div>' + byYear[y].map(pubHTML).join('');
      }).join('');
    }

    if (chipsEl) {
      var types = [['all', '全部'], ['journal', '期刊'], ['conference', '会议']];
      chipsEl.innerHTML = types.map(function (t) {
        return '<button class="chip' + (t[0] === 'all' ? ' on' : '') + '" data-f="' + t[0] + '">' + t[1] + '</button>';
      }).join('');
      chipsEl.addEventListener('click', function (e) {
        var b = e.target.closest('.chip');
        if (!b) return;
        filter = b.getAttribute('data-f');
        Array.prototype.forEach.call(chipsEl.querySelectorAll('.chip'), function (c) {
          c.classList.toggle('on', c === b);
        });
        draw();
      });
    }
    draw();
  }

  /* ---------- Special Day ---------- */
  var SD = D.special_days || {};
  var TYPE_MAP = {};
  (SD.types || []).forEach(function (t) { TYPE_MAP[t.id] = t; });

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  /* "2026-10-31" + "10:00–12:00" → Date（取开始时间，按北京时间） */
  function toDate(it) {
    if (!it || !it.date) return null;
    var ds = String(it.date).trim().replace(/[\/.]/g, '-');
    var m = ds.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (!m) return null;
    var hm = '00:00';
    if (it.time) {
      var t = String(it.time).match(/(\d{1,2})\s*[:：]\s*(\d{2})/);
      if (t) hm = pad2(+t[1]) + ':' + t[2];
    }
    var d = new Date(m[1] + '-' + pad2(+m[2]) + '-' + pad2(+m[3]) + 'T' + hm + ':00+08:00');
    return isNaN(d.getTime()) ? null : d;
  }

  function cdParts(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    return { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
  }
  function fmtCd(ms) {
    var p = cdParts(ms);
    return (p.d > 0 ? p.d + ' 天 ' : '') + pad2(p.h) + ':' + pad2(p.m) + ':' + pad2(p.s);
  }

  /* 每秒刷新所有倒计时 */
  function tickCountdowns() {
    var now = Date.now();
    Array.prototype.forEach.call(document.querySelectorAll('[data-cd]'), function (el) {
      var target = Number(el.getAttribute('data-cd'));
      if (!target) return;
      var p = cdParts(target - now);
      var u = el.querySelectorAll('b');
      if (u.length === 4) {
        u[0].textContent = p.d;
        u[1].textContent = pad2(p.h);
        u[2].textContent = pad2(p.m);
        u[3].textContent = pad2(p.s);
      }
      el.classList.toggle('is-over', target - now <= 0);
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-cd-text]'), function (el) {
      var target = Number(el.getAttribute('data-cd-text'));
      if (!target) return;
      var left = target - now;
      el.textContent = left > 0 ? '还有 ' + fmtCd(left) : '正在进行';
    });
  }

  function spdName(it) {
    var tp = TYPE_MAP[it.type];
    return (tp && tp.name) || it.name || '';
  }
  function spdEn(it) {
    var tp = TYPE_MAP[it.type];
    return (tp && tp.en) || '';
  }
  function spdMeta(it) {
    var parts = [];
    if (it.date) parts.push(String(it.date).replace(/-/g, '.'));
    if (it.time) parts.push(it.time);
    if (it.place) parts.push(it.place);
    return parts.join(' · ');
  }

  function upCard(e) {
    var it = e.it;
    var tp = TYPE_MAP[it.type] || {};
    return '<article class="next-card">' +
      (tp.image ? '<div class="next-media" aria-hidden="true"><img src="' + esc(tp.image) + '" alt="" loading="lazy"></div>' : '') +
      '<div class="next-main">' +
        '<p class="next-kicker">下一次 · ' + esc(e.year + ' ' + e.termName) + '</p>' +
        '<div class="next-title"><h3>' + esc(spdName(it)) + '</h3>' +
          (it.theme ? '<span class="next-theme">主题 · ' + esc(it.theme) + '</span>' : '') + '</div>' +
        '<div class="cd" data-cd="' + e.d.getTime() + '">' +
          '<div class="cd-u"><b>0</b><span>天</span></div>' +
          '<div class="cd-u"><b>00</b><span>时</span></div>' +
          '<div class="cd-u"><b>00</b><span>分</span></div>' +
          '<div class="cd-u"><b>00</b><span>秒</span></div>' +
        '</div>' +
        '<p class="next-meta">' + esc(spdMeta(it)) + '</p>' +
        (it.note ? '<p class="next-note">' + esc(it.note) + '</p>' : '') +
      '</div></article>';
  }

  function nextRow(e) {
    var it = e.it;
    return '<div class="next-row">' +
      '<span class="nm">' + esc(spdName(it)) + (it.theme ? ' · ' + esc(it.theme) : '') + '</span>' +
      '<span class="tm" data-cd-text="' + e.d.getTime() + '">' + esc(String(it.date).replace(/-/g, '.')) + '</span>' +
      '</div>';
  }

  function pastCard(e) {
    var it = e.it;
    var photos = (it.photos || []).filter(Boolean);
    var cover = photos.length
      ? '<div class="spd-cover"><img src="' + esc(photos[0]) + '" alt="' + esc(spdName(it)) + '" loading="lazy"></div>'
      : '<div class="spd-cover is-empty"><span>现场照片待补充</span></div>';
    var thumbs = photos.length > 1
      ? '<div class="spd-photos">' + photos.slice(1, 7).map(function (p) {
          return '<a href="' + esc(p) + '" target="_blank" rel="noopener"><img src="' + esc(p) + '" alt="" loading="lazy"></a>';
        }).join('') + '</div>'
      : '';
    return '<article class="spd">' + cover + '<div class="spd-body">' +
      '<div class="spd-top"><h3>' + esc(spdName(it)) + '</h3><span class="badge badge-done">已举办</span></div>' +
      (spdEn(it) ? '<p class="spd-en">' + esc(spdEn(it)) + '</p>' : '') +
      (it.theme ? '<p class="spd-theme">主题 · ' + esc(it.theme) + '</p>' : '') +
      '<p class="when">' + esc(String(it.date).replace(/-/g, '.') + (it.time ? '　' + it.time : '')) + '</p>' +
      (it.place ? '<p class="spd-place">' + esc(it.place) + '</p>' : '') +
      (it.note ? '<p class="note">' + esc(it.note) + '</p>' : '') +
      thumbs + '</div></article>';
  }

  function renderSpecialDays(root) {
    if (!root || !D.special_days) return;
    var data = D.special_days;

    var introEl = q('#spd-intro');
    if (introEl && data.intro) introEl.textContent = data.intro;

    /* 01 六种类型 */
    var grid = q('#spd-types');
    if (grid) {
      grid.innerHTML = (data.types || []).map(function (t) {
        return '<article class="type-card">' +
          (t.image ? '<div class="type-media"><img src="' + esc(t.image) + '" alt="' + esc(t.name) + '" loading="lazy"></div>' : '') +
          '<div class="type-body">' +
            '<div class="type-head"><h3>' + esc(t.name) + '</h3><span class="type-en">' + esc(t.en || '') + '</span></div>' +
            '<p class="type-desc">' + esc(t.desc || '') + '</p>' +
            (t.note ? '<p class="type-note">' + esc(t.note) + '</p>' : '') +
          '</div></article>';
      }).join('');
    }
    var aboutEl = q('#spd-about');
    if (aboutEl && data.about) aboutEl.textContent = data.about;

    /* 02 组织形式 */
    if (data.org) {
      var lead = q('#spd-org-lead');
      if (lead) lead.textContent = data.org.lead || '';
      var list = q('#spd-org');
      if (list) {
        list.innerHTML = (data.org.steps || []).map(function (s) {
          return '<div><dt>' + esc(s.k) + '</dt><dd>' + esc(s.v) + '</dd></div>';
        }).join('');
      }
    }

    /* 只保留「有日期」的：已举办 + 即将举办，未定的不展示 */
    var evts = [];
    (data.years || []).forEach(function (y) {
      (y.terms || []).forEach(function (t) {
        (t.items || []).forEach(function (it) {
          var d = toDate(it);
          if (!d) return;
          evts.push({
            it: it, d: d, year: y.year, termName: t.name,
            key: y.year + '-' + t.id, total: (t.items || []).length
          });
        });
      });
    });
    var now = Date.now();
    var up = evts.filter(function (e) { return e.d.getTime() >= now; })
                 .sort(function (a, b) { return a.d - b.d; });
    var past = evts.filter(function (e) { return e.d.getTime() < now; })
                   .sort(function (a, b) { return b.d - a.d; });

    /* 03 接下来 */
    var nextEl = q('#spd-next');
    if (nextEl) {
      if (!up.length) {
        nextEl.innerHTML = '<div class="next-empty"><h3>下一次的日期还在商量</h3>' +
          '<p>日期确定后，这里会出现按秒走的倒计时。</p></div>';
      } else {
        nextEl.innerHTML = upCard(up[0]) +
          (up.length > 1 ? '<div class="next-list">' + up.slice(1).map(nextRow).join('') + '</div>' : '');
      }
    }
    var anc = q('#spd-announce');
    if (anc && data.announcement) anc.textContent = data.announcement.text || '';

    /* 04 已举办 */
    var pastEl = q('#spd-past');
    if (pastEl) {
      if (!past.length) {
        pastEl.innerHTML = '<p class="empty">还没有举办记录。</p>';
      } else {
        var groups = [], seen = {};
        past.forEach(function (e) {
          if (!seen[e.key]) {
            seen[e.key] = { key: e.key, name: e.year + ' · ' + e.termName, items: [], total: e.total };
            groups.push(seen[e.key]);
          }
          seen[e.key].items.push(e);
        });
        pastEl.innerHTML = groups.map(function (g) {
          return '<div class="term-block" id="term-' + esc(g.key) + '">' +
            '<div class="term-head"><h3>' + esc(g.name) + '</h3>' +
            '<span>已举办 ' + g.items.length + ' / ' + g.total + ' 次</span></div>' +
            '<div class="spd-grid">' + g.items.map(pastCard).join('') + '</div></div>';
        }).join('');
      }
    }

    tickCountdowns();
    if (window.__spdTimer) clearInterval(window.__spdTimer);
    window.__spdTimer = setInterval(tickCountdowns, 1000);
  }

  /* ---------- 首屏导航（深色大图时透明融入） ---------- */
  function initHeroNav() {
    var nav = document.querySelector('.nav');
    var hero = document.querySelector('.hero');
    if (!nav || !hero) return;
    if (!hero.classList.contains('on-dark')) return;
    document.body.classList.add('has-hero');
    var root = document.documentElement;
    function measure() { root.style.setProperty('--nav-h', nav.offsetHeight + 'px'); }
    function update() { nav.classList.toggle('is-top', window.scrollY < 8); }
    measure(); update();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('hashchange', update);
  }

  /* ---------- 首屏背景 ---------- */
  function applyHero() {
    var host = document.querySelector('.hero');
    var cfg = D.site && D.site.hero;
    if (!host || !cfg) return;
    if (host.querySelector('.hero-bg')) return;
    var bg = document.createElement('div');
    bg.className = 'hero-bg ' + (cfg.scrim || 'scrim-dark');
    if (cfg.image) {
      var img = document.createElement('img');
      img.src = cfg.image;
      img.alt = '';
      img.setAttribute('fetchpriority', 'high');
      img.setAttribute('decoding', 'async');
      bg.appendChild(img);
    }
    host.insertBefore(bg, host.firstChild);
    host.classList.toggle('on-dark', cfg.ink === 'light');
  }

  /* ---------- 站点信息注入 ---------- */
  function hydrate() {
    if (!D.site) return;
    Array.prototype.forEach.call(document.querySelectorAll('[data-site]'), function (el) {
      var k = el.getAttribute('data-site');
      if (D.site[k] != null) {
        /* 保留行内图标等子元素，只替换文本节点 */
        var tn = null;
        for (var i = 0; i < el.childNodes.length; i++) {
          var nd = el.childNodes[i];
          if (nd.nodeType === 3 && nd.nodeValue.trim()) { tn = nd; break; }
        }
        if (tn) tn.nodeValue = D.site[k];
        else el.textContent = D.site[k];
      }
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-site-href]'), function (el) {
      var k = el.getAttribute('data-site-href');
      if (D.site[k]) el.setAttribute('href', (k === 'email' ? 'mailto:' : '') + D.site[k]);
    });
    var y = q('[data-year]');
    if (y) y.textContent = new Date().getFullYear();
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindTheme();
    initNav();
    applyHero();
    initHeroNav();
    hydrate();
    renderNews(q('#news-list'), 6);
    renderSelected(q('#selected-pubs'), 4);
    renderMembers(q('#members-root'));
    renderPubs(q('#pubs-root'), q('#pub-filters'));
    renderSpecialDays(q('#spd-root'));
    if (typeof window.ML_page === 'function') window.ML_page();
  });
})();
