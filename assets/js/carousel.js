/* 项目卡片轮播：箭头切换 + 自动播放 + 指示点 + 悬停暂停 + 触摸滑动 */
(function () {
  var track = document.getElementById('projectsTrack');
  var dotsWrap = document.getElementById('projectsDots');
  if (!track || !dotsWrap || track.children.length === 0) return;

  var cards = track.children;
  var index = 0;
  var timer = null;
  var DELAY = 4000; /* 每 4 秒自动切换 */

  function goTo(i) {
    index = (i + cards.length) % cards.length;
    track.style.transform = 'translateX(-' + index * 100 + '%)';
    var dots = dotsWrap.children;
    for (var j = 0; j < dots.length; j++) {
      dots[j].classList.toggle('active', j === index);
    }
  }
  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }
  function start() { stop(); timer = setInterval(next, DELAY); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  /* 指示点 */
  for (var i = 0; i < cards.length; i++) {
    (function (idx) {
      var d = document.createElement('button');
      d.className = 'dot' + (idx === 0 ? ' active' : '');
      d.setAttribute('aria-label', '第 ' + (idx + 1) + ' 个项目');
      d.addEventListener('click', function () { goTo(idx); start(); });
      dotsWrap.appendChild(d);
    })(i);
  }

  /* 左右箭头 */
  var prevBtn = document.querySelector('.carousel-prev');
  var nextBtn = document.querySelector('.carousel-next');
  if (prevBtn) prevBtn.addEventListener('click', function () { prev(); start(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { next(); start(); });

  /* 悬停暂停自动播放 */
  var carousel = document.querySelector('.carousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
  }

  /* 移动端触摸滑动 */
  var startX = 0;
  if (carousel) {
    carousel.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      stop();
    }, { passive: true });
    carousel.addEventListener('touchend', function (e) {
      var delta = e.changedTouches[0].clientX - startX;
      if (Math.abs(delta) > 50) {
        if (delta > 0) { prev(); } else { next(); }
      }
      start();
    }, { passive: true });
  }

  start();
})();
