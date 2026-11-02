/* Breadslicer site: header, mobile menu, small hover touches, table filters.
   Vanilla, no dependencies. Every page loads it. */
(function () {
  "use strict";

  var doc = document, win = window;
  var reduced = win.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = win.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (sel, root) { return (root || doc).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); };

  /* ---------- Header + mobile nav ---------- */
  var header = $(".site-header"), toggle = $(".nav-toggle"), nav = $("#site-nav");
  function closeNav() { toggle.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) closeNav(); });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { closeNav(); toggle.focus(); }
    });
  }
  var ticking = false;
  function onScroll() {
    ticking = false;
    if (header) header.classList.toggle("is-scrolled", win.scrollY > 8);
  }
  win.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Cursor highlight on cells, magnetic buttons ---------- */
  if (finePointer) {
    doc.addEventListener("pointermove", function (e) {
      var cell = e.target.closest && e.target.closest("[data-cell]");
      if (cell) {
        var r = cell.getBoundingClientRect();
        cell.style.setProperty("--mx", (e.clientX - r.left) + "px");
        cell.style.setProperty("--my", (e.clientY - r.top) + "px");
      }
    }, { passive: true });

    if (!reduced) {
      $$("[data-magnetic]").forEach(function (btn) {
        btn.addEventListener("pointermove", function (e) {
          var r = btn.getBoundingClientRect();
          var dx = (e.clientX - (r.left + r.width / 2)) * 0.22, dy = (e.clientY - (r.top + r.height / 2)) * 0.22;
          btn.style.transform = "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px)";
        });
        btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
      });
    }
  }

  /* ---------- Clips: play while on screen ---------- */
  if (!reduced && "IntersectionObserver" in win) {
    var clipIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) v.play().catch(function () {});
        else v.pause();
      });
    }, { threshold: 0.35 });
    $$("video[data-autoplay]").forEach(function (v) { clipIO.observe(v); });
  }

  /* ---------- Table filters: <input data-filter="#table-id"> ---------- */
  $$("[data-filter]").forEach(function (input) {
    var table = $(input.getAttribute("data-filter"));
    if (!table) return;
    var rows = $$("tbody tr", table);
    var only = $(input.getAttribute("data-filter-only") || "[data-none]");
    var count = $(input.getAttribute("data-filter-count") || "[data-none]");
    function apply() {
      var q = input.value.trim().toLowerCase(), shown = 0;
      var exportsOnly = only && only.checked;
      rows.forEach(function (tr) {
        var ok = (!q || tr.textContent.toLowerCase().indexOf(q) !== -1) &&
                 (!exportsOnly || tr.hasAttribute("data-exports"));
        tr.hidden = !ok;
        if (ok) shown++;
      });
      if (count) count.textContent = String(shown);
    }
    input.addEventListener("input", apply);
    if (only) only.addEventListener("change", apply);
    apply();
  });
})();
