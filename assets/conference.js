/* Conference 页面渲染（ICLR 式历届切换） */
(function () {
  var D = window.ML_DATA || {};

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function q(sel, r) { return (r || document).querySelector(sel); }
  function initial(name) { return String(name || '?').trim().slice(0, 1); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- 顶部 ---------- */
  function heroHTML(C, e) {
    return '' +
      '<section class="cf-hero">' +
        '<div class="cf-hero-bg" aria-hidden="true"><span class="cf-ghost">' + esc(e.year) + '</span></div>' +
        '<div class="wrap cf-hero-inner">' +
          '<p class="cf-eyebrow">BIMK · 博士吃喝群 · ' + esc(e.ordinal) + '</p>' +
          '<h1>' + esc(C.short) + '</h1>' +
          '<p class="cf-en">' + esc(C.name_en) + ' · ' + esc(e.ordinal_en) + '</p>' +
          '<p class="cf-meta">' +
            '<span>' + esc(e.date_label) + '</span>' +
            '<span>' + esc(e.venue) + '</span>' +
            '<span>' + esc(e.city) + '</span>' +
            '<span class="cf-state">' + (e.status === 'upcoming' ? '即将举办' : '已举办') + '</span>' +
          '</p>' +
          '<div class="cf-actions">' +
            '<a class="btn btn-primary" href="#cf-body">查看本届</a>' +
            '<a class="btn" href="#cf-past">历届回顾</a>' +
            (e.call ? '<a class="btn" href="#cf-call">组委会增选</a>' : '') +
          '</div>' +
        '</div>' +
      '</section>';
  }

  function tabsHTML(eds, active) {
    return '<div class="cf-tabs-bar"><div class="wrap cf-tabs">' +
      '<span class="cf-tabs-label">选择届次</span>' +
      eds.map(function (e) {
        return '<a class="cf-tab' + (e.year === active ? ' on' : '') + '" href="#' + e.year + '" data-year="' + e.year + '">' +
          '<b>' + e.year + '</b><span>' + esc(e.ordinal) + '</span></a>';
      }).join('') +
    '</div></div>';
  }

  /* ---------- 通用区块 ---------- */
  function sec(n, title, inner, extra) {
    return '<section class="cf-sec">' +
      '<div class="section-head"><h2><span class="num">' + pad(n) + '</span>' + esc(title) + '</h2>' +
      (extra || '') + '</div>' + inner + '</section>';
  }

  function kpiHTML(e) {
    return '<div class="cf-kpis">' +
      '<div class="cf-kpi"><span class="k">届次</span><strong>' + esc(e.ordinal) + '</strong><em>' + esc(e.ordinal_en) + ' Edition</em></div>' +
      '<div class="cf-kpi"><span class="k">日期</span><strong>' + esc(e.date_label.replace(/（.*?）/g, '')) + '</strong><em>平安夜</em></div>' +
      '<div class="cf-kpi"><span class="k">地点</span><strong>' + esc(e.venue) + '</strong><em>' + esc(e.venue_note || '') + '</em></div>' +
      '<div class="cf-kpi"><span class="k">参会</span><strong>' + esc(e.attendance) + '</strong><em>' + esc(e.attendance_note || '') + '</em></div>' +
    '</div>';
  }

  function overviewHTML(C, e, n) {
    var dates = (e.dates || []).map(function (d) {
      return '<div class="cf-date-row"><span class="cf-date-k">' + esc(d.k) + '</span>' +
        '<span class="cf-date-v">' + esc(d.v) + '</span>' +
        (d.note ? '<span class="cf-date-n">' + esc(d.note) + '</span>' : '') + '</div>';
    }).join('');
    return sec(n, '概览',
      '<div class="cf-split">' +
        '<div class="cf-lead"><p>' + esc(e.lead) + '</p>' +
          '<p class="cf-hostnote">主办：' + esc(C.host) + '</p></div>' +
        '<div class="cf-dates">' + dates + '</div>' +
      '</div>');
  }

  function chairsHTML(e, n) {
    if (!e.chairs || !e.chairs.length) return '';
    var cards = e.chairs.map(function (c) {
      return '<div class="cf-chair">' +
        '<span class="cf-avatar" aria-hidden="true">' + esc(initial(c.name)) + '</span>' +
        '<p class="cf-role">' + esc(c.role) + '</p>' +
        '<p class="cf-name">' + esc(c.name) + '</p>' +
        '<ul class="cf-tags">' + (c.meta || []).map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul>' +
      '</div>';
    }).join('');
    var committee = e.committee
      ? '<p class="cf-committee"><span>组委会成员</span>' + e.committee.map(function (x) { return '<em>' + esc(x) + '</em>'; }).join('') + '</p>'
      : '';
    return sec(n, '组委会', '<div class="cf-chairs">' + cards + '</div>' + committee);
  }

  function programHTML(e, n) {
    if (!e.program || !e.program.length) return '';
    var rows = e.program.map(function (p, i) {
      return '<li><span class="cf-prog-n">' + pad(i + 1) + '</span>' +
        '<span class="cf-prog-t">' + esc(p.t) + '</span>' +
        '<span class="cf-prog-d">' + esc(p.d) + '</span></li>';
    }).join('');
    return sec(n, '晚会议程', '<ol class="cf-prog">' + rows + '</ol>');
  }

  function statsHTML(e, n) {
    if (!e.stats || !e.stats.length) return '';
    var blocks = e.stats.map(function (s) {
      var max = Math.max.apply(null, s.rows.map(function (r) { return r[1]; }));
      var bars = s.rows.map(function (r) {
        var w = max ? Math.round(r[1] / max * 100) : 0;
        return '<div class="cf-bar"><span class="cf-bar-k">' + esc(r[0]) + '</span>' +
          '<span class="cf-bar-track"><i style="width:' + w + '%"></i></span>' +
          '<span class="cf-bar-v">' + esc(r[1]) + '</span></div>';
      }).join('');
      return '<div class="cf-stat"><p class="cf-stat-t">' + esc(s.title) + '<em>（' + esc(s.unit) + '）</em></p>' + bars + '</div>';
    }).join('');
    return sec(n, '参会统计', '<div class="cf-stats">' + blocks + '</div>');
  }

  function menuHTML(e, n) {
    if (!e.menu || !e.menu.length) return '';
    var rows = e.menu.map(function (m) {
      return '<div class="cf-menu-row"><dt>' + esc(m.k) + '</dt><dd>' + esc(m.v) + '</dd></div>';
    }).join('');
    return sec(n, '本届菜单', '<dl class="cf-menu">' + rows + '</dl>');
  }

  function photosHTML(list, title, n) {
    if (!list || !list.length) return '';
    var figs = list.map(function (p) {
      return '<figure class="cf-photo"><a href="' + esc(p.src) + '" target="_blank" rel="noopener">' +
        '<img src="' + esc(p.src) + '" alt="' + esc(p.cap) + '" loading="lazy"></a>' +
        '<figcaption>' + esc(p.cap) + '</figcaption></figure>';
    }).join('');
    return sec(n, title, '<div class="cf-photos' + (list.length === 1 ? ' one' : '') + '">' + figs + '</div>');
  }

  function applicantsHTML(e, n) {
    if (!e.applicants || !e.applicants.length) return '';
    var cards = e.applicants.map(function (a) {
      return '<div class="cf-chair">' +
        '<span class="cf-avatar" aria-hidden="true">' + esc(initial(a.name)) + '</span>' +
        '<p class="cf-name">' + esc(a.name) + '</p>' +
        '<ul class="cf-tags">' + (a.meta || []).map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul>' +
      '</div>';
    }).join('');
    return sec(n, '现场增选申请人', '<div class="cf-chairs two">' + cards + '</div>',
      '<span class="cf-note">第三届晚会现场介绍，由组委会讨论投票</span>');
  }

  function goalsHTML(e, n) {
    if (!e.goals || !e.goals.length) return '';
    return sec(n, '本届目标', '<ul class="cf-goals">' + e.goals.map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ul>');
  }

  function callHTML(e, n) {
    if (!e.call) return '';
    var steps = '<ol class="cf-steps">' + e.call.items.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>';
    return '<section class="cf-sec" id="cf-call">' +
      '<div class="section-head"><h2><span class="num">' + pad(n) + '</span>组委会增选</h2></div>' +
      '<div class="cf-call"><p class="cf-call-t">' + esc(e.call.title) + '</p>' +
      '<p>' + esc(e.call.body) + '</p>' + steps + '</div></section>';
  }

  function pastHTML(eds, active, n) {
    var items = eds.map(function (e) {
      return '<a class="cf-past-item' + (e.year === active ? ' on' : '') + '" href="#' + e.year + '" data-year="' + e.year + '">' +
        '<span class="cf-past-y">' + e.year + '</span>' +
        '<span class="cf-past-o">' + esc(e.ordinal) + '</span>' +
        '<span class="cf-past-m">' + esc(e.date_label) + ' · ' + esc(e.venue) + ' · ' + esc(e.attendance) + '</span>' +
        '<span class="cf-past-g">查看 →</span></a>';
    }).join('');
    return '<section class="cf-sec" id="cf-past">' +
      '<div class="section-head"><h2><span class="num">' + pad(n) + '</span>历届回顾</h2></div>' +
      '<div class="cf-past">' + items + '</div></section>';
  }

  /* ---------- 渲染 ---------- */
  function renderEdition(year) {
    var C = D.conference;
    var e = null;
    (C.editions || []).forEach(function (x) { if (x.year === year) e = x; });
    if (!e) return;

    var head = q('#cf-head');
    var body = q('#cf-body');
    if (!head || !body) return;
    head.innerHTML = heroHTML(C, e) + tabsHTML(C.editions, year);

    var n = 0;
    var html = '<p class="cf-intro">' + esc(C.intro) + '</p>' + kpiHTML(e) + overviewHTML(C, e, ++n);
    if (e.chairs && e.chairs.length) html += chairsHTML(e, ++n);
    if (e.program && e.program.length) html += programHTML(e, ++n);
    if (e.stats && e.stats.length) html += statsHTML(e, ++n);
    if (e.menu && e.menu.length) {
      html += menuHTML(e, ++n);
      html += photosHTML(e.photos, '本届场地', ++n);
      html += photosHTML(e.scene, '晚会现场', ++n);
    } else {
      html += photosHTML(e.photos, '现场', ++n);
    }
    if (e.applicants && e.applicants.length) html += applicantsHTML(e, ++n);
    if (e.goals && e.goals.length) html += goalsHTML(e, ++n);
    html += callHTML(e, ++n);
    html += pastHTML(C.editions, year, ++n);
    body.innerHTML = '<div class="wrap">' + html + '</div>';

    Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (a) {
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        var y = parseInt(a.getAttribute('data-year'), 10);
        try { history.replaceState(null, '', '#' + y); } catch (err) { location.hash = String(y); }
        renderEdition(y);
        var bar = q('.cf-tabs-bar');
        if (bar) {
          var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 60;
          var top = bar.getBoundingClientRect().top + window.scrollY - navH;
          window.scrollTo({ top: top, behavior: 'auto' });
        }
      });
    });
  }

  window.ML_page = function () {
    D = window.ML_DATA || {};
    var C = D.conference;
    var head = q('#cf-head');
    if (!C || !head) return;
    var eds = C.editions || [];
    if (!eds.length) return;
    var h = parseInt((location.hash || '').replace('#', ''), 10);
    var ok = eds.some(function (e) { return e.year === h; });
    renderEdition(ok ? h : eds[0].year);
  };

  window.addEventListener('hashchange', function () {
    var h = parseInt((location.hash || '').replace('#', ''), 10);
    var C = (window.ML_DATA || {}).conference;
    if (!h || !C) return;
    if (C.editions.some(function (e) { return e.year === h; })) renderEdition(h);
  });
})();
