# Kurzanleitung

[English](README-EN.md)

## 1. GitHub-Account erstellen

1. Auf https://github.com ein Konto erstellen.
2. E-Mail-Adresse bestätigen.
3. Danach mit dem Classroom-Link weiterarbeiten.

## 2. Start-Repository öffnen

1. Mit dem zur Verfügung gestellten GitHub-Classroom-Link starten.
2. Das persönliche Repository erstellen lassen.
3. Das Repository in GitHub Codespaces öffnen.

## 3. Abhängigkeiten installieren

Im Terminal in Codespaces:

Wichtig: In der Regel nur einmalig nötig (erneut nur bei geänderten Abhängigkeiten oder gelöschtem `node_modules`).

```bash
npm ci
```

## 4. Modi

- Ohne Vorkenntnisse: `md` für Inhalte in `input/**/*.md`.
- `html extended mode`: HTML statt Markdown in `input/**/*.html`, mit allen Features des vollständigen Builds (zum Beispiel Bild-Handling und Asset-Verarbeitung).
- `html simple mode`: nur Tailwind CLI mit `input/html-simple-mode/input.css`.

## 5. Welchen Modus wann?

- `md`: Standard für Studierende ohne Vorkenntnisse.
- `html extended mode`: Wenn HTML statt Markdown genutzt werden soll, aber alle Build-Features aktiv bleiben sollen.
- `html simple mode`: Wenn nur Tailwind CLI genutzt werden soll.

## 6. Website starten und Vorschau öffnen

Für alle Modi:

```bash
npm start
```

Vorschau: http://localhost:3000

Der Entwicklungsserver läuft auf Port 3000 und stellt alle erzeugten Seiten bereit. Ergänze je nach Modus den passenden Pfad:

- Markdown: http://localhost:3000/
- HTML-Seite: http://localhost:3000/html-extended-mode.html
- `html simple mode`: http://localhost:3000/html-simple-mode/

## 7. Inhalte bearbeiten

- Markdown- und HTML-Inhalte liegen in input/
- Bilder liegen in input/img/ und werden bei JPG/PNG automatisch in mehrere Größen und WEBP umgewandelt.
- Ein eigenes Figure-Plugin macht aus einzelnen Bildabsätzen automatisch `<figure>`; eine Bildunterschrift (caption) kann eingefügt werden.
- Es gibt auch ein kleines Sonder-Markdown, zum Beispiel für `@youtube`-Absätze.
- Templates liegen in templates/

## 8. Änderungen speichern und auf GitHub sichern

1. Änderungen in Codespaces vornehmen.
2. Im Source-Control-Bereich von Codespaces die geänderten Dateien prüfen.
3. Commit-Nachricht eintragen.
4. Commit und Push gemeinsam über die Codespaces-Oberfläche ausführen.

Nach dem Push sind die Änderungen im eigenen GitHub-Repository gespeichert.

## Kurzbefehle

Für alle Modi:

```bash
# einmalig
npm ci
# nach jedem Öffnen des Codespaces
npm start
```

Weitere technische Informationen für fortgeschrittene Studierende:

[Advanced-Dokumentation](README-ADVANCED-DE.md)
