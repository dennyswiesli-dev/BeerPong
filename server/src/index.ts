import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import {
  addPlayer,
  coinToss,
  createSession,
  getSession,
  hitCup,
  missShot,
  reformCups,
  renameTeam,
  resetGame,
  setLayout,
} from './game.js';
import { getLeaderboard, recordGameResult, recordShot } from './store.js';
import { pick, streakSayings, missSayings, hitSayings, reformSayings, winSayings } from './sayings.js';
import type { BoardLayout } from './types.js';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

app.get('/api/leaderboard', (_req, res) => {
  res.json(getLeaderboard());
});

app.post('/api/sessions', (req, res) => {
  const layout = (req.body?.layout as BoardLayout) ?? 10;
  const singleDeviceMode = Boolean(req.body?.singleDeviceMode);
  const session = createSession(layout, singleDeviceMode);
  res.json(session);
});

app.get('/api/sessions/:id', (req, res) => {
  const session = getSession(req.params.id);
  if (!session) return res.status(404).json({ error: 'not found' });
  res.json(session);
});

function broadcast(sessionId: string) {
  const session = getSession(sessionId);
  if (session) io.to(sessionId).emit('state', session);
}

function sendSaying(sessionId: string, text: string) {
  io.to(sessionId).emit('saying', text);
}

io.on('connection', (socket) => {
  socket.on('join', ({ sessionId }: { sessionId: string }) => {
    socket.join(sessionId);
    const session = getSession(sessionId);
    if (session) socket.emit('state', session);
  });

  socket.on('addPlayer', ({ sessionId, teamId, name }) => {
    const session = getSession(sessionId);
    if (!session) return;
    addPlayer(session, teamId, name);
    broadcast(sessionId);
  });

  socket.on('renameTeam', ({ sessionId, teamId, name }) => {
    const session = getSession(sessionId);
    if (!session) return;
    renameTeam(session, teamId, name);
    broadcast(sessionId);
  });

  socket.on('setLayout', ({ sessionId, layout }) => {
    const session = getSession(sessionId);
    if (!session) return;
    setLayout(session, layout);
    broadcast(sessionId);
  });

  socket.on('coinToss', ({ sessionId }) => {
    const session = getSession(sessionId);
    if (!session) return;
    coinToss(session);
    broadcast(sessionId);
  });

  socket.on('hitCup', ({ sessionId, targetTeamId, cupId, playerName }) => {
    const session = getSession(sessionId);
    if (!session) return;
    try {
      const result = hitCup(session, targetTeamId, cupId);
      if (playerName) recordShot(playerName, true);
      broadcast(sessionId);
      sendSaying(sessionId, pick(hitSayings));
      if (result.streakSayingLevel) {
        const options = streakSayings[result.streakSayingLevel];
        if (options) sendSaying(sessionId, pick(options));
      }
      if (result.gameOver && result.winnerTeamId) {
        const winnerTeam = session.teams.find((t) => t.id === result.winnerTeamId)!;
        const loserTeam = session.teams.find((t) => t.id !== result.winnerTeamId)!;
        recordGameResult(winnerTeam.players, loserTeam.players);
        io.to(sessionId).emit('gameOver', { winnerTeamId: result.winnerTeamId, winnerName: winnerTeam.name });
        sendSaying(sessionId, pick(winSayings));
      }
    } catch (e) {
      socket.emit('error', { message: (e as Error).message });
    }
  });

  socket.on('missShot', ({ sessionId, shootingTeamId, playerName }) => {
    const session = getSession(sessionId);
    if (!session) return;
    missShot(session, shootingTeamId);
    if (playerName) recordShot(playerName, false);
    broadcast(sessionId);
    sendSaying(sessionId, pick(missSayings));
  });

  socket.on('reformCups', ({ sessionId, teamId }) => {
    const session = getSession(sessionId);
    if (!session) return;
    const ok = reformCups(session, teamId);
    broadcast(sessionId);
    if (ok) sendSaying(sessionId, pick(reformSayings));
  });

  socket.on('resetGame', ({ sessionId }) => {
    const session = getSession(sessionId);
    if (!session) return;
    resetGame(session);
    broadcast(sessionId);
  });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
httpServer.listen(PORT, () => {
  console.log(`Beer Pong server listening on :${PORT}`);
});
