/* 图片放大查看：使用原生模态 <dialog> 管理焦点、Esc、背景与顶部层级 */
(function () {
  var nodes = Array.prototype.slice.call(
    document.querySelectorAll('.post-gallery .gallery-item img, .post-content img')
  );
  if (!nodes.length) return;

  var items = nodes.map(function (image) {
    var link = image.closest('.gallery-item');
    return {
      src: (link && link.getAttribute('href')) || image.currentSrc || image.src,
      alt: image.getAttribute('alt') || ''
    };
  });

  var dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.id = 'lightbox';
  dialog.setAttribute('closedby', 'any');
  dialog.setAttribute('aria-labelledby', 'lbTitle');
  dialog.setAttribute('aria-describedby', 'lbCount');
  dialog.innerHTML =
    '<form method="dialog" class="lb-panel">' +
      '<button class="lb-btn lb-close" value="close" aria-label="关闭图片查看器">✕</button>' +
      '<h2 class="visually-hidden" id="lbTitle">图片查看</h2>' +
      '<button class="lb-btn lb-prev" type="button" aria-label="上一张图片">‹</button>' +
      '<img class="lb-image" alt="">' +
      '<button class="lb-btn lb-next" type="button" aria-label="下一张图片">›</button>' +
      '<p class="lb-status" role="status" aria-live="polite"></p>' +
      '<p class="lb-count" id="lbCount" aria-live="polite"></p>' +
    '</form>';
  document.body.appendChild(dialog);

  var imageElement = dialog.querySelector('.lb-image');
  var statusElement = dialog.querySelector('.lb-status');
  var countElement = dialog.querySelector('.lb-count');
  var prevButton = dialog.querySelector('.lb-prev');
  var nextButton = dialog.querySelector('.lb-next');
  var index = 0;

  function preload(i) {
    if (items.length < 2) return;
    var item = items[(i + items.length) % items.length];
    var preloadImage = new Image();
    preloadImage.src = item.src;
  }

  function show(i) {
    index = (i + items.length) % items.length;
    var item = items[index];
    imageElement.hidden = true;
    statusElement.textContent = '加载中…';
    imageElement.alt = item.alt || ('第 ' + (index + 1) + ' 张图片');
    imageElement.src = item.src;
    countElement.textContent = '第 ' + (index + 1) + ' 张，共 ' + items.length + ' 张';
    var many = items.length > 1;
    prevButton.hidden = !many;
    nextButton.hidden = !many;
    preload(index - 1);
    preload(index + 1);
  }

  imageElement.addEventListener('load', function () {
    imageElement.hidden = false;
    statusElement.textContent = '';
  });
  imageElement.addEventListener('error', function () {
    imageElement.hidden = true;
    statusElement.textContent = '这张图没能加载出来，可以继续查看下一张。';
  });

  nodes.forEach(function (image, i) {
    var galleryLink = image.closest('.gallery-item');
    var target = galleryLink || image;
    target.addEventListener('click', function (event) {
      event.preventDefault();
      show(i);
      dialog.showModal();
    });

    if (!galleryLink) {
      target.setAttribute('tabindex', '0');
      target.setAttribute('role', 'button');
      target.setAttribute('aria-label', '放大图片：' + (image.getAttribute('alt') || '第 ' + (i + 1) + ' 张'));
      target.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          show(i);
          dialog.showModal();
        }
      });
    }
  });

  prevButton.addEventListener('click', function () { show(index - 1); });
  nextButton.addEventListener('click', function () { show(index + 1); });

  dialog.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      show(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + 1);
    }
  });

  dialog.addEventListener('close', function () {
    statusElement.textContent = '';
    imageElement.removeAttribute('src');
    dialog.returnValue = '';
  });

  var startX = null;
  dialog.addEventListener('touchstart', function (event) {
    startX = event.touches[0].clientX;
  }, { passive: true });
  dialog.addEventListener('touchend', function (event) {
    if (startX === null) return;
    var delta = event.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(delta) >= 40) show(delta > 0 ? index - 1 : index + 1);
  }, { passive: true });
})();
