// Programmatic 8-bit Sound Effects Synthesizer using Web Audio API

let isMuted = false;

export function toggleMuteState() {
  isMuted = !isMuted;
  localStorage.setItem('eduquest_muted', JSON.stringify(isMuted));
  return isMuted;
}

export function getMuteState() {
  const saved = localStorage.getItem('eduquest_muted');
  if (saved !== null) {
    isMuted = JSON.parse(saved);
  }
  return isMuted;
}

// Lazy-loaded AudioContext to bypass browser Autoplay policy blocks
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Synthesizes a simple sound wave.
 */
function playTone(freq, type, duration, startTimeOffset = 0, endFreq = null) {
  if (getMuteState()) return;

  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTimeOffset);

    // If an end frequency is provided, sweep the pitch (pitch slide)
    if (endFreq !== null) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + startTimeOffset + duration);
    }

    // Set envelope (attack, decay, sustain, release)
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime + startTimeOffset); // volume ceiling
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTimeOffset + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(ctx.currentTime + startTimeOffset);
    osc.stop(ctx.currentTime + startTimeOffset + duration);
  } catch (err) {
    console.warn('AudioContext failed to play tone:', err);
  }
}

// 1. Light click for UI interactions
export function playClick() {
  playTone(850, 'sine', 0.07);
}

// 2. Upbeat major C-E-G chord arpeggio for correct answers
export function playCorrect() {
  const noteDuration = 0.12;
  playTone(261.63, 'triangle', noteDuration, 0);        // C4
  playTone(329.63, 'triangle', noteDuration, 0.08);     // E4
  playTone(392.00, 'triangle', noteDuration, 0.16);     // G4
  playTone(523.25, 'sine', noteDuration * 2.5, 0.24);   // C5 (held longer)
}

// 3. Falling pitch buzz for incorrect answers
export function playIncorrect() {
  playTone(180, 'sawtooth', 0.32, 0, 75);
}

// 4. Fast arpeggiated fanfare for completing levels
export function playLevelComplete() {
  const beat = 0.1;
  playTone(392.00, 'square', beat, 0);          // G4
  playTone(523.25, 'square', beat, beat);      // C5
  playTone(659.25, 'square', beat, beat * 2);  // E5
  playTone(783.99, 'square', beat * 2.5, beat * 3); // G5
}

// 5. Ascending frequency laser sweep for level up
export function playLevelUp() {
  playTone(180, 'sine', 0.6, 0, 1200);
}
