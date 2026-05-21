// Genera musica y efectos de sonido usando Web Audio API
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume si esta suspendido (política de autoplay)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Genera una nota musical
function playNote(ctx, freq, startTime, duration, type = 'square', volume = 0.1, destination = null) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain);
  gain.connect(destination || ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
  return osc;
}

// Notas musicales
const NOTES = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00,
};

// Melodia del menu principal - alegre y aventurera
const MENU_MELODY = [
  ['C4', 0.3], ['E4', 0.3], ['G4', 0.3], ['C5', 0.6],
  ['B4', 0.3], ['G4', 0.3], ['E4', 0.3], ['G4', 0.6],
  ['A4', 0.3], ['F4', 0.3], ['A4', 0.3], ['C5', 0.6],
  ['G4', 0.3], ['E4', 0.3], ['C4', 0.3], ['E4', 0.6],
  ['D4', 0.3], ['F4', 0.3], ['A4', 0.3], ['D5', 0.6],
  ['C5', 0.3], ['A4', 0.3], ['F4', 0.3], ['A4', 0.6],
  ['G4', 0.3], ['B4', 0.3], ['D5', 0.3], ['G4', 0.6],
  ['E4', 0.3], ['G4', 0.3], ['C5', 0.3], ['C4', 0.6],
];

// Melodia del overworld - exploratoria
const OVERWORLD_MELODY = [
  ['E4', 0.25], ['G4', 0.25], ['A4', 0.25], ['B4', 0.5],
  ['A4', 0.25], ['G4', 0.25], ['E4', 0.25], ['D4', 0.5],
  ['C4', 0.25], ['E4', 0.25], ['G4', 0.25], ['A4', 0.5],
  ['G4', 0.25], ['E4', 0.25], ['D4', 0.25], ['C4', 0.5],
  ['F4', 0.25], ['A4', 0.25], ['C5', 0.25], ['D5', 0.5],
  ['C5', 0.25], ['A4', 0.25], ['F4', 0.25], ['E4', 0.5],
  ['D4', 0.25], ['F4', 0.25], ['A4', 0.25], ['G4', 0.5],
  ['E4', 0.25], ['C4', 0.25], ['D4', 0.25], ['E4', 0.5],
];

// Melodia de batalla - intensa
const BATTLE_MELODY = [
  ['E4', 0.15], ['E4', 0.15], ['F4', 0.15], ['G4', 0.3],
  ['G4', 0.15], ['F4', 0.15], ['E4', 0.15], ['D4', 0.3],
  ['C4', 0.15], ['C4', 0.15], ['D4', 0.15], ['E4', 0.3],
  ['E4', 0.2], ['D4', 0.1], ['D4', 0.4],
  ['E4', 0.15], ['E4', 0.15], ['F4', 0.15], ['G4', 0.3],
  ['G4', 0.15], ['F4', 0.15], ['E4', 0.15], ['D4', 0.3],
  ['C4', 0.15], ['C4', 0.15], ['D4', 0.15], ['E4', 0.3],
  ['D4', 0.2], ['C4', 0.1], ['C4', 0.4],
  ['A3', 0.15], ['A3', 0.15], ['B3', 0.15], ['C4', 0.3],
  ['D4', 0.15], ['C4', 0.15], ['B3', 0.15], ['A3', 0.3],
  ['G3', 0.15], ['A3', 0.15], ['B3', 0.15], ['C4', 0.3],
  ['B3', 0.2], ['A3', 0.1], ['A3', 0.4],
];

export class MusicPlayer {
  constructor() {
    this.currentMusic = null;
    this.isPlaying = false;
    this.loopTimeout = null;
    this.gainNode = null;
    this.volume = 0.08;
  }

  playMelody(melodyData, tempo = 1) {
    this.stop();
    this.isPlaying = true;

    const ctx = getAudioContext();
    this.gainNode = ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.volume, ctx.currentTime);
    this.gainNode.connect(ctx.destination);

    const playLoop = () => {
      if (!this.isPlaying) return;

      let time = ctx.currentTime + 0.1;
      melodyData.forEach(([note, dur]) => {
        if (!NOTES[note]) return;
        playNote(ctx, NOTES[note], time, dur * tempo, 'square', this.volume * 0.7, this.gainNode);
        // Bass acompannamiento
        if (Math.random() > 0.5) {
          playNote(ctx, NOTES[note] / 2, time, dur * tempo * 0.8, 'triangle', this.volume * 0.3, this.gainNode);
        }
        time += dur * tempo;
      });

      const totalDuration = melodyData.reduce((sum, [, dur]) => sum + dur * tempo, 0);
      this.loopTimeout = setTimeout(() => playLoop(), totalDuration * 1000);
    };

    playLoop();
  }

  playMenuMusic() { this.playMelody(MENU_MELODY, 1.0); }
  playOverworldMusic() { this.playMelody(OVERWORLD_MELODY, 1.1); }
  playBattleMusic() { this.playMelody(BATTLE_MELODY, 0.7); }

  stop() {
    this.isPlaying = false;
    if (this.loopTimeout) {
      clearTimeout(this.loopTimeout);
      this.loopTimeout = null;
    }
    if (this.gainNode) {
      try {
        this.gainNode.gain.setValueAtTime(0, getAudioContext().currentTime);
      } catch (e) {}
    }
  }

  setVolume(vol) {
    this.volume = vol;
    if (this.gainNode) {
      try {
        this.gainNode.gain.setValueAtTime(vol, getAudioContext().currentTime);
      } catch (e) {}
    }
  }
}

// Efectos de sonido
export class SFXPlayer {
  constructor() {
    this.volume = 0.15;
  }

  playAttack() {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    playNote(ctx, 200, t, 0.1, 'sawtooth', this.volume);
    playNote(ctx, 400, t + 0.05, 0.1, 'square', this.volume * 0.8);
    playNote(ctx, 150, t + 0.1, 0.15, 'sawtooth', this.volume * 0.6);
  }

  playHit() {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    // Ruido de impacto
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    noise.connect(gain);
    gain.connect(ctx.destination);
    noise.start(t);
    noise.stop(t + 0.1);
  }

  playSuperEffective() {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    playNote(ctx, 600, t, 0.1, 'square', this.volume);
    playNote(ctx, 800, t + 0.1, 0.1, 'square', this.volume);
    playNote(ctx, 1000, t + 0.2, 0.2, 'square', this.volume);
  }

  playNotEffective() {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    playNote(ctx, 300, t, 0.15, 'triangle', this.volume * 0.5);
    playNote(ctx, 200, t + 0.1, 0.2, 'triangle', this.volume * 0.3);
  }

  playCapture() {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    playNote(ctx, 400, t, 0.15, 'sine', this.volume);
    playNote(ctx, 500, t + 0.15, 0.15, 'sine', this.volume);
    playNote(ctx, 600, t + 0.3, 0.15, 'sine', this.volume);
    playNote(ctx, 800, t + 0.45, 0.3, 'sine', this.volume * 1.2);
  }

  playVictory() {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    const melody = [523.25, 587.33, 659.25, 783.99, 659.25, 783.99, 1046.50];
    melody.forEach((freq, i) => {
      playNote(ctx, freq, t + i * 0.15, 0.2, 'square', this.volume);
    });
  }

  playDefeat() {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    playNote(ctx, 400, t, 0.3, 'sawtooth', this.volume * 0.5);
    playNote(ctx, 300, t + 0.3, 0.3, 'sawtooth', this.volume * 0.4);
    playNote(ctx, 200, t + 0.6, 0.5, 'sawtooth', this.volume * 0.3);
  }

  playSelect() {
    const ctx = getAudioContext();
    playNote(ctx, 600, ctx.currentTime, 0.08, 'square', this.volume * 0.5);
  }

  playLevelUp() {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      playNote(ctx, freq, t + i * 0.12, 0.2, 'sine', this.volume);
    });
  }

  playEncounter() {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    playNote(ctx, 200, t, 0.1, 'square', this.volume);
    playNote(ctx, 300, t + 0.08, 0.1, 'square', this.volume);
    playNote(ctx, 200, t + 0.16, 0.1, 'square', this.volume);
    playNote(ctx, 400, t + 0.24, 0.2, 'square', this.volume);
  }
}

// Singleton
export const musicPlayer = new MusicPlayer();
export const sfxPlayer = new SFXPlayer();
