// Web Audio API Synthesizer for Phone Ringtone, Alarms, and Pings

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

let ringtoneInterval: number | null = null;
let sirenInterval: number | null = null;

/**
 * Plays a realistic phone ringtone in a loop
 */
export function startPhoneRingtone(): void {
  stopPhoneRingtone();
  try {
    const ctx = getAudioContext();

    const playChimeNote = () => {
      const now = ctx.currentTime;
      // High-pitched marimba style ringtone
      const notes = [659.25, 880, 783.99, 659.25, 587.33, 659.25]; // E5, A5, G5, E5, D5, E5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.18);

        gain.gain.setValueAtTime(0.25, now + idx * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.18);
        osc.stop(now + idx * 0.18 + 0.3);
      });
    };

    playChimeNote();
    ringtoneInterval = window.setInterval(playChimeNote, 2400);
  } catch (err) {
    console.warn('AudioContext not allowed yet without user interaction', err);
  }
}

export function stopPhoneRingtone(): void {
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
}

/**
 * Plays a subtle low haptic/audio pulse to confirm silent SOS activation
 */
export function playSilentConfirmPing(): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);

    // Also trigger mobile vibration if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  } catch {
    // Ignore audio error if not user-triggered
  }
}

/**
 * Loud deterrence siren
 */
export function startSiren(): void {
  stopSiren();
  try {
    const ctx = getAudioContext();

    const sirenCycle = () => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(1100, now + 0.4);
      osc.frequency.linearRampToValueAtTime(600, now + 0.8);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
    };

    sirenCycle();
    sirenInterval = window.setInterval(sirenCycle, 850);
  } catch (err) {
    console.warn('AudioContext error:', err);
  }
}

export function stopSiren(): void {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
}

/**
 * Safe arrival celebratory sound
 */
export function playSafeArrivalChime(): void {
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.12);
      osc.stop(ctx.currentTime + idx * 0.12 + 0.45);
    });
  } catch {
    // Ignore
  }
}
