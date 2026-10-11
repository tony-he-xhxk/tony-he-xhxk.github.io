/* 图片放大查看
 *
 * - 覆盖范围：帖子详情页的画廊（.post-gallery）+ 正文里的所有插图（.post-content img，
 *   包含「专栏正文」里内嵌的截图），按页面顺序连成一条，可左右切换、循环浏览
 * - 没有 JS 时，画廊里原有的 <a href> 仍然照旧在新标签页打开原图
 * - 支持：左右按钮、键盘 ← → Esc、点背景关闭、手机左右滑动
 * - 切换时先清空画面再加载（避免"编号已变、画面还是上一张"）；打开时预加载整组图片
 */
(function () {
  var nodes = Array.prototype.slice.call(
    document.querySelectorAll('.post-gallery .gallery-item img, .post-content img')
  );
  if (!nodes.length) return;

  var items = nodes.map(function (img) {
    var link = img.closest ? img.closest('.gallery-item') : null;
    return {
      src: (link && link.getAttribute('href')) || img.currentSrc || img.src,
      alt: img.getAttribute('alt') || ''
    };
  });

  var box = document.createElement('div');
  box.className = 'lightbox';
  box.id = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', '图片查看');
  box.hidden = true;
  box.innerHTML =
    '<img class="lb-img" alt="">' +
    '<p class="lb-status" role="status" aria-live="polite"></p>' +
    '<button type="button" class="lb-btn lb-prev" aria-label="上一张">‹</button>' +
    '<button type="button" class="lb-btn lb-next" aria-label="下一张">›</button>' +
    '<button type="button" class="lb-btn lb-close" aria-label="关闭">✕</button>' +
    '<p class="lb-count"></p>';
  document.body.appendChild(box);

  var imgEl = box.querySelector('.lb-img');
  var statusEl = box.querySelector('.lb-status');
  var prevBtn = box.querySelector('.lb-prev');
  var nextBtn = box.querySelector('.lb-next');
  var closeBtn = box.querySelector('.lb-close');
  var countEl = box.querySelector('.lb-count');
  var index = 0;
  var lastFocus = null;
  var preloaded = false;

  /* 打开查看器时把整组图片一次性预加载，避免翻到一半还在等图 */
  function preloadAll() {
    if (preloaded) return;
    preloaded = true;
    items.forEach(function (it) {
      var im = new Image();
      im.src = it.src;
    });
  }

  imgEl.addEventListener('load', function () {
    if (!imgEl.getAttribute('src')) return;
    imgEl.hidden = false;
    statusEl.textContent = '';
  });
  imgEl.addEventListener('error', function () {
    /* 关闭时清空 src 也会触发 error，这里忽略 */
    if (!imgEl.getAttribute('src')) return;
    imgEl.hidden = true;
    statusEl.textContent = '这张图没能加载出来（可以继续看下一张）';
  });

  function show(i) {
    index = (i + items.length) % items.length;
    var it = items[index];
    /* 先清空画面并进入"加载中"，加载完成后才显示，保证编号与画面始终一致 */
    imgEl.hidden = true;
    statusEl.textContent = '加载中…';
    imgEl.alt = it.alt || ('第 ' + (index + 1) + ' 张图片');
    imgEl.src = it.src;
    countEl.textContent = (index + 1) + ' / ' + items.length;
    var many = items.length > 1;
    prevBtn.hidden = !many;
    nextBtn.hidden = !many;
  }

  function open(i) {
    lastFocus = document.activeElement;
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    preloadAll();
    show(i);
    closeBtn.focus();
  }

  function close() {
    box.hidden = true;
    document.body.style.overflow = '';
    statusEl.textContent = '';
    imgEl.removeAttribute('src');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  nodes.forEach(function (img, i) {
    var target = img.closest ? (img.closest('.gallery-item') || img) : img;
    target.addEventListener('click', function (e) {
      e.preventDefault();
      open(i);
    });
    /* 键盘可达：聚焦后按 Enter / 空格打开 */
    target.setAttribute('tabindex', '0');
    target.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });

  prevBtn.addEventListener('click', function () { show(index - 1); });
  nextBtn.addEventListener('click', function () { show(index + 1); });
  closeBtn.addEventListener('click', close);

  /* 点背景关闭（点图片本身不关） */
  box.addEventListener('click', function (e) {
    if (e.target === box) close();
  });

  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') { close(); }
    else if (e.key === 'ArrowLeft') { show(index - 1); }
    else if (e.key === 'ArrowRight') { show(index + 1); }
  });

  /* 手机左右滑动切换 */
  var startX = null;
  box.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
  }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var delta = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(delta) < 40) return;
    show(delta > 0 ? index - 1 : index + 1);
  }, { passive: true });
})();
