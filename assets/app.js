/* ==========================================================================
   Fouad Boudouhi — persönliche Seite
   Sprachumschaltung, Hell/Dunkel, Bewegung, Druckvorbereitung.
   Kein Framework, kein Build-Schritt. Was hier steht, läuft im Browser.
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var sparsam = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------- Sprache */

  var SCHLUESSEL = "fb-lang";

  function gespeicherteSprache() {
    try {
      var v = window.localStorage.getItem(SCHLUESSEL);
      return v === "de" || v === "en" ? v : null;
    } catch (e) {
      return null;
    }
  }

  function merkeSprache(lang) {
    try { window.localStorage.setItem(SCHLUESSEL, lang); } catch (e) { /* privater Modus */ }
  }

  function setzeSprache(lang, merken) {
    root.setAttribute("lang", lang);
    root.setAttribute("data-lang", lang);
    var knoepfe = document.querySelectorAll("[data-set-lang]");
    for (var i = 0; i < knoepfe.length; i++) {
      knoepfe[i].setAttribute("aria-pressed", knoepfe[i].getAttribute("data-set-lang") === lang ? "true" : "false");
    }
    if (merken) merkeSprache(lang);
  }

  var start = gespeicherteSprache() || (navigator.language || "de").slice(0, 2).toLowerCase();
  setzeSprache(start === "en" ? "en" : "de", false);

  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest ? ev.target.closest("[data-set-lang]") : null;
    if (!btn) return;
    setzeSprache(btn.getAttribute("data-set-lang"), true);
    if (typeof zeichne === "function") zeichne();
  });

  /* --------------------------------------------------------- Hell/Dunkel */
  // Standard ist dunkel. Das Kopf-Skript setzt data-theme vor dem ersten
  // Zeichnen aus dem Speicher; hier kommen nur Schalter und Merken dazu.

  var THEMA = "fb-theme";

  function setzeThema(hell, merken) {
    if (hell) root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
    var knoepfe = document.querySelectorAll("[data-toggle-theme]");
    for (var i = 0; i < knoepfe.length; i++) {
      knoepfe[i].setAttribute("aria-pressed", hell ? "true" : "false");
    }
    if (merken) {
      try { window.localStorage.setItem(THEMA, hell ? "light" : "dark"); } catch (e) { /* privater Modus */ }
    }
  }

  setzeThema(root.getAttribute("data-theme") === "light", false);

  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest ? ev.target.closest("[data-toggle-theme]") : null;
    if (!btn) return;
    setzeThema(root.getAttribute("data-theme") !== "light", true);
  });

  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest ? ev.target.closest("[data-print]") : null;
    if (btn) window.print();
  });

  // Beim Drucken soll die vollständige Tabelle mit aufs Papier.
  window.addEventListener("beforeprint", function () {
    document.querySelectorAll("details").forEach(function (d) { d.open = true; });
  });

  /* ------------------------------------------------------------ Bewegung */

  var balken = document.getElementById("fortschritt");
  var schein = document.getElementById("schein");
  var kopf = document.getElementById("kopf");

  window.addEventListener("scroll", function () {
    if (balken) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      balken.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    }
    if (kopf) kopf.classList.toggle("ab", window.scrollY > 12);
  }, { passive: true });

  if (schein && !sparsam) {
    window.addEventListener("pointermove", function (e) {
      schein.style.setProperty("--x", e.clientX + "px");
      schein.style.setProperty("--y", e.clientY + "px");
    }, { passive: true });
  }

  // Zahl von null hochzählen, sobald sie ins Bild kommt.
  function zaehle(el) {
    var ziel = parseFloat(el.dataset.ziel),
        nk = +(el.dataset.nk || 0),
        pre = el.dataset.pre || "",
        suf = el.dataset.suf || "",
        t0 = null, dauer = 1200;

    function schreibe(v) {
      // Schmales geschuetztes Leerzeichen: die Einheit darf nie allein umbrechen.
      el.textContent = pre + v.toFixed(nk).replace(".", ",") + (suf ? " " + suf : "");
    }
    if (sparsam) { schreibe(ziel); return; }
    function schritt(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dauer, 1);
      schreibe(ziel * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(schritt);
    }
    requestAnimationFrame(schritt);
  }

  if ("IntersectionObserver" in window) {
    var beob = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        window.setTimeout(function () { e.target.classList.add("da"); }, sparsam ? 0 : i * 80);
        var w = e.target.querySelector && e.target.querySelector(".w[data-ziel]");
        if (w && !w.dataset.fertig) { w.dataset.fertig = "1"; zaehle(w); }
        beob.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

    document.querySelectorAll(".auf, .strich").forEach(function (el) { beob.observe(el); });
  } else {
    // Kein IntersectionObserver: alles sofort zeigen.
    document.querySelectorAll(".auf, .strich").forEach(function (el) { el.classList.add("da"); });
    document.querySelectorAll(".w[data-ziel]").forEach(function (el) { zaehle(el); });
  }

})();
