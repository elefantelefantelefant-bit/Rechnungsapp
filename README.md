# Truthahn-App

Eine mobile App zur Verwaltung von Truthahn-Schlachtsitzungen – von der Bestellung über das Wiegen und Zuordnen bis hin zur Rechnungserstellung.

## Funktionen

### Kundenverwaltung
- Kunden anlegen und bearbeiten (Name, Telefonnummer)
- Kundenübersicht mit Suchfunktion

### Sitzungen (Schlachttage)
- Schlachtsitzungen erstellen mit Datum und Kilopreis
- Bestellungen pro Sitzung verwalten
- Sitzungsstatus: aktiv / abgeschlossen

### Bestellungen
- Bestellungen einem Kunden und einer Sitzung zuordnen
- Zwei Bestellmodi:
  - **Zielgewicht**: Kunde bestellt ein bestimmtes Gewicht (z.B. 8,5 kg)
  - **Größenkategorie**: Kunde wählt zwischen Leicht / Mittel / Schwer
- Portionstyp: **Ganz** oder **Halb** (halber Truthahn)

### Wiegen
- Gewichte der geschlachteten Truthähne über ein Ziffernfeld erfassen
- Schnelle Eingabe ohne Tastatur – optimiert für den Einsatz im Schlachthof

### Zuordnung (Matching)
- Truthähne den Bestellungen zuordnen
- Intelligente Sortierung:
  - Bei Zielgewicht: sortiert nach geringster Abweichung
  - Bei Größenkategorie: automatische Einteilung in Leicht/Mittel/Schwer basierend auf Drittelung der Gewichte
- Halbe Bestellungen: System zeigt bereits halb zugeordnete Truthähne an, damit beide Hälften vergeben werden
- Fortschrittsanzeige (x von y zugeordnet)
- Zuordnung aufheben möglich

### Rechnungen
- PDF-Rechnungen generieren pro Bestellung
- Automatische Rechnungsnummern (fortlaufend pro Jahr)
- Anpassbare Rechnungsvorlage:
  - Produktbezeichnung
  - Hinweistext
  - Grußtext
  - Dankestext
- Berechnung: Gewicht × Kilopreis (bei halben Truthähnen: halbes Gewicht)
- Teilen per WhatsApp oder andere Apps

## Tech Stack

- **Expo SDK 54** + React Native + TypeScript
- **expo-router** – Dateibasiertes Routing
- **expo-sqlite** – Lokale SQLite-Datenbank
- **react-native-paper** – Material Design 3 UI-Komponenten
- **expo-print** + **expo-sharing** – PDF-Erzeugung und Teilen

## Installation

```bash
npm install
npx expo start
```

Zum Testen auf einem Android-Gerät die [Expo Go](https://expo.dev/go) App installieren und den QR-Code scannen.

## Build

```bash
# Preview-APK (zum Testen)
npx eas build --platform android --profile preview

# Production-Build
npx eas build --platform android --profile production
```

## Projektstruktur

```
app/                          # Screens (Expo Router)
├── (tabs)/                   # Tab-Navigation
│   ├── index.tsx             # Sitzungen-Übersicht
│   ├── customers.tsx         # Kunden-Übersicht
│   └── invoice.tsx           # Rechnungseinstellungen
├── customer/[id].tsx         # Kundendetails
└── session/
    ├── [id].tsx              # Sitzungsdetails (Bestellungen)
    ├── weighing/[id].tsx     # Wiegen
    └── matching/[id].tsx     # Zuordnung
src/
├── components/               # UI-Komponenten
├── db/                       # Datenbank & Repositories
├── models/types.ts           # TypeScript-Interfaces
└── utils/                    # Hilfsfunktionen & Rechnungslogik
```
