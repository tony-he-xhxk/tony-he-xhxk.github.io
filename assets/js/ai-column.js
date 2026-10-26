/* “星河君的AI杂谈”阅读辅助
 * 1. 从正文 h2-h4 自动生成层级目录、滚动高亮和锚点跳转
 * 2. 在移动端收起标题目录，桌面端保持两侧目录展开
 * 3. 初始化 giscus，并让评论组件跟随站点深浅色主题
 */
(function () {
  'use strict';

  var content = document.getElementById('aiArticleContent');
  var tocList = document.getElementById('aiTocList');
  var tocEmpty = document.getElementById('aiTocEmpty');
  var tocPanel = document.getElementById('aiTocPanel');
  var tocSidebar = document.querySelector('.ai-column-sidebar-right');
  var columnPanel = document.querySelector('.ai-column-sidebar-left .ai-panel');
  var headings = content ? Array.prototype.slice.call(content.querySelectorAll('h2, h3, h4')) : [];
  var tocLinks = [];

  function slugFor(text, index) {
    var slug = text.trim().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\p{L}\p{N}\-]+/gu, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return 'section-' + (index + 1) + (slug ? '-' + slug : '');
  }

  function buildToc() {
    if (!tocList) return;

    if (!headings.length) {
      if (tocEmpty) tocEmpty.hidden = false;
      return;
    }

    var root = tocList;
    var stack = [{ level: 1, list: root }];

    headings.forEach(function (heading, index) {
      var level = Number(heading.tagName.slice(1));
      if (!heading.id) heading.id = slugFor(heading.textContent, index);

      while (stack.length > 1 && level <= stack[stack.length - 1].level) stack.pop();

      var parent = stack[stack.length - 1];
      var item = document.createElement('li');
      var link = document.createElement('a');
      link.className = 'ai-toc-link';
      link.href = '#' + heading.id;
      link.dataset.headingId = heading.id;
      link.textContent = heading.textContent;
      item.appendChild(link);
      parent.list.appendChild(item);
      tocLinks.push(link);

      if (level > parent.level) {
        var nested = document.createElement('ol');
        nested.className = 'ai-toc-list';
        item.appendChild(nested);
        stack.push({ level: level, list: nested });
      }
    });

    tocLinks.forEach(function (link) {
      link.addEventListener('click', function (event) {
        if (!tocSidebar || !window.matchMedia('(max-width: 1099px)').matches) return;

        var target = document.getElementById(link.dataset.headingId);
        if (!target) return;

        event.preventDefault();
        var panelBottom = tocSidebar.getBoundingClientRect().bottom;
        var targetTop = window.scrollY + target.getBoundingClientRect().top - panelBottom - 16;
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: reducedMotion ? 'auto' : 'smooth'
        });
        history.pushState(null, '', '#' + target.id);
      });
    });

    if (tocEmpty) tocEmpty.hidden = true;
  }

  function updateActiveHeading() {
    if (!headings.length || !tocLinks.length) return;

    var current = headings[0];
    var tocRect = tocSidebar ? tocSidebar.getBoundingClientRect() : null;
    var tocIsStuck = tocRect && tocRect.top <= 71;
    var threshold = tocIsStuck ? tocRect.bottom + 24 : 130;
    headings.forEach(function (heading) {
      if (heading.getBoundingClientRect().top <= threshold) current = heading;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      current = headings[headings.length - 1];
    }

    tocLinks.forEach(function (link) {
      var active = link.dataset.headingId === current.id;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function syncPanels() {
    var desktop = window.matchMedia('(min-width: 1100px)').matches;
    if (desktop) {
      if (columnPanel) columnPanel.open = true;
      if (tocPanel) tocPanel.open = true;
    }
  }

  function currentTheme() {
    return document.documentElement.classList.contains('theme-dark') ? 'dark' : 'light';
  }

  function initGiscus() {
    var mount = document.getElementById('giscusMount');
    if (!mount) return;

    var script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-repo', mount.dataset.repo);
    script.setAttribute('data-repo-id', mount.dataset.repoId);
    script.setAttribute('data-category', mount.dataset.category);
    script.setAttribute('data-category-id', mount.dataset.categoryId);
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', currentTheme());
    script.setAttribute('data-lang', 'zh-CN');
    script.setAttribute('data-loading', 'lazy');
    mount.appendChild(script);

    new MutationObserver(syncGiscusTheme).observe(mount, {
      childList: true,
      subtree: true
    });
  }

  function syncGiscusTheme() {
    var frame = document.querySelector('iframe.giscus-frame');
    if (!frame) return;
    frame.contentWindow.postMessage({
      giscus: { setConfig: { theme: currentTheme() } }
    }, 'https://giscus.app');
  }

  buildToc();
  syncPanels();
  initGiscus();

  window.addEventListener('resize', function () {
    syncPanels();
  }, { passive: true });

  if (headings.length) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        updateActiveHeading();
        ticking = false;
      });
    }, { passive: true });
    updateActiveHeading();
  }

  document.addEventListener('xh-theme-change', function (event) {
    if (event.detail && event.detail.theme) syncGiscusTheme();
  });
})();
