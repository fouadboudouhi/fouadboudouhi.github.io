# Persönliche Webseite — Fouad Boudouhi

Statische Seite: HTML, CSS, etwas JavaScript. Kein Framework, kein Build-Schritt,
keine Abhängigkeit von außen; die Schrift liegt mit im Repository.

```
index.html                  die Startseite, Deutsch und Englisch in einer Datei
agentische-entwicklung.html
investment-plattform.html   die vier Projektseiten
testautomatisierung.html
porsche.html
sitemap.xml                 Liste der Seiten für Suchmaschinen
datenschutz.html, 404.html
assets/styles.css           alle Farb-, Abstands- und Schriftwerte einmal auf :root
assets/app.js               Sprache, Hell/Dunkel, Pipeline-Schema, Befehlspalette, Bewegung
assets/fonts/               Satoshi, selbst gehostet
assets/thumbs/, assets/porsche/   Bilder
assets/og-image.png         Vorschaubild fürs Teilen, 1200x630
```

Lokales Werkzeug liegt in `.claude/` und ist nicht Teil des Repositorys:
`serve.py` (Vorschau-Server ohne Cache) und `stempel.py` (Versionsstempel).

## Lokal ansehen

```bash
python -I .claude/serve.py 4173
```

Dann http://localhost:4173 öffnen. Ohne das Skript tut es auch `python -m http.server 4173`,
dann aber mit Browser-Cache.

## Gestaltung

**Dunkel ist der Standard**; ein Schalter neben DE/EN stellt auf hell um
(`data-theme="light"` auf `<html>`, gemerkt unter `fb-theme`). Die Systemeinstellung
wird bewusst nicht ausgewertet. Eine Textschrift (**Satoshi**) und eine Monospace für
alles, was Meta ist: Rubriken, Daten, Tags, Kopfzeile. **Eine Akzentfarbe** (Bernstein),
sparsam gesetzt: Rubriken, der gefüllte Knopf, die aktive Sprache, Projektlinks,
Listenpunkte. Text, Hintergrund und Haarlinien bleiben monochrom. Getrennt wird durch
Abstand und Haarlinien; Karten nur dort, wo mehrere gleichartige Dinge nebeneinanderstehen
(Schwerpunkte, Fähigkeiten, Projekte). Alle Farben beider Fassungen stehen als Variablen
auf `:root`.

**Zwei Sprachen in einer Datei:** Jeder Text steht als Paar `<span lang="de">` /
`<span lang="en">`, das CSS blendet die jeweils andere aus (`data-lang` auf `<html>`,
gemerkt unter `fb-lang`). Auch erzeugte Texte aus `app.js` tragen beide Fassungen, damit
der Wechsel ohne Neuladen klappt.

**Bewegung:** Abschnitte steigen beim Scrollen ein (der Hero nicht, der steht sofort),
Kennzahlen zählen hoch, Trennlinien zeichnen sich von links nach rechts, die Zeitleiste
wächst beim Lesen mit, das Pipeline-Schema im Hero schickt simulierte Tickets durch die sechs
Stufen des Prozesses. Alles respektiert `prefers-reduced-motion`, und ohne JavaScript ist der Inhalt
trotzdem sichtbar (die Animation hängt an einer `js`-Klasse, die das Skript selbst setzt).

**Befehlspalette:** Strg+K bzw. ⌘K springt zu Abschnitten, Projekten und Kontakt.

## Aufbau

```
Hero · 01 Schwerpunkte · 02 Werdegang · 03 Fähigkeiten · 04 Projekte · 05 Kontakt
Projektseiten: agentische-entwicklung.html (Ablauf + Messung), investment-plattform.html,
testautomatisierung.html, porsche.html
```

## Versionsstempel

`styles.css` und `app.js` sind als `?v=<Stempel>` eingebunden, damit der Browser nach
einer Änderung nicht die alte Datei aus dem Cache nimmt. Nach jeder Änderung an einer
der beiden Dateien:

```bash
python -I .claude/stempel.py
```

## Hosting

GitHub Pages aus dem Branch `main`, Verzeichnis `/`. Die Domain `fouad-boudouhi.de`
liegt bei IONOS und zeigt per DNS auf GitHub Pages; HTTPS kommt von GitHub. Ein Push
auf `main` ist nach wenigen Minuten live, es gibt keinen Build.

## Handy-Fassung

`fouad-boudouhi-*.html` sind die Seiten als je eine Datei mit eingebetteten Schriften,
CSS und Skript; sie funktionieren ohne Server und ohne Internet. Sie werden nicht im
Repository geführt und müssen nach jeder Änderung an den Quellen neu gebaut werden,
sonst sind sie veraltet.
