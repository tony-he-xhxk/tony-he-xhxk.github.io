/* 美式咖啡横评渲染脚本
 * 数据源：/assets/data/coffee_reviews.json（由 tools/parse_coffee.py 从评测数据.txt 生成）
 * 排序规则（见开发指南）：
 *   1. 区域顺序 = 数据文件出现顺序
 *   2. 区域内卡片按「综合得分」（该卡各次测评最高分）从高到低
 *   3. 卡片内各次测评按评分从高到低
 */
(function () {
  var mount = document.getElementById('coffeeReviews');
  if (!mount) return;

  var DATA_URL = '/assets/data/coffee_reviews.json';

  /* ---------- 热量参考横条分级（X 大卡，填充 X/250，≥250 满） ---------- */
  function kcalLevel(k) {
    if (k >= 250) return { cls: 'lvl-high', grade: '高', fill: 1 };
    if (k >= 150) return { cls: 'lvl-midhigh', grade: '中高', fill: k / 250 };
    if (k >= 100) return { cls: 'lvl-midlow', grade: '中低', fill: k / 250 };
    return { cls: 'lvl-low', grade: '低', fill: k / 250 };
  }
  /* ---------- 评分横条分级（Y 分，按绝对分数填充 Y/100，100 分才满） ---------- */
  function scoreLevel(s) {
    var fill = Math.min(s / 100, 1); /* 绝对填充：分数/100，满分才顶格 */
    if (s >= 90) return { cls: 'lvl-top', grade: '夯', fill: fill };
    if (s >= 85) return { cls: 'lvl-great', grade: '顶级', fill: fill };
    if (s >= 80) return { cls: 'lvl-upper', grade: '人上人', fill: fill };
    if (s >= 75) return { cls: 'lvl-npc', grade: 'NPC', fill: fill };
    return { cls: 'lvl-dead', grade: '拉完了', fill: fill };
  }
  function pct(x) { return Math.round(x * 1000) / 10 + '%'; }

  /* ---------- DOM 构建 ---------- */
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* 热量条：数值在条内左，评级在条内右 */
  function kcalBar(rv) {
    var lv = kcalLevel(rv.kcal);
    var bar = el('div', 'bar bar-kcal ' + lv.cls);
    bar.appendChild(el('div', 'bar-track'));
    bar.appendChild(el('div', 'bar-fill'));
    bar.querySelector('.bar-fill').style.width = pct(lv.fill);
    bar.appendChild(el('span', 'bar-txt-l', rv.kcal + '大卡'));
    bar.appendChild(el('span', 'bar-txt-r', lv.grade));
    return bar;
  }

  /* 评分条：'83分·NPC' 文本在条内最右侧 */
  function scoreBar(rv) {
    var lv = scoreLevel(rv.score);
    var bar = el('div', 'bar bar-score ' + lv.cls);
    bar.appendChild(el('div', 'bar-track'));
    bar.appendChild(el('div', 'bar-fill'));
    bar.querySelector('.bar-fill').style.width = pct(lv.fill);
    bar.appendChild(el('span', 'bar-txt-r', rv.score + '分·' + lv.grade));
    return bar;
  }

  /* 单次测评块 */
  function reviewBlock(rv) {
    var block = el('div', 'cf-rv');
    var meta = el('div', 'cf-rv-meta');
    meta.appendChild(el('span', 'cf-rv-date', rv.date));
    if (rv.config) meta.appendChild(el('span', 'cf-rv-cfg', rv.config));
    block.appendChild(meta);
    block.appendChild(kcalBar(rv));
    block.appendChild(scoreBar(rv));
    if (rv.comment) block.appendChild(el('p', 'cf-rv-cmt', rv.comment));
    return block;
  }

  /* 商品卡片（含该商品全部测评块，按评分降序） */
  function cardEl(card) {
    var article = el('article', 'cf-card');
    article.appendChild(el('h3', 'cf-card-name', card.name));
    var reviews = card.reviews.slice().sort(function (a, b) { return b.score - a.score; });
    var wrap = el('div', 'cf-reviews');
    reviews.forEach(function (rv) { wrap.appendChild(reviewBlock(rv)); });
    article.appendChild(wrap);
    return article;
  }

  /* 综合得分 = 最高分 */
  function cardTopScore(card) {
    return card.reviews.reduce(function (m, rv) { return Math.max(m, rv.score); }, 0);
  }

  /* 区域：卡片按综合分降序 */
  function regionEl(region) {
    var sec = el('section', 'cf-region');
    sec.appendChild(el('h2', 'cf-region-title', region.name));
    var cards = region.cards.slice().sort(function (a, b) {
      return cardTopScore(b) - cardTopScore(a);
    });
    var wrap = el('div', 'cf-cards');
    cards.forEach(function (c) { wrap.appendChild(cardEl(c)); });
    sec.appendChild(wrap);
    return sec;
  }

  /* 渲染入口 */
  function render(data) {
    mount.textContent = '';
    (data.regions || []).forEach(function (r) { mount.appendChild(regionEl(r)); });
  }

  function fail(msg) {
    mount.textContent = '';
    var p = el('p', 'cf-loading', msg);
    mount.appendChild(p);
  }

  fetch(DATA_URL, { cache: 'no-store' })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      if (!data || !Array.isArray(data.regions)) throw new Error('数据格式异常');
      render(data);
    })
    .catch(function (err) {
      fail('横评数据加载失败：' + err.message + '（数据由评测数据.txt 自动解析生成）');
    });
})();
