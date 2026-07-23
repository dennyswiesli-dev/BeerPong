# 🍺 Beer Pong Arena

Eine optisch ansprechende, echtzeitfähige Bier-Pong-App. Zwei Teams treten gegeneinander an,
jeder Treffer wird live auf allen verbundenen Geräten synchronisiert – über Firebase gehostet,
also von jedem Handy über eine echte URL erreichbar.

## Features

- Spieler per Namenseingabe oder QR-Code-Scan (`/join/:matchId`) zu einem Team hinzufügen
- Spielbrett wählen (10 oder 6 Becher, klassisches Dreieck-Layout)
- Animierter Münzwurf, der bestimmt, wer beginnt
- Live-Synchronisation über Firestore: Becher, die auf einem Gerät geleert werden, verschwinden sofort auf allen anderen
- Becher-Neuformation (einmal pro Team erlaubt, nicht mehr bei 2 oder weniger übrigen Bechern)
- Sieger-Animation mit Konfetti sowie zufällige Sprüche bei Serien, Treffern, Fehlwürfen und Neuformationen
- Leaderboard mit Sieg-/Niederlage-Verhältnis und Trefferstatistik pro Spieler
- Einzelgerät-Modus: eine Person steuert beide Teams auf einem Gerät

## Struktur

- `client/` – React + Vite + Tailwind Frontend, spricht direkt mit Firebase (kein eigener Server nötig)
- `firebase.json`, `firestore.rules`, `firestore.indexes.json` – Firebase-Hosting- und Firestore-Konfiguration

## Einrichtung (einmalig)

1. Auf [console.firebase.google.com](https://console.firebase.google.com) ein neues Projekt anlegen
2. Im Projekt **Firestore Database** aktivieren (Modus "production" reicht, die Regeln in `firestore.rules` sind bereits offen für ein Party-Setup ohne Login)
3. Unter **Projekteinstellungen → Allgemein → Meine Apps** eine **Web-App** hinzufügen — das liefert dir die Konfigurationswerte (`apiKey`, `authDomain`, …)
4. Im Ordner `client/` eine Datei `.env` anlegen (Vorlage: `client/.env.example`) und die Werte eintragen
5. `.firebaserc` im Repo-Root anpassen: `YOUR_FIREBASE_PROJECT_ID` durch deine echte Firebase-Projekt-ID ersetzen

## Entwicklung

```bash
cd client
npm install
npm run dev
```

Läuft dann auf `http://localhost:5173`. Damit Handys im selben WLAN zugreifen können: `npx vite --host`.

## Deployment (Firebase Hosting)

```bash
npm install -g firebase-tools
firebase login

cd client && npm run build && cd ..
firebase deploy
```

Danach ist die App unter der von Firebase ausgegebenen `https://<projekt-id>.web.app`-URL erreichbar –
von jedem Gerät mit Internetzugang, auch unterwegs vom Handy.
