/* 站点主题开关（浅色 / 深色）
 *
 * - 首次访问跟随系统 color-scheme，不固定成浅色
 * - 用户手动选择后保存在 localStorage['xh-theme']
 * - 再次切换回与系统一致的状态时删除存储值，恢复“跟随系统”
 * - 脚本在 <head> 同步执行，先设置主题类再绑定按钮，避免刷新时闪烁
 */
(function () {
  var KEY = 'xh-theme';
  var root = document.documentElement;
  var colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function systemTheme() {
    return colorSchemeQuery.matches ? 'dark' : 'light';
  }

  function readPref() {
    try {
      var value = localStorage.getItem(KEY);
      return value === 'dark' || value === 'light' ? value : null;
    } catch (error) {
      return null;
    }
  }

  function writePref(value) {
    try {
      if (value) localStorage.setItem(KEY, value);
      else localStorage.removeItem(KEY);
    } catch (error) {
      /* 隐私模式等无法持久化的场景仍保留当前会话内的主题切换 */
    }
  }

  function syncColorSchemeMeta(theme) {
    var schemeMeta = document.querySelector('meta[name="color-scheme"]');
    if (schemeMeta) schemeMeta.setAttribute('content', theme);

    var themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.setAttribute('content', theme === 'dark' ? '#0b1026' : '#e6f7f6');
  }

  function apply(theme) {
    var dark = theme === 'dark';
    root.classList.toggle('theme-dark', dark);
    root.classList.toggle('theme-light', !dark);
    syncColorSchemeMeta(theme);

    document.dispatchEvent(new CustomEvent('xh-theme-change', {
      detail: { theme: dark ? 'dark' : 'light' }
    }));

    var button = document.getElementById('themeToggle');
    if (button) {
      var label = dark ? '切换为浅色模式' : '切换为深色模式';
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
    }
  }

  function currentTheme() {
    return readPref() || systemTheme();
  }

  apply(currentTheme());

  document.addEventListener('DOMContentLoaded', function () {
    var button = document.getElementById('themeToggle');
    if (!button) return;

    apply(currentTheme());
    button.addEventListener('click', function () {
      var system = systemTheme();
      var current = root.classList.contains('theme-dark') ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      writePref(next === system ? null : next);
      apply(next);
    });
  });

  function handleSystemChange() {
    if (!readPref()) apply(systemTheme());
  }

  if (colorSchemeQuery.addEventListener) colorSchemeQuery.addEventListener('change', handleSystemChange);
  else colorSchemeQuery.addListener(handleSystemChange);

  window.addEventListener('storage', function (event) {
    if (event.key === KEY) apply(currentTheme());
  });
})();
