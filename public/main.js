/* Breadslicer home page. Vanilla, no dependencies (site.js runs the header).
   Everything scroll-driven runs through one rAF loop; demos only respond to input. */
(function () {
  "use strict";

  var doc = document, win = window;
  var reduced = win.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = win.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (sel, root) { return (root || doc).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

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

  /* ---------- Hero: the wolverine's real layers, stacked as you scroll ---------- */
  // A strip of 96 layers (every ~10th of 913) from the real slice,
  // white on transparent, 280px each, 12 per row.
  var BUILD = { frames: 96, cols: 12, size: 280, total: 913, layerMm: 0.1, picks: [0,10,19,29,38,48,58,67,77,86,96,106,115,125,134,144,154,163,173,182,192,202,211,221,230,240,250,259,269,278,288,298,307,317,326,336,346,355,365,374,384,394,403,413,422,432,442,451,461,470,480,490,499,509,518,528,538,547,557,566,576,586,595,605,614,624,634,643,653,662,672,682,691,701,710,720,730,739,749,758,768,778,787,797,806,816,826,835,845,854,864,874,883,893,902,912] };
  var build = $("[data-build]"), buildCanvas = $("[data-build-canvas]"), flatCanvas = $("[data-build-flat]");
  var buildLayer = $("[data-build-layer]"), buildZ = $("[data-build-z]");
  var hero = $("#hero");
  var buildState = { p: -1, target: 0, sheet: null, edges: null, shown: -1 };
  var ACCENT = "215,167,90";
  var canFilter = (function () { try { var c = doc.createElement("canvas").getContext("2d"); c.filter = "brightness(.5)"; return c.filter === "brightness(.5)"; } catch (e) { return false; } })();

  function sizeCanvas(c) {
    var r = c.getBoundingClientRect(), dpr = Math.min(win.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    return { w: w, h: h };
  }
  function frameXY(n) { return [(n % BUILD.cols) * BUILD.size, Math.floor(n / BUILD.cols) * BUILD.size]; }

  function drawBuild(p) {
    if (!buildState.sheet || !buildState.edges || !buildCanvas) return;
    var top = Math.round(clamp(p, 0, 1) * (BUILD.frames - 1));
    if (top === buildState.shown && !buildState.force) return;
    buildState.force = false;
    var d = sizeCanvas(buildCanvas), ctx = buildCanvas.getContext("2d");
    var W = d.w, H = d.h, S = BUILD.size, sheet = buildState.sheet, edges = buildState.edges;
    var px = W / Math.max(1, buildCanvas.getBoundingClientRect().width);   // device pixels per CSS pixel
    var A = -0.62, cA = Math.cos(A), sA = Math.sin(A);
    var slabPx = 9 * px, ext = 0.25 * (Math.abs(cA) + Math.abs(sA));   // a square's half height on screen, per unit of edge
    // The frame as large as fits: the plate at the bottom, the light sheet of the last layer at the top.
    var fs = Math.min(W * 0.66, (H - slabPx - 16 * px) / (2 * ext + 0.9));   // frame edge on screen
    var dy = (fs * 0.9) / BUILD.frames;               // 91 mm tall over ~102 mm across
    var baseY = H - fs * ext - slabPx - 8 * px;
    // A point of the frame (x, y from its centre) on layer n, on screen.
    function pt(x, y, n) { return [W / 2 + x * cA - y * sA, baseY - n * dy + 0.5 * (x * sA + y * cA)]; }
    function quad(h, n, lift) {                       // the frame's square, half-edge h, on layer n
      var q = [pt(-h, -h, n), pt(h, -h, n), pt(h, h, n), pt(-h, h, n)];
      ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1] + (lift || 0));
      for (var i = 1; i < 4; i++) ctx.lineTo(q[i][0], q[i][1] + (lift || 0));
      ctx.closePath();
      return q;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var prog = top / (BUILD.frames - 1);

    // The build plate: a graphite slab with a fine grid, warmed by the light above it.
    var ph = fs * 0.5, slab = slabPx, pq = [pt(-ph, -ph, -1), pt(ph, -ph, -1), pt(ph, ph, -1), pt(-ph, ph, -1)];
    var sh = ctx.createRadialGradient(W / 2, pq[0][1] * 0.5 + pq[2][1] * 0.5 + 30 * px, 0, W / 2, pq[0][1] * 0.5 + pq[2][1] * 0.5 + 30 * px, fs * 0.75);
    sh.addColorStop(0, "rgba(0,0,0,.55)"); sh.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H);
    for (var e = 0; e < 4; e++) {                     // the slab's sides; the top covers the back ones
      var a = pq[e], b = pq[(e + 1) % 4];
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(b[0], b[1] + slab); ctx.lineTo(a[0], a[1] + slab); ctx.closePath();
      ctx.fillStyle = e % 2 ? "#141617" : "#1d2022"; ctx.fill();
    }
    quad(ph, -1);
    var pg = ctx.createLinearGradient(pq[0][0], pq[0][1], pq[2][0], pq[2][1]);
    pg.addColorStop(0, "#2a2e31"); pg.addColorStop(1, "#1a1d1f");
    ctx.fillStyle = pg; ctx.fill();
    ctx.lineWidth = px; ctx.strokeStyle = "rgba(236,238,239,.14)"; ctx.stroke();
    ctx.save(); quad(ph, -1); ctx.clip();
    ctx.strokeStyle = "rgba(236,238,239,.05)";
    for (var g = 1; g < 10; g++) {
      var t = -ph + (2 * ph * g) / 10, u1 = pt(t, -ph, -1), u2 = pt(t, ph, -1), v1 = pt(-ph, t, -1), v2 = pt(ph, t, -1);
      ctx.beginPath(); ctx.moveTo(u1[0], u1[1]); ctx.lineTo(u2[0], u2[1]); ctx.moveTo(v1[0], v1[1]); ctx.lineTo(v2[0], v2[1]); ctx.stroke();
    }
    var c0 = pt(0, 0, -1), glow = ctx.createRadialGradient(c0[0], c0[1], 0, c0[0], c0[1], fs * 0.5);
    glow.addColorStop(0, "rgba(" + ACCENT + "," + (0.10 + 0.08 * prog).toFixed(3) + ")"); glow.addColorStop(1, "rgba(" + ACCENT + ",0)");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // Each layer done is cured resin: a warm fill and a lighter outline, darker
    // at the bottom, so the stack reads as a solid lit from above. The layer
    // being exposed glows amber on its light sheet; the ones to come, a ghost.
    function put(src, n, alpha, filter) {
      var xy = frameXY(n);
      ctx.save();
      ctx.translate(W / 2, baseY - n * dy);
      ctx.scale(1, 0.5);
      ctx.rotate(A);
      ctx.globalAlpha = alpha;
      if (canFilter) ctx.filter = filter;
      ctx.drawImage(src, xy[0], xy[1], S, S, -fs / 2, -fs / 2, fs, fs);
      ctx.restore();
    }
    var sheetT = buildState.sheetT || sheet, edgesT = buildState.edgesT || edges;
    for (var n = 0; n < BUILD.frames; n++) {
      if (n > top) {
        put(edges, n, 0.06, "none");
      } else if (n === top) {
        if (canFilter) ctx.filter = "none";
        quad(fs * 0.5, n);                              // the light sheet, the screen's square at this height
        ctx.fillStyle = "rgba(" + ACCENT + ",.045)"; ctx.fill();
        ctx.lineWidth = px; ctx.strokeStyle = "rgba(" + ACCENT + ",.32)"; ctx.stroke();
        put(sheetT, n, 0.95, "brightness(1.25) saturate(1.2)");
        ctx.save();
        ctx.shadowColor = "rgba(255,170,80,.95)"; ctx.shadowBlur = 16 * px;
        put(edgesT, n, 1, "brightness(1.45)");
        ctx.restore();
      } else {
        var k = n / Math.max(top, 1);
        put(sheetT, n, canFilter ? 1 : 0.3, "brightness(" + (0.3 + 0.3 * k).toFixed(3) + ")");
        put(edgesT, n, canFilter ? 0.9 : 0.45 + 0.4 * k, "brightness(" + (0.5 + 0.55 * k).toFixed(3) + ")");
      }
    }
    if (canFilter) ctx.filter = "none";

    if (flatCanvas) {                                  // the layer itself, top down, crisp
      var f = sizeCanvas(flatCanvas), fc = flatCanvas.getContext("2d"), t = frameXY(top);
      fc.setTransform(1, 0, 0, 1, 0, 0);
      fc.clearRect(0, 0, f.w, f.h);
      fc.imageSmoothingEnabled = false;
      fc.drawImage(sheet, t[0], t[1], S, S, 0, 0, f.w, f.h);
    }
    var layer = BUILD.picks[top] + 1;
    if (buildLayer) buildLayer.textContent = String(layer);
    if (buildZ) buildZ.textContent = (layer * BUILD.layerMm).toFixed(1);
    buildState.shown = top;
  }

  // The strips are white on transparent. Each frame is painted once in the colour
  // of its height, crust at the plate to gold at the top (outlines lighter), so
  // drawing only has to dim it: filters can't colour white.
  function tint(img, edge) {
    try {
      var c = doc.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight;
      var x = c.getContext("2d");
      x.drawImage(img, 0, 0);
      x.globalCompositeOperation = "source-atop";
      for (var n = 0; n < BUILD.frames; n++) {
        var h = n / (BUILD.frames - 1), xy = frameXY(n);
        var r = 196 + 40 * h, g = 98 + 92 * h, b = 38 + 70 * h;
        if (edge) { r += (250 - r) * 0.45; g += (236 - g) * 0.45; b += (205 - b) * 0.45; }
        x.fillStyle = "rgb(" + (r | 0) + "," + (g | 0) + "," + (b | 0) + ")";
        x.fillRect(xy[0], xy[1], BUILD.size, BUILD.size);
      }
      return c;
    } catch (e) { return img; }
  }

  if (build) {
    [["sheet", "assets/layers/wolverine-layers.png"], ["edges", "assets/layers/wolverine-edges.png"]].forEach(function (s) {
      var img = new Image();
      img.decoding = "async";
      img.onload = function () { buildState[s[0]] = img; buildState[s[0] + "T"] = tint(img, s[0] === "edges"); buildState.force = true; requestTick(); };
      img.src = s[1];
    });
    win.addEventListener("resize", function () { buildState.force = true; });
  }

  function heroProgress() {
    var vh = win.innerHeight, r = hero.getBoundingClientRect();
    if (r.height > vh * 1.2) {                          // pinned hero: the build spans the whole pin
      return clamp(-r.top / (r.height - vh), 0, 1);
    }
    var center = r.top + r.height / 2;                  // unpinned (mobile): progress as it passes the middle
    return clamp(1 - (center - vh * 0.25) / (vh * 0.9), 0, 1);
  }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  /* ---------- Story: stage follows the active step ---------- */
  var stage = $("[data-stage]"), stepLabel = $("[data-step-label]"), stepCount = $("[data-step-count]");
  var steps = $$(".story-step");
  var stepNames = ["Prepare", "Hollow", "Supports", "Slice"];
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

  /* ---------- One scroll loop ---------- */
  var parallax = $$("[data-parallax]");
  var ticking = false, lastY = -1;
  function frame() {
    ticking = false;
    var y = win.scrollY, vh = win.innerHeight, docH = doc.documentElement.scrollHeight - vh;

    if (railCursor && docH > 0) {
      var pct = clamp(y / docH, 0, 1);
      railCursor.style.top = (pct * 100) + "%";
      if (railProgressWrap) railProgressWrap.style.setProperty("--rail-y", (pct * railCursor.parentNode.clientHeight) + "px");
      if (railProgress) railProgress.textContent = String(Math.round(pct * 100));
    }

    if (build) {
      var hr = hero.getBoundingClientRect();
      if (hr.bottom > 0 && hr.top < vh) {
        // Scrolling builds it from the first layer to the last across the
        // whole pin. The build glides toward where the scroll is, so a wheel
        // step plays through every layer in between instead of jumping.
        buildState.target = reduced ? 1 : heroProgress();
        if (buildState.p < 0 || reduced) buildState.p = buildState.target;
        else buildState.p += (buildState.target - buildState.p) * 0.12;
        if (Math.abs(buildState.target - buildState.p) > 0.0015) requestTick();
        else buildState.p = buildState.target;
        drawBuild(buildState.p);
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
  requestTick();

  /* ---------- Close-ups: play while on screen; sets of clips take turns ---------- */
  $$("[data-clipset]").forEach(function (set) {
    var clips = $$("[data-clip]", set), at = 0;
    if (clips.length > 1) {
      clips.forEach(function (v) { v.loop = false; });
      clips.forEach(function (v, i) {
        v.addEventListener("ended", function () {
          v.classList.remove("is-on");
          at = (i + 1) % clips.length;
          clips[at].classList.add("is-on");
          clips[at].currentTime = 0;
          clips[at].play().catch(function () {});
        });
      });
    }
    if (reduced || !("IntersectionObserver" in win)) return;      // posters only
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = clips[at];
        if (en.isIntersecting) { v.play().catch(function () {}); }
        else clips.forEach(function (c) { c.pause(); });
      });
    }, { threshold: 0.35 }).observe(set);
  });

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
