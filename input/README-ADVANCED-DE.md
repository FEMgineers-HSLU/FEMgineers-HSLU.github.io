---
title: "README-ADVANCED-DE"
shouldIndex: false
header: false
footer: false
---
:::::: text { .prose .text-current .prose-headings:font-bold .prose-img:rounded-lg .marker:text-current .max-w-none .p-4 }

# Advanced-Dokumentation

Diese Anleitung ergänzt die [Kurzanleitung](README-DE.md) für fortgeschrittene Studierende.

## 1. Zielgruppe und Workflow

Der Workflow ist absichtlich auf Anfängerinnen und Anfänger ohne Vorkenntnisse ausgerichtet. `dev` und `build` verwenden grundsätzlich dieselben Quellen und erzeugen denselben Seitenaufbau. Der wesentliche Unterschied ist die Ausgabeform: Im Entwicklungsmodus werden Seiten lesbar formatiert, im Produktionsbuild werden HTML, CSS und JavaScript für die Veröffentlichung minimiert.

Dadurch kann der Inhalt des Ordners `output/` direkt auf einen Webserver oder eine Hosting-Plattform deployed werden.

## 2. Ausführlicher Entwicklungsmodus

Der normale Start ist bewusst kompakt:

```bash
npm start
```

Für vollständige Build- und Watcher-Ausgaben:

```bash
npm run dev:verbose
```

Nach jedem erneuten Öffnen des Codespaces den Startbefehl wieder ausführen.

Nur den `html simple mode` separat starten:

```bash
npm run dev:html
```

Danach den angezeigten Preview-Link öffnen.

Die Preview läuft auf Port 3000. Die wichtigsten URLs sind:

- Markdown: http://localhost:3000/
- `html extended mode`: http://localhost:3000/html-extended-mode.html
- `html simple mode`: http://localhost:3000/html-simple-mode/

## 3. Watcher-Verhalten

- Markdown- oder HTML-Änderungen bauen nur die betroffene Seite neu.
- Template-Änderungen bauen die gesamte Site neu.
- Änderungen an JavaScript, Bildern oder statischen Dateien bauen die Site neu.
- Normale Styles und Styles des `html simple mode` werden von getrennten Tailwind-Watchern verarbeitet.
- Eine CSS-Änderung führt nur bei verändertem CSS-Output zu einem erneuten Site-Build.

Im kompakten Modus erscheinen erfolgreiche Änderungen als einzelne Statuszeile:

```text
file changed (path) and page updated
file changed (path) and site updated
```

Unveränderte Outputs werden nicht gemeldet. Fehler bleiben sichtbar.

Bei Änderungen an Markdown- oder HTML-Dateien erscheint `page updated`. Änderungen an Templates, Styles, JavaScript, Bildern oder statischen Dateien melden `site updated`.

## 4. Produktionsbuild

```bash
npm run build
```

Der Build leert `output/`, erzeugt Assets und Styles neu, baut den CSS-Output des `html simple mode` und rendert anschließend alle Seiten.

Für eine lokale Vorschau des Produktionsstands:

```bash
npm run build-preview
```

Nur den `html simple mode` bauen und testen:

```bash
npm run build-preview:html
```

Kurzbefehle für den separaten `html simple mode`:

```bash
# einmalig
npm ci
# nach jedem Öffnen des Codespaces
npm run dev:html
npm run build-preview:html
```

## 5. Hashing und Caching

JS, CSS, Bilder und Dateien aus `input/static/` erhalten beim Veröffentlichen gehashte Dateinamen. Ändert sich der Output, ändert sich dadurch auch die URL und der Browser lädt die neue Datei.

`input/_headers` wird unverändert nach `output/_headers` kopiert. Auf Plattformen mit `_headers`-Unterstützung können gehashte Assets mit langen Cache-Zeiten oder `immutable` ausgeliefert werden. GitHub Pages verarbeitet `_headers` nicht.

## 6. Deployment

Für ein Deployment sollte immer der Produktionsbuild verwendet werden:

```bash
npm run build
```

Der fertige Inhalt liegt danach in `output/`. Bei Cloudflare Pages kann als Build-Befehl `npm run build` und als Output-Verzeichnis `output` eingetragen werden.

Wenn `output/` nicht im Git-Repository versioniert werden soll, kann die entsprechende Zeile in `.gitignore` aktiviert werden:

```gitignore
output/
!output/.gitkeep
```

Danach muss der bereits versionierte Output einmalig aus Git entfernt werden:

```bash
git rm -r --cached output
```

## 7. Qualitätssicherung

Vor Abgabe oder Veröffentlichung:

```bash
npm run lint
npm run lint:seo
```

`npm run lint` führt JavaScript-, HTML- und Link-Prüfungen aus. Der Link-Check startet automatisch einen lokalen Server auf Port 4000.

Für Lighthouse zuerst den Produktionsstand bauen und mit `npm run preview` auf Port 4000 öffnen.

Für öffentliche Seiten vor dem Deployment `shouldIndex: true` prüfen. `robots.txt` allein hebt ein gesetztes `noindex` nicht auf. Lighthouse-Zielwerte sind mindestens 90 für Performance, Accessibility, Best Practices und SEO.

## 8. Troubleshooting

- Ist Port 3000 oder 4000 belegt, laufende Prozesse beenden oder einen freien Port verwenden.
- Bei einer nicht reagierenden Vorschau `npm start` neu starten und den ausgegebenen Link erneut öffnen.
- Bei Watcher-Problemen zuerst `npm ci` ausführen und den passenden Dev-Befehl erneut starten.

## 9. Projektdateien und Plugins

- Dateien aus `input/static/` sowie optimierte Bilder werden mit gehashten Dateinamen veröffentlicht.
- `input/_headers` wird nach `output/_headers` kopiert; `robots.txt`, `sitemap.xml` und `site.webmanifest` werden in das `output/`-Root kopiert.
- Vor dem Deployment müssen Domain, Sitemap-URL, `shouldIndex`, Manifest und gegebenenfalls `_headers` projektspezifisch angepasst werden.
- Die verwendeten Markdown-Plugins sind in `package.json` und in der Lockdatei festgelegt.

## 10. Verzeichnisgrenzen

- Quellen liegen unter `input/`.
- Templates liegen unter `templates/`.
- Build- und Watch-Logik liegt unter `build/`.
- Lint-Konfigurationen liegen unter `lint/`.
- Veröffentlichte Dateien liegen unter `output/`.

Bei Änderungen an Build- oder Watch-Logik anschließend mindestens `npm run lint` ausführen.

::::::
