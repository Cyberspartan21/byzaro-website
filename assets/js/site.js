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

  /* Reveal on scroll, with staggered children -------------------------------- */
  var STAGGER_MAP = [
    { parent: '.ledger-rows', item: '.ledger-row-wrap' },
    { parent: '.scenario-grid', item: '.scenario-card' },
    { parent: '.related-divisions', item: '.related-card' },
    { parent: '.process-steps', item: '.process-step' },
    { parent: '.service-detail-list', item: 'li' },
    { parent: '.category-grid', item: 'label' },
    { parent: '.legal-table', item: '.legal-row' },
    { parent: '.opp-rows', item: '.opp-row' },
    { parent: '.reach-rows', item: '.reach-row' }
  ];
  STAGGER_MAP.forEach(function (rule) {
    document.querySelectorAll(rule.parent + '.reveal').forEach(function (parent) {
      var items = parent.querySelectorAll(rule.item);
      if (!items.length) return;
      parent.classList.add('reveal--stagger');
      items.forEach(function (item, i) {
        item.classList.add('stagger-item');
        item.style.transitionDelay = (i * 40) + 'ms';
      });
    });
  });

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

  /* Ghost section numerals ---------------------------------------------------- */
  document.querySelectorAll('.section').forEach(function (section) {
    var head = section.querySelector(':scope > .container > .section-head');
    if (!head) return;
    var numEl = head.querySelector('.section-numeral');
    if (!numEl) return;
    var txt = (numEl.textContent || '').trim();
    if (!txt || txt === '—' || txt === '-') return;
    var ghost = document.createElement('span');
    ghost.className = 'ghost-num';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.textContent = txt;
    section.insertBefore(ghost, section.firstChild);
  });

  /* Ambient parallax on decorative image bands (desktop, motion-ok only) ------ */
  if (window.matchMedia('(hover: hover)').matches &&
      window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    var bands = document.querySelectorAll('.img-band.img-tint > img');
    if (bands.length) {
      var bandTicking = false;
      var updateParallax = function () {
        var vh = window.innerHeight;
        bands.forEach(function (img) {
          var rect = img.parentElement.getBoundingClientRect();
          var center = rect.top + rect.height / 2 - vh / 2;
          var pct = Math.max(-8, Math.min(8, (center / vh) * -16));
          img.style.transform = 'translateY(' + pct.toFixed(2) + '%)';
        });
        bandTicking = false;
      };
      window.addEventListener('scroll', function () {
        if (!bandTicking) {
          window.requestAnimationFrame(updateParallax);
          bandTicking = true;
        }
      }, { passive: true });
      updateParallax();
    }
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
    var submitBtn = form.querySelector('button[type="submit"]');
    var mode = form.getAttribute('data-mode') || 'demo';
    var endpoint = form.getAttribute('data-endpoint') || '';
    var successMsg = form.getAttribute('data-success') || '';
    var errorMsg = form.getAttribute('data-error') || '';
    var sendingLabel = form.getAttribute('data-sending') || '';
    var notActiveMsg = form.getAttribute('data-not-active') || '';
    var submitLabel = form.getAttribute('data-submit-label') || (submitBtn ? submitBtn.textContent : '');

    function showMessage(msg, isError) {
      confirmation.textContent = msg;
      confirmation.classList.add('is-visible');
      confirmation.classList.toggle('is-error', !!isError);
      confirmation.setAttribute('tabindex', '-1');
      confirmation.focus();
    }

    function setBusy(isBusy) {
      if (!submitBtn) { return; }
      submitBtn.disabled = isBusy;
      submitBtn.textContent = isBusy ? sendingLabel : submitLabel;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Native constraint validation (required fields, email format) — the
      // form intentionally keeps `novalidate` off so the browser's own
      // accessible validation UI runs; this is a backstop for programmatic
      // submits and browsers that still fire `submit` on invalid forms.
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Honeypot: real visitors never fill this hidden field. If it has a
      // value, treat the submission as spam without alerting the sender —
      // Formspree's own `_gotcha` field does the same silently server-side.
      var honeypot = form.querySelector('input[name="_gotcha"]');
      if (honeypot && honeypot.value) {
        form.reset();
        return;
      }

      if (submitBtn && submitBtn.disabled) { return; }

      if (mode === 'endpoint' && endpoint) {
        var data = new FormData(form);
        setBusy(true);
        fetch(endpoint, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        }).then(function (response) {
          setBusy(false);
          if (response.ok) {
            showMessage(successMsg, false);
            form.reset();
          } else {
            showMessage(errorMsg, true);
          }
        }).catch(function () {
          setBusy(false);
          showMessage(errorMsg, true);
        });
      } else {
        // No endpoint configured yet — nothing is transmitted, so the form
        // must never claim success. Fields are left untouched so nothing
        // the visitor typed is lost.
        showMessage(notActiveMsg, false);
      }
    });
  }

  /* Segments network diagram — hover/focus/tap a sector: it lifts outward,
     its two nearest markets light up, the rest of the diagram dims.
     Progressive enhancement only — every sector is a real <a href> that
     works without this script; this just adds the highlight choreography.
     Scoped to .diagram-unit (not just the <svg>) so the mobile variant's
     market-name captions, which sit below the svg as a sibling <ul>, light
     up together with the on-diagram dots. */
  document.querySelectorAll('.diagram-unit').forEach(function (unit) {
    var group = unit.querySelector('.seg-group');
    var hits = unit.querySelectorAll('.seg-hit');
    var markets = unit.querySelectorAll('.seg-mk, .seg-mk-caption');
    if (!group || !hits.length) return;

    function activate(hit) {
      group.classList.add('dim');
      hit.classList.add('on');
      var div = hit.getAttribute('data-div');
      markets.forEach(function (mk) {
        var near = (mk.getAttribute('data-near') || '').split(',');
        if (near.indexOf(div) !== -1) mk.classList.add('lit');
      });
    }
    function deactivate(hit) {
      group.classList.remove('dim');
      hit.classList.remove('on');
      markets.forEach(function (mk) { mk.classList.remove('lit'); });
    }

    hits.forEach(function (hit) {
      hit.addEventListener('mouseenter', function () { activate(hit); });
      hit.addEventListener('mouseleave', function () { deactivate(hit); });
      hit.addEventListener('focus', function () { activate(hit); });
      hit.addEventListener('blur', function () { deactivate(hit); });
      /* Touch: light up on press so the highlight is visible the instant
         before navigation fires, without gating the link behind a tap. */
      hit.addEventListener('touchstart', function () { activate(hit); }, { passive: true });
      hit.addEventListener('touchend', function () { deactivate(hit); }, { passive: true });
      hit.addEventListener('touchcancel', function () { deactivate(hit); }, { passive: true });
    });
  });
})();
