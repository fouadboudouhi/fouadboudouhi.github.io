# Persönliche Webseite — Fouad Boudouhi

Statische Seite: HTML, CSS, etwas JavaScript. Kein Framework, kein Build-Schritt,
keine Abhängigkeit von außen außer der Schrift (siehe unten).

```
index.html            die ganze Seite, Deutsch und Englisch
impressum.html        Impressum
datenschutz.html      Datenschutzerklärung
assets/styles.css     alle Farb-, Abstands- und Schriftwerte einmal auf :root
assets/app.js         Sprachumschaltung, Bewegung, Druckvorbereitung
assets/og-image.png   Vorschaubild fürs Teilen, 1200x630
entwuerfe/            vier verworfene Gestaltungsentwürfe, nicht verlinkt
```

## Lokal ansehen

```bash
python -m http.server 4173
```

Dann http://localhost:4173 öffnen.

## Gestaltung

Dunkel, monochrom, eine einzige Schriftfamilie (**Satoshi**), **keine Akzentfarbe**.
Getrennt wird durch Abstand und Haarlinien, nicht durch Kästen. **Dunkel ist der
Standard**; ein Schalter neben DE/EN stellt auf hell um (`data-theme="light"` auf
`<html>`, gemerkt unter `fb-theme`). Die Systemeinstellung wird bewusst nicht ausgewertet.
Alle Farben beider Fassungen stehen als Variablen auf `:root`.

Bewegung: Abschnitte steigen beim Scrollen ein, die Kennzahlen zählen hoch,
Trennlinien zeichnen sich von links nach rechts, ein schwacher Lichtschein folgt
dem Zeiger, die Kopfzeile bekommt beim Scrollen eine Trennlinie. Alles respektiert
`prefers-reduced-motion`, und ohne JavaScript ist der Inhalt trotzdem sichtbar
(die Animation hängt an einer `js`-Klasse, die das Skript selbst setzt).

## Aufbau

```
Hero · 01 Schwerpunkte · 02 Werdegang · 03 Fähigkeiten · 04 Projekte · 05 Kontakt
Projektseiten: agentische-entwicklung.html (Ablauf + Messung), investment-plattform.html, porsche.html
```

## Unter eine eigene Domain bringen

### 1. Domain

`fouad-boudouhi.de` oder `.dev` bei einem Registrar deiner Wahl (INWX, Netcup,
Namecheap, Cloudflare Registrar). Rund 10–20 € im Jahr.
Hinweis: Ob ein Impressum nötig ist, hängt nicht von der Endung ab, sondern
davon, ob die Seite geschäftsmäßig ist (§ 5 DDG). Eine Seite, die beruflich
präsentiert und Bewerbungen beiliegt, gilt in der Regel als geschäftsmäßig.
Soll die private Adresse nicht öffentlich stehen: Impressumsservice mit
ladungsfähiger c/o-Adresse. Ein Postfach reicht nicht.

### 2. Hosting — drei Wege, alle kostenlos

**Cloudflare Pages** (Empfehlung)

```bash
npx wrangler pages deploy . --project-name fouad-boudouhi
```

Danach im Dashboard unter *Workers & Pages → Projekt → Custom domains* die Domain
eintragen. Liegt die Domain bei Cloudflare, ist das ein Klick; sonst einen CNAME
auf `<projekt>.pages.dev` setzen.

**GitHub Pages**

```bash
git init && git add . && git commit -m "Persönliche Webseite"
gh repo create fouad-boudouhi.de --public --source=. --push
```

Dann *Settings → Pages → Deploy from a branch → main / (root)*, die Domain unter
*Custom domain* eintragen, eine Datei `CNAME` mit der Domain anlegen. Beim
Registrar: `CNAME www → <user>.github.io`, für die nackte Domain die vier
A-Records von GitHub (185.199.108–111.153).

**Netlify** — Ordner auf app.netlify.com/drop ziehen, Domain im Dashboard verbinden.

### 3. Danach

- HTTPS ist bei allen dreien automatisch.
- Kein Build-Schritt heißt: eine Änderung an `index.html` ist nach dem nächsten
  Deploy live.

## Handy-Fassung

`fouad-boudouhi-seite.html` ist die ganze Seite als eine Datei, mit eingebetteten
Schriften, CSS und Skript. Funktioniert ohne Server und ohne Internet. Neu bauen nach
jeder Änderung an `index.html`, `assets/styles.css` oder `assets/app.js`.
