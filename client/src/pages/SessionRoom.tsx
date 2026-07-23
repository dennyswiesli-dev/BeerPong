import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSession } from '../lib/useSession';
import Lobby from '../components/Lobby';
import GameBoard from '../components/GameBoard';
import CoinTossOverlay from '../components/CoinTossOverlay';
import WinOverlay from '../components/WinOverlay';
import SayingBanner from '../components/SayingBanner';

export default function SessionRoom() {
  const { id } = useParams<{ id: string }>();
  const { session, saying, winnerName, clearWinner } = useSession(id);
  const [showCoinToss, setShowCoinToss] = useState(false);
  const lastCoinTossId = useRef<string | null>(null);

  useEffect(() => {
    if (!session || !session.coinTossId) return;
    if (lastCoinTossId.current !== null && session.coinTossId !== lastCoinTossId.current) {
      setShowCoinToss(true);
    } else if (lastCoinTossId.current === null && session.status === 'playing') {
      // joined mid-toss/right after it happened on another device; show it too
      setShowCoinToss(true);
    }
    lastCoinTossId.current = session.coinTossId;
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <p className="text-purple-200">Lade Match...</p>
      </div>
    );
  }

  return (
    <div className="min-h-svh">
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <Link to="/" className="text-xl">🍺</Link>
        <Link to="/leaderboard" className="text-sm text-purple-300 hover:text-amber-300">
          🏆 Leaderboard
        </Link>
      </header>

      {saying && <SayingBanner text={saying} />}
      {showCoinToss && <CoinTossOverlay session={session} onDone={() => setShowCoinToss(false)} />}
      {winnerName && !showCoinToss && (
        <WinOverlay session={session} winnerName={winnerName} onClose={clearWinner} />
      )}

      {session.status === 'lobby' ? <Lobby session={session} /> : <GameBoard session={session} />}
    </div>
  );
}
