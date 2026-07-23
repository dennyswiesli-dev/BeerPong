import { useEffect, useRef, useState } from 'react';
import { socket } from './socket';
import type { SessionState } from '../types';

export function useSession(sessionId: string | undefined) {
  const [session, setSession] = useState<SessionState | null>(null);
  const [saying, setSaying] = useState<string | null>(null);
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const sayingTimeout = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!sessionId) return;
    socket.emit('join', { sessionId });

    const onState = (s: SessionState) => setSession(s);
    const onSaying = (text: string) => {
      setSaying(text);
      window.clearTimeout(sayingTimeout.current);
      sayingTimeout.current = window.setTimeout(() => setSaying(null), 3000);
    };
    const onGameOver = ({ winnerName }: { winnerName: string }) => setWinnerName(winnerName);

    socket.on('state', onState);
    socket.on('saying', onSaying);
    socket.on('gameOver', onGameOver);

    return () => {
      socket.off('state', onState);
      socket.off('saying', onSaying);
      socket.off('gameOver', onGameOver);
    };
  }, [sessionId]);

  const clearWinner = () => setWinnerName(null);

  return { session, saying, winnerName, clearWinner };
}
