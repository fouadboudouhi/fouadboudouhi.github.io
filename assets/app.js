/* ==========================================================================
   Fouad Boudouhi — persönliche Seite
   Sprachumschaltung, Hell/Dunkel, Bewegung, Druckvorbereitung,
   Pipeline-Simulation, Zeitleiste, Befehlspalette, Tooltips.
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


  /* --------------------------------------------- Pipeline-Simulation */
  // Simuliert, nicht echt: Tickets wandern durch vier Stufen, eines von
  // vieren kommt im Review zurueck. Zeigt in Sekunden, worum es auf der Seite geht.
  var pipeWurzel = document.querySelector("[data-pipeline]");
  if (pipeWurzel) (function () {
    var de = (root.getAttribute("data-lang") || "de") === "de";
    function t(d, e) { return de ? d : e; }
    var STUFEN = [["Plan", "Plan"], ["Umsetzung", "Build"], ["Review", "Review"], ["Merge", "Merge"]];
    pipeWurzel.innerHTML =
      '<div class="pipe">' +
      '<div class="pipe__kopf"><b>' + t("agentische Pipeline", "agentic pipeline") + '</b><span>' + t("simuliert", "simulated") + '</span></div>' +
      '<div class="pipe__stufen">' + STUFEN.map(function (s) { return '<div class="pipe__stufe"><span class="pipe__dot"></span>' + t(s[0], s[1]) + '</div>'; }).join("") + '</div>' +
      '<div class="pipe__bahn"></div><div class="pipe__log"></div>' +
      '<div class="pipe__fuss">' + t("Schema des Ablaufs aus Projekt 01 · Zahlen sind erfunden", "Schematic of the flow from project 01 · numbers are made up") +
      (sparsam ? "" : ' · <b>' + t("Klick wirft ein Ticket ein", "click to add a ticket") + '</b>') + '</div></div>';
    var bahn = pipeWurzel.querySelector(".pipe__bahn"), log = pipeWurzel.querySelector(".pipe__log"),
        stufen = pipeWurzel.querySelectorAll(".pipe__stufe"), nr = 400 + Math.floor(Math.random() * 90), zeilen = [];
    function melde(text) {
      zeilen.unshift(text); zeilen = zeilen.slice(0, 3);
      log.innerHTML = zeilen.map(function (z) { return "<div>" + z + "</div>"; }).join("");
    }
    // Drei Spuren untereinander, damit mehrere Tickets in derselben Stufe nicht
    // uebereinanderliegen; innerhalb einer Spur ruecken sie leicht nach rechts.
    function alle() { return bahn.querySelectorAll(".pipe__ticket"); }
    function freieSpur() { var n = [0, 0, 0]; alle().forEach(function (t) { n[+t.dataset.spur]++; }); return n.indexOf(Math.min.apply(null, n)); }
    function ordne() {
      var gruppen = {}, spuren = 1;
      alle().forEach(function (t) {
        var k = t.dataset.spur + ":" + t.dataset.stufe, i = gruppen[k] = (gruppen[k] || 0) + 1;
        t.style.transform = "translate(calc(" + (+t.dataset.stufe * 100) + "% + " + ((i - 1) * 10) + "px), " + (+t.dataset.spur * 1.55) + "rem)";
        spuren = Math.max(spuren, +t.dataset.spur + 1);
      });
      bahn.style.height = (1.9 + (spuren - 1) * 1.55) + "rem";
    }
    function setze(ticket, i) { ticket.dataset.stufe = i; ordne(); }
    function markiere(i, klasse) {
      stufen.forEach(function (s) { s.classList.remove("aktiv"); });
      if (i >= 0) { stufen[i].classList.add("aktiv"); if (klasse) stufen[i].classList.add(klasse); }
    }
    if (sparsam) {
      [0, 2, 3].forEach(function (i, k) { var el = document.createElement("div"); el.className = "pipe__ticket"; el.dataset.spur = 0; el.innerHTML = "<span>#" + (nr + k) + "</span>"; bahn.appendChild(el); setze(el, i); });
      melde("#" + (nr + 2) + " → Merge: <i>" + t("gemergt", "merged") + "</i>"); return;
    }
    var aktiv = 0;
    function lauf(vonHand) {
      // Von selbst laufen hoechstens zwei, von Hand duerfen es zehn sein.
      if (aktiv >= (vonHand ? 10 : 2)) return;
      aktiv++;
      var id = "#" + (nr++), el = document.createElement("div"), rueck = Math.random() < (vonHand ? 0.4 : 0.28);
      el.className = "pipe__ticket" + (vonHand ? " hand" : ""); el.dataset.spur = freieSpur(); el.innerHTML = "<span>" + id + "</span>"; bahn.appendChild(el); setze(el, 0);
      if (vonHand) melde(id + " → " + t("eingeworfen", "added"));
      var plan = [0, 1, 2].concat(rueck ? [1, 2, 3] : [3]), k = 0;
      function schritt() {
        var i = plan[k];
        setze(el, i); markiere(i);
        var zurueck = rueck && k === 3;
        el.classList.toggle("rueck", zurueck);
        if (i === 2 && zurueck) melde(id + " → Review: <i>" + t("Änderung angefordert", "changes requested") + "</i>");
        else if (i === 2 && k === 2 && rueck) melde(id + " → Review: " + t("läuft", "running"));
        else if (i === 2) melde(id + " → Review: <i>ok</i>");
        else if (i === 3) melde(id + " → Merge: <i>" + t("gemergt", "merged") + "</i>");
        else if (i === 1) melde(id + " → " + t("Umsetzung", "Build") + ": " + t("Tests grün", "tests green"));
        else melde(id + " → Plan: " + t("freigegeben", "approved"));
        k++;
        if (k < plan.length) { window.setTimeout(schritt, 1150 + Math.random() * 350); }
        else { window.setTimeout(function () { el.classList.add("fertig"); markiere(-1); window.setTimeout(function () { el.remove(); aktiv--; ordne(); }, 450); }, 900); }
      }
      window.setTimeout(schritt, 200);
    }
    lauf(); window.setInterval(function () { lauf(false); }, 3400);
    // Zum Anfassen: ein Klick auf die Karte wirft ein eigenes Ticket ein.
    pipeWurzel.addEventListener("click", function () { lauf(true); });
  })();

  /* ------------------------------------------- Aufgaben einklappen */
  // Mehr als vier Aufgaben je Einsatz: die ersten drei bleiben stehen, der
  // Rest oeffnet sich auf Klick. Ohne JS und beim Drucken ist alles offen.
  (function () {
    var ZEIGE = 3;
    document.querySelectorAll(".station__list").forEach(function (ul) {
      var li = ul.querySelectorAll("li");
      if (li.length <= ZEIGE + 1) return;
      var en = ul.getAttribute("lang") === "en", rest = li.length - ZEIGE;
      for (var i = ZEIGE; i < li.length; i++) li[i].classList.add("zu");
      var k = document.createElement("li"), b = document.createElement("button");
      k.className = "station__mehr"; b.type = "button"; b.setAttribute("aria-expanded", "false");
      function beschrifte(offen) {
        b.textContent = offen ? (en ? "\u2013 fewer" : "\u2013 weniger")
                              : "+ " + rest + (en ? " more" : " weitere");
      }
      beschrifte(false); k.appendChild(b); ul.appendChild(k);
      b.addEventListener("click", function () {
        var offen = ul.classList.toggle("offen");
        b.setAttribute("aria-expanded", offen ? "true" : "false"); beschrifte(offen);
      });
    });
    window.addEventListener("beforeprint", function () {
      document.querySelectorAll(".station__list").forEach(function (ul) { ul.classList.add("offen"); });
    });
  })();

  /* ------------------------------------------------ Befehlspalette */
  (function () {
    var nav = document.querySelector(".topbar__nav");
    if (!nav) return;
    var de = (root.getAttribute("data-lang") || "de") === "de";
    function t(d, e) { return de ? d : e; }
    var aufIndex = /(^|\/)(index\.html)?$/.test(location.pathname);
    var basis = aufIndex ? "" : "index.html";
    var EINTRAEGE = [
      ["Schwerpunkte", "Focus", basis + "#arbeit", "01"], ["Werdegang", "Career", basis + "#werdegang", "02"],
      ["Fähigkeiten", "Skills", basis + "#faehigkeiten", "03"], ["Projekte", "Projects", basis + "#projekte", "04"],
      ["Kontakt", "Contact", basis + "#kontakt", "05"],
      ["Agentischer Entwicklungsprozess im Team", "Agentic development process", "agentische-entwicklung.html", t("Projekt", "Project")],
      ["Investment-Plattform für Immobilien", "Real estate investment platform", "investment-plattform.html", t("Projekt", "Project")],
      ["Testautomatisierung für eine Übungsanwendung", "Test automation for a practice app", "testautomatisierung.html", t("Projekt", "Project")],
      ["Porsche 911 Targa auf Elektroantrieb", "Porsche 911 Targa converted to electric", "porsche.html", t("Projekt", "Project")],
      ["E-Mail schreiben", "Send an email", "mailto:fouad-boudouhi@hotmail.de", "mailto"],
      ["LinkedIn", "LinkedIn", "https://www.linkedin.com/in/fouadboudouhi", "↗"], ["GitHub", "GitHub", "https://github.com/fouadboudouhi", "↗"],
      [t("Hell/Dunkel umschalten", "Toggle light/dark"), null, "!theme", "⌘"], [t("Sprache wechseln", "Switch language"), null, "!lang", "⌘"]
    ];
    var knopf = document.createElement("button");
    knopf.type = "button"; knopf.className = "palette-knopf"; knopf.setAttribute("data-palette", "");
    knopf.innerHTML = '<span class="nur-breit">' + t("Springen", "Jump") + '</span><kbd>' + (navigator.platform.indexOf("Mac") === 0 ? "⌘" : "Strg") + " K</kbd>";
    nav.insertBefore(knopf, nav.querySelector(".langswitch"));
    var pal = document.createElement("div");
    pal.className = "palette"; pal.setAttribute("role", "dialog"); pal.setAttribute("aria-label", t("Befehlspalette", "Command palette"));
    pal.innerHTML = '<div class="palette__box"><input class="palette__eingabe" type="text" autocomplete="off" spellcheck="false" placeholder="' +
      t("Wohin? Tippen zum Filtern …", "Where to? Type to filter …") + '"><ul class="palette__liste"></ul>' +
      '<div class="palette__fuss"><span><kbd>↑↓</kbd> ' + t("wählen", "choose") + '</span><span><kbd>↵</kbd> ' + t("öffnen", "open") + '</span><span><kbd>esc</kbd> ' + t("schließen", "close") + '</span></div></div>';
    document.body.appendChild(pal);
    var eingabe = pal.querySelector(".palette__eingabe"), liste = pal.querySelector(".palette__liste"), treffer = [], index = 0;
    function zeichneListe() {
      var q = eingabe.value.trim().toLowerCase();
      treffer = EINTRAEGE.filter(function (e) { var name = de || !e[1] ? e[0] : e[1]; return !q || (name + " " + e[3]).toLowerCase().indexOf(q) >= 0; });
      index = Math.min(index, Math.max(treffer.length - 1, 0));
      liste.innerHTML = treffer.map(function (e, i) {
        var name = de || !e[1] ? e[0] : e[1];
        return '<li' + (i === index ? ' class="aktiv"' : "") + '><button type="button" data-i="' + i + '"><span>' + name + '</span><small>' + e[3] + '</small></button></li>';
      }).join("");
    }
    function oeffne() { pal.classList.add("offen"); eingabe.value = ""; index = 0; zeichneListe(); eingabe.focus(); }
    function schliesse() { pal.classList.remove("offen"); }
    function fuehreAus(e) {
      schliesse();
      if (e[2] === "!theme") { var b = document.querySelector("[data-toggle-theme]"); if (b) b.click(); return; }
      if (e[2] === "!lang") { var l = document.querySelector('[data-set-lang="' + (de ? "en" : "de") + '"]'); if (l) l.click(); return; }
      if (/^https?:/.test(e[2])) { window.open(e[2], "_blank", "noopener"); return; }
      location.href = e[2];
    }
    knopf.addEventListener("click", oeffne);
    pal.addEventListener("click", function (ev) {
      if (ev.target === pal) { schliesse(); return; }
      var b = ev.target.closest ? ev.target.closest("button[data-i]") : null;
      if (b) fuehreAus(treffer[+b.getAttribute("data-i")]);
    });
    eingabe.addEventListener("input", function () { index = 0; zeichneListe(); });
    document.addEventListener("keydown", function (ev) {
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "k") { ev.preventDefault(); pal.classList.contains("offen") ? schliesse() : oeffne(); return; }
      if (!pal.classList.contains("offen")) return;
      if (ev.key === "Escape") { schliesse(); }
      else if (ev.key === "ArrowDown") { ev.preventDefault(); index = (index + 1) % treffer.length; zeichneListe(); }
      else if (ev.key === "ArrowUp") { ev.preventDefault(); index = (index - 1 + treffer.length) % treffer.length; zeichneListe(); }
      else if (ev.key === "Enter" && treffer[index]) { fuehreAus(treffer[index]); }
    });
  })();

  /* ---------------------------------------------------- Tooltips */
  // Balken im Diagramm tragen ihren Wert als <title>; hier wird daraus ein
  // sichtbarer Hinweis am Zeiger, auch bei Beruehrung.
  (function () {
    var balken = document.querySelectorAll(".chart .balken");
    if (!balken.length) return;
    var tip = document.createElement("div"); tip.className = "tip"; tip.setAttribute("aria-hidden", "true"); document.body.appendChild(tip);
    function zeige(b, x, y) {
      var titel = b.querySelector("title"); if (!titel) return;
      tip.textContent = titel.textContent; tip.style.left = x + "px"; tip.style.top = (y - 10) + "px"; tip.classList.add("da");
    }
    function weg() { tip.classList.remove("da"); }
    balken.forEach(function (b) {
      b.addEventListener("pointerenter", function (ev) { zeige(b, ev.clientX, ev.clientY); });
      b.addEventListener("pointermove", function (ev) { zeige(b, ev.clientX, ev.clientY); });
      b.addEventListener("pointerleave", weg);
      b.addEventListener("click", function (ev) { tip.classList.contains("da") ? weg() : zeige(b, ev.clientX, ev.clientY); });
    });
  })();

  // Beim Drucken soll die vollständige Tabelle mit aufs Papier.
  window.addEventListener("beforeprint", function () {
    document.querySelectorAll("details").forEach(function (d) { d.open = true; });
  });

  /* ------------------------------------------------------------ Bewegung */

  var balken = document.getElementById("fortschritt");
  var schein = document.getElementById("schein");
  var kopf = document.getElementById("kopf");

  // Zeitleiste im Werdegang: die Linie reicht bis knapp unter die Bildschirmmitte,
  // der Punkt einer Station wird amber, sobald die Linie ihn erreicht.
  var stationen = document.querySelectorAll(".station");
  function zeichneLinie() {
    var ref = window.innerHeight * 0.55;
    stationen.forEach(function (s) {
      var r = s.getBoundingClientRect();
      var f = sparsam ? 1 : Math.max(0, Math.min(1, (ref - r.top) / r.height));
      s.style.setProperty("--linie", (f * 100).toFixed(1) + "%");
      s.classList.toggle("erreicht", f > 0);
    });
  }
  var linieGeplant = false;
  function planeLinie() {
    if (linieGeplant || !stationen.length) return;
    linieGeplant = true;
    requestAnimationFrame(function () { linieGeplant = false; zeichneLinie(); });
  }

  window.addEventListener("scroll", function () {
    if (balken) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      balken.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    }
    if (kopf) kopf.classList.toggle("ab", window.scrollY > 12);
    planeLinie();
  }, { passive: true });
  window.addEventListener("resize", planeLinie, { passive: true });
  planeLinie();

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
