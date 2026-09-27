/* Shared nav + footer injector and home-page animations for the SViam site.
   Pages include <nav class="site" data-nav></nav> and <footer class="site" data-foot></footer>
   and set <body data-page="product"> to mark the active nav item. */
(function () {
  var BRAND =
    '<a class="brand" href="index.html">' +
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="1.4" y="1.4" width="21.2" height="21.2" rx="6" stroke="#0b0f0d" stroke-width="1.5"/><path d="M6.5 15.4C7.9 10.7 9.5 8.4 12 8.4s4.1 2.3 5.5 7" stroke="#12a150" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="12" r="1.7" fill="#0b0f0d"/></svg>' +
    'SViam</a>';

  // Logged-out (marketing) nav.
  var NAV = [
    ["product", "Product", "product.html"],
    ["developers", "For developers", "practice.html"],
    ["companies", "For companies", "companies.html"],
    ["pricing", "Pricing", "pricing.html"],
  ];
  // Candidate nav: no "For companies", their own pages + a logout.
  var CAND_NAV = [
    ["dashboard", "Dashboard", "app-candidate.html"],
    ["practice", "Practice", "questions.html"],
    ["history", "History", "app-candidate.html#history"],
    ["pricing", "Pricing", "pricing.html"],
  ];
  // Company nav: the hiring pages + a logout.
  var CO_NAV = [
    ["dashboard", "Dashboard", "app-company.html"],
    ["jobs", "Jobs", "app-company.html#jobs"],
    ["candidates", "Candidates", "app-company.html#candidates"],
    ["pricing", "Pricing", "pricing.html"],
  ];
  function getSession() { try { return JSON.parse(localStorage.getItem("sviam_demo") || "null"); } catch (e) { return null; } }
  function initials(name) { return (name || "").trim().split(/\s+/).map(function (w) { return w.charAt(0); }).join("").slice(0, 2).toUpperCase(); }

  function navLinks(items, active) {
    return items.map(function (n) {
      return '<a href="' + n[2] + '"' + (n[0] === active ? ' class="active"' : "") + ">" + n[1] + "</a>";
    }).join("");
  }

  function buildNav(active) {
    var s = getSession();
    if (s && (s.role === "candidate" || s.role === "company")) {
      var items = s.role === "candidate" ? CAND_NAV : CO_NAV;
      var homeHref = s.role === "candidate" ? "app-candidate.html" : "app-company.html";
      var brand = '<a class="brand" href="' + homeHref + '">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="1.4" y="1.4" width="21.2" height="21.2" rx="6" stroke="#0b0f0d" stroke-width="1.5"/><path d="M6.5 15.4C7.9 10.7 9.5 8.4 12 8.4s4.1 2.3 5.5 7" stroke="#12a150" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="12" r="1.7" fill="#0b0f0d"/></svg>SViam</a>';
      return '<div class="wrap nav-in">' + brand +
        '<div class="nav-links">' + navLinks(items, active) + "</div>" +
        '<div class="nav-right"><span class="acct"><span class="av">' + initials(s.name) + "</span>" + s.name + "</span>" +
        '<button class="applogout" data-logout>Log out</button></div>' +
        "</div>";
    }
    return (
      '<div class="wrap nav-in">' + BRAND +
      '<div class="nav-links">' + navLinks(NAV, active) + "</div>" +
      '<div class="nav-right"><a class="login" href="signin.html">Log in</a>' +
      '<a class="btn btn-green" href="signin.html">Get started</a></div>' +
      "</div>"
    );
  }

  var BRAND_DARK =
    '<a class="brand" href="index.html">' +
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="1.4" y="1.4" width="21.2" height="21.2" rx="6" stroke="#ffffff" stroke-width="1.5"/><path d="M6.5 15.4C7.9 10.7 9.5 8.4 12 8.4s4.1 2.3 5.5 7" stroke="#12a150" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="12" r="1.7" fill="#ffffff"/></svg>' +
    'SViam</a>';

  function buildFooter() {
    return (
      '<div class="wrap">' +
      '<div class="foot-main">' +
        '<div class="foot-brand-block">' + BRAND_DARK +
          '<p class="foot-tag">An AI technical interviewer. Practise the interview, or run it.</p>' +
          '<a class="btn btn-green" href="signin.html">Get started</a></div>' +
        '<div class="foot-cols">' +
          '<div><div class="foot-h">Product</div>' +
            '<a href="product.html">Product</a><a href="practice.html">For developers</a>' +
            '<a href="pricing.html">Pricing</a></div>' +
          '<div><div class="foot-h">For companies</div>' +
            '<a href="companies.html">Hiring pilot</a><a href="resources.html">Resources</a></div>' +
          '<div><div class="foot-h">Company</div>' +
            '<a href="about.html">About</a><a href="careers.html">Careers</a>' +
            '<a href="contact.html">Contact</a></div>' +
        '</div>' +
      '</div>' +
      '<div class="foot-legal-row">' +
        '<span>SVIAM AI PRIVATE LIMITED &middot; 2026</span>' +
        '<a href="mailto:vikas.kumar@sviam.in">vikas.kumar@sviam.in</a>' +
      '</div>' +
      '</div>'
    );
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var active = document.body.getAttribute("data-page") || "";
    var nav = document.querySelector("nav.site[data-nav]");
    if (nav) nav.innerHTML = buildNav(active);
    var logoutBtn = document.querySelector("[data-logout]");
    if (logoutBtn) logoutBtn.addEventListener("click", function () {
      try { localStorage.removeItem("sviam_demo"); } catch (e) {}
      location.href = "index.html";
    });
    var foot = document.querySelector("footer.site[data-foot]");
    if (foot) foot.innerHTML = buildFooter();

    // Logo wall: show clean wordmarks by default; if a real logo file exists in
    // logos/<name>.svg or .png, test-load it and swap it in (no broken-image flicker).
    var wall = document.getElementById("logowall");
    if (wall) {
      var spans = wall.querySelectorAll("span");
      var defs = (wall.getAttribute("data-logos") || "").split(",");
      defs.forEach(function (d, idx) {
        var name = (d.split(":")[0] || "").trim();
        var span = spans[idx];
        if (!name || !span) return;
        ["svg", "png"].forEach(function (ext) {
          var probe = new Image();
          probe.onload = function () {
            if (!span.parentNode) return;
            var el = document.createElement("img");
            el.src = "logos/" + name + "." + ext;
            el.alt = span.textContent;
            el.className = "logo";
            span.replaceWith(el);
          };
          probe.src = "logos/" + name + "." + ext;
        });
      });
    }

    if (nav) {
      var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
      onScroll();
      addEventListener("scroll", onScroll, { passive: true });
    }

    // Tabs (Transcript / Code replay / Scorecard etc.)
    document.querySelectorAll("[data-tabs]").forEach(function (group) {
      var btns = group.querySelectorAll(".tab-btn");
      var panels = group.querySelectorAll(".tab-panel");
      btns.forEach(function (b, i) {
        b.addEventListener("click", function () {
          btns.forEach(function (x) { x.classList.remove("active"); });
          panels.forEach(function (x) { x.classList.remove("active"); });
          b.classList.add("active");
          if (panels[i]) panels[i].classList.add("active");
        });
      });
    });

    // Pricing audience switch (segmented control + URL hash)
    var seg = document.querySelector("[data-audience]");
    if (seg) {
      var links = seg.querySelectorAll("a");
      var groups = document.querySelectorAll(".paudience");
      var showAud = function (id) {
        links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + id); });
        groups.forEach(function (g) { g.classList.toggle("active", g.id === id); });
      };
      var initial = (location.hash || "").replace("#", "") || "developers";
      if (!document.getElementById(initial)) initial = "developers";
      showAud(initial);
      // deep link should select the tab but stay at the top (no anchor jump)
      if (location.hash) window.scrollTo(0, 0);
      links.forEach(function (a) {
        a.addEventListener("click", function (e) {
          e.preventDefault();
          var id = a.getAttribute("href").replace("#", "");
          showAud(id);
          // update URL without jumping the page
          if (history.replaceState) history.replaceState(null, "", "#" + id);
        });
      });
    }

    // Question library filter (search + topic + difficulty)
    var qt = document.getElementById("qtable");
    if (qt) {
      var rows = Array.prototype.slice.call(qt.querySelectorAll(".qr"));
      var search = document.getElementById("qsearch");
      var topicChips = document.querySelectorAll("[data-topic]");
      var diffChips = document.querySelectorAll("[data-diff]");
      var empty = document.getElementById("qempty");
      var qstate = { q: "", topic: "All", diff: "All" };
      var applyQ = function () {
        var shown = 0;
        rows.forEach(function (r) {
          var t = (r.getAttribute("data-title") || "").toLowerCase();
          var top = r.getAttribute("data-topickey") || "";
          var df = r.getAttribute("data-diffkey") || "";
          var ok = (!qstate.q || t.indexOf(qstate.q) > -1) &&
                   (qstate.topic === "All" || top === qstate.topic) &&
                   (qstate.diff === "All" || df === qstate.diff);
          r.style.display = ok ? "" : "none";
          if (ok) shown++;
        });
        if (empty) empty.style.display = shown ? "none" : "block";
      };
      if (search) search.addEventListener("input", function () { qstate.q = search.value.trim().toLowerCase(); applyQ(); });
      topicChips.forEach(function (c) { c.addEventListener("click", function () {
        topicChips.forEach(function (x) { x.classList.remove("active"); }); c.classList.add("active");
        qstate.topic = c.getAttribute("data-topic"); applyQ();
      }); });
      diffChips.forEach(function (c) { c.addEventListener("click", function () {
        diffChips.forEach(function (x) { x.classList.remove("active"); }); c.classList.add("active");
        qstate.diff = c.getAttribute("data-diff"); applyQ();
      }); });
    }

    var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // rotating headline word, INLINE on one line. Its slot width is measured
    // per word and transitions in CSS, so the line glides and never reflows.
    var rot = document.getElementById("rot");
    if (rot) {
      var words = (rot.getAttribute("data-words") || "Practice,Master,Run,Score").split(",");
      var widths = {};
      var measureWords = function () {
        var m = document.createElement("span");
        var cs = getComputedStyle(rot);
        m.style.cssText =
          "position:absolute;left:-9999px;top:0;visibility:hidden;white-space:nowrap;" +
          "font-family:" + cs.fontFamily + ";font-size:" + cs.fontSize +
          ";font-weight:" + cs.fontWeight + ";letter-spacing:" + cs.letterSpacing;
        document.body.appendChild(m);
        var maxW = 0;
        words.forEach(function (w) { m.textContent = w; widths[w] = Math.ceil(m.getBoundingClientRect().width); if (widths[w] > maxW) maxW = widths[w]; });
        document.body.removeChild(m);
        // A fixed slot pushes short words off-centre. For a centered hero with the
        // rotating word at the FRONT, keep it natural width so the line stays balanced.
        if (rot.getAttribute("data-fixed") === "true") {
          rot.style.width = maxW + "px";
        } else {
          rot.style.width = "";
        }
      };
      measureWords();
      // re-measure once the web font actually loads (initial measure can use
      // fallback metrics and clip the word)
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureWords);
      addEventListener("resize", measureWords, { passive: true });
      if (!reduce) {
        var wi = 0;
        setInterval(function () {
          rot.classList.add("out");
          setTimeout(function () {
            wi = (wi + 1) % words.length;
            rot.textContent = words[wi];
            rot.classList.remove("out");
          }, 280);
        }, 2600);
      }
    }

    // animated interview demo: Maya highlights -> types the fix -> talks, loop
    var l5 = document.getElementById("l5"),
      typed = document.getElementById("typed"),
      mayaMsg = document.getElementById("mayaMsg"),
      footMsg = document.getElementById("footMsg");
    var sigEls = {};
    document.querySelectorAll("#signals .sig").forEach(function (el) { sigEls[el.getAttribute("data-sig")] = el; });
    var sig = function (name, on) { if (sigEls[name]) sigEls[name].classList.toggle("on", on !== false); };
    var sigReset = function () { Object.keys(sigEls).forEach(function (k) { sigEls[k].classList.remove("on"); }); };

    if (l5 && typed) {
      var RET = "return [seen[target - n], i]";
      var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
      var retKw = function (s) { return s.replace("return", '<span class="kw">return</span>'); };
      if (reduce) { typed.innerHTML = retKw(RET); Object.keys(sigEls).forEach(function (k) { sigEls[k].classList.add("on"); }); return; }
      (async function clip() {
        while (true) {
          typed.innerHTML = ""; l5.classList.remove("hl"); sigReset();
          if (mayaMsg) mayaMsg.textContent = "Walk me through your approach before you write anything.";
          if (footMsg) footMsg.textContent = "Maya is listening. Speak your reasoning as you code.";
          await sleep(1200);
          sig("reasoning");
          l5.classList.add("hl");
          if (mayaMsg) mayaMsg.textContent = "Look at line 5. When the match is found, what do you return?";
          if (footMsg) footMsg.textContent = "Maya highlighted a line.";
          await sleep(1900);
          l5.classList.remove("hl");
          if (footMsg) footMsg.textContent = "You are editing the solution.";
          for (var i = 1; i <= RET.length; i++) { typed.innerHTML = retKw(RET.slice(0, i)); await sleep(50); }
          sig("edge");
          await sleep(800);
          if (mayaMsg) mayaMsg.innerHTML = 'Nice. Now, what is the time complexity? <span class="dots"><i></i><i></i><i></i></span>';
          if (footMsg) footMsg.textContent = "Maya is speaking.";
          sig("complexity");
          await sleep(1500);
          sig("comm");
          await sleep(1500);
        }
      })();
    }
  });
})();
