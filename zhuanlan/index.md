---
layout: default
title: 专栏导航页
permalink: /zhuanlan/
---
<article class="post">
  <header class="post-header">
    <h1>专栏导航页</h1>
  </header>

  <div class="search-box">
    <input type="search" id="zlSearch" placeholder="搜索专栏…（模糊匹配）" autocomplete="off">
  </div>
  <div class="search-meta"><span class="search-count" id="zlSearchCount"></span></div>

  <div class="zl-nav-list" id="zlList">
    <a class="zl-nav-card" href="{{ '/zhuanlan/美团用券指南/' | relative_url }}" data-name="美团用券指南">
      <h3>美团用券指南</h3>
      <p>外卖越吃越贵？看这份指南，会不会让你省下一点钱呢？苍蝇腿也是肉哦！</p>
    </a>
    <a class="zl-nav-card" href="{{ '/zhuanlan/美式咖啡横评/' | relative_url }}" data-name="美式咖啡横评">
      <h3>美式咖啡横评</h3>
      <p>不知道美式之中藏着怎样的玄机？盲点美式大概率踩雷，这一份横评可供你参考。</p>
    </a>
  </div>
  <p class="zl-nav-empty" id="zlEmpty">未找到符合条件的专栏。</p>

  <div class="post-nav">
    <a class="back" href="{{ '/' | relative_url }}">← 返回首页</a>
  </div>
</article>

<script>
(function () {
  var input = document.getElementById('zlSearch');
  var count = document.getElementById('zlSearchCount');
  var list = document.getElementById('zlList');
  var empty = document.getElementById('zlEmpty');
  var cards = Array.prototype.slice.call(list.querySelectorAll('.zl-nav-card'));
  var total = cards.length;
  count.textContent = '共 ' + total + ' 条';

  function render() {
    var q = input.value.trim().toLowerCase();
    var hits = 0;
    cards.forEach(function (c) {
      var text = (c.getAttribute('data-name') + ' ' + c.textContent).toLowerCase();
      var show = !q || text.indexOf(q) !== -1;
      c.style.display = show ? '' : 'none';
      if (show) hits++;
    });
    count.textContent = q ? '匹配 ' + hits + ' / ' + total + ' 条' : '共 ' + total + ' 条';
    empty.style.display = hits ? 'none' : '';
  }
  input.addEventListener('input', render);
})();
</script>
