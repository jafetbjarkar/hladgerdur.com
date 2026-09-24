/* Hlaðgerður Íris — site behaviour. No dependencies. */
(function () {
  "use strict";

  var W = window.WORKS || [];
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var el = function (tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  function labelHTML(w) {
    var h = '<span class="label__no">' + pad(w.n) + "</span>";
    if (w.title) h += '<span class="label__title">' + esc(w.title) +
      (w.subtitle ? ' <em class="label__sub">' + esc(w.subtitle) + "</em>" : "") + "</span>";
    var meta = [];
    if (w.year) meta.push(w.year);
    if (w.medium) meta.push(esc(w.medium));
    if (w.size) meta.push(esc(w.size) + " cm");
    if (meta.length) h += '<span class="label__meta">' + meta.join(" · ") + "</span>";
    return h;
  }

  function frame(w, i, sizes, eager) {
    var b = el("button", "frame");
    b.type = "button";
    b.dataset.open = i;
    b.style.setProperty("--ar", w.w + " / " + w.h);
    b.style.setProperty("--tone", w.tone);
    b.setAttribute("aria-label", "View No. " + pad(w.n) + (w.title ? ", " + w.title : ""));
    var img = new Image();
    img.alt = w.alt || "";
    img.width = w.w; img.height = w.h;
    img.decoding = "async";
    if (!eager) img.loading = "lazy";
    img.sizes = sizes;
    img.srcset = "works/" + w.src + "-800.jpg 800w, works/" + w.src + "-1600.jpg 1600w";
    img.src = "works/" + w.src + "-800.jpg";
    watchLoad(img);
    b.appendChild(img);
    return b;
  }

  function watchLoad(img) {
    var done = function () { img.classList.add("is-loaded"); };
    if (img.complete && img.naturalWidth) done();
    else { img.addEventListener("load", done); img.addEventListener("error", done); }
  }

  /* ——— Hero ——— */
  var heroFrame = $(".hero__work .frame");
  var HI = Math.max(0, W.findIndex(function (w) { return heroFrame && w.src === heroFrame.dataset.src; }));
  var heroLabel = $("#hero-label");
  if (heroLabel && W[HI]) heroLabel.innerHTML = labelHTML(W[HI]);
  if (heroFrame && W[HI]) {
    heroFrame.dataset.open = HI;
    heroFrame.style.setProperty("--ar", W[HI].w + " / " + W[HI].h);
    heroFrame.style.setProperty("--tone", W[HI].tone);
    watchLoad(heroFrame.querySelector("img"));
  }

  /* ——— Salon: an uneven hang ———
     Each row template lists [startColumn, span, offsetTop]. Landscapes get wider. */
  var SINGLES = [[2, 5], [8, 4], [4, 5], [7, 5], [1, 4], [6, 4], [3, 5], [9, 4]];
  var PAIRS = [
    [[1, 3, "14vw"], [6, 4]],
    [[2, 4], [9, 3, "22vw"]],
    [[1, 4, "8vw"], [8, 4]],
    [[3, 3], [8, 4, "12vw"]]
  ];
  var RHYTHM = "SSPSPSSP"; // S = one work on the wall, P = two side by side
  var MOBILE = ["1 / span 10", "3 / span 10", "2 / span 9", "1 / span 11", "4 / span 9"];

  var salon = $("#salon");
  var isLand = function (w) { return w.w / w.h > 1.12; };
  var yearOf = function (w) { return w.year || "Undated"; };
  var countYear = function (y) { return W.filter(function (w) { return yearOf(w) === y; }).length; };
  function yearMark(y, row) {
    var n = countYear(y);
    var m = el("div", "year-mark", '<span class="year-mark__y">' + y + '</span><span class="year-mark__c">' +
      n + (n === 1 ? " work" : " works") + "</span>");
    m.style.gridColumn = "1 / -1";
    if (row) m.style.gridRow = row;
    return m;
  }

  function place(fig, w, slot, row) {
    var start = slot[0], span = slot[1];
    if (isLand(w)) {
      span = Math.min(Math.max(span + 3, 6), 8);
      if (start + span > 13) start = 13 - span;
    }
    fig.style.gridColumn = start + " / span " + span;
    fig.style.gridRow = row;
    if (slot[2]) fig.style.marginTop = slot[2];
    fig.style.setProperty("--m", isLand(w) ? "1 / -1" : MOBILE[row % MOBILE.length]);
    var vw = Math.round(span / 12 * 100);
    return "(min-width: 900px) " + vw + "vw, 90vw";
  }

  if (salon) {
    var i = 0, t = 0, row = 1, si = 0, pi = 0, lastYear = null;
    while (i < W.length) {
      if (yearOf(W[i]) !== lastYear) {
        lastYear = yearOf(W[i]);
        salon.appendChild(yearMark(lastYear, row++));
      }
      var tpl;
      var wantPair = RHYTHM[t % RHYTHM.length] === "P";
      var a = W[i], b = W[i + 1];
      var carry = false;
      var sameYear = b && yearOf(a) === yearOf(b);
      if (wantPair && sameYear && !isLand(a) && !isLand(b)) tpl = PAIRS[pi++ % PAIRS.length];
      else { tpl = [SINGLES[si++ % SINGLES.length]]; carry = wantPair; } // keep the wish for a pair
      for (var k = 0; k < tpl.length; k++) {
        var w = W[i];
        var fig = el("figure", "work");
        fig.dataset.i = i;
        var sizes = place(fig, w, tpl[k], row);
        fig.appendChild(frame(w, i, sizes, false));
        var cap = el("figcaption", "label", labelHTML(w));
        fig.appendChild(cap);
        salon.appendChild(fig);
        i++;
      }
      if (!carry) t++;
      row++;
    }
  }

  /* ——— Index ——— */
  var index = $("#index");
  if (index) {
    var group = null, gy = null;
    W.forEach(function (w, i) {
      if (yearOf(w) !== gy) {
        gy = yearOf(w);
        index.appendChild(yearMark(gy));
        group = el("div", "index__group");
        index.appendChild(group);
      }
      var c = el("figure", "cell");
      c.style.setProperty("--g", (w.w / w.h).toFixed(3));
      c.appendChild(frame(w, i, "(min-width: 900px) 20vw, 45vw", false));
      c.appendChild(el("span", "no", pad(w.n)));
      group.appendChild(c);
    });
  }

  /* ——— View switch ——— */
  var switches = document.querySelectorAll(".view-switch button");
  function setView(v, save) {
    var isIndex = v === "index";
    salon.hidden = isIndex;
    index.hidden = !isIndex;
    switches.forEach(function (s) { s.setAttribute("aria-pressed", String(s.dataset.view === v)); });
    if (save) { try { localStorage.setItem("hi-view", v); } catch (e) {} }
    if (counter) counter.classList.toggle("on", false);
  }
  switches.forEach(function (s) {
    s.addEventListener("click", function () { setView(s.dataset.view, true); });
  });
  var counter = el("div", "counter", "<b></b><i></i><span></span>");
  counter.setAttribute("aria-hidden", "true");
  document.body.appendChild(counter);
  try { var saved = localStorage.getItem("hi-view"); if (saved === "index") setView("index"); } catch (e) {}

  /* ——— Scroll: reveal, room tint, counter, nav ——— */
  var hela = getComputedStyle(root).getPropertyValue("--hela").trim() || "#e7e3dc";
  function tint(c) { root.style.setProperty("--tint", c || hela); }

  if ("IntersectionObserver" in window) {
    var reveal = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); reveal.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    document.querySelectorAll(".work").forEach(function (f) { reveal.observe(f); });

    var centre = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var idx = +e.target.dataset.i, w = W[idx];
        tint(w.tone);
        counter.querySelector("b").textContent = pad(w.n);
        counter.querySelector("span").textContent = "/ " + pad(W.length);
        counter.style.setProperty("--p", ((idx + 1) / W.length).toFixed(3));
        counter.classList.add("on");
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    document.querySelectorAll(".work").forEach(function (f) { centre.observe(f); });

    var navLinks = document.querySelectorAll(".bar__nav a");
    var sections = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.id;
        if (id !== "works") { tint(); counter.classList.remove("on"); }
        navLinks.forEach(function (a) { a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + id)); });
      });
    }, { rootMargin: "-50% 0px -50% 0px" });
    document.querySelectorAll(".hero, #works, #studio, #contact").forEach(function (s) { sections.observe(s); });

    // leaving the salon at the top should clear the tint
    var headWatch = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { tint(); counter.classList.remove("on"); } });
    }, { rootMargin: "-45% 0px -45% 0px" });
    document.querySelectorAll(".section-head, .hero, .foot").forEach(function (s) { headWatch.observe(s); });
  } else {
    document.querySelectorAll(".work").forEach(function (f) { f.classList.add("in"); });
  }

  /* ——— Viewer ——— */
  var dlg = $("#viewer");
  var vImg = $(".viewer__img", dlg);
  var vLabel = $(".viewer__label", dlg);
  var vCount = $(".viewer__count", dlg);
  var cur = 0, lastFocus = null;

  function preload(i) {
    var w = W[(i + W.length) % W.length];
    if (w) { var p = new Image(); p.src = "works/" + w.src + "-1600.jpg"; }
  }

  function show(i, instant) {
    cur = (i + W.length) % W.length;
    var w = W[cur];
    var swap = function () {
      vImg.src = "works/" + w.src + "-1600.jpg";
      vImg.alt = w.alt || "";
      vLabel.innerHTML = labelHTML(w);
      vCount.textContent = pad(w.n) + " / " + pad(W.length);
      dlg.style.setProperty("--vt", w.tone);
      var ready = function () { vImg.classList.remove("is-swapping"); };
      if (vImg.complete) ready(); else vImg.onload = ready;
      try { history.replaceState(null, "", "#no-" + pad(w.n)); } catch (e) {}
    };
    if (instant || reduce) swap();
    else { vImg.classList.add("is-swapping"); setTimeout(swap, 220); }
    preload(cur + 1); preload(cur - 1);
  }

  function open(i) {
    lastFocus = document.activeElement;
    show(i, true);
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    dlg.focus();
    document.body.style.overflow = "hidden";
  }
  function close() { if (dlg.open) dlg.close(); }

  dlg.addEventListener("close", function () {
    document.body.style.overflow = "";
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  });

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-open]");
    if (b) { e.preventDefault(); open(+b.dataset.open); }
  });
  $(".viewer__prev", dlg).addEventListener("click", function () { show(cur - 1); });
  $(".viewer__next", dlg).addEventListener("click", function () { show(cur + 1); });
  $(".viewer__close", dlg).addEventListener("click", close);
  $(".viewer__stage", dlg).addEventListener("click", function (e) { if (e.target === e.currentTarget) close(); });
  dlg.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); show(cur + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); show(cur - 1); }
  });

  // swipe
  var sx = null, sy = null;
  dlg.addEventListener("pointerdown", function (e) { sx = e.clientX; sy = e.clientY; });
  dlg.addEventListener("pointerup", function (e) {
    if (sx === null) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) show(cur + (dx < 0 ? 1 : -1));
    sx = sy = null;
  });

  // deep link: #no-07
  var m = /^#no-(\d+)$/.exec(location.hash);
  if (m) { var n = +m[1]; var idx = W.findIndex(function (w) { return w.n === n; }); if (idx > -1) open(idx); }

  /* ——— Bar gets a veil once you scroll ——— */
  var bar = $(".bar");
  var onScroll = function () { bar.classList.toggle("is-scrolled", window.scrollY > 40); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ——— Intro ——— */
  requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add("ready"); }); });
})();
