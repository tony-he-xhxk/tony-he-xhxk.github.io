/* 帖子 / 公告列表：搜索、分页、状态播报与键盘焦点管理 */
(function () {
  document.querySelectorAll('[data-list-filter]').forEach(function (root) {
    var input = root.querySelector('[data-filter-input]');
    var list = root.querySelector('[data-filter-list]');
    var count = root.querySelector('[data-filter-count]');
    var status = root.querySelector('[data-filter-status]');
    var empty = root.querySelector('[data-filter-empty]');
    var pager = root.querySelector('[data-filter-pagination]');
    if (!input || !list || !count || !status || !empty || !pager) return;

    var perPage = Number(root.dataset.perPage) || 10;
    var itemSelector = root.dataset.itemSelector || 'a';
    var unit = root.dataset.itemUnit || '项';
    var items = Array.prototype.slice.call(list.querySelectorAll(itemSelector));
    var total = items.length;
    var query = '';
    var page = 1;
    var announceTimer = null;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function filteredItems() {
      if (!query) return items;
      return items.filter(function (item) {
        return (item.dataset.search || '').toLowerCase().includes(query);
      });
    }

    function pageNumbers(current, last) {
      var wanted = new Set([1, last, current - 1, current, current + 1]);
      var values = [];
      for (var i = 1; i <= last; i += 1) if (wanted.has(i)) values.push(i);
      var output = [];
      var previous = 0;
      values.forEach(function (value) {
        if (value - previous > 1) output.push('…');
        output.push(value);
        previous = value;
      });
      return output;
    }

    function createPageButton(label, text, action, disabled, current) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'page-btn';
      button.textContent = text;
      button.setAttribute('aria-label', label);
      button.disabled = Boolean(disabled);
      if (current) button.setAttribute('aria-current', 'page');
      if (!disabled) button.addEventListener('click', action);
      return button;
    }

    function announce(message) {
      window.clearTimeout(announceTimer);
      announceTimer = window.setTimeout(function () {
        status.textContent = message;
      }, 220);
    }

    function goToPage(nextPage) {
      page = nextPage;
      render(true, true);
      list.scrollIntoView({
        behavior: reduceMotion.matches ? 'auto' : 'smooth',
        block: 'start'
      });
    }

    function render(moveFocus, shouldAnnounce) {
      var matches = filteredItems();
      var last = Math.max(1, Math.ceil(matches.length / perPage));
      if (page > last) page = last;
      var start = (page - 1) * perPage;

      items.forEach(function (item) { item.hidden = true; });
      matches.slice(start, start + perPage).forEach(function (item) { item.hidden = false; });

      count.textContent = (query
        ? '匹配 ' + matches.length + ' / ' + total + ' ' + unit
        : '共 ' + total + ' ' + unit) + ' · 第 ' + page + '/' + last + ' 页';
      empty.hidden = matches.length !== 0;
      empty.textContent = '没有找到匹配「' + input.value.trim() + '」的' + unit;

      pager.replaceChildren();
      if (last > 1) {
        pager.appendChild(createPageButton('上一页', '‹', function () {
          goToPage(page - 1);
        }, page === 1, false));

        pageNumbers(page, last).forEach(function (number) {
          if (number === '…') {
            var dots = document.createElement('span');
            dots.className = 'page-dots';
            dots.textContent = '…';
            dots.setAttribute('aria-hidden', 'true');
            pager.appendChild(dots);
            return;
          }
          pager.appendChild(createPageButton('第 ' + number + ' 页', String(number), function () {
            goToPage(number);
          }, false, number === page));
        });

        pager.appendChild(createPageButton('下一页', '›', function () {
          goToPage(page + 1);
        }, page === last, false));
      }

      if (moveFocus) {
        var current = pager.querySelector('[aria-current="page"]');
        if (current) current.focus({ preventScroll: true });
      }

      if (shouldAnnounce) {
        announce(matches.length
          ? '显示第 ' + page + ' 页，共 ' + last + ' 页，匹配 ' + matches.length + ' ' + unit
          : '没有找到匹配的内容');
      }
    }

    input.addEventListener('input', function () {
      query = input.value.trim().toLowerCase();
      page = 1;
      render(false, true);
    });

    render(false, false);
  });
})();
