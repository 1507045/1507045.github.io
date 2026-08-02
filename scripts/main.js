/* Hallownest · 圣巢 — 主题切换 / 站内搜索 / 阅读进度条 */
(function () {
  'use strict';

  /* ── 主题切换（深渊 ⇄ 苍白） ── */
  var toggle = document.getElementById('theme-toggle');
  var label = document.getElementById('theme-toggle-label');

  function applyLabel() {
    if (!label) return;
    var theme = document.documentElement.getAttribute('data-theme');
    label.textContent = theme === 'dark' ? '切换为苍白（亮色）' : '切换为深渊（暗色）';
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('pf-theme', next); } catch (e) { /* ignore */ }
      applyLabel();
    });
  }
  applyLabel();

  /* ── 阅读进度条（仅文章页） ── */
  var bar = document.getElementById('reading-progress');
  if (bar && document.body.classList.contains('post-page')) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var doc = document.documentElement;
        var max = doc.scrollHeight - window.innerHeight;
        bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
        ticking = false;
      });
    }, { passive: true });
  }

  /* ── 站内搜索 ── */
  var mask = document.getElementById('search-mask');
  var input = document.getElementById('search-input');
  var resultsEl = document.getElementById('search-results');
  var dataEl = document.getElementById('pf-search-data');
  var index = null;

  function getIndex() {
    if (index) return index;
    if (dataEl) {
      try { index = JSON.parse(dataEl.textContent); } catch (e) { index = { posts: [] }; }
    } else {
      index = { posts: [] };
    }
    return index;
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function highlight(text, kw) {
    var safe = /[.*+?^${}()|[\]\\]/.test(kw) ? kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : kw;
    var re = new RegExp('(' + safe + ')', 'gi');
    return escapeHtml(text).replace(re, '<mark>$1</mark>');
  }

  function openSearch() {
    if (!mask) return;
    mask.hidden = false;
    if (input) {
      input.value = '';
      setTimeout(function () { input.focus(); }, 30);
    }
    render('');
  }

  function closeSearch() {
    if (mask) mask.hidden = true;
  }

  function render(q) {
    if (!resultsEl) return;
    var idx = getIndex();
    var posts = idx.posts || [];
    q = (q || '').trim();
    if (!q) {
      resultsEl.innerHTML = '<div class="search-empty">输入关键词，在圣巢中寻觅文章与标签</div>';
      return;
    }
    var kw = q.toLowerCase();
    var hits = [];
    for (var i = 0; i < posts.length; i++) {
      var p = posts[i];
      var inTitle = p.title && p.title.toLowerCase().indexOf(kw) !== -1;
      var inExcerpt = p.excerpt && p.excerpt.toLowerCase().indexOf(kw) !== -1;
      var inTags = false;
      if (p.tags) {
        for (var j = 0; j < p.tags.length; j++) {
          if (String(p.tags[j]).toLowerCase().indexOf(kw) !== -1) { inTags = true; break; }
        }
      }
      if (inTitle || inExcerpt || inTags) hits.push(p);
    }
    if (!hits.length) {
      resultsEl.innerHTML = '<div class="search-empty">在圣巢的暗渊中，未能找到「' + escapeHtml(q) + '」</div>';
      return;
    }
    var html = '';
    for (var k = 0; k < hits.length; k++) {
      var item = hits[k];
      var title = item.title ? highlight(item.title, q) : '';
      var excerpt = item.excerpt ? highlight(item.excerpt, q).slice(0, 120) : '';
      html += '<a class="search-result" href="' + escapeHtml(item.link) + '">' +
        '<div class="search-result-title">' + title + '</div>' +
        (excerpt ? '<div class="search-result-excerpt">' + excerpt + '</div>' : '') +
        (item.date ? '<div class="search-result-date">' + escapeHtml(item.date) + '</div>' : '') +
        '</a>';
    }
    resultsEl.innerHTML = html;
  }

  var trigger = document.getElementById('search-trigger');
  var closeBtn = document.getElementById('search-close');
  if (trigger) trigger.addEventListener('click', openSearch);
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);
  if (mask) {
    mask.addEventListener('click', function (e) { if (e.target === mask) closeSearch(); });
  }
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
    if (e.key === 'Escape') closeSearch();
  });
  if (input) input.addEventListener('input', function () { render(input.value); });
})();
