# 🍺 Beer Pong Arena

Eine optisch ansprechende, echtzeitfähige Bier-Pong-App. Zwei Teams treten gegeneinander an,
jeder Treffer wird live auf allen verbundenen Geräten synchronisiert.

## Features

- Spieler per Namenseingabe oder QR-Code-Scan (`/join/:matchId`) zu einem Team hinzufügen
- Spielbrett wählen (10 oder 6 Becher, klassisches Dreieck-Layout)
- Animierter Münzwurf, der bestimmt, wer beginnt
- Live-Synchronisation: Becher, die auf einem Gerät geleert werden, verschwinden sofort auf allen anderen
- Becher-Neuformation (einmal pro Team erlaubt, nicht mehr bei 2 oder weniger übrigen Bechern)
- Sieger-Animation mit Konfetti sowie zufällige Sprüche bei Serien, Treffern, Fehlwürfen und Neuformationen
- Leaderboard mit Sieg-/Niederlage-Verhältnis und Trefferstatistik pro Spieler
- Einzelgerät-Modus: eine Person steuert beide Teams auf einem Gerät

## Struktur

- `server/` – Express + Socket.io Backend, hält den Spielzustand und die Leaderboard-Persistenz (`server/data/leaderboard.json`)
- `client/` – React + Vite + Tailwind Frontend

## Entwicklung

```bash
npm run install:all

# Terminal 1
npm run dev:server

# Terminal 2
npm run dev:client
```

Das Frontend läuft auf `http://localhost:5173` und proxied API-/Socket-Requests an den Server auf Port `4000`.
