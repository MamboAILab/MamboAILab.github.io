/* 数据新鲜度守卫
 * GitHub Pages 给所有文件都设了 cache-control: max-age=600，
 * 浏览器和 CDN 都会把 data/*.js 缓存 10 分钟，
 * 结果就是后台改完、提交成功，前台刷新还是旧内容。
 * 这里把当前页面已经引用的 data/*.js 用 no-store + 时间戳再取一次，
 * 取到后重新执行，让 window.ML_DATA 变成线上最新的一份。
 */
(function () {
  var files = [];
  Array.prototype.forEach.call(document.querySelectorAll('script[src^="data/"]'), function (s) {
    var u = s.getAttribute('src');
    if (u && files.indexOf(u) < 0) files.push(u);
  });
  if (!files.length) { window.ML_REFRESH = Promise.resolve(false); return; }

  var stamp = Date.now();
  function grab(u) {
    return fetch(u + (u.indexOf('?') >= 0 ? '&' : '?') + '_=' + stamp, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.text() : ''; })
      .then(function (txt) {
        if (!txt) return false;
        try { new Function(txt)(); return true; } catch (e) { return false; }
      })
      .catch(function () { return false; });
  }
  window.ML_REFRESH = Promise.all(files.map(grab)).then(function (res) {
    return res.indexOf(true) >= 0;
  });
})();
