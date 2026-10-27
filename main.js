/* Breadslicer site. Vanilla, no dependencies.
   Everything scroll-driven runs through one rAF loop; demos only respond to input. */
(function () {
  "use strict";

  var doc = document, win = window;
  var reduced = win.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = win.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (sel, root) { return (root || doc).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

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

  /* ---------- Word reveal ---------- */
  $$(".reveal-words").forEach(function (el) {
    if (reduced) return;
    var i = 0;
    function wrap(node) {
      if (node.nodeType === 3) {
        var frag = doc.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(doc.createTextNode(part)); return; }
          var w = doc.createElement("span"); w.className = "w";
          var inner = doc.createElement("span"); inner.textContent = part; inner.style.setProperty("--i", i++);
          w.appendChild(inner); frag.appendChild(w);
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.tagName !== "SPAN") {
        Array.prototype.slice.call(node.childNodes).forEach(wrap);
      }
    }
    Array.prototype.slice.call(el.childNodes).forEach(wrap);
  });

  /* ---------- Rail: progress + active section ---------- */
  var railCursor = $(".rail-cursor"), railProgress = $("[data-progress]"), railProgressWrap = $(".rail-progress");
  var railItems = {};
  $$("[data-rail]").forEach(function (li) { railItems[li.getAttribute("data-rail")] = li; });
  var sections = $$("[data-section]");
  if ("IntersectionObserver" in win && sections.length) {
    var secIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var key = en.target.getAttribute("data-section");
        Object.keys(railItems).forEach(function (k) { railItems[k].classList.toggle("is-active", k === key); });
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    sections.forEach(function (s) { secIO.observe(s); });
  }

  /* ---------- Hero loaf: strips ---------- */
  var loaf = $("[data-loaf]"), strips = $(".loaf-strips"), heightInput = $("[data-layer-height]");
  var layerOut = $("[data-layer-out]"), loafLayer = $("[data-loaf-layer]"), loafHeight = $("[data-loaf-height]");
  var hero = $("#hero");
  var loafState = { p: 0, mx: 0, mxTarget: 0, layers: 1200, count: 16, intro: 0 };
  var INTRO_P = 0.45, INTRO_MS = 1100;           // the loaf cuts itself on load

  function buildStrips(heightMicrons) {
    if (!strips) return;
    var count = clamp(Math.round(800 / heightMicrons), 8, 32); // 25µm -> 32 strips, 100µm -> 8
    loafState.count = count;
    loafState.layers = Math.round(60000 / heightMicrons);       // a ~60 mm loaf
    var html = "", h = 100 / count;
    for (var i = 0; i < count; i++) {
      var dir = (i % 2 === 0) ? 1 : -1;
      var amp = 6 + ((i * 7) % 11);               // 6..16 px, deterministic
      var dx = dir * amp, dy = (i - count / 2) * 2.2, cx = dir * (4 + (i % 3) * 2);
      html += '<i style="top:' + (i * h) + '%;height:' + (h + 0.08) + '%;background-position:0 ' + (i * h / (1 - h / 100 || 1)) + '%;--dx:' + dx + ';--dy:' + dy.toFixed(1) + ';--cx:' + cx + '"></i>';
    }
    strips.innerHTML = html;
    if (loafHeight) loafHeight.textContent = (heightMicrons / 1000).toFixed(3) + " mm";
    if (layerOut) layerOut.textContent = (heightMicrons / 1000).toFixed(3) + " mm";
    if (heightInput) heightInput.setAttribute("aria-valuetext", (heightMicrons / 1000).toFixed(3) + " millimetres");
    loaf.classList.toggle("is-sliced", reduced || loafState.p > 0.015);
  }
  if (loaf && heightInput) {
    buildStrips(+heightInput.value);
    heightInput.addEventListener("input", function () { buildStrips(+heightInput.value); });
    if (finePointer && !reduced) {
      loaf.addEventListener("pointermove", function (e) {
        var r = loaf.getBoundingClientRect();
        loafState.mxTarget = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
      });
      loaf.addEventListener("pointerleave", function () { loafState.mxTarget = 0; });
    }
  }

  function heroProgress() {
    var vh = win.innerHeight, r = hero.getBoundingClientRect();
    if (r.height > vh * 1.2) {                          // pinned hero: done well before the pin ends
      return clamp(-r.top / ((r.height - vh) * 0.7), 0, 1);
    }
    var center = r.top + r.height / 2;                  // unpinned (mobile): progress as it passes the middle
    return clamp(1 - (center - vh * 0.25) / (vh * 0.9), 0, 1);
  }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  /* ---------- Story: stage follows the active step ---------- */
  var stage = $("[data-stage]"), stepLabel = $("[data-step-label]"), stepCount = $("[data-step-count]");
  var steps = $$(".story-step");
  var stepNames = ["Transform", "Hollow", "Supports", "Slice", "Export"];
  function setStep(n) {
    if (!stage || stage.getAttribute("data-step") === String(n)) return;
    stage.setAttribute("data-step", String(n));
    if (stepLabel) stepLabel.textContent = stepNames[n - 1];
    if (stepCount) stepCount.textContent = String(n);
    steps.forEach(function (s) { s.classList.toggle("is-active", +s.getAttribute("data-step-index") === n); });
    updateLog(win.innerHeight);
  }

  /* ---------- Run log: one real run, event by event as you read ---------- */
  // Each event lights up as the reading line passes through its step's text,
  // in order; "you waited" adds the time each one kept the person waiting
  // (background work adds nothing).
  var logRows = $$("[data-log-step]"), waited = $("[data-waited]");
  var shownWait = 0, waitTarget = -1, waitAnim = null, lastLit = -2;
  function updateLog(vh) {
    if (!logRows.length) return;
    var lit = -1, shown = stage ? +stage.getAttribute("data-step") : 5;
    logRows.forEach(function (li, i) {
      var step = +li.getAttribute("data-log-step");
      var article = steps[step - 1];
      // Never ahead of the capture on screen.
      if (!article || step > shown) return;
      var peers = logRows.filter(function (r) { return r.getAttribute("data-log-step") === li.getAttribute("data-log-step"); });
      var r = article.getBoundingClientRect();
      var p = clamp((vh * 0.6 - r.top) / r.height, 0, 1);
      if (p >= (peers.indexOf(li) + 1) / (peers.length + 1)) lit = i;
    });
    if (lit === lastLit) return;
    lastLit = lit;
    var target = 0;
    logRows.forEach(function (li, i) {
      li.classList.toggle("is-done", i < lit);
      li.classList.toggle("is-now", i === lit);
      if (i <= lit) target += +li.getAttribute("data-wait") || 0;
    });
    if (!waited || target === waitTarget) return;
    waitTarget = target;
    if (reduced) { shownWait = target; waited.textContent = target.toFixed(2); return; }
    var from = shownWait, t0 = null;
    if (waitAnim) cancelAnimationFrame(waitAnim);
    waitAnim = requestAnimationFrame(function tick(t) {
      if (t0 === null) t0 = t;
      var k = clamp((t - t0) / 600, 0, 1);
      shownWait = from + (target - from) * easeOut(k);
      waited.textContent = shownWait.toFixed(2);
      if (k < 1) waitAnim = requestAnimationFrame(tick);
    });
  }
  if ("IntersectionObserver" in win && steps.length) {
    var stepIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setStep(+en.target.getAttribute("data-step-index")); });
    }, { rootMargin: "-40% 0px -40% 0px", threshold: 0 });
    steps.forEach(function (s) { stepIO.observe(s); });
    steps[0].classList.add("is-active");
  }
  // The stage's tabs jump to their step.
  $$("[data-tab]").forEach(function (tab) {
    tab.addEventListener("click", function () {
      var step = $('[data-step-index="' + tab.getAttribute("data-tab") + '"]');
      if (step) step.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    });
  });

  /* ---------- Cursor highlight on cells, magnetic buttons ---------- */
  if (finePointer) {
    doc.addEventListener("pointermove", function (e) {
      var cell = e.target.closest("[data-cell]");
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

  /* ---------- One scroll loop ---------- */
  var parallax = $$("[data-parallax]");
  var ticking = false, lastY = -1;
  function frame() {
    ticking = false;
    var y = win.scrollY, vh = win.innerHeight, docH = doc.documentElement.scrollHeight - vh;
    header.classList.toggle("is-scrolled", y > 8);

    if (railCursor && docH > 0) {
      var pct = clamp(y / docH, 0, 1);
      railCursor.style.top = (pct * 100) + "%";
      if (railProgressWrap) railProgressWrap.style.setProperty("--rail-y", (pct * railCursor.parentNode.clientHeight) + "px");
      if (railProgress) railProgress.textContent = String(Math.round(pct * 100));
    }

    if (loaf && !reduced) {
      var hr = hero.getBoundingClientRect();
      if (hr.bottom > 0 && hr.top < vh) {
        var p = Math.max(easeOut(heroProgress()), loafState.intro);
        loafState.mx += (loafState.mxTarget - loafState.mx) * 0.12;
        if (Math.abs(p - loafState.p) > 0.0005 || Math.abs(loafState.mx - loafState.mxTarget) > 0.002) {
          loafState.p = p;
          loaf.style.setProperty("--p", p.toFixed(4));
          loaf.style.setProperty("--mx", loafState.mx.toFixed(3));
          loaf.classList.toggle("is-sliced", p > 0.015);
          if (loafLayer) loafLayer.textContent = "layer " + String(Math.round(p * loafState.layers)).padStart(4, "0") + " / " + loafState.layers;
          if (Math.abs(loafState.mx - loafState.mxTarget) > 0.002) requestTick();
        }
      }
    }

    updateLog(vh);

    if (!reduced) {
      parallax.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var f = +el.getAttribute("data-parallax") || 0.1;
        var off = ((r.top + r.height / 2) - vh / 2) * -f;
        el.firstElementChild.style.transform = "translate3d(0," + off.toFixed(1) + "px,0)";
      });
    }
    lastY = y;
  }
  function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  win.addEventListener("scroll", requestTick, { passive: true });
  win.addEventListener("resize", requestTick);
  if (loaf && !reduced) loaf.addEventListener("pointermove", requestTick, { passive: true });
  requestTick();

  // Intro: cut the loaf partway on load, so the page moves before anyone scrolls.
  if (loaf && !reduced) {
    var t0 = null;
    var intro = function (t) {
      if (t0 === null) t0 = t;
      var k = clamp((t - t0) / INTRO_MS, 0, 1);
      loafState.intro = INTRO_P * easeOut(k);
      requestTick();
      if (k < 1) requestAnimationFrame(intro);
    };
    setTimeout(function () { requestAnimationFrame(intro); }, 350);
  }

  /* ---------- Demo: Transform drag ---------- */
  (function () {
    var root = $('[data-demo="transform"]'); if (!root) return;
    var svg = $("[data-dt-svg]", root), model = $("[data-dt-model]", root), chip = $("[data-dt-chip]", root), text = $("[data-dt-text]", root);
    var x = 0, startX = 0, dragging = false, scale = 1;
    var LIMIT = 170, MM_PER_UNIT = 0.1;
    function render() {
      model.setAttribute("transform", "translate(" + (240 + x) + " 206)");
      chip.setAttribute("transform", "translate(" + (240 + x) + " 110)");
      var mm = x * MM_PER_UNIT;
      text.textContent = (mm >= 0 ? "+" : "−") + Math.abs(mm).toFixed(2) + " mm";
    }
    model.addEventListener("pointerdown", function (e) {
      dragging = true; startX = e.clientX - x * (scale = svg.getScreenCTM().a);
      model.setPointerCapture(e.pointerId); model.style.cursor = "grabbing"; e.preventDefault();
    });
    model.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      x = clamp((e.clientX - startX) / scale, -LIMIT, LIMIT); render();
    });
    function stop() { dragging = false; model.style.cursor = "grab"; }
    model.addEventListener("pointerup", stop); model.addEventListener("pointercancel", stop);
    svg.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowLeft" ? -5 : e.key === "ArrowRight" ? 5 : e.key === "Home" ? -x : 0;
      if (!d) return; e.preventDefault(); x = clamp(x + d, -LIMIT, LIMIT); render();
    });
    render();
  })();

  /* ---------- Demo: Supports ---------- */
  (function () {
    var root = $('[data-demo="supports"]'); if (!root) return;
    var status = $("[data-ds-status]", root);
    var addBtn = $('[data-ds="add"]', root), remBtn = $('[data-ds="remove"]', root);
    function setPressed(btn, on) { btn.setAttribute("aria-pressed", String(on)); }
    root.addEventListener("click", function (e) {
      var b = e.target.closest("[data-ds]"); if (!b) return;
      var a = b.getAttribute("data-ds");
      if (a === "generate") {
        root.classList.remove("is-grown"); void root.offsetWidth; root.classList.add("is-grown");
        status.textContent = "generated · instant, it was pre-computed";
      } else if (a === "add") {
        var on = !root.classList.contains("show-add");
        root.classList.toggle("show-add", on); root.classList.remove("show-remove");
        setPressed(addBtn, on); setPressed(remBtn, false);
        status.textContent = on ? "A · green candidate, nothing committed" : status.textContent;
      } else if (a === "remove") {
        var on2 = !root.classList.contains("show-remove");
        if (on2 && !root.classList.contains("is-grown")) { status.textContent = "generate first, then mark one for removal"; return; }
        root.classList.toggle("show-remove", on2); root.classList.remove("show-add");
        setPressed(remBtn, on2); setPressed(addBtn, false);
        status.textContent = on2 ? "X · marked in red, one undo per click" : status.textContent;
      } else if (a === "reset") {
        root.classList.remove("is-grown", "show-add", "show-remove"); setPressed(addBtn, false); setPressed(remBtn, false);
        status.textContent = "pre-computed in the background";
      }
    });
  })();

  /* ---------- Demo: Hollow ---------- */
  (function () {
    var root = $('[data-demo="hollow"]'); if (!root) return;
    var wall = $("[data-dh-wall]", root), cavity = $("[data-dh-cavity]", root), holes = $("[data-dh-holes]", root);
    var chip = $("[data-dh-chip]", root), saved = $("[data-dh-saved]", root), mark = $("[data-dh-wallmark]", root), drain = $("[data-dh-drain]", root);
    var PX_PER_MM = 12, R = 150, H = 152;
    function render() {
      var w = +wall.value, wk = w * PX_PER_MM;
      var sx = Math.max((R - wk) / R, 0.05), sy = Math.max((H - 2 * wk) / H, 0.05);
      cavity.setAttribute("transform", "translate(0 " + (-wk).toFixed(1) + ") scale(" + sx.toFixed(4) + " " + sy.toFixed(4) + ")");
      chip.textContent = "wall " + w.toFixed(2) + " mm";
      saved.textContent = "cavity " + Math.round(sx * sx * sy * 100) + " % of volume · illustrative";
      mark.setAttribute("x2", (-R + wk).toFixed(1));
      wall.setAttribute("aria-valuetext", w.toFixed(1) + " millimetres");
      holes.style.opacity = drain.checked ? "1" : "0";
    }
    wall.addEventListener("input", render);
    drain.addEventListener("change", render);
    $$("[data-dh-nudge]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        wall.value = clamp(Math.round((+wall.value + +b.getAttribute("data-dh-nudge")) * 10) / 10, +wall.min, +wall.max); render();
      });
    });
    $("[data-dh-rec]", root).addEventListener("click", function () { wall.value = 2; render(); });
    render();
  })();

  /* ---------- Demo: Slice (canvas, nearest-neighbour zoom) ---------- */
  (function () {
    var root = $('[data-demo="slice"]'); if (!root) return;
    var canvas = $("[data-sl-canvas]", root), layer = $("[data-sl-layer]", root), zoom = $("[data-sl-zoom]", root);
    var layerOut = $("[data-sl-layerout]", root), zoomLabel = $("[data-sl-zoomlabel]", root);
    var W = 384, Hh = 240, MAXL = 1490;                   // one "printer pixel" per cell; canvas shows it at 2×
    canvas.width = W * 2; canvas.height = Hh * 2;
    var off = doc.createElement("canvas"); off.width = W; off.height = Hh;
    var octx = off.getContext("2d"), ctx = canvas.getContext("2d");
    var img = octx.createImageData(W, Hh);
    var FOCUS = { x: 252, y: 96 };                        // where the small island lives

    function bitmap(L) {
      var t = L / MAXL, d = img.data;
      // a dome-ish body: cross-section radius shrinks with height; hollow with a 14-cell wall
      var r = Math.sqrt(Math.max(1 - t * t, 0)) * 104, cx = 160, cy = 120, wallC = 14;
      var inner = Math.max(r - wallC, 0);
      var drainAngle = t < 0.2;                           // drain hole in the first layers
      var islandOn = t > 0.6 && t < 0.78;                 // a tiny detail appearing as its own island
      var islandR = t > 0.7 ? 2 : 0;
      for (var y = 0; y < Hh; y++) for (var x = 0; x < W; x++) {
        var dx = x + 0.5 - cx, dy = (y + 0.5 - cy) * 1.25, dist = Math.sqrt(dx * dx + dy * dy);
        var on = dist <= r && (dist >= inner || t > 0.92);
        if (on && drainAngle && dx > 0 && Math.abs(dy) < 10 && dist > inner) on = false;
        if (islandOn && Math.abs(x - FOCUS.x) <= islandR && Math.abs(y - FOCUS.y) <= islandR) on = true;
        if (t > 0.78 && t < 0.86 && Math.abs(x - FOCUS.x) <= 9 && Math.abs(y - FOCUS.y) <= 6) on = true;
        var i = (y * W + x) * 4;
        d[i] = on ? 236 : 22; d[i + 1] = on ? 238 : 24; d[i + 2] = on ? 239 : 26; d[i + 3] = 255;
      }
      octx.putImageData(img, 0, 0);
    }
    function render() {
      var L = +layer.value, z = Math.pow(2, +zoom.value);
      bitmap(L);
      var sw = W / z, sh = Hh / z;
      var sx = z === 1 ? 0 : clamp(FOCUS.x + 0.5 - sw / 2, 0, W - sw);
      var sy = z === 1 ? 0 : clamp(FOCUS.y + 0.5 - sh / 2, 0, Hh - sh);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(off, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      if (z >= 8) {                                        // pixel grid, like the app's crisp view
        ctx.strokeStyle = "rgba(236,238,239,0.08)"; ctx.lineWidth = 1; ctx.beginPath();
        var cell = canvas.width / sw;
        for (var gx = 0; gx <= sw; gx++) { var px = Math.round(gx * cell) + 0.5; ctx.moveTo(px, 0); ctx.lineTo(px, canvas.height); }
        for (var gy = 0; gy <= sh; gy++) { var py = Math.round(gy * cell) + 0.5; ctx.moveTo(0, py); ctx.lineTo(canvas.width, py); }
        ctx.stroke();
      }
      layerOut.textContent = String(L);
      zoomLabel.textContent = z + "×";
      zoom.setAttribute("aria-valuetext", z + " times");
    }
    layer.addEventListener("input", render);
    zoom.addEventListener("input", render);
    render();
  })();
})();
