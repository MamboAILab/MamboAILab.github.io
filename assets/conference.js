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
  /* 倒计时唯一目标时刻：数据里写 ISO（含 +08:00），不在代码里另存时间戳 */
  var CD_TIMER = null;

  function cdParts(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    return {
      d: Math.floor(s / 86400),
      h: Math.floor(s % 86400 / 3600),
      m: Math.floor(s % 3600 / 60),
      s: s % 60
    };
  }
  function p2(n) { return (n < 10 ? '0' : '') + n; }

  function tickCountdown() {
    var host = q('#cf-cd');
    if (!host) { if (CD_TIMER) { clearInterval(CD_TIMER); CD_TIMER = null; } return; }
    var target = Date.parse(host.getAttribute('data-target') || '');
    if (isNaN(target)) return;
    var left = target - Date.now();
    var digits = q('.cf-cd-digits', host);
    var done = q('.cf-cd-done', host);
    if (left <= 0) {
      if (digits) digits.hidden = true;
      if (done) done.hidden = false;
      if (CD_TIMER) { clearInterval(CD_TIMER); CD_TIMER = null; }
      return;
    }
    var p = cdParts(left);
    var cells = host.querySelectorAll('.cf-cd-u b');
    var vals = [String(p.d), p2(p.h), p2(p.m), p2(p.s)];
    for (var i = 0; i < cells.length && i < 4; i++) {
      if (cells[i].textContent !== vals[i]) cells[i].textContent = vals[i];
    }
    var note = q('.cf-cd-left', host);
    if (note) note.textContent = '距开席还有 ' + p.d + ' 天 ' + p2(p.h) + ' 小时 ' + p2(p.m) + ' 分';
  }

  function countdownHTML(e) {
    if (!e.start_at || e.status !== 'upcoming') return '';
    var t = new Date(e.start_at);
    if (isNaN(t.getTime())) return '';
    return '<div class="cf-cd" id="cf-cd" data-target="' + esc(e.start_at) + '" role="timer" aria-live="off">' +
      '<div class="cf-cd-head"><span class="cf-cd-tag">Countdown</span>' +
        '<span class="cf-cd-to">距 ' + esc(e.ordinal) + '开席</span></div>' +
      '<div class="cf-cd-digits">' +
        ['天', '时', '分', '秒'].map(function (u, i) {
          return '<div class="cf-cd-u"><b>' + (i ? '00' : '0') + '</b><span>' + u + '</span></div>';
        }).join('<span class="cf-cd-sep" aria-hidden="true">:</span>') +
      '</div>' +
      '<p class="cf-cd-time">' + esc(e.start_label || '') + '<span class="cf-cd-tz">（北京时间 UTC+8）</span></p>' +
      '<p class="cf-cd-left"></p>' +
      '<p class="cf-cd-done" hidden>第四届已经开席 —— 平安夜快乐！</p>' +
    '</div>';
  }

  function heroHTML(C, e) {
    var theme = e.theme || String(e.year);
    return '' +
      '<section class="cf-hero cf-y' + esc(theme) + '">' +
        '<div class="cf-hero-bg" aria-hidden="true">' +
          (e.bg ? '<img src="' + esc(e.bg) + '" alt="">' : '') +
          '<span class="cf-ghost">' + esc(e.year) + '</span>' +
        '</div>' +
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
          countdownHTML(e) +
          '<div class="cf-actions">' +
            '<a class="btn btn-primary" href="#cf-body">查看本届</a>' +
            '<a class="btn" href="#cf-past">历届回顾</a>' +
            (e.call ? '<a class="btn" href="#cf-call">组委会增选</a>' : '') +
          '</div>' +
        '</div>' +
      '</section>';
  }

  /* 届次切换：吸顶条上一个下拉，点开是历届列表（带年份 / 届次 / 场地） */
  function tabsHTML(eds, active) {
    var cur = null;
    eds.forEach(function (e) { if (e.year === active) cur = e; });
    if (!cur) cur = eds[0];
    return '<div class="cf-tabs-bar"><div class="wrap cf-tabs">' +
      '<span class="cf-tabs-label">选择届次</span>' +
      '<div class="cf-year" id="cf-year">' +
        '<button type="button" class="cf-year-btn" id="cf-year-btn" aria-haspopup="listbox" aria-expanded="false">' +
          '<span class="cf-year-cur"><b>' + cur.year + '</b><span>' + esc(cur.ordinal) +
            (cur.status === 'upcoming' ? ' · 即将举办' : '') + '</span></span>' +
          '<span class="cf-year-caret" aria-hidden="true"></span>' +
        '</button>' +
        '<ul class="cf-year-menu" id="cf-year-menu" role="listbox" aria-label="历届晚会" hidden>' +
          eds.map(function (e) {
            return '<li><button type="button" role="option" data-year="' + e.year + '"' +
              ' aria-selected="' + (e.year === active ? 'true' : 'false') + '"' +
              ' class="cf-year-opt' + (e.year === active ? ' on' : '') + '">' +
              '<b>' + e.year + '</b>' +
              '<span class="cf-year-o">' + esc(e.ordinal) + '</span>' +
              '<span class="cf-year-m">' + esc(e.date_label.replace(/（.*?）/g, '')) + ' · ' + esc(e.venue) + '</span>' +
              '<span class="cf-year-s">' + (e.status === 'upcoming' ? '即将举办' : esc(e.attendance)) + '</span>' +
            '</button></li>';
          }).join('') +
        '</ul>' +
      '</div>' +
      '<span class="cf-tabs-hint">' + esc(cur.ordinal) + ' · ' + esc(cur.venue) + ' · ' + esc(cur.attendance) + '</span>' +
    '</div></div>';
  }

  function bindYearPicker() {
    var box = q('#cf-year');
    var btn = q('#cf-year-btn');
    var menu = q('#cf-year-menu');
    if (!box || !btn || !menu) return;
    function setOpen(v) {
      menu.hidden = !v;
      btn.setAttribute('aria-expanded', v ? 'true' : 'false');
      box.classList.toggle('open', v);
    }
    btn.addEventListener('click', function (ev) {
      ev.stopPropagation();
      setOpen(menu.hidden);
    });
    document.addEventListener('click', function (ev) {
      if (!box.contains(ev.target)) setOpen(false);
    });
    box.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { setOpen(false); btn.focus(); }
    });
    Array.prototype.forEach.call(menu.querySelectorAll('[data-year]'), function (opt) {
      opt.addEventListener('click', function () {
        setOpen(false);
        goEdition(parseInt(opt.getAttribute('data-year'), 10));
      });
    });
  }

  function goEdition(y) {
    if (!y) return;
    try { history.replaceState(null, '', '#' + y); } catch (err) { location.hash = String(y); }
    renderEdition(y);
    var bar = q('.cf-tabs-bar');
    if (bar) {
      var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 60;
      var top = bar.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: top, behavior: 'auto' });
    }
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

  /* 人像放卡片右侧：方形相框 + 完整显示（不裁切），姓名与介绍在左侧 */
  function avatarHTML(name, src) {
    if (src) {
      return '<span class="cf-portrait"><img src="' + esc(src) + '" alt="' + esc(name) + '" loading="lazy"></span>';
    }
    return '<span class="cf-portrait is-mono" aria-hidden="true">' + esc(initial(name)) + '</span>';
  }

  function personCard(c, roleText) {
    return '<div class="cf-chair">' +
      '<div class="cf-chair-info">' +
        (roleText ? '<p class="cf-role">' + esc(roleText) + '</p>' : '') +
        '<p class="cf-name">' + esc(c.name) + '</p>' +
        '<ul class="cf-tags">' + (c.meta || []).map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul>' +
      '</div>' +
      avatarHTML(c.name, c.photo) +
    '</div>';
  }

  function committeeHTML(list) {
    if (!list || !list.length) return '';
    return '<div class="cf-comm"><h3 class="cf-comm-t">组委会成员<span>Committee Members</span></h3>' +
      '<p class="cf-committee">' + list.map(function (x) { return '<em>' + esc(x) + '</em>'; }).join('') + '</p></div>';
  }

  function chairsHTML(e, n) {
    var groups = e.chair_groups;
    var inner = '';
    if (groups && groups.length) {
      inner = groups.map(function (g) {
        var cards = (g.members || []).map(function (c) { return personCard(c, ''); }).join('');
        return '<div class="cf-cgroup">' +
          '<div class="cf-cgroup-head"><h3>' + esc(g.title) + '</h3><span>' + esc(g.en || '') + '</span></div>' +
          '<div class="cf-chairs">' + cards + '</div></div>';
      }).join('');
    } else if (e.chairs && e.chairs.length) {
      inner = '<div class="cf-chairs">' + e.chairs.map(function (c) { return personCard(c, c.role); }).join('') + '</div>';
    } else {
      return '';
    }
    inner += committeeHTML(e.committee);
    return sec(n, '组委会', inner);
  }

  function programHTML(e, n) {
    if (!e.program || !e.program.length) return '';
    var rows = e.program.map(function (p, i) {
      var award = /award/i.test(p.en || '');
      return '<li' + (award ? ' class="is-award"' : '') + '><span class="cf-prog-n">' + pad(i + 1) + '</span>' +
        '<span class="cf-prog-t">' + esc(p.t) + (p.en ? '<em class="cf-prog-en">' + esc(p.en) + '</em>' : '') + '</span>' +
        '<span class="cf-prog-d">' + esc(p.d) + '</span></li>';
    }).join('');
    return sec(n, '晚会议程', '<ol class="cf-prog">' + rows + '</ol>');
  }

  var DIAMOND_SVG = '<svg class="cf-diamond" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M12 2.6 21 8.4 12 21.4 3 8.4Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>' +
    '<path d="M3 8.4h18M12 2.6 7.6 8.4 12 21.4 16.4 8.4 12 2.6M7.6 8.4 5.6 4.4M16.4 8.4l2-4" stroke="currentColor" stroke-width="1" stroke-linejoin="round" opacity=".65"/></svg>';

  /* 赞助商：钻石 4 席。数据里每个席位可填
     name / name_en / role / photo / bio / bio_en / url / thanks（赞助内容）。
     简介默认收起，点「简介 / Bio」展开；没有照片的用姓名字标。 */
  function sponsorCard(s) {
    if (!s || !s.name) {
      return '<div class="cf-sp is-open">' +
        '<span class="cf-sp-badge" aria-hidden="true">' + DIAMOND_SVG + '</span>' +
        '<p class="cf-sp-name">钻石赞助商 · 席位 ' + esc((s && s.seat) || '') + '</p>' +
        '<p class="cf-sp-note">待定</p></div>';
    }
    var id = 'cf-sp-bio-' + esc(s.seat || Math.random().toString(36).slice(2, 8));
    var media = s.photo
      ? '<img class="cf-sp-photo" src="' + esc(s.photo) + '" alt="' + esc(s.name) + '" loading="lazy">'
      : '<span class="cf-sp-mono" aria-hidden="true">' + esc(initial(s.name)) + '</span>';
    var links = '';
    if (s.url) links += '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">主页</a>';
    var bio = (s.bio || s.bio_en)
      ? '<button type="button" class="cf-sp-toggle" data-bio="' + id + '" aria-expanded="false" aria-controls="' + id + '">简介 / Bio<span class="cf-sp-caret" aria-hidden="true"></span></button>' +
        '<div class="cf-sp-bio" id="' + id + '" hidden>' +
          (s.bio ? '<p>' + esc(s.bio) + '</p>' : '') +
          (s.bio_en ? '<p class="cf-sp-bio-en" lang="en">' + esc(s.bio_en) + '</p>' : '') +
        '</div>'
      : '';
    return '<article class="cf-sp filled">' +
      '<div class="cf-sp-top">' + media +
        '<p class="cf-sp-seat">' + DIAMOND_SVG + 'Diamond · ' + esc(s.seat || '') + '</p></div>' +
      '<p class="cf-sp-name">' + esc(s.name) + (s.name_en ? '<span class="cf-sp-name-en">' + esc(s.name_en) + '</span>' : '') + '</p>' +
      (s.role ? '<p class="cf-sp-role">' + esc(s.role) + '</p>' : '') +
      (s.thanks ? '<p class="cf-sp-thanks">' + esc(s.thanks) + '</p>' : '') +
      (links ? '<p class="cf-sp-links">' + links + '</p>' : '') +
      bio +
    '</article>';
  }

  function sponsorsHTML(e, n) {
    var sp = e.sponsors;
    if (!sp || !sp.tiers || !sp.tiers.length) return '';
    var tiers = sp.tiers.map(function (t) {
      var slots = t.slots || [];
      var cards = slots.map(sponsorCard).join('');
      return '<div class="cf-sp-tier">' +
        '<div class="cf-sp-tier-head"><h3>' + DIAMOND_SVG + esc(t.title) + '</h3><span>' + esc(t.en || '') + '</span></div>' +
        '<div class="cf-sp-grid">' + cards + '</div></div>';
    }).join('');
    return '<section class="cf-sec" id="cf-sponsors">' +
      '<div class="section-head"><h2><span class="num">' + pad(n) + '</span>赞助商</h2>' +
      '<span class="cf-note">' + esc(sp.note || '') + '</span></div>' + tiers + '</section>';
  }

  function bindSponsors(scope) {
    Array.prototype.forEach.call(scope.querySelectorAll('.cf-sp-toggle'), function (btn) {
      btn.addEventListener('click', function () {
        var box = document.getElementById(btn.getAttribute('data-bio'));
        if (!box) return;
        var open = box.hidden;
        box.hidden = !open;
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.classList.toggle('open', open);
      });
    });
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
    var cards = e.applicants.map(function (a) { return personCard(a, ''); }).join('');
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
    if ((e.chair_groups && e.chair_groups.length) || (e.chairs && e.chairs.length)) html += chairsHTML(e, ++n);
    if (e.program && e.program.length) html += programHTML(e, ++n);
    if (e.stats && e.stats.length) html += statsHTML(e, ++n);
    if (e.menu && e.menu.length) {
      html += menuHTML(e, ++n);
      if (e.photos && e.photos.length) html += photosHTML(e.photos, '本届场地', ++n);
      if (e.scene && e.scene.length) html += photosHTML(e.scene, '晚会现场', ++n);
    } else if (e.photos && e.photos.length) {
      html += photosHTML(e.photos, '现场', ++n);
    }
    if (e.applicants && e.applicants.length) html += applicantsHTML(e, ++n);
    if (e.goals && e.goals.length) html += goalsHTML(e, ++n);
    if (e.call) html += callHTML(e, ++n);
    /* 赞助商放在页面最下方，历届回顾之后 */
    html += pastHTML(C.editions, year, ++n);
    if (e.sponsors) html += sponsorsHTML(e, ++n);
    body.innerHTML = '<div class="wrap">' + html + '</div>';

    bindYearPicker();
    bindSponsors(body);
    Array.prototype.forEach.call(body.querySelectorAll('[data-year]'), function (a) {
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        goEdition(parseInt(a.getAttribute('data-year'), 10));
      });
    });

    /* 倒计时：先立即算一次，避免首帧显示 00:00:00；切到往届自动停表 */
    if (CD_TIMER) { clearInterval(CD_TIMER); CD_TIMER = null; }
    tickCountdown();
    if (q('#cf-cd')) CD_TIMER = setInterval(tickCountdown, 1000);
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
