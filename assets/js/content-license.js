/* 内容许可与复制引用
 *
 * - 正文复制：复制较长摘录时给 text/plain 和 text/html 追加简短来源声明
 * - 引用按钮：复制一段可直接粘贴到转载页面的纯文本声明
 * - 代码、表单和许可面板本身不自动附加；第三方素材由许可面板明确排除
 * - 浏览器剪贴板只能辅助声明，无法阻止读者粘贴后手动删除
 */
(function () {
  var notice = document.querySelector('[data-content-license]');
  if (!notice) return;

  var license = {
    name: notice.dataset.licenseName || 'CC BY-NC 4.0',
    link: notice.dataset.licenseLink || 'https://creativecommons.org/licenses/by-nc/4.0/deed.zh-hans',
    author: notice.dataset.licenseAuthor || document.title,
    title: notice.dataset.licenseTitle || document.title,
    url: notice.dataset.licenseUrl || window.location.href.split('#')[0],
    minimumCopyLength: Number(notice.dataset.licenseMinimumCopyLength) || 80
  };

  function citationText() {
    return '来源：© ' + license.author + '《' + license.title + '》，原文：' + license.url +
      '，许可：' + license.name + '（' + license.link + '）。' +
      '仅限非商业用途；如作改编或节选，请注明修改。第三方素材与代码不适用本许可。';
  }

  function compactCitationText() {
    return '—— © ' + license.author + '《' + license.title + '》 · 原文：' + license.url +
      ' · ' + license.name + '：' + license.link +
      ' · 非商业使用，修改请注明，第三方内容除外。';
  }

  function normalizedLength(text) {
    return Array.from(text.replace(/\s/g, '')).length;
  }

  function closestElement(node) {
    if (!node) return null;
    return node.nodeType === 1 ? node : node.parentElement;
  }

  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      var field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.left = '-9999px';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      var copied = false;
      try {
        copied = document.execCommand('copy');
      } catch (error) {
        copied = false;
      }
      field.remove();
      if (copied) resolve();
      else reject(new Error('copy failed'));
    });
  }

  function copyWithFallback(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () {
        return legacyCopy(text);
      });
    }
    return legacyCopy(text);
  }

  function setCopyStatus(status, message) {
    status.textContent = message;
    window.clearTimeout(setCopyStatus.timer);
    setCopyStatus.timer = window.setTimeout(function () {
      status.textContent = '';
    }, 3200);
  }

  document.querySelectorAll('[data-copy-license]').forEach(function (button) {
    var status = button.parentElement.querySelector('.content-license-status');
    button.addEventListener('click', function () {
      copyWithFallback(citationText()).then(function () {
        setCopyStatus(status, '已复制');
      }).catch(function () {
        setCopyStatus(status, '复制失败，请手动选择上方声明');
      });
    });
  });

  function appendLicenseHtml(wrapper) {
    wrapper.querySelectorAll('script, style').forEach(function (node) {
      node.remove();
    });

    var block = document.createElement('p');
    block.setAttribute(
      'style',
      'margin-top:16px;padding-top:12px;border-top:1px solid #cccccc;' +
      'color:#666666;font-size:0.9em;line-height:1.7;'
    );

    var strong = document.createElement('strong');
    strong.textContent = '—— ';
    block.appendChild(strong);
    block.appendChild(document.createTextNode(
      '© ' + license.author + '《' + license.title + '》 · 原文：'
    ));

    var sourceLink = document.createElement('a');
    sourceLink.href = license.url;
    sourceLink.textContent = license.url;
    block.appendChild(sourceLink);
    block.appendChild(document.createTextNode(' · ' + license.name + '：'));

    var licenseLink = document.createElement('a');
    licenseLink.href = license.link;
    licenseLink.rel = 'license';
    licenseLink.textContent = license.link;
    block.appendChild(licenseLink);
    block.appendChild(document.createTextNode(
      ' · 非商业使用，修改请注明，第三方内容除外。'
    ));

    wrapper.appendChild(block);
    return wrapper.innerHTML;
  }

  document.addEventListener('copy', function (event) {
    if (!event.clipboardData) return;

    var selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

    var range = selection.getRangeAt(0);
    var startEl = closestElement(selection.anchorNode);
    var endEl = closestElement(selection.focusNode);
    var startSource = startEl && startEl.closest('[data-licensed-copy]');
    var endSource = endEl && endEl.closest('[data-licensed-copy]');
    if (!startSource || startSource !== endSource) return;

    var excludedControlSelector =
      '[data-license-exclude], script, style, input, textarea, select, button, ' +
      '[contenteditable="true"]';
    if ((startEl && startEl.closest(excludedControlSelector)) ||
        (endEl && endEl.closest(excludedControlSelector))) {
      return;
    }

    /* 单独复制链接时保持原生行为 */
    var startLink = startEl && startEl.closest('a');
    if (startLink && endEl && startLink === endEl.closest('a')) return;

    /* 代码可以随正文一起被复制，但单独复制代码块时不附加内容许可 */
    if (startEl && endEl && startEl.closest('pre, code') && endEl.closest('pre, code')) {
      return;
    }

    var selectedText = selection.toString();
    if (!selectedText.trim() || selectedText.indexOf(license.link) !== -1) return;

    if (normalizedLength(selectedText) < license.minimumCopyLength) return;

    var plainText = selectedText.replace(/\s+$/, '') + '\n\n' + compactCitationText();
    var fragment = range.cloneContents();
    var wrapper = document.createElement('div');
    wrapper.appendChild(fragment);
    var richText = appendLicenseHtml(wrapper);

    event.clipboardData.setData('text/plain', plainText);
    event.clipboardData.setData('text/html', richText);
    event.preventDefault();
  });
})();
