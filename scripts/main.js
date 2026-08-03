/* Hallownest · 圣巢 — 主题交互：汉堡菜单 / 搜索 */
(function () {
  'use strict';

  /* ── 移动端二级菜单（汉堡开合） ── */
  var navBtn = document.getElementById('nav-toggle');
  var drawer = document.getElementById('top-drawer');
  if (navBtn && drawer) {
    var topbar = document.getElementById('topbar');
    /* 创建遮罩层，初始隐藏 */
    var backdrop = document.createElement('div');
    backdrop.className = 'drawer-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.hidden = true;
    drawer.parentNode.insertBefore(backdrop, drawer);

    function setDrawerPos() {
      if (!topbar) return;
      drawer.style.top = topbar.offsetHeight + 'px';
      drawer.style.maxHeight = 'calc(100vh - ' + topbar.offsetHeight + 'px)';
    }
    function openDrawer() {
      setDrawerPos();
      drawer.hidden = false;
      backdrop.hidden = false;
      navBtn.classList.add('is-open');
      navBtn.setAttribute('aria-expanded', 'true');
      if (topbar) topbar.classList.add('is-menu-open');
    }
    function closeDrawer() {
      drawer.hidden = true;
      backdrop.hidden = true;
      navBtn.classList.remove('is-open');
      navBtn.setAttribute('aria-expanded', 'false');
      if (topbar) topbar.classList.remove('is-menu-open');
    }
    navBtn.addEventListener('click', function () {
      if (drawer.hidden) openDrawer();
      else closeDrawer();
    });
    /* 点击抽屉内的链接或按钮 → 关闭 */
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a, button')) closeDrawer();
    });
    /* 点击遮罩层 → 关闭 */
    backdrop.addEventListener('click', closeDrawer);
  }

  /* ── 外链：新标签页打开（全站范围） ── */
  var allLinks = document.querySelectorAll('a[href^="http"]');
  for (var i = 0; i < allLinks.length; i++) {
    if (allLinks[i].hostname !== location.hostname) {
      allLinks[i].setAttribute('target', '_blank');
      allLinks[i].setAttribute('rel', 'noopener noreferrer');
    }
  }

  /* ── 全站搜索 ── */
  var searchModal = document.getElementById('search-modal');
  var searchMask = document.getElementById('search-mask');
  var searchInput = document.getElementById('search-input');
  var searchResults = document.getElementById('search-results');
  var searchClose = document.getElementById('search-close');

  if (searchModal && searchInput && searchResults) {
    /* 索引：从内联 <script id="hk-search-data"> 读取 */
    var searchIndex = { posts: [], tags: [] };
    var dataEl = document.getElementById('hk-search-data');
    if (dataEl) {
      try { searchIndex = JSON.parse(dataEl.textContent); } catch (e) {}
    }

    function openSearch() {
      searchModal.classList.add('is-open');
      searchInput.focus();
      searchInput.value = '';
      renderSearch();
    }
    function closeSearchFn() {
      searchModal.classList.remove('is-open');
    }

    /* 搜索绑定的三个入口 */
    var trigger = document.getElementById('search-trigger');
    var drawerSearch = document.getElementById('drawer-search-trigger');
    if (trigger) trigger.addEventListener('click', openSearch);
    if (drawerSearch) drawerSearch.addEventListener('click', openSearch);
    if (searchClose) searchClose.addEventListener('click', closeSearchFn);
    if (searchMask) searchMask.addEventListener('click', closeSearchFn);

    /* 事件委托：点击搜索结果项 → 关闭弹窗 */
    searchResults.addEventListener('click', function (e) {
      var item = e.target.closest('.search-result-item');
      if (item) closeSearchFn();
    });

    /* 键盘快捷键 Ctrl/Cmd+K */
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (searchModal.classList.contains('is-open')) closeSearchFn();
        else openSearch();
      }
      if (e.key === 'Escape' && searchModal.classList.contains('is-open')) {
        closeSearchFn();
      }
    });

    /* 实时搜索 */
    var activeIdx = -1;
    var lastResults = [];

    function highlight(text, q) {
      var escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var re = new RegExp('(' + escaped + ')', 'gi');
      return text.replace(re, '<mark>$1</mark>');
    }

    function renderSearch() {
      var q = searchInput.value.trim().toLowerCase();
      var resultsEl = searchResults;
      if (!q) {
        resultsEl.innerHTML = '<p class="search-empty">输入关键词，探寻圣巢的往昔</p>';
        lastResults = [];
        activeIdx = -1;
        return;
      }
      var hits = [];
      for (var i = 0; i < searchIndex.posts.length; i++) {
        var p = searchIndex.posts[i];
        var score = 0;
        if (p.title.toLowerCase().indexOf(q) !== -1) score += 10;
        var tags = (p.tags || []).join(' ').toLowerCase();
        if (tags.indexOf(q) !== -1) score += 6;
        var excerpt = (p.excerpt || '').toLowerCase();
        if (excerpt.indexOf(q) !== -1) score += 4;
        if (score > 0) {
          hits.push({ post: p, score: score });
        }
      }
      /* 也搜标签名 */
      for (var t = 0; t < searchIndex.tags.length; t++) {
        var tag = searchIndex.tags[t];
        if (tag.name.toLowerCase().indexOf(q) !== -1) {
          hits.push({ post: { title: '◆ 标签：' + tag.name, link: tag.link, date: tag.count + ' 篇', tags: [], excerpt: '' }, score: 3 });
        }
      }
      hits.sort(function (a, b) { return b.score - a.score; });
      lastResults = hits;

      if (hits.length === 0) {
        resultsEl.innerHTML = '<p class="search-empty">圣巢的卷轴中未找到与此相关的记录</p>';
        activeIdx = -1;
        return;
      }

      var html = '';
      for (var j = 0; j < hits.length; j++) {
        var hp = hits[j].post;
        var titleHl = highlight(hp.title, q);
        var dateStr = hp.date || '';
        var tagStr = (hp.tags || []).length > 0 ? ' ◆ ' + hp.tags.join(' ◆ ') : '';
        html += '<a href="' + hp.link + '" class="search-result-item" data-idx="' + j + '">' +
          '<span class="search-result-title">' + titleHl + '</span>' +
          '<span class="search-result-meta">' + dateStr + tagStr + '</span>' +
        '</a>';
      }
      resultsEl.innerHTML = html;
      activeIdx = -1;
    }

    searchInput.addEventListener('input', renderSearch);

    /* 键盘导航（上下箭头 + Enter） */
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (lastResults.length === 0) return;
        activeIdx = Math.min(activeIdx + 1, lastResults.length - 1);
        highlightActive();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (lastResults.length === 0) return;
        activeIdx = Math.max(activeIdx - 1, 0);
        highlightActive();
      } else if (e.key === 'Enter') {
        if (activeIdx >= 0 && activeIdx < lastResults.length) {
          e.preventDefault();
          window.location.href = lastResults[activeIdx].post.link;
        }
      }
    });

    function highlightActive() {
      var items = searchResults.querySelectorAll('.search-result-item');
      for (var i = 0; i < items.length; i++) {
        items[i].classList.toggle('is-active', i === activeIdx);
      }
      if (activeIdx >= 0 && items[activeIdx]) {
        items[activeIdx].scrollIntoView({ block: 'nearest' });
      }
    }
  }
})();
