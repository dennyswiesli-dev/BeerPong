import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SessionRoom from './pages/SessionRoom';
import JoinSession from './pages/JoinSession';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/session/:id" element={<SessionRoom />} />
      <Route path="/join/:id" element={<JoinSession />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
    </Routes>
  );
}

export default App;
