/**
 * mobile.js — Shared mobile UI: hamburger sidebar + bottom nav
 * Include AFTER api.js on every app page.
 */
(function() {

  // ── Inject sidebar overlay ────────────────────────────────
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  overlay.id = 'sidebar-overlay';
  document.body.appendChild(overlay);

  // ── Hamburger toggle ──────────────────────────────────────
  function toggleSidebar(open) {
    const sidebar   = document.querySelector('.sidebar');
    const hamburger = document.querySelector('.hamburger');
    const ovl       = document.getElementById('sidebar-overlay');
    if (!sidebar) return;
    const isOpen = open !== undefined ? open : !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', isOpen);
    if (hamburger) hamburger.classList.toggle('open', isOpen);
    if (ovl)       ovl.classList.toggle('show', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  // Close sidebar when overlay clicked
  overlay.addEventListener('click', function() { toggleSidebar(false); });

  // Wire hamburger button (added to nav by each page)
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.hamburger');
    if (btn) toggleSidebar();
  });

  // Close sidebar on nav item click (mobile)
  document.addEventListener('click', function(e) {
    const item = e.target.closest('.sidebar-item');
    if (item && window.innerWidth <= 1024) toggleSidebar(false);
  });

  // ── Inject bottom nav ─────────────────────────────────────
  var path = window.location.pathname;
  function isActive(href) {
    return path.includes(href.replace('.html','')) ? 'active' : '';
  }

  var bottomNav = document.createElement('nav');
  bottomNav.className = 'mobile-bottom-nav';
  bottomNav.innerHTML = '\
    <div class="mobile-bottom-nav-inner">\
      <a href="dashboard.html" class="mobile-nav-item ' + isActive('dashboard') + '">\
        <span class="mnav-icon">📊</span><span>Home</span>\
      </a>\
      <a href="workouts.html" class="mobile-nav-item ' + isActive('workouts') + '">\
        <span class="mnav-icon">🏋️</span><span>Workouts</span>\
      </a>\
      <a href="generator.html" class="mobile-nav-item ' + isActive('generator') + '">\
        <span class="mnav-icon">⚡</span><span>Generate</span>\
      </a>\
      <a href="ai-coach.html" class="mobile-nav-item ' + isActive('ai-coach') + '">\
        <span class="mnav-icon">🤖</span><span>Coach</span>\
      </a>\
      <a href="profile.html" class="mobile-nav-item ' + isActive('profile') + '">\
        <span class="mnav-icon">👤</span><span>Profile</span>\
      </a>\
    </div>';
  document.body.appendChild(bottomNav);

  // ── Add hamburger to nav if not present ───────────────────
  window.addEventListener('DOMContentLoaded', function() {
    var nav = document.querySelector('.nav');
    if (nav && !nav.querySelector('.hamburger')) {
      var hbtn = document.createElement('button');
      hbtn.className = 'hamburger';
      hbtn.setAttribute('aria-label', 'Toggle menu');
      hbtn.innerHTML = '<span></span><span></span><span></span>';
      // Insert as first child of nav (before logo)
      nav.insertBefore(hbtn, nav.firstChild);
    }
  });

  // ── Close sidebar on resize to desktop ───────────────────
  window.addEventListener('resize', function() {
    if (window.innerWidth > 1024) toggleSidebar(false);
  });

  window.toggleSidebar = toggleSidebar;
})();
