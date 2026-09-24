/* 中秋节临时配色开关
 *
 * 只在 MID_AUTUMN_DATES 列出的日期（北京时间 UTC+8）当天，给 <html> 挂上
 * .theme-midautumn，由 assets/css/midautumn-theme.css 提供中秋配色。
 * 其它日子不加类名，站点自动使用原来的薄荷配色 —— 26 日 0 点后无需任何操作。
 * 想在将来某年再次启用，把日期按 YYYY-MM-DD 追加到下面的数组即可。
 */
(function () {
  var MID_AUTUMN_DATES = ['2026-09-25'];

  // 按北京时间取当天日期，避免不同时区访问者错峰看到（或看不到）配色
  function beijingDateString(now) {
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(now);
    } catch (error) {
      var shifted = new Date(now.getTime() + 8 * 60 * 60 * 1000);
      return shifted.toISOString().slice(0, 10);
    }
  }

  var today = beijingDateString(new Date());
  if (MID_AUTUMN_DATES.indexOf(today) === -1) return;

  document.documentElement.classList.add('theme-midautumn');

  // 让手机浏览器的状态栏也跟着变成夜空色
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', '#0b1026');
})();
