/* 站点主题开关（浅色 / 深色）
 *
 * - 深色配色复用原「中秋配色」（夜空靛蓝 + 灯笼金），见 assets/css/dark-theme.css
 * - 选择存在 localStorage['xh-theme']（'light' / 'dark'），全站共用；在任意详情页切换同样全局生效
 * - 从未选择过时：中秋节当天默认深色（保留原来的彩蛋），其余时间亮色
 * - 脚本放在 <head> 同步执行，先挂类名再绑定按钮，避免刷新闪一下亮色
 */
(function () {
  var KEY = 'xh-theme';
  var MID_AUTUMN_DATES = ['2026-09-25'];
  var root = document.documentElement;

  /* 按北京时间取当天日期，避免不同时区错峰 */
  function beijingDate(now) {
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit'
      }).format(now);
    } catch (error) {
      return new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
    }
  }

  function readPref() {
    try {
      var v = localStorage.getItem(KEY);
      return (v === 'dark' || v === 'light') ? v : null;
    } catch (error) {
      return null;
    }
  }

  function writePref(v) {
    try { localStorage.setItem(KEY, v); } catch (error) { /* 隐私模式等场景忽略 */ }
  }

  function apply(theme) {
    var dark = theme === 'dark';
    root.classList.toggle('theme-dark', dark);
    document.dispatchEvent(new CustomEvent('xh-theme-change', {
      detail: { theme: dark ? 'dark' : 'light' }
    }));

    /* 让手机浏览器状态栏跟着变色 */
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', dark ? '#0b1026' : '#e6f7f6');

    var btn = document.getElementById('themeToggle');
    if (btn) {
      var label = dark ? '切换为浅色模式' : '切换为深色模式';
      btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
    }
  }

  var pref = readPref();
  if (!pref) {
    pref = MID_AUTUMN_DATES.indexOf(beijingDate(new Date())) !== -1 ? 'dark' : 'light';
  }
  apply(pref);

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    /* 脚本在 <head> 执行时按钮还没解析出来，这里再同步一次按钮文案与 aria 状态 */
    apply(root.classList.contains('theme-dark') ? 'dark' : 'light');
    btn.addEventListener('click', function () {
      var next = root.classList.contains('theme-dark') ? 'light' : 'dark';
      writePref(next);
      apply(next);
    });
  });
})();
