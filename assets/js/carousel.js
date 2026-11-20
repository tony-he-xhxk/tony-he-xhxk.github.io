/* 项目卡片轮播：自动播放 + 可见暂停控制 + 键盘/悬停暂停 + 触屏滑动 */
(function () {
  var region = document.querySelector('.carousel-region');
  var track = document.getElementById('projectsTrack');
  var dotsWrap = document.getElementById('projectsDots');
  var pauseButton = document.getElementById('projectsPause');
  var status = document.getElementById('projectsStatus');
  if (!region || !track || !dotsWrap || !pauseButton || track.children.length === 0) return;

  var slides = Array.prototype.slice.call(track.children);
  var index = 0;
  var timer = null;
  var delay = 4000;
  var hovering = false;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var userPaused = reduceMotion.matches;

  slides.forEach(function (slide, i) {
    slide.setAttribute('aria-label', '第 ' + (i + 1) + ' 个，共 ' + slides.length + ' 个');
  });

  var dots = slides.map(function (_, i) {
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'dot';
    dot.setAttribute('aria-label', '转到第 ' + (i + 1) + ' 个项目');
    dot.setAttribute('aria-current', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', function () {
      goTo(i, true);
      start();
    });
    dotsWrap.appendChild(dot);
    return dot;
  });

  function goTo(nextIndex, announce) {
    index = (nextIndex + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + index * 100 + '%)';
    dots.forEach(function (dot, dotIndex) {
      dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
    });
    if (announce && status) {
      status.textContent = '已切换到第 ' + (index + 1) + ' 个项目，共 ' + slides.length + ' 个';
    }
  }

  function stop() {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function start(force) {
    stop();
    if (userPaused || document.hidden) return;
    if (!force && (hovering || region.matches(':focus-within'))) return;
    timer = window.setInterval(function () { goTo(index + 1, false); }, delay);
  }

  function syncPauseButton() {
    var label = userPaused ? '继续自动切换' : '暂停自动切换';
    pauseButton.setAttribute('aria-label', label);
    pauseButton.setAttribute('title', label);
    var pauseIcon = pauseButton.querySelector('.pause-icon');
    var playIcon = pauseButton.querySelector('.play-icon');
    if (pauseIcon && playIcon) {
      pauseIcon.toggleAttribute('hidden', userPaused);
      playIcon.toggleAttribute('hidden', !userPaused);
    }
  }

  pauseButton.addEventListener('click', function () {
    userPaused = !userPaused;
    syncPauseButton();
    if (userPaused) stop();
    else start(true);
  });

  var prevBtn = document.querySelector('.carousel-prev');
  var nextBtn = document.querySelector('.carousel-next');
  if (prevBtn) prevBtn.addEventListener('click', function () {
    goTo(index - 1, true);
    start();
  });
  if (nextBtn) nextBtn.addEventListener('click', function () {
    goTo(index + 1, true);
    start();
  });

  region.addEventListener('mouseenter', function () {
    hovering = true;
    stop();
  });
  region.addEventListener('mouseleave', function () {
    hovering = false;
    start();
  });
  region.addEventListener('focusin', stop);
  region.addEventListener('focusout', function (event) {
    if (!region.contains(event.relatedTarget)) start();
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else start();
  });

  reduceMotion.addEventListener('change', function (event) {
    if (event.matches) {
      userPaused = true;
      stop();
      syncPauseButton();
    }
  });

  var startX = 0;
  region.addEventListener('touchstart', function (event) {
    startX = event.touches[0].clientX;
    stop();
  }, { passive: true });
  region.addEventListener('touchend', function (event) {
    var delta = event.changedTouches[0].clientX - startX;
    if (Math.abs(delta) > 50) goTo(delta > 0 ? index - 1 : index + 1, true);
    start();
  }, { passive: true });

  syncPauseButton();
  start();
})();
