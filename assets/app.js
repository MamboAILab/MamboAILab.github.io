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
      var html = '<div class="dd-label">按学期浏览</div>';
      D.special_days.years.forEach(function (y) {
        (y.terms || []).forEach(function (t) {
          html += '<a class="dd-sub" href="special-days.html?y=' + y.year + '&t=' + t.id + '">' +
            y.year + ' · ' + esc(t.name) + '</a>';
        });
      });
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
  function dayStatus(item) {
    if (!item.date) return { kind: 'tbd', label: '日期待定' };
    var d = new Date(item.date + 'T00:00:00+08:00');
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var diff = Math.round((d - today) / 86400000);
    if (isNaN(diff)) return { kind: 'tbd', label: '日期待定' };
    if (diff > 1) return { kind: 'soon', label: '还有 ' + diff + ' 天' };
    if (diff === 1) return { kind: 'soon', label: '明天' };
    if (diff === 0) return { kind: 'soon', label: '就是今天' };
    return { kind: 'done', label: '已举办' };
  }

  function renderSpecialDays(root) {
    if (!root || !D.special_days) return;
    var data = D.special_days;
    var params = new URLSearchParams(location.search);
    var years = data.years || [];
    if (!years.length) { root.innerHTML = '<p class="empty">暂无记录。</p>'; return; }

    var curYear = params.get('y') || String(years[years.length - 1].year);
    var yObj = years.filter(function (y) { return String(y.year) === curYear; })[0] || years[years.length - 1];
    var curTerm = params.get('t') || (yObj.terms[0] && yObj.terms[0].id);
    var tObj = (yObj.terms || []).filter(function (t) { return t.id === curTerm; })[0] || yObj.terms[0];

    var tabs = q('#spd-years');
    if (tabs) {
      tabs.innerHTML = years.map(function (y) {
        return '<button class="tab' + (String(y.year) === curYear ? ' on' : '') + '" data-y="' + y.year + '">' + y.year + '</button>';
      }).join('');
      tabs.addEventListener('click', function (e) {
        var b = e.target.closest('.tab'); if (!b) return;
        location.search = '?y=' + b.getAttribute('data-y') + '&t=' + curTerm;
      });
    }
    var ttabs = q('#spd-terms');
    if (ttabs) {
      ttabs.innerHTML = (yObj.terms || []).map(function (t) {
        return '<button class="tab' + (t.id === curTerm ? ' on' : '') + '" data-t="' + t.id + '">' + esc(t.name) + '</button>';
      }).join('');
      ttabs.addEventListener('click', function (e) {
        var b = e.target.closest('.tab'); if (!b) return;
        location.search = '?y=' + curYear + '&t=' + b.getAttribute('data-t');
      });
    }

    var items = (tObj && tObj.items) || [];
    var grid = q('#spd-grid');
    if (!grid) return;
    if (!items.length) { grid.innerHTML = '<p class="empty">这一学期还没有记录。</p>'; return; }
    grid.innerHTML = items.map(function (it) {
      var st = dayStatus(it);
      var badge = '<span class="badge badge-' + st.kind + '">' + st.label + '</span>';
      var when = it.date
        ? it.date.replace(/-/g, '.') + (it.time ? '　' + esc(it.time) : '')
        : (it.time ? esc(it.time) : '时间待定');
      var theme = it.theme ? '<p class="spd-theme">' + esc(it.theme) + '</p>' : '';
      var place = it.place ? '<p class="spd-place">' + esc(it.place) + '</p>' : '';
      var photos = (it.photos || []).filter(Boolean);
      var cover = photos.length
        ? '<div class="spd-cover"><img src="' + esc(photos[0]) + '" alt="' + esc(it.name) + '"></div>'
        : '<div class="spd-cover">' + (st.kind === 'done' ? '照片待补充' : '敬请期待') + '</div>';
      var thumbs = photos.length > 1
        ? '<div class="spd-photos">' + photos.slice(1, 7).map(function (p) {
            return '<a href="' + esc(p) + '" target="_blank" rel="noopener"><img src="' + esc(p) + '" alt=""></a>';
          }).join('') + '</div>'
        : '';
      return '<article class="spd">' + cover + '<div class="spd-body">' +
        '<div class="spd-top"><h3>' + esc(it.name) + '</h3>' + badge + '</div>' +
        theme +
        '<p class="when">' + when + '</p>' +
        place +
        (it.note ? '<p class="note">' + esc(it.note) + '</p>' : '') +
        thumbs + '</div></article>';
    }).join('');
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
