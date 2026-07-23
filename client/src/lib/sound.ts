let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq: number, startTime: number, duration: number, gain: number, type: OscillatorType = 'sine') {
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const gainNode = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gainNode.gain.setValueAtTime(gain, audio.currentTime + startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + startTime + duration);
  osc.connect(gainNode);
  gainNode.connect(audio.destination);
  osc.start(audio.currentTime + startTime);
  osc.stop(audio.currentTime + startTime + duration);
}

export function playHitSound() {
  tone(880, 0, 0.12, 0.15, 'triangle');
  tone(1320, 0.06, 0.1, 0.1, 'triangle');
}

export function playStreakSound() {
  [660, 880, 1100].forEach((f, i) => tone(f, i * 0.08, 0.15, 0.12, 'square'));
}

export function playWinSound() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.12, 0.3, 0.15, 'triangle'));
}

export function playClickSound() {
  tone(440, 0, 0.06, 0.08, 'sine');
}
