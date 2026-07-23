import { useEffect, useRef, useState } from 'react';
import { subscribeSession } from './sessionApi';
import { playHitSound, playStreakSound } from './sound';
import type { SessionState } from '../types';

export function useSession(sessionId: string | undefined) {
  const [session, setSession] = useState<SessionState | null>(null);
  const [saying, setSaying] = useState<string | null>(null);
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const lastSayingId = useRef<string | null>(null);
  const lastLogId = useRef<string | null>(null);
  const wasFinished = useRef(false);
  const sayingTimeout = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!sessionId) return;
    const unsub = subscribeSession(sessionId, (s) => {
      if (!s) return;
      setSession(s);

      const latestLog = s.log[0];
      if (latestLog && latestLog.id !== lastLogId.current) {
        const isFirstSync = lastLogId.current === null;
        lastLogId.current = latestLog.id;
        if (!isFirstSync) {
          if (latestLog.kind === 'hit') playHitSound();
          if (s.streak.count >= 3) playStreakSound();
        }
      }

      if (s.saying && s.saying.id !== lastSayingId.current) {
        lastSayingId.current = s.saying.id;
        setSaying(s.saying.text);
        window.clearTimeout(sayingTimeout.current);
        sayingTimeout.current = window.setTimeout(() => setSaying(null), 3000);
      }

      if (s.status === 'finished' && !wasFinished.current) {
        wasFinished.current = true;
        const winner = s.teams.find((t) => t.id === s.winnerTeamId);
        if (winner) setWinnerName(winner.name);
      }
      if (s.status !== 'finished') {
        wasFinished.current = false;
      }
    });

    return () => unsub();
  }, [sessionId]);

  const clearWinner = () => setWinnerName(null);

  return { session, saying, winnerName, clearWinner };
}
