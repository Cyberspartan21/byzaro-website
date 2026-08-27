// BYZARO GROUP — shared site behavior (intro, nav, theme, dropdown, mandate form).
(function () {
  'use strict';

  /* Intro assembly animation ------------------------------------------- */
  var overlay = document.getElementById('intro-overlay');
  if (overlay) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || sessionStorage.getItem('bz-intro')) {
      overlay.setAttribute('data-hidden', 'true');
      overlay.style.display = 'none';
    } else {
      var mark = document.getElementById('intro-mark');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          mark.classList.add('bz-run');
        });
      });
      setTimeout(function () {
        overlay.setAttribute('data-hidden', 'true');
        try { sessionStorage.setItem('bz-intro', '1'); } catch (e) {}
        setTimeout(function () { overlay.style.display = 'none'; }, 500);
      }, 1300);
    }
  }

  /* Mobile menu ----------------------------------------------------------- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.mobile-menu');
  var closeBtn = document.querySelector('.mobile-menu-close');
  function openMenu() {
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      if (expanded) { closeMenu(); } else { openMenu(); }
    });
  }
  if (closeBtn) { closeBtn.addEventListener('click', closeMenu); }
  if (menu) {
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  }

  /* Theme toggle ------------------------------------------------------------ */
  // Labels are localized server-side and passed via data attributes; the
  // toggle always displays the label of the mode it will switch INTO.
  var themeToggles = document.querySelectorAll('.theme-toggle');
  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }
  function updateThemeToggles() {
    var theme = currentTheme();
    themeToggles.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(theme === 'dark'));
      var label = btn.querySelector('.theme-toggle-label');
      if (label) {
        var target = theme === 'light' ? btn.getAttribute('data-label-dark') : btn.getAttribute('data-label-light');
        if (target) { label.textContent = target; }
      }
    });
  }
  function setTheme(theme) {
    document.documentElement.classList.add('theme-transition');
    window.setTimeout(function () {
      document.documentElement.classList.remove('theme-transition');
    }, 320);
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try { localStorage.setItem('bz-theme', theme); } catch (e) {}
    updateThemeToggles();
  }
  updateThemeToggles();
  themeToggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setTheme(currentTheme() === 'light' ? 'dark' : 'light');
    });
  });

  /* Reveal on scroll -------------------------------------------------------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: .15 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* Capabilities dropdown (desktop) ------------------------------------------ */
  var ddToggle = document.querySelector('.dropdown-toggle');
  var ddMenu = document.querySelector('.dropdown-menu');
  function openDropdown() {
    ddToggle.setAttribute('aria-expanded', 'true');
    ddMenu.classList.add('is-open');
  }
  function closeDropdown() {
    ddToggle.setAttribute('aria-expanded', 'false');
    ddMenu.classList.remove('is-open');
  }
  if (ddToggle && ddMenu) {
    /* Klassisches Hover-Dropdown auf Geraeten mit Maus; Klick/Tastatur bleiben. */
    var ddItem = ddToggle.closest('.nav-item--dropdown') || ddToggle.parentElement;
    var ddCloseTimer = null;
    if (ddItem && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      ddItem.addEventListener('pointerenter', function () {
        clearTimeout(ddCloseTimer);
        openDropdown();
      });
      ddItem.addEventListener('pointerleave', function () {
        clearTimeout(ddCloseTimer);
        ddCloseTimer = setTimeout(closeDropdown, 180);
      });
    }
    ddToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var expanded = ddToggle.getAttribute('aria-expanded') === 'true';
      if (expanded) { closeDropdown(); } else { openDropdown(); }
    });
    document.addEventListener('click', function (e) {
      if (ddToggle.getAttribute('aria-expanded') === 'true' &&
          !ddMenu.contains(e.target) && e.target !== ddToggle) {
        closeDropdown();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && ddToggle.getAttribute('aria-expanded') === 'true') {
        closeDropdown();
        ddToggle.focus();
      }
    });
  }

  /* Mandate / contact form --------------------------------------------------- */
  var form = document.querySelector('.mandate-form');
  if (form) {
    var confirmation = form.querySelector('.mandate-confirmation');
    var mode = form.getAttribute('data-mode') || 'demo';
    var endpoint = form.getAttribute('data-endpoint') || '';
    var successMsg = form.getAttribute('data-success') || '';
    var errorMsg = form.getAttribute('data-error') || '';

    function showMessage(msg, isError) {
      confirmation.textContent = msg;
      confirmation.classList.add('is-visible');
      confirmation.classList.toggle('is-error', !!isError);
      confirmation.setAttribute('tabindex', '-1');
      confirmation.focus();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (mode === 'endpoint' && endpoint) {
        var data = new FormData(form);
        fetch(endpoint, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        }).then(function (response) {
          if (response.ok) {
            showMessage(successMsg, false);
            form.reset();
          } else {
            showMessage(errorMsg, true);
          }
        }).catch(function () {
          showMessage(errorMsg, true);
        });
      } else {
        // Demo mode: no network call, purely local confirmation.
        showMessage(successMsg, false);
        form.reset();
      }
    });
  }
})();
