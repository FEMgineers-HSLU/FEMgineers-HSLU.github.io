---
title: "FEMgineers"
lang: de
shouldIndex: false
header: true
footer: true
---



:::::: text {  .prose .text-current .prose-headings:font-bold .prose-img:rounded-lg .marker:text-current .max-w-none .p-4 .pt-10 .text-[#582f1a] .prose-h1:my-4}
# Vereinswebsite der FEMgineers
::::::

:::::: text {  .prose .text-current .prose-headings:font-bold .prose-img:rounded-lg .marker:text-current .max-w-none .text-[#582f1a]}
<3 We are the best association ever <3 { .bg-[#fbe3d6] }
::::::

:::::: text {  .prose .text-current .prose-headings:font-bold .prose-img:rounded-lg .marker:text-current .max-w-none .p-4 .text-[#582f1a] .prose-p:my-0 .prose-ul:my-1 .prose-li:my-0 .prose .prose-h1:my-4 .prose-h2:my-4 .prose-h3:my-4 }

by Sandra Lehmann


<br><br>
## Vorkentnisse

**C**: sehr gut
**c#, Python**: mässig
**HTML, CSS, JavaScript**: unbekannt
**Github**: mässig
**Codespace**: unbekannt
<br><br>
The webpage is published on femgineers-hslu.github.io
<br><br>
## Funktionsliste
**MH** = Must have
**NiH** = Nice to have

<br><br>
**MH** = Entwicklung der Webseite muss über FEMgineers account möglich sein

<br><br>
### Struktur und Navigation
- **MH** Öffentlich zugänglich
- **NiH** Eigene Domain (z. B. femgineers.ch)
- **MH** Sprachumschalter EN / DE im Header
- **MH** Alle Seiten und Texte in beiden Sprachen
- **MH** Menü mit fünf Seiten: About, Events, Gallery, Resources, Contact
- **MH** Header und Footer auf allen Seiten
- **NiH** Hamburger-Menü auf dem Handy (eingeklapptes Menü hinter dem Symbol «☰»)
- **NiH**  Pflege-Interface (Decap CMS): ausgewählte Mitglieder fügen Events und Fotos über ein Formular hinzu

<br><br>
### Darstellung
- **MH** Responsives Design: Die Seite passt sich Handy und Laptop an (mit Tailwind CSS)
- **MH** Einheitliches Farbschema und Schrift passend zum Verein
- **NiH** Bilderkarussell (automatisch wechselnde Bilder) auf der Startseite

{.mb-8}

<br><br>
### Inhalt
 - About { #about }
   - **MH** Prosa text: Vereinsvorstellung, Mission,
   - **MH** Vorstand mit Foto

 - Events  { #events }
   - **MH** kommende Events als Karten (Titel, Datum, Ort, Beschreibung)
   - **NiH** Anmeldelink
 
 - past Events
   - **NiH** vergangene Events als Karten (Titel, Datum, Ort, Beschreibung)
   - **NiH** Automatische Archivierung der vergangenen Events
   - **NiH** Täglicher automatischer Neuaufbau der Seite (GitHub Action), damit die Archivierung ohne Eingriff funktioniert
 
 - Gallery  { #gallery }
   - **MH** Bildraster
   - **NiH** Lightbox (Bild öffnet sich beim Anklicken gross)
 
 - Resources  { #resources }
   - **NiH** Links zu hilfreichen Webseiten

 - Contact  { #contact }
   - **MH** QR-Code für Instagram
   - **MH** Angabe der Vereins-Email
  oder
   - **NiH** Kontaktformular



::::::
